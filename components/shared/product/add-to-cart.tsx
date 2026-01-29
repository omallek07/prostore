'use client';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';
import { CartItem, Cart } from '@/types';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import { Plus, Minus, Loader } from 'lucide-react';

type AddToCartProps = {
  cart?: Cart;
  item: CartItem;
};

const AddToCart = ({ cart, item }: AddToCartProps) => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message, {
        action: {
          label: 'Go To Cart',
          onClick: () => router.push('/cart'),
        },
      });
    });
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message, {
        action: {
          label: 'Go To Cart',
          onClick: () => router.push('/cart'),
        },
      });
    });
  };

  // Check if item is already in cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div className='flex-center'>
      <Button
        type='button'
        variant='outline'
        className='cursor-pointer'
        onClick={handleRemoveFromCart}
      >
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Minus className='w-4 h-4 cursor-pointer' />
        )}
      </Button>
      <span className='px-2'>{existItem.qty}</span>
      <Button
        type='button'
        variant='outline'
        className='cursor-pointer'
        onClick={handleAddToCart}
      >
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Plus className='w-4 h-4 cursor-pointer' />
        )}
      </Button>
    </div>
  ) : (
    <Button
      type='button'
      className='w-full cursor-pointer'
      onClick={handleAddToCart}
    >
      {isPending ? (
        <Loader className='w-4 h-4 animate-spin' />
      ) : (
        <Plus className='w-4 h-4 cursor-pointer' />
      )}{' '}
      Add to Cart
    </Button>
  );
};

export default AddToCart;
