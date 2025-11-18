import { z } from 'zod';
import { SchemaType } from '@prisma/client';

// Namespace validation schemas
export const createNamespaceSchema = z.object({
  key: z.string()
    .min(2, 'Key must be at least 2 characters')
    .max(50, 'Key must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Key must contain only lowercase letters, numbers, and hyphens'),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

export const updateNamespaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

// Schema definition validation schemas
export const createSchemaSchema = z.object({
  namespaceId: z.string().cuid('Invalid namespace ID'),
  version: z.string()
    .regex(
      /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/,
      'Version must follow semantic versioning (e.g., 1.0.0 or 1.0.0-beta.1)'
    ),
  type: z.nativeEnum(SchemaType),
  contentJson: z.record(z.any()).refine(
    (data) => typeof data === 'object' && data !== null,
    'Content must be a valid JSON object'
  ),
});

// Glossary term validation schemas
export const createGlossaryTermSchema = z.object({
  namespaceId: z.string().cuid('Invalid namespace ID'),
  term: z.string().min(1, 'Term is required').max(100),
  definition: z.string().min(10, 'Definition must be at least 10 characters').max(1000),
  aliasesJson: z.array(z.string()).optional().nullable(),
});

export const updateGlossaryTermSchema = z.object({
  term: z.string().min(1).max(100).optional(),
  definition: z.string().min(10).max(1000).optional(),
  aliasesJson: z.array(z.string()).optional().nullable(),
});

// Export types
export type CreateNamespaceInput = z.infer<typeof createNamespaceSchema>;
export type UpdateNamespaceInput = z.infer<typeof updateNamespaceSchema>;
export type CreateSchemaInput = z.infer<typeof createSchemaSchema>;
export type CreateGlossaryTermInput = z.infer<typeof createGlossaryTermSchema>;
export type UpdateGlossaryTermInput = z.infer<typeof updateGlossaryTermSchema>;
