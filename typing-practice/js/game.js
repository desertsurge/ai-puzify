class TypingGame {
    constructor() {
        this.texts = {
            easy: [
                // 字母练习
                "a b c d e f g h i j k l m n o p q r s t u v w x y z",
                "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z",
                "the cat sat on the mat",
                "a big red dog ran fast",
                "I see the sun in the sky",
                "my name is Tom and I am six",
                "we go to school every day",
                "the ball is under the bed",
                "mom and dad love me so much",
                "I can jump high and run fast",
                // 简单单词
                "apple banana cherry date egg fruit grape honey ice juice",
                "book cat dog elephant fish goat horse iguana jelly kite",
                "love moon night ocean park queen rose sun tree umbrella",
                "van window yellow zoo ant bug cup duck egg fan gift hat",
                "ink key lamp mouse nest owl pig quilt rat snake turtle",
                // 简单句子
                "The cat is black and white.",
                "I like to eat ice cream.",
                "My dog likes to play ball.",
                "We go to the park on Sunday.",
                "The sun is big and yellow.",
                "I have two red apples here.",
                "Mom makes good cookies for me.",
                "Dad reads me a bedtime story.",
                "My sister has a cute bunny.",
                "I can count to ten very well."
            ],
            medium: [
                // 中等难度单词
                "computer internet keyboard monitor printer mouse screen laptop tablet phone",
                "breakfast lunch dinner sandwich pizza hamburger salad soup rice noodles",
                "basketball football tennis swimming running jumping climbing dancing singing",
                "happy excited surprised angry sad tired bored hungry thirsty sleepy cold",
                "spring summer autumn winter January February March April May June July",
                // 中等难度句子
                "My favorite subject in school is science because I love doing experiments.",
                "Every Saturday morning, my family goes to the farmer's market together.",
                "I want to be a doctor when I grow up so I can help sick people feel better.",
                "The library near my house has thousands of interesting books to read.",
                "We planted sunflower seeds in our garden and watched them grow very tall.",
                "My best friend and I like to build things with Lego blocks after school.",
                "Learning to play the piano takes lots of practice but it's very rewarding.",
                "The museum had an amazing dinosaur exhibit that taught us about prehistoric life.",
                "Volunteering at the animal shelter made me realize how important kindness is.",
                "Our school science fair project about renewable energy won first prize this year."
            ],
            hard: [
                // 复杂单词和短语
                "extraordinary magnificent spectacular incredible unbelievable phenomenal outstanding remarkable extraordinary",
                "responsibility determination perseverance achievement celebration opportunity possibility potential success",
                "environmental conservation sustainability biodiversity ecosystem atmosphere pollution renewable resources",
                "technological advancement innovation artificial intelligence digital transformation automation robotics",
                "communication collaboration teamwork leadership motivation inspiration creativity productivity efficiency",
                // 复杂句子
                "The rapid advancement of technology has fundamentally transformed how we communicate, work, and learn in modern society.",
                "Climate change represents one of the most pressing challenges facing humanity, requiring immediate and coordinated global action.",
                "Critical thinking skills enable individuals to analyze complex problems, evaluate evidence, and make informed decisions based on logic.",
                "The preservation of cultural heritage through museums, historical sites, and traditional practices connects us to our collective past.",
                "Space exploration continues to push the boundaries of human knowledge and technological capabilities beyond our planet Earth.",
                "Economic globalization has created unprecedented interconnectedness between nations, cultures, and markets worldwide.",
                "The human brain's capacity for learning, adaptation, and creativity remains one of science's most fascinating mysteries.",
                "Sustainable development requires balancing environmental protection with economic growth and social equity for future generations.",
                "Digital literacy has become an essential skill in the information age, affecting education, employment, and civic participation.",
                "The scientific method provides a systematic approach to understanding natural phenomena through observation, experimentation, and analysis."
            ],
            expert: [
                // 专业术语和复杂概念
                "photosynthesis chlorophyll mitochondria chromosome DNA RNA protein synthesis cellular respiration metabolism",
                "democracy constitution legislation judiciary executive sovereignty federalism republic monarchy parliament congress",
                "capitalism socialism communism economy inflation recession depression supply demand market equilibrium competition",
                "psychology consciousness subconscious behavior cognition perception emotion motivation personality intelligence",
                "philosophy metaphysics epistemology ethics aesthetics logic reasoning argument evidence truth knowledge reality",
                // 长难句
                "The interdisciplinary nature of modern scientific research requires collaboration between experts in diverse fields such as physics, chemistry, biology, and computer science to solve complex problems.",
                "Globalization has created both opportunities and challenges for developing nations seeking to participate in international trade while preserving their cultural identity and economic sovereignty.",
                "The ethical implications of artificial intelligence and machine learning technologies raise important questions about privacy, bias, accountability, and the future of human labor in automated societies.",
                "Quantum mechanics revolutionized our understanding of atomic and subatomic particles, introducing concepts like wave-particle duality and uncertainty principles that challenge classical physics.",
                "The Renaissance period in European history marked a cultural rebirth that transformed art, science, literature, and philosophy through renewed interest in classical Greek and Roman knowledge.",
                "Climate scientists use sophisticated computer models and satellite data to predict future weather patterns and understand the complex interactions between atmosphere, oceans, and land surfaces.",
                "The human genome project successfully mapped all genes in human DNA, opening new possibilities for personalized medicine and genetic therapies for previously incurable diseases.",
                "Democratic institutions face ongoing challenges from misinformation, political polarization, and foreign interference in electoral processes through social media manipulation and cyber attacks.",
                "Sustainable urban planning must consider transportation systems, green spaces, energy efficiency, waste management, and affordable housing to create livable cities for growing populations.",
                "The philosophy of mind explores fundamental questions about consciousness, free will, personal identity, and the relationship between mental states and physical brain processes."
            ]
        };
        
        // 新增：每局练习的句子数量
        this.sentencesPerRound = 3; // 每局3个句子
        this.currentSentences = []; // 当前局的句子列表
        this.currentSentenceIndex = 0; // 当前句子索引

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
        
        // 如果是新一局，随机选择多个句子
        if (this.currentSentenceIndex === 0) {
            this.currentSentences = [];
            const availableTexts = [...texts];
            
            // 随机选择指定数量的句子
            for (let i = 0; i < this.sentencesPerRound && availableTexts.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableTexts.length);
                this.currentSentences.push(availableTexts[randomIndex]);
                availableTexts.splice(randomIndex, 1); // 移除已选择的句子，避免重复
            }
        }
        
        // 设置当前要练习的句子
        this.currentText = this.currentSentences[this.currentSentenceIndex];
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
        this.currentSentenceIndex = 0; // 重置句子索引
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
        // 检查是否还有下一个句子
        if (this.currentSentenceIndex < this.currentSentences.length - 1) {
            // 还有下一个句子，继续练习
            this.currentSentenceIndex++;
            this.currentIndex = 0;
            this.userInputChars = '';
            this.elements.userInput.value = '';
            this.loadNewText();
            this.updateStats();
            
            // 显示进度提示
            this.showSentenceProgress();
        } else {
            // 所有句子都完成了，结束本局
            this.gameActive = false;
            this.stopTimer();
            
            // 增加关卡
            this.level++;
            
            // 重置句子索引
            this.currentSentenceIndex = 0;
            
            // 检查成就
            this.checkAchievements();
            
            // 显示结果
            this.showResults();
            
            // 保存统计数据
            this.saveGameStats();
        }
    }

    showSentenceProgress() {
        // 显示句子进度提示
        const progressText = `句子 ${this.currentSentenceIndex + 1} / ${this.currentSentences.length}`;
        
        // 创建临时提示元素
        const progressToast = document.createElement('div');
        progressToast.className = 'sentence-progress-toast';
        progressToast.textContent = progressText;
        progressToast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(progressToast);
        
        // 3秒后移除提示
        setTimeout(() => {
            progressToast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (progressToast.parentNode) {
                    progressToast.parentNode.removeChild(progressToast);
                }
            }, 300);
        }, 2000);
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
        
        // 同时保存到统一的游戏统计中
        this.saveToUnifiedStats(stats);
    }
    
    saveToUnifiedStats(classicStats) {
        let unifiedStats = JSON.parse(localStorage.getItem('unifiedGameStats') || '[]');
        unifiedStats.push({
            ...classicStats,
            gameMode: 'classic'
        });
        
        // 只保留最近200条记录
        if (unifiedStats.length > 200) {
            unifiedStats = unifiedStats.slice(-200);
        }
        
        localStorage.setItem('unifiedGameStats', JSON.stringify(unifiedStats));
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
            maxCombo: this.maxCombo,
            totalChars: this.totalChars,
            correctChars: this.correctChars,
            incorrectChars: this.incorrectChars,
            gameMode: 'classic',
            playTime: Math.floor((Date.now() - this.startTime) / 1000)
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