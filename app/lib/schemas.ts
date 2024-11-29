// app/lib/schemas.ts
import { z } from 'zod';

export const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().positive({
    message: 'Please enter an amount greater than $0.',
  }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

// Για τη δημιουργία νέου invoice (χωρίς id και date)
export const CreateInvoiceSchema = InvoiceSchema.omit({ id: true, date: true });