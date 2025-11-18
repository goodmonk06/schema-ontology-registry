import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function GlossaryPage({
  params,
}: {
  params: Promise<{ namespace: string }>;
}) {
  const { namespace: namespaceKey } = await params;

  const namespace = await prisma.schemaNamespace.findUnique({
    where: { key: namespaceKey },
    include: {
      glossaryTerms: {
        orderBy: { term: 'asc' },
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
            {namespace.name} - Glossary
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Glossary terms for <code className="bg-gray-100 px-2 py-1 rounded">{namespace.key}</code>
          </p>
        </div>

        {namespace.glossaryTerms.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No glossary terms found for this namespace</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {namespace.glossaryTerms.map((term) => (
                <div key={term.id} className="px-6 py-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {term.term}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {term.definition}
                      </p>
                      {term.aliasesJson && Array.isArray(term.aliasesJson) && (term.aliasesJson as string[]).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-sm text-gray-500 font-medium">Aliases:</span>
                          {(term.aliasesJson as string[]).map((alias, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {alias}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-6 text-sm text-gray-500">
                      <p>Updated {new Date(term.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
