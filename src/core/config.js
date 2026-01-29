// Конфигурация игры
export const SYMBOLS = {
  CHERRY: {
    id: 1, name: 'Cherry', emoji: '??', color: '#e74c3c', weight: 30,
    payout: [0, 2, 5, 20, 50, 100]
  },
  LEMON: {
    id: 2, name: 'Lemon', emoji: '??', color: '#f1c40f', weight: 25,
    payout: [0, 0, 3, 10, 30, 75]
  },
  SEVEN: {
    id: 3, name: 'Seven', emoji: '7??', color: '#3498db', weight: 10,
    payout: [0, 0, 0, 50, 100, 250]
  },
  BAR: {
    id: 4, name: 'Bar', emoji: '??', color: '#2ecc71', weight: 20,
    payout: [0, 0, 5, 25, 75, 150]
  },
  STAR: {
    id: 5, name: 'Star', emoji: '?', color: '#f39c12', weight: 15,
    payout: [0, 2, 10, 40, 80, 200]
  },
  WILD: {
    id: 6, name: 'Wild', emoji: '??', color: '#9b59b6', weight: 8,
    isWild: true, payout: [0, 0, 0, 0, 0, 0]
  },
  SCATTER: {
    id: 7, name: 'Scatter', emoji: '??', color: '#e84393', weight: 2,
    isScatter: true, payout: [0, 0, 5, 20, 100, 500]
  }
};

// Выигрышные линии
export const PAYLINES = [
  [5, 6, 7, 8, 9],      // Средняя линия
  [0, 1, 2, 3, 4],      // Верхняя линия
  [10, 11, 12, 13, 14]  // Нижняя линия
];

export const GUARANTEE_CONFIG = {
  BET_THRESHOLD: 100,
  GUARANTEED_COUNT: 1
};

export const WEIGHTS = {
  NORMAL: 90,
  WILD: 8,
  SCATTER: 2
};