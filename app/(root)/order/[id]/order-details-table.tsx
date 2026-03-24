'use client';

import { useTransition } from 'react';
import PaymentIcon from '@/components/payment-logo';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Order } from '@/types';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';

import {
  createPayPalOrder,
  approvePayPalOrder,
  updateOrderToPaidCOD,
  deliverOrder,
} from '@/lib/actions/order.actions';

type OrderDetailsTableProps = {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
};

const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
}: OrderDetailsTableProps) => {
  const {
    id,
    orderitems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    isDelivered,
    paidAt,
    deliveredAt,
  } = order;

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    let status = '';

    if (isPending) {
      status = 'Loading Paypal...';
    } else if (isRejected) {
      status = 'Error loading Paypal';
    }

    return status;
  };

  const handleCreatePaypalOrder = async () => {
    const res = await createPayPalOrder(order.id);
    if (!res.success) return toast.error(res.message);

    if ('data' in res) {
      return res.data;
    }
  };

  const handleApprovePaypalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
    }
  };

  // Button to mark order as paid
  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();

    return (
      <Button
        type='button'
        disabled={isPending}
        className='cursor-pointer'
        onClick={() =>
          startTransition(async () => {
            const { success, message } = await updateOrderToPaidCOD(order.id);

            if (!success) {
              toast.error(message);
            }

            toast.success(message);
          })
        }
      >
        {isPending ? 'Processing...' : 'Mark As Paid'}
      </Button>
    );
  };

  // Button to mark order as delivered
  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();

    return (
      <Button
        type='button'
        disabled={isPending}
        className='cursor-pointer'
        onClick={() =>
          startTransition(async () => {
            const { success, message } = await deliverOrder(order.id);

            if (!success) {
              toast.error(message);
            }

            toast.success(message);
          })
        }
      >
        {isPending ? 'Processing...' : 'Mark As Delivered'}
      </Button>
    );
  };

  return (
    <>
      <h1 className='py-4 text-2xl'>Order {formatId(id)}</h1>
      <div className='grid md:grid-cols-3 md:gap-5'>
        <div className='col-span-2 space-y-4 overflow-x-auto'>
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Payment Method</h2>
              <div className='flex gap-2 place-items-center'>
                <PaymentIcon paymentMethodType={paymentMethod} />
                {paymentMethod}
              </div>
              {isPaid ? (
                <Badge variant='secondary'>
                  Paid on {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant='destructive'>Not Paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card className='my-2'>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Shipping Address</h2>
              <div className='pb-2'>
                <p>{shippingAddress.fullName}</p>
                <p>{shippingAddress.streetAddress}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.postalCode}
                </p>
              </div>
              {isDelivered ? (
                <Badge variant='secondary'>
                  Delivered on {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant='destructive'>Not Delivered</Badge>
              )}
            </CardContent>
          </Card>

          <Card className='my-2'>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderitems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          className='flex items-center'
                          href={`/product/${item.slug}`}
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className='px-2'>{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className='px-2'>{item.qty}</span>
                      </TableCell>
                      <TableCell>
                        <span className='text-right'>
                          {formatCurrency(item.price)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className='p-4 gap-4 space-y-4'>
              <div className='flex justify-between'>
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <hr />
              <div className='flex justify-between font-semibold'>
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {/* Paypal Payment */}
              {!isPaid && paymentMethod === 'PayPal' && (
                <div>
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                    }}
                  >
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePaypalOrder}
                      onApprove={handleApprovePaypalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {/* Cash on Delivery */}
              {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                <MarkAsPaidButton />
              )}
              {isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
