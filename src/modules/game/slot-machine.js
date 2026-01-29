// Логика игрового автомата
import { state, placeBet, updateBalance, addToHistory, registerSpecialSymbol } from '../core/state.js';
import { SYMBOLS, PAYLINES, WEIGHTS, GUARANTEE_CONFIG, NORMAL_SYMBOLS } from '../core/config.js';

export class SlotMachine {
  constructor() {
    this.reels = 5;
    this.rows = 3;
    this.gridSize = this.reels * this.rows;
    this.isSpinning = false;
    this.spinDuration = 3000;
    this.reelSpeeds = [];
    this.currentSymbols = [];
    this.animationFrame = null;
  }

  // Генерация случайного символа
  generateSymbol(isGuaranteedSpecial = false) {
    if (isGuaranteedSpecial) {
      return Math.random() < 0.6 ? SYMBOLS.WILD : SYMBOLS.SCATTER;
    }
    
    const random = Math.random() * 100;
    
    if (random < WEIGHTS.SCATTER) {
      return SYMBOLS.SCATTER;
    } else if (random < WEIGHTS.SCATTER + WEIGHTS.WILD) {
      return SYMBOLS.WILD;
    } else {
      // Выбираем обычный символ по весам
      let totalWeight = 0;
      const weights = NORMAL_SYMBOLS.map(s => {
        totalWeight += s.weight;
        return totalWeight;
      });
      
      const roll = Math.random() * totalWeight;
      for (let i = 0; i < NORMAL_SYMBOLS.length; i++) {
        if (roll < weights[i]) {
          return NORMAL_SYMBOLS[i];
        }
      }
      return NORMAL_SYMBOLS[0];
    }
  }

  // Генерация всей сетки
  generateGrid() {
    const grid = [];
    let specialSymbolsCount = 0;
    
    for (let i = 0; i < this.gridSize; i++) {
      const isGuaranteed = state.guaranteedSpecial && 
                          specialSymbolsCount < GUARANTEE_CONFIG.GUARANTEED_COUNT;
      const symbol = this.generateSymbol(isGuaranteed);
      
      if (symbol.isWild || symbol.isScatter) {
        specialSymbolsCount++;
        registerSpecialSymbol(symbol.isWild ? 'WILD' : 'SCATTER');
      }
      
      grid.push({
        ...symbol,
        position: i,
        reel: i % this.reels,
        row: Math.floor(i / this.reels)
      });
    }
    
    if (state.guaranteedSpecial && specialSymbolsCount > 0) {
      state.guaranteedSpecial = false;
    }
    
    return grid;
  }

  // Основное вращение
  async spin() {
    if (this.isSpinning || state.isSpinning) {
      throw new Error('Уже вращается!');
    }
    
    try {
      // Ставим ставку
      placeBet();
      
      // Начинаем вращение
      this.isSpinning = true;
      state.isSpinning = true;
      state.spinStartTime = Date.now();
      
      // Запускаем анимацию
      await this.startAnimation();
      
      // Генерируем результат
      const finalGrid = this.generateGrid();
      this.currentSymbols = finalGrid;
      
      // Рассчитываем выигрыш
      const spinResult = this.calculateWin(finalGrid);
      
      // Обновляем баланс
      if (spinResult.winAmount > 0) {
        updateBalance(spinResult.winAmount);
      }
      
      // Сохраняем в историю
      addToHistory({
        grid: finalGrid,
        winAmount: spinResult.winAmount,
        winLines: spinResult.winLines,
        scatterCount: spinResult.scatterCount,
        wildCount: spinResult.wildCount
      });
      
      // Обновляем последний спин
      state.lastSpin = {
        id: Date.now(),
        grid: finalGrid,
        winAmount: spinResult.winAmount,
        winLines: spinResult.winLines,
        scatterCount: spinResult.scatterCount,
        wildCount: spinResult.wildCount,
        hasBonus: spinResult.scatterCount >= 3,
        bonusType: spinResult.scatterCount >= 3 ? 'free_spins' : null
      };
      
      return spinResult;
      
    } finally {
      // Завершаем вращение
      this.isSpinning = false;
      state.isSpinning = false;
    }
  }

  // Анимация вращения
  async startAnimation() {
    return new Promise((resolve) => {
      console.log('🌀 Начало анимации вращения...');
      
      const spinStart = Date.now();
      let lastUpdate = spinStart;
      const reelsSpinning = Array(this.reels).fill(true);
      const reelPositions = Array(this.reels).fill(0);
      
      const animate = (currentTime) => {
        const elapsed = currentTime - spinStart;
        const delta = currentTime - lastUpdate;
        lastUpdate = currentTime;
        
        if (elapsed >= this.spinDuration) {
          // Завершаем анимацию
          cancelAnimationFrame(this.animationFrame);
          this.stopAnimation(reelPositions);
          resolve();
          return;
        }
        
        // Обновляем позиции барабанов
        for (let i = 0; i < this.reels; i++) {
          if (reelsSpinning[i]) {
            // Замедление к концу
            const progress = elapsed / this.spinDuration;
            let speed = 0.5;
            
            if (progress < 0.7) {
              speed = 0.8;
            } else if (progress < 0.9) {
              speed = 0.4;
            } else {
              speed = 0.1;
            }
            
            reelPositions[i] += speed * delta;
            
            // Останавливаем барабаны по очереди
            if (progress > 0.7 + i * 0.05) {
              reelsSpinning[i] = false;
              reelPositions[i] = Math.round(reelPositions[i]);
            }
          }
        }
        
        // Запрашиваем следующий кадр
        this.animationFrame = requestAnimationFrame(animate);
      };
      
      this.animationFrame = requestAnimationFrame(animate);
    });
  }

  // Остановка анимации с защелкиванием
  stopAnimation(reelPositions) {
    console.log('🔒 Защелкивание символов...');
    
    // Имитация защелкивания каждого барабана
    for (let i = 0; i < this.reels; i++) {
      setTimeout(() => {
        console.log(`🎰 Барабан ${i + 1} остановлен`);
      }, i * 200);
    }
  }

  // Расчет выигрыша
  calculateWin(grid) {
    let totalWin = 0;
    const winLines = [];
    let scatterCount = 0;
    let wildCount = 0;
    
    // Считаем специальные символы
    grid.forEach(symbol => {
      if (symbol.isScatter) scatterCount++;
      if (symbol.isWild) wildCount++;
    });
    
    // Выплата за скаттеры
    if (scatterCount >= 3) {
      const scatterWin = SYMBOLS.SCATTER.payout[scatterCount - 1] * state.currentBet;
      totalWin += scatterWin;
      winLines.push({
        type: 'SCATTER',
        count: scatterCount,
        payout: scatterWin,
        positions: 'any'
      });
    }
    
    // Проверяем выигрышные линии
    PAYLINES.forEach((line, lineIndex) => {
      const lineSymbols = line.map(pos => grid[pos]);
      const winResult = this.checkLine(lineSymbols, lineIndex);
      
      if (winResult.win > 0) {
        totalWin += winResult.win;
        winLines.push({
          lineIndex,
          symbols: winResult.symbols,
          payout: winResult.win,
          positions: line
        });
      }
    });
    
    return {
      winAmount: totalWin,
      winLines,
      scatterCount,
      wildCount
    };
  }

  // Проверка линии
  checkLine(lineSymbols, lineIndex) {
    // Ищем первый не-Wild символ
    let firstSymbol = lineSymbols[0];
    if (firstSymbol.isWild) {
      for (let i = 1; i < lineSymbols.length; i++) {
        if (!lineSymbols[i].isWild) {
          firstSymbol = lineSymbols[i];
          break;
        }
      }
    }
    
    // Если все Wild - не выигрыш
    if (firstSymbol.isWild) {
      return { win: 0, symbols: [] };
    }
    
    // Считаем совпадения
    let count = 1;
    for (let i = 1; i < lineSymbols.length; i++) {
      const symbol = lineSymbols[i];
      
      if (symbol.isWild || 
          (symbol.id === firstSymbol.id && !symbol.isScatter)) {
        count++;
      } else {
        break;
      }
    }
    
    // Минимум 3 символа
    if (count >= 3) {
      const win = firstSymbol.payout[count - 1] * state.currentBet;
      return {
        win,
        symbols: lineSymbols.slice(0, count).map(s => s.name)
      };
    }
    
    return { win: 0, symbols: [] };
  }

  // Получить текущую сетку
  getCurrentGrid() {
    return this.currentSymbols;
  }
}

// Экспортируем экземпляр
export const slotMachine = new SlotMachine();