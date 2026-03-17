// Vegas Slot Machine - основной файл
console.log('🎰 Vegas Slot Machine загружается...');

// Данные игры
const gameState = {
    balance: 1000,
    currentBet: 1,
    isSpinning: false,
    totalSpins: 0,
    totalWon: 0,
    totalBetAmount: 0
};

// Символы для игры
const symbols = [
    { emoji: '🍒', name: 'Cherry', color: '#e74c3c', weight: 30 },
    { emoji: '🍋', name: 'Lemon', color: '#f1c40f', weight: 25 },
    { emoji: '7️⃣', name: 'Seven', color: '#3498db', weight: 10 },
    { emoji: '📊', name: 'Bar', color: '#2ecc71', weight: 20 },
    { emoji: '⭐', name: 'Star', color: '#f39c12', weight: 15 },
    { emoji: '🃏', name: 'Wild', color: '#9b59b6', weight: 8, isWild: true },
    { emoji: '🎯', name: 'Scatter', color: '#e84393', weight: 2, isScatter: true }
];

// Загрузка приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM загружен');
    initGame();
});

// Инициализация игры
function initGame() {
    createGameUI();
    setupEventListeners();
    updateUI();
    console.log('✅ Игра инициализирована');
}

// Создание интерфейса
function createGameUI() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="header">
            <h1 class="title">🎰 VEGAS SLOT MACHINE</h1>
            <div class="balance">Баланс: <span id="balance">1000</span>$</div>
        </div>
        
        <div class="slot-machine">
            <div class="slot-grid" id="slot-grid">
                <!-- Слоты будут созданы здесь -->
            </div>
            
            <div class="game-status">
                <div id="spin-status">Готов к игре!</div>
                <div id="win-display" class="win-display"></div>
            </div>
        </div>
        
        <div class="controls">
            <div class="bet-controls">
                <button class="bet-btn" id="bet-down">-</button>
                <span>Ставка: <span id="current-bet">1</span>$</span>
                <button class="bet-btn" id="bet-up">+</button>
            </div>
            
            <button class="spin-button" id="spin-btn">🎯 КРУТИТЬ</button>
        </div>
        
        <div class="footer">
            <div class="instructions">
                <div class="instruction-item">🎯 3+ Scatter = БОНУС</div>
                <div class="instruction-item">🃏 Wild заменяет любые символы</div>
                <div class="instruction-item">💰 Спецсимвол каждые 100$ ставок</div>
            </div>
        </div>
    `;
    
    // Создаем игровую сетку 5x3
    createSlotGrid();
}

// Создание сетки 5x3
function createSlotGrid() {
    const grid = document.getElementById('slot-grid');
    
    for (let i = 0; i < 15; i++) { // 5x3 = 15 ячеек
        const cell = document.createElement('div');
        cell.className = 'slot-cell';
        cell.id = `cell-${i}`;
        cell.textContent = '?';
        grid.appendChild(cell);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    const spinBtn = document.getElementById('spin-btn');
    const betUp = document.getElementById('bet-up');
    const betDown = document.getElementById('bet-down');
    
    // Кнопка вращения
    spinBtn.addEventListener('click', () => {
        if (!gameState.isSpinning && gameState.balance >= gameState.currentBet) {
            spin();
        }
    });
    
    // Увеличение ставки
    betUp.addEventListener('click', () => {
        if (gameState.currentBet < gameState.balance) {
            gameState.currentBet++;
            updateUI();
        }
    });
    
    // Уменьшение ставки
    betDown.addEventListener('click', () => {
        if (gameState.currentBet > 1) {
            gameState.currentBet--;
            updateUI();
        }
    });
}

// Обновление интерфейса
function updateUI() {
    document.getElementById('balance').textContent = gameState.balance;
    document.getElementById('current-bet').textContent = gameState.currentBet;
    
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = gameState.isSpinning || gameState.balance < gameState.currentBet;
    
    if (gameState.isSpinning) {
        spinBtn.textContent = '🌀 ВРАЩАЕТСЯ...';
    } else {
        spinBtn.textContent = '🎯 КРУТИТЬ';
    }
}

// Функция вращения
async function spin() {
    gameState.isSpinning = true;
    gameState.balance -= gameState.currentBet;
    gameState.totalBetAmount += gameState.currentBet;
    gameState.totalSpins++;
    
    updateUI();
    
    // Обновляем статус
    document.getElementById('spin-status').textContent = '🌀 Барабаны вращаются...';
    document.getElementById('win-display').textContent = '';
    
    // Анимация вращения
    await animateSpin();
    
    // Генерация результата
    const result = generateResult();
    
    // Отображение результата
    displayResult(result.grid);
    
    // Проверка выигрыша
    const winAmount = calculateWin(result.grid);
    
    // Обновление баланса
    if (winAmount > 0) {
        gameState.balance += winAmount;
        gameState.totalWon += winAmount;
        
        // Показываем выигрыш
        const winDisplay = document.getElementById('win-display');
        winDisplay.textContent = `🎉 ВЫИГРЫШ: ${winAmount}$!`;
        winDisplay.style.color = '#2ecc71';
        winDisplay.style.backgroundColor = 'rgba(46, 204, 113, 0.2)';
        
        // Убираем сообщение через 3 секунды
        setTimeout(() => {
            winDisplay.textContent = '';
            winDisplay.style.backgroundColor = 'transparent';
        }, 3000);
    }
    
    // Обновляем статус
    if (winAmount > 0) {
        document.getElementById('spin-status').textContent = '🎊 Удача на твоей стороне!';
    } else {
        document.getElementById('spin-status').textContent = 'Готов к следующему вращению';
    }
    
    gameState.isSpinning = false;
    updateUI();
    
    // Проверка гарантированного спецсимвола
    checkGuaranteedSpecial();
    
    console.log(`Спин #${gameState.totalSpins}: Ставка ${gameState.currentBet}$, Выигрыш ${winAmount}$, Баланс ${gameState.balance}$`);
}

// Анимация вращения
async function animateSpin() {
    const cells = document.querySelectorAll('.slot-cell');
    const spinDuration = 1500; // 1.5 секунды
    const startTime = Date.now();
    
    // Быстрое вращение
    while (Date.now() - startTime < spinDuration) {
        for (let i = 0; i < cells.length; i++) {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            cells[i].textContent = randomSymbol.emoji;
            cells[i].style.backgroundColor = randomSymbol.color;
        }
        await sleep(50); // Пауза 50ms между кадрами
    }
}

// Генерация случайного символа с учетом весов
function generateRandomSymbol() {
    const totalWeight = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const symbol of symbols) {
        if (random < symbol.weight) {
            return symbol;
        }
        random -= symbol.weight;
    }
    
    return symbols[0]; // fallback
}

// Генерация результата (сетка 5x3)
function generateResult() {
    const grid = [];
    let hasWild = false;
    let hasScatter = false;
    
    // Проверяем гарантированный спецсимвол
    const needsSpecialSymbol = gameState.totalBetAmount >= 100;
    
    for (let i = 0; i < 15; i++) {
        let symbol;
        
        // Если нужен гарантированный спецсимвол и ещё не было
        if (needsSpecialSymbol && !hasWild && !hasScatter && i === 7) { // Центральная позиция
            // Выбираем между Wild и Scatter
            symbol = Math.random() < 0.6 
                ? symbols.find(s => s.isWild) 
                : symbols.find(s => s.isScatter);
            
            if (symbol.isWild) hasWild = true;
            if (symbol.isScatter) hasScatter = true;
            
            // Сбрасываем счётчик
            gameState.totalBetAmount = 0;
        } else {
            symbol = generateRandomSymbol();
        }
        
        grid.push(symbol);
    }
    
    return { grid, hasWild, hasScatter };
}

// Отображение результата
function displayResult(grid) {
    for (let i = 0; i < grid.length; i++) {
        const cell = document.getElementById(`cell-${i}`);
        const symbol = grid[i];
        
        cell.textContent = symbol.emoji;
        cell.style.backgroundColor = symbol.color;
        
        // Подсветка специальных символов
        if (symbol.isWild) {
            cell.style.boxShadow = '0 0 15px #9b59b6';
            cell.style.border = '3px solid #9b59b6';
        } else if (symbol.isScatter) {
            cell.style.boxShadow = '0 0 15px #e84393';
            cell.style.border = '3px solid #e84393';
        } else {
            cell.style.boxShadow = 'none';
            cell.style.border = '3px solid #4a6572';
        }
    }
}

// Расчет выигрыша (упрощенный)
function calculateWin(grid) {
    let winAmount = 0;
    
    // Проверяем скаттеры
    const scatterCount = grid.filter(s => s.isScatter).length;
    if (scatterCount >= 3) {
        winAmount += scatterCount * gameState.currentBet * 10;
    }
    
    // Проверяем первую линию (верхний ряд)
    const topLine = [grid[0], grid[1], grid[2], grid[3], grid[4]];
    winAmount += checkLine(topLine);
    
    // Проверяем вторую линию (средний ряд)
    const middleLine = [grid[5], grid[6], grid[7], grid[8], grid[9]];
    winAmount += checkLine(middleLine);
    
    // Проверяем третью линию (нижний ряд)
    const bottomLine = [grid[10], grid[11], grid[12], grid[13], grid[14]];
    winAmount += checkLine(bottomLine);
    
    return winAmount;
}

// Проверка линии на выигрыш
function checkLine(line) {
    // Первый символ (игнорируем Wild для сравнения)
    let firstSymbol = line[0];
    let symbolIndex = 0;
    
    while (firstSymbol.isWild && symbolIndex < line.length) {
        firstSymbol = line[symbolIndex];
        symbolIndex++;
    }
    
    // Если все символы Wild
    if (firstSymbol.isWild) return 0;
    
    // Считаем совпадения
    let matchCount = 0;
    for (const symbol of line) {
        if (symbol.isWild || symbol.name === firstSymbol.name) {
            matchCount++;
        } else {
            break;
        }
    }
    
    // Выплаты: 3 символа = x5, 4 символа = x10, 5 символов = x20
    if (matchCount >= 3) {
        const multiplier = matchCount === 3 ? 5 : matchCount === 4 ? 10 : 20;
        return gameState.currentBet * multiplier;
    }
    
    return 0;
}

// Проверка гарантированного спецсимвола
function checkGuaranteedSpecial() {
    const guaranteeCounter = document.getElementById('guarantee-counter');
    if (guaranteeCounter) {
        const remaining = 100 - (gameState.totalBetAmount % 100);
        guaranteeCounter.textContent = remaining;
    }
}

// Вспомогательная функция для паузы
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Добавляем информацию о гарантии в футер
function addGuaranteeInfo() {
    const footer = document.querySelector('.footer .instructions');
    if (footer) {
        const guaranteeItem = document.createElement('div');
        guaranteeItem.className = 'instruction-item';
        guaranteeItem.innerHTML = `💰 До спецсимвола: <span id="guarantee-counter">${100 - (gameState.totalBetAmount % 100)}</span>$`;
        footer.appendChild(guaranteeItem);
    }
}

// Добавляем статистику
function addStatsPanel() {
    const app = document.getElementById('app');
    const statsHTML = `
        <div class="stats-panel" style="
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 10px;
        ">
            <div class="stat-item">
                <span style="color: #bdc3c7;">Спинов:</span>
                <span style="color: #3498db; font-weight: bold;" id="total-spins">0</span>
            </div>
            <div class="stat-item">
                <span style="color: #bdc3c7;">Выиграно:</span>
                <span style="color: #2ecc71; font-weight: bold;" id="total-won">0</span>$
            </div>
            <div class="stat-item">
                <span style="color: #bdc3c7;">Потрачено:</span>
                <span style="color: #e74c3c; font-weight: bold;" id="total-bet">0</span>$
            </div>
        </div>
    `;
    
    const slotMachine = document.querySelector('.slot-machine');
    slotMachine.insertAdjacentHTML('afterend', statsHTML);
}

// Обновление статистики
function updateStats() {
    const totalSpinsEl = document.getElementById('total-spins');
    const totalWonEl = document.getElementById('total-won');
    const totalBetEl = document.getElementById('total-bet');
    
    if (totalSpinsEl) totalSpinsEl.textContent = gameState.totalSpins;
    if (totalWonEl) totalWonEl.textContent = gameState.totalWon;
    if (totalBetEl) totalBetEl.textContent = gameState.totalBetAmount;
}

// Модифицируем initGame для добавления статистики
const originalInitGame = initGame;
initGame = function() {
    originalInitGame();
    addGuaranteeInfo();
    addStatsPanel();
};

// Модифицируем spin для обновления статистики
const originalSpin = spin;
spin = async function() {
    await originalSpin();
    updateStats();
};

console.log('🎰 Скрипт загружен. Ожидание загрузки DOM...');
console.log('🎰 Скрипт загружен. Ожидание загрузки DOM...');

