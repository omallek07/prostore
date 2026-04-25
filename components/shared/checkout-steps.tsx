import { cn } from '@/lib/utils';
import React from 'react';

const CHECKOUT_STEPS = [
  'User Login',
  'Shipping Address',
  'Payment Method',
  'Place Order',
];

type CheckoutStepsProps = {
  current: number;
};

const CheckoutSteps = ({ current = 0 }: CheckoutStepsProps) => {
  return (
    <div className='flex-between flex-col md:flex-row space-x-2 space-y-2 mb-10'>
      {CHECKOUT_STEPS.map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={cn(
              'p-2 w-56 rounded-full text-center text-small',
              index === current ? 'bg-secondary' : '',
            )}
          >
            {step}
          </div>
          {step !== CHECKOUT_STEPS[CHECKOUT_STEPS.length - 1] && (
            <hr className='w-16 border-t border-gray-300 mx-2' />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutSteps;
