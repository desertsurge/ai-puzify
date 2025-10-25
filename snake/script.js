// 贪吃蛇游戏主逻辑
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        
        // 游戏状态
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        document.getElementById('high-score').textContent = this.highScore;
        
        // 关卡系统
        this.currentLevel = 1;
        this.maxLevel = 3;
        this.levelThresholds = [0, 100, 300]; // 分数阈值切换关卡
        
        // 蛇的初始状态（改进为像素级位置）
        this.snake = [];
        this.direction = { x: 1, y: 0 }; // 初始向右移动
        this.nextDirection = { x: 1, y: 0 };
        this.snakeSpeed = 150; // 毫秒
        this.lastUpdateTime = 0;
        this.moveCounter = 0; // 用于平滑移动
        
        // 蛇的像素级位置和速度
        this.snakePixels = [];
        this.snakeSegmentSize = this.gridSize;
        this.moveSpeed = 2; // 每帧移动的像素数
        
        // 改进的方向系统，支持多方向移动
        this.currentAngle = 0; // 当前移动角度（弧度）
        this.targetAngle = 0; // 目标角度
        this.turnSpeed = 0.1; // 转向速度
        
        // 食物（改为数组以支持多个食物）
        this.foods = [];
        this.maxFoods = 5; // 最多同时显示5个食物
        
        // 关卡主题配置
        this.levelThemes = [
            {
                name: "骑士王国",
                snakeHeadColor: "#c0c0c0", // 银色头盔
                snakeBodyColor: "#1e4664", // 蓝色盔甲
                foodColor: "#ff0000", // 红色食物
                backgroundColor: "#000000",
                cloakColor: "#8b0000" // 红色披风
            },
            {
                name: "魔法森林",
                snakeHeadColor: "#90ee90", // 绿色头部
                snakeBodyColor: "#32cd32", // 绿色身体
                foodColor: "#ff8c00", // 橙色食物
                backgroundColor: "#006400",
                cloakColor: "#228b22" // 绿色披风
            },
            {
                name: "火山地带",
                snakeHeadColor: "#8b0000", // 深红色头部
                snakeBodyColor: "#a52a2a", // 棕色身体
                foodColor: "#ffff00", // 黄色食物
                backgroundColor: "#800000",
                cloakColor: "#b22222" // 红色披风
            }
        ];
        
        // 初始化游戏
        this.init();
    }
    
    init() {
        // 初始化蛇的位置（像素级）
        this.snakePixels = [
            { x: 100, y: 200, angle: 0 },
            { x: 80, y: 200, angle: 0 },
            { x: 60, y: 200, angle: 0 }
        ];
        
        // 设置初始角度
        this.currentAngle = 0;
        this.targetAngle = 0;
        
        // 初始化食物数组
        this.foods = [];
        
        // 生成初始食物
        for (let i = 0; i < this.maxFoods; i++) {
            this.generateFood();
        }
        
        // 绑定事件
        this.bindEvents();
        
        // 绘制初始状态
        this.draw();
    }
    
    bindEvents() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            // 计算目标角度
            switch(e.key) {
                case 'ArrowUp':
                    this.targetAngle = -Math.PI / 2; // 270度
                    break;
                case 'ArrowDown':
                    this.targetAngle = Math.PI / 2; // 90度
                    break;
                case 'ArrowLeft':
                    this.targetAngle = Math.PI; // 180度
                    break;
                case 'ArrowRight':
                    this.targetAngle = 0; // 0度
                    break;
                case ' ':
                    this.togglePause();
                    break;
            }
        });
        
        // 按钮控制
        document.getElementById('startBtn').addEventListener('click', () => {
            this.start();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.reset();
        });
    }
    
    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameLoop();
        }
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            if (!this.gamePaused) {
                this.gameLoop();
            }
        }
    }
    
    reset() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        document.getElementById('gameOver').classList.add('hidden');
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.moveCounter = 0;
        this.snakeSpeed = 150;
        this.currentAngle = 0;
        this.targetAngle = 0;
        this.init();
    }
    
    gameLoop(timestamp = 0) {
        if (this.gamePaused || !this.gameRunning) return;
        
        // 使用时间戳控制帧率，提升效率
        if (timestamp >= this.lastUpdateTime + (1000 / 60)) { // 60FPS限制
            this.update();
            this.draw();
            this.lastUpdateTime = timestamp;
        }
        
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    update() {
        // 平滑转向
        if (Math.abs(this.targetAngle - this.currentAngle) > 0.01) {
            // 处理角度跨越问题（例如从359度到1度）
            let angleDiff = this.targetAngle - this.currentAngle;
            if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            this.currentAngle += angleDiff * this.turnSpeed;
        }
        
        // 移动蛇头
        const head = { ...this.snakePixels[0] };
        head.x += Math.cos(this.currentAngle) * this.moveSpeed;
        head.y += Math.sin(this.currentAngle) * this.moveSpeed;
        head.angle = this.currentAngle;
        
        // 计算蛇头中心位置
        const headCenterX = head.x + this.snakeSegmentSize / 2;
        const headCenterY = head.y + this.snakeSegmentSize / 2;
        
        // 检查碰撞边界（撞墙直接死亡）
        if (head.x < 0 || head.x >= this.canvasWidth || 
            head.y < 0 || head.y >= this.canvasHeight) {
            this.gameOver();
            return;
        }
        
        // 将新头添加到蛇身
        this.snakePixels.unshift(head);
        
        // 更新身体段位置，使其跟随前一个段移动，避免重叠
        // 优化：只更新可见的身体段，减少计算量
        const maxSegmentsToUpdate = Math.min(this.snakePixels.length, 50); // 限制更新数量
        
        for (let i = 1; i < maxSegmentsToUpdate; i++) {
            const segment = this.snakePixels[i];
            const prevSegment = this.snakePixels[i - 1];
            
            // 计算与前一个段的距离
            const dx = (prevSegment.x + this.snakeSegmentSize / 2) - (segment.x + this.snakeSegmentSize / 2);
            const dy = (prevSegment.y + this.snakeSegmentSize / 2) - (segment.y + this.snakeSegmentSize / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 如果距离大于段大小，则移动当前段向前进
            if (distance > this.snakeSegmentSize * 0.6) {
                const moveDistance = distance - this.snakeSegmentSize * 0.5;
                const moveX = (dx / distance) * moveDistance;
                const moveY = (dy / distance) * moveDistance;
                
                segment.x += moveX;
                segment.y += moveY;
                segment.angle = Math.atan2(dy, dx);
            }
        }
        
        // 检查是否吃到食物
        let foodEaten = false;
        let foodIndex = -1;
        
        for (let i = 0; i < this.foods.length; i++) {
            const food = this.foods[i];
            const foodCenterX = food.x * this.gridSize + this.gridSize / 2;
            const foodCenterY = food.y * this.gridSize + this.gridSize / 2;
            
            const distance = Math.sqrt(
                Math.pow(headCenterX - foodCenterX, 2) + 
                Math.pow(headCenterY - foodCenterY, 2)
            );
            
            if (distance < this.snakeSegmentSize / 2 + this.gridSize / 2 - 2) {
                foodEaten = true;
                foodIndex = i;
                break;
            }
        }
        
        if (foodEaten) {
            // 增加分数
            this.score += 10;
            
            // 限制分数不超过1000000分
            if (this.score > 1000000) {
                this.score = 1000000;
            }
            
            document.getElementById('score').textContent = this.score;
            
            // 移除被吃掉的食物
            this.foods.splice(foodIndex, 1);
            
            // 增加蛇身长度（添加更多身体段，使增长更明显）
            const baseSegments = 3; // 基础增加段数
            const levelBonus = Math.floor(this.currentLevel / 1); // 每关额外增加段数
            const segmentsToAdd = baseSegments + levelBonus;
            
            for (let i = 0; i < segmentsToAdd; i++) {
                const lastSegment = this.snakePixels[this.snakePixels.length - 1];
                // 新段的位置稍微偏离最后一个段，避免重叠
                const angle = lastSegment.angle || this.currentAngle;
                // 增加间隔距离使增长更明显
                const newSegmentX = lastSegment.x - Math.cos(angle) * this.snakeSegmentSize * 0.9;
                const newSegmentY = lastSegment.y - Math.sin(angle) * this.snakeSegmentSize * 0.9;
                
                this.snakePixels.push({ 
                    x: newSegmentX, 
                    y: newSegmentY, 
                    angle: angle 
                });
            }
            
            // 生成新食物
            this.generateFood();
            
            // 检查是否需要切换关卡
            this.checkLevelUp();
            
            // 增加速度（调整速度增加机制，避免过快）
            if (this.moveSpeed < 12) {  // 提高最大速度限制以适应更高的分数目标
                this.moveSpeed += 0.02;  // 减缓速度增加幅度
            }
        } else {
            // 移除蛇尾（保持身体段数量不变）
            this.snakePixels.pop();
        }
        
        // 检查碰撞自己
        for (let i = 4; i < this.snakePixels.length; i++) {
            const segment = this.snakePixels[i];
            const segmentCenterX = segment.x + this.snakeSegmentSize / 2;
            const segmentCenterY = segment.y + this.snakeSegmentSize / 2;
            
            const collisionDistance = Math.sqrt(
                Math.pow(headCenterX - segmentCenterX, 2) + 
                Math.pow(headCenterY - segmentCenterY, 2)
            );
            
            // 只有当分数达到1000000分时，碰撞自己才会结束游戏
            if (collisionDistance < this.snakeSegmentSize / 2 && this.score >= 1000000) {
                this.gameOver();
                return;
            }
        }
    }
    
    generateFood() {
        const maxX = Math.floor(this.canvasWidth / this.gridSize) - 1;
        const maxY = Math.floor(this.canvasHeight / this.gridSize) - 1;
        
        let newFood;
        let onSnake;
        let onOtherFood;
        
        do {
            onSnake = false;
            onOtherFood = false;
            newFood = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY)
            };
            
            // 检查食物是否在蛇身上
            const foodCenterX = newFood.x * this.gridSize + this.gridSize / 2;
            const foodCenterY = newFood.y * this.gridSize + this.gridSize / 2;
            
            for (let segment of this.snakePixels) {
                const segmentCenterX = segment.x + this.snakeSegmentSize / 2;
                const segmentCenterY = segment.y + this.snakeSegmentSize / 2;
                
                const distance = Math.sqrt(
                    Math.pow(segmentCenterX - foodCenterX, 2) + 
                    Math.pow(segmentCenterY - foodCenterY, 2)
                );
                
                if (distance < this.snakeSegmentSize / 2 + this.gridSize / 2) {
                    onSnake = true;
                    break;
                }
            }
            
            // 检查食物是否与其他食物重叠
            for (let food of this.foods) {
                const otherFoodCenterX = food.x * this.gridSize + this.gridSize / 2;
                const otherFoodCenterY = food.y * this.gridSize + this.gridSize / 2;
                
                const distance = Math.sqrt(
                    Math.pow(foodCenterX - otherFoodCenterX, 2) + 
                    Math.pow(foodCenterY - otherFoodCenterY, 2)
                );
                
                if (distance < this.gridSize) {
                    onOtherFood = true;
                    break;
                }
            }
        } while (onSnake || onOtherFood);
        
        this.foods.push(newFood);
    }
    
    draw() {
        // 获取当前关卡主题
        const theme = this.levelThemes[this.currentLevel - 1];
        
        // 清空画布（使用关卡背景色）
        this.ctx.fillStyle = theme.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // 绘制网格背景
        this.drawGrid();
        
        // 绘制所有食物
        for (let food of this.foods) {
            this.drawFood(food);
        }
        
        // 绘制蛇
        this.drawSnake();
    }
    
    drawGrid() {
        // 获取当前关卡主题
        const theme = this.levelThemes[this.currentLevel - 1];
        
        // 使用较浅的网格颜色
        let gridColor;
        if (theme.backgroundColor === "#000000") {
            gridColor = '#111';
        } else if (theme.backgroundColor === "#006400") {
            gridColor = '#004d00';
        } else {
            gridColor = '#600000';
        }
        
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 0.5;
        
        // 绘制垂直线
        for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvasHeight);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvasWidth, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        for (let i = 0; i < this.snakePixels.length; i++) {
            const segment = this.snakePixels[i];
            
            // 计算中心位置
            const centerX = segment.x + this.snakeSegmentSize / 2;
            const centerY = segment.y + this.snakeSegmentSize / 2;
            
            // 蛇头（第一个 segment）
            if (i === 0) {
                // 绘制骑士头部（圆形）
                this.drawKnightHead(centerX, centerY);
            } 
            // 蛇身（其他 segments）
            else {
                // 绘制骑士身体部分（圆形）
                this.drawKnightBodySegment(centerX, centerY, i);
            }
        }
        
        // 清除阴影效果
        this.ctx.shadowBlur = 0;
    }
    
    drawKnightHead(x, y) {
        // 获取当前关卡主题
        const theme = this.levelThemes[this.currentLevel - 1];
        
        // 头部阴影效果
        this.ctx.fillStyle = theme.snakeHeadColor;
        this.ctx.shadowColor = theme.snakeHeadColor;
        this.ctx.shadowBlur = 10;
        
        // 绘制头部圆形
        const headRadius = this.snakeSegmentSize / 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, headRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 头部装饰
        this.ctx.fillStyle = theme.foodColor; // 使用食物颜色作为装饰
        this.ctx.shadowColor = theme.foodColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y - headRadius/2, headRadius/3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 面部特征
        this.ctx.fillStyle = '#000';
        this.ctx.shadowBlur = 0;
        
        // 眼睛
        const eyeOffsetX = headRadius / 3;
        const eyeSize = headRadius / 5;
        
        // 根据移动方向调整眼睛位置
        let eyeDirectionX = 0;
        let eyeDirectionY = 0;
        
        if (Math.abs(this.currentAngle) < 0.1) { // 向右
            eyeDirectionX = eyeSize / 2;
        } else if (Math.abs(this.currentAngle - Math.PI) < 0.1 || 
                  Math.abs(this.currentAngle + Math.PI) < 0.1) { // 向左
            eyeDirectionX = -eyeSize / 2;
        } else if (this.currentAngle > 0) { // 向下
            eyeDirectionY = eyeSize / 2;
        } else { // 向上
            eyeDirectionY = -eyeSize / 2;
        }
        
        // 左眼
        this.ctx.beginPath();
        this.ctx.arc(x - eyeOffsetX + eyeDirectionX, y + eyeDirectionY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 右眼
        this.ctx.beginPath();
        this.ctx.arc(x + eyeOffsetX + eyeDirectionX, y + eyeDirectionY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawKnightBodySegment(x, y, index) {
        // 获取当前关卡主题
        const theme = this.levelThemes[this.currentLevel - 1];
        
        // 身体部分（圆形）
        const colorValue = Math.max(50, 200 - index * 2);
        let bodyColor;
        
        // 根据关卡主题设置身体颜色
        if (this.currentLevel === 1) {
            // 骑士王国 - 蓝色调盔甲
            bodyColor = `rgb(30, ${colorValue}, ${colorValue/2})`;
        } else if (this.currentLevel === 2) {
            // 魔法森林 - 绿色调
            bodyColor = `rgb(${colorValue/2}, ${colorValue}, 30)`;
        } else {
            // 火山地带 - 红色调
            bodyColor = `rgb(${colorValue}, ${colorValue/2}, 30)`;
        }
        
        this.ctx.fillStyle = bodyColor;
        this.ctx.shadowColor = bodyColor;
        this.ctx.shadowBlur = 5;
        
        // 计算身体段的半径
        const bodyRadius = this.snakeSegmentSize / 2.1; // 调整半径以避免重叠
        
        // 使用路径连接的方式绘制身体段
        this.ctx.beginPath();
        this.ctx.arc(x, y, bodyRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 身体装饰（使用关卡主题的食物颜色）
        this.ctx.strokeStyle = theme.foodColor;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, bodyRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 披风效果（根据关卡主题）
        if (index < 4) {
            const cloakAlpha = (4 - index) * 0.2;
            this.ctx.fillStyle = `${theme.cloakColor}${Math.floor(cloakAlpha * 255).toString(16).padStart(2, '0')}`;
            this.ctx.shadowColor = theme.cloakColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, bodyRadius * 1.3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawFood(food) {
        // 获取当前关卡主题
        const theme = this.levelThemes[this.currentLevel - 1];
        
        this.ctx.fillStyle = theme.foodColor;
        this.ctx.shadowColor = theme.foodColor;
        this.ctx.shadowBlur = 15;
        
        // 绘制食物（圆形）
        const centerX = food.x * this.gridSize + this.gridSize / 2;
        const centerY = food.y * this.gridSize + this.gridSize / 2;
        const radius = this.gridSize / 2 - 2;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 添加高光效果
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 5;
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius/3, centerY - radius/3, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 清除阴影效果
        this.ctx.shadowBlur = 0;
    }
    
    checkLevelUp() {
        // 检查是否达到下一个关卡的分数阈值
        for (let i = this.currentLevel - 1; i < this.levelThresholds.length; i++) {
            if (this.score >= this.levelThresholds[i]) {
                if (this.currentLevel !== i + 1) {
                    this.currentLevel = i + 1;
                    this.updateLevelDisplay();
                    this.increaseSpeedForLevel(); // 提升速度
                    break;
                }
            }
        }
    }
    
    increaseSpeedForLevel() {
        // 根据关卡提升速度
        const speedIncrease = (this.currentLevel - 1) * 0.5;
        this.moveSpeed = 2 + speedIncrease; // 基础速度2，每关增加0.5
        
        // 限制最大速度
        if (this.moveSpeed > 8) {
            this.moveSpeed = 8;
        }
        
        console.log(`关卡 ${this.currentLevel} 速度: ${this.moveSpeed}`);
    }
    
    updateLevelDisplay() {
        // 更新关卡显示（如果页面上有相关元素）
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = this.currentLevel;
        }
        
        // 可以在这里添加关卡切换的视觉效果
        console.log(`进入关卡 ${this.currentLevel}: ${this.levelThemes[this.currentLevel - 1].name}`);
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // 确保分数不超过1000000分
        if (this.score > 1000000) {
            this.score = 1000000;
        }
        
        // 如果分数达到1000000分，显示胜利信息
        if (this.score >= 1000000) {
            // 更新最高分
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('snakeHighScore', this.highScore);
                document.getElementById('high-score').textContent = this.highScore;
            }
            
            // 显示游戏胜利界面
            document.getElementById('finalScore').textContent = this.score + " (恭喜达成目标！)";
            document.getElementById('finalLevel').textContent = this.currentLevel;
            document.getElementById('gameOver').classList.remove('hidden');
        } else {
            // 正常游戏结束
            // 更新最高分
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('snakeHighScore', this.highScore);
                document.getElementById('high-score').textContent = this.highScore;
            }
            
            // 显示游戏结束界面
            document.getElementById('finalScore').textContent = this.score;
            document.getElementById('finalLevel').textContent = this.currentLevel;
            document.getElementById('gameOver').classList.remove('hidden');
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
});