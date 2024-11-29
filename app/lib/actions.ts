'use server';

import { db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { InvoiceSchema } from './schemas';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { Status } from '@prisma/client';
import { prisma } from '@/prisma/prisma'
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
    try {
        const validatedFields = CreateInvoice.safeParse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });
 
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing Fields. Failed to Create Invoice.',
            };
        }
 
        const { customerId, amount, status } = validatedFields.data;
        const amountInCents = amount * 100;
        
        // Δημιουργούμε πλήρη ISO datetime string
        const date = new Date().toISOString();

        await prisma.invoice.create({
            data: {
                customer_id: customerId,
                amount: amountInCents,
                status: status as Status,
                date: new Date(date), // Μετατρέπουμε το string σε Date object
            },
        });

        revalidatePath('/dashboard/invoices');
        
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: `Database Error: Failed to Create Invoice. Error message: ${error}`,
        };
    } 
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
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

        const { customerId, amount, status } = validatedFields.data;
        const amountInCents = amount * 100;
    
        await prisma.invoice.update({
            where: { id },
            data: {
              customer_id: customerId,
              amount: amountInCents,
              status: status as Status,
            },
        });

        revalidatePath('/dashboard/invoices');
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Update Invoice. \n Error message: ${error}',
        };
    } 
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    try {
        await prisma.invoice.delete({
            where: { id },
        });
        revalidatePath('/dashboard/invoices');
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Delete Invoice. \n Error message: ${error}',
        };
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