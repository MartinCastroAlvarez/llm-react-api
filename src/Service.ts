import { AnalysisResponse, JobResponse } from './Model';

const API_URL = 'https://gmyb98n6d5.execute-api.us-west-2.amazonaws.com/prod';

export const submitBook = async (bookId: string): Promise<JobResponse> => {
  const response = await fetch(`${API_URL}/books/${bookId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to submit book');
  }

  return response.json();
};

export const getBookAnalysis = async (bookId: string): Promise<AnalysisResponse> => {
  const response = await fetch(`${API_URL}/books/${bookId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get book analysis');
  }

  return response.json();
};
