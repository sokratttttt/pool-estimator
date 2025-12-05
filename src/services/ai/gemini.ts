import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerativeModel } from '@google/generative-ai';
import { AI_PROMPTS } from './prompts';

// Interfaces
export interface AIRequest {
  agent: keyof typeof AI_PROMPTS;
  data: unknown;
  context?: unknown;
  mock?: boolean;
}

export interface AIResponse {
  success: boolean;
  data?: unknown;
  text?: string;
  error?: string;
  timestamp: string;
}

// Configuration
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Main AI Service Class
 */
class AIService {
  public model: GenerativeModel | null = null;

  constructor() {
    if (API_KEY) {
      this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  /**
   * Main entry point for AI requests
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    try {
      // 1. Check for mock mode or missing key
      if (request.mock || !API_KEY) {
        return this.getMockResponse(request);
      }

      // 2. Prepare Prompt
      const promptConfig = AI_PROMPTS[request.agent];
      if (!promptConfig) {
        throw new Error(`Unknown agent: ${request.agent}`);
      }

      const userContent = promptConfig.userTemplate(request.data as any, request.context);
      const fullPrompt = `${promptConfig.system}\n\n---\n\n${userContent}`;

      // 3. Call API
      if (!this.model) {
        throw new Error('AI Model not initialized');
      }
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // 4. Parse JSON if needed (for estimator agent)
      if (request.agent === 'estimator') {
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : text;
          const jsonData = JSON.parse(jsonStr);
          return {
            success: true,
            data: jsonData,
            timestamp: new Date().toISOString()
          };
        } catch (e) {
          console.warn('[AI Service] Failed to parse JSON, returning raw text', e);
          return {
            success: true,
            text: text,
            timestamp: new Date().toISOString()
          };
        }
      }

      return {
        success: true,
        text: text,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('[AI Service Error]', error);
      return {
        success: false,
        error: error.message || 'Unknown AI Error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Mock Responses for testing without API Cost
   */
  private async getMockResponse(request: AIRequest): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 2500));

    if (request.agent === 'estimator') {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          analysis: {
            risk_level: "medium",
            estimated_margin: "22%",
            potential_savings: "128 000 ₽",
            time_to_complete: "45 days"
          },
          issues: [
            {
              type: "optimization",
              severity: "warning",
              description: "Избыточная мощность циркуляционного насоса (34 м³/ч вместо 22 м³/ч).",
              location: "Оборудование / Фильтрация",
              recommendation: "Заменить насос 2.2 кВт на 1.1 кВт",
              impact: "-45 000 ₽"
            },
            {
              type: "safety",
              severity: "critical",
              description: "Не заложена химия для первого запуска.",
              location: "Химия",
              recommendation: "Добавить 'Быстрый хлор' и 'pH-минус'",
              impact: "+5 000 ₽"
            }
          ],
          optimization_suggestions: [
            {
              suggestion: "Замена фильтра на отечественный аналог",
              reason: "Импортный фильтр можно заменить на 'Аквасектор' без потери качества",
              savings: "32 000 ₽",
              implementation: "Каталог > Фильтры > Россия"
            }
          ],
          validation_checks: {
            geometry_ok: true,
            materials_compatible: true,
            regional_coefficient_applied: false,
            seasonal_adjustment_needed: true
          }
        }
      };
    }

    if (request.agent === 'catalog') {
      const parts = [
        `**🔍 Найдены аналоги для: ${request.data}**`,
        '',
        '### 🥇 Лучший вариант',
        ' - **Название:** Kripsol Koral KS-100',
        ' - **Цена:** 32 000 ₽',
        ' - **Плюсы:** Надежный, тихий, в наличии.',
        '',
        '### 🥈 Бюджетный вариант',
        ' - **Название:** Aquaviva LX STP 100',
        ' - **Цена:** 18 500 ₽',
        '',
        '### 🥉 Премиум вариант',
        ' - **Название:** Speck Badu Magic II',
        ' - **Цена:** 45 000 ₽'
      ];

      return {
        success: true,
        timestamp: new Date().toISOString(),
        text: parts.join('\n')
      };
    }

    return {
      success: true,
      text: "MOCK RESPONSE: AI Service is ready but running in mock mode.",
      timestamp: new Date().toISOString()
    };
  }
}

export const aiService = new AIService();
