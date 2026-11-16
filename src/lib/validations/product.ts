import { z } from 'zod';

export const variantFormSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[A-Za-z0-9-_]+$/),
  attributeName: z.string().trim().min(1).max(30),
  attributeValue: z.string().trim().min(1).max(30),
  price: z.number().positive().max(100_000_000),
  initialStock: z.number().int().min(0).max(100_000).optional(),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  categoryId: z.string().min(1),
  variants: z.array(variantFormSchema).min(1),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
