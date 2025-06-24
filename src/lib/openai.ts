import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // In production, proxy via backend
});

export interface AIAnalysis {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  suggestedResponse?: string;
  keyTopics: string[];
  urgency: number; // 1–10 scale
}

export interface EmailContext {
  subject: string;
  body: string;
  sender: string;
  timestamp: Date;
  previousEmails?: string[];
}

export class AIEmailAssistant {
  private static instance: AIEmailAssistant;

  static getInstance(): AIEmailAssistant {
    if (!AIEmailAssistant.instance) {
      AIEmailAssistant.instance = new AIEmailAssistant();
    }
    return AIEmailAssistant.instance;
  }

  async analyzeEmail(email: EmailContext): Promise<AIAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(email);
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are the AI Email Assistant for Vertex Vista. Analyze incoming emails and return only valid JSON with: summary, sentiment, priority, key topics, action items, urgency (1–10), and a suggested reply. No extra explanation.`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');
      return JSON.parse(response) as AIAnalysis;
    } catch (err) {
      console.error('Error analyzing email:', err);
      return this.getFallbackAnalysis(email);
    }
  }

  async generateResponse(
    email: EmailContext,
    tone: 'professional' | 'friendly' | 'formal' = 'professional'
  ): Promise<string> {
    try {
      const prompt = `
Generate a ${tone} email reply to:
Subject: ${email.subject}
From: ${email.sender}
Body: ${email.body}

Reply as someone from Vertex Vista. Keep it short, helpful, and clear. No subject line needed.
      `;
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are the AI Email Assistant for Vertex Vista. Draft polite and helpful replies in 3–5 clear sentences.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 500,
      });

      return this.clean(completion.choices[0]?.message?.content || 'Unable to generate reply.');
    } catch (err) {
      console.error('Error generating response:', err);
      return 'Thanks for your message — I’ll get back to you shortly.';
    }
  }

  async summarizeEmails(emails: EmailContext[]): Promise<string> {
    try {
      const summaryString = emails
        .map((e) => `From: ${e.sender}\nSubject: ${e.subject}\nBody: ${e.body.substring(0, 200)}...`)
        .join('\n\n---\n\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are the AI Email Assistant. Give a short, useful summary of unread emails. Bullet points preferred. Skip fluff.',
          },
          {
            role: 'user',
            content: `Summarize these unread emails:\n\n${summaryString}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 800,
      });

      return this.clean(completion.choices[0]?.message?.content || 'No summary generated.');
    } catch (err) {
      console.error('Error summarizing emails:', err);
      return 'Unable to generate summary.';
    }
  }

  async chatWithAI(message: string, context?: string): Promise<string> {
    try {
      const systemPrompt = `
You are the AI Email Assistant for Vertex Vista — a high-performance AI automation agency.

You help users manage their inbox faster:
- Summarize emails in bullet points
- Draft short, sharp replies
- Spot urgent or important actions
- Suggest helpful next steps
- Keep tone friendly, clear, human

Style rules:
- Replies = 3–5 sentences max
- Use bullet points when possible
- Never use *markdown* or overformatting
- Sound like a smart colleague, not a chatbot
- Skip fluff and headers — just be helpful

${context ? `Context: ${context}` : ''}
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.6,
        max_tokens: 800,
      });

      return this.clean(completion.choices[0]?.message?.content || 'No answer generated.');
    } catch (err) {
      console.error('Error in AI chat:', err);
      return 'Sorry, I wasn’t able to help with that just now.';
    }
  }

  private buildAnalysisPrompt(email: EmailContext): string {
    return `
Analyze the following email and return valid JSON with:
- summary
- sentiment
- priority
- keyTopics[]
- actionItems[]
- urgency (1–10)
- suggestedResponse

Subject: ${email.subject}
From: ${email.sender}
Body: ${email.body}
Date: ${email.timestamp.toISOString()}
    `;
  }

  private getFallbackAnalysis(email: EmailContext): AIAnalysis {
    return {
      summary: `Email from ${email.sender} about "${email.subject}"`,
      sentiment: 'neutral',
      priority: 'medium',
      actionItems: ['Review email', 'Consider response'],
      suggestedResponse: 'Thanks for the update. I’ll take a look and follow up shortly.',
      keyTopics: ['general'],
      urgency: 5,
    };
  }

  private clean(raw: string): string {
    return raw
      .replace(/\*/g, '') // remove markdown asterisks
      .replace(/^\s*[\-\•]\s?/gm, '• ') // format bullet points
      .trim();
  }
}

export const aiAssistant = AIEmailAssistant.getInstance();
