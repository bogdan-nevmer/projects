// Отрисовка интерфейса
import { state, subscribe, changeBet } from '../core/state.js';
import { slotMachine } from '../game/slot-machine.js';

export class Renderer {
  constructor() {
    this.elements = {};
    this.gridCells = [];
    this.isInitialized = false;
  }

  // Инициализация
  init() {
    if (this.isInitialized) return;
    
    this.createAppStructure();
    this.cacheElements();
    this.renderInitialGrid();
    this.bindEvents();
    this.setupSubscriptions();
    this.updateUI();
    
    this.isInitialized = true;
    console.log('Renderer initialized');
  }

  // Создание структуры приложения
  createAppStructure() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
      <div class="casino-app">
        <!-- Шапка -->
        <header class="header">
          <h1 class="title">🎰 VEGAS SLOT MACHINE</h1>
          <div class="balance-container">
            <div class="balance-label">БАЛАНС</div>
            <div class="balance-amount" id="balance">1,000</div>
            <div class="balance-currency">$</div>
          </div>
        </header>

        <!-- Основное игровое поле -->
        <main class="main-content">
          <!-- Игровая сетка -->
          <div class="slot-machine">
            <div class="slot-frame">
              <div class="slot-grid" id="slot-grid">
                <!-- Сетка 5x3 будет сгенерирована тут -->
              </div>
            </div>
            
            <!-- Статус и результат -->
            <div class="game-info">
              <div class="spin-status" id="spin-status">Готов к игре</div>
              <div class="win-display" id="win-display"></div>
            </div>
          </div>

          <!-- Панель управления -->
          <div class="control-panel">
            <!-- Управление ставкой -->
            <div class="bet-controls">
              <div class="bet-label">СТАВКА</div>
              <div class="bet-amount-container">
                <button class="bet-btn bet-decrease" id="bet-down">−</button>
                <div class="bet-amount" id="current-bet">1</div>
                <button class="bet-btn bet-increase" id="bet-up">+</button>
              </div>
              <div class="bet-currency">$</div>
            </div>

            <!-- Кнопка вращения -->
            <div class="spin-control">
              <button class="spin-button" id="spin-btn">
                <span class="spin-icon">🎯</span>
                <span class="spin-text">КРУТИТЬ</span>
              </button>
            </div>

            <!-- Информация -->
            <div class="info-controls">
              <div class="total-bet">
                <span>Всего ставок:</span>
                <span id="total-bet-amount">0</span>$
              </div>
              <div class="guarantee-info">
                <span>До спецсимвола:</span>
                <span id="guarantee-counter">100</span>$
              </div>
            </div>
          </div>
        </main>

        <!-- Статистика -->
        <div class="stats-panel">
          <div class="stat-item">
            <span class="stat-label">Спинов:</span>
            <span class="stat-value" id="total-spins">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Выиграно:</span>
            <span class="stat-value" id="total-won">0</span>$
          </div>
          <div class="stat-item">
            <span class="stat-label">Wild:</span>
            <span class="stat-value" id="wilds-count">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Scatter:</span>
            <span class="stat-value" id="scatters-count">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Рекорд:</span>
            <span class="stat-value" id="biggest-win">0</span>$
          </div>
        </div>

        <!-- Футер с инструкциями -->
        <footer class="footer">
          <div class="instructions">
            <div class="instruction-item">🎯 3+ Scatter = БОНУС</div>
            <div class="instruction-item">🃏 Wild заменяет любые символы</div>
            <div class="instruction-item">💰 Спецсимвол каждые 100$ ставок</div>
          </div>
          <button class="reset-btn" id="reset-btn">СБРОС ИГРЫ</button>
        </footer>
      </div>

      <style>
        /* Основные стили */
        .casino-app {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Arial', sans-serif;
        }

        /* Шапка */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #2c3e50, #34495e);
          padding: 20px 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .title {
          color: #f1c40f;
          font-size: 28px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .balance-container {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(0, 0, 0, 0.3);
          padding: 15px 25px;
          border-radius: 10px;
          border: 2px solid #f1c40f;
        }

        .balance-label {
          color: #bdc3c7;
          font-size: 14px;
        }

        .balance-amount {
          color: #2ecc71;
          font-size: 32px;
          font-weight: bold;
        }

        .balance-currency {
          color: #f1c40f;
          font-size: 20px;
          font-weight: bold;
        }

        /* Игровая сетка */
        .slot-machine {
          background: linear-gradient(135deg, #1a252f, #2c3e50);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        }

        .slot-frame {
          background: #0c1825;
          border-radius: 15px;
          padding: 20px;
          border: 5px solid #f1c40f;
          margin-bottom: 20px;
        }

        .slot-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .reel-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .slot-cell {
          background: linear-gradient(135deg, #34495e, #2c3e50);
          border: 3px solid #4a6572;
          border-radius: 10px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          transition: all 0.3s ease;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .slot-cell.spinning {
          background: linear-gradient(135deg, #3498db, #2980b9);
          animation: spinGlow 1s infinite alternate;
        }

        @keyframes spinGlow {
          0% { box-shadow: 0 0 10px #3498db; }
          100% { box-shadow: 0 0 30px #3498db; }
        }

        .game-info {
          text-align: center;
          padding: 20px;
        }

        .spin-status {
          font-size: 24px;
          color: #ecf0f1;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .win-display {
          font-size: 28px;
          font-weight: bold;
          min-height: 40px;
          padding: 10px;
          border-radius: 10px;
          transition: all 0.5s ease;
        }

        /* Панель управления */
        .control-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #2c3e50, #34495e);
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 30px;
          gap: 30px;
        }

        .bet-controls {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(0, 0, 0, 0.3);
          padding: 20px;
          border-radius: 10px;
          border: 2px solid #3498db;
        }

        .bet-label {
          color: #bdc3c7;
          font-size: 16px;
          font-weight: bold;
        }

        .bet-amount-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bet-btn {
          background: #3498db;
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bet-btn:hover:not(:disabled) {
          background: #2980b9;
          transform: scale(1.1);
        }

        .bet-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .bet-amount {
          color: #f1c40f;
          font-size: 36px;
          font-weight: bold;
          min-width: 60px;
          text-align: center;
        }

        .bet-currency {
          color: #3498db;
          font-size: 24px;
          font-weight: bold;
        }

        .spin-control {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .spin-button {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border: none;
          padding: 20px 60px;
          font-size: 24px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 15px;
          font-weight: bold;
          box-shadow: 0 10px 20px rgba(231, 76, 60, 0.3);
        }

        .spin-button:hover:not(:disabled) {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(231, 76, 60, 0.5);
          background: linear-gradient(135deg, #c0392b, #a93226);
        }

        .spin-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spin-icon {
          font-size: 32px;
        }

       