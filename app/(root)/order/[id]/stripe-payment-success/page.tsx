import Stripe from 'stripe';
import { Metadata } from 'next';
import { getOrderById } from '@/lib/actions/order.actions';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const metadata: Metadata = {
  title: 'Stripe Payment Success',
};

const StripeSuccessPage = async (props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_intent: string }>;
}) => {
  const { id } = await props.params;
  const { payment_intent: paymentIntentId } = await props.searchParams;

  // Fetch order
  const order = await getOrderById(id);
  if (!order) return notFound();

  // Retrieve payment intent from Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  // Check if paymentIntend is valid
  if (
    !paymentIntent ||
    paymentIntent.metadata.orderId === null ||
    paymentIntent.metadata.orderId !== order.id.toString()
  ) {
    return notFound();
  }

  // Check if payment is successful
  const isSuccess = paymentIntent.status === 'succeeded';

  if (!isSuccess) {
    return redirect(`/order/${order.id}`); // Redirect back to order page if payment not successful
  }

  return (
    <div className='max-w-4xl w-full mx-auto space-y-8'>
      <div className='flex flex-col gap-6 items-center'>
        <h1 className='h1 bold'>Thanks for your purchase</h1>
        <div>We are processing your order.</div>
        <Button asChild>
          <Link href={`/order/${order.id}`}>View Order</Link>
        </Button>
      </div>
    </div>
  );
};

export default StripeSuccessPage;
