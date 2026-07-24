import { z } from 'zod';

export const variantFormSchema = z.object({
  sku: z.string().min(1),
  attributeName: z.string().min(1),
  attributeValue: z.string().min(1),
  price: z.number().min(0),
  initialStock: z.number().min(0).optional(),
});

export const productFormSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  variants: z.array(variantFormSchema).min(1),
});

export type ProductFormData = z.infer<typeof productFormSchema>;