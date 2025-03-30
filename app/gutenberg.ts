/**
 * Utility functions for downloading and processing Project Gutenberg e-books
 */

const GUTENBERG_MIRROR = 'https://www.gutenberg.org/files';
const GUTENBERG_CACHE: Record<number, string> = {};
const GUTENBERG_RDF_MIRROR = 'https://www.gutenberg.org/cache/epub';
const GUTENBERG_DIRECT = 'https://www.gutenberg.org/ebooks';

interface BookMetadata {
  title: string;
  author: string;
  language: string;
  publisher: string;
  publicationDate?: string;
  rights: string;
  subjects: string[];
}

/**
 * Try different URL patterns to download a book
 */
async function tryDownloadPatterns(bookId: number): Promise<string> {
  const patterns = [
    // Standard pattern
    `${GUTENBERG_MIRROR}/${bookId}/${bookId}-0.txt`,
    // Alternative pattern without -0
    `${GUTENBERG_MIRROR}/${bookId}/${bookId}.txt`,
    // Direct download pattern
    `${GUTENBERG_DIRECT}/${bookId}.txt.utf-8`,
    // Nested pattern
    `${GUTENBERG_MIRROR}/${bookId}/pg${bookId}.txt`,
  ];

  let lastError: Error | null = null;

  for (const url of patterns) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      lastError = error as Error;
      console.warn(`Failed to download from ${url}:`, error);
      continue;
    }
  }

  throw lastError || new Error(`Failed to download book ${bookId} from any source`);
}

/**
 * Downloads a book from Project Gutenberg by its ID
 * @param bookId - The Project Gutenberg book ID
 * @returns Promise containing the book text
 */
export async function downloadBook(bookId: number): Promise<string> {
  // Check cache first
  if (GUTENBERG_CACHE[bookId]) {
    return GUTENBERG_CACHE[bookId];
  }

  try {
    const text = await tryDownloadPatterns(bookId);

    // Cache the result
    GUTENBERG_CACHE[bookId] = text;

    return text;
  } catch (error) {
    console.error(`Error downloading book ${bookId}:`, error);
    // Return empty content instead of throwing
    return '';
  }
}

/**
 * Cleans the downloaded text by removing Project Gutenberg headers and footers
 * @param text - Raw book text
 * @returns Cleaned book text
 */
export function cleanBookText(text: string): string {
  if (!text) return '';

  // Find the start of the actual book content
  const startMarkers = [
    '*** START OF THIS PROJECT GUTENBERG',
    '*** START OF THE PROJECT GUTENBERG',
    '*END*THE SMALL PRINT',
    'This etext was prepared by',
  ];
  const endMarkers = [
    '*** END OF THIS PROJECT GUTENBERG',
    '*** END OF THE PROJECT GUTENBERG',
    'End of Project Gutenberg',
    'End of the Project Gutenberg',
  ];

  let startIndex = -1;
  let endIndex = text.length;

  // Find the first occurrence of any start marker
  for (const marker of startMarkers) {
    const index = text.indexOf(marker);
    if (index !== -1) {
      startIndex = text.indexOf('\n', index) + 1;
      break;
    }
  }

  // Find the first occurrence of any end marker
  for (const marker of endMarkers) {
    const index = text.indexOf(marker);
    if (index !== -1) {
      endIndex = index;
      break;
    }
  }

  // Extract the content between markers
  if (startIndex !== -1 && endIndex !== -1) {
    return text.slice(startIndex, endIndex).trim();
  }

  // If markers aren't found, return the original text
  return text.trim();
}

/**
 * Downloads and cleans a book from Project Gutenberg
 * @param bookId - The Project Gutenberg book ID
 * @returns Promise containing the cleaned book text
 */
export async function getBook(bookId: number): Promise<string> {
  const rawText = await downloadBook(bookId);
  return cleanBookText(rawText);
}

/**
 * Simple XML parsing using regex for metadata extraction
 * Note: This is a simplified parser for demonstration. For production, use a proper XML parser.
 */
function extractXmlValue(xml: string, tag: string): string {
  const match = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`).exec(xml);
  return match?.[1]?.trim() || '';
}

function extractXmlValues(xml: string, tag: string): string[] {
  const matches = xml.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'g')) || [];
  return matches
    .map((match) => {
      const value = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`).exec(match);
      return value?.[1]?.trim() || '';
    })
    .filter(Boolean);
}

/**
 * Downloads and parses book metadata from Project Gutenberg
 * @param bookId - The Project Gutenberg book ID
 * @returns Promise containing the book metadata
 */
export async function getMetadata(bookId: number): Promise<BookMetadata> {
  try {
    const url = `${GUTENBERG_RDF_MIRROR}/${bookId}/pg${bookId}.rdf`;
    const response = await fetch(url);

    if (!response.ok) {
      // Return default metadata if RDF not found
      return {
        title: `Book #${bookId}`,
        author: 'Unknown Author',
        language: 'en',
        publisher: 'Project Gutenberg',
        rights: 'Public domain',
        subjects: [],
      };
    }

    const text = await response.text();

    return {
      title: extractXmlValue(text, 'dcterms:title') || `Book #${bookId}`,
      author: extractXmlValue(text, 'pgterms:name') || 'Unknown Author',
      language: extractXmlValue(text, 'dcterms:language') || 'en',
      publisher: extractXmlValue(text, 'dcterms:publisher') || 'Project Gutenberg',
      publicationDate: extractXmlValue(text, 'dcterms:issued'),
      rights: extractXmlValue(text, 'dcterms:rights') || 'Public domain',
      subjects: extractXmlValues(text, 'dcterms:subject'),
    };
  } catch (error) {
    console.error(`Error downloading metadata for book ${bookId}:`, error);
    // Return default metadata instead of throwing
    return {
      title: `Book #${bookId}`,
      author: 'Unknown Author',
      language: 'en',
      publisher: 'Project Gutenberg',
      rights: 'Public domain',
      subjects: [],
    };
  }
}

/**
 * Downloads both the book content and metadata
 * @param bookId - The Project Gutenberg book ID
 * @returns Promise containing both book content and metadata
 */
export async function getBookWithMetadata(
  bookId: number
): Promise<{ content: string; metadata: BookMetadata }> {
  const [content, metadata] = await Promise.all([getBook(bookId), getMetadata(bookId)]);
  return { content, metadata };
}
