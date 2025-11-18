import { PrismaClient, SchemaType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create events namespace
  const eventsNamespace = await prisma.schemaNamespace.upsert({
    where: { key: 'events' },
    update: {},
    create: {
      key: 'events',
      name: 'Events',
      description: 'Event schemas and glossary for application events',
    },
  });

  console.log('Created namespace:', eventsNamespace.name);

  // Create JSON Schema for UserCreatedEvent
  await prisma.schemaDefinition.upsert({
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

  console.log('Created UserCreatedEvent schema v1.0.0');

  // Create JSON Schema for OrderPlacedEvent (version 1.1.0)
  await prisma.schemaDefinition.upsert({
    where: {
      namespaceId_version: {
        namespaceId: eventsNamespace.id,
        version: '1.1.0',
      },
    },
    update: {},
    create: {
      namespaceId: eventsNamespace.id,
      version: '1.1.0',
      type: SchemaType.json_schema,
      contentJson: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'OrderPlacedEvent',
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the order',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the user who placed the order',
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
            description: 'Total order amount',
          },
          placedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when order was placed',
          },
        },
        required: ['orderId', 'userId', 'items', 'totalAmount', 'placedAt'],
      },
    },
  });

  console.log('Created OrderPlacedEvent schema v1.1.0');

  // Create glossary terms
  const glossaryTerms = [
    {
      term: 'Event',
      definition: 'A significant occurrence or change in state within the system that is recorded and can trigger downstream actions.',
      aliases: ['Domain Event', 'System Event'],
    },
    {
      term: 'Schema',
      definition: 'A formal description of the structure and constraints of data, typically expressed in JSON Schema or similar format.',
      aliases: ['Data Schema', 'JSON Schema'],
    },
    {
      term: 'Namespace',
      definition: 'A logical grouping or container for related schemas and glossary terms, used to organize and isolate different domains.',
      aliases: ['Domain', 'Context'],
    },
    {
      term: 'Version',
      definition: 'A specific iteration or release of a schema, using semantic versioning (MAJOR.MINOR.PATCH) to track changes over time.',
      aliases: ['Schema Version', 'Release'],
    },
  ];

  for (const term of glossaryTerms) {
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
    console.log(`Created glossary term: ${term.term}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
