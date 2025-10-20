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
        
        const importBtn = document.getElementById('import-stats');
        const importFile = document.getElementById('import-file');
        
        if (importBtn) {
            importBtn.addEventListener('click', () => importFile.click());
        }
        
        if (importFile) {
            importFile.addEventListener('change', (e) => this.importStats(e));
        }
    }

    getAllStats() {
        return JSON.parse(localStorage.getItem('typingGameStats') || '[]');
    }
    
    getAllFallingStats() {
        return JSON.parse(localStorage.getItem('fallingGameStats') || '[]');
    }
    
    getAllUnifiedStats() {
        return JSON.parse(localStorage.getItem('unifiedGameStats') || '[]');
    }

    updateStatsDisplay() {
        const classicStats = this.getAllStats();
        const fallingStats = this.getAllFallingStats();
        const unifiedStats = this.getAllUnifiedStats();
        
        // 计算总体统计（包含两种模式）
        const allStats = [...classicStats, ...fallingStats];
        
        if (allStats.length === 0) {
            this.elements.totalGames.textContent = '0';
            this.elements.avgSpeed.textContent = '0 字/分钟';
            this.elements.avgAccuracy.textContent = '0%';
            this.elements.maxCombo.textContent = '0';
            this.elements.speedProgress.style.width = '0%';
            this.elements.accuracyProgress.style.width = '0%';
            
            // 更新模式特定统计
            this.updateModeSpecificStats(classicStats, fallingStats);
            return;
        }

        // 计算总体统计
        const totalGames = allStats.length;
        const classicGames = classicStats.length;
        const fallingGames = fallingStats.length;
        
        // 计算经典模式平均数据
        const avgSpeed = classicStats.length > 0 ? 
            Math.round(classicStats.reduce((sum, game) => sum + game.speed, 0) / classicStats.length) : 0;
        const avgAccuracy = classicStats.length > 0 ? 
            Math.round(classicStats.reduce((sum, game) => sum + game.accuracy, 0) / classicStats.length) : 0;
        const maxCombo = allStats.length > 0 ? 
            Math.max(...allStats.map(game => game.maxCombo)) : 0;

        // 更新显示
        this.elements.totalGames.textContent = totalGames;
        this.elements.avgSpeed.textContent = `${avgSpeed} 字/分钟`;
        this.elements.avgAccuracy.textContent = `${avgAccuracy}%`;
        this.elements.maxCombo.textContent = maxCombo;
        
        // 更新模式特定统计
        this.updateModeSpecificStats(classicStats, fallingStats);

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
        this.drawSpeedChart(classicStats);
        
        // 绘制综合统计图表
        this.drawUnifiedChart(unifiedStats);
    }
    
    updateModeSpecificStats(classicStats, fallingStats) {
        // 经典模式统计
        const classicGames = classicStats.length;
        const classicTotalChars = classicStats.reduce((sum, stat) => sum + (stat.totalChars || 0), 0);
        const classicCorrectChars = classicStats.reduce((sum, stat) => sum + (stat.correctChars || 0), 0);
        const classicCharAccuracy = classicTotalChars > 0 ? (classicCorrectChars / classicTotalChars * 100).toFixed(1) : 0;

        const classicStatsEl = document.getElementById('classic-stats');
        if (classicStatsEl) {
            classicStatsEl.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">经典模式游戏数</span>
                    <span class="stat-value">${classicGames}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">总输入字符</span>
                    <span class="stat-value">${classicTotalChars}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">字符准确率</span>
                    <span class="stat-value">${classicCharAccuracy}%</span>
                </div>
            `;
        }

        // 方块模式统计
        const fallingGames = fallingStats.length;
        const totalBlocks = fallingStats.reduce((sum, stat) => sum + (stat.totalBlocks || 0), 0);
        const destroyedBlocks = fallingStats.reduce((sum, stat) => sum + (stat.destroyedBlocks || 0), 0);
        const avgStackedWords = fallingGames > 0 ? (fallingStats.reduce((sum, stat) => sum + (stat.stackedWordsCount || 0), 0) / fallingGames).toFixed(1) : 0;

        const fallingStatsEl = document.getElementById('falling-stats');
        if (fallingStatsEl) {
            fallingStatsEl.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">方块模式游戏数</span>
                    <span class="stat-value">${fallingGames}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">总方块数</span>
                    <span class="stat-value">${totalBlocks}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">销毁方块数</span>
                    <span class="stat-value">${destroyedBlocks}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">平均堆积数</span>
                    <span class="stat-value">${avgStackedWords}</span>
                </div>
            `;
        }
    }

    // 添加数据导入导出功能
    exportStats() {
        const classicStats = this.getAllStats();
        const fallingStats = this.getAllFallingStats();
        const unifiedStats = this.getAllUnifiedStats();
        
        const exportData = {
            classicStats,
            fallingStats,
            unifiedStats,
            exportTime: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `typing-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    importStats(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.classicStats) {
                    localStorage.setItem('gameStats', JSON.stringify(importData.classicStats));
                }
                if (importData.fallingStats) {
                    localStorage.setItem('fallingGameStats', JSON.stringify(importData.fallingStats));
                }
                if (importData.unifiedStats) {
                    localStorage.setItem('unifiedGameStats', JSON.stringify(importData.unifiedStats));
                }
                
                alert('统计数据导入成功！');
                this.updateStatsDisplay();
            } catch (error) {
                alert('导入失败：文件格式错误');
            }
        };
        reader.readAsText(file);
    }

    // 重置统计数据
    resetStats() {
        if (confirm('确定要重置所有统计数据吗？此操作不可恢复！')) {
            localStorage.removeItem('gameStats');
            localStorage.removeItem('fallingGameStats');
            localStorage.removeItem('unifiedGameStats');
            
            alert('统计数据已重置！');
            this.updateStatsDisplay();
        }
    }
    
    drawUnifiedChart(unifiedStats) {
        const canvas = document.getElementById('unified-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (unifiedStats.length === 0) {
            ctx.fillStyle = '#a0aec0';
            ctx.font = '14px Roboto';
            ctx.textAlign = 'center';
            ctx.fillText('暂无数据', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // 按游戏模式分组数据
        const classicData = unifiedStats.filter(stat => stat.gameMode === 'classic');
        const fallingData = unifiedStats.filter(stat => stat.gameMode === 'falling');
        
        // 绘制模式对比图表
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
        
        // 绘制模式对比柱状图
        const barWidth = 60;
        const barSpacing = 20;
        const startX = padding + 50;
        
        // 经典模式数据
        const classicScore = classicData.length > 0 ? 
            Math.round(classicData.reduce((sum, game) => sum + game.score, 0) / classicData.length) : 0;
        const maxScore = Math.max(classicScore, fallingData.length > 0 ? 
            Math.round(fallingData.reduce((sum, game) => sum + game.score, 0) / fallingData.length) : 0, 100);
        
        // 经典模式柱状图
        const classicBarHeight = (classicScore / maxScore) * chartHeight;
        ctx.fillStyle = '#5a67d8';
        ctx.fillRect(startX, canvas.height - padding - classicBarHeight, barWidth, classicBarHeight);
        
        // 经典模式标签
        ctx.fillStyle = '#2d3748';
        ctx.font = '14px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('经典模式', startX + barWidth / 2, canvas.height - padding + 20);
        ctx.fillText(classicScore.toString(), startX + barWidth / 2, canvas.height - padding - classicBarHeight - 10);
        
        // 方块下落模式柱状图
        const fallingScore = fallingData.length > 0 ? 
            Math.round(fallingData.reduce((sum, game) => sum + game.score, 0) / fallingData.length) : 0;
        const fallingBarHeight = (fallingScore / maxScore) * chartHeight;
        ctx.fillStyle = '#e53e3e';
        ctx.fillRect(startX + barWidth + barSpacing, canvas.height - padding - fallingBarHeight, barWidth, fallingBarHeight);
        
        // 方块下落模式标签
        ctx.fillStyle = '#2d3748';
        ctx.fillText('方块模式', startX + barWidth + barSpacing + barWidth / 2, canvas.height - padding + 20);
        ctx.fillText(fallingScore.toString(), startX + barWidth + barSpacing + barWidth / 2, canvas.height - padding - fallingBarHeight - 10);
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