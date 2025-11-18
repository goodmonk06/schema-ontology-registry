import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SchemaType } from '@prisma/client';

// GET /api/schemas?namespaceId=xxx - List schemas for a namespace
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

    const schemas = await prisma.schemaDefinition.findMany({
      where: { namespaceId },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        namespace: {
          select: {
            key: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(schemas);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schemas' },
      { status: 500 }
    );
  }
}

// POST /api/schemas - Create a new schema version
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { namespaceId, version, type, contentJson } = body;

    if (!namespaceId || !version || !type || !contentJson) {
      return NextResponse.json(
        { error: 'namespaceId, version, type, and contentJson are required' },
        { status: 400 }
      );
    }

    // Validate schema type
    if (!Object.values(SchemaType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid schema type. Must be: json_schema, openapi, or other' },
        { status: 400 }
      );
    }

    const schema = await prisma.schemaDefinition.create({
      data: {
        namespaceId,
        version,
        type,
        contentJson,
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

    return NextResponse.json(schema, { status: 201 });
  } catch (error: any) {
    console.error('Error creating schema:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A schema with this version already exists for this namespace' },
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
      { error: 'Failed to create schema' },
      { status: 500 }
    );
  }
}
