# Schema & Ontology Registry

> A production-ready, centralized registry for managing and versioning JSON Schemas, OpenAPI specifications, and domain glossaries across distributed systems.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## Overview

The Schema & Ontology Registry solves the critical problem of schema drift, inconsistent data validation, and lack of shared terminology across microservices by providing a single source of truth for data contracts and domain concepts. Teams can publish, discover, version, and consume schemas programmatically while maintaining backwards compatibility and clear migration paths.

### Key Benefits

- 🎯 **Single Source of Truth**: Centralized schema repository for all services
- 📦 **Version Management**: Semantic versioning with full history and deprecation tracking
- 🔍 **Discovery**: Search and browse schemas across namespaces
- 🔄 **Change Tracking**: Complete audit trail of all modifications
- 🚀 **Developer-Friendly**: Simple APIs, comprehensive docs, and tooling
- 🏗️ **Extensible**: Plugin architecture for custom validation, notifications, and storage
- 🧪 **Production-Ready**: Full test coverage, logging, error handling, and Docker support

## Features

### Core Capabilities
- ✅ **Schema Versioning**: JSON Schema, OpenAPI, Avro, Protocol Buffers, GraphQL
- ✅ **Namespace Organization**: Isolate schemas by domain, team, or service
- ✅ **Glossary Management**: Shared terminology with aliases and definitions
- ✅ **Version Comparison**: Visual and semantic diff between schema versions
- ✅ **Tags & Categories**: Organize schemas with custom tags
- ✅ **Relationships**: Track schema dependencies and evolution
- ✅ **Validation**: Automated schema validation on publish
- ✅ **Change Logs**: Complete audit trail with author and timestamp
- ✅ **Web UI**: Browse, search, and compare schemas visually
- ✅ **REST APIs**: Simple HTTP APIs for integration

### Quality & Operations
- 🧪 **Test Coverage**: Unit and integration tests with Vitest
- 📝 **Input Validation**: Zod schemas for all API inputs
- ⚠️ **Error Handling**: Centralized, consistent error responses
- 📊 **Structured Logging**: Pino logging with context
- 🐳 **Docker Support**: Production-ready containers
- 🔌 **Extension Points**: Adapters for notifications, validation, storage

## Tech Stack

- **Frontend/Backend**: Next.js 16 with App Router + TypeScript 5
- **Database**: PostgreSQL with Prisma ORM 6
- **Validation**: Zod for runtime type safety
- **Testing**: Vitest with coverage reporting
- **Logging**: Pino structured logging
- **Styling**: Tailwind CSS 4
- **Deployment**: Docker + docker-compose

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd schema-ontology-registry

# Copy environment variables
cp .env.example .env

# Start PostgreSQL and the application
docker-compose up -d

# The app will be available at http://localhost:3000
# PostgreSQL will be available at localhost:5432
```

### Local Development

#### Prerequisites
- Node.js 20+
- PostgreSQL 16+

#### Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client
npx prisma generate

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
schema-ontology-registry/
├── app/
│   ├── api/                       # API route handlers
│   │   ├── namespaces/            # Namespace CRUD
│   │   ├── schemas/               # Schema CRUD
│   │   ├── glossary/              # Glossary CRUD
│   │   └── schema/                # Public retrieval API
│   ├── namespace/[namespace]/     # UI pages
│   │   ├── schemas/               # Schema viewer + diff
│   │   └── glossary/              # Glossary viewer
│   └── page.tsx                   # Home page
├── lib/
│   ├── services/                  # Business logic layer
│   │   └── schema.service.ts
│   ├── validation/                # Zod schemas
│   │   └── schemas.ts
│   ├── errors/                    # Error handling
│   │   └── index.ts
│   ├── events/                    # Event bus
│   │   └── index.ts
│   ├── logger/                    # Structured logging
│   │   └── index.ts
│   ├── adapters/                  # Extension interfaces
│   │   ├── notification.adapter.ts
│   │   └── validation.adapter.ts
│   └── prisma.ts                  # Prisma client
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed-enhanced.ts           # Rich seed data
│   └── migrations/                # Database migrations
├── tests/
│   ├── unit/                      # Unit tests
│   │   ├── schema.service.test.ts
│   │   └── validation.test.ts
│   ├── integration/               # Integration tests
│   └── fixtures/                  # Test data
├── docs/
│   ├── ARCHITECTURE.md            # System architecture
│   ├── CONTRIBUTING.md            # Development guide
│   └── PHASE3_OVERVIEW.md         # Roadmap
├── Dockerfile                     # Production container
├── docker-compose.yml             # Local dev environment
├── vitest.config.ts               # Test configuration
└── README.md
```

## Domain Model

### Core Entities

#### SchemaNamespace
Logical grouping for related schemas and glossary terms.
- `id`, `key`, `name`, `description`
- `status`: active | archived
- `metadata`: JSON for custom properties
- Relations: schemas, glossaryTerms, tags

#### SchemaDefinition
Versioned schema content with full lifecycle.
- `id`, `version`, `type`, `contentJson`
- `author`, `status`: draft | review | approved | published | deprecated | archived
- `isDeprecated`, `deprecatedAt`
- `metadata`: JSON for custom properties
- Relations: namespace, validations, tags, relationships

#### GlossaryTerm
Domain-specific terminology.
- `id`, `term`, `definition`
- `aliasesJson`: array of alternative names
- Relation: namespace

#### Tag
Categorization and filtering.
- `id`, `name`, `color`, `description`
- Relations: namespaces, schemas

#### SchemaValidation
Validation results for schemas.
- `id`, `isValid`, `errors`, `warnings`
- `validatorType`, `validatorVersion`
- Relation: schema

#### ChangeLog
Complete audit trail.
- `id`, `entityType`, `entityId`, `action`
- `changes`: JSON diff
- `performedBy`, `performedAt`

#### SchemaRelationship
Schema dependencies and evolution.
- `id`, `sourceSchemaId`, `targetSchemaId`
- `relationshipType`: extends | references | imports | deprecated_by
- `description`

### Entity Relationships

```
SchemaNamespace (1) ──< (N) SchemaDefinition
SchemaNamespace (1) ──< (N) GlossaryTerm
SchemaNamespace (N) >──< (N) Tag
SchemaDefinition (N) >──< (N) Tag
SchemaDefinition (1) ──< (N) SchemaValidation
SchemaDefinition (1) ──< (N) SchemaRelationship (source)
SchemaDefinition (1) ──< (N) SchemaRelationship (target)
```

## API Reference

### Retrieval APIs (Public)

These are the primary APIs for client services to fetch schemas and glossary.

#### Get Schema by Namespace and Version

```http
GET /api/schema/:namespace/:version
```

**Example:**
```bash
curl http://localhost:3000/api/schema/events/1.0.0
```

**Response:**
```json
{
  "id": "cm123...",
  "version": "1.0.0",
  "type": "json_schema",
  "status": "published",
  "contentJson": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "UserCreatedEvent",
    "type": "object",
    "properties": { ... }
  },
  "namespace": {
    "key": "events",
    "name": "Domain Events"
  }
}
```

#### Get Glossary Terms by Namespace

```http
GET /api/glossary/:namespace
```

**Example:**
```bash
curl http://localhost:3000/api/glossary/events
```

### Management APIs (CRUD)

#### Namespaces
- `GET /api/namespaces` - List all namespaces
- `POST /api/namespaces` - Create namespace
- `GET /api/namespaces/:id` - Get namespace
- `PUT /api/namespaces/:id` - Update namespace
- `DELETE /api/namespaces/:id` - Delete namespace

#### Schemas
- `GET /api/schemas?namespaceId=:id` - List schemas
- `POST /api/schemas` - Create schema
- `GET /api/schemas/:id` - Get schema
- `DELETE /api/schemas/:id` - Delete schema

#### Glossary
- `GET /api/glossary?namespaceId=:id` - List terms
- `POST /api/glossary` - Create term
- `GET /api/glossary/:id` - Get term
- `PUT /api/glossary/:id` - Update term
- `DELETE /api/glossary/:id` - Delete term

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report

# Code Quality
npm run typecheck        # TypeScript type checking
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Database
npm run db:migrate       # Run migrations (dev)
npm run db:migrate:deploy # Run migrations (production)
npm run db:push          # Push schema without migration
npm run db:seed          # Seed with rich data
npm run db:seed:basic    # Seed with basic data
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (dev only)
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (great for debugging)
npm run test:ui
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations in production
npm run db:migrate:deploy

# Reset database (dev only - destroys data!)
npm run db:reset
```

## Client Integration

### 1. Direct HTTP Fetch

```typescript
async function getSchema(namespace: string, version: string) {
  const response = await fetch(
    `https://registry.example.com/api/schema/${namespace}/${version}`
  );
  return response.json();
}

const schema = await getSchema('events', '1.0.0');
```

### 2. Runtime Validation

```typescript
import Ajv from 'ajv';

const ajv = new Ajv();
const schema = await getSchema('events', '1.0.0');
const validate = ajv.compile(schema.contentJson);

const data = {
  userId: "123",
  email: "user@example.com",
  // ...
};

if (validate(data)) {
  console.log('Valid!');
} else {
  console.error('Validation errors:', validate.errors);
}
```

### 3. Code Generation

```bash
# Fetch schema
curl http://localhost:3000/api/schema/events/1.0.0 | jq '.contentJson' > schema.json

# Generate TypeScript types
npx json-schema-to-typescript schema.json > types.ts
```

### 4. CI/CD Integration

```yaml
# .github/workflows/validate.yml
- name: Validate against schema registry
  run: |
    curl http://registry.example.com/api/schema/events/1.0.0 -o schema.json
    npm run validate-events -- --schema schema.json
```

### 5. Caching Strategy

```typescript
const schemaCache = new Map();

async function getCachedSchema(namespace: string, version: string) {
  const key = `${namespace}:${version}`;
  if (!schemaCache.has(key)) {
    const schema = await getSchema(namespace, version);
    schemaCache.set(key, schema);
  }
  return schemaCache.get(key);
}
```

## Extension Points

### Custom Notification Adapter

```typescript
import { INotificationAdapter, NotificationMessage } from '@/lib/adapters/notification.adapter';

export class SlackNotificationAdapter implements INotificationAdapter {
  constructor(private webhookUrl: string) {}

  async sendNotification(message: NotificationMessage): Promise<void> {
    await fetch(this.webhookUrl, {
      method: 'POST',
      body: JSON.stringify({
        text: message.title,
        attachments: [{ text: message.body }],
      }),
    });
  }
}
```

### Custom Event Handlers

```typescript
import { eventBus } from '@/lib/events';

eventBus.on('schema.published', async (event) => {
  // Send notification
  await notificationAdapter.sendNotification({
    title: 'Schema Published',
    body: `${event.namespaceKey}/${event.version}`,
    severity: 'info',
  });

  // Update search index
  await searchAdapter.indexSchema(event.schemaId);

  // Trigger webhooks
  await webhookService.trigger('schema.published', event);
});
```

## Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md) - System design and patterns
- [Contributing Guide](./docs/CONTRIBUTING.md) - Development workflow
- [Phase 3 Overview](./docs/PHASE3_OVERVIEW.md) - Roadmap and future plans
- [Changelog](./CHANGELOG.md) - Version history

## Example Data

The seed script creates:
- **3 namespaces**: events, api-contracts, data-models
- **4 schema versions**: UserCreatedEvent (v1, v2), OrderPlacedEvent, User API
- **4 tags**: production, beta, deprecated, internal
- **Glossary terms**: Event, Event Store, Consumer, REST API, etc.
- **Relationships**: Version evolution tracking
- **Validations**: Automated validation results
- **Change logs**: Audit trail entries

## Roadmap

### Phase 4 (Q1 2026)
- [ ] GraphQL API layer
- [ ] Real-time schema change subscriptions (WebSocket)
- [ ] Full-text search integration (Elasticsearch/Algolia)
- [ ] Advanced semantic schema diffing
- [ ] Webhook system for notifications

### Phase 5 (Q2 2026)
- [ ] CLI tool for schema management
- [ ] SDK generation (TypeScript, Python, Go, Java)
- [ ] Role-based access control
- [ ] Schema linting and quality gates
- [ ] Breaking change detection

### Phase 6 (Q3 2026)
- [ ] Multi-tenancy support
- [ ] Schema templates marketplace
- [ ] AI-powered schema suggestions
- [ ] Automated migration generation
- [ ] Performance analytics

## Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/your-org/schema-ontology-registry/issues)
- 💬 [Discussions](https://github.com/your-org/schema-ontology-registry/discussions)

---

Built with ❤️ using Next.js, TypeScript, and Prisma
