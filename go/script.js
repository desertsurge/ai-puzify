class GoGame {
    constructor(size = 19) {
        this.size = size;
        this.board = Array(size).fill().map(() => Array(size).fill(0)); // 0: empty, 1: black, 2: white
        this.currentPlayer = 1; // 1: black, 2: white
        this.previousBoard = null;
        this.captures = {1: 0, 2: 0}; // black and white captures
        this.passCount = 0;
        this.gameOver = false;
        this.lastMove = null;
    }

    // Calculate territory and score for both players
    calculateScore() {
        // Create a copy of the board to mark territories
        const boardCopy = this.board.map(row => [...row]);
        let blackTerritory = 0;
        let whiteTerritory = 0;

        // Mark all stones as visited initially
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (boardCopy[r][c] !== 0) {
                    boardCopy[r][c] = -1; // Mark as visited
                }
            }
        }

        // Find territories
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (boardCopy[r][c] === 0) { // Empty intersection
                    const territoryResult = this.getTerritoryOwner(r, c, boardCopy);
                    if (territoryResult.owner === 1) {
                        blackTerritory += territoryResult.count;
                    } else if (territoryResult.owner === 2) {
                        whiteTerritory += territoryResult.count;
                    }
                }
            }
        }

        return {
            black: this.captures[1] + blackTerritory,
            white: this.captures[2] + whiteTerritory
        };
    }

    // Helper function to determine territory owner and count
    getTerritoryOwner(startRow, startCol, boardCopy) {
        const visited = Array(this.size).fill().map(() => Array(this.size).fill(false));
        const stack = [[startRow, startCol]];
        const territory = [];
        let potentialOwner = null;
        let mixedOwnership = false;

        while (stack.length > 0) {
            const [r, c] = stack.pop();
            
            if (r < 0 || r >= this.size || c < 0 || c >= this.size || visited[r][c] || boardCopy[r][c] === -1) {
                continue;
            }

            visited[r][c] = true;

            if (this.board[r][c] === 0) { // Empty intersection
                territory.push([r, c]);
                boardCopy[r][c] = -1; // Mark as visited

                // Check adjacent intersections
                const directions = [[-1,0], [1,0], [0,-1], [0,1]];
                for (const [dr, dc] of directions) {
                    const newR = r + dr;
                    const newC = c + dc;
                    stack.push([newR, newC]);
                }
            } else { // Stone present
                if (potentialOwner === null) {
                    potentialOwner = this.board[r][c];
                } else if (potentialOwner !== this.board[r][c]) {
                    mixedOwnership = true; // Territory borders both black and white stones
                }
            }
        }

        // If territory borders stones of different colors or no clear owner, don't count it
        if (mixedOwnership || potentialOwner === null) {
            // Reset visited territory to unvisited
            for (const [r, c] of territory) {
                boardCopy[r][c] = 0;
            }
            return { owner: 0, count: 0 };
        }

        return { owner: potentialOwner, count: territory.length };
    }

    // Place a stone on the board
    placeStone(row, col) {
        if (this.gameOver) return false;
        if (this.board[row][col] !== 0) return false; // Position already occupied

        // Create a copy of the current board state
        this.previousBoard = this.board.map(r => [...r]);

        // Place the stone
        this.board[row][col] = this.currentPlayer;

        // Check for captures
        const opponent = this.currentPlayer === 1 ? 2 : 1;
        let capturedCount = 0;
        
        // Check adjacent positions for opponent stones
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
                if (this.board[newRow][newCol] === opponent) {
                    if (!this.hasLiberty(newRow, newCol, this.board)) {
                        capturedCount += this.captureGroup(newRow, newCol);
                    }
                }
            }
        }

        // Check if the placed stone has liberty
        if (!this.hasLiberty(row, col, this.board)) {
            // Restore the board to previous state
            this.board = this.previousBoard;
            return false; // Suicide move, not allowed
        }

        // Check for ko rule violation (repeating board position)
        if (this.isSameBoard(this.previousBoard)) {
            this.board = this.previousBoard;
            return false; // Ko violation
        }

        this.captures[this.currentPlayer] += capturedCount;
        this.lastMove = {row, col};
        this.passCount = 0;

        // Switch to the next player
        this.currentPlayer = opponent;
        
        return true;
    }

    // Check if a group has liberty
    hasLiberty(row, col, board) {
        const color = board[row][col];
        if (color === 0) return false;
        
        const visited = Array(this.size).fill().map(() => Array(this.size).fill(false));
        const stack = [[row, col]];
        
        while (stack.length > 0) {
            const [r, c] = stack.pop();
            
            if (visited[r][c]) continue;
            visited[r][c] = true;
            
            // Check adjacent positions
            const directions = [[-1,0], [1,0], [0,-1], [0,1]];
            for (const [dr, dc] of directions) {
                const newR = r + dr;
                const newC = c + dc;
                
                if (newR >= 0 && newR < this.size && newC >= 0 && newC < this.size) {
                    if (board[newR][newC] === 0) {
                        return true; // Found a liberty
                    } else if (board[newR][newC] === color) {
                        stack.push([newR, newC]);
                    }
                }
            }
        }
        
        return false; // No liberty found
    }

    // Capture a group of stones
    captureGroup(startRow, startCol) {
        const color = this.board[startRow][startCol];
        const captured = [];
        const visited = Array(this.size).fill().map(() => Array(this.size).fill(false));
        const stack = [[startRow, startCol]];
        
        while (stack.length > 0) {
            const [r, c] = stack.pop();
            
            if (visited[r][c]) continue;
            visited[r][c] = true;
            
            if (this.board[r][c] === color) {
                captured.push([r, c]);
                this.board[r][c] = 0; // Remove the stone
                
                // Add adjacent positions to the stack
                const directions = [[-1,0], [1,0], [0,-1], [0,1]];
                for (const [dr, dc] of directions) {
                    const newR = r + dr;
                    const newC = c + dc;
                    
                    if (newR >= 0 && newR < this.size && newC >= 0 && newC < this.size) {
                        if (this.board[newR][newC] === color && !visited[newR][newC]) {
                            stack.push([newR, newC]);
                        }
                    }
                }
            }
        }
        
        return captured.length;
    }

    // Check if boards are the same
    isSameBoard(otherBoard) {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] !== otherBoard[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    // Pass the turn
    pass() {
        this.passCount++;
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        
        if (this.passCount >= 2) {
            this.gameOver = true;
            return true;
        }
        
        return true;
    }

    // Reset the game
    reset() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.currentPlayer = 1;
        this.previousBoard = null;
        this.captures = {1: 0, 2: 0};
        this.passCount = 0;
        this.gameOver = false;
        this.lastMove = null;
    }
}

// UI
document.addEventListener('DOMContentLoaded', () => {
    const game = new GoGame(19); // Standard 19x19 board
    const boardElement = document.getElementById('game-board');
    const currentPlayerElement = document.getElementById('current-player');
    const blackCapturesElement = document.getElementById('black-captures');
    const whiteCapturesElement = document.getElementById('white-captures');
    const gameStatusElement = document.getElementById('game-status');
    const passButton = document.getElementById('pass-btn');
    const resetButton = document.getElementById('reset-btn');

    // Function to calculate dynamic board size
    function calculateBoardSize() {
        // Calculate available size considering both width and height constraints
        const isMobile = window.innerWidth <= 768;
        const widthPercentage = isMobile ? 0.95 : 0.9; // 与CSS保持一致
        const heightAllowance = 200; // 为标题和按钮预留的空间
        
        const maxWidth = window.innerWidth * widthPercentage;
        const maxHeight = window.innerHeight - heightAllowance;
        
        // 使用较小的值以确保棋盘完全可见
        return Math.min(maxWidth, maxHeight);
    }

    // Create the game board
    function createBoard() {
        boardElement.innerHTML = '';
        
        // Calculate the board size dynamically
        const boardSize = calculateBoardSize();
        // For a 19x19 board, we have 18 intervals, so cell size is total size / 18
        const cellSize = boardSize / (game.size - 1);
        
        // 设置棋盘尺寸，但确保不会超出容器
        boardElement.style.width = `${boardSize}px`;
        boardElement.style.height = `${boardSize}px`;

        // Create board container
        const boardContainer = document.createElement('div');
        boardContainer.className = 'board-container';
        boardElement.appendChild(boardContainer);
        
        // Create grid lines
        const boardGrid = document.createElement('div');
        boardGrid.className = 'board-grid';
        boardContainer.appendChild(boardGrid);

        // Create grid lines using percentage-based positioning
        for (let i = 0; i < game.size; i++) {
            const pos = (i / (game.size - 1)) * 100; // Percentage position
            
            // Horizontal lines
            const hLine = document.createElement('div');
            hLine.style.position = 'absolute';
            hLine.style.left = '0';
            hLine.style.top = `${pos}%`;
            hLine.style.width = '100%';
            hLine.style.height = '1px';
            hLine.style.backgroundColor = '#5d4037';
            hLine.style.transform = 'translateY(-50%)'; // 精确对齐到交叉点
            boardGrid.appendChild(hLine);
            
            // Vertical lines
            const vLine = document.createElement('div');
            vLine.style.position = 'absolute';
            vLine.style.left = `${pos}%`;
            vLine.style.top = '0';
            vLine.style.width = '1px';
            vLine.style.height = '100%';
            vLine.style.backgroundColor = '#5d4037';
            vLine.style.transform = 'translateX(-50%)'; // 精确对齐到交叉点
            boardGrid.appendChild(vLine);
        }

        // Create intersections where stones can be placed using percentage-based positioning
        for (let row = 0; row < game.size; row++) {
            for (let col = 0; col < game.size; col++) {
                const posX = (col / (game.size - 1)) * 100; // Percentage X coordinate
                const posY = (row / (game.size - 1)) * 100; // Percentage Y coordinate
                
                const intersection = document.createElement('div');
                intersection.className = 'intersection';
                intersection.style.left = `${posX}%`;
                intersection.style.top = `${posY}%`;
                intersection.dataset.row = row;
                intersection.dataset.col = col;
                
                intersection.addEventListener('click', () => {
                    if (game.gameOver) return;
                    
                    const r = parseInt(intersection.dataset.row);
                    const c = parseInt(intersection.dataset.col);
                    
                    if (game.placeStone(r, c)) {
                        updateBoard();
                        updateGameInfo();
                    } else {
                        // Show error for invalid move
                        gameStatusElement.textContent = '无效走法！请重试。';
                        setTimeout(() => {
                            gameStatusElement.textContent = '';
                        }, 2000);
                    }
                });
                
                boardContainer.appendChild(intersection);
            }
        }
        
        updateBoard();
        updateGameInfo();
    }

    // Update the visual board based on game state
    function updateBoard() {
        // Remove existing stones
        const existingStones = boardElement.querySelectorAll('.stone');
        existingStones.forEach(stone => stone.remove());
        
        // Remove existing last move indicators
        const existingLastMove = boardElement.querySelectorAll('.last-move');
        existingLastMove.forEach(marker => marker.remove());

        // Add stones based on current board state using percentage positioning
        for (let row = 0; row < game.size; row++) {
            for (let col = 0; col < game.size; col++) {
                if (game.board[row][col] !== 0) {
                    const posX = (col / (game.size - 1)) * 100; // Percentage X coordinate
                    const posY = (row / (game.size - 1)) * 100; // Percentage Y coordinate
                    
                    const stone = document.createElement('div');
                    stone.className = `stone ${game.board[row][col] === 1 ? 'black' : 'white'}`;
                    stone.style.left = `${posX}%`;
                    stone.style.top = `${posY}%`;
                    stone.style.position = 'absolute';
                    stone.style.transform = 'translate(-50%, -50%)'; // 精确居中
                    boardElement.querySelector('.board-container').appendChild(stone);
                    
                    // Highlight the last move
                    if (game.lastMove && game.lastMove.row === row && game.lastMove.col === col) {
                        const lastMoveMarker = document.createElement('div');
                        lastMoveMarker.className = 'last-move';
                        lastMoveMarker.style.left = `${posX}%`;
                        lastMoveMarker.style.top = `${posY}%`;
                        lastMoveMarker.style.position = 'absolute';
                        lastMoveMarker.style.transform = 'translate(-50%, -50%)'; // 精确居中
                        boardElement.querySelector('.board-container').appendChild(lastMoveMarker);
                    }
                }
            }
        }
    }

    // Update game info display
    function updateGameInfo() {
        currentPlayerElement.textContent = game.currentPlayer === 1 ? '黑棋' : '白棋';
        blackCapturesElement.textContent = game.captures[1];
        whiteCapturesElement.textContent = game.captures[2];
        
        // Calculate and display scores
        const scores = game.calculateScore();
        document.getElementById('black-score').textContent = scores.black;
        document.getElementById('white-score').textContent = scores.white;
        
        if (game.gameOver) {
            gameStatusElement.textContent = '游戏结束！';
        }
    }

    // Button event handlers
    passButton.addEventListener('click', () => {
        if (game.gameOver) return;
        game.pass();
        updateGameInfo();
    });
    
    resetButton.addEventListener('click', () => {
        game.reset();
        createBoard(); // Reinitialize the board to reset the layout as well
    });

    // Rules toggle functionality
    const rulesToggle = document.getElementById('rules-toggle');
    const rulesSection = document.getElementById('rules-section');
    const closeRules = document.getElementById('close-rules');

    if (rulesToggle && rulesSection) {
        rulesToggle.addEventListener('click', () => {
            rulesSection.style.display = rulesSection.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (closeRules && rulesSection) {
        closeRules.addEventListener('click', () => {
            rulesSection.style.display = 'none';
        });
    }

    // Handle window resize to adjust board size
    window.addEventListener('resize', () => {
        createBoard();
    });

    // Initialize the board
    createBoard();
});