// 游戏状态管理
class GameState {
    constructor() {
        this.gold = 150;
        this.health = 10;
        this.maxHealth = 10;
        this.wave = 1;
        this.score = 0;
        this.isPaused = false;
        this.gameSpeed = 1;
        this.isGameOver = false;
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.currentMap = 0;
        this.isWaveActive = false;
        this.waveTimer = null;
        this.gameLoop = null;
        this.enemiesKilled = 0;
        this.towersBuilt = 0;
        this.totalDamageDealt = 0;
        this.achievements = {
            firstBlood: false,
            towerMaster: false,
            survivor: false,
            rich: false,
            sniper: false,
            wave10: false,
            wave20: false,
            noDamage: false
        };
        this.soundEnabled = true;
        this.particlesEnabled = true;
        this.pathHintsEnabled = true;
        this.isFullscreen = false;
    }

    updateGold(amount) {
        this.gold += amount;
        document.getElementById('gold').textContent = this.gold;
    }

    updateHealth(amount) {
        const oldHealth = this.health;
        this.health = Math.max(0, Math.min(this.maxHealth, this.health + amount));
        document.getElementById('health').textContent = this.health;
        document.getElementById('currentHealth').textContent = this.health;
        
        // 更新小动物血条
        const healthPercent = (this.health / this.maxHealth) * 100;
        document.getElementById('animalHealthBar').style.width = healthPercent + '%';
        
        // 血量警告效果
        if (this.health <= 3 && this.health > 0) {
            document.getElementById('animalHealthBar').style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            document.querySelector('.animal-health-bar').classList.add('warning');
        } else {
            document.getElementById('animalHealthBar').style.background = 'linear-gradient(90deg, #ff6b6b, #ee5a24)';
            document.querySelector('.animal-health-bar').classList.remove('warning');
        }
        
        if (this.health <= 0) {
            this.gameOver(false);
        }
        
        // 无伤成就检查
        if (amount < 0 && oldHealth === this.maxHealth) {
            this.achievements.noDamage = false;
        }
    }

    updateWave() {
        this.wave++;
        document.getElementById('wave').textContent = this.wave;
    }

    updateScore(amount) {
        this.score += amount;
        document.getElementById('score').textContent = this.score;
        
        // 检查成就
        this.checkAchievements();
        
        // 检查特殊奖励
        this.checkSpecialRewards();
    }
    
    checkSpecialRewards() {
        // 完美防御奖励：10个防御塔全部升级到3级以上
        const highLevelTowers = gameState.towers.filter(tower => tower.level >= 3).length;
        if (highLevelTowers >= 10 && !this.achievements.perfectDefense) {
            this.achievements.perfectDefense = true;
            this.updateGold(100);
            this.updateScore(500);
            showNotification('完美防御！获得 100 金币奖励');
        }
        
        // 经济大师奖励：拥有500金币
        if (this.gold >= 500 && !this.achievements.economicMaster) {
            this.achievements.economicMaster = true;
            this.updateScore(300);
            showNotification('经济大师！+300 分数');
        }
        
        // 神射手奖励：单个防御塔击杀50个敌人
        gameState.towers.forEach(tower => {
            if (tower.kills >= 50 && !tower.achievementAwarded) {
                tower.achievementAwarded = true;
                this.updateGold(50);
                this.updateScore(200);
                showNotification(`神射手！${tower.description} 获得 50 金币`);
            }
        });
    }
    
    checkAchievements() {
        // 首次击杀
        if (this.enemiesKilled >= 1 && !this.achievements.firstBlood) {
            this.achievements.firstBlood = true;
            this.unlockAchievement('firstBlood');
        }
        
        // 防御大师
        if (this.towersBuilt >= 10 && !this.achievements.towerMaster) {
            this.achievements.towerMaster = true;
            this.unlockAchievement('towerMaster');
        }
        
        // 生存专家
        if (this.wave >= 5 && !this.achievements.survivor) {
            this.achievements.survivor = true;
            this.unlockAchievement('survivor');
        }
        
        // 富翁
        if (this.gold >= 500 && !this.achievements.rich) {
            this.achievements.rich = true;
            this.unlockAchievement('rich');
        }
        
        // 狙击手
        if (this.totalDamageDealt >= 1000 && !this.achievements.sniper) {
            this.achievements.sniper = true;
            this.unlockAchievement('sniper');
        }
        
        // 波次成就
        if (this.wave >= 10 && !this.achievements.wave10) {
            this.achievements.wave10 = true;
            this.unlockAchievement('wave10');
        }
        
        if (this.wave >= 20 && !this.achievements.wave20) {
            this.achievements.wave20 = true;
            this.unlockAchievement('wave20');
        }
    }
    
    unlockAchievement(achievementId) {
        const achievementElement = document.querySelector(`[data-achievement="${achievementId}"]`);
        if (achievementElement) {
            achievementElement.classList.add('unlocked');
            this.showAchievementNotification(achievementId);
            this.updateScore(50); // 成就奖励
        }
    }
    
    showAchievementNotification(achievementId) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <span class="achievement-icon">🏆</span>
                <span class="achievement-text">成就解锁！</span>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .achievement-notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                animation: slideInRight 0.5s ease-out;
            }
            
            .achievement-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }

    gameOver(isVictory) {
        this.isGameOver = true;
        this.isPaused = true;
        clearInterval(this.gameLoop);
        clearTimeout(this.waveTimer);
        
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        const finalScore = document.getElementById('finalScore');
        const finalWave = document.getElementById('finalWave');
        const enemiesKilled = document.getElementById('enemiesKilled');
        const towersBuilt = document.getElementById('towersBuilt');
        const modalIcon = document.getElementById('modalIcon');
        
        if (isVictory) {
            title.textContent = '🎉 胜利！';
            message.textContent = '你成功保护了小动物！';
            modalIcon.textContent = '🎉';
        } else {
            title.textContent = '💔 游戏结束';
            message.textContent = '小动物需要你的保护！';
            modalIcon.textContent = '😢';
        }
        
        finalScore.textContent = this.score;
        finalWave.textContent = this.wave;
        enemiesKilled.textContent = this.enemiesKilled;
        towersBuilt.textContent = this.towersBuilt;
        
        modal.style.display = 'flex';
    }
}

// 地图系统
class MapSystem {
    constructor() {
        this.maps = [
            {
                name: '森林路径',
                path: [
                    {x: 0, y: 200},
                    {x: 150, y: 200},
                    {x: 150, y: 100},
                    {x: 300, y: 100},
                    {x: 300, y: 300},
                    {x: 450, y: 300},
                    {x: 450, y: 200},
                    {x: 600, y: 200},
                    {x: 600, y: 400},
                    {x: 800, y: 400}
                ],
                animalPosition: {x: 850, y: 400},
                towerSpots: [
                    {x: 100, y: 150}, {x: 200, y: 150}, {x: 250, y: 250},
                    {x: 350, y: 50}, {x: 350, y: 200}, {x: 350, y: 350},
                    {x: 500, y: 250}, {x: 550, y: 150}, {x: 550, y: 350},
                    {x: 650, y: 350}, {x: 700, y: 450}
                ]
            },
            {
                name: '沙漠绿洲',
                path: [
                    {x: 0, y: 300},
                    {x: 200, y: 300},
                    {x: 200, y: 150},
                    {x: 400, y: 150},
                    {x: 400, y: 350},
                    {x: 250, y: 350},
                    {x: 250, y: 500},
                    {x: 500, y: 500},
                    {x: 500, y: 250},
                    {x: 700, y: 250},
                    {x: 700, y: 400},
                    {x: 800, y: 400}
                ],
                animalPosition: {x: 850, y: 400},
                towerSpots: [
                    {x: 150, y: 200}, {x: 150, y: 400}, {x: 300, y: 100},
                    {x: 300, y: 250}, {x: 300, y: 450}, {x: 450, y: 200},
                    {x: 450, y: 400}, {x: 600, y: 150}, {x: 600, y: 350},
                    {x: 750, y: 300}
                ]
            },
            {
                name: '冰雪世界',
                path: [
                    {x: 0, y: 200},
                    {x: 100, y: 200},
                    {x: 100, y: 100},
                    {x: 300, y: 100},
                    {x: 300, y: 200},
                    {x: 200, y: 200},
                    {x: 200, y: 300},
                    {x: 400, y: 300},
                    {x: 400, y: 150},
                    {x: 500, y: 150},
                    {x: 500, y: 350},
                    {x: 600, y: 350},
                    {x: 600, y: 250},
                    {x: 700, y: 250},
                    {x: 700, y: 400},
                    {x: 800, y: 400}
                ],
                animalPosition: {x: 850, y: 400},
                towerSpots: [
                    {x: 50, y: 150}, {x: 150, y: 50}, {x: 150, y: 250},
                    {x: 250, y: 150}, {x: 250, y: 350}, {x: 350, y: 250},
                    {x: 450, y: 100}, {x: 450, y: 250}, {x: 550, y: 100},
                    {x: 550, y: 300}, {x: 650, y: 300}, {x: 750, y: 350}
                ]
            }
        ];
    }

    getCurrentMap() {
        return this.maps[gameState.currentMap];
    }

    switchMap() {
        gameState.currentMap = (gameState.currentMap + 1) % this.maps.length;
        this.renderMap();
    }

    renderMap() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const map = this.getCurrentMap();
        
        // 设置画布大小
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // 清空画布
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制路径
        ctx.strokeStyle = '#74b9ff';
        ctx.lineWidth = 40;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        map.path.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        
        // 绘制防御塔位置
        ctx.fillStyle = '#00b894';
        map.towerSpots.forEach(spot => {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, 20, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 绘制小动物
        ctx.font = '30px Arial';
        ctx.fillText('🐰', map.animalPosition.x, map.animalPosition.y);
    }
}

// 防御塔系统
class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = 1;
        this.lastShot = 0;
        this.target = null;
        this.kills = 0;
        this.totalDamage = 0;
        this.rotation = 0;
        
        // 根据类型设置属性
        switch(type) {
            case 'archer':
                this.icon = '🏹';
                this.damage = 15;
                this.range = 130;
                this.fireRate = 800; // 毫秒
                this.cost = 25;
                this.upgradeCost = 20;
                this.projectileSpeed = 7;
                this.projectileColor = '#f39c12';
                this.description = '远程单体攻击';
                this.efficiency = 0.8; // 性价比
                break;
            case 'mage':
                this.icon = '🧙';
                this.damage = 25;
                this.range = 100;
                this.fireRate = 1200;
                this.cost = 45;
                this.upgradeCost = 32;
                this.projectileSpeed = 5;
                this.projectileColor = '#9b59b6';
                this.isAoE = true;
                this.aoeRadius = 65;
                this.description = '范围魔法攻击';
                this.efficiency = 0.7;
                break;
            case 'cannon':
                this.icon = '💣';
                this.damage = 50;
                this.range = 90;
                this.fireRate = 1600;
                this.cost = 70;
                this.upgradeCost = 48;
                this.projectileSpeed = 4;
                this.projectileColor = '#e74c3c';
                this.isAoE = true;
                this.aoeRadius = 80;
                this.description = '高伤害溅射';
                this.efficiency = 0.6;
                break;
            case 'ice':
                this.icon = '❄️';
                this.damage = 10;
                this.range = 110;
                this.fireRate = 600;
                this.cost = 30;
                this.upgradeCost = 24;
                this.projectileSpeed = 6;
                this.projectileColor = '#00cec9';
                this.slowEffect = 0.3;
                this.slowDuration = 3000;
                this.description = '减速敌人';
                this.efficiency = 0.9;
                break;
        }
    }

    upgrade() {
        if (gameState.gold >= this.upgradeCost) {
            gameState.updateGold(-this.upgradeCost);
            this.level++;
            const oldDamage = this.damage;
            const oldRange = this.range;
            const oldFireRate = this.fireRate;
            
            this.damage = Math.floor(this.damage * 1.4);
            this.range = Math.floor(this.range * 1.15);
            this.fireRate = Math.floor(this.fireRate * 0.85);
            this.upgradeCost = Math.floor(this.upgradeCost * 1.6);
            
            // 升级特效
            this.createUpgradeEffect();
            
            return true;
        }
        return false;
    }
    
    createUpgradeEffect() {
        if (!gameState.particlesEnabled) return;
        
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 3 + Math.random() * 2;
            const particle = new Particle(
                this.x,
                this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#f39c12',
                1000
            );
            gameState.particles.push(particle);
        }
    }

    sell() {
        const sellPrice = Math.floor(this.cost * 0.8 * this.level);
        gameState.updateGold(sellPrice);
        
        // 创建出售特效
        this.createSellEffect();
        
        return sellPrice;
    }
    
    createSellEffect() {
        if (!gameState.particlesEnabled) return;
        
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = 1 + Math.random() * 2;
            const particle = new Particle(
                this.x,
                this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#f39c12',
                1200
            );
            gameState.particles.push(particle);
        }
    }

    findTarget() {
        let bestEnemy = null;
        let bestScore = -Infinity;
        
        gameState.enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + 
                Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= this.range) {
                // 智能目标选择算法
                let score = 0;
                
                // 优先攻击血量少的敌人
                score += (1 - enemy.health / enemy.maxHealth) * 50;
                
                // 优先攻击威胁等级高的敌人
                score += (enemy.threatLevel || 1) * 20;
                
                // 优先攻击距离近的敌人
                score += (1 - distance / this.range) * 30;
                
                // Boss敌人优先级最高
                if (enemy.type === 'boss') {
                    score += 100;
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestEnemy = enemy;
                }
            }
        });
        
        this.target = bestEnemy;
    }

    shoot() {
        if (!this.target || this.target.health <= 0) return;
        
        const now = Date.now();
        if (now - this.lastShot >= this.fireRate / gameState.gameSpeed) {
            this.lastShot = now;
            
            // 旋转效果
            if (this.target) {
                const dx = this.target.x - this.x;
                const dy = this.target.y - this.y;
                this.rotation = Math.atan2(dy, dx);
            }
            
            const projectile = new Projectile(
                this.x, 
                this.y, 
                this.target, 
                this.damage,
                this.projectileSpeed,
                this.projectileColor,
                this.type === 'ice' ? this.slowEffect : 0,
                this.type === 'ice' ? this.slowDuration : 0,
                this.isAoE ? this.aoeRadius : 0
            );
            
            gameState.projectiles.push(projectile);
            
            // 射击特效
            this.createShootEffect();
        }
    }
    
    createShootEffect() {
        if (!gameState.particlesEnabled) return;
        
        const particle = new Particle(
            this.x,
            this.y,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            this.projectileColor,
            300
        );
        gameState.particles.push(particle);
    }

    render() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // 绘制射程范围（如果被选中）
        if (this === gameState.selectedTower) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // 绘制攻击指示线
            if (this.target) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.target.x, this.target.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
        
        // 绘制防御塔底座
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x + 2, this.y + 2, 18, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 18, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制防御塔图标
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        ctx.restore();
        
        // 绘制等级
        if (this.level > 1) {
            ctx.fillStyle = '#f39c12';
            ctx.strokeStyle = '#2d3436';
            ctx.lineWidth = 3;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.strokeText('Lv.' + this.level, this.x, this.y - 25);
            ctx.fillText('Lv.' + this.level, this.x, this.y - 25);
        }
        
        // 绘制击杀数
        if (this.kills > 0) {
            ctx.fillStyle = '#e74c3c';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('K:' + this.kills, this.x, this.y + 25);
        }
    }
}

// 投射物系统
class Projectile {
    constructor(x, y, target, damage, speed, color, slowEffect, slowDuration, aoeRadius) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.color = color;
        this.slowEffect = slowEffect;
        this.slowDuration = slowDuration;
        this.aoeRadius = aoeRadius;
    }

    update() {
        if (!this.target || this.target.health <= 0) {
            return false;
        }
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
            // 击中目标
            this.target.takeDamage(this.damage);
            
            // 应用减速效果
            if (this.slowEffect > 0) {
                this.target.applySlow(this.slowEffect, this.slowDuration);
            }
            
            // 范围伤害
            if (this.aoeRadius > 0) {
                gameState.enemies.forEach(enemy => {
                    if (enemy !== this.target) {
                        const dist = Math.sqrt(
                            Math.pow(enemy.x - this.target.x, 2) + 
                            Math.pow(enemy.y - this.target.y, 2)
                        );
                        if (dist <= this.aoeRadius) {
                            enemy.takeDamage(Math.floor(this.damage * 0.5));
                        }
                    }
                });
                
                // 创建爆炸效果
                this.createExplosion();
            }
            
            return false;
        }
        
        // 移动投射物
        this.x += (dx / distance) * this.speed * gameState.gameSpeed;
        this.y += (dy / distance) * this.speed * gameState.gameSpeed;
        
        return true;
    }

    createExplosion() {
        // 创建爆炸粒子效果
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const particle = new Particle(
                this.target.x,
                this.target.y,
                Math.cos(angle) * 2,
                Math.sin(angle) * 2,
                this.color,
                500
            );
            gameState.particles.push(particle);
        }
    }

    render() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 粒子系统
class Particle {
    constructor(x, y, vx, vy, color, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
    }

    update() {
        this.x += this.vx * gameState.gameSpeed;
        this.y += this.vy * gameState.gameSpeed;
        this.age += 16 * gameState.gameSpeed;
        
        return this.age < this.lifetime;
    }

    render() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        const opacity = 1 - (this.age / this.lifetime);
        ctx.fillStyle = this.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 敌人系统
class Enemy {
    constructor(type, wave) {
        this.type = type;
        this.wave = wave;
        this.pathIndex = 0;
        this.slowFactor = 1;
        this.slowEndTime = 0;
        this.stunned = false;
        this.stunEndTime = 0;
        this.burning = false;
        this.burnEndTime = 0;
        this.burnDamage = 0;
        this.lastBurnTime = 0;
        
        // 根据波次调整属性（更平衡的成长曲线）
        const waveMultiplier = 1 + (wave - 1) * 0.12;
        const healthMultiplier = 1 + (wave - 1) * 0.18;
        const defenseMultiplier = 1 + (wave - 1) * 0.15;
        
        switch(type) {
            case 'basic':
                this.icon = '👾';
                this.maxHealth = Math.floor(65 * healthMultiplier);
                this.speed = 1.3;
                this.reward = 10;
                this.damage = 1;
                this.defense = Math.floor(2 * defenseMultiplier);
                this.color = '#e74c3c';
                this.name = '基础敌人';
                this.threatLevel = 1;
                break;
            case 'fast':
                this.icon = '🐢';
                this.maxHealth = Math.floor(40 * healthMultiplier);
                this.speed = 2.5;
                this.reward = 15;
                this.damage = 1;
                this.defense = Math.floor(1 * defenseMultiplier);
                this.color = '#f39c12';
                this.name = '快速敌人';
                this.threatLevel = 2;
                break;
            case 'tank':
                this.icon = '🛡️';
                this.maxHealth = Math.floor(150 * healthMultiplier);
                this.speed = 0.7;
                this.reward = 25;
                this.damage = 2;
                this.defense = Math.floor(8 * defenseMultiplier);
                this.color = '#3498db';
                this.name = '坦克敌人';
                this.threatLevel = 3;
                break;
            case 'flying':
                this.icon = '🦇';
                this.maxHealth = Math.floor(50 * healthMultiplier);
                this.speed = 2.0;
                this.reward = 18;
                this.damage = 1;
                this.defense = Math.floor(2 * defenseMultiplier);
                this.color = '#9b59b6';
                this.name = '飞行敌人';
                this.threatLevel = 2;
                break;
            case 'boss':
                this.icon = '👹';
                this.maxHealth = Math.floor(400 * healthMultiplier);
                this.speed = 0.5;
                this.reward = 80;
                this.damage = 4;
                this.defense = Math.floor(15 * defenseMultiplier);
                this.color = '#2c3e50';
                this.name = 'Boss敌人';
                this.threatLevel = 5;
                break;
        }
        
        this.health = this.maxHealth;
        this.originalSpeed = this.speed;
        const map = mapSystem.getCurrentMap();
        this.x = map.path[0].x;
        this.y = map.path[0].y;
        this.offsetY = 0;
        this.floatTime = 0;
    }

    applySlow(factor, duration) {
        this.slowFactor = factor;
        this.slowEndTime = Date.now() + duration;
    }

    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health -= actualDamage;
        gameState.totalDamageDealt += actualDamage;
        
        // 创建伤害数字
        this.createDamageText(actualDamage);
        
        // 受击特效
        this.createHitEffect();
        
        if (this.health <= 0) {
            gameState.enemiesKilled++;
            gameState.updateGold(this.reward);
            gameState.updateScore(this.reward * 10);
            this.createDeathEffect();
            return true;
        }
        return false;
    }
    
    createHitEffect() {
        if (!gameState.particlesEnabled) return;
        
        for (let i = 0; i < 3; i++) {
            const particle = new Particle(
                this.x + (Math.random() - 0.5) * 20,
                this.y + (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                this.color,
                500
            );
            gameState.particles.push(particle);
        }
    }
    
    createDeathEffect() {
        if (!gameState.particlesEnabled) return;
        
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = 2 + Math.random() * 3;
            const particle = new Particle(
                this.x,
                this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                this.color,
                1000
            );
            gameState.particles.push(particle);
        }
    }
    
    applyStun(duration) {
        this.stunned = true;
        this.stunEndTime = Date.now() + duration;
    }
    
    applyBurn(damage, duration) {
        this.burning = true;
        this.burnDamage = damage;
        this.burnEndTime = Date.now() + duration;
        this.lastBurnTime = Date.now();
    }

    createDamageText(damage) {
        const damageElement = document.createElement('div');
        damageElement.className = 'damage-text';
        damageElement.textContent = '-' + damage;
        damageElement.style.left = this.x + 'px';
        damageElement.style.top = this.y + 'px';
        
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.appendChild(damageElement);
        
        setTimeout(() => {
            damageElement.remove();
        }, 1000);
    }

    update() {
        // 检查状态效果
        const now = Date.now();
        
        if (now > this.slowEndTime) {
            this.slowFactor = 1;
        }
        
        if (now > this.stunEndTime) {
            this.stunned = false;
        }
        
        if (this.burning && now > this.lastBurnTime) {
            this.takeDamage(this.burnDamage);
            this.lastBurnTime = now + 1000;
            
            if (now > this.burnEndTime) {
                this.burning = false;
            }
        }
        
        // 飞行敌人浮动效果
        if (this.type === 'flying') {
            this.floatTime += 0.1;
            this.offsetY = Math.sin(this.floatTime) * 5;
        }
        
        // 眩晕检查
        if (this.stunned) {
            return true;
        }
        
        const map = mapSystem.getCurrentMap();
        if (this.pathIndex >= map.path.length - 1) {
            // 到达终点
            gameState.updateHealth(-this.damage);
            return false;
        }
        
        const targetPoint = map.path[this.pathIndex + 1];
        const dx = targetPoint.x - this.x;
        const dy = targetPoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            this.pathIndex++;
            if (this.pathIndex >= map.path.length - 1) {
                // 到达终点
                gameState.updateHealth(-this.damage);
                return false;
            }
        } else {
            // 移动
            this.x += (dx / distance) * this.speed * this.slowFactor * gameState.gameSpeed;
            this.y += (dy / distance) * this.speed * this.slowFactor * gameState.gameSpeed;
        }
        
        return true;
    }

    render() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        const renderY = this.y + this.offsetY;
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 15, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制敌人
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 状态效果
        if (this.stunned) {
            ctx.fillStyle = '#95a5a6';
        } else if (this.burning) {
            ctx.fillStyle = '#e74c3c';
        } else {
            ctx.fillStyle = this.color;
        }
        
        // 发光效果
        if (this.type === 'boss') {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
        }
        
        ctx.fillText(this.icon, this.x, renderY);
        ctx.shadowBlur = 0;
        
        // 绘制血条
        const barWidth = 40;
        const barHeight = 6;
        const healthPercent = this.health / this.maxHealth;
        
        // 血条背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x - barWidth/2 - 2, renderY - 25 - 2, barWidth + 4, barHeight + 4);
        
        // 血条
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(this.x - barWidth/2, renderY - 25, barWidth, barHeight);
        
        // 血条填充
        if (healthPercent > 0.6) {
            ctx.fillStyle = '#27ae60';
        } else if (healthPercent > 0.3) {
            ctx.fillStyle = '#f39c12';
        } else {
            ctx.fillStyle = '#e74c3c';
        }
        ctx.fillRect(this.x - barWidth/2, renderY - 25, barWidth * healthPercent, barHeight);
        
        // 绘制状态图标
        let statusY = renderY - 35;
        if (this.slowFactor < 1) {
            ctx.font = '14px Arial';
            ctx.fillText('❄️', this.x + 15, statusY);
            statusY -= 15;
        }
        
        if (this.stunned) {
            ctx.font = '14px Arial';
            ctx.fillText('😵', this.x + 15, statusY);
            statusY -= 15;
        }
        
        if (this.burning) {
            ctx.font = '14px Arial';
            ctx.fillText('🔥', this.x + 15, statusY);
        }
        
        // 绘制敌人名称（Boss）
        if (this.type === 'boss') {
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(this.name, this.x, renderY + 20);
        }
    }
}

// 波次系统
class WaveSystem {
    constructor() {
        this.waves = [
            {
                enemies: [
                    {type: 'basic', count: 6, delay: 1200}
                ],
                preparation: 4000,
                goldBonus: 20
            },
            {
                enemies: [
                    {type: 'basic', count: 8, delay: 1000},
                    {type: 'fast', count: 4, delay: 1000}
                ],
                preparation: 5000,
                goldBonus: 30
            },
            {
                enemies: [
                    {type: 'basic', count: 10, delay: 900},
                    {type: 'fast', count: 6, delay: 900},
                    {type: 'tank', count: 2, delay: 1500}
                ],
                preparation: 6000,
                goldBonus: 40
            },
            {
                enemies: [
                    {type: 'basic', count: 12, delay: 800},
                    {type: 'fast', count: 8, delay: 800},
                    {type: 'tank', count: 3, delay: 1300},
                    {type: 'flying', count: 4, delay: 900}
                ],
                preparation: 7000,
                goldBonus: 50
            },
            {
                enemies: [
                    {type: 'basic', count: 15, delay: 700},
                    {type: 'fast', count: 10, delay: 700},
                    {type: 'tank', count: 5, delay: 1100},
                    {type: 'flying', count: 6, delay: 800}
                ],
                preparation: 8000,
                goldBonus: 60
            },
            {
                enemies: [
                    {type: 'basic', count: 18, delay: 600},
                    {type: 'fast', count: 12, delay: 600},
                    {type: 'tank', count: 6, delay: 1000},
                    {type: 'flying', count: 8, delay: 700},
                    {type: 'boss', count: 1, delay: 2000}
                ],
                preparation: 10000,
                goldBonus: 100
            },
            {
                enemies: [
                    {type: 'basic', count: 20, delay: 500},
                    {type: 'fast', count: 15, delay: 500},
                    {type: 'tank', count: 8, delay: 900},
                    {type: 'flying', count: 10, delay: 600},
                    {type: 'boss', count: 2, delay: 2000}
                ],
                preparation: 12000,
                goldBonus: 150
            }
        ];
    }

    getCurrentWave() {
        const waveIndex = (gameState.wave - 1) % this.waves.length;
        return this.waves[waveIndex];
    }

    startWave() {
        if (gameState.isWaveActive) return;
        
        gameState.isWaveActive = true;
        const wave = this.getCurrentWave();
        let enemyIndex = 0;
        
        // 更新波次信息
        this.updateWaveInfo(wave);
        
        const spawnEnemy = () => {
            if (enemyIndex >= wave.enemies.length) {
                gameState.isWaveActive = false;
                return;
            }
            
            const enemyGroup = wave.enemies[enemyIndex];
            let spawnedCount = 0;
            
            const spawnInGroup = () => {
                if (spawnedCount >= enemyGroup.count) {
                    enemyIndex++;
                    if (enemyIndex < wave.enemies.length) {
                        setTimeout(spawnEnemy, 500);
                    } else {
                        gameState.isWaveActive = false;
                    }
                    return;
                }
                
                const enemy = new Enemy(enemyGroup.type, gameState.wave);
                gameState.enemies.push(enemy);
                spawnedCount++;
                
                // 生成特效
                this.createSpawnEffect(enemy);
                
                setTimeout(spawnInGroup, enemyGroup.delay);
            };
            
            spawnInGroup();
        };
        
        spawnEnemy();
    }
    
    updateWaveInfo(wave) {
        const nextWaveEnemies = document.getElementById('nextWaveEnemies');
        const waveTimer = document.getElementById('waveTimer');
        
        let enemyText = [];
        wave.enemies.forEach(group => {
            const enemyNames = {
                basic: '基础敌人',
                fast: '快速敌人',
                tank: '坦克敌人',
                flying: '飞行敌人',
                boss: 'Boss敌人'
            };
            enemyText.push(`${group.count}个${enemyNames[group.type]}`);
        });
        
        nextWaveEnemies.textContent = enemyText.join(', ');
        waveTimer.textContent = '进攻中！';
    }
    
    createSpawnEffect(enemy) {
        if (!gameState.particlesEnabled) return;
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 2;
            const particle = new Particle(
                enemy.x,
                enemy.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                enemy.color,
                800
            );
            gameState.particles.push(particle);
        }
    }
}

// 游戏初始化
const gameState = new GameState();
const mapSystem = new MapSystem();
const waveSystem = new WaveSystem();

// 游戏主循环
function gameLoop() {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    // 清空画布并重绘地图
    mapSystem.renderMap();
    
    // 绘制路径提示
    if (gameState.pathHintsEnabled) {
        drawPathHints();
    }
    
    // 更新和渲染防御塔
    gameState.towers.forEach(tower => {
        tower.findTarget();
        tower.shoot();
        tower.render();
    });
    
    // 更新和渲染敌人
    gameState.enemies = gameState.enemies.filter(enemy => {
        const isAlive = enemy.update();
        if (isAlive) {
            enemy.render();
        }
        return isAlive;
    });
    
    // 更新和渲染投射物
    gameState.projectiles = gameState.projectiles.filter(projectile => {
        const isActive = projectile.update();
        if (isActive) {
            projectile.render();
        }
        return isActive;
    });
    
    // 更新和渲染粒子
    gameState.particles = gameState.particles.filter(particle => {
        const isActive = particle.update();
        if (isActive) {
            particle.render();
        }
        return isActive;
    });
    
    // 检查波次完成奖励
    if (!gameState.isWaveActive && gameState.enemies.length === 0 && gameState.wave > 1) {
        const wave = waveSystem.getCurrentWave();
        const waveBonus = wave.goldBonus || (gameState.wave * 10);
        gameState.updateGold(waveBonus);
        gameState.updateScore(waveBonus * 5);
        showNotification(`波次完成！获得 ${waveBonus} 金币`);
        
        // 无伤波次奖励
        if (gameState.achievements.noDamage !== false) {
            const noDamageBonus = 30 + gameState.wave * 5;
            gameState.updateGold(noDamageBonus);
            gameState.updateScore(200);
            showNotification(`无伤完成波次！额外 ${noDamageBonus} 金币`);
        }
        
        // 连击奖励
        if (gameState.enemiesKilled > 10 * gameState.wave) {
            const comboBonus = 25;
            gameState.updateGold(comboBonus);
            gameState.updateScore(150);
            showNotification('连击奖励！额外 25 金币');
        }
    }
    
    // 检查波次完成
    if (!gameState.isWaveActive && gameState.enemies.length === 0) {
        // 波次完成，可以开始下一波
        document.getElementById('startWaveBtn').disabled = false;
        document.getElementById('waveTimer').textContent = '准备就绪';
        
        // 准备下一波信息
        const nextWave = waveSystem.getCurrentWave();
        let enemyText = [];
        nextWave.enemies.forEach(group => {
            const enemyNames = {
                basic: '基础敌人',
                fast: '快速敌人',
                tank: '坦克敌人',
                flying: '飞行敌人',
                boss: 'Boss敌人'
            };
            enemyText.push(`${group.count}个${enemyNames[group.type]}`);
        });
        document.getElementById('nextWaveEnemies').textContent = enemyText.join(', ');
    }
    
    // 更新游戏统计
    updateGameStats();
}

// 绘制路径提示
function drawPathHints() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const map = mapSystem.getCurrentMap();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    
    ctx.beginPath();
    map.path.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    ctx.stroke();
    ctx.setLineDash([]);
}

// 更新游戏统计
function updateGameStats() {
    // 计算DPS（每秒伤害）
    let totalDPS = 0;
    gameState.towers.forEach(tower => {
        totalDPS += (tower.damage * 1000) / tower.fireRate;
    });
    
    // 可以在UI中显示这些统计信息
    // 这里只是示例，实际UI元素需要添加到HTML中
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏
    mapSystem.renderMap();
    updateMapName();
    
    // 防御塔选择
    document.querySelectorAll('.tower-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            gameState.selectedTowerType = option.dataset.type;
            gameState.selectedTower = null;
            document.getElementById('towerUpgrade').style.display = 'none';
            
            // 添加选择音效
            playSound('select');
        });
    });
    
    // 画布点击事件
    document.getElementById('gameCanvas').addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否点击了现有防御塔
        const clickedTower = gameState.towers.find(tower => {
            const distance = Math.sqrt(Math.pow(tower.x - x, 2) + Math.pow(tower.y - y, 2));
            return distance < 25;
        });
        
        if (clickedTower) {
            // 选中防御塔进行升级
            gameState.selectedTower = clickedTower;
            gameState.selectedTowerType = null;
            document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
            showTowerUpgrade(clickedTower);
            playSound('select');
        } else if (gameState.selectedTowerType) {
            // 放置新防御塔
            placeTower(x, y);
        }
    });
    
    // 画布悬停事件
    document.getElementById('gameCanvas').addEventListener('mousemove', (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 显示放置预览
        if (gameState.selectedTowerType) {
            showPlacementPreview(x, y);
        }
    });
    
    // 开始波次
    document.getElementById('startWaveBtn').addEventListener('click', () => {
        waveSystem.startWave();
        document.getElementById('startWaveBtn').disabled = true;
        playSound('startWave');
    });
    
    // 暂停游戏
    document.getElementById('pauseBtn').addEventListener('click', () => {
        gameState.isPaused = !gameState.isPaused;
        const btnText = gameState.isPaused ? '继续' : '暂停';
        document.querySelector('#pauseBtn .btn-text').textContent = btnText;
        const btnIcon = gameState.isPaused ? '▶️' : '⏸️';
        document.querySelector('#pauseBtn .btn-icon').textContent = btnIcon;
        playSound('click');
    });
    
    // 游戏速度
    document.getElementById('speedBtn').addEventListener('click', () => {
        const speeds = [1, 2, 3];
        const currentIndex = speeds.indexOf(gameState.gameSpeed);
        gameState.gameSpeed = speeds[(currentIndex + 1) % speeds.length];
        document.querySelector('#speedBtn .btn-text').textContent = `x${gameState.gameSpeed}`;
        playSound('click');
    });
    
    // 切换地图
    document.getElementById('mapBtn').addEventListener('click', () => {
        if (confirm('切换地图将重置当前游戏进度，确定继续吗？')) {
            resetGame();
            mapSystem.switchMap();
            updateMapName();
            playSound('click');
        }
    });
    
    // 升级防御塔
    document.getElementById('upgradeBtn').addEventListener('click', () => {
        if (gameState.selectedTower) {
            if (gameState.selectedTower.upgrade()) {
                showTowerUpgrade(gameState.selectedTower);
                playSound('upgrade');
            } else {
                playSound('error');
            }
        }
    });
    
    // 出售防御塔
    document.getElementById('sellBtn').addEventListener('click', () => {
        if (gameState.selectedTower) {
            const sellPrice = gameState.selectedTower.sell();
            gameState.towers = gameState.towers.filter(t => t !== gameState.selectedTower);
            gameState.selectedTower = null;
            document.getElementById('towerUpgrade').style.display = 'none';
            playSound('sell');
            
            // 显示出售提示
            showNotification(`出售获得 ${sellPrice} 金币`);
        }
    });
    
    // 设置按钮
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'flex';
        playSound('click');
    });
    
    // 全屏按钮
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        toggleFullscreen();
        playSound('click');
    });
    
    // 保存设置
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        saveSettings();
        document.getElementById('settingsModal').style.display = 'none';
        playSound('click');
    });
    
    // 关闭设置
    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'none';
        playSound('click');
    });
    
    // 设置滑块事件
    document.getElementById('soundVolume').addEventListener('input', (e) => {
        document.getElementById('soundVolumeValue').textContent = e.target.value + '%';
    });
    
    document.getElementById('musicVolume').addEventListener('input', (e) => {
        document.getElementById('musicVolumeValue').textContent = e.target.value + '%';
    });
    
    // 重新开始
    document.getElementById('restartBtn').addEventListener('click', () => {
        resetGame();
        document.getElementById('gameOverModal').style.display = 'none';
        playSound('click');
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                document.getElementById('pauseBtn').click();
                break;
            case '1':
                document.querySelector('[data-type="archer"]').click();
                break;
            case '2':
                document.querySelector('[data-type="mage"]').click();
                break;
            case '3':
                document.querySelector('[data-type="cannon"]').click();
                break;
            case '4':
                document.querySelector('[data-type="ice"]').click();
                break;
            case 'Enter':
                if (!document.getElementById('startWaveBtn').disabled) {
                    document.getElementById('startWaveBtn').click();
                }
                break;
            case 'Escape':
                gameState.selectedTowerType = null;
                gameState.selectedTower = null;
                document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
                document.getElementById('towerUpgrade').style.display = 'none';
                break;
        }
    });
    
    // 启动游戏循环
    gameState.gameLoop = setInterval(gameLoop, 16); // 约60 FPS
});

// 更新地图名称
function updateMapName() {
    const map = mapSystem.getCurrentMap();
    document.getElementById('mapName').textContent = map.name;
}

// 显示放置预览
function showPlacementPreview(x, y) {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const map = mapSystem.getCurrentMap();
    
    // 检查是否在有效的防御塔位置
    const validSpot = map.towerSpots.find(spot => {
        const distance = Math.sqrt(Math.pow(spot.x - x, 2) + Math.pow(spot.y - y, 2));
        return distance < 30;
    });
    
    // 检查位置是否已被占用
    const occupied = gameState.towers.find(tower => {
        const distance = Math.sqrt(Math.pow(tower.x - x, 2) + Math.pow(tower.y - y, 2));
        return distance < 30;
    });
    
    // 绘制预览
    ctx.save();
    if (validSpot && !occupied) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    } else {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    }
    
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        }
        
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            20% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 2000);
}

// 音效系统
function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    // 这里可以添加实际的音效播放逻辑
    // 为了演示，我们使用 Web Audio API 创建简单的音效
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'select':
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'click':
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.05);
            break;
        case 'placeTower':
            oscillator.frequency.value = 1000;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'upgrade':
            oscillator.frequency.value = 1200;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'sell':
            oscillator.frequency.value = 400;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'startWave':
            oscillator.frequency.value = 300;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'error':
            oscillator.frequency.value = 200;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
    }
}

// 全屏切换
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        gameState.isFullscreen = true;
        document.body.classList.add('fullscreen');
        document.querySelector('#fullscreenBtn .btn-icon').textContent = '🔲';
    } else {
        document.exitFullscreen();
        gameState.isFullscreen = false;
        document.body.classList.remove('fullscreen');
        document.querySelector('#fullscreenBtn .btn-icon').textContent = '🔳';
    }
}

// 保存设置
function saveSettings() {
    gameState.soundEnabled = document.getElementById('soundVolume').value > 0;
    gameState.particlesEnabled = document.getElementById('showParticles').checked;
    gameState.pathHintsEnabled = document.getElementById('showPathHints').checked;
    
    // 保存到本地存储
    localStorage.setItem('towerDefenseSettings', JSON.stringify({
        soundVolume: document.getElementById('soundVolume').value,
        musicVolume: document.getElementById('musicVolume').value,
        showParticles: gameState.particlesEnabled,
        showPathHints: gameState.pathHintsEnabled
    }));
    
    showNotification('设置已保存');
}

// 加载设置
function loadSettings() {
    const saved = localStorage.getItem('towerDefenseSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        document.getElementById('soundVolume').value = settings.soundVolume;
        document.getElementById('musicVolume').value = settings.musicVolume;
        document.getElementById('soundVolumeValue').textContent = settings.soundVolume + '%';
        document.getElementById('musicVolumeValue').textContent = settings.musicVolume + '%';
        document.getElementById('showParticles').checked = settings.showParticles;
        document.getElementById('showPathHints').checked = settings.showPathHints;
        
        gameState.soundEnabled = settings.soundVolume > 0;
        gameState.particlesEnabled = settings.showParticles;
        gameState.pathHintsEnabled = settings.showPathHints;
    }
}

// 放置防御塔
function placeTower(x, y) {
    const map = mapSystem.getCurrentMap();
    
    // 检查是否在有效的防御塔位置
    const validSpot = map.towerSpots.find(spot => {
        const distance = Math.sqrt(Math.pow(spot.x - x, 2) + Math.pow(spot.y - y, 2));
        return distance < 30;
    });
    
    if (!validSpot) {
        showNotification('只能在这些建造防御塔！');
        playSound('error');
        return;
    }
    
    // 检查位置是否已被占用
    const occupied = gameState.towers.find(tower => {
        const distance = Math.sqrt(Math.pow(tower.x - validSpot.x, 2) + Math.pow(tower.y - validSpot.y, 2));
        return distance < 30;
    });
    
    if (occupied) {
        showNotification('这个位置已经有防御塔了！');
        playSound('error');
        return;
    }
    
    // 检查金币
    const towerCosts = {
        archer: 25,
        mage: 45,
        cannon: 70,
        ice: 30
    };
    
    const cost = towerCosts[gameState.selectedTowerType];
    if (gameState.gold < cost) {
        showNotification('金币不足！');
        playSound('error');
        return;
    }
    
    // 创建防御塔
    const tower = new Tower(validSpot.x, validSpot.y, gameState.selectedTowerType);
    gameState.towers.push(tower);
    gameState.towersBuilt++;
    gameState.updateGold(-cost);
    
    // 创建放置特效
    createPlacementEffect(validSpot.x, validSpot.y);
    
    // 清除选择
    document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
    gameState.selectedTowerType = null;
    
    playSound('placeTower');
    showNotification(`建造了${tower.description}`);
}

// 创建放置特效
function createPlacementEffect(x, y) {
    if (!gameState.particlesEnabled) return;
    
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const speed = 2 + Math.random() * 2;
        const particle = new Particle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            '#27ae60',
            800
        );
        gameState.particles.push(particle);
    }
}

// 显示防御塔升级界面
function showTowerUpgrade(tower) {
    const upgradePanel = document.getElementById('towerUpgrade');
    upgradePanel.style.display = 'block';
    
    // 更新升级信息
    document.getElementById('currentLevel').textContent = tower.level;
    document.getElementById('upgradeCost').textContent = tower.upgradeCost;
    document.getElementById('currentDamage').textContent = tower.damage;
    document.getElementById('nextDamage').textContent = Math.floor(tower.damage * 1.4);
    document.getElementById('currentSpeed').textContent = (1000 / tower.fireRate).toFixed(1);
    document.getElementById('nextSpeed').textContent = (1000 / (tower.fireRate * 0.85)).toFixed(1);
    document.getElementById('currentRange').textContent = tower.range;
    document.getElementById('nextRange').textContent = Math.floor(tower.range * 1.15);
    
    // 更新防御塔图标
    document.getElementById('upgradeTowerIcon').textContent = tower.icon;
    
    // 更新按钮状态
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (gameState.gold < tower.upgradeCost) {
        upgradeBtn.disabled = true;
        upgradeBtn.style.opacity = '0.5';
    } else {
        upgradeBtn.disabled = false;
        upgradeBtn.style.opacity = '1';
    }
}

// 重置游戏
function resetGame() {
    gameState.gold = 150;
    gameState.health = gameState.maxHealth;
    gameState.wave = 1;
    gameState.score = 0;
    gameState.isPaused = false;
    gameState.gameSpeed = 1;
    gameState.isGameOver = false;
    gameState.selectedTowerType = null;
    gameState.selectedTower = null;
    gameState.towers = [];
    gameState.enemies = [];
    gameState.projectiles = [];
    gameState.particles = [];
    gameState.isWaveActive = false;
    gameState.enemiesKilled = 0;
    gameState.towersBuilt = 0;
    gameState.totalDamageDealt = 0;
    
    // 重置成就
    Object.keys(gameState.achievements).forEach(key => {
        gameState.achievements[key] = false;
    });
    
    // 更新UI
    document.getElementById('gold').textContent = gameState.gold;
    document.getElementById('health').textContent = gameState.health;
    document.getElementById('currentHealth').textContent = gameState.health;
    document.getElementById('wave').textContent = gameState.wave;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('animalHealthBar').style.width = '100%';
    document.getElementById('startWaveBtn').disabled = false;
    document.querySelector('#pauseBtn .btn-text').textContent = '暂停';
    document.querySelector('#pauseBtn .btn-icon').textContent = '⏸️';
    document.querySelector('#speedBtn .btn-text').textContent = 'x1';
    document.getElementById('towerUpgrade').style.display = 'none';
    document.getElementById('nextWaveEnemies').textContent = '准备就绪';
    document.getElementById('waveTimer').textContent = '准备就绪';
    
    // 重置成就UI
    document.querySelectorAll('.achievement').forEach(achievement => {
        achievement.classList.remove('unlocked');
    });
    
    document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
    
    // 重新渲染地图
    mapSystem.renderMap();
}