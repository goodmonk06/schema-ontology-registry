import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/namespaces/[id] - Get a specific namespace
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const namespace = await prisma.schemaNamespace.findUnique({
      where: { id },
      include: {
        schemas: {
          orderBy: { createdAt: 'desc' },
        },
        glossaryTerms: {
          orderBy: { term: 'asc' },
        },
      },
    });

    if (!namespace) {
      return NextResponse.json(
        { error: 'Namespace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(namespace);
  } catch (error) {
    console.error('Error fetching namespace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch namespace' },
      { status: 500 }
    );
  }
}

// PUT /api/namespaces/[id] - Update a namespace
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const namespace = await prisma.schemaNamespace.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(namespace);
  } catch (error: any) {
    console.error('Error updating namespace:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Namespace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update namespace' },
      { status: 500 }
    );
  }
}

// DELETE /api/namespaces/[id] - Delete a namespace
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.schemaNamespace.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Namespace deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting namespace:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Namespace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete namespace' },
      { status: 500 }
    );
  }
}
