import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * API Route для безопасных вызовов Google Gemini AI
 * Ключ API хранится только на сервере (не NEXT_PUBLIC_)
 */

// Серверный API ключ (не доступен клиенту)
const API_KEY = process.env.GEMINI_API_KEY || '';

// Промпты для разных агентов
const AI_PROMPTS = {
    estimator: {
        system: `Ты — старший инженер-сметчик строительной компании с 20-летним опытом в бассейностроении. Ты проверяешь сметы, ищешь ошибки и оптимизируешь затраты.
    
КОНТЕКСТ:
- Приложение: MOS-POOL Estimator v2.2.0 Professional
- Пользователь: инженер (сметчик-проектировщик)
- Задача: Проверить готовую смету перед отправкой клиенту

ФОРМАТ ОТВЕТА (JSON):
{
  "analysis": {
    "risk_level": "low|medium|high",
    "estimated_margin": "25%",
    "potential_savings": "85000 ₽",
    "time_to_complete": "14 days"
  },
  "issues": [
    {
      "type": "material|calculation|optimization|safety",
      "severity": "warning|error|critical",
      "description": "Описание проблемы",
      "location": "Где найдено",
      "recommendation": "Решение",
      "impact": "Экономический эффект"
    }
  ],
  "optimization_suggestions": [
    {
      "suggestion": "Что изменить",
      "reason": "Почему",
      "savings": "Экономия",
      "implementation": "Как сделать"
    }
  ],
  "validation_checks": {
    "geometry_ok": boolean,
    "materials_compatible": boolean,
    "regional_coefficient_applied": boolean,
    "seasonal_adjustment_needed": boolean
  }
}

ИНСТРУКЦИИ:
1. Проверь физическую реализуемость бассейна.
2. Сравни с типовыми решениями.
3. Найди избыточность.
4. Проверь совместимость материалов.`,
    },

    catalog: {
        system: `Ты — менеджер по закупкам крупного поставщика оборудования для бассейнов. Знаешь все аналоги и цены.

ЦЕЛЬ: Найти 3 аналога товара (Лучший, Бюджетный, Премиум).

ФОРМАТ ОТВЕТА (Markdown):
**🔍 Найдены аналоги для: {название}**

### 🥇 Лучший вариант
- **Название:** ...
- **Цена:** ...
- **Плюсы/Минусы:** ...

### 🥈 Бюджетный вариант
...

### 🥉 Премиум вариант
...

ПРАВИЛА:
1. Приоритет: совместимость -> цена -> наличие.
2. Учитывай тип бассейна (частный/общественный).`,
    },

    sales: {
        system: `Ты — маркетолог и переговорщик в сфере премиальных бассейнов. Ты составляешь КП.

ЦЕЛЬ: Написать убедительное сопроводительное письмо к смете.

ФОРМАТ:
- Эмоциональный (для частников): акцент на семью, отдых, здоровье.
- Рациональный (для бизнеса): акцент на окупаемость, надежность, цифры.`,
    },

    engineer: {
        system: `Ты — инженер-гидравлик и химик. Решаешь нестандартные задачи по бассейнам.

ФОРМАТ ОТВЕТА:
### 🎯 Проблема
### 📐 Данные
### 🛠️ Решение (пошагово)
### ⚠️ Риски`,
    },
};

type AgentType = keyof typeof AI_PROMPTS;

interface AIRequestBody {
    agent: AgentType;
    data: unknown;
    context?: unknown;
}

// Мок-ответы для тестирования без API
function getMockResponse(agent: AgentType, data: unknown) {
    if (agent === 'estimator') {
        return {
            success: true,
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
                        description: 'Избыточная мощность циркуляционного насоса.',
                        location: 'Оборудование / Фильтрация',
                        recommendation: 'Заменить насос 2.2 кВт на 1.1 кВт',
                        impact: '-45 000 ₽',
                    },
                ],
                optimization_suggestions: [
                    {
                        suggestion: 'Замена фильтра на отечественный аналог',
                        reason: 'Импортный фильтр можно заменить без потери качества',
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
            timestamp: new Date().toISOString(),
        };
    }

    if (agent === 'catalog') {
        return {
            success: true,
            text: `**🔍 Найдены аналоги для: ${data}**

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
            timestamp: new Date().toISOString(),
        };
    }

    return {
        success: true,
        text: 'AI сервис работает в демо-режиме.',
        timestamp: new Date().toISOString(),
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: AIRequestBody = await request.json();

        // Валидация входных данных
        if (!body.agent || !AI_PROMPTS[body.agent]) {
            return NextResponse.json(
                { success: false, error: 'Invalid agent type' },
                { status: 400 }
            );
        }

        // Если нет API ключа — возвращаем мок
        if (!API_KEY) {
            console.warn('[AI API] No GEMINI_API_KEY, returning mock response');
            const mockResponse = getMockResponse(body.agent, body.data);
            return NextResponse.json(mockResponse);
        }

        // Инициализация Gemini
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Подготовка промпта
        const promptConfig = AI_PROMPTS[body.agent];
        const userContent =
            body.agent === 'estimator'
                ? `ВХОДНЫЕ ДАННЫЕ СМЕТЫ: ${JSON.stringify(body.data, null, 2)}`
                : body.agent === 'catalog'
                    ? `ТОВАР ДЛЯ ПОИСКА АНАЛОГОВ: ${body.data}\nКОНТЕКСТ: ${JSON.stringify(body.context)}`
                    : body.agent === 'sales'
                        ? `ТИП КЛИЕНТА: ${(body.context as { type?: string })?.type || 'b2c'}\nДАННЫЕ ПРОЕКТА: ${JSON.stringify(body.data)}`
                        : `ВОПРОС: ${body.data}\nКОНТЕКСТ ПРОЕКТА: ${JSON.stringify(body.context)}`;

        const fullPrompt = `${promptConfig.system}\n\n---\n\n${userContent}`;

        // Вызов API
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Парсинг JSON для estimator агента
        if (body.agent === 'estimator') {
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : text;
                const jsonData = JSON.parse(jsonStr);
                return NextResponse.json({
                    success: true,
                    data: jsonData,
                    timestamp: new Date().toISOString(),
                });
            } catch {
                return NextResponse.json({
                    success: true,
                    text: text,
                    timestamp: new Date().toISOString(),
                });
            }
        }

        return NextResponse.json({
            success: true,
            text: text,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[AI API Error]', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
