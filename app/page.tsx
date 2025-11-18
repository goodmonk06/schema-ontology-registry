import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const namespaces = await prisma.schemaNamespace.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          schemas: true,
          glossaryTerms: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Schema & Ontology Registry
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage and version your JSON Schemas, OpenAPI specs, and glossary terms
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Namespaces</h2>
          </div>

          {namespaces.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-lg">No namespaces found</p>
              <p className="text-gray-400 text-sm mt-2">
                Run <code className="bg-gray-100 px-2 py-1 rounded">npm run db:seed</code> to create sample data
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {namespaces.map((namespace) => (
                <li key={namespace.id} className="hover:bg-gray-50 transition">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {namespace.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Key: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{namespace.key}</code>
                        </p>
                        {namespace.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {namespace.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-6 flex flex-col items-end gap-2">
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>{namespace._count.schemas} schemas</span>
                          <span>{namespace._count.glossaryTerms} terms</span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/namespace/${namespace.key}/schemas`}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
                          >
                            View Schemas
                          </Link>
                          <Link
                            href={`/namespace/${namespace.key}/glossary`}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
                          >
                            View Glossary
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
