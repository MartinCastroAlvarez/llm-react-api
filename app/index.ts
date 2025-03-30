import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getMetadata, getBook } from './gutenberg';
import OpenAI from 'openai';
import { SYSTEM_PROMPT, ANALYSIS_PROMPT, fillPrompt } from './prompts';
import { generateProcessingGraph, generateRandomGraph } from './random';
import { AnalysisResponse } from './types';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

/**
 * Handles GET requests by returning a random analysis state
 */
async function handleGet(): Promise<APIGatewayProxyResult> {
  const random = Math.random();
  let responseBody: AnalysisResponse;

  if (random < 0.65) {
    responseBody = generateProcessingGraph();
  } else if (random < 0.95) {
    responseBody = {
      status: 'processing',
      graph: { nodes: [], edges: [] },
      quotes: [],
    };
  } else {
    responseBody = generateRandomGraph();
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(responseBody),
  };
}

/**
 * Handles POST requests by processing a book and returning analysis
 */
async function handlePost(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const bookId = event.pathParameters?.bookId;

  if (!bookId || isNaN(parseInt(bookId))) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: 'Invalid book ID',
      }),
    };
  }

  try {
    // Fetch book metadata and content
    const [metadata, content] = await Promise.all([
      getMetadata(parseInt(bookId)),
      getBook(parseInt(bookId)),
    ]);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      // Prepare the analysis prompt
      const filledPrompt = fillPrompt(ANALYSIS_PROMPT, {
        title: metadata.title,
        author: metadata.author,
        text: content.slice(0, 1000), // Use first 1000 chars for demo
        maxCharacters: 15,
      });

      // Make the API call
      await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: filledPrompt },
        ],
        temperature: 0.7,
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          jobId: Math.floor(Math.random() * 1000000),
          metadata,
        }),
      };
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      // Still return success with jobId, just log the error
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          jobId: Math.floor(Math.random() * 1000000),
          metadata,
          warning: 'Analysis started but may be delayed',
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: 'Book not found or error fetching metadata',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * Returns a 405 Method Not Allowed response
 */
function handleMethodNotAllowed(): APIGatewayProxyResult {
  return {
    statusCode: 405,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      message: 'Method not allowed',
    }),
  };
}

/**
 * Returns a 500 Internal Server Error response
 */
function handleInternalError(error: unknown): APIGatewayProxyResult {
  return {
    statusCode: 500,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }),
  };
}

/**
 * Main Lambda handler function
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    switch (event.httpMethod) {
      case 'GET':
        return await handleGet();
      case 'POST':
        return await handlePost(event);
      default:
        return handleMethodNotAllowed();
    }
  } catch (error) {
    return handleInternalError(error);
  }
};
