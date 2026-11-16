import { z } from "zod";
import { COLOMBIA_DEPARTMENTS } from "@/lib/colombia";

export const shippingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "fullNameMin")
    .max(100, "nameMax")
    .regex(/^[\p{L}][\p{L}\s'.-]*$/u, "nameInvalid"),
  // Colombian mobile: 10 digits starting with 3. Spaces and dashes are ignored.
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^3\d{9}$/, "phoneInvalid")),
  department: z.enum(COLOMBIA_DEPARTMENTS, {
    errorMap: () => ({ message: "required" }),
  }),
  city: z.string().trim().min(2, "required").max(80, "tooLong"),
  address: z.string().trim().min(5, "addressMin").max(200, "tooLong"),
  notes: z.string().trim().max(300, "tooLong").optional(),
});
export type ShippingFormInput = z.input<typeof shippingSchema>;
export type ShippingFormData = z.output<typeof shippingSchema>;
