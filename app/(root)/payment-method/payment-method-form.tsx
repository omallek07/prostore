'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { paymentMethodSchema } from '@/lib/validators';

import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  SubmitHandler,
} from 'react-hook-form';
import {
  Field,
  FieldSet,
  FieldContent,
  FieldTitle,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, ArrowRight } from 'lucide-react';
import { Generic, Visa, Paypal } from 'react-payment-logos/dist/flat';

import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from '@/lib/constants';
import { updateUserPaymentMethod } from '@/lib/actions/user.actions';
import { cn } from '@/lib/utils';

function returnPaymentIcon(paymentMethodType: string) {
  switch (paymentMethodType) {
    case 'PayPal':
      return <Paypal />;
    case 'Stripe':
      return <Visa />;
    case 'CashOnDelivery':
      return <Generic />;
    default:
      return <Generic />;
  }
}

type PaymentMethodFormProps = {
  preferredPaymentMethod: string | null;
};

const PaymentMethodForm = ({
  preferredPaymentMethod,
}: PaymentMethodFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD,
    },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit: SubmitHandler<z.infer<typeof paymentMethodSchema>> = async (
    values
  ) => {
    startTransition(async () => {
      const { success, message } = await updateUserPaymentMethod(values);

      if (!success) {
        toast.error(message);
        return;
      }

      toast.success(message);
      router.push('/place-order');
    });
  };

  return (
    <>
      <div className='max-w-md mx-auto space-y-4'>
        <h1 className='h2-bold mt-4'>Payment Method</h1>
        <form
          id='payment-method-form'
          method='post'
          className='space-y-4'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name='type'
              control={form.control}
              render={({
                field,
                fieldState,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof paymentMethodSchema>,
                  'type'
                >;
                fieldState: ControllerFieldState;
              }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldDescription>
                    Please select a payment method
                  </FieldDescription>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  >
                    {PAYMENT_METHODS.map((paymentMethod) => (
                      <FieldLabel
                        key={paymentMethod}
                        htmlFor={`form-radiogroup-${paymentMethod}`}
                      >
                        <Field
                          orientation='horizontal'
                          data-invalid={fieldState.invalid}
                        >
                          <FieldContent>
                            <FieldTitle>
                              {returnPaymentIcon(paymentMethod)}
                              <p
                                className={cn(
                                  `${
                                    field.value === paymentMethod
                                      ? 'font-semibold'
                                      : ''
                                  }`
                                )}
                              >
                                {paymentMethod}
                              </p>
                            </FieldTitle>
                          </FieldContent>
                          <RadioGroupItem
                            value={paymentMethod}
                            id={`form-radiogroup-${paymentMethod}`}
                            aria-invalid={fieldState.invalid}
                          />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />
          </FieldGroup>
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

export default PaymentMethodForm;
