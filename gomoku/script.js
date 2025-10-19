// Game state variables
let board = [];
let currentPlayer = 'black';
let gameOver = false;
const BOARD_SIZE = 15;
let moveHistory = [];
let moveCount = 0;

// DOM elements
const boardElement = document.getElementById('board');
const playerElement = document.getElementById('player');
const winMessageElement = document.getElementById('win-message');
const restartBtn = document.getElementById('restart-btn');
const undoBtn = document.getElementById('undo-btn');
const hintBtn = document.getElementById('hint-btn');
const moveCountElement = document.getElementById('move-count');

// Initialize the game
function initGame() {
    // Create empty board
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
    
    // Clear the board element
    boardElement.innerHTML = '';
    
    // Set up the board UI with proper row structure
    boardElement.style.width = (30 * BOARD_SIZE) + 'px';
    boardElement.style.height = (30 * BOARD_SIZE) + 'px';
    
    // Create rows and cells
    for (let i = 0; i < BOARD_SIZE; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.dataset.row = i;
        
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => handleCellClick(i, j));
            row.appendChild(cell);
        }
        
        boardElement.appendChild(row);
    }
    
    // Reset game state
    currentPlayer = 'black';
    gameOver = false;
    moveHistory = [];
    moveCount = 0;
    playerElement.textContent = '黑子';
    winMessageElement.textContent = '';
    moveCountElement.textContent = '步数: 0';
    
    // Add visual indicator for current player
    updatePlayerIndicator();
    
    // Enable undo button
    undoBtn.disabled = false;
}

// Update player indicator
function updatePlayerIndicator() {
    const indicators = document.querySelectorAll('.player-indicator');
    indicators.forEach(indicator => indicator.remove());
    
    const indicator = document.createElement('span');
    indicator.className = 'player-indicator';
    indicator.textContent = '●';
    indicator.style.color = currentPlayer === 'black' ? '#000' : '#fff';
    indicator.style.marginLeft = '5px';
    playerElement.appendChild(indicator);
}

// Handle cell click
function handleCellClick(row, col) {
    // If game is over or cell is already occupied, do nothing
    if (gameOver || board[row][col] !== null) {
        return;
    }
    
    // Save move to history
    moveHistory.push({row, col, player: currentPlayer});
    moveCount++;
    moveCountElement.textContent = `步数: ${moveCount}`;
    
    // Place the stone
    board[row][col] = currentPlayer;
    
    // Update UI
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    const stone = document.createElement('div');
    stone.className = `stone ${currentPlayer}-stone`;
    cell.appendChild(stone);
    
    // Add placement animation
    stone.style.transform = 'scale(0)';
    setTimeout(() => {
        stone.style.transition = 'transform 0.2s ease';
        stone.style.transform = 'scale(1)';
    }, 10);
    
    // Check for win
    if (checkWin(row, col)) {
        gameOver = true;
        const winner = currentPlayer === 'black' ? '黑子' : '白子';
        winMessageElement.textContent = `${winner}获胜！`;
        highlightWinningStones(getWinningStones(row, col));
        undoBtn.disabled = true;
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    playerElement.textContent = currentPlayer === 'black' ? '黑子' : '白子';
    updatePlayerIndicator();
}

// Get winning stones for highlighting
function getWinningStones(row, col) {
    const player = board[row][col];
    const winningStones = [{row, col}];
    
    // Check all directions
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    
    for (const [dx, dy] of directions) {
        let count = 1;
        let stones = [{row, col}];
        
        // Check positive direction
        for (let i = 1; i < 5; i++) {
            const r = row + dx * i;
            const c = col + dy * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                count++;
                stones.push({row: r, col: c});
            } else {
                break;
            }
        }
        
        // Check negative direction
        for (let i = 1; i < 5; i++) {
            const r = row - dx * i;
            const c = col - dy * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                count++;
                stones.push({row: r, col: c});
            } else {
                break;
            }
        }
        
        if (count >= 5) {
            return stones;
        }
    }
    
    return winningStones;
}

// Highlight winning stones
function highlightWinningStones(stones) {
    stones.forEach(({row, col}) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        const stone = cell.querySelector('.stone');
        if (stone) {
            stone.style.boxShadow = '0 0 10px 3px gold';
            stone.style.zIndex = '20';
        }
    });
}

// Check for win condition
function checkWin(row, col) {
    const player = board[row][col];
    if (!player) return false;
    
    // Check all directions: horizontal, vertical, diagonal
    const directions = [
        [0, 1],  // horizontal
        [1, 0],  // vertical
        [1, 1],  // diagonal \
        [1, -1]  // diagonal /
    ];
    
    for (const [dx, dy] of directions) {
        let count = 1; // Count the current stone
        
        // Check positive direction
        for (let i = 1; i < 5; i++) {
            const r = row + dx * i;
            const c = col + dy * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                count++;
            } else {
                break;
            }
        }
        
        // Check negative direction
        for (let i = 1; i < 5; i++) {
            const r = row - dx * i;
            const c = col - dy * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                count++;
            } else {
                break;
            }
        }
        
        if (count >= 5) {
            return true;
        }
    }
    
    return false;
}

// Undo last move
function undoMove() {
    if (gameOver || moveHistory.length === 0) {
        return;
    }
    
    // Get the last move
    const lastMove = moveHistory.pop();
    const {row, col, player} = lastMove;
    
    // Remove stone from board
    board[row][col] = null;
    
    // Remove stone from UI
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    const stone = cell.querySelector('.stone');
    if (stone) {
        cell.removeChild(stone);
    }
    
    // Update move count
    moveCount--;
    moveCountElement.textContent = `步数: ${moveCount}`;
    
    // Switch player back
    currentPlayer = player;
    playerElement.textContent = currentPlayer === 'black' ? '黑子' : '白子';
    updatePlayerIndicator();
    
    // Clear win message if there was one
    winMessageElement.textContent = '';
}

// Show hint for next move
function showHint() {
    if (gameOver) return;
    
    // Simple hint algorithm: find an empty spot near existing stones
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === null) {
                // Check if there's a nearby stone
                for (let di = -2; di <= 2; di++) {
                    for (let dj = -2; dj <= 2; dj++) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && board[ni][nj] !== null) {
                            // Highlight this cell as a hint
                            const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                            cell.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                            
                            // Remove hint after 1 second
                            setTimeout(() => {
                                if (cell) {
                                    cell.style.backgroundColor = '';
                                }
                            }, 1000);
                            return;
                        }
                    }
                }
            }
        }
    }
}

// Event listeners
restartBtn.addEventListener('click', initGame);
undoBtn.addEventListener('click', undoMove);
hintBtn.addEventListener('click', showHint);

// Initialize the game when page loads
window.addEventListener('load', initGame);