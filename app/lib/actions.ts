'use server';

import { db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { InvoiceSchema } from './schemas';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };

export async function createInvoice(prevState: State, formData: FormData) {
    let client;
    try {
        const validatedFields = CreateInvoice.safeParse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });

        console.log(validatedFields);
        
        // If there are errors, return them and the previous state  
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing Fields. Failed to Create Invoice.',
            };
        }
 
        const { customerId, amount, status } = validatedFields.data;
        const amountInCents = amount * 100;
        const date = new Date().toISOString().split('T')[0];

        client = await db.connect();
        await client.sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;

        // Καθαρίζουμε το cache
        revalidatePath('/dashboard/invoices');
        
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Create Invoice. \n Error message: ${error}',
        };
    } finally {
        if (client) client.release();
    }

    // Ανακατευθύνουμε τον χρήστη μόνο αν η λειτουργία ολοκληρωθεί επιτυχώς
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    let client;
    try {

        const validatedFields = UpdateInvoice.safeParse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        }); 

        // If there are errors, return them and the previous state  
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing Fields. Failed to Update Invoice.',
            };
        }

        client = await db.connect();
        const { customerId, amount, status } = validatedFields.data;
        const amountInCents = amount * 100;
    
        await client.sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;

        revalidatePath('/dashboard/invoices');
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Update Invoice. \n Error message: ${error}',
        };
    } finally {
        if (client) client.release();
    }
    redirect('/dashboard/invoices');

}

export async function deleteInvoice(id: string) {
    let client;
    try {
        client = await db.connect();
        await client.sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Delete Invoice. \n Error message: ${error}',
        };
    } finally {
        if (client) client.release();
    }
}


export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
  }