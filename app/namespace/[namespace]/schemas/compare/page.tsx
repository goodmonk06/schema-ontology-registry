import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Simple line-by-line diff function
function computeDiff(textA: string, textB: string) {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  const result: Array<{ type: 'add' | 'remove' | 'same'; line: string; lineNum?: number }> = [];

  let i = 0;
  let j = 0;

  while (i < linesA.length || j < linesB.length) {
    if (i >= linesA.length) {
      result.push({ type: 'add', line: linesB[j], lineNum: j + 1 });
      j++;
    } else if (j >= linesB.length) {
      result.push({ type: 'remove', line: linesA[i], lineNum: i + 1 });
      i++;
    } else if (linesA[i] === linesB[j]) {
      result.push({ type: 'same', line: linesA[i], lineNum: i + 1 });
      i++;
      j++;
    } else {
      if (i + 1 < linesA.length && linesA[i + 1] === linesB[j]) {
        result.push({ type: 'remove', line: linesA[i], lineNum: i + 1 });
        i++;
      } else if (j + 1 < linesB.length && linesA[i] === linesB[j + 1]) {
        result.push({ type: 'add', line: linesB[j], lineNum: j + 1 });
        j++;
      } else {
        result.push({ type: 'remove', line: linesA[i], lineNum: i + 1 });
        result.push({ type: 'add', line: linesB[j], lineNum: j + 1 });
        i++;
        j++;
      }
    }
  }

  return result;
}

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ namespace: string }>;
  searchParams: Promise<{ versionA?: string; versionB?: string }>;
}) {
  const { namespace: namespaceKey } = await params;
  const { versionA, versionB } = await searchParams;

  if (!versionA || !versionB) {
    notFound();
  }

  const namespace = await prisma.schemaNamespace.findUnique({
    where: { key: namespaceKey },
  });

  if (!namespace) {
    notFound();
  }

  const [schemaA, schemaB] = await Promise.all([
    prisma.schemaDefinition.findUnique({
      where: {
        namespaceId_version: {
          namespaceId: namespace.id,
          version: versionA,
        },
      },
    }),
    prisma.schemaDefinition.findUnique({
      where: {
        namespaceId_version: {
          namespaceId: namespace.id,
          version: versionB,
        },
      },
    }),
  ]);

  if (!schemaA || !schemaB) {
    notFound();
  }

  const textA = JSON.stringify(schemaA.contentJson, null, 2);
  const textB = JSON.stringify(schemaB.contentJson, null, 2);
  const diff = computeDiff(textA, textB);

  const getDiffClassName = (type: string) => {
    if (type === 'add') return 'bg-green-900/30 text-green-100';
    if (type === 'remove') return 'bg-red-900/30 text-red-100';
    return '';
  };

  const getDiffSymbol = (type: string) => {
    if (type === 'add') return '+';
    if (type === 'remove') return '-';
    return ' ';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/namespace/${namespace.key}/schemas`}
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            &larr; Back to Schemas
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">
            Compare Versions
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Comparing {versionA} vs {versionB}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm text-gray-700">Removed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm text-gray-700">Added</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
              <span className="text-sm text-gray-700">Unchanged</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <pre className="bg-gray-900 text-gray-100 text-sm">
              {diff.map((item, index) => (
                <div
                  key={index}
                  className={`${getDiffClassName(item.type)} px-4 py-0.5 font-mono`}
                >
                  <span className="inline-block w-8 text-gray-500 select-none">
                    {getDiffSymbol(item.type)}
                  </span>
                  {item.line}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
