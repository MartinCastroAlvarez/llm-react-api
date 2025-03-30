import { FC, ReactElement } from 'react';
import { AnalysisResponse } from '../Model';

interface DetailsProps {
  analysis: AnalysisResponse;
}

export const Details: FC<DetailsProps> = ({ analysis }): ReactElement => {
  if (analysis.status === 'downloading') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-60" />
          <span className="ml-3 text-gray-70">Processing book...</span>
        </div>
      </div>
    );
  }

  if (analysis.status === 'processing') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="space-y-4">
          {analysis.quotes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-90 mb-4">Preliminary Quotes</h3>
              <div className="space-y-3">
                {analysis.quotes.map((quote, index) => (
                  <div key={index} className="p-3 bg-gray-5 rounded-lg border border-gray-20">
                    <p className="text-gray-90">{quote.text}</p>
                    <p className="text-sm text-gray-60 mt-2">- {quote.characterName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analysis?.quotes?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-xl font-semibold text-gray-90 mb-4">Character Quotes</h3>
          <div className="space-y-3">
            {analysis.quotes.map((quote, index) => (
              <div key={index} className="p-3 bg-gray-5 rounded-lg border border-gray-20">
                <p className="text-gray-90">{quote.text}</p>
                <p className="text-sm text-gray-60 mt-2">- {quote.characterName}</p>
                <div className="mt-2 h-1 bg-gray-20 rounded">
                  <div
                    className="h-full bg-blue-60 rounded"
                    style={{ width: `${quote.sentiment}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis?.graph && analysis?.graph?.nodes?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-xl font-semibold text-gray-90 mb-4">Character Interactions</h3>
          <div className="p-3 bg-gray-5 rounded-lg border border-gray-20">
            <p className="text-gray-60">
              {analysis?.graph?.nodes?.length} characters with {analysis?.graph?.edges?.length}{' '}
              interactions
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
