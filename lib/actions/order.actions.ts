'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { convertToPlainObject, formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { Prisma } from '../generated/prisma/client';
import { CartItem, PaymentResult } from '@/types';
import { paypal } from '@/lib/paypal';
import { revalidatePath } from 'next/cache';
import { PAGE_SIZE } from '../constants';

// Create order and create order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error('User not authenticated');

    const cart = await getMyCart();
    const userId = session?.user?.id;

    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);
    if (!user) throw new Error('User not found');

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: 'Your cart is empty',
        redirectTo: '/cart',
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: 'Your shipping address is not set',
        redirectTo: '/shipping-address',
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: 'Payment method not found',
        redirectTo: '/payment-method',
      };
    }

    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create order
      const insertedOrder = await tx.order.create({
        data: order,
      });

      // Create order items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }

      // Clear the cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Failed to create order');

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (!isRedirectError(error)) throw error;
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Get order by Id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return convertToPlainObject(data);
}

// Create new paypal order
export async function createPayPalOrder(orderId: string) {
  try {
    // Get order from database
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new Error('Order not found');

    // Create paypal order
    const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

    // Update order with paypal order id
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: paypalOrder.id,
          email_address: '',
          status: '',
          pricePaid: 0,
        },
      },
    });

    return {
      success: true,
      message: 'Item order created successfully',
      data: paypalOrder.id,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Approve paypal order and update order to paid
export async function approvePayPalOrder(
  orderId: string,
  data: {
    orderID: string;
  },
) {
  try {
    // Get order from database
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new Error('Order not found');

    // Capture payment
    const captureData = await paypal.capturePayment(data.orderID);

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== 'COMPLETED'
    ) {
      throw new Error('Error in PayPal payment');
    }

    const pricePaid =
      captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value;

    // Update order to paid
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        email_address: captureData.email_address,
        status: captureData.status,
        pricePaid,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Your order has been paid successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Update order to paid
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // Get order from database
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
    },
  });

  if (!order) throw new Error('Order not found');
  if (order.isPaid) throw new Error('Order is already paid');

  // Transaction to update order and account for product stock
  await prisma.$transaction(async (tx) => {
    // Iterate over products and update stock
    for (const item of order.orderitems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: -item.qty,
          },
        },
      });
    }

    // Set the order to paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  // Get the updated order
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!updatedOrder) throw new Error('Order not found');
}

// Get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error('User not authenticated');

  const userId = session?.user?.id;
  if (!userId) throw new Error('User not found');

  const data = await prisma.order.findMany({
    where: { userId },
    orderBy: {
      createdAt: 'desc', // Latest orders first
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.order.count({
    where: { userId },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderSummary() {
  // Get the counts for each resource
  const [ordersCount, productsCount, usersCount] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
  ]);

  // Calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
  });

  // Get monthly orders
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesDataType = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));

  // Get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc', // Latest orders first
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesData,
    latestSales,
  };
}

// Get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const data = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  const dataCount = await prisma.order.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete an order
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: {
        id,
      },
    });

    revalidatePath('/admin/orders');
    return {
      success: true,
      message: 'Order deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Update cash on delivery order to paid
export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderToPaid({
      orderId,
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order marked as paid',
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Update COD order to delivered
export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error('Order not found');
    if (!order.isPaid) throw new Error('Order is not paid');

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);
    return {
      success: true,
      message: 'Order has been marked delivered',
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
