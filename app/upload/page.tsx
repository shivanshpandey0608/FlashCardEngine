'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UploadZone from '@/components/UploadZone';
import { extractTextFromPDF } from '@/lib/pdfParser';
import { createDeck, saveDeck } from '@/lib/storage';

type UploadState = 'idle' | 'extracting' | 'generating' | 'error';

function Spinner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      setErrorMessage('Please upload a PDF file.');
      setState('error');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File too large. Max 20MB.');
      setState('error');
      return;
    }

    setState('extracting');

    let text: string;
    try {
      text = await extractTextFromPDF(file);
    } catch (e: unknown) {
      setErrorMessage((e as Error).message ?? 'Failed to read PDF. Please try again.');
      setState('error');
      return;
    }

    setState('generating');

    let data: { cards: Array<{ front: string; back: string; hint?: string }> };
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, filename: file.name }),
      });
      data = await res.json();
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? 'Failed to generate cards.');
      }
    } catch (e: unknown) {
      const msg = (e as Error).message;
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setErrorMessage('Network error. Check your connection and retry.');
      } else {
        setErrorMessage(msg || 'Failed to generate cards. Please try again.');
      }
      setState('error');
      return;
    }

    const deck = createDeck(file.name, data.cards);
    try {
      saveDeck(deck);
    } catch {
      setErrorMessage('Storage unavailable — try disabling private browsing.');
      setState('error');
      return;
    }

    router.push(`/deck/${deck.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Home
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-800">Upload PDF</h1>
      </div>

      {state === 'extracting' && <Spinner text="Reading PDF..." />}
      {state === 'generating' && <Spinner text="Generating flashcards with AI..." />}

      {state === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-medium mb-4">{errorMessage}</p>
          <button
            onClick={() => setState('idle')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {state === 'idle' && (
        <>
          <p className="text-gray-500 text-sm mb-6">
            Upload any text-based PDF. AI will generate a smart flashcard deck ready for spaced repetition practice.
          </p>
          <UploadZone onFile={handleFile} />
        </>
      )}
    </div>
  );
}
