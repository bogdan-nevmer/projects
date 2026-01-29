// Управление состоянием приложения
import { GUARANTEE_CONFIG } from './config.js';

// Начальное состояние
const initialState = {
  // Игровые данные
  balance: 1000,
  currentBet: 1,
  totalBet: 1,
  activeLines: 10,
  
  // Статус игры
  isSpinning: false,
  spinStartTime: null,
  lastSpinId: null,
  
  // Гарантированные символы
  totalBetAmount: 0,
  guaranteedSpecial: false,
  specialSymbolsDropped: 0,
  
  // Последний спин
  lastSpin: {
    id: null,
    grid: [],
    winAmount: 0,
    winLines: [],
    scatterCount: 0,
    wildCount: 0,
    hasBonus: false,
    bonusType: null
  },
  
  // История
  gameHistory: [],
  
  // Статистика
  statistics: {
    totalSpins: 0,
    totalWon: 0,
    totalBet: 0,
    biggestWin: 0,
    wildsCount: 0,
    scattersCount: 0,
    lastSpecialSymbolSpin: 0
  },
  
  // Настройки
  settings: {
    soundEnabled: true,
    musicEnabled: false,
    animationSpeed: 'normal',
    showPaylines: true
  }
};

// Текущее состояние
export let state = JSON.parse(JSON.stringify(initialState));

// Слушатели изменений состояния
const listeners = new Map();

// === ОСНОВНЫЕ ФУНКЦИИ ===

// Обновление баланса
export function updateBalance(amount) {
  state.balance += amount;
  
  if (amount > 0) {
    state.statistics.totalWon += amount;
    if (amount > state.statistics.biggestWin) {
      state.statistics.biggestWin = amount;
    }
  }
  
  saveToLocalStorage();
  notify('balanceChanged', { amount });
}

// Размещение ставки
export function placeBet() {
  if (state.balance < state.currentBet) {
    throw new Error('Недостаточно средств!');
  }
  
  state.balance -= state.currentBet;
  state.totalBetAmount += state.currentBet;
  state.statistics.totalBet += state.currentBet;
  
  // Проверяем гарантию на спецсимвол
  checkSpecialSymbolGuarantee();
  
  notify('betPlaced', { amount: state.currentBet });
}

// Проверка гарантии на спецсимвол
function checkSpecialSymbolGuarantee() {
  if (state.totalBetAmount >= GUARANTEE_CONFIG.BET_THRESHOLD) {
    state.guaranteedSpecial = true;
    notify('specialSymbolGuaranteed');
    
    if (GUARANTEE_CONFIG.RESET_AFTER_DROP) {
      state.totalBetAmount = state.totalBetAmount % GUARANTEE_CONFIG.BET_THRESHOLD;
    }
  }
}

// Регистрация выпадения спецсимвола
export function registerSpecialSymbol(type) {
  state.specialSymbolsDropped++;
  
  if (type === 'WILD') {
    state.statistics.wildsCount++;
  } else if (type === 'SCATTER') {
    state.statistics.scattersCount++;
  }
  
  if (state.guaranteedSpecial) {
    state.guaranteedSpecial = false;
    state.specialSymbolsDropped = 0;
  }
  
  state.statistics.lastSpecialSymbolSpin = state.statistics.totalSpins;
}

// Добавление в историю
export function addToHistory(spinResult) {
  const historyEntry = {
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    bet: state.currentBet,
    win: spinResult.winAmount,
    result: spinResult.winAmount > 0 ? 'WIN' : 'LOSE',
    grid: spinResult.grid.map(s => s.emoji),
    wilds: spinResult.wildCount,
    scatters: spinResult.scatterCount,
    linesWon: spinResult.winLines.length
  };
  
  state.gameHistory.unshift(historyEntry);
  
  if (state.gameHistory.length > 100) {
    state.gameHistory.pop();
  }
  
  state.statistics.totalSpins++;
  notify('historyUpdated', { entry: historyEntry });
}

// Сохранение в LocalStorage
export function saveToLocalStorage() {
  const dataToSave = {
    balance: state.balance,
    settings: state.settings,
    statistics: state.statistics,
    totalBetAmount: state.totalBetAmount,
    recentHistory: state.gameHistory.slice(0, 50)
  };
  
  try {
    localStorage.setItem('slotMachineState', JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }
}

// Загрузка из LocalStorage
export function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('slotMachineState');
    if (!saved) return;
    
    const parsed = JSON.parse(saved);
    
    // Восстанавливаем данные
    state.balance = parsed.balance || initialState.balance;
    state.settings = { ...initialState.settings, ...parsed.settings };
    state.statistics = { ...initialState.statistics, ...parsed.statistics };
    state.totalBetAmount = parsed.totalBetAmount || 0;
    state.gameHistory = parsed.recentHistory || [];
    
    checkSpecialSymbolGuarantee();
    notify('stateLoaded');
  } catch (error) {
    console.error('Ошибка загрузки:', error);
  }
}

// Сброс игры
export function resetGame() {
  if (confirm('Сбросить всю статистику и начать заново?')) {
    state.balance = initialState.balance;
    state.totalBetAmount = 0;
    state.guaranteedSpecial = false;
    state.gameHistory = [];
    state.statistics = { ...initialState.statistics };
    
    localStorage.removeItem('slotMachineState');
    notify('gameReset');
  }
}

// Изменение ставки
export function changeBet(amount) {
  const newBet = state.currentBet + amount;
  if (newBet >= 1 && newBet <= state.balance) {
    state.currentBet = newBet;
    notify('betChanged', { newBet });
    saveToLocalStorage();
  }
}

// === СИСТЕМА СОБЫТИЙ ===

// Подписка на события
export function subscribe(event, callback) {
  if (!listeners.has(event)) {
    listeners.set(event, []);
  }
  listeners.get(event).push(callback);
}

// Отписка от событий
export function unsubscribe(event, callback) {
  if (listeners.has(event)) {
    const callbacks = listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }
}

// Уведомление слушателей
function notify(event, data = null) {
  if (listeners.has(event)) {
    listeners.get(event).forEach(callback => callback(data));
  }
}

// Инициализация состояния
export function initState() {
  loadFromLocalStorage();
  console.log('State module initialized');
}