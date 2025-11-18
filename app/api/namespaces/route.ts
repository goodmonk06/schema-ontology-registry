import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/namespaces - List all namespaces
export async function GET() {
  try {
    const namespaces = await prisma.schemaNamespace.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            schemas: true,
            glossaryTerms: true,
          },
        },
      },
    });

    return NextResponse.json(namespaces);
  } catch (error) {
    console.error('Error fetching namespaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch namespaces' },
      { status: 500 }
    );
  }
}

// POST /api/namespaces - Create a new namespace
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, name, description } = body;

    if (!key || !name) {
      return NextResponse.json(
        { error: 'Key and name are required' },
        { status: 400 }
      );
    }

    const namespace = await prisma.schemaNamespace.create({
      data: {
        key,
        name,
        description,
      },
    });

    return NextResponse.json(namespace, { status: 201 });
  } catch (error: any) {
    console.error('Error creating namespace:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A namespace with this key already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create namespace' },
      { status: 500 }
    );
  }
}
