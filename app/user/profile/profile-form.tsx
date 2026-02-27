'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { updateProfileSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  SubmitHandler,
} from 'react-hook-form';
import { Loader, CircleUserRoundIcon } from 'lucide-react';
import { z } from 'zod';
import { updateUserProfile } from '@/lib/actions/user.actions';

const ProfileForm = () => {
  const { data: session, update } = useSession();

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? '',
      email: session?.user?.email ?? '',
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof updateProfileSchema>> = async (
    values,
  ) => {
    startTransition(async () => {
      const { success, message } = await updateUserProfile(values);

      if (!success) {
        toast.error(message);
        return;
      }

      const newSession = {
        ...session,
        user: {
          ...session?.user,
          name: values.name,
        },
      };

      await update(newSession);
      toast.success(message);
    });
  };

  return (
    <form
      id='profile-form'
      method='post'
      className='flex flex-col gap-5'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Controller
        name='email'
        control={form.control}
        render={({
          field,
          fieldState,
        }: {
          field: ControllerRenderProps<
            z.infer<typeof updateProfileSchema>,
            'email'
          >;
          fieldState: ControllerFieldState;
        }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='email'>Email</FieldLabel>
            <Input
              {...field}
              id='email'
              disabled={true}
              aria-invalid={fieldState.invalid}
              placeholder='Enter Full Name'
              autoComplete='off'
              type='text'
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name='name'
        control={form.control}
        render={({
          field,
          fieldState,
        }: {
          field: ControllerRenderProps<
            z.infer<typeof updateProfileSchema>,
            'name'
          >;
          fieldState: ControllerFieldState;
        }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='name'>Name</FieldLabel>
            <Input
              {...field}
              id='name'
              aria-invalid={fieldState.invalid}
              placeholder='Enter Full Name'
              autoComplete='off'
              type='text'
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className='flex mt-4'>
        <Button
          className='cursor-pointer w-full'
          type='submit'
          disabled={isPending}
        >
          {isPending ? (
            <Loader className='w-4 h-4 animate-spin' />
          ) : (
            <CircleUserRoundIcon className='w-4 h-4' />
          )}
          {isPending ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
