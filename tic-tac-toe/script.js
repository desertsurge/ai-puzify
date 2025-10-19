// 游戏状态变量
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

// 获胜组合
const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // 行
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // 列
    [0, 4, 8], [2, 4, 6]             // 对角线
];

// DOM元素
const boardElement = document.getElementById('board');
const currentPlayerElement = document.getElementById('current-player');
const resultElement = document.getElementById('result');
const resetButton = document.getElementById('reset-btn');

// 初始化游戏
function initGame() {
    // 为每个格子添加点击事件监听器
    document.querySelectorAll('.cell').forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
    });
    
    // 重新开始按钮事件
    resetButton.addEventListener('click', resetGame);
}

// 处理格子点击事件
function handleCellClick(index) {
    // 如果游戏已结束或格子已被占用，则不处理
    if (!gameActive || gameBoard[index] !== '') {
        return;
    }
    
    // 更新游戏状态
    gameBoard[index] = currentPlayer;
    document.querySelector(`.cell[data-index="${index}"]`).classList.add(currentPlayer.toLowerCase());
    document.querySelector(`.cell[data-index="${index}"]`).textContent = currentPlayer;
    
    // 检查是否有获胜者
    if (checkWin()) {
        resultElement.textContent = `玩家 ${currentPlayer} 获胜！`;
        resultElement.style.color = currentPlayer === 'X' ? '#ff6b6b' : '#4ecdc4';
        gameActive = false;
        return;
    }
    
    // 检查是否平局
    if (checkDraw()) {
        resultElement.textContent = '平局！';
        resultElement.style.color = '#555';
        gameActive = false;
        return;
    }
    
    // 切换玩家
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    currentPlayerElement.textContent = currentPlayer;
}

// 检查是否有获胜者
function checkWin() {
    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return gameBoard[a] !== '' && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c];
    });
}

// 检查是否平局
function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

// 重新开始游戏
function resetGame() {
    // 重置游戏状态
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    
    // 更新UI
    currentPlayerElement.textContent = currentPlayer;
    resultElement.textContent = '';
    
    // 清空所有格子
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);