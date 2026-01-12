import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    'Price must have exactly two decimal places'
  );

// Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  slug: z.string().min(3, 'Product slug is required'),
  category: z.string().min(3, 'Category is required'),
  brand: z.string().min(3, 'Brand is required'),
  description: z.string().min(3, 'Description is required'),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  isFeatures: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});
