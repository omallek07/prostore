'use client';

import { FormEvent, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { SERVER_URL } from '@/lib/constants';

type StripePaymentProps = {
  priceInCents: number;
  orderId: string;
  clientSecret: string;
};

const StripePayment = ({
  priceInCents,
  orderId,
  clientSecret,
}: StripePaymentProps) => {
  const { theme, systemTheme } = useTheme();
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
  );

  // Stripe Form Component
  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements || !email) return;

      setIsLoading(true);

      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
          },
        })
        .then(({ error }) => {
          if (
            error?.type === 'card_error' ||
            error?.type === 'validation_error'
          ) {
            setErrorMessage(
              error?.message || 'An error occurred during payment.',
            );
          } else if (error) {
            setErrorMessage('An unexpected error occurred.');
          }
        })
        .finally(() => setIsLoading(false));
    };

    return (
      <form className='space-y-4' onSubmit={handleSubmit}>
        <div className='text-xl'>Stripe Checkout</div>
        {errorMessage && <div className='text-destructive'>{errorMessage}</div>}
        <PaymentElement />
        <div>
          <LinkAuthenticationElement
            onChange={(e) => setEmail(e.value.email)}
          />
        </div>
        <Button
          className='w-full'
          size='lg'
          disabled={!stripe || !elements || isLoading}
        >
          {isLoading
            ? 'Processing...'
            : `Purchase $${(priceInCents / 100).toFixed(2)}`}
        </Button>
      </form>
    );
  };

  return (
    <Elements
      options={{
        clientSecret,
        appearance: {
          theme:
            theme === 'dark'
              ? 'night'
              : theme === 'light'
                ? 'stripe'
                : systemTheme === 'dark'
                  ? 'night'
                  : 'stripe',
        },
      }}
      stripe={stripePromise}
    >
      <StripeForm />
    </Elements>
  );
};

export default StripePayment;
