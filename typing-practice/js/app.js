class App {
    constructor() {
        this.currentPage = 'game';
        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
    }

    initializeElements() {
        this.elements = {
            navBtns: document.querySelectorAll('.nav-btn'),
            pages: document.querySelectorAll('.page'),
            timeLimit: document.getElementById('time-limit'),
            wordCount: document.getElementById('word-count'),
            fontValue: document.querySelector('.setting-value')
        };
    }

    bindEvents() {
        // 导航按钮事件
        this.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchPage(btn.dataset.page));
        });

        // 设置项事件
        this.elements.timeLimit.addEventListener('change', () => this.saveSettings());
        this.elements.wordCount.addEventListener('change', () => this.saveSettings());

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // 窗口大小改变时重绘图表
        window.addEventListener('resize', () => {
            if (this.currentPage === 'stats' && window.statsManager) {
                window.statsManager.updateStatsDisplay();
            }
            // 当窗口大小改变时，重新调整方块下落游戏的画布
            if (window.fallingGame && window.fallingGame.canvas) {
                window.fallingGame.resizeCanvas();
                // 如果游戏正在进行中，强制重绘
                if (window.fallingGame.gameActive && window.fallingGame.ctx) {
                    window.fallingGame.ctx.fillStyle = 'white';
                    window.fallingGame.ctx.fillRect(0, 0, window.fallingGame.canvas.width, window.fallingGame.canvas.height);
                    window.fallingGame.drawGrid();
                }
            }
        });

        // 页面可见性改变时暂停/恢复游戏
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (window.typingGame && window.typingGame.gameActive) {
                    this.pauseGame();
                } else if (window.fallingGame && window.fallingGame.gameActive) {
                    this.pauseFallingGame();
                }
            } else {
                if (this.pausedGame) {
                    this.resumeGame();
                } else if (this.pausedFallingGame) {
                    this.resumeFallingGame();
                }
            }
        });
    }

    initializeApp() {
        // 加载设置
        this.loadSettings();
        
        // 检查系统主题偏好
        this.checkSystemTheme();
        
        // 显示欢迎信息
        this.showWelcomeMessage();
        
        // 初始化提示系统
        this.initializeTooltips();
    }

    switchPage(pageName) {
        // 更新导航按钮状态
        this.elements.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageName);
        });

        // 更新页面显示
        this.elements.pages.forEach(page => {
            page.classList.toggle('active', page.id === `${pageName}-page`);
        });

        this.currentPage = pageName;

        // 页面切换时的特殊处理
        if (pageName === 'stats' && window.statsManager) {
            window.statsManager.updateStatsDisplay();
        }
        
        // 暂停当前游戏
        if (this.currentPage === 'game' && window.typingGame && window.typingGame.gameActive) {
            this.pauseGame();
        } else if (this.currentPage === 'falling' && window.fallingGame && window.fallingGame.gameActive) {
            this.pauseFallingGame();
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + 数字键快速切换页面
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    this.switchPage('game');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchPage('stats');
                    break;
                case '3':
                    e.preventDefault();
                    this.switchPage('settings');
                    break;
            }
        }

        // 空格键快速开始游戏
        if (e.key === ' ' && this.currentPage === 'game' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            if (window.typingGame && !window.typingGame.gameActive) {
                window.typingGame.startGame();
            }
        }

        // ESC键关闭模态框
        if (e.key === 'Escape') {
            const modal = document.getElementById('game-over-modal');
            if (modal.classList.contains('show')) {
                modal.classList.remove('show');
            }
        }
    }

    pauseGame() {
        if (window.typingGame && window.typingGame.gameActive) {
            this.pausedGame = true;
            this.pausedTime = Date.now();
            window.typingGame.stopTimer();
        }
    }

    resumeGame() {
        if (this.pausedGame && window.typingGame && window.typingGame.gameActive) {
            this.pausedGame = false;
            const pauseDuration = Date.now() - this.pausedTime;
            window.typingGame.startTime += pauseDuration;
            window.typingGame.startTimer();
        }
    }

    pauseFallingGame() {
        if (window.fallingGame && window.fallingGame.gameActive) {
            this.pausedFallingGame = true;
            this.pausedFallingTime = Date.now();
            window.fallingGame.gameActive = false;
            cancelAnimationFrame(window.fallingGame.animationId);
        }
    }

    resumeFallingGame() {
        if (this.pausedFallingGame && window.fallingGame) {
            this.pausedFallingGame = false;
            window.fallingGame.gameActive = true;
            window.fallingGame.gameLoop();
        }
    }

    saveSettings() {
        const settings = {
            timeLimit: this.elements.timeLimit.value,
            wordCount: this.elements.wordCount.value
        };
        localStorage.setItem('typingGameAdvancedSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('typingGameAdvancedSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            if (settings.timeLimit) {
                this.elements.timeLimit.value = settings.timeLimit;
            }
            
            if (settings.wordCount) {
                this.elements.wordCount.value = settings.wordCount;
            }
        }
    }

    checkSystemTheme() {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect && themeSelect.value === 'auto') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-theme', isDark);
            
            // 监听系统主题变化
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (themeSelect.value === 'auto') {
                    document.body.classList.toggle('dark-theme', e.matches);
                }
            });
        }
    }

    showWelcomeMessage() {
        const firstVisit = !localStorage.getItem('typingGameVisited');
        if (firstVisit) {
            setTimeout(() => {
                this.showNotification('欢迎来到打字大师！点击"开始游戏"开始你的打字练习之旅。', 5000);
                localStorage.setItem('typingGameVisited', 'true');
            }, 1000);
        }
    }

    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip(e.target);
            });
        });
    }

    showTooltip(element) {
        const text = element.getAttribute('data-tooltip');
        if (!text) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #2d3748;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            white-space: nowrap;
            max-width: 200px;
            word-wrap: break-word;
        `;

        document.body.appendChild(tooltip);

        // 计算位置
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width - tooltipRect.width) / 2;
        let top = rect.top - tooltipRect.height - 10;
        
        // 确保tooltip不会超出视窗
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        if (top < 10) {
            top = rect.bottom + 10;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        
        // 显示tooltip
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);

        element.tooltip = tooltip;
    }

    hideTooltip(element) {
        if (element.tooltip) {
            element.tooltip.style.opacity = '0';
            setTimeout(() => {
                if (element.tooltip && element.tooltip.parentNode) {
                    element.tooltip.parentNode.removeChild(element.tooltip);
                }
                element.tooltip = null;
            }, 300);
        }
    }

    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'app-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4a5568;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            font-weight: 500;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // 获取应用版本信息
    getVersion() {
        return '1.0.0';
    }

    // 检查更新
    checkForUpdates() {
        // 这里可以实现检查更新的逻辑
        console.log('当前版本:', this.getVersion());
    }

    // 导出用户数据
    exportUserData() {
        const userData = {
            settings: {
                typingGameSettings: localStorage.getItem('typingGameSettings'),
                typingGameAdvancedSettings: localStorage.getItem('typingGameAdvancedSettings'),
                typingGameAchievements: localStorage.getItem('typingGameAchievements')
            },
            stats: localStorage.getItem('typingGameStats'),
            version: this.getVersion(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `typing-game-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        this.showNotification('用户数据已导出');
    }

    // 导入用户数据
    importUserData(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const userData = JSON.parse(e.target.result);
                
                // 导入设置
                if (userData.settings) {
                    Object.keys(userData.settings).forEach(key => {
                        if (userData.settings[key]) {
                            localStorage.setItem(key, userData.settings[key]);
                        }
                    });
                }
                
                // 导入统计数据
                if (userData.stats) {
                    localStorage.setItem('typingGameStats', userData.stats);
                }
                
                // 重新加载页面以应用新设置
                this.showNotification('数据导入成功，页面将重新加载');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            } catch (error) {
                this.showNotification('数据导入失败：文件格式不正确');
            }
        };
        
        reader.readAsText(file);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
    // 添加全局样式
    const globalStyles = document.createElement('style');
    globalStyles.textContent = `
        .app-notification {
            font-family: 'Roboto', sans-serif;
        }
        
        /* 添加焦点样式 */
        button:focus,
        input:focus,
        select:focus {
            outline: 2px solid #5a67d8;
            outline-offset: 2px;
        }
        
        /* 添加加载动画 */
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #5a67d8;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 添加滚动条样式 */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
        }
        
        /* 深色主题滚动条 */
        body.dark-theme ::-webkit-scrollbar-track {
            background: #2d3748;
        }
        
        body.dark-theme ::-webkit-scrollbar-thumb {
            background: #4a5568;
        }
        
        body.dark-theme ::-webkit-scrollbar-thumb:hover {
            background: #718096;
        }
    `;
    document.head.appendChild(globalStyles);
    
    // 添加错误处理
    window.addEventListener('error', (e) => {
        console.error('应用错误:', e.error);
        // 这里可以添加错误报告逻辑
    });
    
    // 添加性能监控
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            console.log(`页面加载时间: ${loadTime}ms`);
        });
    }
});