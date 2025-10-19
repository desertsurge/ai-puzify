class TypingGame {
    constructor() {
        this.texts = {
            easy: [
                "猫坐在垫子上",
                "太阳照耀着",
                "鸟儿在歌唱",
                "花开得美丽",
                "雨停了",
                "书在桌子上",
                "孩子笑着",
                "狗在玩耍",
                "月亮很亮",
                "风轻轻吹"
            ],
            medium: [
                "今天天气真好，适合出去散步",
                "学习新技能需要时间和耐心",
                "健康的饮食习惯对身体很重要",
                "阅读可以开阔我们的视野",
                "运动有助于保持身心健康",
                "良好的睡眠质量影响白天状态",
                "朋友是我们生活中宝贵的财富",
                "旅行能够丰富人生经历",
                "音乐可以调节情绪和心情",
                "艺术创作表达内心的想法"
            ],
            hard: [
                "科学技术的发展改变了我们的生活方式，让许多曾经不可能的事情变成了现实",
                "环境保护是每个人的责任，我们应该从日常生活中的小事做起",
                "教育不仅仅是知识的传授，更是思维能力和品格的培养过程",
                "全球化背景下，跨文化交流能力变得越来越重要和必要",
                "互联网的普及使得信息获取变得前所未有的便捷和高效",
                "人工智能技术正在各个领域发挥着越来越重要的作用",
                "可持续发展要求我们在满足当前需求的同时，不损害后代的利益",
                "创新思维是推动社会进步和科技发展的关键动力",
                "批判性思考能力帮助我们更好地理解和分析复杂问题",
                "终身学习理念在快速变化的时代显得尤为重要和紧迫"
            ],
            expert: [
                "量子计算技术的发展有望在密码学、药物研发和材料科学等领域带来革命性突破，但同时也面临着量子退相干、错误率控制和系统稳定性等重大技术挑战",
                "基因编辑技术如CRISPR-Cas9为治疗遗传性疾病提供了前所未有的可能性，然而其伦理争议和潜在风险也不容忽视，需要建立严格的监管框架",
                "气候变化带来的极端天气事件频率增加，对全球粮食安全、水资源分配和生态系统平衡构成了严峻威胁，需要国际社会协同应对",
                "区块链技术通过去中心化和不可篡改的特性，在金融、供应链管理和数字身份验证等领域展现出巨大潜力，但能源消耗问题亟待解决",
                "机器学习算法的快速发展推动了自动驾驶、医疗诊断和智能助手等应用的进步，但算法偏见和数据隐私问题引发了广泛的社会讨论",
                "可再生能源技术的成本持续下降，太阳能和风能发电已具备与传统能源竞争的能力，为能源转型和碳中和目标提供了技术支撑",
                "虚拟现实和增强现实技术正在改变教育、娱乐和工作方式，创造出沉浸式体验，但也带来了数字成瘾和现实界限模糊等问题",
                "生物多样性保护面临着栖息地破坏、污染和气候变化等多重威胁，需要采取综合性的保护策略和国际合作机制",
                "网络安全威胁日益复杂化， ransomware攻击和数据泄露事件频发，推动着安全技术和法规体系的不断完善",
                "太空探索技术的进步使得火星殖民和小行星采矿等曾经科幻的概念逐渐成为可能，开启了人类文明的新篇章"
            ]
        };

        this.currentDifficulty = 'easy';
        this.currentText = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.gameActive = false;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.totalChars = 0;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.level = 1;
        this.soundEnabled = true;
        this.achievements = new Set();
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.loadAchievements();
    }

    initializeElements() {
        this.elements = {
            targetText: document.getElementById('target-text'),
            userInput: document.getElementById('user-input'),
            startBtn: document.getElementById('start-btn'),
            levelValue: document.querySelector('.level-value'),
            scoreValue: document.querySelector('.score-value'),
            timerValue: document.querySelector('.timer-value'),
            accuracyValue: document.querySelector('.accuracy-value'),
            progressFill: document.getElementById('progress-fill'),
            difficultyBtns: document.querySelectorAll('.difficulty-btn'),
            soundToggle: document.getElementById('sound-toggle'),
            fontSizeSlider: document.getElementById('font-size'),
            themeSelect: document.getElementById('theme-select')
        };
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.userInput.addEventListener('input', (e) => this.handleInput(e));
        this.elements.userInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        this.elements.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => this.changeDifficulty(btn.dataset.level));
        });

        this.elements.soundToggle.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            this.saveSettings();
        });

        this.elements.fontSizeSlider.addEventListener('input', (e) => {
            const fontSize = e.target.value;
            document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
            e.target.nextElementSibling.textContent = `${fontSize}px`;
            this.saveSettings();
        });

        this.elements.themeSelect.addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
            this.saveSettings();
        });
    }

    changeDifficulty(level) {
        if (this.gameActive) return;
        
        this.currentDifficulty = level;
        this.elements.difficultyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
        
        this.loadNewText();
    }

    loadNewText() {
        const texts = this.texts[this.currentDifficulty];
        this.currentText = texts[Math.floor(Math.random() * texts.length)];
        this.updateTargetText();
    }

    updateTargetText() {
        let html = '';
        for (let i = 0; i < this.currentText.length; i++) {
            let className = '';
            if (i < this.currentIndex) {
                className = this.userInputChars[i] === this.currentText[i] ? 'correct' : 'incorrect';
            } else if (i === this.currentIndex) {
                className = 'current';
            }
            html += `<span class="${className}">${this.currentText[i]}</span>`;
        }
        this.elements.targetText.innerHTML = html;
        
        // 更新进度条
        const progress = (this.currentIndex / this.currentText.length) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
    }

    startGame() {
        this.resetGame();
        this.gameActive = true;
        this.startTime = Date.now();
        this.elements.startBtn.textContent = '重新开始';
        this.elements.userInput.disabled = false;
        this.elements.userInput.focus();
        this.loadNewText();
        this.startTimer();
    }

    resetGame() {
        this.currentIndex = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.totalChars = 0;
        this.score = 0;
        this.combo = 0;
        this.userInputChars = '';
        this.elements.userInput.value = '';
        this.updateStats();
        this.stopTimer();
        this.elements.timerValue.textContent = '00:00';
        this.elements.progressFill.style.width = '0%';
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            this.elements.timerValue.textContent = `${minutes}:${seconds}`;
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    handleInput(e) {
        if (!this.gameActive) return;
        
        const inputValue = e.target.value;
        this.userInputChars = inputValue;
        this.currentIndex = inputValue.length;
        
        // 计算正确和错误的字符
        this.correctChars = 0;
        this.incorrectChars = 0;
        
        for (let i = 0; i < inputValue.length; i++) {
            if (inputValue[i] === this.currentText[i]) {
                this.correctChars++;
            } else {
                this.incorrectChars++;
            }
        }
        
        this.totalChars = inputValue.length;
        
        // 更新连击
        if (inputValue.length > 0 && inputValue[inputValue.length - 1] === this.currentText[inputValue.length - 1]) {
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
            if (this.combo > 0 && this.combo % 5 === 0) {
                this.showComboEffect();
            }
        } else if (inputValue.length > 0) {
            this.combo = 0;
        }
        
        // 计算分数
        this.calculateScore();
        
        // 更新显示
        this.updateTargetText();
        this.updateStats();
        
        // 检查是否完成
        if (inputValue === this.currentText) {
            this.completeLevel();
        }
        
        // 播放音效
        if (this.soundEnabled) {
            this.playTypingSound();
        }
    }

    handleKeyDown(e) {
        if (!this.gameActive) return;
        
        // 防止退格键导致的问题
        if (e.key === 'Backspace' && this.currentIndex > 0) {
            this.combo = 0;
        }
    }

    calculateScore() {
        const baseScore = this.correctChars * 10;
        const accuracyBonus = this.getAccuracy() > 90 ? 50 : 0;
        const comboBonus = this.combo * 5;
        const speedBonus = this.getSpeed() > 60 ? 100 : 0;
        
        this.score = baseScore + accuracyBonus + comboBonus + speedBonus;
    }

    getSpeed() {
        if (!this.startTime) return 0;
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        return elapsedMinutes > 0 ? Math.round(this.correctChars / elapsedMinutes) : 0;
    }

    getAccuracy() {
        if (this.totalChars === 0) return 100;
        return Math.round((this.correctChars / this.totalChars) * 100);
    }

    updateStats() {
        this.elements.levelValue.textContent = this.level;
        this.elements.scoreValue.textContent = this.score;
        this.elements.accuracyValue.textContent = `${this.getAccuracy()}%`;
    }

    completeLevel() {
        this.gameActive = false;
        this.stopTimer();
        
        // 增加关卡
        this.level++;
        
        // 检查成就
        this.checkAchievements();
        
        // 显示结果
        this.showResults();
        
        // 保存统计数据
        this.saveGameStats();
    }

    showResults() {
        const modal = document.getElementById('game-over-modal');
        const finalScore = document.getElementById('final-score');
        const finalSpeed = document.getElementById('final-speed');
        const finalAccuracy = document.getElementById('final-accuracy');
        const finalTime = document.getElementById('final-time');
        
        finalScore.textContent = this.score;
        finalSpeed.textContent = `${this.getSpeed()} 字/分钟`;
        finalAccuracy.textContent = `${this.getAccuracy()}%`;
        finalTime.textContent = this.elements.timerValue.textContent;
        
        // 显示新解锁的成就
        this.showNewAchievements();
        
        modal.classList.add('show');
    }

    showNewAchievements() {
        const newAchievementsContainer = document.getElementById('new-achievements');
        const modalAchievements = document.getElementById('modal-achievements');
        
        // 获取新解锁的成就
        const newAchievements = this.getUnlockedAchievements();
        
        if (newAchievements.length > 0) {
            newAchievementsContainer.style.display = 'block';
            modalAchievements.innerHTML = newAchievements.map(achievement => `
                <div class="achievement unlocked">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-desc">${achievement.description}</div>
                    </div>
                </div>
            `).join('');
        } else {
            newAchievementsContainer.style.display = 'none';
        }
    }

    getUnlockedAchievements() {
        const achievementDefinitions = {
            'first-game': { name: '初次尝试', description: '完成第一个游戏', icon: '🎯' },
            'speed-demon': { name: '速度恶魔', description: '达到60字/分钟', icon: '⚡' },
            'perfectionist': { name: '完美主义者', description: '达到100%准确率', icon: '💎' },
            'combo-master': { name: '连击大师', description: '达到20连击', icon: '🔥' },
            'level-up': { name: '升级达人', description: '达到第5关', icon: '⭐' },
            'persistent': { name: '坚持不懈', description: '完成10个游戏', icon: '💪' }
        };
        
        const newAchievements = [];
        
        // 检查各种成就条件
        if (!this.achievements.has('first-game')) {
            this.achievements.add('first-game');
            newAchievements.push(achievementDefinitions['first-game']);
        }
        
        if (this.getSpeed() >= 60 && !this.achievements.has('speed-demon')) {
            this.achievements.add('speed-demon');
            newAchievements.push(achievementDefinitions['speed-demon']);
        }
        
        if (this.getAccuracy() === 100 && !this.achievements.has('perfectionist')) {
            this.achievements.add('perfectionist');
            newAchievements.push(achievementDefinitions['perfectionist']);
        }
        
        if (this.maxCombo >= 20 && !this.achievements.has('combo-master')) {
            this.achievements.add('combo-master');
            newAchievements.push(achievementDefinitions['combo-master']);
        }
        
        if (this.level >= 5 && !this.achievements.has('level-up')) {
            this.achievements.add('level-up');
            newAchievements.push(achievementDefinitions['level-up']);
        }
        
        return newAchievements;
    }

    checkAchievements() {
        const achievements = this.getUnlockedAchievements();
        achievements.forEach(achievement => {
            this.updateAchievementUI(achievement);
        });
        this.saveAchievements();
    }

    updateAchievementUI(achievement) {
        const achievementElement = document.querySelector(`[data-achievement="${achievement.key}"]`);
        if (achievementElement) {
            achievementElement.classList.add('unlocked');
        }
    }

    showComboEffect() {
        const effect = document.createElement('div');
        effect.className = 'combo-effect';
        effect.textContent = `${this.combo} 连击!`;
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 1000);
    }

    showScorePopup(points) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = `${event.clientX}px`;
        popup.style.top = `${event.clientY}px`;
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }

    playTypingSound() {
        // 创建简单的打字音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    changeTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else if (theme === 'light') {
            document.body.classList.remove('dark-theme');
        } else if (theme === 'auto') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-theme', isDark);
        }
    }

    saveSettings() {
        const settings = {
            soundEnabled: this.soundEnabled,
            fontSize: this.elements.fontSizeSlider.value,
            theme: this.elements.themeSelect.value,
            difficulty: this.currentDifficulty
        };
        localStorage.setItem('typingGameSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('typingGameSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
            this.elements.soundToggle.checked = this.soundEnabled;
            
            if (settings.fontSize) {
                this.elements.fontSizeSlider.value = settings.fontSize;
                document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
                this.elements.fontSizeSlider.nextElementSibling.textContent = `${settings.fontSize}px`;
            }
            
            if (settings.theme) {
                this.elements.themeSelect.value = settings.theme;
                this.changeTheme(settings.theme);
            }
            
            if (settings.difficulty) {
                this.currentDifficulty = settings.difficulty;
                this.elements.difficultyBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.level === settings.difficulty);
                });
            }
        }
    }

    saveAchievements() {
        localStorage.setItem('typingGameAchievements', JSON.stringify([...this.achievements]));
    }

    loadAchievements() {
        const savedAchievements = localStorage.getItem('typingGameAchievements');
        if (savedAchievements) {
            this.achievements = new Set(JSON.parse(savedAchievements));
            this.achievements.forEach(achievement => {
                const achievementElement = document.querySelector(`[data-achievement="${achievement}"]`);
                if (achievementElement) {
                    achievementElement.classList.add('unlocked');
                }
            });
        }
    }

    saveGameStats() {
        const stats = this.getGameStats();
        let allStats = JSON.parse(localStorage.getItem('typingGameStats') || '[]');
        allStats.push(stats);
        
        // 只保留最近100条记录
        if (allStats.length > 100) {
            allStats = allStats.slice(-100);
        }
        
        localStorage.setItem('typingGameStats', JSON.stringify(allStats));
    }

    getGameStats() {
        return {
            date: new Date().toISOString(),
            score: this.score,
            speed: this.getSpeed(),
            accuracy: this.getAccuracy(),
            level: this.level,
            difficulty: this.currentDifficulty,
            time: this.elements.timerValue.textContent,
            maxCombo: this.maxCombo
        };
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.typingGame = new TypingGame();
    
    // 模态框事件
    const closeModal = document.getElementById('close-modal');
    const playAgainBtn = document.getElementById('play-again-btn');
    const viewStatsBtn = document.getElementById('view-stats-btn');
    const modalOverlay = document.getElementById('game-over-modal');
    
    closeModal.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
    });
    
    playAgainBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        window.typingGame.startGame();
    });
    
    viewStatsBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        // 切换到统计页面
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-page="stats"]').classList.add('active');
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('stats-page').classList.add('active');
        
        // 更新统计显示
        if (window.statsManager) {
            window.statsManager.updateStatsDisplay();
        }
    });
    
    // 点击模态框外部关闭
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('show');
        }
    });
});