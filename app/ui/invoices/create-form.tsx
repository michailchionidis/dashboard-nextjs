'use client';

import { type Customer } from '@prisma/client';

import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { createInvoice, State } from '@/app/lib/actions';
import { useState } from 'react';
import { CreateInvoiceSchema } from '@/app/lib/schemas';
import { z } from 'zod';
import { Status } from '@prisma/client';

export default function Form({ customers }: { customers: Pick<Customer, 'id' | 'name'>[] }) {
  // State for the form (server side validation)
  const initialState = {
    message: '',
    errors: {},
  };
  const [state, formAction] = useActionState(createInvoice, initialState);  

  // State for the form (client side validation)
  const [clientErrors, setClientErrors] = useState<State['errors']>({});
  const [formValues, setFormValues] = useState({
    customerId: '',
    amount: '',
    status: '',
  });

  // Ορισμός των τύπων για τα πεδία της φόρμας
  type FormField = {
    customerId: string;
    amount: string;
    status: Status | ''; // Χρησιμοποιούμε το Status enum
  }
  type FieldName = keyof FormField;
  

  const validateField = (name: FieldName, value: string) => {
    try {
      if (name === 'customerId') {
        CreateInvoiceSchema.shape.customerId.parse(value);
      } else if (name === 'amount') {
        CreateInvoiceSchema.shape.amount.parse(Number(value));
      } else if (name === 'status') {
        CreateInvoiceSchema.shape.status.parse(value);
      }

      setClientErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setClientErrors(prev => ({
          ...prev,
          [name]: error.errors.map(e => e.message),
        }));
      }
    }
  };

    const isFormValid = () => {
      // Έλεγχος για client errors
      const hasErrors = Object.keys(clientErrors || {}).length > 0;
      
      // Έλεγχος αν όλα τα πεδία έχουν τιμή
      const hasEmptyFields = !formValues.customerId || 
                            !formValues.amount || 
                            !formValues.status;
      
      console.log('Form values:', formValues);  // Debug log
      console.log('Has errors:', hasErrors);    // Debug log
      console.log('Has empty fields:', hasEmptyFields);  // Debug log
      
      return !hasErrors && !hasEmptyFields;
    };
    

  return (
    <form action={async (formData) => {
      const validationResult = CreateInvoiceSchema.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });

      if (!validationResult.success) {
        setClientErrors(validationResult.error.flatten().fieldErrors);
        return;
      }

      await formAction(formData);
    }}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            <select
              id="customer"
              name="customerId"
              value={formValues.customerId}
              onChange={(e) => {
                const value = e.target.value;
                setFormValues(prev => ({ ...prev, customerId: value }));
                validateField('customerId', value);
              }}
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="customer-error"
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {(clientErrors?.customerId || state.errors?.customerId) &&
              (clientErrors?.customerId || state.errors?.customerId)?.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
            ))}
          </div>  
        </div>

        {/* Invoice Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                value={formValues.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormValues(prev => ({ ...prev, amount: value }));
                  validateField('amount', value);
                }}
                step="0.01"
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="amount-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="amount-error" aria-live="polite" aria-atomic="true">
            {(clientErrors?.amount || state.errors?.amount) &&
              (clientErrors?.amount || state.errors?.amount)?.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
            ))}
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value={Status.pending}
                  checked={formValues.status === 'pending'}
                  onChange={(e) => {
                    setFormValues(prev => ({ ...prev, status: e.target.value }));
                    validateField('status', e.target.value);
                  }}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby="pending-error"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value={Status.paid}
                  checked={formValues.status === 'paid'}  // Προσθήκη checked
                  onChange={(e) => {
                    setFormValues(prev => ({ ...prev, status: e.target.value }));
                    validateField('status', e.target.value);
                  }}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {(clientErrors?.status || state.errors?.status) &&
              (clientErrors?.status || state.errors?.status)?.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <div className="relative">
          <Button 
            type="submit" 
            disabled={!isFormValid()}
            aria-describedby="submit-error"
          >
            Create Invoice
          </Button>
          {!isFormValid() && (
            <div
              id="submit-error"
              className="absolute bottom-full mb-2 text-sm text-red-500"
            >
              {Object.keys(clientErrors || {}).length > 0 
                ? 'Please fix the errors before submitting'
                : 'Please fill in all fields'}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
