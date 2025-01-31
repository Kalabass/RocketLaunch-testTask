import { process } from './process.mjs';

const testCases1 = [
  {
    store: [{ size: 2, quantity: 4 }],
    order: [
      { id: 101, size: [2] },
      { id: 102, size: [1, 2], masterSize: 's2' },
    ],
    isPossible: true,
    mismatches: 0,
  },
];

const testCases = [
  //1. 1 сайз 1 заказ
  {
    store: [{ size: 2, quantity: 1 }],
    order: [{ id: 102, size: [1, 2], masterSize: 's1' }],
    isPossible: true,
    mismatches: 1,
  },
  //2. сайз в магазине не соответствует заказу
  {
    store: [{ size: 3, quantity: 1 }],
    order: [{ id: 102, size: [1, 2], masterSize: 's1' }],
    isPossible: false,
    mismatches: 0,
  },
  //3.
  {
    store: [{ size: 2, quantity: 4 }],
    order: [
      { id: 101, size: [2] },
      { id: 102, size: [1, 2], masterSize: 's2' },
    ],
    isPossible: true,
    mismatches: 0,
  },
  //4
  {
    store: [
      { size: 1, quantity: 1 },
      { size: 2, quantity: 2 },
      { size: 3, quantity: 1 },
    ],
    order: [
      { id: 100, size: [1] },
      { id: 101, size: [2] },
      { id: 102, size: [2, 3], masterSize: 's1' },
      { id: 103, size: [1, 2], masterSize: 's2' },
    ],
    isPossible: true,
    mismatches: 1,
  },
  //5 заказов больше, чем объем магаза
  {
    store: [
      { size: 1, quantity: 1 },
      { size: 2, quantity: 2 },
      { size: 3, quantity: 1 },
    ],
    order: [
      { id: 100, size: [1] },
      { id: 101, size: [2] },
      { id: 102, size: [2, 3], masterSize: 's1' },
      { id: 103, size: [1, 2], masterSize: 's2' },
      { id: 104, size: [1, 2], masterSize: 's2' },
    ],
    isPossible: false,
  },
  //6
  {
    store: [{ size: 1, quantity: 1 }],
    order: [{ id: 100, size: [2] }],
    isPossible: false,
  },
  //7 3 сайза в заказе
  {
    store: [{ size: 1, quantity: 1 }],
    order: [{ id: 100, size: [2, 3, 4] }],
    isPossible: false,
  },
  //8
  {
    store: [
      { size: 1, quantity: 1 },
      { size: 2, quantity: 1 },
    ],
    order: [
      { id: 100, size: [1, 2], masterSize: 's1' },
      { id: 101, size: [1, 2], masterSize: 's1' },
    ],
    isPossible: true,
    mismatches: 1,
  },
  //9
  {
    store: [
      { size: 1, quantity: 1 },
      { size: 2, quantity: 1 },
      { size: 3, quantity: 1 },
      { size: 4, quantity: 1 },
    ],
    order: [
      { id: 100, size: [1, 2], masterSize: 's1' },
      { id: 101, size: [3, 4], masterSize: 's1' },
    ],
    isPossible: true,
    mismatches: 0,
  },
  // 10. Заказ с несколькими покупателями, имеющими один и тот же приоритетный размер
  {
    store: [
      { size: 1, quantity: 1 },
      { size: 2, quantity: 3 },
      { size: 3, quantity: 2 },
    ],
    order: [
      { id: 200, size: [1, 2], masterSize: 's1' },
      { id: 201, size: [1, 2], masterSize: 's1' },
      { id: 202, size: [2, 3], masterSize: 's2' },
      { id: 203, size: [2, 3], masterSize: 's2' },
    ],
    isPossible: true,
    mismatches: 1,
  },

  // 11. Полный дефицит масок на складе
  {
    store: [],
    order: [
      { id: 300, size: [1, 2], masterSize: 's1' },
      { id: 301, size: [2, 3], masterSize: 's2' },
    ],
    isPossible: false,
  },

  // 12. Один покупатель, у которого два допустимых размера, но на складе есть только второй
  {
    store: [{ size: 2, quantity: 1 }],
    order: [{ id: 400, size: [1, 2], masterSize: 's1' }],
    isPossible: true,
    mismatches: 1,
  },

  // 13. Большое количество покупателей, которые полностью израсходуют склад
  {
    store: [
      { size: 1, quantity: 2 },
      { size: 2, quantity: 3 },
      { size: 3, quantity: 1 },
    ],
    order: [
      { id: 500, size: [1] },
      { id: 501, size: [1, 2], masterSize: 's2' },
      { id: 502, size: [2, 3], masterSize: 's1' },
      { id: 503, size: [2, 3], masterSize: 's2' },
      { id: 504, size: [3] },
    ],
    isPossible: true,
    mismatches: 1,
  },

  // 14. Покупатель с единственным возможным размером, которого нет в наличии
  {
    store: [{ size: 1, quantity: 3 }],
    order: [{ id: 600, size: [2] }],
    isPossible: false,
  },
  //15. То же самое, что 4, только вместимость магазина и кол-во заказов увеличены в 2 раза
  {
    store: [
      { size: 1, quantity: 0 },
      { size: 2, quantity: 2 },
      { size: 3, quantity: 2 },
    ],
    order: [
      { id: 102, size: [2, 3], masterSize: 's1' },
      { id: 103, size: [1, 2], masterSize: 's2' },
      { id: 104, size: [2, 3], masterSize: 's1' },
      { id: 105, size: [1, 2], masterSize: 's2' },
    ],
    isPossible: true,
    mismatches: 2,
  },
  //16 То же самое, что 4, только вместимость магазина и кол-во заказов увеличены в 2 раза, и сверху добавлены еще 2 заказа
  {
    store: [
      { size: 1, quantity: 0 },
      { size: 2, quantity: 3 },
      { size: 3, quantity: 3 },
    ],
    order: [
      { id: 101, size: [1, 2], masterSize: 's2' },
      { id: 102, size: [1, 2], masterSize: 's2' },
      { id: 103, size: [2, 3], masterSize: 's1' },
      { id: 104, size: [2, 3], masterSize: 's1' },
      { id: 105, size: [2, 3], masterSize: 's1' },
      { id: 106, size: [2, 3], masterSize: 's1' },
    ],
    isPossible: true,
    mismatches: 3,
  },
];

testCases.forEach(({ store, order, isPossible, mismatches }, index) => {
  const result = process(store, order);
  const passed =
    (result === false && !isPossible) ||
    (result &&
      result.assignment.length === order.length &&
      result.mismatches === mismatches);

  // const passed = result === isPossible;
  console.log(`Test Case ${index + 1}: ${passed ? 'Passed' : 'Failed'}`);
  if (!passed) {
    console.log('Expected:', isPossible ? { mismatches } : false);
    console.log('Received:', result);
  }
});
