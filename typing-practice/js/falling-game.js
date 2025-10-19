class FallingGame {
    constructor() {
        this.canvas = document.getElementById('falling-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.blocks = [];
        this.particles = [];
        this.gameActive = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.blocksDestroyed = 0;
        this.currentDifficulty = 'easy';
        this.gameSpeed = 1;
        this.spawnTimer = 0;
        this.spawnInterval = 120; // 帧数
        this.animationId = null;
        
        // 文字池
        this.wordPool = {
            easy: ['猫', '狗', '鸟', '鱼', '花', '树', '山', '水', '天', '地', '日', '月', '星', '云', '风', '雨', '雪', '火', '石', '土'],
            medium: ['春天', '夏天', '秋天', '冬天', '早晨', '中午', '傍晚', '夜晚', '红色', '蓝色', '绿色', '黄色', '白色', '黑色', '灰色', '紫色', '橙色', '粉色', '棕色', '金色'],
            hard: ['编程', '设计', '音乐', '绘画', '运动', '旅行', '美食', '电影', '读书', '写作', '思考', '创造', '探索', '发现', '学习', '成长', '进步', '成功', '挑战', '机遇']
        };
        
        this.initializeElements();
        this.bindEvents();
        this.resizeCanvas();
        this.loadSettings();
    }

    initializeElements() {
        this.elements = {
            startBtn: document.getElementById('falling-start-btn'),
            input: document.getElementById('falling-input'),
            levelValue: document.getElementById('falling-level'),
            scoreValue: document.getElementById('falling-score'),
            livesValue: document.getElementById('falling-lives'),
            comboValue: document.getElementById('falling-combo'),
            gameOverlay: document.getElementById('game-overlay'),
            difficultyBtns: document.querySelectorAll('#falling-page .difficulty-btn')
        };
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.input.addEventListener('input', (e) => this.handleInput(e));
        
        this.elements.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => this.changeDifficulty(btn.dataset.level));
        });

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = Math.min(800, container.clientWidth);
        this.canvas.height = Math.min(600, window.innerHeight * 0.6);
        console.log('画布尺寸调整:', this.canvas.width, this.canvas.height);
        
        // 强制重绘画布背景
        if (this.ctx) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    changeDifficulty(level) {
        if (this.gameActive) return;
        
        this.currentDifficulty = level;
        this.elements.difficultyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
        
        // 调整游戏参数
        switch(level) {
            case 'easy':
                this.gameSpeed = 0.5; // 减慢整体速度
                this.spawnInterval = 180; // 增加生成间隔
                break;
            case 'medium':
                this.gameSpeed = 0.8;
                this.spawnInterval = 120;
                break;
            case 'hard':
                this.gameSpeed = 1.0;
                this.spawnInterval = 90;
                break;
        }
    }

    startGame() {
        console.log('开始游戏');
        this.resetGame();
        this.gameActive = true;
        this.elements.gameOverlay.style.display = 'none';
        this.elements.input.disabled = false;
        this.elements.input.focus();
        
        // 立即调整画布尺寸
        this.resizeCanvas();
        
        // 确保画布可见
        this.canvas.style.display = 'block';
        this.canvas.style.visibility = 'visible';
        
        // 强制重绘画布背景
        if (this.ctx) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 立即生成几个方块用于测试
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.spawnBlock();
                // 强制重绘以确保方块可见
                if (this.ctx) {
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    this.drawGrid();
                    this.draw();
                }
            }, i * 500);
        }
        
        console.log('游戏开始，方块数量:', this.blocks.length);
        this.gameLoop();
    }

    resetGame() {
        this.blocks = [];
        this.particles = [];
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.blocksDestroyed = 0;
        this.spawnTimer = 0;
        this.updateUI();
    }

    gameLoop() {
        if (!this.gameActive) return;
        
        console.log('游戏循环运行中，方块数量:', this.blocks.length);
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // 更新生成计时器
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnBlock();
            this.spawnTimer = 0;
        }
        
        // 更新方块位置
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            block.y += block.speed * this.gameSpeed;
            
            // 检查是否到达底部
            if (block.y + block.height > this.canvas.height) {
                console.log('方块到达底部:', block.text);
                this.blocks.splice(i, 1);
                this.loseLife();
            }
        }
        
        // 更新粒子效果
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // 检查升级
        if (this.blocksDestroyed >= this.level * 10) {
            this.levelUp();
        }
    }

    draw() {
        // 清除画布 - 白色背景
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格背景
        this.drawGrid();
        
        // 绘制方块
        console.log('绘制方块数量:', this.blocks.length);
        this.blocks.forEach((block, index) => {
            console.log(`绘制方块 ${index}:`, block.text, '位置:', block.x, block.y);
            
            // 简化绘制，确保方块可见
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(block.x, block.y, block.width, block.height);
            
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(block.x, block.y, block.width, block.height);
            
            // 绘制文字 - 黑色文字
            this.ctx.fillStyle = 'black';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(block.text, block.x + block.width / 2, block.y + block.height / 2);
        });
        
        // 绘制粒子效果
        this.particles.forEach(particle => {
            this.ctx.fillStyle = `rgba(${particle.color}, ${particle.life / particle.maxLife})`;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        // 绘制垂直线
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    spawnBlock() {
        const words = this.wordPool[this.currentDifficulty];
        const text = words[Math.floor(Math.random() * words.length)];
        
        const block = {
            x: 100 + Math.random() * (this.canvas.width - 200), // 确保不会太靠边
            y: 50, // 固定在顶部位置
            width: 120, // 增大方块尺寸
            height: 60,
            text: text,
            speed: 0.3 + Math.random() * 0.3, // 减慢下落速度
            color: this.getRandomColor()
        };
        
        this.blocks.push(block);
        console.log('生成方块:', text, '位置:', block.x, block.y, '尺寸:', block.width, block.height);
        console.log('画布尺寸:', this.canvas.width, this.canvas.height);
        console.log('当前方块数量:', this.blocks.length);
    }

    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    darkenColor(color) {
        // 简单的颜色变暗函数
        const amount = 30;
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, (num >> 16) - amount);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
        const b = Math.max(0, (num & 0x0000FF) - amount);
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }

    handleInput(e) {
        if (!this.gameActive) return;
        
        const inputText = e.target.value.trim();
        if (!inputText) return;
        
        // 查找匹配的方块
        let blockFound = false;
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            if (block.text === inputText) {
                this.destroyBlock(block, i);
                blockFound = true;
                break;
            }
        }
        
        if (blockFound) {
            e.target.value = '';
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
        } else {
            this.combo = 0;
        }
        
        this.updateUI();
    }

    destroyBlock(block, index) {
        // 创建粒子效果
        this.createParticles(block.x + block.width / 2, block.y + block.height / 2, block.color);
        
        // 移除方块
        this.blocks.splice(index, 1);
        
        // 更新统计
        this.blocksDestroyed++;
        this.score += 10 * (1 + Math.floor(this.combo / 5));
        
        // 检查成就
        this.checkAchievements();
        
        // 播放音效
        this.playDestroySound();
    }

    createParticles(x, y, color) {
        const particleCount = 15;
        const rgb = this.hexToRgb(color);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                color: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
                life: 30,
                maxLife: 30
            });
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    loseLife() {
        this.lives--;
        this.combo = 0;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    levelUp() {
        this.level++;
        this.gameSpeed += 0.2;
        this.spawnInterval = Math.max(30, this.spawnInterval - 10);
        this.showLevelUpMessage();
    }

    showLevelUpMessage() {
        const message = document.createElement('div');
        message.className = 'level-up-message';
        message.textContent = `升级！第 ${this.level} 关`;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            animation: levelUpAnimation 2s ease-out forwards;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 2000);
    }

    gameOver() {
        this.gameActive = false;
        cancelAnimationFrame(this.animationId);
        
        // 保存统计数据
        this.saveGameStats();
        
        // 显示游戏结束界面
        this.showGameOverModal();
    }

    showGameOverModal() {
        const overlay = this.elements.gameOverlay;
        const content = overlay.querySelector('.overlay-content');
        
        content.innerHTML = `
            <h2>游戏结束！</h2>
            <div class="game-over-stats">
                <p>最终得分: <strong>${this.score}</strong></p>
                <p>达到关卡: <strong>${this.level}</strong></p>
                <p>消除方块: <strong>${this.blocksDestroyed}</strong></p>
                <p>最高连击: <strong>${this.maxCombo}</strong></p>
            </div>
            <button class="btn btn-primary" onclick="window.fallingGame.restartGame()">重新开始</button>
            <button class="btn btn-secondary" onclick="window.app.switchPage('stats')">查看统计</button>
        `;
        
        overlay.style.display = 'flex';
    }

    restartGame() {
        this.elements.gameOverlay.style.display = 'none';
        this.startGame();
    }

    updateUI() {
        this.elements.levelValue.textContent = this.level;
        this.elements.scoreValue.textContent = this.score;
        this.elements.comboValue.textContent = this.combo;
        
        // 更新生命值显示
        let hearts = '';
        for (let i = 0; i < this.lives; i++) {
            hearts += '❤️';
        }
        for (let i = this.lives; i < 3; i++) {
            hearts += '🖤';
        }
        this.elements.livesValue.textContent = hearts;
    }

    checkAchievements() {
        const achievements = [];
        
        if (this.blocksDestroyed >= 100 && !this.hasAchievement('block-master')) {
            achievements.push('block-master');
        }
        
        if (this.maxCombo >= 50 && !this.hasAchievement('combo-king')) {
            achievements.push('combo-king');
        }
        
        if (this.level >= 10 && !this.hasAchievement('survivor')) {
            achievements.push('survivor');
        }
        
        achievements.forEach(achievement => {
            this.unlockAchievement(achievement);
        });
    }

    hasAchievement(id) {
        const saved = localStorage.getItem('fallingGameAchievements');
        const achievements = saved ? JSON.parse(saved) : [];
        return achievements.includes(id);
    }

    unlockAchievement(id) {
        const saved = localStorage.getItem('fallingGameAchievements');
        const achievements = saved ? JSON.parse(saved) : [];
        
        if (!achievements.includes(id)) {
            achievements.push(id);
            localStorage.setItem('fallingGameAchievements', JSON.stringify(achievements));
            
            // 更新UI
            const element = document.querySelector(`[data-achievement="${id}"]`);
            if (element) {
                element.classList.add('unlocked');
            }
            
            // 显示解锁消息
            this.showAchievementUnlock(id);
        }
    }

    showAchievementUnlock(id) {
        const names = {
            'block-master': '方块大师',
            'combo-king': '连击之王',
            'survivor': '生存专家'
        };
        
        const message = document.createElement('div');
        message.className = 'achievement-unlock';
        message.textContent = `🏆 成就解锁: ${names[id]}`;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 500);
        }, 3000);
    }

    playDestroySound() {
        // 创建简单的破坏音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 200 + Math.random() * 400;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    saveGameStats() {
        const stats = {
            date: new Date().toISOString(),
            score: this.score,
            level: this.level,
            blocksDestroyed: this.blocksDestroyed,
            maxCombo: this.maxCombo,
            difficulty: this.currentDifficulty
        };
        
        let allStats = JSON.parse(localStorage.getItem('fallingGameStats') || '[]');
        allStats.push(stats);
        
        if (allStats.length > 100) {
            allStats = allStats.slice(-100);
        }
        
        localStorage.setItem('fallingGameStats', JSON.stringify(allStats));
    }

    loadSettings() {
        // 加载成就
        const saved = localStorage.getItem('fallingGameAchievements');
        if (saved) {
            const achievements = JSON.parse(saved);
            achievements.forEach(id => {
                const element = document.querySelector(`[data-achievement="${id}"]`);
                if (element) {
                    element.classList.add('unlocked');
                }
            });
        }
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes levelUpAnimation {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .game-canvas-container {
        position: relative;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    #falling-canvas {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 12px;
    }
    
    .game-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
    }
    
    .overlay-content {
        text-align: center;
        color: white;
    }
    
    .overlay-content h2 {
        font-size: 2.5rem;
        margin-bottom: 20px;
    }
    
    .overlay-content p {
        font-size: 1.2rem;
        margin-bottom: 30px;
        opacity: 0.8;
    }
    
    .game-over-stats {
        background: rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
    }
    
    .game-over-stats p {
        margin: 10px 0;
        font-size: 1.1rem;
    }
    
    .falling-game-area {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .falling-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
    }
    
    .falling-controls .input-area {
        display: flex;
        align-items: center;
        gap: 20px;
        flex: 1;
    }
    
    .falling-controls #falling-input {
        flex: 1;
        padding: 15px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1.1rem;
        transition: all 0.3s ease;
    }
    
    .falling-controls #falling-input:focus {
        outline: none;
        border-color: #5a67d8;
        box-shadow: 0 0 0 3px rgba(90, 103, 216, 0.1);
    }
    
    .lives-info {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }
    
    .combo-info {
        background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    }
    
    .falling-achievements {
        background: #f7fafc;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    @media (max-width: 768px) {
        .falling-controls {
            flex-direction: column;
            align-items: stretch;
        }
        
        .falling-controls .input-area {
            flex-direction: column;
            gap: 15px;
        }
        
        .difficulty-options {
            flex-direction: column;
            align-items: stretch;
        }
    }
`;
document.head.appendChild(style);

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化方块下落游戏');
    window.fallingGame = new FallingGame();
    
    // 确保在页面切换时也能正确初始化
    setTimeout(() => {
        if (window.fallingGame && window.fallingGame.canvas) {
            console.log('画布尺寸检查:', window.fallingGame.canvas.width, window.fallingGame.canvas.height);
        }
    }, 100);
});