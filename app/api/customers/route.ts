import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';
import { Prisma } from '@prisma/client';

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
      const name = searchParams.get('name');
      const email = searchParams.get('email');
      
      const where: Prisma.CustomerWhereInput = {
        ...(name && { 
          name: { 
            contains: name, 
            mode: 'insensitive' as Prisma.QueryMode 
          } 
        }),
        ...(email && { 
          email: { 
            contains: email, 
            mode: 'insensitive' as Prisma.QueryMode 
          } 
        })
      };
  
      // Get total count for pagination
      const totalCount = await prisma.customer.count({ where });
  
      // Get paginated results
      const customers = await prisma.customer.findMany({
        where,
        include: {
          invoices: {
            select: {
              id: true,
              amount: true,
              status: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        skip: page * pageSize,
        take: pageSize,
      });
  
      return NextResponse.json({
        data: customers,
        pagination: {
          total: totalCount,
          pageSize,
          page,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
  
    } catch (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }
  }

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const customer = await prisma.customer.create({
      data
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}