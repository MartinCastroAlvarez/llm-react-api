import OpenAI from 'openai';

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function ask(conversation: Message[]): Promise<Message> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversation,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message;

    return {
      role: 'assistant',
      content: response.content || 'No response generated',
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Failed to get response from OpenAI');
  }
}
