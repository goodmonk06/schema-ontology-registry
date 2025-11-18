import { describe, it, expect } from 'vitest';
import {
  createNamespaceSchema,
  createSchemaSchema,
  createGlossaryTermSchema,
} from '@/lib/validation/schemas';
import { SchemaType } from '@prisma/client';

describe('Validation Schemas', () => {
  describe('createNamespaceSchema', () => {
    it('should validate correct namespace data', () => {
      const validData = {
        key: 'my-namespace',
        name: 'My Namespace',
        description: 'A test namespace',
      };

      const result = createNamespaceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid keys', () => {
      const invalidData = {
        key: 'My Namespace!', // uppercase and special chars not allowed
        name: 'My Namespace',
      };

      const result = createNamespaceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('lowercase');
      }
    });

    it('should reject short keys', () => {
      const invalidData = {
        key: 'a', // too short
        name: 'My Namespace',
      };

      const result = createNamespaceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require name', () => {
      const invalidData = {
        key: 'my-namespace',
      };

      const result = createNamespaceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createSchemaSchema', () => {
    it('should validate correct schema data', () => {
      const validData = {
        namespaceId: 'clxxxxxxxxxxxxxxxxxx',
        version: '1.0.0',
        type: SchemaType.json_schema,
        contentJson: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
        },
      };

      const result = createSchemaSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate semantic versioning', () => {
      const validVersions = ['1.0.0', '2.1.3', '10.20.30', '1.0.0-beta.1', '2.0.0-rc.1'];

      validVersions.forEach((version) => {
        const result = createSchemaSchema.safeParse({
          namespaceId: 'clxxxxxxxxxxxxxxxxxx',
          version,
          type: SchemaType.json_schema,
          contentJson: {},
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid semantic versions', () => {
      const invalidVersions = ['1.0', 'v1.0.0', '1', 'latest', '1.0.0.0'];

      invalidVersions.forEach((version) => {
        const result = createSchemaSchema.safeParse({
          namespaceId: 'clxxxxxxxxxxxxxxxxxx',
          version,
          type: SchemaType.json_schema,
          contentJson: {},
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('createGlossaryTermSchema', () => {
    it('should validate correct glossary term data', () => {
      const validData = {
        namespaceId: 'clxxxxxxxxxxxxxxxxxx',
        term: 'Event',
        definition: 'A significant occurrence in the system that is recorded.',
        aliasesJson: ['Domain Event', 'System Event'],
      };

      const result = createGlossaryTermSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require minimum definition length', () => {
      const invalidData = {
        namespaceId: 'clxxxxxxxxxxxxxxxxxx',
        term: 'Event',
        definition: 'Short', // too short
      };

      const result = createGlossaryTermSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept null aliases', () => {
      const validData = {
        namespaceId: 'clxxxxxxxxxxxxxxxxxx',
        term: 'Event',
        definition: 'A significant occurrence in the system.',
        aliasesJson: null,
      };

      const result = createGlossaryTermSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
