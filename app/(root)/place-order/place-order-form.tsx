'use client';

import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/lib/actions/order.actions';
import { toast } from 'sonner';
import { Check, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PlaceOrderForm = () => {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await createOrder();
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }

    if ('redirectTo' in response && response.redirectTo) {
      router.push(response.redirectTo);
    }
  };

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button
        type='submit'
        disabled={pending}
        className='w-full flex items-center justify-center cursor-pointer'
      >
        {pending ? (
          <>
            <Loader className='mr-2 h-4 w-4 animate-spin' />
            Placing Order...
          </>
        ) : (
          <>
            <Check className='mr-2 h-4 w-4' />
            Place Order
          </>
        )}
      </Button>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <PlaceOrderButton />
    </form>
  );
};

export default PlaceOrderForm;
