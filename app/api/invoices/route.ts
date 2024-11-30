import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';
import { Status } from '@prisma/client';

export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      
      // Pagination parameters
      const pageSize = Math.min(
        parseInt(searchParams.get('pageSize') || '10', 10),
        100
      );
      const page = Math.max(
        parseInt(searchParams.get('page') || '0', 10),
        0
      );
      
      // Existing filters
      const status = searchParams.get('status') as Status | null; 
      const customerId = searchParams.get('customerId');
      const amountParam = searchParams.get('amount');
      const amount = amountParam ? parseFloat(amountParam) : null;
      
      const where = {
        ...(status && { status }),
        ...(customerId && { customer_id: customerId }),
        ...(amount && { amount })
      };
  
      // Get total count for pagination
      const totalCount = await prisma.invoice.count({ where });
  
      // Get paginated results
      const invoices = await prisma.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip: page * pageSize,
        take: pageSize,
      });
  
      return NextResponse.json({
        data: invoices,
        pagination: {
          total: totalCount,
          pageSize,
          page,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
  
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }
  }

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const invoice = await prisma.invoice.create({
      data
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}