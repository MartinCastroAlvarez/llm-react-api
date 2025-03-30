/**
 * LLM prompts for analyzing character interactions in books
 */

/**
 * System prompt that sets up the context for the LLM
 */
export const SYSTEM_PROMPT = `You are a literary analyst specializing in character interaction analysis. 
Your task is to analyze the provided text and identify character interactions, relationships, and key dialogues.
Focus on meaningful interactions between characters and their emotional significance.`;

/**
 * Main analysis prompt with placeholders for book-specific information
 * {title} - Book title
 * {author} - Book author
 * {text} - Book content
 * {maxCharacters} - Maximum number of characters to identify (default: 15)
 */
export const ANALYSIS_PROMPT = `Analyze the following excerpt from "{title}" by {author}:

TEXT:
{text}

Please identify up to {maxCharacters} main characters and analyze their interactions. For each interaction:
1. Identify the characters involved
2. Assess the nature of their relationship
3. Note any significant dialogue or scenes between them
4. Evaluate the emotional tone of their interactions

Format your response as structured data that can be used to create a network graph of character relationships.`;

/**
 * Quote extraction prompt with placeholders
 * {character} - Character name
 * {text} - Book content
 */
export const QUOTE_PROMPT = `From the following text, extract meaningful quotes by or about {character}:

TEXT:
{text}

For each quote:
1. Identify who is speaking
2. Note who they are speaking about
3. Assess the sentiment (positive/negative) of the quote
4. Evaluate its significance to the story

Return only the most significant and emotionally charged quotes.`;

/**
 * Relationship strength prompt for evaluating interaction weights
 * {character1} - First character name
 * {character2} - Second character name
 * {text} - Book content
 */
export const RELATIONSHIP_PROMPT = `Analyze the relationship between {character1} and {character2} in the following text:

TEXT:
{text}

Please evaluate:
1. Frequency of interactions
2. Emotional intensity of interactions
3. Story significance of their relationship
4. Key moments or turning points

Provide a numerical score (1-100) representing the strength/significance of their relationship.`;

/**
 * Helper function to fill prompt placeholders
 */
export function fillPrompt(prompt: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (filledPrompt, [key, value]) => filledPrompt.replace(`{${key}}`, value.toString()),
    prompt
  );
}
