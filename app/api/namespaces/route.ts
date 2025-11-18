import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNamespaceSchema } from '@/lib/validation/schemas';
import { handleError, withErrorHandler } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { eventBus } from '@/lib/events';

// GET /api/namespaces - List all namespaces
export const GET = withErrorHandler(async () => {
  logger.info('Fetching all namespaces');

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
});

// POST /api/namespaces - Create a new namespace
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  // Validate input
  const validatedData = createNamespaceSchema.parse(body);

  logger.info({ key: validatedData.key }, 'Creating new namespace');

  const namespace = await prisma.schemaNamespace.create({
    data: validatedData,
  });

  // Emit event
  eventBus.emit('namespace.created', {
    namespaceId: namespace.id,
    key: namespace.key,
    name: namespace.name,
  });

  logger.info({ namespaceId: namespace.id }, 'Namespace created successfully');

  return NextResponse.json(namespace, { status: 201 });
});
