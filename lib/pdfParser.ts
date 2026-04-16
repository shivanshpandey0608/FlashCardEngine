// Uses pdf.js via dynamic import (avoid SSR issues)

export async function extractTextFromPDF(file: File): Promise<string> {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('File must be a PDF');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('PDF must be under 20MB');
  }

  const arrayBuffer = await file.arrayBuffer();

  const pdfjsLib = await import('pdfjs-dist');
  // Use local worker copied to /public to avoid CDN version mismatches
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch {
    throw new Error('PDF processing failed. Please try again.');
  }

  if (pdf.numPages === 0) {
    throw new Error('This PDF appears to be empty.');
  }

  const maxPages = Math.min(pdf.numPages, 50);
  const pageTexts: string[] = [];

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    /* eslint-disable-next-line */
    const text = (content.items as Array<{ str: string }>)
      .map(item => item.str)
      .join(' ');
    pageTexts.push(text);
  }

  const fullText = pageTexts.join('\n\n').trim();

  if (fullText.length < 100) {
    throw new Error(
      'This PDF has no readable text. Try a text-based PDF.'
    );
  }

  // Truncate to ~12,000 words to stay within token budget
  const words = fullText.split(/\s+/);
  return words.slice(0, 12000).join(' ');
}
