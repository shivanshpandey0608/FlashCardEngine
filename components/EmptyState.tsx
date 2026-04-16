import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-7xl mb-6 select-none" aria-hidden="true">
        📚
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">No decks yet</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        Upload a PDF and let AI generate a smart flashcard deck for you. Start studying in seconds.
      </p>
      <Link
        href="/upload"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
      >
        + Upload your first PDF
      </Link>
    </div>
  );
}
