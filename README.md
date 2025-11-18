# Schema & Ontology Registry

A centralized registry for managing and versioning JSON Schemas, OpenAPI specifications, and glossary terms. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **Schema Versioning**: Store and version JSON Schemas, OpenAPI specs, and other schema types
- **Namespace Organization**: Organize schemas and glossary terms by domain/namespace
- **Glossary Management**: Define and maintain domain-specific terminology
- **Version Comparison**: Visual diff tool to compare schema versions
- **Retrieval APIs**: Simple HTTP APIs for clients to fetch schemas and glossary terms
- **Web UI**: Browse namespaces, view schemas, compare versions, and explore glossary terms

## Tech Stack

- **Frontend/Backend**: Next.js 16 with App Router + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd schema-ontology-registry
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your database connection:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Seed the database with sample data:
```bash
npm run db:seed
```

6. Generate Prisma Client:
```bash
npx prisma generate
```

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
schema-ontology-registry/
├── app/
│   ├── api/                    # API routes
│   │   ├── namespaces/         # CRUD for namespaces
│   │   ├── schemas/            # CRUD for schemas
│   │   ├── glossary/           # CRUD for glossary terms
│   │   └── schema/             # Public retrieval API
│   ├── namespace/              # UI pages
│   │   └── [namespace]/
│   │       ├── schemas/        # Schema viewer with diff
│   │       └── glossary/       # Glossary viewer
│   └── page.tsx                # Home page (namespace list)
├── lib/
│   └── prisma.ts               # Prisma client singleton
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
└── README.md
```

## Domain Model

### SchemaNamespace
Logical grouping for related schemas and glossary terms.
- `id`: Unique identifier
- `key`: URL-friendly namespace key (e.g., "events")
- `name`: Human-readable name
- `description`: Optional description

### SchemaDefinition
Versioned schema content.
- `id`: Unique identifier
- `namespaceId`: Reference to namespace
- `version`: Semantic version (e.g., "1.0.0")
- `type`: Schema type (json_schema | openapi | other)
- `contentJson`: The actual schema content (JSON)
- `createdAt`: Creation timestamp

### GlossaryTerm
Domain-specific terminology.
- `id`: Unique identifier
- `namespaceId`: Reference to namespace
- `term`: The term name
- `definition`: Term definition
- `aliasesJson`: Array of alternative names (JSON)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## API Reference

### Retrieval APIs (Public)

These are the primary APIs that client services should use to fetch schemas and glossary terms.

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
  "id": "...",
  "namespaceId": "...",
  "version": "1.0.0",
  "type": "json_schema",
  "contentJson": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "UserCreatedEvent",
    "type": "object",
    "properties": { ... }
  },
  "namespace": {
    "key": "events",
    "name": "Events",
    "description": "..."
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
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

**Response:**
```json
[
  {
    "id": "...",
    "namespaceId": "...",
    "term": "Event",
    "definition": "A significant occurrence or change in state...",
    "aliasesJson": ["Domain Event", "System Event"],
    "namespace": {
      "key": "events",
      "name": "Events"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Management APIs (CRUD)

These APIs are for managing registry content.

#### Namespaces

- `GET /api/namespaces` - List all namespaces
- `POST /api/namespaces` - Create a namespace
- `GET /api/namespaces/:id` - Get namespace by ID
- `PUT /api/namespaces/:id` - Update namespace
- `DELETE /api/namespaces/:id` - Delete namespace

#### Schemas

- `GET /api/schemas?namespaceId=:id` - List schemas for namespace
- `POST /api/schemas` - Create a schema version
- `GET /api/schemas/:id` - Get schema by ID
- `DELETE /api/schemas/:id` - Delete schema

#### Glossary Terms

- `GET /api/glossary?namespaceId=:id` - List terms for namespace
- `POST /api/glossary` - Create a glossary term
- `GET /api/glossary/:id` - Get term by ID (or all terms by namespace key)
- `PUT /api/glossary/:id` - Update term
- `DELETE /api/glossary/:id` - Delete term

## How Clients Should Reference Schemas

### 1. Direct HTTP Fetch

Fetch schemas at runtime using the retrieval API:

```typescript
// TypeScript example
async function getSchema(namespace: string, version: string) {
  const response = await fetch(
    `https://registry.example.com/api/schema/${namespace}/${version}`
  );
  return response.json();
}

// Usage
const schema = await getSchema('events', '1.0.0');
```

### 2. Validation in Application Code

Use the fetched schema to validate data:

```typescript
import Ajv from 'ajv';

const ajv = new Ajv();
const schema = await getSchema('events', '1.0.0');
const validate = ajv.compile(schema.contentJson);

const data = {
  userId: "123",
  email: "user@example.com",
  username: "johndoe",
  createdAt: new Date().toISOString()
};

if (validate(data)) {
  console.log('Valid!');
} else {
  console.error('Validation errors:', validate.errors);
}
```

### 3. Code Generation

Generate types from schemas for compile-time safety:

```bash
# Fetch schema
curl http://localhost:3000/api/schema/events/1.0.0 | jq '.contentJson' > schema.json

# Generate TypeScript types
npx json-schema-to-typescript schema.json > types.ts
```

### 4. CI/CD Integration

Add schema validation to your CI/CD pipeline:

```yaml
# .github/workflows/validate.yml
- name: Validate against schema registry
  run: |
    curl http://registry.example.com/api/schema/events/1.0.0 -o schema.json
    npm run validate-events -- --schema schema.json
```

### 5. Versioning Best Practices

- Use semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Breaking changes
- MINOR: Backward-compatible additions
- PATCH: Bug fixes or clarifications

Example version progression:
- `1.0.0` - Initial release
- `1.1.0` - Add optional field (non-breaking)
- `2.0.0` - Remove field or change type (breaking)

### 6. Caching Strategies

Cache schemas to reduce latency:

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

### 7. Glossary Integration

Reference glossary terms in documentation and code:

```typescript
// Fetch glossary for context
const glossary = await fetch(
  'https://registry.example.com/api/glossary/events'
).then(r => r.json());

// Use in documentation or tooltips
const eventTerm = glossary.find(t => t.term === 'Event');
console.log(eventTerm.definition);
```

## Development

### Database Commands

```bash
# Create a migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npm run db:seed
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
