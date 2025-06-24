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
            content: `You are the AI Email Assistant for Vertex Vista. Your job is to analyze incoming emails and return a clear JSON with: summary, sentiment, priority, key topics, action items, urgency (1–10), and a suggested reply. Respond only in valid JSON.`,
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

Reply on behalf of a team member at Vertex Vista. Keep it short, polite, and relevant. No need for subject line.
      `;
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are the AI Email Assistant for Vertex Vista. Your job is to write short, polite, and relevant email replies with a professional tone.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 'Unable to generate reply.';
    } catch (err) {
      console.error('Error generating response:', err);
      return 'Thank you for your email. I’ll follow up shortly.';
    }
  }

  async summarizeEmails(emails: EmailContext[]): Promise<string> {
    try {
      const summaryString = emails
        .map(
          (e) =>
            `From: ${e.sender}\nSubject: ${e.subject}\nBody: ${e.body.substring(0, 200)}...`
        )
        .join('\n\n---\n\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are the AI Email Assistant for Vertex Vista. Your task is to give a short, sharp summary of unread emails: highlight important senders, urgent topics, or action items. Be concise.',
          },
          {
            role: 'user',
            content: `Summarize these unread emails:\n\n${summaryString}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 800,
      });

      return completion.choices[0]?.message?.content || 'No summary generated.';
    } catch (err) {
      console.error('Error summarizing emails:', err);
      return 'Unable to generate summary.';
    }
  }

  async chatWithAI(message: string, context?: string): Promise<string> {
    try {
      const systemPrompt = `
SYSTEM PROMPT – Vertex Vista AI Email Assistant

You are the AI Email Assistant for Vertex Vista, a high-performance AI automation agency. You live inside the user's inbox. Your job is to help them move faster and smarter through daily email tasks without sounding robotic.

CORE PURPOSE:
Respond like a smart, helpful executive assistant who:

Summarizes emails clearly in bullet points

Drafts concise replies (no essays, no fluff)

Highlights urgent emails or actions

Extracts tasks, deadlines, and scheduling needs

Spots patterns, blockers, or valuable business insights in conversations

PERSONALITY & TONE:

Friendly but professional

Calm, clear, helpful

Conversational — like texting a smart colleague

Confident, not overly formal or timid

Use plain language — avoid buzzwords and excessive pleasantries
REPLY WRITING STYLE:

Mirror sender tone when helpful (friendly, casual, sharp)

Keep replies to 3–5 short sentences max

Assume the user wants to move fast

If unsure how to reply, suggest 2–3 options in bullet format

BOUNDARIES:

Don’t repeat the full contents of an email unless asked

Never apologize unless it’s part of a drafted reply

Don’t speculate — ask for clarification if necessary

Don’t overthink – clarity over cleverness

EXAMPLES:

Draft Reply Style
"Sounds good — happy to move forward. Just let me know what you need from our end.
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

      return completion.choices[0]?.message?.content || 'No answer generated.';
    } catch (err) {
      console.error('Error in AI chat:', err);
      return 'Sorry, I wasn’t able to help with that just now.';
    }
  }

  private buildAnalysisPrompt(email: EmailContext): string {
    return `
Analyze the email below and return a response in this JSON format:
{
  "summary": "",
  "sentiment": "positive|neutral|negative",
  "priority": "high|medium|low",
  "actionItems": [],
  "suggestedResponse": "",
  "keyTopics": [],
  "urgency": 5
}

Email:
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
}

export const aiAssistant = AIEmailAssistant.getInstance();
