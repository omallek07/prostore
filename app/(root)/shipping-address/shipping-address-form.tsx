'use client';

import { useRouter } from 'next/navigation';

import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  SubmitHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { shippingAddressSchema } from '@/lib/validators';

import { ShippingAddress } from '@/types';
import { shippingAddressDefaultValues } from '@/lib/constants';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader } from 'lucide-react';
import { updateUserAddress } from '@/lib/actions/user.actions';

type ShippingAddressFormProps = {
  address: ShippingAddress;
};

const ShippingAddressForm = ({ address }: ShippingAddressFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  });

  const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (
    values,
  ) => {
    startTransition(async () => {
      const { success, message } = await updateUserAddress(values);

      if (!success) {
        toast.error(message);
        return;
      }

      router.push('/payment-method');
    });
  };

  return (
    <>
      <div className='max-w-md mx-auto space-y-4'>
        <h1 className='h2-bold mt-4'>Shipping Address</h1>
        <p className='text-sm text-muted-foreground'>
          Please enter an address to ship to
        </p>
        <form
          id='shipping-address-form'
          method='post'
          className='space-y-4'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Controller
            name='fullName'
            control={form.control}
            render={({
              field,
              fieldState,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                'fullName'
              >;
              fieldState: ControllerFieldState;
            }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='fullName'>Full Name</FieldLabel>
                <Input
                  {...field}
                  id='fullName'
                  aria-invalid={fieldState.invalid}
                  placeholder='Enter Full Name'
                  autoComplete='off'
                  type='text'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='streetAddress'
            control={form.control}
            render={({
              field,
              fieldState,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                'streetAddress'
              >;
              fieldState: ControllerFieldState;
            }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='streetAddress'>Street Address</FieldLabel>
                <Input
                  {...field}
                  id='streetAddress'
                  aria-invalid={fieldState.invalid}
                  placeholder='Enter Address'
                  autoComplete='off'
                  type='text'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='city'
            control={form.control}
            render={({
              field,
              fieldState,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                'city'
              >;
              fieldState: ControllerFieldState;
            }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='city'>City</FieldLabel>
                <Input
                  {...field}
                  id='city'
                  aria-invalid={fieldState.invalid}
                  placeholder='Enter City'
                  autoComplete='off'
                  type='text'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='postalCode'
            control={form.control}
            render={({
              field,
              fieldState,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                'postalCode'
              >;
              fieldState: ControllerFieldState;
            }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='postalCode'>Postal Code</FieldLabel>
                <Input
                  {...field}
                  id='postalCode'
                  aria-invalid={fieldState.invalid}
                  placeholder='Enter Postal Code'
                  autoComplete='off'
                  type='text'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='country'
            control={form.control}
            render={({
              field,
              fieldState,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                'country'
              >;
              fieldState: ControllerFieldState;
            }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='country'>Country</FieldLabel>
                <Input
                  {...field}
                  id='country'
                  aria-invalid={fieldState.invalid}
                  placeholder='Enter Country'
                  autoComplete='off'
                  type='text'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className='flex gap-2 flex-row-reverse'>
            <Button
              className='cursor-pointer'
              type='submit'
              disabled={isPending}
            >
              {isPending ? (
                <Loader className='w-4 h-4 animate-spin' />
              ) : (
                <ArrowRight className='w-4 h-4' />
              )}
              Continue
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ShippingAddressForm;
