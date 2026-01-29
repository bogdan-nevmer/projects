// Простое состояние для начала
export let state = {
  balance: 1000,
  currentBet: 1,
  isSpinning: false,
  totalBetAmount: 0,
  guaranteedSpecial: false,
  gameHistory: []
};

export function updateBalance(amount) {
  state.balance += amount;
  console.log('Баланс обновлён:', state.balance);
}

export function placeBet() {
  if (state.balance < state.currentBet) {
    throw new Error('Недостаточно средств!');
  }
  state.balance -= state.currentBet;
  state.totalBetAmount += state.currentBet;
  
  if (state.totalBetAmount >= 100) {
    state.guaranteedSpecial = true;
    state.totalBetAmount = 0;
  }
}

export function addToHistory(result) {
  state.gameHistory.unshift({
    id: Date.now(),
    win: result.winAmount,
    time: new Date().toLocaleTimeString()
  });
  
  if (state.gameHistory.length > 10) {
    state.gameHistory.pop();
  }
}

export function initState() {
  console.log('State initialized');
}