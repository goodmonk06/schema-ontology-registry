# Architecture Documentation

## Overview

The Schema & Ontology Registry is built as a modern, layered Next.js application with clear separation of concerns and strong typing throughout.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Web UI, HTTP Clients, CLI Tools)                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├── REST API
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │ Validation   │  │ Error Handler│      │
│  │ /api/namespaces│  │  (Zod)      │  │  Middleware  │      │
│  │ /api/schemas   │  │              │  │              │      │
│  │ /api/glossary  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Schema Service│  │Namespace Svc │  │Glossary Svc  │      │
│  │ • Business   │  │ • Validation │  │ • CRUD       │      │
│  │   Logic      │  │ • Events     │  │ • Search     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├── Events → Event Bus → Adapters
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Prisma ORM                             │   │
│  │  • Type-safe queries                                 │   │
│  │  • Migrations                                        │   │
│  │  • Relations                                         │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  • Namespaces  • Schemas  • Glossary  • Tags                │
│  • Validations • ChangeLogs • Relationships                 │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. API Layer (`app/api/`)
- **Purpose**: HTTP request handling, routing, authentication
- **Responsibilities**:
  - Input validation using Zod schemas
  - Request/response transformation
  - Error handling via centralized middleware
  - Logging incoming requests
  - Delegating business logic to service layer
- **Example**: `app/api/namespaces/route.ts`

### 2. Service Layer (`lib/services/`)
- **Purpose**: Business logic and domain operations
- **Responsibilities**:
  - Domain rules enforcement
  - Transaction management
  - Event emission
  - Cross-entity operations
  - Complex validation logic
- **Example**: `lib/services/schema.service.ts`

### 3. Data Access Layer (`lib/prisma.ts` + Prisma models)
- **Purpose**: Database interaction
- **Responsibilities**:
  - Type-safe queries
  - Connection pooling
  - Transaction support
  - Schema migrations
- **Pattern**: Repository pattern via Prisma Client

### 4. Domain Layer (`prisma/schema.prisma`)
- **Purpose**: Core domain model
- **Entities**:
  - SchemaNamespace
  - SchemaDefinition
  - GlossaryTerm
  - Tag
  - SchemaValidation
  - ChangeLog
  - SchemaRelationship
- **Relationships**: Defined with foreign keys and cascade rules

## Cross-Cutting Concerns

### Event System (`lib/events/`)
- In-memory event bus for domain events
- Typed event definitions
- Async event handlers
- Wildcard listeners
- **Events**:
  - `schema.created`
  - `schema.published`
  - `schema.deprecated`
  - `namespace.created`

### Validation (`lib/validation/`)
- Zod schemas for all inputs
- Type inference for compile-time safety
- Reusable validation rules
- **Schemas**:
  - `createNamespaceSchema`
  - `createSchemaSchema`
  - `createGlossaryTermSchema`

### Error Handling (`lib/errors/`)
- Custom error classes (AppError, ValidationError, NotFoundError, etc.)
- Centralized error handler
- Consistent error responses
- Error logging with context

### Logging (`lib/logger/`)
- Structured logging with Pino
- Contextual loggers
- Development vs. production formatting
- Metric collection

### Adapters (`lib/adapters/`)
- **INotificationAdapter**: Send notifications (email, Slack, webhooks)
- **IValidationAdapter**: Validate schemas (JSON Schema, OpenAPI, etc.)
- Default stub implementations
- Easy to swap for production services

## Data Flow

### Creating a Schema
```
1. Client → POST /api/schemas
2. API validates input (Zod)
3. API calls SchemaService.createSchema()
4. Service validates business rules
5. Service creates schema via Prisma
6. Service creates change log
7. Service emits 'schema.created' event
8. Event handlers execute (notifications, etc.)
9. Response returned to client
```

### Retrieving a Schema
```
1. Client → GET /api/schema/:namespace/:version
2. API calls SchemaService.getSchemaByVersion()
3. Service queries Prisma with relations
4. Service returns enriched schema object
5. Response returned to client
```

## Extension Points

### 1. Adapters
Implement interfaces in `lib/adapters/` for:
- Notification services
- Schema validators
- Storage backends
- Search engines

### 2. Event Handlers
Subscribe to domain events:
```typescript
eventBus.on('schema.published', async (event) => {
  await notifySlack(event);
  await updateSearchIndex(event);
});
```

### 3. Validation Rules
Add custom Zod validators:
```typescript
const customSchema = z.object({
  field: z.string().refine(customValidation),
});
```

### 4. Database Migrations
Extend domain model via Prisma:
```bash
npx prisma migrate dev --name add_new_feature
```

## Security Considerations

1. **Input Validation**: All inputs validated via Zod before processing
2. **SQL Injection**: Prevented via Prisma parameterized queries
3. **Error Messages**: Production errors don't leak sensitive info
4. **Rate Limiting**: TODO - implement on public APIs
5. **Authentication**: TODO - add auth middleware

## Performance Optimizations

1. **Database Indexes**: On frequently queried fields (namespace+version, status, etc.)
2. **Connection Pooling**: Via Prisma connection pool
3. **Selective Includes**: Only load needed relations
4. **Pagination**: Limit/offset on list endpoints
5. **Caching**: TODO - add Redis for frequently accessed schemas

## Testing Strategy

### Unit Tests (`tests/unit/`)
- Service layer business logic
- Validation rules
- Utility functions
- Mocked database

### Integration Tests (`tests/integration/`)
- API endpoints end-to-end
- Database interactions
- Event flows
- Real test database

### Test Coverage Goals
- Service layer: 80%+
- Validation: 90%+
- API routes: 70%+

## Deployment Architecture

### Local Development
```
docker-compose up
├── PostgreSQL container
└── Next.js dev server
```

### Production
```
├── Load Balancer
├── Next.js instances (horizontal scaling)
├── PostgreSQL (managed service)
└── Redis cache (optional)
```

## Future Enhancements

1. **GraphQL API**: Alternative to REST
2. **Real-time Updates**: WebSocket subscriptions for schema changes
3. **Full-text Search**: Elasticsearch/Algolia integration
4. **Schema Diffing**: Advanced semantic diff beyond text comparison
5. **Webhooks**: Subscribe to schema events
6. **CLI Tool**: Publish schemas from command line
7. **SDK Generation**: Auto-generate client libraries
8. **Access Control**: Role-based permissions
9. **Audit Trail**: Complete history of all changes
10. **Schema Linting**: Automated quality checks
