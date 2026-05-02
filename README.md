Flashcard Engine — Project Write-Up
What I Built and Which Problem I Picked
I built Flashcard Engine — a web app that lets you upload any educational PDF and instantly receive an AI-generated flashcard deck, which you then practice using a spaced repetition algorithm (SM-2).
The problem: studying from PDFs is passive. You read, highlight, maybe re-read — but passive review has poor long-term retention. The research-backed solution is active recall combined with spaced repetition: testing yourself on material at increasing intervals, prioritizing cards you struggle with.
Tools like Anki implement this well, but creating flashcards manually is tedious and becomes a barrier that most students skip. My goal was to eliminate that friction entirely — upload a PDF and get a ready-to-study deck in under 30 seconds.

Key Decisions and Tradeoffs
1. No database, no auth — localStorage only
I chose to store all deck and progress data in the browser's localStorage instead of using a backend database. This keeps the architecture extremely simple (one API route, zero infrastructure), makes deployment trivial, and ensures near-zero latency for reads.
The tradeoff is that data is device-specific and can be lost if the user clears browser storage. For a study tool primarily used on one device, this is acceptable at this stage.

2. Client-side PDF parsing with pdfjs-dist
PDF text extraction happens entirely in the browser using pdf.js, not on the server. This avoids sending raw file bytes to the backend, keeps the API lightweight, and removes file size handling concerns server-side.
The tradeoff is that large PDFs can temporarily block the browser thread. I mitigated this by:
Capping extraction at 50 pages
Truncating input to 12,000 words before sending it to the AI

3. OpenAI only on the server (API route proxy)
The OpenAI API call is proxied through a Next.js API route so the API key is never exposed to the client.
The client only sends extracted text and receives structured flashcard JSON. This is a strict security decision — exposing API keys on the frontend is not acceptable.

4. gpt-4o-mini over gpt-4o
I chose gpt-4o-mini for flashcard generation because it is significantly faster and cheaper.
Flashcard creation is primarily structured extraction and reformatting, not deep reasoning. In testing, the quality difference compared to larger models was negligible, while cost savings were substantial — especially important when users can upload arbitrary PDFs.

5. SM-2 algorithm over a simpler scheduler
I implemented the SM-2 algorithm (used by Anki), including:
Ease factor adjustments
Interval scaling
4-point rating system (Again / Hard / Good / Easy)
A simpler right/wrong scheduler would have been easier to build, but it would compromise learning effectiveness. Since the core value of the app is retention, using a proven algorithm was essential.

What I’d Improve or Add With More Time
Sync across devices
 Add a backend (e.g., Supabase or PlanetScale) with optional accounts so users can access decks across devices.
Card editing
 Allow users to modify AI-generated cards, delete poor ones, and add custom cards.
Deck import/export
 Enable exporting decks as JSON/CSV and importing them elsewhere.
Image-heavy PDF support
 Add OCR (e.g., Tesseract.js or an API) to handle scanned/image-based PDFs.
Session analytics
 Track retention rates, streaks, and highlight frequently failed cards.
Markdown support
 Improve rendering of formulas, code, and structured content in card backs.

Interesting Challenges and How I Solved Them
Challenge: "Again" cards not reappearing correctly
The practice session used two queues:
Main queue
"Again" queue
When a card was rated "Again", it was appended to the second queue, but the UI continued iterating through the main queue first. As a result, failed cards only reappeared at the very end.
Solution:
 Replaced the dual-queue system with a single activeQueue. When a card is rated "Again", it is appended directly to the same array. Since the pointer (currentIndex) always moves forward, the behavior remains consistent and predictable.

