import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchemaService } from '@/lib/services/schema.service';
import { SchemaType, SchemaStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    schemaNamespace: {
      findUnique: vi.fn(),
    },
    schemaDefinition: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    changeLog: {
      create: vi.fn(),
    },
  },
}));

// Mock event bus
vi.mock('@/lib/events', () => ({
  eventBus: {
    emit: vi.fn(),
  },
}));

describe('SchemaService', () => {
  let service: SchemaService;

  beforeEach(() => {
    service = new SchemaService();
    vi.clearAllMocks();
  });

  describe('createSchema', () => {
    it('should create a new schema successfully', async () => {
      const mockNamespace = {
        id: 'ns1',
        key: 'events',
        name: 'Events',
      };

      const mockSchema = {
        id: 'schema1',
        namespaceId: 'ns1',
        version: '1.0.0',
        type: SchemaType.json_schema,
        status: SchemaStatus.draft,
        contentJson: { type: 'object' },
        author: 'test@example.com',
        namespace: mockNamespace,
      };

      vi.mocked(prisma.schemaNamespace.findUnique).mockResolvedValue(mockNamespace as any);
      vi.mocked(prisma.schemaDefinition.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.schemaDefinition.create).mockResolvedValue(mockSchema as any);
      vi.mocked(prisma.changeLog.create).mockResolvedValue({} as any);

      const result = await service.createSchema({
        namespaceId: 'ns1',
        version: '1.0.0',
        type: SchemaType.json_schema,
        contentJson: { type: 'object' },
        author: 'test@example.com',
      });

      expect(result).toEqual(mockSchema);
      expect(prisma.schemaDefinition.create).toHaveBeenCalled();
      expect(prisma.changeLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundError if namespace does not exist', async () => {
      vi.mocked(prisma.schemaNamespace.findUnique).mockResolvedValue(null);

      await expect(
        service.createSchema({
          namespaceId: 'invalid',
          version: '1.0.0',
          type: SchemaType.json_schema,
          contentJson: {},
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if version already exists', async () => {
      const mockNamespace = { id: 'ns1', key: 'events', name: 'Events' };
      const existingSchema = { id: 'schema1', version: '1.0.0' };

      vi.mocked(prisma.schemaNamespace.findUnique).mockResolvedValue(mockNamespace as any);
      vi.mocked(prisma.schemaDefinition.findUnique).mockResolvedValue(existingSchema as any);

      await expect(
        service.createSchema({
          namespaceId: 'ns1',
          version: '1.0.0',
          type: SchemaType.json_schema,
          contentJson: {},
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ValidationError for invalid semantic version', async () => {
      const mockNamespace = { id: 'ns1', key: 'events', name: 'Events' };

      vi.mocked(prisma.schemaNamespace.findUnique).mockResolvedValue(mockNamespace as any);
      vi.mocked(prisma.schemaDefinition.findUnique).mockResolvedValue(null);

      await expect(
        service.createSchema({
          namespaceId: 'ns1',
          version: 'invalid-version',
          type: SchemaType.json_schema,
          contentJson: {},
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getSchemaById', () => {
    it('should return schema when found', async () => {
      const mockSchema = {
        id: 'schema1',
        version: '1.0.0',
        namespace: { key: 'events' },
        tags: [],
        validations: [],
      };

      vi.mocked(prisma.schemaDefinition.findUnique).mockResolvedValue(mockSchema as any);

      const result = await service.getSchemaById('schema1');

      expect(result).toEqual(mockSchema);
    });

    it('should throw NotFoundError when schema not found', async () => {
      vi.mocked(prisma.schemaDefinition.findUnique).mockResolvedValue(null);

      await expect(service.getSchemaById('invalid')).rejects.toThrow(NotFoundError);
    });
  });

  describe('listSchemas', () => {
    it('should return paginated list of schemas', async () => {
      const mockSchemas = [
        { id: 'schema1', version: '1.0.0' },
        { id: 'schema2', version: '2.0.0' },
      ];

      vi.mocked(prisma.schemaDefinition.findMany).mockResolvedValue(mockSchemas as any);
      vi.mocked(prisma.schemaDefinition.count).mockResolvedValue(2);

      const result = await service.listSchemas('ns1');

      expect(result.schemas).toEqual(mockSchemas);
      expect(result.total).toBe(2);
    });

    it('should filter by status when provided', async () => {
      vi.mocked(prisma.schemaDefinition.findMany).mockResolvedValue([]);
      vi.mocked(prisma.schemaDefinition.count).mockResolvedValue(0);

      await service.listSchemas('ns1', { status: SchemaStatus.published });

      expect(prisma.schemaDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: SchemaStatus.published,
          }),
        })
      );
    });
  });
});
