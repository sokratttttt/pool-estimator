// Contract Generator - Template-based contract generation

const CONTRACT_TEMPLATE = `
ДОГОВОР № {contractNumber}
на выполнение работ по строительству бассейна

г. Москва                                                    {date}

{companyName}, именуемое в дальнейшем "ПОДРЯДЧИК", с одной стороны, и 
{clientName}, именуемый в дальнейшем "ЗАКАЗЧИК", с другой стороны,
заключили настоящий Договор о нижеследующем:

1. ПРЕДМЕТ ДОГОВОРА

1.1. ПОДРЯДЧИК обязуется по заданию ЗАКАЗЧИКА выполнить работы по 
строительству бассейна со следующими характеристиками:

{poolSpecifications}

1.2. Работы выполняются на объекте ЗАКАЗЧИКА по адресу: {address}

2. СТОИМОСТЬ РАБОТ И ПОРЯДОК РАСЧЕТОВ

2.1. Общая стоимость работ составляет: {totalCost} ({totalCostWords}) рублей.

2.2. Детальная смета работ приведена в Приложении №1 к настоящему Договору.

2.3. Оплата производится в следующем порядке:
{paymentSchedule}

3. СРОКИ ВЫПОЛНЕНИЯ РАБОТ

3.1. Срок выполнения работ: {timeline}

3.2. Этапы выполнения работ:
{workStages}

4. ГАРАНТИИ

4.1. ПОДРЯДЧИК гарантирует качество выполненных работ в течение {warrantyPeriod}.

4.2. Гарантия не распространяется на:
- Повреждения, возникшие в результате неправильной эксплуатации
- Естественный износ оборудования
- Повреждения, вызванные форс-мажорными обстоятельствами

5. ОТВЕТСТВЕННОСТЬ СТОРОН

5.1. За нарушение сроков выполнения работ ПОДРЯДЧИК выплачивает пени 
в размере 0.1% от стоимости работ за каждый день просрочки.

5.2. За просрочку оплаты ЗАКАЗЧИК выплачивает пени в размере 0.1% 
от суммы просроченного платежа за каждый день просрочки.

6. ПРОЧИЕ УСЛОВИЯ

6.1. Настоящий Договор вступает в силу с момента подписания и действует 
до полного выполнения сторонами своих обязательств.

6.2. Все изменения и дополнения к настоящему Договору оформляются 
в письменном виде и подписываются обеими сторонами.

7. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН

ПОДРЯДЧИК:                          ЗАКАЗЧИК:
{companyDetails}                    {clientDetails}

________________________            ________________________
{companyDirector}                   {clientName}
`;

/**
 * Generate contract from estimate data
 */
export function generateContract(estimate, clientInfo, options = {}) {
    const contractData = prepareContractData(estimate, clientInfo, options);
    const contract = fillContractTemplate(contractData);

    return {
        html: contract,
        number: contractData.contractNumber,
        date: contractData.date,
        totalCost: contractData.totalCost
    };
}

function prepareContractData(estimate, clientInfo, options) {
    const contractNumber = options.contractNumber || generateContractNumber();
    const date = new Date().toLocaleDateString('ru-RU');

    // Pool specifications
    const specs = [
        `- Тип бассейна: ${estimate.material || 'Стандартный'}`,
        `- Размеры: ${estimate.length}м x ${estimate.width}м x ${estimate.depth}м`,
        `- Объем: ${((estimate.length || 0) * (estimate.width || 0) * (estimate.depth || 0)).toFixed(1)}м³`,
    ];

    if (estimate.selectedWorks && estimate.selectedWorks.length > 0) {
        specs.push('- Дополнительное оборудование:');
        estimate.selectedWorks.forEach(work => {
            specs.push(`  • ${work.name}`);
        });
    }

    // Payment schedule
    const totalCost = estimate.total || 0;
    const paymentSchedule = generatePaymentSchedule(totalCost, options.paymentTerms);

    // Work stages timeline
    const timeline = calculateTimeline(estimate);
    const workStages = generateWorkStages(estimate, timeline);

    return {
        contractNumber,
        date,
        companyName: options.companyName || 'ООО "Пул Эстимейтор"',
        companyDirector: options.companyDirector || 'Генеральный директор',
        companyDetails: options.companyDetails || formatCompanyDetails(options),
        clientName: clientInfo.name || 'Клиент',
        clientDetails: formatClientDetails(clientInfo),
        address: clientInfo.address || 'Адрес не указан',
        poolSpecifications: specs.join('\n'),
        totalCost: totalCost.toLocaleString('ru-RU'),
        totalCostWords: numberToWords(totalCost),
        paymentSchedule,
        timeline: `${timeline.weeks} недель с момента внесения предоплаты`,
        workStages,
        warrantyPeriod: options.warrantyPeriod || '24 месяца'
    };
}

function fillContractTemplate(data) {
    let contract = CONTRACT_TEMPLATE;

    Object.keys(data).forEach(key => {
        const placeholder = `{${key}}`;
        contract = contract.replace(new RegExp(placeholder, 'g'), data[key]);
    });

    return contract;
}

function generateContractNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');

    return `${year}${month}${day}-${random}`;
}

function generatePaymentSchedule(totalCost, terms) {
    if (terms === 'full') {
        return '- 100% оплата до начала работ';
    }

    // Default: 50/30/20 schedule
    const prepayment = Math.round(totalCost * 0.5);
    const midPayment = Math.round(totalCost * 0.3);
    const finalPayment = totalCost - prepayment - midPayment;

    return `- Предоплата 50%: ${prepayment.toLocaleString('ru-RU')} руб.
- Промежуточный платеж 30%: ${midPayment.toLocaleString('ru-RU')} руб. (после завершения земляных работ)
- Окончательный расчет 20%: ${finalPayment.toLocaleString('ru-RU')} руб. (после сдачи объекта)`;
}

function calculateTimeline(estimate) {
    const area = (estimate.length || 0) * (estimate.width || 0);

    // Base timeline calculation
    let weeks = 4; // Base

    if (area > 50) weeks += 4;
    else if (area > 30) weeks += 2;
    else if (area > 15) weeks += 1;

    // Add time for additional equipment
    const equipmentCount = estimate.selectedWorks?.length || 0;
    weeks += Math.ceil(equipmentCount / 3);

    return {
        weeks,
        days: weeks * 7,
        estimate: `${weeks} недель`
    };
}

function generateWorkStages(estimate, timeline) {
    const stages = [
        '1. Подготовительные работы (3-5 дней)',
        '2. Земляные работы и котлован (5-7 дней)',
        '3. Устройство основания и чаши (10-14 дней)',
        '4. Монтаж оборудования (5-7 дней)',
        '5. Тестирование и наладка систем (2-3 дня)',
        '6. Благоустройство территории (3-5 дней)'
    ];

    return stages.join('\n');
}

function formatCompanyDetails(options) {
    return `ООО "Пул Эстимейтор"
ИНН: 7700000000
КПП: 770001001
ОГРН: 1234567890123
Адрес: г. Москва, ул. Примерная, д. 1
Тел.: +7 (495) 123-45-67`;
}

function formatClientDetails(clientInfo) {
    return `${clientInfo.name || 'Клиент'}
Телефон: ${clientInfo.phone || 'не указан'}
Email: ${clientInfo.email || 'не указан'}
Адрес: ${clientInfo.address || 'не указан'}`;
}

function numberToWords(number) {
    // Simplified version - returns "N миллионов/тысяч рублей"
    if (number >= 1000000) {
        const millions = (number / 1000000).toFixed(1);
        return `${millions} миллионов`;
    } else if (number >= 1000) {
        const thousands = (number / 1000).toFixed(0);
        return `${thousands} тысяч`;
    }
    return number.toString();
}

/**
 * Generate contract appendix with detailed estimate
 */
export function generateContractAppendix(estimate) {
    const items = estimate.selectedWorks || [];

    let appendix = `ПРИЛОЖЕНИЕ №1
к Договору № {contractNumber}

ДЕТАЛЬНАЯ СМЕТА РАБОТ

№\tНаименование\tЕд.изм.\tКол-во\tЦена\tСумма
`;

    let total = 0;
    items.forEach((item, index) => {
        const itemTotal = (item.quantity || 1) * (item.price || 0);
        total += itemTotal;

        appendix += `${index + 1}\t${item.name}\t${item.unit}\t${item.quantity}\t${item.price.toLocaleString('ru-RU')}\t${itemTotal.toLocaleString('ru-RU')}\n`;
    });

    appendix += `\n\nИТОГО: ${total.toLocaleString('ru-RU')} руб.`;

    return appendix;
}

/**
 * Export contract as PDF-ready HTML
 */
export function exportContractHTML(contract, appendix) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 2cm; }
        h1 { text-align: center; font-size: 14pt; }
        p { text-align: justify; margin: 10px 0; }
        .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature-block { width: 45%; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid black; padding: 5px; text-align: left; }
    </style>
</head>
<body>
    ${contract}
    <div style="page-break-before: always;"></div>
    ${appendix}
</body>
</html>
    `;
}
