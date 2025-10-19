class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameOver = false;
        this.inCheck = { white: false, black: false };
        
        this.pieceSymbols = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.setupEventListeners();
        this.renderBoard();
        this.updateGameInfo();
    }
    
    createBoard() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        
        // 设置初始棋子位置
        this.setupPieces();
    }
    
    setupPieces() {
        // 设置黑方棋子
        this.board[0] = [
            { type: 'rook', color: 'black' },
            { type: 'knight', color: 'black' },
            { type: 'bishop', color: 'black' },
            { type: 'queen', color: 'black' },
            { type: 'king', color: 'black' },
            { type: 'bishop', color: 'black' },
            { type: 'knight', color: 'black' },
            { type: 'rook', color: 'black' }
        ];
        
        this.board[1] = Array(8).fill().map(() => ({ type: 'pawn', color: 'black' }));
        
        // 设置白方棋子
        this.board[6] = Array(8).fill().map(() => ({ type: 'pawn', color: 'white' }));
        
        this.board[7] = [
            { type: 'rook', color: 'white' },
            { type: 'knight', color: 'white' },
            { type: 'bishop', color: 'white' },
            { type: 'queen', color: 'white' },
            { type: 'king', color: 'white' },
            { type: 'bishop', color: 'white' },
            { type: 'knight', color: 'white' },
            { type: 'rook', color: 'white' }
        ];
    }
    
    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('clear-selection').addEventListener('click', () => {
            this.clearSelection();
        });
        
        document.getElementById('toggle-rules-mobile').addEventListener('click', () => {
            this.toggleRulesMobile();
        });
    }
    
    renderBoard() {
        const chessboard = document.querySelector('.chessboard');
        chessboard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // 添加坐标标记
                if (col === 7) {
                    const rank = document.createElement('div');
                    rank.className = 'coordinate rank';
                    rank.textContent = 8 - row;
                    square.appendChild(rank);
                }
                
                if (row === 7) {
                    const file = document.createElement('div');
                    file.className = 'coordinate file';
                    file.textContent = String.fromCharCode(97 + col);
                    square.appendChild(file);
                }
                
                // 添加棋子
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = this.getPieceSymbol(piece);
                    pieceElement.style.color = piece.color === 'white' ? '#ffffff' : '#1a1a1a';
                    pieceElement.style.textShadow = piece.color === 'white' ? 
                        '0 0 4px #000, 0 0 6px #000' : 
                        '0 0 4px #fff, 0 0 6px #fff';
                    pieceElement.style.filter = piece.color === 'white' ? 
                        'drop-shadow(0 0 3px rgba(0,0,0,0.5))' : 
                        'drop-shadow(0 0 3px rgba(255,255,255,0.5))';
                    square.appendChild(pieceElement);
                }
                
                // 添加触摸和点击事件支持
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                square.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.handleSquareTouch(row, col);
                }, { passive: false });
                chessboard.appendChild(square);
            }
        }
        
        this.highlightValidMoves();
    }
    
    getPieceSymbol(piece) {
        return this.pieceSymbols[piece.color][piece.type];
    }
    
    handleSquareClick(row, col) {
        this.handleSquareInteraction(row, col);
    }
    
    handleSquareTouch(row, col) {
        // 移动端触摸处理，增加300ms延迟防止误触
        setTimeout(() => {
            this.handleSquareInteraction(row, col);
        }, 50);
    }
    
    handleSquareInteraction(row, col) {
        if (this.gameOver) return;
        
        const clickedPiece = this.board[row][col];
        
        // 如果点击了已选中的棋子，取消选择
        if (this.selectedPiece && 
            this.selectedPiece.row === row && 
            this.selectedPiece.col === col) {
            this.clearSelection();
            return;
        }
        
        // 如果点击了有效移动位置
        if (this.selectedPiece && this.isValidMove(row, col)) {
            this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
            return;
        }
        
        // 如果点击了对方的棋子，清除选择
        if (clickedPiece && clickedPiece.color !== this.currentPlayer) {
            this.clearSelection();
            return;
        }
        
        // 选择棋子
        if (clickedPiece && clickedPiece.color === this.currentPlayer) {
            this.selectPiece(row, col);
        }
    }
    
    selectPiece(row, col) {
        this.clearSelection();
        
        this.selectedPiece = { row, col };
        this.validMoves = this.calculateValidMoves(row, col);
        
        // 高亮选中的棋子和有效移动
        const squares = document.querySelectorAll('.square');
        const selectedSquare = Array.from(squares).find(sq => 
            parseInt(sq.dataset.row) === row && parseInt(sq.dataset.col) === col
        );
        
        if (selectedSquare) {
            selectedSquare.classList.add('selected');
        }
        
        this.highlightValidMoves();
    }
    
    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
        
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move', 'valid-capture');
        });
    }
    
    highlightValidMoves() {
        if (!this.selectedPiece) return;
        
        this.validMoves.forEach(move => {
            const squares = document.querySelectorAll('.square');
            const targetSquare = Array.from(squares).find(sq => 
                parseInt(sq.dataset.row) === move.row && parseInt(sq.dataset.col) === move.col
            );
            
            if (targetSquare) {
                if (this.board[move.row][move.col]) {
                    targetSquare.classList.add('valid-capture');
                } else {
                    targetSquare.classList.add('valid-move');
                }
            }
        });
    }
    
    calculateValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        
        switch (piece.type) {
            case 'pawn':
                this.calculatePawnMoves(row, col, piece, moves);
                break;
            case 'knight':
                this.calculateKnightMoves(row, col, piece, moves);
                break;
            case 'bishop':
                this.calculateBishopMoves(row, col, piece, moves);
                break;
            case 'rook':
                this.calculateRookMoves(row, col, piece, moves);
                break;
            case 'queen':
                this.calculateQueenMoves(row, col, piece, moves);
                break;
            case 'king':
                this.calculateKingMoves(row, col, piece, moves);
                break;
        }
        
        return moves.filter(move => this.isMoveValid(row, col, move.row, move.col));
    }
    
    calculatePawnMoves(row, col, piece, moves) {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // 前进一格
        if (this.isInBounds(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // 前进两格（起始位置）
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        // 吃子
        [-1, 1].forEach(dc => {
            if (this.isInBounds(row + direction, col + dc) && 
                this.board[row + direction][col + dc] &&
                this.board[row + direction][col + dc].color !== piece.color) {
                moves.push({ row: row + direction, col: col + dc });
            }
        });
    }
    
    calculateKnightMoves(row, col, piece, moves) {
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        knightMoves.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isInBounds(newRow, newCol) && 
                (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== piece.color)) {
                moves.push({ row: newRow, col: newCol });
            }
        });
    }
    
    calculateBishopMoves(row, col, piece, moves) {
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        this.calculateSlidingMoves(row, col, piece, directions, moves);
    }
    
    calculateRookMoves(row, col, piece, moves) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        this.calculateSlidingMoves(row, col, piece, directions, moves);
    }
    
    calculateQueenMoves(row, col, piece, moves) {
        const directions = [
            [-1, -1], [-1, 1], [1, -1], [1, 1],
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ];
        this.calculateSlidingMoves(row, col, piece, directions, moves);
    }
    
    calculateKingMoves(row, col, piece, moves) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isInBounds(newRow, newCol) && 
                    (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== piece.color)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }
    
    calculateSlidingMoves(row, col, piece, directions, moves) {
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * dr;
                const newCol = col + i * dc;
                
                if (!this.isInBounds(newRow, newCol)) break;
                
                if (!this.board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.board[newRow][newCol].color !== piece.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
    }
    
    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    isMoveValid(fromRow, fromCol, toRow, toCol) {
        // 简化验证 - 实际游戏中需要更复杂的验证
        return true;
    }
    
    isValidMove(row, col) {
        return this.validMoves.some(move => move.row === row && move.col === col);
    }
    
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // 记录被吃掉的棋子
        if (capturedPiece) {
            this.capturedPieces[this.currentPlayer].push(capturedPiece);
        }
        
        // 执行移动
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // 记录走棋历史
        const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, capturedPiece);
        this.moveHistory.push({
            player: this.currentPlayer,
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            notation: moveNotation
        });
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // 检查游戏是否结束
        this.checkGameStatus();
        
        // 更新界面
        this.clearSelection();
        this.renderBoard();
        this.updateGameInfo();
        this.updateCapturedPieces();
        this.updateMoveHistory();
    }
    
    getMoveNotation(fromRow, fromCol, toRow, toCol, capturedPiece) {
        const piece = this.board[toRow][toCol];
        const files = 'abcdefgh';
        const fromFile = files[fromCol];
        const toFile = files[toCol];
        const fromRank = 8 - fromRow;
        const toRank = 8 - toRow;
        
        let notation = '';
        
        if (piece.type !== 'pawn') {
            notation += piece.type === 'knight' ? 'N' : piece.type[0].toUpperCase();
        }
        
        notation += capturedPiece ? 'x' : '';
        notation += `${toFile}${toRank}`;
        
        // 检查是否将军
        const opponentColor = piece.color === 'white' ? 'black' : 'white';
        if (this.isKingInCheck(opponentColor)) {
            notation += '+';
        }
        
        return notation;
    }
    
    checkGameStatus() {
        // 检查将军状态
        this.inCheck.white = this.isKingInCheck('white');
        this.inCheck.black = this.isKingInCheck('black');
        
        // 检查王是否被吃掉（游戏结束）
        const kings = { white: false, black: false };
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king') {
                    kings[piece.color] = true;
                }
            }
        }
        
        if (!kings.white) {
            this.gameOver = true;
            document.getElementById('game-status').textContent = '黑方胜利！';
        } else if (!kings.black) {
            this.gameOver = true;
            document.getElementById('game-status').textContent = '白方胜利！';
        }
        
        // 更新将军提示
        this.updateCheckIndicator();
    }
    
    isKingInCheck(color) {
        // 找到王的位置
        let kingRow, kingCol;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
        }
        
        if (kingRow === undefined) return false;
        
        // 检查对方棋子是否能够攻击到王的位置
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === opponentColor) {
                    // 检查这个棋子是否能攻击到王
                    if (this.canAttackPiece(row, col, kingRow, kingCol)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    canAttackPiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        // 根据不同棋子类型检查攻击路径
        switch (piece.type) {
            case 'pawn':
                // 兵只能斜着吃子
                const direction = piece.color === 'white' ? -1 : 1;
                return (toRow === fromRow + direction && 
                       (toCol === fromCol - 1 || toCol === fromCol + 1));
                
            case 'knight':
                // 马的攻击范围
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                return knightMoves.some(([dr, dc]) => 
                    toRow === fromRow + dr && toCol === fromCol + dc
                );
                
            case 'bishop':
                return this.canAttackSliding(fromRow, fromCol, toRow, toCol, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
                
            case 'rook':
                return this.canAttackSliding(fromRow, fromCol, toRow, toCol, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
                
            case 'queen':
                return this.canAttackSliding(fromRow, fromCol, toRow, toCol, [
                    [-1, -1], [-1, 1], [1, -1], [1, 1],
                    [-1, 0], [1, 0], [0, -1], [0, 1]
                ]);
                
            case 'king':
                // 王只能攻击周围一格
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        if (toRow === fromRow + dr && toCol === fromCol + dc) {
                            return true;
                        }
                    }
                }
                return false;
        }
        
        return false;
    }
    
    canAttackSliding(fromRow, fromCol, toRow, toCol, directions) {
        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = fromRow + i * dr;
                const newCol = fromCol + i * dc;
                
                // 超出边界
                if (!this.isInBounds(newRow, newCol)) break;
                
                // 到达目标位置
                if (newRow === toRow && newCol === toCol) {
                    return true;
                }
                
                // 路径上有其他棋子，无法攻击
                if (this.board[newRow][newCol]) {
                    break;
                }
            }
        }
        return false;
    }
    
    updateCheckIndicator() {
        const checkIndicator = document.getElementById('check-indicator');
        
        if (this.inCheck.white && this.currentPlayer === 'white') {
            checkIndicator.innerHTML = '♔ 将军！';
            checkIndicator.className = 'check-indicator check-white';
        } else if (this.inCheck.black && this.currentPlayer === 'black') {
            checkIndicator.innerHTML = '♚ 将军！';
            checkIndicator.className = 'check-indicator check-black';
        } else {
            checkIndicator.innerHTML = '';
            checkIndicator.className = 'check-indicator';
        }
        
        // 更新游戏状态显示
        this.updateGameStatusText();
    }
    
    updateGameStatusText() {
        const gameStatus = document.getElementById('game-status');
        
        if (this.gameOver) {
            return; // 游戏已经结束，不修改状态文本
        }
        
        if (this.inCheck.white && this.currentPlayer === 'white') {
            gameStatus.textContent = '白方被将军！';
        } else if (this.inCheck.black && this.currentPlayer === 'black') {
            gameStatus.textContent = '黑方被将军！';
        } else {
            gameStatus.textContent = '游戏进行中';
        }
    }
    
    updateGameInfo() {
        document.getElementById('current-player').textContent = 
            this.currentPlayer === 'white' ? '白方' : '黑方';
        
        // 更新将军提示
        this.updateCheckIndicator();
    }
    
    updateCapturedPieces() {
        const whiteCaptured = document.getElementById('white-captured');
        const blackCaptured = document.getElementById('black-captured');
        
        whiteCaptured.innerHTML = this.capturedPieces.white.map(piece => 
            `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`
        ).join('');
        
        blackCaptured.innerHTML = this.capturedPieces.black.map(piece => 
            `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`
        ).join('');
    }
    
    updateMoveHistory() {
        const moveHistory = document.getElementById('move-history');
        moveHistory.innerHTML = '';
        
        this.moveHistory.forEach((move, index) => {
            const moveElement = document.createElement('div');
            moveElement.className = 'move-record';
            
            const moveNumber = Math.floor(index / 2) + 1;
            const isWhiteMove = index % 2 === 0;
            
            if (isWhiteMove) {
                moveElement.innerHTML = `
                    <span class="move-number">${moveNumber}.</span>
                    <span>${move.notation}</span>
                `;
            } else {
                moveElement.innerHTML = `
                    <span class="move-number"></span>
                    <span>${move.notation}</span>
                `;
            }
            
            moveHistory.appendChild(moveElement);
        });
        
        moveHistory.scrollTop = moveHistory.scrollHeight;
    }
    
    resetGame() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameOver = false;
        this.inCheck = { white: false, black: false };
        
        this.createBoard();
        this.renderBoard();
        this.updateGameInfo();
        this.updateCapturedPieces();
        this.updateMoveHistory();
    }
    
    toggleRulesMobile() {
        const rulesContent = document.querySelector('.rules-content');
        if (rulesContent) {
            rulesContent.classList.toggle('collapsed');
            
            const toggleButton = document.getElementById('toggle-rules-mobile');
            if (toggleButton) {
                toggleButton.textContent = rulesContent.classList.contains('collapsed') ? '显示规则' : '隐藏规则';
            }
        }
    }
    
    toggleRules() {
        const rulesContent = document.querySelector('.rules-content');
        if (rulesContent) {
            rulesContent.style.display = rulesContent.style.display === 'none' ? 'block' : 'none';
            
            const toggleButton = document.getElementById('toggle-rules');
            if (toggleButton) {
                toggleButton.textContent = rulesContent.style.display === 'none' ? '显示规则' : '隐藏规则';
            }
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});