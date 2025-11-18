import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';

// Setup test database connection
beforeAll(async () => {
  // Test database should be configured via TEST_DATABASE_URL env var
  // or use the same database with test isolation
});

// Cleanup after each test
afterEach(async () => {
  // Optional: Clean up test data
  // await prisma.glossaryTerm.deleteMany({});
  // await prisma.schemaDefinition.deleteMany({});
  // await prisma.schemaNamespace.deleteMany({});
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
