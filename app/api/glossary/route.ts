import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/glossary?namespaceId=xxx - List glossary terms for a namespace
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const namespaceId = searchParams.get('namespaceId');

    if (!namespaceId) {
      return NextResponse.json(
        { error: 'namespaceId query parameter is required' },
        { status: 400 }
      );
    }

    const terms = await prisma.glossaryTerm.findMany({
      where: { namespaceId },
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
  } catch (error) {
    console.error('Error fetching glossary terms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch glossary terms' },
      { status: 500 }
    );
  }
}

// POST /api/glossary - Create a new glossary term
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { namespaceId, term, definition, aliasesJson } = body;

    if (!namespaceId || !term || !definition) {
      return NextResponse.json(
        { error: 'namespaceId, term, and definition are required' },
        { status: 400 }
      );
    }

    const glossaryTerm = await prisma.glossaryTerm.create({
      data: {
        namespaceId,
        term,
        definition,
        aliasesJson: aliasesJson || null,
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

    return NextResponse.json(glossaryTerm, { status: 201 });
  } catch (error: any) {
    console.error('Error creating glossary term:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A term with this name already exists for this namespace' },
        { status: 409 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Namespace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create glossary term' },
      { status: 500 }
    );
  }
}
