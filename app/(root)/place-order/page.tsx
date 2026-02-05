import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import CheckoutSteps from '@/components/shared/checkout-steps';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { ShippingAddress } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

import PaymentIcon from '@/components/payment-logo';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Place Order',
};

const PlaceOrderPage = async () => {
  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('User not found');

  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');

  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }
  if (!user.address) {
    redirect('/shipping-address');
  }
  if (!user.paymentMethod) {
    redirect('/payment-method');
  }

  const userAddress = user.address as ShippingAddress;

  return (
    <>
      <CheckoutSteps current={3} />
      <h1 className='py-4 text-2xl'>Place Order</h1>
      <div className='grid md: grid-cols-3 md:gap-5'>
        <div className='md:col-span-2 overflow-x-auto space-y-4'>
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Shipping Address</h2>
              <p>{userAddress.fullName}</p>
              <p>
                {userAddress.streetAddress}, {userAddress.city}{' '}
                {userAddress.postalCode}, {userAddress.country}{' '}
              </p>
              <div className='mt-3'>
                <Link href='/shipping-address'>
                  <Button variant='outline'>Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Payment Method</h2>
              <div className='flex gap-2 place-items-center'>
                <div>
                  <PaymentIcon paymentMethodType={user.paymentMethod} />
                </div>
                <div>
                  <p>{user.paymentMethod}</p>
                </div>
              </div>
              <div className='mt-3'>
                <Link href='/payment-method'>
                  <Button variant='outline'>Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
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
                  {cart.items.map((item) => (
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
                <div>{formatCurrency(cart.itemsPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Tax</div>
                <div>{formatCurrency(cart.taxPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Shipping</div>
                <div>{formatCurrency(cart.shippingPrice)}</div>
              </div>
              <hr />
              <div className='flex justify-between font-semibold'>
                <div>Total</div>
                <div>{formatCurrency(cart.totalPrice)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderPage;
