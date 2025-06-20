import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, API calls should go through your backend
});

export interface AIAnalysis {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  suggestedResponse?: string;
  keyTopics: string[];
  urgency: number; // 1-10 scale
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

  async analyzeEmail(emailContext: EmailContext): Promise<AIAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(emailContext);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an advanced AI email assistant for ISDC Foods. You analyze emails and provide intelligent insights, summaries, and recommendations. Always respond in JSON format with the exact structure requested.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      return JSON.parse(response) as AIAnalysis;
    } catch (error) {
      console.error('Error analyzing email:', error);
      return this.getFallbackAnalysis(emailContext);
    }
  }

  async generateResponse(emailContext: EmailContext, tone: 'professional' | 'friendly' | 'formal' = 'professional'): Promise<string> {
    try {
      const prompt = `
        Generate a ${tone} email response to the following email:
        
        Subject: ${emailContext.subject}
        From: ${emailContext.sender}
        Body: ${emailContext.body}
        
        Context: You are responding on behalf of someone at ISDC Foods. 
        Keep the response concise, relevant, and maintain the appropriate tone.
        Do not include subject line, just the email body.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a professional email assistant for ISDC Foods. Generate appropriate email responses that are clear, concise, and business-appropriate."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response at this time.';
    } catch (error) {
      console.error('Error generating response:', error);
      return 'Thank you for your email. I will review this and get back to you shortly.';
    }
  }

  async summarizeEmails(emails: EmailContext[]): Promise<string> {
    try {
      const emailSummaries = emails.map(email => 
        `From: ${email.sender}\nSubject: ${email.subject}\nBody: ${email.body.substring(0, 200)}...`
      ).join('\n\n---\n\n');

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that creates concise, actionable summaries of multiple emails. Focus on key insights, action items, and important information."
          },
          {
            role: "user",
            content: `Please provide a comprehensive summary of these emails:\n\n${emailSummaries}`
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      return completion.choices[0]?.message?.content || 'Unable to generate summary at this time.';
    } catch (error) {
      console.error('Error summarizing emails:', error);
      return 'Unable to generate summary at this time.';
    }
  }

  async chatWithAI(message: string, context?: string): Promise<string> {
    try {
      const systemPrompt = `
        You are an advanced AI assistant for ISDC Foods email management. You help with:
        - Email analysis and insights
        - Drafting responses
        - Managing email workflows
        - Business intelligence from email data
        - Scheduling and task management
        
        Be helpful, professional, and provide actionable insights.
        ${context ? `\n\nCurrent context: ${context}` : ''}
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I was unable to process your request at this time.';
    } catch (error) {
      console.error('Error in AI chat:', error);
      return 'I apologize, but I was unable to process your request at this time. Please try again.';
    }
  }

  private buildAnalysisPrompt(emailContext: EmailContext): string {
    return `
      Analyze this email and provide insights in the following JSON format:
      {
        "summary": "Brief 2-3 sentence summary",
        "sentiment": "positive|negative|neutral",
        "priority": "high|medium|low",
        "actionItems": ["action1", "action2"],
        "suggestedResponse": "Brief suggested response if needed",
        "keyTopics": ["topic1", "topic2"],
        "urgency": 5
      }
      
      Email to analyze:
      Subject: ${emailContext.subject}
      From: ${emailContext.sender}
      Body: ${emailContext.body}
      Date: ${emailContext.timestamp.toISOString()}
    `;
  }

  private getFallbackAnalysis(emailContext: EmailContext): AIAnalysis {
    return {
      summary: `Email from ${emailContext.sender} regarding ${emailContext.subject}`,
      sentiment: 'neutral',
      priority: 'medium',
      actionItems: ['Review email content', 'Determine appropriate response'],
      keyTopics: ['General correspondence'],
      urgency: 5
    };
  }
}

export const aiAssistant = AIEmailAssistant.getInstance();