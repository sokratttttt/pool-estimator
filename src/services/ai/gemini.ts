/**
 * AI Service Client
 * Безопасный клиент для вызова AI через серверный API route
 * Все вызовы Google Gemini происходят на сервере
 */

// Типы для AI запросов
export interface AIRequest {
  agent: 'estimator' | 'catalog' | 'sales' | 'engineer';
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

/**
 * AI Service — клиентская обёртка над серверным API
 */
class AIService {
  private baseUrl = '/api/ai/generate';

  /**
   * Основной метод для AI запросов
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    try {
      // Если включён mock режим — возвращаем локальный мок
      if (request.mock) {
        return this.getMockResponse(request);
      }

      // Вызов серверного API
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent: request.agent,
          data: request.data,
          context: request.context,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[AI Service Error]', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI Error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Локальные мок-ответы для тестирования без сервера
   */
  private async getMockResponse(request: AIRequest): Promise<AIResponse> {
    // Имитация задержки сети
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (request.agent === 'estimator') {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          analysis: {
            risk_level: 'medium',
            estimated_margin: '22%',
            potential_savings: '128 000 ₽',
            time_to_complete: '45 days',
          },
          issues: [
            {
              type: 'optimization',
              severity: 'warning',
              description: 'Избыточная мощность циркуляционного насоса (34 м³/ч вместо 22 м³/ч).',
              location: 'Оборудование / Фильтрация',
              recommendation: 'Заменить насос 2.2 кВт на 1.1 кВт',
              impact: '-45 000 ₽',
            },
            {
              type: 'safety',
              severity: 'critical',
              description: 'Не заложена химия для первого запуска.',
              location: 'Химия',
              recommendation: "Добавить 'Быстрый хлор' и 'pH-минус'",
              impact: '+5 000 ₽',
            },
          ],
          optimization_suggestions: [
            {
              suggestion: 'Замена фильтра на отечественный аналог',
              reason: "Импортный фильтр можно заменить на 'Аквасектор' без потери качества",
              savings: '32 000 ₽',
              implementation: 'Каталог > Фильтры > Россия',
            },
          ],
          validation_checks: {
            geometry_ok: true,
            materials_compatible: true,
            regional_coefficient_applied: false,
            seasonal_adjustment_needed: true,
          },
        },
      };
    }

    if (request.agent === 'catalog') {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        text: `**🔍 Найдены аналоги для: ${request.data}**

### 🥇 Лучший вариант
- **Название:** Kripsol Koral KS-100
- **Цена:** 32 000 ₽
- **Плюсы:** Надежный, тихий, в наличии.

### 🥈 Бюджетный вариант
- **Название:** Aquaviva LX STP 100
- **Цена:** 18 500 ₽

### 🥉 Премиум вариант
- **Название:** Speck Badu Magic II
- **Цена:** 45 000 ₽`,
      };
    }

    if (request.agent === 'sales') {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        text: `Уважаемый клиент!

Рады представить вам проект вашего будущего бассейна. 
Мы подобрали оптимальное решение, учитывающее все ваши пожелания.

С уважением,
Команда MOS-POOL`,
      };
    }

    return {
      success: true,
      text: 'AI сервис работает в демо-режиме.',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Проверка сметы с помощью AI
   */
  async analyzeEstimate(estimateData: unknown): Promise<AIResponse> {
    return this.processRequest({
      agent: 'estimator',
      data: estimateData,
    });
  }

  /**
   * Поиск аналогов товара
   */
  async findAnalogs(productName: string, context?: unknown): Promise<AIResponse> {
    return this.processRequest({
      agent: 'catalog',
      data: productName,
      context,
    });
  }

  /**
   * Генерация продающего текста
   */
  async generateSalesText(projectData: unknown, clientType: 'b2c' | 'b2b' = 'b2c'): Promise<AIResponse> {
    return this.processRequest({
      agent: 'sales',
      data: projectData,
      context: { type: clientType },
    });
  }

  /**
   * Консультация инженера
   */
  async askEngineer(question: string, projectContext?: unknown): Promise<AIResponse> {
    return this.processRequest({
      agent: 'engineer',
      data: question,
      context: projectContext,
    });
  }
}

// Singleton экземпляр сервиса
export const aiService = new AIService();
