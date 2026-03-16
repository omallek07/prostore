'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { productDefaultValues } from '@/lib/constants';
import { insertProductSchema, updateProductSchema } from '@/lib/validators';
import { Product } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  SubmitHandler,
} from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { createProduct, updateProduct } from '@/lib/actions/product.actions';
import { UploadButton } from '@/lib/uploadthing';

import slugify from 'slugify';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Checkbox } from '../ui/checkbox';

type ProductFormProps = {
  type: 'create' | 'update';
  product?: Product;
  productId?: string;
};

const ProductForm = ({ type, product, productId }: ProductFormProps) => {
  const router = useRouter();

  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (
    values,
  ) => {
    const { success, message } = await (type === 'update'
      ? updateProduct({
          ...values,
          id: productId || '',
        })
      : createProduct(values));

    if (!success) {
      toast.error(message);
      return;
    }

    toast.success(message);
    router.push('/admin/products');
  };

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver:
      type === 'update'
        ? zodResolver(updateProductSchema)
        : zodResolver(insertProductSchema),
    defaultValues:
      product && type === 'update' ? product : productDefaultValues,
  });

  const images = form.watch('images');
  const isFeatured = form.watch('isFeatured');
  const banner = form.watch('banner');

  return (
    <form
      id='payment-method-form'
      method='post'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className='flex flex-col md:flex-row gap-5 mb-3'>
        <Controller
          name='name'
          control={form.control}
          render={({
            field,
            fieldState,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
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
                placeholder='Enter Product Name'
                autoComplete='off'
                type='text'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name='slug'
          control={form.control}
          render={({
            field,
            fieldState,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              'slug'
            >;
            fieldState: ControllerFieldState;
          }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='slug'>Enter slug</FieldLabel>
              <Input
                {...field}
                id='slug'
                aria-invalid={fieldState.invalid}
                placeholder='Enter slug'
                autoComplete='off'
                type='text'
              />
              <div>
                <Button
                  type='button'
                  className='bg-gray-500 hover:bg-gray-500 text-white px-4 py-4 cursor-pointer'
                  onClick={() =>
                    form.setValue(
                      'slug',
                      slugify(form.getValues('name'), { lower: true }),
                    )
                  }
                >
                  Generate
                </Button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className='flex flex-col md:flex-row gap-5 mb-3'>
        <Controller
          name='category'
          control={form.control}
          render={({
            field,
            fieldState,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              'category'
            >;
            fieldState: ControllerFieldState;
          }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='category'>Category</FieldLabel>
              <Input
                {...field}
                id='category'
                aria-invalid={fieldState.invalid}
                placeholder='Enter Category'
                autoComplete='off'
                type='text'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name='brand'
          control={form.control}
          render={({
            field,
            fieldState,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              'brand'
            >;
            fieldState: ControllerFieldState;
          }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='brand'>Brand</FieldLabel>
              <Input
                {...field}
                id='brand'
                aria-invalid={fieldState.invalid}
                placeholder='Enter Brand'
                autoComplete='off'
                type='text'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className='flex flex-col md:flex-row gap-5 mb-3'>
        <Controller
          name='price'
          control={form.control}
          render={({
            field,
            fieldState,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              'price'
            >;
            fieldState: ControllerFieldState;
          }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='price'>Price</FieldLabel>
              <Input
                {...field}
                id='price'
                aria-invalid={fieldState.invalid}
                placeholder='Enter Product Price'
                autoComplete='off'
                type='text'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name='stock'
          control={form.control}
          render={({
            field,
            fieldState,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              'stock'
            >;
            fieldState: ControllerFieldState;
          }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='stock'>Stock</FieldLabel>
              <Input
                {...field}
                id='stock'
                aria-invalid={fieldState.invalid}
                placeholder='Enter Product Stock'
                autoComplete='off'
                type='text'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className='flex flex-col md:flex-row gap-5 mb-3 upload-field'>
        <Controller
          name='images'
          control={form.control}
          render={({
            fieldState,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              'images'
            >;
            fieldState: ControllerFieldState;
          }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='images'>Images</FieldLabel>
              <Card>
                <CardContent className='space-y-2 mt-2 min-h-48'>
                  <div className='flex-start space-x-2'>
                    {images.map((image: string) => (
                      <Image
                        key={image}
                        src={image}
                        alt='Product image'
                        className='w-20 h-20 object-cover object-center rounded-sm'
                        width={100}
                        height={100}
                      />
                    ))}
                    <UploadButton
                      endpoint='imageUploader'
                      onClientUploadComplete={(
                        res: {
                          url: string;
                        }[],
                      ) => {
                        form.setValue('images', [...images, res[0].url]);
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`ERROR: ${error}`);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className='flex flex-col gap-5 mb-3 upload-field'>
        <FieldLabel>Featured Product</FieldLabel>
        <Controller
          name='isFeatured'
          control={form.control}
          render={({
            field,
            fieldState,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              'isFeatured'
            >;
            fieldState: ControllerFieldState;
          }) => (
            <Card>
              <CardContent className='space-y-2'>
                <Field
                  orientation='horizontal'
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldLabel htmlFor='isFeatured'>Is Featured?</FieldLabel>
                </Field>
                {isFeatured && banner && (
                  <Image
                    src={banner}
                    alt='banner image'
                    className='w-full object-cover object-center rounded-sm'
                    width={1920}
                    height={680}
                  />
                )}

                {isFeatured && !banner && (
                  <UploadButton
                    endpoint='imageUploader'
                    onClientUploadComplete={(
                      res: {
                        url: string;
                      }[],
                    ) => {
                      form.setValue('banner', res[0].url);
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`ERROR: ${error}`);
                    }}
                  />
                )}
              </CardContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Card>
          )}
        />
      </div>
      <div className='flex flex-col md:flex-row gap-5 mb-3'>
        <Controller
          name='description'
          control={form.control}
          render={({
            field,
            fieldState,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
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
                placeholder='Enter Product Description'
                autoComplete='off'
                className='resize-none'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className='mt-8'>
        <Button
          className='cursor-pointer col-span-2 w-full'
          type='submit'
          size='lg'
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? 'Submitting'
            : `${type === 'update' ? 'Update' : 'Create'} Product`}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
