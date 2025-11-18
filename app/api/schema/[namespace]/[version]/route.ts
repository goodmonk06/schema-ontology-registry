import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/schema/:namespace/:version - Retrieve a specific schema by namespace key and version
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ namespace: string; version: string }> }
) {
  try {
    const { namespace: namespaceKey, version } = await params;

    // First find the namespace by its key
    const namespace = await prisma.schemaNamespace.findUnique({
      where: { key: namespaceKey },
    });

    if (!namespace) {
      return NextResponse.json(
        { error: 'Namespace not found' },
        { status: 404 }
      );
    }

    // Find the schema for this namespace and version
    const schema = await prisma.schemaDefinition.findUnique({
      where: {
        namespaceId_version: {
          namespaceId: namespace.id,
          version,
        },
      },
      include: {
        namespace: {
          select: {
            key: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!schema) {
      return NextResponse.json(
        { error: 'Schema not found for this namespace and version' },
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
