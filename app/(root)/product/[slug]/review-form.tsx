'use client';

import { insertReviewSchema } from '@/lib/validators';
import { useState } from 'react';
import { StarIcon } from 'lucide-react';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  SubmitHandler,
} from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { reviewFormDefaultValues } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createUpdateReview,
  getUserReviewForProduct,
} from '@/lib/actions/review.actions';

type ReviewFormProps = {
  userId: string;
  productId: string;
  onReviewSubmitted: () => void;
};

const ReviewForm = ({
  userId,
  productId,
  onReviewSubmitted,
}: ReviewFormProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof insertReviewSchema>>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: reviewFormDefaultValues,
  });

  // Submit Form Handler
  const onSubmit: SubmitHandler<z.infer<typeof insertReviewSchema>> = async (
    values,
  ) => {
    const res = await createUpdateReview({
      ...values,
      productId: values.productId,
      userId: values.userId,
    });

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    setOpen(false);
    onReviewSubmitted();
    toast.success(res.message);
  };

  // Open Form Handler
  const handleOpenForm = async () => {
    form.setValue('productId', productId);
    form.setValue('userId', userId);

    const existingUserReview = await getUserReviewForProduct({ productId });
    if (existingUserReview.data) {
      form.setValue('title', existingUserReview.data?.title || '');
      form.setValue('description', existingUserReview.data?.description || '');
      form.setValue('rating', existingUserReview.data?.rating || 0);
    }
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={handleOpenForm} variant='default'>
        Write a Review
      </Button>
      <DialogContent className='sm:max-w-lg'>
        <form method='post' onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your thoughts with other customers
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Controller
              name='title'
              control={form.control}
              render={({
                field,
                fieldState,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof insertReviewSchema>,
                  'title'
                >;
                fieldState: ControllerFieldState;
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='title'>Title</FieldLabel>
                  <Input
                    {...field}
                    id='title'
                    aria-invalid={fieldState.invalid}
                    placeholder='Enter Review Title'
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
              name='description'
              control={form.control}
              render={({
                field,
                fieldState,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof insertReviewSchema>,
                  'description'
                >;
                fieldState: ControllerFieldState;
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='description'>Description</FieldLabel>
                  <Textarea
                    {...field}
                    id='description'
                    aria-invalid={fieldState.invalid}
                    placeholder='Enter Review Description'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='rating'
              control={form.control}
              render={({
                field,
                fieldState,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof insertReviewSchema>,
                  'rating'
                >;
                fieldState: ControllerFieldState;
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='rating'>Rating</FieldLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <SelectItem
                          key={i + 1}
                          value={Number(i + 1).toString()}
                        >
                          {i + 1}{' '}
                          {Array.from({ length: i + 1 }).map((_, j) => (
                            <StarIcon key={j} className='inline h-4 w-4' />
                          ))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type='submit'
              size='lg'
              className='w-full'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <span className='animate-pulse'>Submitting...</span>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
