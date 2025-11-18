import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/schemas/[id] - Get a specific schema
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const schema = await prisma.schemaDefinition.findUnique({
      where: { id },
      include: {
        namespace: {
          select: {
            key: true,
            name: true,
          },
        },
      },
    });

    if (!schema) {
      return NextResponse.json(
        { error: 'Schema not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error fetching schema:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schema' },
      { status: 500 }
    );
  }
}

// DELETE /api/schemas/[id] - Delete a schema
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.schemaDefinition.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Schema deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting schema:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Schema not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete schema' },
      { status: 500 }
    );
  }
}
