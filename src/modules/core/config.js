// Конфигурация игры - символы, выплаты, правила
export const SYMBOLS = {
  CHERRY: {
    id: 1,
    name: 'Cherry',
    emoji: '🍒',
    color: '#e74c3c',
    bgColor: '#c0392b',
    weight: 30,
    payout: [0, 2, 5, 20, 50, 100]
  },
  LEMON: {
    id: 2,
    name: 'Lemon',
    emoji: '🍋',
    color: '#f1c40f',
    bgColor: '#f39c12',
    weight: 25,
    payout: [0, 0, 3, 10, 30, 75]
  },
  SEVEN: {
    id: 3,
    name: 'Seven',
    emoji: '7️⃣',
    color: '#3498db',
    bgColor: '#2980b9',
    weight: 10,
    payout: [0, 0, 0, 50, 100, 250]
  },
  BAR: {
    id: 4,
    name: 'Bar',
    emoji: '📊',
    color: '#2ecc71',
    bgColor: '#27ae60',
    weight: 20,
    payout: [0, 0, 5, 25, 75, 150]
  },
  STAR: {
    id: 5,
    name: 'Star',
    emoji: '⭐',
    color: '#f39c12',
    bgColor: '#d35400',
    weight: 15,
    payout: [0, 2, 10, 40, 80, 200]
  },
  WILD: {
    id: 6,
    name: 'Wild',
    emoji: '🃏',
    color: '#9b59b6',
    bgColor: '#8e44ad',
    weight: 8,
    isWild: true,
    substitutes: ['CHERRY', 'LEMON', 'SEVEN', 'BAR', 'STAR'],
    payout: [0, 0, 0, 0, 0, 0]
  },
  SCATTER: {
    id: 7,
    name: 'Scatter',
    emoji: '🎯',
    color: '#e84393',
    bgColor: '#fd79a8',
    weight: 2,
    isScatter: true,
    payout: [0, 0, 5, 20, 100, 500]
  }
};

// Выигрышные линии (10 линий)
export const PAYLINES = [
  [5, 6, 7, 8, 9],      // Линия 1: средняя горизонталь
  [0, 1, 2, 3, 4],      // Линия 2: верхняя горизонталь
  [10, 11, 12, 13, 14], // Линия 3: нижняя горизонталь
  [0, 6, 12, 8, 4],     // Линия 4: V-образная
  [4, 8, 12, 6, 0],     // Линия 5: обратная V-образная
  [0, 1, 7, 13, 14],    // Линия 6: диагональ
  [2, 6, 10, 11, 12],   // Линия 7: зигзаг
  [0, 5, 10, 6, 2],     // Линия 8: буква M
  [4, 9, 14, 8, 2],     // Линия 9: буква W
  [1, 6, 11, 8, 3]      // Линия 10: крест
];

// Настройки гарантированного спецсимвола
export const GUARANTEE_CONFIG = {
  BET_THRESHOLD: 100,
  GUARANTEED_COUNT: 1,
  RESET_AFTER_DROP: true
};

// Веса для генерации символов
export const WEIGHTS = {
  NORMAL: 90,
  WILD: 8,
  SCATTER: 2
};

// Все символы в массиве для удобства
export const SYMBOLS_ARRAY = Object.values(SYMBOLS);

// Нормальные символы (без Wild и Scatter)
export const NORMAL_SYMBOLS = SYMBOLS_ARRAY.filter(s => !s.isWild && !s.isScatter);