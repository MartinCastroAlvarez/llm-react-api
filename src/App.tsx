import { useState, FormEvent, useEffect } from 'react';
import { Input } from './components/Input';
import { Details } from './components/Details';
import Graph from './components/Graph';
import { useBook } from './hooks/useBook';

// Add global styles
import './styles.css';

function App() {
  const [bookId, setBookId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('1787');
  const { analysis, metadata, error, isLoading } = useBook(bookId);

  // Reset bookId when there's an error to allow new requests
  useEffect(() => {
    if (error) {
      setBookId(null);
    }
  }, [error]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setBookId(inputValue);
  };

  return (
    <div className="contents">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Form and Metadata */}
        <div className="min-h-screen bg-gray-10">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-90 mb-8">Book Character Analysis</h1>

            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input value={inputValue} onChange={setInputValue} />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="px-6 py-2 bg-blue-60 text-white rounded-lg hover:bg-blue-70 disabled:bg-gray-30 disabled:cursor-not-allowed"
                >
                  Analyze
                </button>
              </div>
              {error && <p className="mt-2 text-red-60">{error}</p>}
            </form>

            {metadata && (
              <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h2 className="text-xl font-semibold text-gray-90 mb-4">Book Information</h2>
                  <div className="space-y-3 text-gray-70">
                    <p>
                      <span className="font-semibold">Author:</span> {metadata.author}
                    </p>
                    <p>
                      <span className="font-semibold">Published:</span>{' '}
                      {metadata.publicationDate || 'Unknown'}
                    </p>
                    <p>
                      <span className="font-semibold">Publisher:</span> {metadata.publisher}
                    </p>
                    <p>
                      <span className="font-semibold">Language:</span> {metadata.language}
                    </p>
                    <p>
                      <span className="font-semibold">Rights:</span> {metadata.rights}
                    </p>
                    {metadata.subjects.length > 0 && (
                      <p>
                        <span className="font-semibold">Subjects:</span>{' '}
                        {metadata.subjects.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {analysis && <Details analysis={analysis} />}
          </div>
        </div>

        {/* Right Column: Graph */}
        <div className="min-h-screen bg-gray-90 flex items-center justify-center p-8">
          {analysis?.graph && <Graph graph={analysis.graph} />}
          {metadata && !analysis && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-70 mx-auto mb-4" />
              <p className="text-gray-30">Processing book...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
