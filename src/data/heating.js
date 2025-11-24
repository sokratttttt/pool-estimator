export const heatingOptions = [
    {
        id: 'electro-titan',
        name: 'Теплообменник Electro G2 49 кВт Titan',
        type: 'heat-exchanger',
        price: 63671,
        installationPrice: 32500,
        items: [
            { name: 'Теплообменник Electro G2 49 кВт Titan', price: 63671, quantity: 1 },
            { name: 'Вставка 1,5" в комплекте с разъемной муфтой', price: 2400, quantity: 2 },
            { name: 'Клапан сол. (2/2 НЗ) 1" (25 мм)', price: 8400, quantity: 1 },
            { name: 'Циркуляционный насос LPA 25-60 B', price: 12400, quantity: 1 }
        ]
    },
    {
        id: 'electric-heater',
        name: 'Электронагреватель Pahlen 18кВт',
        type: 'electric',
        price: 45000,
        installationPrice: 25000,
        items: [
            { name: 'Электронагреватель Pahlen 18кВт', price: 45000, quantity: 1 },
            { name: 'Датчик потока', price: 5000, quantity: 1 },
            { name: 'Щит управления нагревом', price: 15000, quantity: 1 }
        ]
    },
    {
        id: 'none',
        name: 'Без подогрева',
        type: 'none',
        price: 0,
        installationPrice: 0,
        items: []
    }
];
