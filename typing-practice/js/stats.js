class StatsManager {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.updateStatsDisplay();
    }

    initializeElements() {
        this.elements = {
            totalGames: document.getElementById('total-games'),
            avgSpeed: document.getElementById('avg-speed'),
            avgAccuracy: document.getElementById('avg-accuracy'),
            maxCombo: document.getElementById('max-combo'),
            speedProgress: document.getElementById('speed-progress'),
            accuracyProgress: document.getElementById('accuracy-progress'),
            resetStatsBtn: document.getElementById('reset-stats'),
            exportStatsBtn: document.getElementById('export-stats')
        };
    }

    bindEvents() {
        this.elements.resetStatsBtn.addEventListener('click', () => this.resetStats());
        this.elements.exportStatsBtn.addEventListener('click', () => this.exportStats());
    }

    getAllStats() {
        return JSON.parse(localStorage.getItem('typingGameStats') || '[]');
    }

    updateStatsDisplay() {
        const stats = this.getAllStats();
        
        if (stats.length === 0) {
            this.elements.totalGames.textContent = '0';
            this.elements.avgSpeed.textContent = '0 字/分钟';
            this.elements.avgAccuracy.textContent = '0%';
            this.elements.maxCombo.textContent = '0';
            this.elements.speedProgress.style.width = '0%';
            this.elements.accuracyProgress.style.width = '0%';
            return;
        }

        // 计算总体统计
        const totalGames = stats.length;
        const avgSpeed = Math.round(stats.reduce((sum, game) => sum + game.speed, 0) / totalGames);
        const avgAccuracy = Math.round(stats.reduce((sum, game) => sum + game.accuracy, 0) / totalGames);
        const maxCombo = Math.max(...stats.map(game => game.maxCombo));

        // 更新显示
        this.elements.totalGames.textContent = totalGames;
        this.elements.avgSpeed.textContent = `${avgSpeed} 字/分钟`;
        this.elements.avgAccuracy.textContent = `${avgAccuracy}%`;
        this.elements.maxCombo.textContent = maxCombo;

        // 计算进度
        const speedProgress = Math.min((avgSpeed / 100) * 100, 100);
        const accuracyProgress = avgAccuracy;

        this.elements.speedProgress.style.width = `${speedProgress}%`;
        this.elements.accuracyProgress.style.width = `${accuracyProgress}%`;

        // 更新进度值显示
        const speedProgressValue = this.elements.speedProgress.parentElement.nextElementSibling;
        const accuracyProgressValue = this.elements.accuracyProgress.parentElement.nextElementSibling;
        
        if (speedProgressValue) {
            speedProgressValue.textContent = `${Math.round(speedProgress)}%`;
        }
        
        if (accuracyProgressValue) {
            accuracyProgressValue.textContent = `${accuracyProgress}%`;
        }

        // 绘制图表
        this.drawSpeedChart(stats);
    }

    drawSpeedChart(stats) {
        const canvas = document.getElementById('speed-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (stats.length === 0) {
            ctx.fillStyle = '#a0aec0';
            ctx.font = '14px Roboto';
            ctx.textAlign = 'center';
            ctx.fillText('暂无数据', canvas.width / 2, canvas.height / 2);
            return;
        }

        // 获取最近20条记录
        const recentStats = stats.slice(-20);
        const maxSpeed = Math.max(...recentStats.map(game => game.speed));
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // 绘制坐标轴
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // 绘制速度曲线
        ctx.strokeStyle = '#5a67d8';
        ctx.lineWidth = 2;
        ctx.beginPath();

        recentStats.forEach((game, index) => {
            const x = padding + (index / (recentStats.length - 1)) * chartWidth;
            const y = canvas.height - padding - (game.speed / maxSpeed) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // 绘制数据点
            ctx.fillStyle = '#5a67d8';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        ctx.stroke();

        // 绘制标签
        ctx.fillStyle = '#718096';
        ctx.font = '12px Roboto';
        ctx.textAlign = 'center';

        // X轴标签
        recentStats.forEach((game, index) => {
            if (index % Math.ceil(recentStats.length / 5) === 0) {
                const x = padding + (index / (recentStats.length - 1)) * chartWidth;
                ctx.fillText(`游戏${index + 1}`, x, canvas.height - padding + 20);
            }
        });

        // Y轴标签
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = canvas.height - padding - (i / 5) * chartHeight;
            const speed = Math.round((i / 5) * maxSpeed);
            ctx.fillText(`${speed}`, padding - 10, y + 4);
        }
    }

    resetStats() {
        if (confirm('确定要重置所有统计数据吗？此操作不可撤销。')) {
            localStorage.removeItem('typingGameStats');
            this.updateStatsDisplay();
            
            // 显示重置成功提示
            this.showNotification('统计数据已重置');
        }
    }

    exportStats() {
        const stats = this.getAllStats();
        
        if (stats.length === 0) {
            this.showNotification('暂无数据可导出');
            return;
        }

        // 创建CSV内容
        const headers = ['日期', '得分', '速度(字/分钟)', '准确率(%)', '关卡', '难度', '用时', '最高连击'];
        const csvContent = [
            headers.join(','),
            ...stats.map(game => [
                new Date(game.date).toLocaleString(),
                game.score,
                game.speed,
                game.accuracy,
                game.level,
                this.getDifficultyName(game.difficulty),
                game.time,
                game.maxCombo
            ].join(','))
        ].join('\n');

        // 创建下载链接
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `typing-game-stats-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('统计数据已导出');
    }

    getDifficultyName(difficulty) {
        const names = {
            easy: '初级',
            medium: '中级',
            hard: '高级',
            expert: '专家'
        };
        return names[difficulty] || difficulty;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getDetailedStats() {
        const stats = this.getAllStats();
        
        if (stats.length === 0) {
            return null;
        }

        // 按难度分组统计
        const statsByDifficulty = {
            easy: stats.filter(game => game.difficulty === 'easy'),
            medium: stats.filter(game => game.difficulty === 'medium'),
            hard: stats.filter(game => game.difficulty === 'hard'),
            expert: stats.filter(game => game.difficulty === 'expert')
        };

        // 计算各难度统计
        const difficultyStats = {};
        Object.keys(statsByDifficulty).forEach(difficulty => {
            const games = statsByDifficulty[difficulty];
            if (games.length > 0) {
                difficultyStats[difficulty] = {
                    count: games.length,
                    avgSpeed: Math.round(games.reduce((sum, game) => sum + game.speed, 0) / games.length),
                    avgAccuracy: Math.round(games.reduce((sum, game) => sum + game.accuracy, 0) / games.length),
                    avgScore: Math.round(games.reduce((sum, game) => sum + game.score, 0) / games.length),
                    bestSpeed: Math.max(...games.map(game => game.speed)),
                    bestAccuracy: Math.max(...games.map(game => game.accuracy)),
                    bestScore: Math.max(...games.map(game => game.score))
                };
            }
        });

        // 计算进步趋势
        const recentStats = stats.slice(-10);
        const olderStats = stats.slice(-20, -10);
        
        let speedTrend = 0;
        let accuracyTrend = 0;
        
        if (recentStats.length > 0 && olderStats.length > 0) {
            const recentAvgSpeed = recentStats.reduce((sum, game) => sum + game.speed, 0) / recentStats.length;
            const olderAvgSpeed = olderStats.reduce((sum, game) => sum + game.speed, 0) / olderStats.length;
            speedTrend = ((recentAvgSpeed - olderAvgSpeed) / olderAvgSpeed * 100).toFixed(1);
            
            const recentAvgAccuracy = recentStats.reduce((sum, game) => sum + game.accuracy, 0) / recentStats.length;
            const olderAvgAccuracy = olderStats.reduce((sum, game) => sum + game.accuracy, 0) / olderStats.length;
            accuracyTrend = ((recentAvgAccuracy - olderAvgAccuracy) / olderAvgAccuracy * 100).toFixed(1);
        }

        return {
            totalGames: stats.length,
            overallStats: {
                avgSpeed: Math.round(stats.reduce((sum, game) => sum + game.speed, 0) / stats.length),
                avgAccuracy: Math.round(stats.reduce((sum, game) => sum + game.accuracy, 0) / stats.length),
                avgScore: Math.round(stats.reduce((sum, game) => sum + game.score, 0) / stats.length),
                maxCombo: Math.max(...stats.map(game => game.maxCombo)),
                bestSpeed: Math.max(...stats.map(game => game.speed)),
                bestAccuracy: Math.max(...stats.map(game => game.accuracy)),
                bestScore: Math.max(...stats.map(game => game.score))
            },
            difficultyStats,
            trends: {
                speed: parseFloat(speedTrend),
                accuracy: parseFloat(accuracyTrend)
            },
            recentGames: stats.slice(-5).reverse()
        };
    }
}

// 初始化统计管理器
document.addEventListener('DOMContentLoaded', () => {
    window.statsManager = new StatsManager();
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});