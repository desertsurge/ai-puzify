class MazeGame {
    constructor() {
        this.mazeSize = 15;
        this.maze = [];
        this.playerPos = { x: 1, y: 1 };
        this.goalPos = { x: this.mazeSize - 2, y: this.mazeSize - 2 };
        this.moves = 0;
        this.level = 1;
        this.startTime = null;
        this.timerInterval = null;
        this.visitedCells = new Set();
        this.moveHistory = []; // 记录移动历史，用于撤销功能
        this.isMoving = false; // 防止连续移动
        
        this.init();
    }
    
    init() {
        this.generateMaze();
        this.setupEventListeners();
        this.renderMaze();
        this.updatePlayerPosition();
        this.updateGoalPosition();
        this.startTimer();
        this.updateGameInfo();
    }
    
    // 使用改进的深度优先搜索算法生成更复杂的迷宫
    generateMaze() {
        // 根据关卡调整迷宫大小，进一步增加基础大小
        const baseSize = 25; // 增加基础大小从21到25
        this.mazeSize = baseSize + Math.min(Math.floor(this.level / 2), 10) * 2; // 每2关增加2个单位大小，最多增加10级
        if (this.mazeSize % 2 === 0) this.mazeSize++; // 确保是奇数
        
        // 初始化迷宫，全部设置为墙壁
        this.maze = Array(this.mazeSize).fill().map(() => Array(this.mazeSize).fill(1));
        
        // 使用改进的深度优先搜索生成迷宫
        this.carveMaze(1, 1);
        
        // 确保起点和终点周围有路径
        this.maze[1][1] = 0;
        this.maze[1][2] = 0;
        this.maze[2][1] = 0;
        
        // 设置终点在右下角附近
        this.goalPos = { 
            x: this.mazeSize - 2, 
            y: this.mazeSize - 2 
        };
        this.maze[this.goalPos.y][this.goalPos.x] = 0;
        this.maze[this.goalPos.y][this.goalPos.x - 1] = 0;
        this.maze[this.goalPos.y - 1][this.goalPos.x] = 0;
        
        // 添加一些额外的路径增加复杂度
        this.addExtraPaths();
    }
    
    // 深度优先搜索算法生成迷宫
    carveMaze(x, y) {
        // 定义四个方向：上、右、下、左
        const directions = [
            [0, -2], // 上
            [2, 0],  // 右
            [0, 2],  // 下
            [-2, 0]  // 左
        ];
        
        // 随机打乱方向
        this.shuffleArray(directions);
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            // 检查是否在边界内且是墙壁
            if (nx > 0 && nx < this.mazeSize - 1 && ny > 0 && ny < this.mazeSize - 1 && this.maze[ny][nx] === 1) {
                // 打通当前单元格和目标单元格之间的墙
                this.maze[y + dy / 2][x + dx / 2] = 0;
                this.maze[ny][nx] = 0;
                
                // 递归调用
                this.carveMaze(nx, ny);
            }
        }
    }
    
    // 添加额外路径增加复杂度
    addExtraPaths() {
        // 根据关卡添加不同数量的额外路径
        const extraPaths = Math.min(5 + Math.floor(this.level / 2), 15);
        
        for (let i = 0; i < extraPaths; i++) {
            // 随机选择一个墙壁（不是边界）
            let x, y;
            do {
                x = Math.floor(Math.random() * (this.mazeSize - 4)) + 2;
                y = Math.floor(Math.random() * (this.mazeSize - 4)) + 2;
            } while (this.maze[y][x] !== 1 || 
                     (x === 1 && y === 1) || // 不要在起点打洞
                     (x === this.goalPos.x && y === this.goalPos.y)); // 不要在终点打洞
            
            // 检查是否只连接两个区域（避免创造太多开放空间）
            const adjacentPaths = this.countAdjacentPaths(x, y);
            if (adjacentPaths === 2) { // 只有当连接两个区域时才打洞
                this.maze[y][x] = 0;
            }
        }
    }
    
    // 计算相邻路径数量
    countAdjacentPaths(x, y) {
        let count = 0;
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.mazeSize && ny >= 0 && ny < this.mazeSize && this.maze[ny][nx] === 0) {
                count++;
            }
        }
        return count;
    }
    
    // 随机打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // 渲染迷宫
    renderMaze() {
        const mazeElement = document.getElementById('maze');
        mazeElement.innerHTML = '';
        mazeElement.style.gridTemplateColumns = `repeat(${this.mazeSize}, 25px)`; // 减小单元格大小以适应大迷宫
        mazeElement.style.gridTemplateRows = `repeat(${this.mazeSize}, 25px)`;
        
        // 使用文档片段提高渲染性能
        const fragment = document.createDocumentFragment();
        
        for (let y = 0; y < this.mazeSize; y++) {
            for (let x = 0; x < this.mazeSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                if (this.maze[y][x] === 1) {
                    cell.classList.add('wall');
                } else {
                    cell.classList.add('path');
                    
                    // 显示访问过的路径
                    if (this.visitedCells.has(`${x},${y}`)) {
                        cell.classList.add('visited');
                    }
                }
                
                fragment.appendChild(cell);
            }
        }
        
        mazeElement.appendChild(fragment);
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('win-modal').style.display === 'block' || this.isMoving) return;
            
            this.isMoving = true;
            setTimeout(() => { this.isMoving = false; }, 150); // 防止连续移动
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.movePlayer(1, 0);
                    break;
                case 'z':
                case 'Z':
                    this.undoMove(); // 撤销上一步
                    break;
            }
        });
        
        // 触摸事件支持
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.getElementById('maze').addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });
        
        document.getElementById('maze').addEventListener('touchend', (e) => {
            if (document.getElementById('win-modal').style.display === 'block' || this.isMoving) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            // 判断滑动方向
            if (Math.abs(dx) > 30 || Math.abs(dy) > 30) { // 最小滑动距离
                this.isMoving = true;
                setTimeout(() => { this.isMoving = false; }, 150);
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    // 水平滑动
                    if (dx > 0) {
                        this.movePlayer(1, 0); // 右
                    } else {
                        this.movePlayer(-1, 0); // 左
                    }
                } else {
                    // 垂直滑动
                    if (dy > 0) {
                        this.movePlayer(0, 1); // 下
                    } else {
                        this.movePlayer(0, -1); // 上
                    }
                }
            }
            
            e.preventDefault();
        }, { passive: false });
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 下一关按钮
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        // 模态框按钮
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.closeWinModal();
            this.restartGame();
        });
        
        document.getElementById('next-level-modal-btn').addEventListener('click', () => {
            this.closeWinModal();
            this.nextLevel();
        });
    }
    
    // 移动玩家
    movePlayer(dx, dy) {
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;
        
        // 检查边界和墙壁
        if (newX >= 0 && newX < this.mazeSize && newY >= 0 && newY < this.mazeSize && this.maze[newY][newX] === 0) {
            // 记录移动历史用于撤销
            this.moveHistory.push({ x: this.playerPos.x, y: this.playerPos.y });
            
            this.playerPos.x = newX;
            this.playerPos.y = newY;
            this.moves++;
            
            // 记录访问过的单元格
            this.visitedCells.add(`${newX},${newY}`);
            
            this.updatePlayerPosition();
            this.updateGameInfo();
            this.renderMaze();
            
            // 检查是否到达终点
            if (newX === this.goalPos.x && newY === this.goalPos.y) {
                this.winGame();
            }
        }
    }
    
    // 撤销上一步移动
    undoMove() {
        if (this.moveHistory.length > 0 && !this.isMoving) {
            const lastPos = this.moveHistory.pop();
            this.playerPos.x = lastPos.x;
            this.playerPos.y = lastPos.y;
            this.moves++;
            this.updatePlayerPosition();
            this.updateGameInfo();
        }
    }
    
    // 更新玩家位置（带动画效果）
    updatePlayerPosition() {
        const playerElement = document.getElementById('player');
        playerElement.style.transition = 'all 0.15s ease';
        playerElement.style.left = `${this.playerPos.x * 25 + 3}px`; // 调整为新的单元格大小
        playerElement.style.top = `${this.playerPos.y * 25 + 3}px`;
        
        // 添加移动反馈效果
        playerElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            playerElement.style.transform = 'scale(1)';
        }, 150);
    }
    
    // 更新终点位置
    updateGoalPosition() {
        const goalElement = document.getElementById('goal');
        goalElement.style.left = `${this.goalPos.x * 25 + 3}px`; // 调整为新的单元格大小
        goalElement.style.top = `${this.goalPos.y * 25 + 3}px`;
    }
    
    // 更新游戏信息
    updateGameInfo() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('moves').textContent = this.moves;
    }
    
    // 开始计时器
    startTimer() {
        this.startTime = new Date();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((new Date() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('timer').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }
    
    // 停止计时器
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    // 获胜游戏
    winGame() {
        this.stopTimer();
        const elapsed = Math.floor((new Date() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        
        document.getElementById('win-moves').textContent = this.moves;
        document.getElementById('win-time').textContent = `${minutes}:${seconds}`;
        document.getElementById('win-modal').style.display = 'block';
    }
    
    // 关闭获胜模态框
    closeWinModal() {
        document.getElementById('win-modal').style.display = 'none';
    }
    
    // 重新开始游戏
    restartGame() {
        this.playerPos = { x: 1, y: 1 };
        this.moves = 0;
        this.visitedCells.clear();
        this.moveHistory = [];
        this.visitedCells.add('1,1');
        this.stopTimer();
        this.generateMaze();
        this.renderMaze();
        this.updatePlayerPosition();
        this.updateGoalPosition();
        this.startTimer();
        this.updateGameInfo();
    }
    
    // 下一关
    nextLevel() {
        this.level++;
        this.playerPos = { x: 1, y: 1 };
        this.moves = 0;
        this.visitedCells.clear();
        this.moveHistory = [];
        this.visitedCells.add('1,1');
        this.stopTimer();
        this.generateMaze();
        this.renderMaze();
        this.updatePlayerPosition();
        this.updateGoalPosition();
        this.startTimer();
        this.updateGameInfo();
        document.getElementById('next-level-btn').style.display = 'none';
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new MazeGame();
});