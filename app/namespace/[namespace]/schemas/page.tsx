import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function SchemasPage({
  params,
}: {
  params: Promise<{ namespace: string }>;
}) {
  const { namespace: namespaceKey } = await params;

  const namespace = await prisma.schemaNamespace.findUnique({
    where: { key: namespaceKey },
    include: {
      schemas: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!namespace) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            &larr; Back to Namespaces
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">
            {namespace.name} - Schemas
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Schema versions for <code className="bg-gray-100 px-2 py-1 rounded">{namespace.key}</code>
          </p>
        </div>

        {namespace.schemas.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No schemas found for this namespace</p>
          </div>
        ) : (
          <div className="space-y-6">
            {namespace.schemas.map((schema) => (
              <div
                key={schema.id}
                className="bg-white shadow-md rounded-lg overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Version {schema.version}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Type: <span className="font-medium">{schema.type}</span> • Created:{' '}
                      {new Date(schema.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{JSON.stringify(schema.contentJson, null, 2)}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {namespace.schemas.length >= 2 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Compare Versions
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Select two versions to compare their differences
            </p>
            <form action={`/namespace/${namespace.key}/schemas/compare`} method="GET">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version A
                  </label>
                  <select
                    name="versionA"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                    required
                  >
                    <option value="">Select version</option>
                    {namespace.schemas.map((schema) => (
                      <option key={schema.id} value={schema.version}>
                        {schema.version}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version B
                  </label>
                  <select
                    name="versionB"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                    required
                  >
                    <option value="">Select version</option>
                    {namespace.schemas.map((schema) => (
                      <option key={schema.id} value={schema.version}>
                        {schema.version}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                >
                  Compare
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
