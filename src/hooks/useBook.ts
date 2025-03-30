import { useState, useEffect } from 'react';
import { submitBook, getBookAnalysis } from '../Service';
import { AnalysisResponse, BookMetadata } from '../Model';

interface UseBookResult {
  analysis: AnalysisResponse | null;
  metadata: BookMetadata | null;
  error: string | null;
  isLoading: boolean;
}

export const useBook = (bookId: string | null): UseBookResult => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [metadata, setMetadata] = useState<BookMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear previous state when bookId changes
    setAnalysis(null);
    setMetadata(null);
    setError(null);
    setIsLoading(false);

    // Clear existing interval
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }

    if (!bookId?.trim()) {
      return;
    }

    const startAnalysis = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await submitBook(bookId);
        setMetadata(response.metadata);

        // Start polling
        const interval = setInterval(async () => {
          try {
            const result = await getBookAnalysis(bookId);
            setAnalysis(result);

            if (result.status === 'processed') {
              clearInterval(interval);
              setPollInterval(null);
            }
          } catch (err) {
            clearInterval(interval);
            setPollInterval(null);
            setError('Failed to get analysis results');
          }
        }, 2000);

        setPollInterval(interval);
      } catch (err) {
        setError('Failed to submit book');
      } finally {
        setIsLoading(false);
      }
    };

    startAnalysis();

    // Cleanup on unmount or bookId change
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [bookId]);

  return { analysis, metadata, error, isLoading };
};
