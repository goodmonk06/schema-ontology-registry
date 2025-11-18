import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/glossary/[id] - Get a specific glossary term by ID
// OR GET /api/glossary/:namespace - Get all glossary terms for a namespace by key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First, check if this is a namespace key
    const namespace = await prisma.schemaNamespace.findUnique({
      where: { key: id },
    });

    if (namespace) {
      // Return all glossary terms for this namespace
      const terms = await prisma.glossaryTerm.findMany({
        where: { namespaceId: namespace.id },
        orderBy: { term: 'asc' },
        include: {
          namespace: {
            select: {
              key: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json(terms);
    }

    // Otherwise, treat it as a term ID
    const term = await prisma.glossaryTerm.findUnique({
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

    if (!term) {
      return NextResponse.json(
        { error: 'Glossary term not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(term);
  } catch (error) {
    console.error('Error fetching glossary term:', error);
    return NextResponse.json(
      { error: 'Failed to fetch glossary term' },
      { status: 500 }
    );
  }
}

// PUT /api/glossary/[id] - Update a glossary term
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { term, definition, aliasesJson } = body;

    const glossaryTerm = await prisma.glossaryTerm.update({
      where: { id },
      data: {
        ...(term && { term }),
        ...(definition && { definition }),
        ...(aliasesJson !== undefined && { aliasesJson }),
      },
      include: {
        namespace: {
          select: {
            key: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(glossaryTerm);
  } catch (error: any) {
    console.error('Error updating glossary term:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Glossary term not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A term with this name already exists for this namespace' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update glossary term' },
      { status: 500 }
    );
  }
}

// DELETE /api/glossary/[id] - Delete a glossary term
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.glossaryTerm.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Glossary term deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting glossary term:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Glossary term not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete glossary term' },
      { status: 500 }
    );
  }
}
