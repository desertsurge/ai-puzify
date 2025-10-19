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
        this.specialObstacles = []; // 特殊障碍物数组
        
        // 定义关卡主题
        this.themes = [
            { name: "经典迷宫", playerIcon: "🐭", goalIcon: "🧀", wallColor: "#34495e", pathColor: "#ffffff", visitedColor: "#f5f5f5" },
            { name: "森林探险", playerIcon: "🐻", goalIcon: "🍯", wallColor: "#2e7d32", pathColor: "#e8f5e9", visitedColor: "#c8e6c9" },
            { name: "海洋寻宝", playerIcon: "🐠", goalIcon: "💎", wallColor: "#0277bd", pathColor: "#e1f5fe", visitedColor: "#b3e5fc" },
            { name: "太空漫游", playerIcon: "🚀", goalIcon: "🪐", wallColor: "#4527a0", pathColor: "#f3e5f5", visitedColor: "#e1bee7" },
            { name: "沙漠寻绿洲", playerIcon: "🐪", goalIcon: "🌴", wallColor: "#ff8f00", pathColor: "#fff8e1", visitedColor: "#ffecb3" },
            { name: "城堡迷宫", playerIcon: "👑", goalIcon: "🚪", wallColor: "#5d4037", pathColor: "#efebe9", visitedColor: "#d7ccc8" },
            { name: "冰雪世界", playerIcon: "🐧", goalIcon: "🐟", wallColor: "#01579b", pathColor: "#e1f5fe", visitedColor: "#b3e5fc" },
            { name: "火山探险", playerIcon: "🐉", goalIcon: "🔥", wallColor: "#bf360c", pathColor: "#fbe9e7", visitedColor: "#ffccbc" },
            { name: "糖果乐园", playerIcon: "🍭", goalIcon: "🎂", wallColor: "#e91e63", pathColor: "#fce4ec", visitedColor: "#f8bbd0" },
            { name: "神秘洞穴", playerIcon: "🦇", goalIcon: "💎", wallColor: "#37474f", pathColor: "#eceff1", visitedColor: "#cfd8dc" }
        ];
        
        // 定义特殊障碍物类型
        this.obstacleTypes = [
            { 
                name: "陷阱", 
                icon: "🕳️", 
                color: "#8B4513",
                effect: "trap", // 掉入陷阱，需要额外步数才能出来
                level: 1
            },
            { 
                name: "传送门", 
                icon: "🌀", 
                color: "#9370DB",
                effect: "teleport", // 传送到另一个传送门
                level: 2
            },
            { 
                name: "冰面", 
                icon: "❄️", 
                color: "#87CEEB",
                effect: "slide", // 在冰面上滑行直到撞墙
                level: 3
            },
            { 
                name: "弹簧", 
                icon: "🎯", 
                color: "#FF4500",
                effect: "bounce", // 弹跳到指定方向
                level: 4
            },
            { 
                name: "隐形墙", 
                icon: "🌫️", 
                color: "#A9A9A9",
                effect: "invisible", // 看不见的墙，需要试探才能发现
                level: 5
            },
            { 
                name: "减速区", 
                icon: "🐢", 
                color: "#32CD32",
                effect: "slow", // 移动速度变慢
                level: 6
            },
            { 
                name: "加速区", 
                icon: "⚡", 
                color: "#FFD700",
                effect: "fast", // 移动速度变快但难以控制
                level: 7
            },
            { 
                name: "反转区", 
                icon: "🔄", 
                color: "#FF6347",
                effect: "reverse", // 控制方向反转
                level: 8
            },
            { 
                name: "迷雾区", 
                icon: "🌫️", 
                color: "#D3D3D3",
                effect: "fog", // 视野受限
                level: 9
            },
            { 
                name: "时间漩涡", 
                icon: "⏰", 
                color: "#8A2BE2",
                effect: "timeWarp", // 时间变慢或变快
                level: 10
            }
        ];
        
        this.currentTheme = this.themes[0];
        
        this.init();
    }
    
    init() {
        this.updateTheme();
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
        
        // 添加特殊障碍物
        this.addSpecialObstacles();
    }
    
    // 添加特殊障碍物
    addSpecialObstacles() {
        // 清空之前的特殊障碍物
        this.specialObstacles = [];
        
        // 根据关卡选择合适的特殊障碍物类型
        const availableObstacles = this.obstacleTypes.filter(obstacle => obstacle.level <= this.level);
        const obstacleType = availableObstacles[Math.floor(Math.random() * availableObstacles.length)];
        
        // 根据关卡确定障碍物数量
        const obstacleCount = Math.min(Math.max(1, Math.floor(this.level / 2)), 5);
        
        for (let i = 0; i < obstacleCount; i++) {
            // 随机选择一个路径位置（不是起点或终点）
            let x, y;
            let attempts = 0;
            do {
                x = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
                y = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
                attempts++;
            } while ((this.maze[y][x] !== 0 || 
                     (x === 1 && y === 1) || // 不要在起点放置
                     (x === this.goalPos.x && y === this.goalPos.y) || // 不要在终点放置
                     this.isPositionOccupied(x, y)) && attempts < 100); // 不要与其他障碍物重叠
            
            if (attempts < 100) {
                // 添加特殊障碍物
                this.specialObstacles.push({
                    x: x,
                    y: y,
                    type: obstacleType
                });
            }
        }
    }
    
    // 检查位置是否被占用
    isPositionOccupied(x, y) {
        // 检查是否与已有的特殊障碍物重叠
        for (const obstacle of this.specialObstacles) {
            if (obstacle.x === x && obstacle.y === y) {
                return true;
            }
        }
        return false;
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
                
                // 检查是否为特殊障碍物
                const specialObstacle = this.specialObstacles.find(obs => obs.x === x && obs.y === y);
                
                if (this.maze[y][x] === 1) {
                    cell.classList.add('wall');
                    cell.style.backgroundColor = this.currentTheme.wallColor;
                } else if (specialObstacle) {
                    // 显示特殊障碍物
                    cell.classList.add('special-obstacle');
                    cell.style.backgroundColor = specialObstacle.type.color;
                    cell.innerHTML = `<span class="obstacle-icon">${specialObstacle.type.icon}</span>`;
                } else {
                    cell.classList.add('path');
                    cell.style.backgroundColor = this.currentTheme.pathColor;
                    
                    // 显示访问过的路径
                    if (this.visitedCells.has(`${x},${y}`)) {
                        cell.classList.add('visited');
                        cell.style.backgroundColor = this.currentTheme.visitedColor;
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
        
        // 检查边界
        if (newX < 0 || newX >= this.mazeSize || newY < 0 || newY >= this.mazeSize) {
            return;
        }
        
        // 检查墙壁
        if (this.maze[newY][newX] === 1) {
            return;
        }
        
        // 检查特殊障碍物
        const obstacle = this.specialObstacles.find(obs => obs.x === newX && obs.y === newY);
        
        // 记录移动历史用于撤销
        this.moveHistory.push({ x: this.playerPos.x, y: this.playerPos.y });
        
        if (obstacle) {
            // 处理特殊障碍物效果
            this.handleObstacleEffect(obstacle, newX, newY, dx, dy);
        } else {
            // 正常移动
            this.playerPos.x = newX;
            this.playerPos.y = newY;
            this.moves++;
        }
        
        // 记录访问过的单元格
        this.visitedCells.add(`${this.playerPos.x},${this.playerPos.y}`);
        
        this.updatePlayerPosition();
        this.updateGameInfo();
        this.renderMaze();
        
        // 检查是否到达终点
        if (this.playerPos.x === this.goalPos.x && this.playerPos.y === this.goalPos.y) {
            this.winGame();
        }
    }
    
    // 处理特殊障碍物效果
    handleObstacleEffect(obstacle, x, y, dx, dy) {
        switch (obstacle.type.effect) {
            case "trap":
                // 掉入陷阱，需要额外步数才能出来
                this.moves += 3;
                this.playerPos.x = x;
                this.playerPos.y = y;
                break;
                
            case "teleport":
                // 传送到另一个传送门
                const otherPortals = this.specialObstacles.filter(obs => 
                    obs.type.effect === "teleport" && 
                    (obs.x !== x || obs.y !== y)
                );
                
                if (otherPortals.length > 0) {
                    const destination = otherPortals[Math.floor(Math.random() * otherPortals.length)];
                    this.playerPos.x = destination.x;
                    this.playerPos.y = destination.y;
                    this.moves += 2; // 传送消耗额外步数
                } else {
                    // 如果没有其他传送门，就正常移动
                    this.playerPos.x = x;
                    this.playerPos.y = y;
                }
                break;
                
            case "slide":
                // 在冰面上滑行直到撞墙
                let slideX = x;
                let slideY = y;
                let slideMoves = 0;
                
                // 持续滑行直到撞墙或遇到非路径单元格
                while (slideX + dx >= 0 && slideX + dx < this.mazeSize && 
                       slideY + dy >= 0 && slideY + dy < this.mazeSize &&
                       this.maze[slideY + dy][slideX + dx] === 0 &&
                       !this.specialObstacles.find(obs => obs.x === slideX + dx && obs.y === slideY + dy)) {
                    slideX += dx;
                    slideY += dy;
                    slideMoves++;
                }
                
                this.playerPos.x = slideX;
                this.playerPos.y = slideY;
                this.moves += Math.max(1, slideMoves); // 至少消耗1步
                break;
                
            case "bounce":
                // 弹跳到指定方向（反向）
                const bounceX = x - dx;
                const bounceY = y - dy;
                
                if (bounceX >= 0 && bounceX < this.mazeSize && 
                    bounceY >= 0 && bounceY < this.mazeSize && 
                    this.maze[bounceY][bounceX] === 0) {
                    this.playerPos.x = bounceX;
                    this.playerPos.y = bounceY;
                    this.moves += 2;
                } else {
                    // 如果无法弹跳，就正常移动
                    this.playerPos.x = x;
                    this.playerPos.y = y;
                }
                break;
                
            default:
                // 默认情况下正常移动
                this.playerPos.x = x;
                this.playerPos.y = y;
                this.moves++;
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
        
        // 更新玩家图标
        playerElement.innerHTML = `<span class="player-icon">${this.currentTheme.playerIcon}</span>`;
        
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
        
        // 更新目标图标
        goalElement.innerHTML = `<span class="goal-icon">${this.currentTheme.goalIcon}</span>`;
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
        document.getElementById('win-theme').textContent = this.currentTheme.name;
        document.getElementById('win-modal').style.display = 'block';
    }
    
    // 关闭获胜模态框
    closeWinModal() {
        document.getElementById('win-modal').style.display = 'none';
    }
    
    // 更新主题
    updateTheme() {
        // 根据关卡选择主题，循环使用
        const themeIndex = (this.level - 1) % this.themes.length;
        this.currentTheme = this.themes[themeIndex];
        
        // 更新标题显示当前主题
        document.querySelector('header h1').textContent = `迷宫游戏 - ${this.currentTheme.name}`;
    }
    
    // 重新开始游戏
    restartGame() {
        this.playerPos = { x: 1, y: 1 };
        this.moves = 0;
        this.visitedCells.clear();
        this.moveHistory = [];
        this.visitedCells.add('1,1');
        this.stopTimer();
        this.updateTheme();
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
        this.updateTheme();
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