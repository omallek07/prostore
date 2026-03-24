'use client';

import { updateUserSchema } from '@/lib/validators';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  SubmitHandler,
} from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { USER_ROLES } from '@/lib/constants';
import { updateUser } from '@/lib/actions/user.actions';

type UpdateUserFormProps = {
  user: z.infer<typeof updateUserSchema>;
};

const UpdateUserForm = ({ user }: UpdateUserFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user,
  });

  const onSubmit: SubmitHandler<z.infer<typeof updateUserSchema>> = async (
    values,
  ) => {
    const { success, message } = await updateUser({
      ...values,
      id: user.id,
    });
    if (!success) {
      toast.error(message);
      return;
    }
    toast.success(message);
    router.push('/admin/users');
  };

  return (
    <form
      id='update-user-form'
      method='post'
      className='space-y-4'
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
            z.infer<typeof updateUserSchema>,
            'email'
          >;
          fieldState: ControllerFieldState;
        }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='email'>Email</FieldLabel>
            <Input
              {...field}
              id='email'
              aria-invalid={fieldState.invalid}
              placeholder='Enter Email'
              autoComplete='off'
              type='email'
              disabled
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
            z.infer<typeof updateUserSchema>,
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
              placeholder='Enter user name'
              autoComplete='off'
              type='text'
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name='role'
        control={form.control}
        render={({
          field,
          fieldState,
        }: {
          field: ControllerRenderProps<
            z.infer<typeof updateUserSchema>,
            'role'
          >;
          fieldState: ControllerFieldState;
        }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='role'>Role</FieldLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a role' />
              </SelectTrigger>

              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className='flex mt-8 gap-2 flex-row-reverse'>
        <Button
          className='cursor-pointer'
          type='submit'
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Submitting...' : 'Update User'}
        </Button>
      </div>
    </form>
  );
};

export default UpdateUserForm;
