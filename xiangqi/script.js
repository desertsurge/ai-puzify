// Chinese Chess (Xiangqi) Game Implementation
class XiangqiGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'red'; // Red goes first
        this.selectedPiece = null;
        this.capturedPieces = { red: [], black: [] };
        this.gameOver = false;
        this.kingPositions = { red: [9, 4], black: [0, 4] }; // Starting positions of kings
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
        gameBoard.innerHTML = '';
        
        // Add the horizontal and vertical lines to create the board
        this.createBoardLines();
        
        // Add palace diagonals
        this.createPalaceDiagonals();
        
        // Add river area
        this.createRiver();
        
        // Add intersections and pieces
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                // Add intersections
                this.addIntersection(row, col);
                
                // Add piece if it exists
                const piece = this.board[row][col];
                if (piece) {
                    this.addPieceAt(row, col, piece);
                }
            }
        }
        
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
                // Capture piece if exists
                if (piece && piece.color !== this.currentPlayer) {
                    this.capturedPieces[this.currentPlayer].push(piece);
                    if (piece.type === 'king') {
                        this.gameOver = true;
                        const winner = this.currentPlayer === 'red' ? '红方' : '黑方';
                        alert(`${winner}获胜！`);
                    }
                }
                
                // Move the piece
                this.board[row][col] = this.board[selectedRow][selectedCol];
                this.board[selectedRow][selectedCol] = null;
                
                // Update king position if king was moved
                if (this.board[row][col] && this.board[row][col].type === 'king') {
                    this.kingPositions[this.currentPlayer] = [row, col];
                }
                
                // Switch player
                this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                this.selectedPiece = null;
                
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
                    // Highlight the intersection
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
        
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
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
        this.renderBoard();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new XiangqiGame();
});