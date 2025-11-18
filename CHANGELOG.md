# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-11-18

### Added - Phase 2 & 3 Enhancements

#### Foundation & Infrastructure
- **Testing Framework**: Integrated Vitest with coverage support
  - Unit tests for services and validation
  - Integration test setup
  - Test fixtures and mocks
  - Coverage reporting with v8

- **Input Validation**: Zod schemas for all API inputs
  - `createNamespaceSchema` - validates namespace creation
  - `createSchemaSchema` - validates schema definition with semantic versioning
  - `createGlossaryTermSchema` - validates glossary terms
  - Type inference for compile-time safety

- **Error Handling**: Centralized error management
  - Custom error classes (AppError, ValidationError, NotFoundError, etc.)
  - `withErrorHandler` wrapper for API routes
  - Consistent error response format
  - Prisma error translation

- **Logging**: Structured logging with Pino
  - Context-aware logging
  - Development pretty-printing
  - Production JSON formatting
  - Metric collection support

- **Docker Support**:
  - Dockerfile for production builds
  - docker-compose.yml with PostgreSQL
  - Environment variable configuration
  - Health checks

#### Domain Model Expansion
- **New Entities**:
  - `Tag`: Categorize schemas and namespaces
  - `SchemaValidation`: Store validation results
  - `ChangeLog`: Complete audit trail
  - `SchemaRelationship`: Track schema dependencies

- **Enhanced Existing Models**:
  - SchemaDefinition: Added status, author, metadata, deprecation fields
  - SchemaNamespace: Added status and metadata
  - New enums: SchemaStatus, NamespaceStatus, ChangeAction, RelationType
  - Extended SchemaType with avro, protobuf, graphql

- **Indexes**: Performance indexes on frequently queried fields

#### Service Layer
- **SchemaService**: Complete business logic for schemas
  - createSchema with validation and events
  - getSchemaById with relations
  - getSchemaByVersion for public API
  - listSchemas with filtering and pagination
  - updateSchema with change tracking
  - deleteSchema with cleanup
  - compareVersions for schema diffing

- **Event System**: Domain event bus
  - In-memory event emitter
  - Typed event definitions
  - Event handlers for side effects
  - Wildcard listeners
  - Events: schema.created, schema.published, schema.deprecated, etc.

#### Extensibility
- **Adapter Interfaces**:
  - INotificationAdapter: Send notifications (email, Slack, webhooks)
  - IValidationAdapter: Validate schemas against meta-schemas
  - Stub implementations for development
  - Easy swap for production services

#### Developer Experience
- **Scripts**: Comprehensive npm scripts
  - `test`, `test:watch`, `test:ui`, `test:coverage`
  - `typecheck` for TypeScript validation
  - `db:migrate`, `db:push`, `db:studio`, `db:reset`
  - `format`, `format:check` for Prettier

- **Enhanced Seed Data**:
  - Multiple namespaces (events, api-contracts, data-models)
  - Rich schema examples with versions
  - Glossary terms across domains
  - Tags and relationships
  - Validation records and change logs

#### Documentation
- **Architecture Documentation**: Complete system architecture guide
- **Contributing Guide**: Development workflow and standards
- **Phase 3 Overview**: Roadmap and implementation plan
- **Code Examples**: Patterns for common operations
- **.env.example**: All configuration options documented

#### Quality Improvements
- **Type Safety**: End-to-end TypeScript strictness
- **Code Organization**: Clear layer separation
- **Error Messages**: User-friendly and actionable
- **Logging**: Structured and contextual
- **Testing**: Unit and integration test foundations

### Changed
- Updated API route pattern to use validation and error handling
- Enhanced namespace API with Zod validation and event emission
- Improved Prisma schema with relations and constraints
- Package.json scripts reorganized and expanded

### Dependencies
- Added: vitest, @vitest/ui, @vitest/coverage-v8
- Added: zod for validation
- Added: pino, pino-pretty for logging
- Added: prettier for code formatting
- Added: date-fns, nanoid for utilities

## [0.1.0] - 2025-11-18

### Added - Initial Release
- Next.js 16 with App Router and TypeScript
- PostgreSQL database with Prisma ORM
- Core domain models: SchemaNamespace, SchemaDefinition, GlossaryTerm
- CRUD APIs for namespaces, schemas, and glossary terms
- Public retrieval APIs: GET /api/schema/:namespace/:version, GET /api/glossary/:namespace
- Web UI:
  - Namespace list page
  - Schema version viewer
  - Schema comparison with diff
  - Glossary viewer
- Basic seed data with "events" namespace
- Comprehensive README with client usage patterns
- Tailwind CSS styling

[0.2.0]: https://github.com/your-org/schema-ontology-registry/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/your-org/schema-ontology-registry/releases/tag/v0.1.0
