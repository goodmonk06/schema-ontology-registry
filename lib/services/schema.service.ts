import { prisma } from '@/lib/prisma';
import { SchemaDefinition, SchemaStatus, SchemaType, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError, ConflictError } from '@/lib/errors';
import { eventBus } from '@/lib/events';
import { logger } from '@/lib/logger';

export interface CreateSchemaInput {
  namespaceId: string;
  version: string;
  type: SchemaType;
  contentJson: Prisma.JsonValue;
  author?: string;
  status?: SchemaStatus;
  metadata?: Prisma.JsonValue;
}

export interface UpdateSchemaInput {
  status?: SchemaStatus;
  metadata?: Prisma.JsonValue;
  isDeprecated?: boolean;
}

export class SchemaService {
  /**
   * Create a new schema definition
   */
  async createSchema(input: CreateSchemaInput): Promise<SchemaDefinition> {
    logger.info({ input }, 'Creating new schema');

    // Verify namespace exists
    const namespace = await prisma.schemaNamespace.findUnique({
      where: { id: input.namespaceId },
    });

    if (!namespace) {
      throw new NotFoundError('Namespace', input.namespaceId);
    }

    // Check if version already exists
    const existing = await prisma.schemaDefinition.findUnique({
      where: {
        namespaceId_version: {
          namespaceId: input.namespaceId,
          version: input.version,
        },
      },
    });

    if (existing) {
      throw new ConflictError(
        `Schema version ${input.version} already exists for this namespace`
      );
    }

    // Validate semantic versioning format
    if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/.test(input.version)) {
      throw new ValidationError(
        'Version must follow semantic versioning (e.g., 1.0.0 or 1.0.0-beta.1)'
      );
    }

    // Create the schema
    const schema = await prisma.schemaDefinition.create({
      data: {
        namespaceId: input.namespaceId,
        version: input.version,
        type: input.type,
        contentJson: input.contentJson,
        author: input.author,
        status: input.status || SchemaStatus.draft,
        metadata: input.metadata,
      },
      include: {
        namespace: true,
      },
    });

    // Create change log
    await prisma.changeLog.create({
      data: {
        entityType: 'SchemaDefinition',
        entityId: schema.id,
        action: 'created',
        performedBy: input.author,
        changes: {
          version: input.version,
          type: input.type,
          status: schema.status,
        },
      },
    });

    // Emit event
    eventBus.emit('schema.created', {
      schemaId: schema.id,
      namespaceKey: namespace.key,
      version: schema.version,
      type: schema.type,
      author: input.author,
    });

    logger.info({ schemaId: schema.id }, 'Schema created successfully');

    return schema;
  }

  /**
   * Get schema by ID
   */
  async getSchemaById(id: string): Promise<SchemaDefinition> {
    const schema = await prisma.schemaDefinition.findUnique({
      where: { id },
      include: {
        namespace: true,
        tags: true,
        validations: {
          orderBy: { validatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!schema) {
      throw new NotFoundError('Schema', id);
    }

    return schema;
  }

  /**
   * Get schema by namespace key and version
   */
  async getSchemaByVersion(
    namespaceKey: string,
    version: string
  ): Promise<SchemaDefinition | null> {
    const namespace = await prisma.schemaNamespace.findUnique({
      where: { key: namespaceKey },
    });

    if (!namespace) {
      return null;
    }

    return prisma.schemaDefinition.findUnique({
      where: {
        namespaceId_version: {
          namespaceId: namespace.id,
          version,
        },
      },
      include: {
        namespace: true,
        tags: true,
      },
    });
  }

  /**
   * List schemas for a namespace
   */
  async listSchemas(
    namespaceId: string,
    options?: {
      status?: SchemaStatus;
      includeDeprecated?: boolean;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: Prisma.SchemaDefinitionWhereInput = {
      namespaceId,
      ...(options?.status && { status: options.status }),
      ...(options?.includeDeprecated === false && { isDeprecated: false }),
    };

    const [schemas, total] = await Promise.all([
      prisma.schemaDefinition.findMany({
        where,
        include: {
          namespace: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.schemaDefinition.count({ where }),
    ]);

    return { schemas, total };
  }

  /**
   * Update schema
   */
  async updateSchema(id: string, input: UpdateSchemaInput, performedBy?: string) {
    const existing = await this.getSchemaById(id);

    const updated = await prisma.schemaDefinition.update({
      where: { id },
      data: {
        ...(input.status !== undefined && { status: input.status }),
        ...(input.metadata !== undefined && { metadata: input.metadata }),
        ...(input.isDeprecated !== undefined && {
          isDeprecated: input.isDeprecated,
          deprecatedAt: input.isDeprecated ? new Date() : null,
        }),
      },
      include: {
        namespace: true,
      },
    });

    // Log changes
    await prisma.changeLog.create({
      data: {
        entityType: 'SchemaDefinition',
        entityId: id,
        action: 'updated',
        performedBy,
        changes: {
          from: {
            status: existing.status,
            isDeprecated: existing.isDeprecated,
          },
          to: {
            status: updated.status,
            isDeprecated: updated.isDeprecated,
          },
        },
      },
    });

    // Emit events
    if (input.status === SchemaStatus.published && existing.status !== SchemaStatus.published) {
      eventBus.emit('schema.published', {
        schemaId: updated.id,
        namespaceKey: updated.namespace.key,
        version: updated.version,
      });
    }

    if (input.isDeprecated && !existing.isDeprecated) {
      eventBus.emit('schema.deprecated', {
        schemaId: updated.id,
        namespaceKey: updated.namespace.key,
        version: updated.version,
      });
    }

    return updated;
  }

  /**
   * Delete schema
   */
  async deleteSchema(id: string, performedBy?: string) {
    const schema = await this.getSchemaById(id);

    await prisma.schemaDefinition.delete({
      where: { id },
    });

    await prisma.changeLog.create({
      data: {
        entityType: 'SchemaDefinition',
        entityId: id,
        action: 'deleted',
        performedBy,
        metadata: {
          version: schema.version,
          namespaceId: schema.namespaceId,
        },
      },
    });

    eventBus.emit('schema.deleted', {
      schemaId: id,
      namespaceKey: schema.namespace.key,
      version: schema.version,
    });
  }

  /**
   * Compare two schema versions
   */
  async compareVersions(namespaceKey: string, versionA: string, versionB: string) {
    const [schemaA, schemaB] = await Promise.all([
      this.getSchemaByVersion(namespaceKey, versionA),
      this.getSchemaByVersion(namespaceKey, versionB),
    ]);

    if (!schemaA || !schemaB) {
      throw new NotFoundError('Schema version not found');
    }

    return {
      schemaA,
      schemaB,
      contentA: JSON.stringify(schemaA.contentJson, null, 2),
      contentB: JSON.stringify(schemaB.contentJson, null, 2),
    };
  }
}

export const schemaService = new SchemaService();
