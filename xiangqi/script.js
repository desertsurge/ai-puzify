// Chinese Chess (Xiangqi) Game Implementation
class XiangqiGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'red'; // Red goes first
        this.selectedPiece = null;
        this.capturedPieces = { red: [], black: [] };
        this.gameOver = false;
        this.kingPositions = { red: [9, 4], black: [0, 4] }; // Starting positions of kings
        this.inCheck = { red: false, black: false }; // Track check status
        this.fullRenderNeeded = true; // Flag to indicate if full render is needed
        this.moveHistory = []; // 记录走棋历史
        this.isReplaying = false; // 是否正在回放
        this.initializeGame();
    }

    initializeBoard() {
        // Initialize an empty 10x9 board (rows x cols)
        const board = Array(10).fill(null).map(() => Array(9).fill(null));
        
        // Place red pieces (bottom of board - from red's perspective)
        // Pawns - 5 pawns placed on row 6 (from red's perspective)
        for (let i = 0; i < 9; i += 2) {
            board[6][i] = { type: 'pawn', color: 'red' };
        }
        
        // Cannons
        board[7][1] = { type: 'cannon', color: 'red' };
        board[7][7] = { type: 'cannon', color: 'red' };
        
        // Rooks
        board[9][0] = { type: 'rook', color: 'red' };
        board[9][8] = { type: 'rook', color: 'red' };
        
        // Horses
        board[9][1] = { type: 'horse', color: 'red' };
        board[9][7] = { type: 'horse', color: 'red' };
        
        // Elephants
        board[9][2] = { type: 'elephant', color: 'red' };
        board[9][6] = { type: 'elephant', color: 'red' };
        
        // Advisors
        board[9][3] = { type: 'advisor', color: 'red' };
        board[9][5] = { type: 'advisor', color: 'red' };
        
        // King
        board[9][4] = { type: 'king', color: 'red' };
        
        // Place black pieces (top of board - from red's perspective)
        // Pawns - 5 pawns placed on row 3 (from black's perspective)
        for (let i = 0; i < 9; i += 2) {
            board[3][i] = { type: 'pawn', color: 'black' };
        }
        
        // Cannons
        board[2][1] = { type: 'cannon', color: 'black' };
        board[2][7] = { type: 'cannon', color: 'black' };
        
        // Rooks
        board[0][0] = { type: 'rook', color: 'black' };
        board[0][8] = { type: 'rook', color: 'black' };
        
        // Horses
        board[0][1] = { type: 'horse', color: 'black' };
        board[0][7] = { type: 'horse', color: 'black' };
        
        // Elephants
        board[0][2] = { type: 'elephant', color: 'black' };
        board[0][6] = { type: 'elephant', color: 'black' };
        
        // Advisors
        board[0][3] = { type: 'advisor', color: 'black' };
        board[0][5] = { type: 'advisor', color: 'black' };
        
        // King
        board[0][4] = { type: 'king', color: 'black' };
        
        return board;
    }

    initializeGame() {
        this.renderBoard();
        this.attachEventListeners();
    }

    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        
        // Only clear board lines and static elements, not pieces
        const existingPieces = gameBoard.querySelectorAll('.piece');
        
        // Clear only if it's a full render (not just updating positions)
        if (existingPieces.length === 0 || this.fullRenderNeeded) {
            gameBoard.innerHTML = '';
            
            // Add the horizontal and vertical lines to create the board
            this.createBoardLines();
            
            // Add palace diagonals
            this.createPalaceDiagonals();
            
            // Add river area
            this.createRiver();
            
            // Add intersections
            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 9; col++) {
                    this.addIntersection(row, col);
                }
            }
            
            this.fullRenderNeeded = false;
        }
        
        // Update or create pieces
        this.updatePieces();
        
        // Highlight selected piece if one is selected
        if (this.selectedPiece) {
            const [row, col] = this.selectedPiece;
            const gameBoardElement = document.getElementById('game-board');
            // Find the piece element at the selected position and add selected class
            const pieceElements = gameBoardElement.querySelectorAll('.piece');
            pieceElements.forEach(pieceEl => {
                if (parseInt(pieceEl.dataset.row) === row && parseInt(pieceEl.dataset.col) === col) {
                    pieceEl.classList.add('selected');
                }
            });
            
            // Highlight possible moves
            this.highlightPossibleMoves(row, col);
        }
        
        // Update current player display
        const playerText = this.currentPlayer === 'red' ? '红方' : '黑方';
        document.getElementById('current-player').textContent = playerText;
        
        // Update captured pieces display
        this.updateCapturedPiecesDisplay();
    }

    createBoardLines() {
        const gameBoard = document.getElementById('game-board');
        
        // Create horizontal lines (10 horizontal lines for 9 rows of grid)
        for (let i = 0; i < 10; i++) {
            const line = document.createElement('div');
            line.className = 'board-line horizontal';
            line.style.top = `${i * 70}px`;
            gameBoard.appendChild(line);
        }
        
        // Create vertical lines
        for (let i = 0; i < 9; i++) {
            // Always draw full vertical lines for column 0 and 8 (sides)
            if (i === 0 || i === 8) {
                const line = document.createElement('div');
                line.className = 'board-line vertical';
                line.style.left = `${i * 70}px`;
                line.style.height = '630px'; // 9 rows (0-9) * 70px
                gameBoard.appendChild(line);
            } else {
                // For columns 1-7, create two segments separated by the river
                // Top segment (rows 0-4)
                const topLine = document.createElement('div');
                topLine.className = 'board-line vertical';
                topLine.style.left = `${i * 70}px`;
                topLine.style.height = '280px'; // 4 rows (0-4) * 70px
                topLine.style.top = '0px';
                gameBoard.appendChild(topLine);
                
                // Bottom segment (rows 5-9)
                const bottomLine = document.createElement('div');
                bottomLine.className = 'board-line vertical';
                bottomLine.style.left = `${i * 70}px`;
                bottomLine.style.height = '280px'; // 4 rows (5-9) * 70px
                bottomLine.style.top = '350px'; // Start after the river
                gameBoard.appendChild(bottomLine);
            }
        }
    }

    createPalaceDiagonals() {
        const gameBoard = document.getElementById('game-board');
        
        // Black palace (top) diagonals
        // From (3,0) to (5,2) - left to right diagonal
        const diag1 = document.createElement('div');
        diag1.className = 'palace-diagonal';
        diag1.style.position = 'absolute';
        diag1.style.width = '198px'; // sqrt(2^2 + 2^2) * 70 ≈ 198px
        diag1.style.height = '2px';
        diag1.style.backgroundColor = 'black';
        diag1.style.top = '0px';
        diag1.style.left = '210px'; // 3 * 70
        diag1.style.transformOrigin = '0 0';
        diag1.style.transform = 'rotate(45deg)';
        gameBoard.appendChild(diag1);
        
        // From (5,0) to (3,2) - right to left diagonal
        const diag2 = document.createElement('div');
        diag2.className = 'palace-diagonal';
        diag2.style.position = 'absolute';
        diag2.style.width = '198px';
        diag2.style.height = '2px';
        diag2.style.backgroundColor = 'black';
        diag2.style.top = '0px';
        diag2.style.left = '350px'; // 5 * 70
        diag2.style.transformOrigin = '0 0';
        diag2.style.transform = 'rotate(135deg)';
        gameBoard.appendChild(diag2);
        
        // Red palace (bottom) diagonals
        // From (3,7) to (5,9) - left to right diagonal
        const diag3 = document.createElement('div');
        diag3.className = 'palace-diagonal';
        diag3.style.position = 'absolute';
        diag3.style.width = '198px';
        diag3.style.height = '2px';
        diag3.style.backgroundColor = 'black';
        diag3.style.top = '490px'; // 7 * 70
        diag3.style.left = '210px'; // 3 * 70
        diag3.style.transformOrigin = '0 0';
        diag3.style.transform = 'rotate(45deg)';
        gameBoard.appendChild(diag3);
        
        // From (5,7) to (3,9) - right to left diagonal
        const diag4 = document.createElement('div');
        diag4.className = 'palace-diagonal';
        diag4.style.position = 'absolute';
        diag4.style.width = '198px';
        diag4.style.height = '2px';
        diag4.style.backgroundColor = 'black';
        diag4.style.top = '490px'; // 7 * 70
        diag4.style.left = '350px'; // 5 * 70
        diag4.style.transformOrigin = '0 0';
        diag4.style.transform = 'rotate(135deg)';
        gameBoard.appendChild(diag4);
    }

    createRiver() {
        const gameBoard = document.getElementById('game-board');
        const river = document.createElement('div');
        river.className = 'river-area';
        river.textContent = '楚河  漢界'; // Chu River, Han Boundary
        river.style.top = '280px'; // Between row 4 and 5
        gameBoard.appendChild(river);
    }

    addIntersection(row, col) {
        const gameBoard = document.getElementById('game-board');
        const intersection = document.createElement('div');
        intersection.className = 'intersection';
        intersection.style.left = `${col * 70}px`;
        intersection.style.top = `${row * 70}px`;
        intersection.dataset.row = row;
        intersection.dataset.col = col;
        
        gameBoard.appendChild(intersection);
    }

    addPieceAt(row, col, piece) {
        const gameBoard = document.getElementById('game-board');
        const pieceElement = document.createElement('div');
        let className = `piece ${piece.color} ${piece.type}`;
        
        // Add selected class if this is the selected piece
        if (this.selectedPiece && this.selectedPiece[0] === row && this.selectedPiece[1] === col) {
            className += ' selected';
        }
        
        pieceElement.className = className;
        pieceElement.dataset.row = row;
        pieceElement.dataset.col = col;
        pieceElement.textContent = this.getPieceCharacter(piece.type, piece.color);
        
        // Position piece at intersection
        pieceElement.style.left = `${col * 70}px`;
        pieceElement.style.top = `${row * 70}px`;
        
        gameBoard.appendChild(pieceElement);
    }

    updatePieces() {
        const gameBoard = document.getElementById('game-board');
        const existingPieces = gameBoard.querySelectorAll('.piece');
        const pieceMap = new Map();
        
        // Clear all highlighted intersections
        const highlightedIntersections = gameBoard.querySelectorAll('.intersection.highlighted');
        highlightedIntersections.forEach(intersection => {
            intersection.classList.remove('highlighted');
        });
        
        // Create a map of existing pieces by their position
        existingPieces.forEach(piece => {
            const row = parseInt(piece.dataset.row);
            const col = parseInt(piece.dataset.col);
            pieceMap.set(`${row}-${col}`, piece);
        });
        
        // Update or create pieces based on current board state
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = this.board[row][col];
                const key = `${row}-${col}`;
                const existingPiece = pieceMap.get(key);
                
                if (piece) {
                    if (existingPiece) {
                        // Update existing piece if needed
                        existingPiece.textContent = this.getPieceCharacter(piece.type, piece.color);
                        existingPiece.className = `piece ${piece.color} ${piece.type}`;
                        existingPiece.dataset.row = row;
                        existingPiece.dataset.col = col;
                        
                        // Update position with animation
                        // Use requestAnimationFrame to ensure transition works properly
                        requestAnimationFrame(() => {
                            existingPiece.style.left = `${col * 70}px`;
                            existingPiece.style.top = `${row * 70}px`;
                        });
                        
                        pieceMap.delete(key);
                    } else {
                        // Create new piece
                        this.addPieceAt(row, col, piece);
                    }
                }
            }
        }
        
        // Remove pieces that no longer exist on the board
        pieceMap.forEach(piece => {
            piece.remove();
        });
    }

    getPieceCharacter(type, color) {
        // Using Chinese characters for pieces
        const chars = {
            king: { red: '帥', black: '將' },
            advisor: { red: '仕', black: '士' },
            elephant: { red: '相', black: '象' },
            horse: { red: '傌', black: '馬' },
            rook: { red: '俥', black: '車' },
            cannon: { red: '炮', black: '砲' },
            pawn: { red: '兵', black: '卒' }
        };
        
        if (!type || !color || !chars[type] || !chars[type][color]) {
            return '?'; // Return a question mark if type or color is invalid
        }
        
        return chars[type][color];
    }

    attachEventListeners() {
        // Add click event to the game board to capture clicks on intersections
        const gameBoard = document.getElementById('game-board');
        gameBoard.addEventListener('click', (e) => {
            // Check if a piece was clicked directly
            if (e.target.classList.contains('piece')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.handleCellClick(row, col);
            } 
            // Check if an intersection was clicked
            else if (e.target.classList.contains('intersection')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.handleCellClick(row, col);
            }
            // Also check if clicking on empty board area - find nearest intersection
            else {
                const rect = gameBoard.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate nearest intersection
                const col = Math.round(x / 70);
                const row = Math.round(y / 70);
                
                if (row >= 0 && row <= 9 && col >= 0 && col <= 8) {
                    this.handleCellClick(row, col);
                }
            }
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }

    handleCellClick(row, col) {
        if (this.gameOver) return;
        
        // Ensure row and col are valid numbers
        if (typeof row !== 'number' || typeof col !== 'number' || 
            row < 0 || row > 9 || col < 0 || col > 8) {
            return;
        }
        
        const piece = this.board[row][col];
        
        // Add click feedback
        this.addClickFeedback(row, col);
        
        // If a piece is already selected
        if (this.selectedPiece) {
            const [selectedRow, selectedCol] = this.selectedPiece;
            
            // If clicking on the same piece, deselect it
            if (selectedRow === row && selectedCol === col) {
                this.selectedPiece = null;
                this.renderBoard();
                return;
            }
            
            // Check if the move is valid
            if (this.isValidMove(selectedRow, selectedCol, row, col)) {
                // Temporarily make the move to check if it resolves check
                const originalPiece = this.board[row][col];
                const movingPiece = this.board[selectedRow][selectedCol];
                this.board[row][col] = movingPiece;
                this.board[selectedRow][selectedCol] = null;
                
                // Update king position if king was moved
                if (movingPiece.type === 'king') {
                    this.kingPositions[this.currentPlayer] = [row, col];
                }
                
                // Check if the current player is in check and if this move resolves it
                const wouldBeInCheck = this.isInCheck(this.currentPlayer);
                
                // If current player is in check and this move doesn't resolve it, illegal move
                if (this.inCheck[this.currentPlayer] && wouldBeInCheck) {
                    // Restore the board
                    this.board[selectedRow][selectedCol] = movingPiece;
                    this.board[row][col] = originalPiece;
                    
                    // Restore king position if needed
                    if (movingPiece.type === 'king') {
                        this.kingPositions[this.currentPlayer] = [selectedRow, selectedCol];
                    }
                    
                    // Show a message that this move is illegal
                    this.showIllegalMoveAlert();
                    return;
                }
                
                // If the move would put the current player in check, it's illegal
                if (!this.inCheck[this.currentPlayer] && wouldBeInCheck) {
                    // Restore the board
                    this.board[selectedRow][selectedCol] = movingPiece;
                    this.board[row][col] = originalPiece;
                    
                    // Restore king position if needed
                    if (movingPiece.type === 'king') {
                        this.kingPositions[this.currentPlayer] = [selectedRow, selectedCol];
                    }
                    
                    // Show a message that this move is illegal
                    this.showIllegalMoveAlert();
                    return;
                }
                
                // Move is valid, make it permanent
                if (originalPiece && originalPiece.color !== this.currentPlayer) {
                    this.capturedPieces[this.currentPlayer].push(originalPiece);
                    // Show capture alert when a piece is captured
                    this.showCaptureAlert();
                    if (originalPiece.type === 'king') {
                        this.gameOver = true;
                        const winner = this.currentPlayer === 'red' ? '红方' : '黑方';
                        alert(`${winner}获胜！`);
                    }
                }
                
                // 记录走棋历史（如果不是在回放模式下）
                if (!this.isReplaying) {
                    this.moveHistory.push({
                        from: [selectedRow, selectedCol],
                        to: [row, col],
                        piece: movingPiece,
                        captured: originalPiece,
                        player: this.currentPlayer
                    });
                }
                
                // Add moving animation class to the piece
                const gameBoard = document.getElementById('game-board');
                const pieceElements = gameBoard.querySelectorAll('.piece');
                pieceElements.forEach(pieceEl => {
                    if (parseInt(pieceEl.dataset.row) === row && parseInt(pieceEl.dataset.col) === col) {
                        pieceEl.classList.add('moving');
                        // Remove the animation class after the animation completes
                        setTimeout(() => {
                            pieceEl.classList.remove('moving');
                        }, 1700);
                    }
                });
                
                // Switch player
                this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                this.selectedPiece = null;
                
                // Check for check condition after the move
                this.inCheck[this.currentPlayer] = this.isInCheck(this.currentPlayer);
                
                // 检查是否绝杀（包括将军绝杀和困毙）
                const isCheckmate = this.isCheckmate(this.currentPlayer);
                if (isCheckmate) {
                    // 绝杀！游戏结束（可能是将军绝杀或困毙）
                    // 无论是哪种绝杀情况，都使用相同的处理流程
                    this.gameOver = true;
                    const winner = this.currentPlayer === 'red' ? '黑方' : '红方';
                    this.showCheckmateAlert(winner);
                } else if (this.inCheck[this.currentPlayer]) {
                    // 普通将军
                    this.showCheckAlert();
                }
                
                this.renderBoard();
                return;
            } else {
                // If clicking on another piece of the same color, select that piece instead
                if (piece && piece.color === this.currentPlayer) {
                    this.selectedPiece = [row, col];
                    this.renderBoard();
                    this.highlightSelectedPiece(row, col);
                    return;
                }
                
                // Invalid move - deselect
                this.selectedPiece = null;
                this.renderBoard();
                return;
            }
        }
        
        // Select a piece if it belongs to the current player
        if (piece && piece.color === this.currentPlayer) {
            this.selectedPiece = [row, col];
            this.renderBoard();
            this.highlightSelectedPiece(row, col);
        }
    }

    highlightSelectedPiece(row, col) {
        // The rendering function now takes care of highlighting the selected piece
    }

    highlightPossibleMoves(fromRow, fromCol) {
        const gameBoard = document.getElementById('game-board');
        
        // Check all possible positions
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.isValidMove(fromRow, fromCol, row, col)) {
                    // Check if there's an opponent piece at this position (capture move)
                    const targetPiece = this.board[row][col];
                    if (targetPiece && targetPiece.color !== this.currentPlayer) {
                        // Highlight the targeted piece
                        const pieces = gameBoard.querySelectorAll('.piece');
                        pieces.forEach(piece => {
                            if (parseInt(piece.dataset.row) === row && 
                                parseInt(piece.dataset.col) === col) {
                                piece.classList.add('targeted');
                            }
                        });
                    } else {
                        // Highlight the intersection for empty squares
                        const intersections = gameBoard.querySelectorAll('.intersection');
                        intersections.forEach(intersection => {
                            if (parseInt(intersection.dataset.row) === row && 
                                parseInt(intersection.dataset.col) === col) {
                                intersection.classList.add('highlighted');
                            }
                        });
                    }
                }
            }
        }
    }

    addClickFeedback(row, col) {
        const gameBoard = document.getElementById('game-board');
        
        // Create a temporary visual feedback at the clicked position
        const feedback = document.createElement('div');
        feedback.className = 'click-feedback';
        feedback.style.position = 'absolute';
        feedback.style.left = `${col * 70}px`;
        feedback.style.top = `${row * 70}px`;
        feedback.style.width = '20px';
        feedback.style.height = '20px';
        feedback.style.borderRadius = '50%';
        feedback.style.backgroundColor = 'rgba(255, 215, 0, 0.6)';
        feedback.style.transform = 'translate(-50%, -50%)';
        feedback.style.pointerEvents = 'none';
        feedback.style.zIndex = '10';
        feedback.style.animation = 'clickRipple 0.6s ease-out';
        
        gameBoard.appendChild(feedback);
        
        // Remove the feedback after animation completes
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 600);
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        // Ensure coordinates are valid
        if (fromRow < 0 || fromRow > 9 || fromCol < 0 || fromCol > 8 || 
            toRow < 0 || toRow > 9 || toCol < 0 || toCol > 8) {
            return false;
        }
        
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.currentPlayer) {
            return false;
        }
        
        // Check if destination has a piece of the same color
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === this.currentPlayer) {
            return false;
        }
        
        // Validate movement based on piece type
        switch (piece.type) {
            case 'king':
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
            case 'advisor':
                return this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol);
            case 'elephant':
                return this.isValidElephantMove(fromRow, fromCol, toRow, toCol);
            case 'horse':
                return this.isValidHorseMove(fromRow, fromCol, toRow, toCol);
            case 'rook':
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case 'cannon':
                return this.isValidCannonMove(fromRow, fromCol, toRow, toCol);
            case 'pawn':
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    isValidKingMove(fromRow, fromCol, toRow, toCol) {
        // Kings can only move within the palace
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const isRed = piece.color === 'red';
        const palaceRows = isRed ? [7, 8, 9] : [0, 1, 2];
        const palaceCols = [3, 4, 5];
        
        // Check if destination is within palace
        if (!palaceRows.includes(toRow) || !palaceCols.includes(toCol)) {
            return false;
        }
        
        // Kings can only move one point orthogonally
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
            return false;
        }
        
        // 检查是否会导致两个王照面（在同一条直线上直接相对）
        // 先找到对方王的位置
        const opponentColor = isRed ? 'black' : 'red';
        let opponentKingPos = null;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const targetPiece = this.board[row][col];
                if (targetPiece && targetPiece.type === 'king' && targetPiece.color === opponentColor) {
                    opponentKingPos = [row, col];
                    break;
                }
            }
            if (opponentKingPos) break;
        }
        
        if (opponentKingPos) {
            const [oppKingRow, oppKingCol] = opponentKingPos;
            
            // 如果移动后两个王在同一条直线上
            if (toCol === oppKingCol) {
                // 检查两个王之间是否有棋子阻挡
                const startRow = Math.min(toRow, oppKingRow);
                const endRow = Math.max(toRow, oppKingRow);
                let hasPieceBetween = false;
                
                for (let row = startRow + 1; row < endRow; row++) {
                    if (this.board[row][toCol] !== null) {
                        hasPieceBetween = true;
                        break;
                    }
                }
                
                // 如果两个王之间没有棋子阻挡，则不能这样移动
                if (!hasPieceBetween) {
                    return false;
                }
            }
        }
        
        return true;
    }

    isValidAdvisorMove(fromRow, fromCol, toRow, toCol) {
        // Advisors can only move diagonally within the palace
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const isRed = piece.color === 'red';
        const palaceRows = isRed ? [7, 8, 9] : [0, 1, 2];
        const palaceCols = [3, 4, 5];
        
        // Check if destination is within palace
        if (!palaceRows.includes(toRow) || !palaceCols.includes(toCol)) {
            return false;
        }
        
        // Advisors move exactly one point diagonally
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        return rowDiff === 1 && colDiff === 1;
    }

    isValidElephantMove(fromRow, fromCol, toRow, toCol) {
        // Elephants move exactly two points diagonally and cannot cross the river
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const isRed = piece.color === 'red';
        
        // Check if elephant crosses river
        // Red elephants can only move on rows 5-9 (can't go to rows 0-4)
        // Black elephants can only move on rows 0-4 (can't go to rows 5-9)
        if (isRed && toRow < 5) return false;
        if (!isRed && toRow > 4) return false;
        
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // Elephants move exactly two points diagonally
        if (rowDiff !== 2 || colDiff !== 2) return false;
        
        // Check if the elephant is blocked by a piece in the central point of its move
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;
        
        if (this.board[midRow][midCol] !== null) return false;
        
        return true;
    }

    isValidHorseMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // Horses move in an L-shape: 2 in one direction and 1 in the other
        const isLShape = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        if (!isLShape) return false;
        
        // Check if the horse is blocked by a piece in the intermediate square
        let blockerRow, blockerCol;
        
        if (rowDiff === 2) { // Moving 2 rows
            blockerRow = fromRow + (toRow > fromRow ? 1 : -1);
            blockerCol = fromCol;
        } else { // Moving 2 columns
            blockerRow = fromRow;
            blockerCol = fromCol + (toCol > fromCol ? 1 : -1);
        }
        
        if (this.board[blockerRow][blockerCol] !== null) return false;
        
        return true;
    }

    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        // Rooks move any distance orthogonally
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        // Check if path is clear
        if (fromRow === toRow) { // Moving horizontally
            const startCol = Math.min(fromCol, toCol);
            const endCol = Math.max(fromCol, toCol);
            
            for (let col = startCol + 1; col < endCol; col++) {
                if (this.board[fromRow][col] !== null) return false;
            }
        } else { // Moving vertically
            const startRow = Math.min(fromRow, toRow);
            const endRow = Math.max(fromRow, toRow);
            
            for (let row = startRow + 1; row < endRow; row++) {
                if (this.board[row][fromCol] !== null) return false;
            }
        }
        
        return true;
    }

    isValidCannonMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        // Cannons move like rooks but must "jump" over exactly one piece when capturing
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        // Check if path is clear (for non-capturing move) or has exactly one piece to jump over (for capturing)
        const targetPiece = this.board[toRow][toCol];
        const isCapturing = targetPiece !== null;
        
        let piecesInPath = 0;
        let start, end, fixedCoord;
        
        if (fromRow === toRow) { // Moving horizontally
            start = Math.min(fromCol, toCol);
            end = Math.max(fromCol, toCol);
            fixedCoord = fromRow;
            
            for (let col = start + 1; col < end; col++) {
                if (this.board[fixedCoord][col] !== null) piecesInPath++;
            }
        } else { // Moving vertically
            start = Math.min(fromRow, toRow);
            end = Math.max(fromRow, toRow);
            fixedCoord = fromCol;
            
            for (let row = start + 1; row < end; row++) {
                if (this.board[row][fixedCoord] !== null) piecesInPath++;
            }
        }
        
        if (isCapturing) {
            // For capturing, there must be exactly one piece to jump over
            return piecesInPath === 1 && targetPiece && targetPiece.color !== piece.color;
        } else {
            // For non-capturing moves, path must be clear
            return piecesInPath === 0;
        }
    }

    isValidPawnMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const isRed = piece.color === 'red';
        
        // Determine movement direction based on color
        const direction = isRed ? -1 : 1;
        
        // Pawns can only move forward before crossing the river
        if ((isRed && fromRow > 4) || (!isRed && fromRow < 5)) {
            // Before crossing river: can only move forward
            return toRow === fromRow + direction && toCol === fromCol;
        } else {
            // After crossing river: can move forward or sideways
            const rowDiff = toRow - fromRow;
            const colDiff = Math.abs(toCol - fromCol);
            
            // Can move forward one point
            if (rowDiff === direction && colDiff === 0) return true;
            
            // Can move sideways one point
            if (rowDiff === 0 && colDiff === 1) return true;
            
            return false;
        }
    }

    updateCapturedPiecesDisplay() {
        const redCapturedEl = document.getElementById('captured-red-pieces');
        const blackCapturedEl = document.getElementById('captured-black-pieces');
        
        redCapturedEl.innerHTML = '';
        blackCapturedEl.innerHTML = '';
        
        // Display red's captured pieces
        this.capturedPieces.red.forEach(piece => {
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `captured-piece-item ${piece.color} ${piece.type}`;
                pieceEl.textContent = this.getPieceCharacter(piece.type, piece.color);
                redCapturedEl.appendChild(pieceEl);
            }
        });
        
        // Display black's captured pieces
        this.capturedPieces.black.forEach(piece => {
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `captured-piece-item ${piece.color} ${piece.type}`;
                pieceEl.textContent = this.getPieceCharacter(piece.type, piece.color);
                blackCapturedEl.appendChild(pieceEl);
            }
        });
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.capturedPieces = { red: [], black: [] };
        this.gameOver = false;
        this.kingPositions = { red: [9, 4], black: [0, 4] };
        this.inCheck = { red: false, black: false };
        this.fullRenderNeeded = true; // Need full render for reset
        this.renderBoard();
    }

    isInCheck(playerColor) {
        // Get the king's position
        const kingPos = this.kingPositions[playerColor];
        if (!kingPos) return false;
        
        const [kingRow, kingCol] = kingPos;
        
        // Check if any opponent piece can attack the king
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color !== playerColor) {
                    // Temporarily switch player to check if opponent can move to king's position
                    const originalPlayer = this.currentPlayer;
                    this.currentPlayer = piece.color;
                    
                    const canAttackKing = this.isValidMove(row, col, kingRow, kingCol);
                    
                    // Restore original player
                    this.currentPlayer = originalPlayer;
                    
                    if (canAttackKing) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    showCheckAlert() {
        const checkAlert = document.getElementById('check-alert');
        checkAlert.style.display = 'block';
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
            checkAlert.style.display = 'none';
        }, 2000);
    }

    showCaptureAlert() {
        const captureAlert = document.getElementById('capture-alert');
        captureAlert.style.display = 'block';
        
        // Auto-hide after 1.5 seconds
        setTimeout(() => {
            captureAlert.style.display = 'none';
        }, 1500);
    }

    showIllegalMoveAlert() {
        // Create a temporary alert for illegal moves
        const alert = document.createElement('div');
        alert.className = 'illegal-move-alert';
        alert.textContent = '不能这样走！必须解除将军状态';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1001;
            font-weight: bold;
        `;
        
        document.body.appendChild(alert);
        
        // Auto-hide after 1.5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 1500);
    }

    // 检查是否绝杀
    isCheckmate(playerColor) {
        // 先检查是否被将军
        const inCheck = this.isInCheck(playerColor);
        
        // 检查玩家的所有棋子是否都有合法走法
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === playerColor) {
                    // 检查这个棋子的所有可能移动
                    for (let toRow = 0; toRow < 10; toRow++) {
                        for (let toCol = 0; toCol < 9; toCol++) {
                            // 检查是否是合法移动
                            if (this.isValidMove(row, col, toRow, toCol)) {
                                // 如果玩家未被将军，只要有一个合法移动就不是绝杀（不是困毙）
                                if (!inCheck) {
                                    return false;
                                }
                                
                                // 如果玩家被将军，需要检查这个移动是否能解除将军
                                // 临时执行移动来检查是否能解除将军
                                const originalPiece = this.board[toRow][toCol];
                                const movingPiece = this.board[row][col];
                                this.board[toRow][toCol] = movingPiece;
                                this.board[row][col] = null;
                                
                                // 更新王的位置（如果移动的是王）
                                let originalKingPos = null;
                                if (movingPiece.type === 'king') {
                                    originalKingPos = this.kingPositions[playerColor];
                                    this.kingPositions[playerColor] = [toRow, toCol];
                                }
                                
                                // 检查移动后是否仍然被将军
                                const stillInCheck = this.isInCheck(playerColor);
                                
                                // 恢复棋盘状态
                                this.board[row][col] = movingPiece;
                                this.board[toRow][toCol] = originalPiece;
                                
                                // 恢复王的位置
                                if (originalKingPos) {
                                    this.kingPositions[playerColor] = originalKingPos;
                                }
                                
                                // 如果这个移动能解除将军，则不是绝杀
                                if (!stillInCheck) {
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // 如果没有任何移动能解除将军（被将军时）或没有任何合法移动（未被将军时），则是绝杀
        // 这包括了困毙的情况（未被将军但无子可走）
        return true;
    }

    // 显示绝杀提示
    showCheckmateAlert(winner) {
        // 创建绝杀提示元素
        const checkmateAlert = document.createElement('div');
        checkmateAlert.id = 'checkmate-alert';
        checkmateAlert.className = 'checkmate-alert';
        checkmateAlert.innerHTML = `
            <div class="checkmate-content">
                <div class="checkmate-icon">绝杀</div>
                <div class="checkmate-text">${winner}获胜！</div>
                <div class="checkmate-replay">10秒后重新播放棋局</div>
            </div>
        `;
        
        document.body.appendChild(checkmateAlert);
        
        // 显示提示
        checkmateAlert.style.display = 'block';
        
        // 10秒后重新播放棋局
        setTimeout(() => {
            if (checkmateAlert.parentNode) {
                checkmateAlert.parentNode.removeChild(checkmateAlert);
            }
            
            // 开始重新播放棋局
            this.replayGame();
        }, 10000);
    }
    
    // 重新播放棋局
    replayGame() {
        // 如果没有走棋历史，则直接重置游戏
        if (this.moveHistory.length === 0) {
            this.resetGame();
            return;
        }
        
        // 设置回放模式
        this.isReplaying = true;
        
        // 重置游戏状态但保留历史记录
        this.board = this.initializeBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.capturedPieces = { red: [], black: [] };
        this.gameOver = false;
        this.kingPositions = { red: [9, 4], black: [0, 4] };
        this.inCheck = { red: false, black: false };
        this.fullRenderNeeded = true;
        this.renderBoard();
        
        // 逐步回放每一步棋
        this.replayMove(0);
    }
    
    // 回放单步棋
    replayMove(index) {
        // 如果已经回放完所有步骤，则重置游戏
        if (index >= this.moveHistory.length) {
            setTimeout(() => {
                this.isReplaying = false;
                this.resetGame();
            }, 1000);
            return;
        }
        
        // 获取当前步骤
        const move = this.moveHistory[index];
        const [fromRow, fromCol] = move.from;
        const [toRow, toCol] = move.to;
        
        // 延迟执行每一步，以便观看
        setTimeout(() => {
            // 执行移动
            const piece = this.board[fromRow][fromCol];
            this.board[toRow][toCol] = piece;
            this.board[fromRow][fromCol] = null;
            
            // 更新王的位置（如果移动的是王）
            if (piece && piece.type === 'king') {
                this.kingPositions[piece.color] = [toRow, toCol];
            }
            
            // 处理被吃掉的棋子
            if (move.captured) {
                this.capturedPieces[piece.color].push(move.captured);
            }
            
            // 更新当前玩家
            this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
            
            // 重新渲染棋盘
            this.renderBoard();
            
            // 继续回放下一步
            this.replayMove(index + 1);
        }, 1000); // 每步棋之间间隔1秒
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new XiangqiGame();
});