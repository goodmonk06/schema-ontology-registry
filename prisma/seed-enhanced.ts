import { PrismaClient, SchemaType, SchemaStatus, NamespaceStatus, ChangeAction } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting enhanced seed...');

  // Create tags first
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'production' },
      update: {},
      create: { name: 'production', color: '#10b981', description: 'Production-ready schemas' },
    }),
    prisma.tag.upsert({
      where: { name: 'beta' },
      update: {},
      create: { name: 'beta', color: '#f59e0b', description: 'Beta/experimental schemas' },
    }),
    prisma.tag.upsert({
      where: { name: 'deprecated' },
      update: {},
      create: { name: 'deprecated', color: '#ef4444', description: 'Deprecated schemas' },
    }),
    prisma.tag.upsert({
      where: { name: 'internal' },
      update: {},
      create: { name: 'internal', color: '#8b5cf6', description: 'Internal use only' },
    }),
  ]);

  console.log('Created tags');

  // Create multiple namespaces
  const eventsNamespace = await prisma.schemaNamespace.upsert({
    where: { key: 'events' },
    update: {},
    create: {
      key: 'events',
      name: 'Domain Events',
      description: 'Event schemas for event-driven architecture',
      status: NamespaceStatus.active,
      metadata: {
        owner: 'platform-team',
        contact: 'platform@example.com',
      },
    },
  });

  const apiNamespace = await prisma.schemaNamespace.upsert({
    where: { key: 'api-contracts' },
    update: {},
    create: {
      key: 'api-contracts',
      name: 'API Contracts',
      description: 'OpenAPI specifications for public APIs',
      status: NamespaceStatus.active,
      metadata: {
        owner: 'api-team',
        contact: 'api@example.com',
      },
    },
  });

  const dataNamespace = await prisma.schemaNamespace.upsert({
    where: { key: 'data-models' },
    update: {},
    create: {
      key: 'data-models',
      name: 'Data Models',
      description: 'Shared data models and entities',
      status: NamespaceStatus.active,
    },
  });

  console.log('Created namespaces');

  // Create schemas for events namespace
  const userCreatedV1 = await prisma.schemaDefinition.upsert({
    where: {
      namespaceId_version: {
        namespaceId: eventsNamespace.id,
        version: '1.0.0',
      },
    },
    update: {},
    create: {
      namespaceId: eventsNamespace.id,
      version: '1.0.0',
      type: SchemaType.json_schema,
      author: 'john.doe@example.com',
      status: SchemaStatus.published,
      contentJson: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'UserCreatedEvent',
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the user',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          username: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            description: 'User chosen username',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when user was created',
          },
        },
        required: ['userId', 'email', 'username', 'createdAt'],
      },
    },
  });

  const userCreatedV2 = await prisma.schemaDefinition.upsert({
    where: {
      namespaceId_version: {
        namespaceId: eventsNamespace.id,
        version: '2.0.0',
      },
    },
    update: {},
    create: {
      namespaceId: eventsNamespace.id,
      version: '2.0.0',
      type: SchemaType.json_schema,
      author: 'jane.smith@example.com',
      status: SchemaStatus.published,
      contentJson: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'UserCreatedEvent',
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the user',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          username: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            description: 'User chosen username',
          },
          profileData: {
            type: 'object',
            description: 'User profile information',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              avatarUrl: { type: 'string', format: 'uri' },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when user was created',
          },
          source: {
            type: 'string',
            enum: ['web', 'mobile', 'api'],
            description: 'Registration source',
          },
        },
        required: ['userId', 'email', 'username', 'createdAt', 'source'],
      },
    },
  });

  const orderPlacedV1 = await prisma.schemaDefinition.upsert({
    where: {
      namespaceId_version: {
        namespaceId: eventsNamespace.id,
        version: '1.0.0',
      },
    },
    update: {},
    create: {
      namespaceId: eventsNamespace.id,
      version: '1.0.0',
      type: SchemaType.json_schema,
      author: 'orders-team@example.com',
      status: SchemaStatus.published,
      contentJson: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'OrderPlacedEvent',
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            format: 'uuid',
          },
          userId: {
            type: 'string',
            format: 'uuid',
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'integer', minimum: 1 },
                price: { type: 'number', minimum: 0 },
              },
              required: ['productId', 'quantity', 'price'],
            },
          },
          totalAmount: {
            type: 'number',
            minimum: 0,
          },
          placedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['orderId', 'userId', 'items', 'totalAmount', 'placedAt'],
      },
    },
  });

  // Create API contract schemas
  const userApiV1 = await prisma.schemaDefinition.upsert({
    where: {
      namespaceId_version: {
        namespaceId: apiNamespace.id,
        version: '1.0.0',
      },
    },
    update: {},
    create: {
      namespaceId: apiNamespace.id,
      version: '1.0.0',
      type: SchemaType.openapi,
      author: 'api-team@example.com',
      status: SchemaStatus.published,
      contentJson: {
        openapi: '3.0.0',
        info: {
          title: 'User API',
          version: '1.0.0',
          description: 'API for managing users',
        },
        paths: {
          '/users': {
            get: {
              summary: 'List users',
              responses: {
                '200': {
                  description: 'Successful response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string', format: 'email' },
                username: { type: 'string' },
              },
            },
          },
        },
      },
    },
  });

  console.log('Created schemas');

  // Create glossary terms for each namespace
  const eventGlossary = [
    {
      term: 'Event',
      definition:
        'A significant occurrence or change in state within the system that is recorded and can trigger downstream actions.',
      aliases: ['Domain Event', 'System Event'],
    },
    {
      term: 'Event Store',
      definition:
        'A specialized database optimized for storing and querying event streams in an event-sourced system.',
      aliases: ['Event Log', 'Event Stream'],
    },
    {
      term: 'Consumer',
      definition:
        'A service or component that subscribes to and processes events from an event stream or message queue.',
      aliases: ['Event Consumer', 'Subscriber', 'Listener'],
    },
  ];

  for (const term of eventGlossary) {
    await prisma.glossaryTerm.upsert({
      where: {
        namespaceId_term: {
          namespaceId: eventsNamespace.id,
          term: term.term,
        },
      },
      update: {},
      create: {
        namespaceId: eventsNamespace.id,
        term: term.term,
        definition: term.definition,
        aliasesJson: term.aliases,
      },
    });
  }

  // Create glossary for API namespace
  await prisma.glossaryTerm.upsert({
    where: {
      namespaceId_term: {
        namespaceId: apiNamespace.id,
        term: 'REST API',
      },
    },
    update: {},
    create: {
      namespaceId: apiNamespace.id,
      term: 'REST API',
      definition:
        'Representational State Transfer - an architectural style for building web services that use HTTP methods.',
      aliasesJson: ['RESTful API', 'HTTP API'],
    },
  });

  console.log('Created glossary terms');

  // Create schema validations
  await prisma.schemaValidation.create({
    data: {
      schemaId: userCreatedV1.id,
      isValid: true,
      validatorType: 'ajv',
      validatorVersion: '8.12.0',
    },
  });

  await prisma.schemaValidation.create({
    data: {
      schemaId: userCreatedV2.id,
      isValid: true,
      validatorType: 'ajv',
      validatorVersion: '8.12.0',
    },
  });

  console.log('Created validations');

  // Create schema relationships
  await prisma.schemaRelationship.upsert({
    where: {
      sourceSchemaId_targetSchemaId_relationshipType: {
        sourceSchemaId: userCreatedV2.id,
        targetSchemaId: userCreatedV1.id,
        relationshipType: 'deprecated_by',
      },
    },
    update: {},
    create: {
      sourceSchemaId: userCreatedV1.id,
      targetSchemaId: userCreatedV2.id,
      relationshipType: 'deprecated_by',
      description: 'Version 2.0.0 supersedes 1.0.0 with additional fields',
    },
  });

  console.log('Created relationships');

  // Create change logs
  await prisma.changeLog.create({
    data: {
      entityType: 'SchemaDefinition',
      entityId: userCreatedV2.id,
      action: ChangeAction.published,
      performedBy: 'jane.smith@example.com',
      changes: {
        from: { status: 'draft' },
        to: { status: 'published' },
      },
    },
  });

  console.log('Created change logs');

  console.log('Enhanced seed completed successfully!');
  console.log('\nSummary:');
  console.log(`- Created ${tags.length} tags`);
  console.log('- Created 3 namespaces (events, api-contracts, data-models)');
  console.log('- Created 4 schemas with versioning and relationships');
  console.log('- Created glossary terms across namespaces');
  console.log('- Created validation records and change logs');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
