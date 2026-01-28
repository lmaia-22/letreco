// Letreco - Portuguese Wordle Clone
// Game state and configuration

const GAME_STATE = {
    currentRow: 0,
    currentCol: 0,
    gameOver: false,
    gameWon: false,
    currentWord: '',
    targetWord: '',
    guesses: [],
    keyboardState: {}
};

const KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

const LETTER_STATES = {
    CORRECT: 'correct',
    PRESENT: 'present',
    ABSENT: 'absent'
};

const STORAGE_KEYS = {
    STATS: 'letreco_stats',
    GAME_STATE: 'letreco_game_state',
    SETTINGS: 'letreco_settings'
};

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
    loadSettings();
});

function initializeGame() {
    // Get today's word
    const today = new Date();
    GAME_STATE.targetWord = getDailyWord(today);
    
    // Try to load saved game state for today
    const savedState = loadGameState();
    if (savedState && savedState.date === getDateString(today)) {
        // Resume saved game
        Object.assign(GAME_STATE, savedState);
        restoreGameBoard();
    } else {
        // Start new game
        GAME_STATE.currentRow = 0;
        GAME_STATE.currentCol = 0;
        GAME_STATE.gameOver = false;
        GAME_STATE.gameWon = false;
        GAME_STATE.currentWord = '';
        GAME_STATE.guesses = [];
        GAME_STATE.keyboardState = {};
    }
    
    createGameBoard();
    createKeyboard();
    updateCountdown();
    
    // Update countdown every second
    setInterval(updateCountdown, 1000);
}

function createGameBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < 6; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        rowElement.dataset.row = row;
        
        for (let col = 0; col < 5; col++) {
            const letter = document.createElement('div');
            letter.className = 'letter';
            letter.dataset.row = row;
            letter.dataset.col = col;
            rowElement.appendChild(letter);
        }
        
        gameBoard.appendChild(rowElement);
    }
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    
    KEYBOARD_LAYOUT.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyElement = document.createElement('button');
            keyElement.className = 'key';
            keyElement.dataset.key = key;
            
            if (key === 'ENTER' || key === 'BACKSPACE') {
                keyElement.classList.add('wide');
            }
            
            if (key === 'BACKSPACE') {
                keyElement.innerHTML = '⌫';
            } else {
                keyElement.textContent = key;
            }
            
            keyElement.addEventListener('click', () => handleKeyPress(key));
            rowElement.appendChild(keyElement);
        });
        
        keyboard.appendChild(rowElement);
    });
}

function setupEventListeners() {
    // Physical keyboard support
    document.addEventListener('keydown', (e) => {
        if (GAME_STATE.gameOver) return;
        
        const key = e.key.toLowerCase();
        
        if (key === 'enter') {
            handleKeyPress('ENTER');
        } else if (key === 'backspace') {
            handleKeyPress('BACKSPACE');
        } else if (/^[a-zç]$/.test(key)) {
            handleKeyPress(key.toUpperCase());
        }
    });
    
    // Modal controls
    setupModalControls();
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Share buttons
    document.getElementById('share-btn').addEventListener('click', shareResults);
    document.getElementById('share-result-btn').addEventListener('click', shareResults);
}

function setupModalControls() {
    // Help modal
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    
    helpBtn.addEventListener('click', () => showModal('help-modal'));
    
    // Stats modal
    const statsBtn = document.getElementById('stats-btn');
    const statsModal = document.getElementById('stats-modal');
    
    statsBtn.addEventListener('click', () => {
        updateStatsDisplay();
        showModal('stats-modal');
    });
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal.id);
        });
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

function handleKeyPress(key) {
    if (GAME_STATE.gameOver) return;
    
    if (key === 'ENTER') {
        submitWord();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else if (GAME_STATE.currentCol < 5) {
        addLetter(key);
    }
    
    saveGameState();
}

function addLetter(letter) {
    if (GAME_STATE.currentCol >= 5) return;
    
    const letterElement = document.querySelector(
        `[data-row="${GAME_STATE.currentRow}"][data-col="${GAME_STATE.currentCol}"]`
    );
    
    letterElement.textContent = letter;
    letterElement.classList.add('filled');
    letterElement.classList.add('pop');
    
    GAME_STATE.currentWord += letter;
    GAME_STATE.currentCol++;
    
    // Remove animation class after animation completes
    setTimeout(() => {
        letterElement.classList.remove('pop');
    }, 200);
}

function deleteLetter() {
    if (GAME_STATE.currentCol <= 0) return;
    
    GAME_STATE.currentCol--;
    GAME_STATE.currentWord = GAME_STATE.currentWord.slice(0, -1);
    
    const letterElement = document.querySelector(
        `[data-row="${GAME_STATE.currentRow}"][data-col="${GAME_STATE.currentCol}"]`
    );
    
    letterElement.textContent = '';
    letterElement.classList.remove('filled');
}

function submitWord() {
    if (GAME_STATE.currentCol !== 5) {
        showToast('Palavra incompleta');
        shakeRow(GAME_STATE.currentRow);
        return;
    }
    
    const word = GAME_STATE.currentWord;
    const normalizedWord = normalizeWord(word);
    
    // Check if word is valid
    if (!isValidWord(normalizedWord)) {
        showToast('Palavra não encontrada');
        shakeRow(GAME_STATE.currentRow);
        return;
    }
    
    // Process the guess
    const result = checkWord(normalizedWord, GAME_STATE.targetWord);
    GAME_STATE.guesses.push({
        word: normalizedWord,
        result: result
    });
    
    // Animate and color the tiles
    animateRow(GAME_STATE.currentRow, result);
    
    // Update keyboard colors
    updateKeyboard(normalizedWord, result);
    
    // Check if game is won
    if (normalizedWord === GAME_STATE.targetWord) {
        GAME_STATE.gameWon = true;
        GAME_STATE.gameOver = true;
        
        setTimeout(() => {
            showToast('Parabéns!');
            bounceRow(GAME_STATE.currentRow);
            updateStats(true, GAME_STATE.currentRow + 1);
            setTimeout(() => showGameOverModal(true), 2000);
        }, 1500);
        
    } else if (GAME_STATE.currentRow >= 5) {
        // Game over - no more guesses
        GAME_STATE.gameOver = true;
        
        setTimeout(() => {
            showToast(`A palavra era: ${GAME_STATE.targetWord}`);
            updateStats(false, 0);
            setTimeout(() => showGameOverModal(false), 2000);
        }, 1500);
        
    } else {
        // Move to next row
        GAME_STATE.currentRow++;
        GAME_STATE.currentCol = 0;
        GAME_STATE.currentWord = '';
    }
    
    saveGameState();
}

function checkWord(guess, target) {
    const result = [];
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    
    // First pass: mark correct letters
    const used = new Array(5).fill(false);
    
    for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            result[i] = LETTER_STATES.CORRECT;
            used[i] = true;
        }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
        if (result[i]) continue; // Already marked as correct
        
        const letter = guessLetters[i];
        let found = false;
        
        for (let j = 0; j < 5; j++) {
            if (!used[j] && targetLetters[j] === letter) {
                result[i] = LETTER_STATES.PRESENT;
                used[j] = true;
                found = true;
                break;
            }
        }
        
        if (!found) {
            result[i] = LETTER_STATES.ABSENT;
        }
    }
    
    return result;
}

function animateRow(rowIndex, result) {
    const rowElement = document.querySelector(`[data-row="${rowIndex}"]`);
    const letters = rowElement.querySelectorAll('.letter');
    
    letters.forEach((letter, index) => {
        setTimeout(() => {
            letter.classList.add('flip');
            
            setTimeout(() => {
                letter.classList.add(result[index]);
            }, 300);
            
            setTimeout(() => {
                letter.classList.remove('flip');
            }, 600);
        }, index * 100);
    });
}

function updateKeyboard(word, result) {
    const letters = word.split('');
    
    letters.forEach((letter, index) => {
        const keyElement = document.querySelector(`[data-key="${letter}"]`);
        if (!keyElement) return;
        
        const currentState = GAME_STATE.keyboardState[letter];
        const newState = result[index];
        
        // Only update if new state is better than current
        if (!currentState || 
            (newState === LETTER_STATES.CORRECT) ||
            (newState === LETTER_STATES.PRESENT && currentState === LETTER_STATES.ABSENT)) {
            
            // Remove old state classes
            keyElement.classList.remove('correct', 'present', 'absent');
            
            // Add new state class
            keyElement.classList.add(newState);
            
            // Update state tracking
            GAME_STATE.keyboardState[letter] = newState;
        }
    });
}

function shakeRow(rowIndex) {
    const rowElement = document.querySelector(`[data-row="${rowIndex}"]`);
    rowElement.classList.add('shake');
    
    setTimeout(() => {
        rowElement.classList.remove('shake');
    }, 500);
}

function bounceRow(rowIndex) {
    const rowElement = document.querySelector(`[data-row="${rowIndex}"]`);
    const letters = rowElement.querySelectorAll('.letter');
    
    letters.forEach((letter, index) => {
        setTimeout(() => {
            letter.classList.add('bounce');
            
            setTimeout(() => {
                letter.classList.remove('bounce');
            }, 1000);
        }, index * 100);
    });
}

function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

function showGameOverModal(won) {
    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const message = document.getElementById('game-over-message');
    const correctWord = document.getElementById('correct-word');
    
    if (won) {
        title.textContent = 'Parabéns!';
        message.textContent = 'Descobriste a palavra!';
    } else {
        title.textContent = 'Que pena!';
        message.textContent = 'Não foi desta vez.';
    }
    
    correctWord.textContent = GAME_STATE.targetWord;
    
    showModal('game-over-modal');
}

// Statistics
function updateStats(won, attempts) {
    let stats = loadStats();
    
    stats.gamesPlayed++;
    
    if (won) {
        stats.gamesWon++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        stats.guessDistribution[attempts - 1]++;
    } else {
        stats.currentStreak = 0;
    }
    
    saveStats(stats);
}

function loadStats() {
    const defaultStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
    };
    
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.STATS);
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    } catch {
        return defaultStats;
    }
}

function saveStats(stats) {
    try {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
        console.error('Failed to save stats:', e);
    }
}

function updateStatsDisplay() {
    const stats = loadStats();
    
    document.getElementById('games-played').textContent = stats.gamesPlayed;
    document.getElementById('win-percentage').textContent = 
        stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    document.getElementById('current-streak').textContent = stats.currentStreak;
    document.getElementById('max-streak').textContent = stats.maxStreak;
    
    // Update guess distribution
    const container = document.getElementById('distribution-container');
    container.innerHTML = '';
    
    const maxGuesses = Math.max(...stats.guessDistribution, 1);
    
    stats.guessDistribution.forEach((count, index) => {
        const row = document.createElement('div');
        row.className = 'guess-row';
        
        const number = document.createElement('div');
        number.className = 'guess-number';
        number.textContent = index + 1;
        
        const bar = document.createElement('div');
        bar.className = 'guess-bar';
        bar.style.width = `${Math.max((count / maxGuesses) * 100, 7)}%`;
        bar.textContent = count;
        
        // Highlight current game result
        if (GAME_STATE.gameWon && GAME_STATE.currentRow === index) {
            bar.classList.add('highlight');
        }
        
        row.appendChild(number);
        row.appendChild(bar);
        container.appendChild(row);
    });
}

// Share functionality
function shareResults() {
    const stats = loadStats();
    const attempts = GAME_STATE.gameWon ? GAME_STATE.currentRow + 1 : 'X';
    
    let shareText = `Letreco ${getDateString()} ${attempts}/6\n\n`;
    
    // Add emoji grid
    GAME_STATE.guesses.forEach(guess => {
        const row = guess.result.map(state => {
            switch (state) {
                case LETTER_STATES.CORRECT: return '🟩';
                case LETTER_STATES.PRESENT: return '🟨';
                case LETTER_STATES.ABSENT: return '⬜';
                default: return '⬜';
            }
        }).join('');
        shareText += row + '\n';
    });
    
    shareText += '\nhttps://letreco.vercel.app';
    
    if (navigator.share) {
        navigator.share({
            title: 'Letreco',
            text: shareText
        }).catch(err => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Resultado copiado!');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Resultado copiado!');
    } catch (err) {
        showToast('Erro ao copiar');
    }
    
    document.body.removeChild(textArea);
}

// Theme management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save preference
    try {
        localStorage.setItem('letreco_theme', newTheme);
    } catch (e) {
        console.error('Failed to save theme:', e);
    }
}

function loadSettings() {
    // Load theme preference
    try {
        const savedTheme = localStorage.getItem('letreco_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // Default to user's system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    } catch (e) {
        console.error('Failed to load theme:', e);
    }
}

// Game state persistence
function saveGameState() {
    const state = {
        ...GAME_STATE,
        date: getDateString()
    };
    
    try {
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save game state:', e);
    }
}

function loadGameState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to load game state:', e);
        return null;
    }
}

function restoreGameBoard() {
    // Restore guesses and board state
    GAME_STATE.guesses.forEach((guess, rowIndex) => {
        const word = guess.word;
        const result = guess.result;
        
        // Fill the row
        for (let col = 0; col < 5; col++) {
            const letterElement = document.querySelector(`[data-row="${rowIndex}"][data-col="${col}"]`);
            letterElement.textContent = word[col];
            letterElement.classList.add('filled', result[col]);
        }
        
        // Update keyboard
        updateKeyboard(word, result);
    });
    
    // If game is over, show appropriate modal
    if (GAME_STATE.gameOver) {
        setTimeout(() => {
            showGameOverModal(GAME_STATE.gameWon);
        }, 1000);
    }
}

// Countdown to next game
function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const countdown = document.getElementById('countdown');
    if (countdown) {
        countdown.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Utility functions
function getDateString(date = new Date()) {
    return date.toISOString().split('T')[0];
}

// Debug function - remove in production
function setTestWord(word) {
    GAME_STATE.targetWord = normalizeWord(word);
    console.log('Target word set to:', GAME_STATE.targetWord);
}

// Make debug function available globally for testing
window.setTestWord = setTestWord;