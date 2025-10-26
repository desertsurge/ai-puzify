class TowerDefenseGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gold = 100;
        this.goldElement = document.getElementById('gold-count');
        
        this.units = [];
        this.enemies = [];
        this.arrows = []; // 存储箭矢
        this.explosions = []; // 存储爆炸效果
        this.towers = [];
        
        this.unitTypes = {
            archer: { cost: 10, color: '#e74c3c', name: '弓箭手' },
            warrior: { cost: 20, color: '#e67e22', name: '刀斧手' },
            tank: { cost: 60, color: '#34495e', name: '坦克兵' } // 坦克兵价格改为60
        };
        
        // 敌人波次系统
        this.waveTimer = 0;
        this.waveInterval = 60 * 15; // 15秒一波 (假设60FPS)
        this.currentWave = 'weak'; // 'weak' 或 'strong'
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 30; // 每30帧生成一个敌人
        
        // 大本营相关
        this.homeBase = {
            x: 0,
            y: (600 - 200) / 2, // 垂直居中
            width: 200,
            height: 200,
            enemiesEntered: 0,
            maxEnemies: 15
        };
        
        // 箭矢消耗相关
        this.arrowCost = 1; // 每支箭消耗的金币
        this.arrowsPerGold = 3; // 每金币可购买的箭矢数
        this.arrowCount = 0; // 已购买的箭矢数
        
        // 游戏状态
        this.gameOver = false;
        
        // 拖拽相关属性
        this.selectedUnitType = null;
        this.isDragging = false;
        this.dragUnit = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupCanvasEvents();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.getElementById('archer-btn').addEventListener('click', () => {
            this.selectUnitType('archer');
        });
        
        document.getElementById('warrior-btn').addEventListener('click', () => {
            this.selectUnitType('warrior');
        });
        
        document.getElementById('tank-btn').addEventListener('click', () => {
            this.selectUnitType('tank');
        });
    }
    
    setupCanvasEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    }
    
    selectUnitType(type) {
        const unitType = this.unitTypes[type];
        if (this.gold >= unitType.cost) {
            this.selectedUnitType = type;
            // 可以添加视觉反馈，表示当前选择了哪种单位
            console.log(`Selected unit type: ${type}`);
        }
    }
    
    handleMouseDown(e) {
        if (!this.selectedUnitType) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 创建一个预览单位用于拖拽
        this.isDragging = true;
        this.dragUnit = {
            type: this.selectedUnitType,
            x: x - (this.selectedUnitType === 'tank' ? 25 : 10),
            y: y - (this.selectedUnitType === 'tank' ? 25 : 10),
            width: this.selectedUnitType === 'tank' ? 50 : 20,
            height: this.selectedUnitType === 'tank' ? 50 : 20,
            color: this.unitTypes[this.selectedUnitType].color
        };
        
        this.dragOffsetX = this.selectedUnitType === 'tank' ? 25 : 10;
        this.dragOffsetY = this.selectedUnitType === 'tank' ? 25 : 10;
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.dragUnit) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.dragUnit.x = x - this.dragOffsetX;
        this.dragUnit.y = y - this.dragOffsetY;
    }
    
    handleMouseUp(e) {
        if (!this.isDragging || !this.dragUnit) {
            this.isDragging = false;
            this.dragUnit = null;
            return;
        }
        
        // 放置单位
        const unitType = this.unitTypes[this.selectedUnitType];
        if (this.gold >= unitType.cost) {
            this.gold -= unitType.cost;
            this.updateGoldDisplay();
            
            // 创建实际单位
            const unit = {
                type: this.selectedUnitType,
                x: this.dragUnit.x,
                y: this.dragUnit.y,
                width: this.dragUnit.width,
                height: this.dragUnit.height,
                color: this.dragUnit.color,
                health: 100,
                maxHealth: 100,
                speed: this.selectedUnitType === 'archer' ? 0 : this.selectedUnitType === 'warrior' ? 1 : this.selectedUnitType === 'tank' ? 0 : 0,
                damage: this.selectedUnitType === 'archer' ? 20 : this.selectedUnitType === 'warrior' ? 30 : this.selectedUnitType === 'tank' ? 40 : 0,
                attackRange: this.selectedUnitType === 'archer' ? 150 : this.selectedUnitType === 'warrior' ? 50 : 100,
                attackCooldown: 0,
                maxAttackCooldown: this.selectedUnitType === 'archer' ? 40 : this.selectedUnitType === 'warrior' ? 30 : this.selectedUnitType === 'tank' ? 50 : 0,
                kills: this.selectedUnitType === 'tank' ? 0 : undefined,
                direction: this.selectedUnitType === 'tank' ? 'vertical' : 'none', // 坦克兵纵向移动
                hits: this.selectedUnitType === 'tank' ? 0 : undefined // 坦克兵受击次数
            };
            
            this.units.push(unit);
        }
        
        // 重置拖拽状态
        this.isDragging = false;
        this.dragUnit = null;
        this.selectedUnitType = null;
    }
    
    spawnEnemy() {
        this.waveTimer++;
        if (this.waveTimer >= this.waveInterval) {
            this.waveTimer = 0;
            // 切换波次类型
            this.currentWave = this.currentWave === 'weak' ? 'strong' : 'weak';
        }
        
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            
            const enemy = {
                x: this.canvas.width - 30,
                y: 50 + Math.random() * (this.canvas.height - 100),
                width: 18,
                height: 18,
                color: this.currentWave === 'strong' ? '#8e44ad' : '#9b59b6',
                health: this.currentWave === 'strong' ? 100 : 50,
                maxHealth: this.currentWave === 'strong' ? 100 : 50,
                speed: this.currentWave === 'strong' ? 0.5 + Math.random() * 1 : 1 + Math.random() * 1.5,
                value: 15, // 击杀获得的金币改为15
                isStrong: this.currentWave === 'strong',
                targetX: this.homeBase.x + this.homeBase.width / 2, // 大本营中心X坐标
                targetY: this.homeBase.y + this.homeBase.height / 2  // 大本营中心Y坐标
            };
            
            this.enemies.push(enemy);
        }
    }
    
    updateArrows() {
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arrow = this.arrows[i];
            
            // 移动箭矢
            arrow.x += arrow.speedX;
            arrow.y += arrow.speedY;
            
            // 检查箭矢是否超出画布
            if (arrow.x < 0 || arrow.x > this.canvas.width || arrow.y < 0 || arrow.y > this.canvas.height) {
                this.arrows.splice(i, 1);
                continue;
            }
            
            // 检查是否击中敌人
            let hit = false;
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.isColliding(arrow, enemy)) {
                    // 敌人受伤或死亡
                    enemy.health -= arrow.damage;
                    
                    // 如果是坦克炮弹，创建爆炸效果
                    if (arrow.type === 'tank') {
                        this.createExplosion(arrow.x, arrow.y);
                        // 爆炸影响范围内的敌人
                        for (let k = this.enemies.length - 1; k >= 0; k--) {
                            const nearbyEnemy = this.enemies[k];
                            const distance = Math.sqrt(
                                Math.pow(arrow.x - (nearbyEnemy.x + nearbyEnemy.width/2), 2) + 
                                Math.pow(arrow.y - (nearbyEnemy.y + nearbyEnemy.height/2), 2)
                            );
                            // 爆炸半径为30
                            if (distance <= 30) {
                                nearbyEnemy.health -= 15; // 爆炸伤害
                                if (nearbyEnemy.health <= 0) {
                                    this.gold += nearbyEnemy.value; // 获得15金币奖励
                                    this.updateGoldDisplay();
                                    this.enemies.splice(k, 1);
                                }
                            }
                        }
                    }
                    
                    this.arrows.splice(i, 1);
                    hit = true;
                    
                    // 检查敌人是否死亡
                    if (enemy.health <= 0) {
                        this.gold += enemy.value; // 获得15金币奖励
                        this.updateGoldDisplay();
                        this.enemies.splice(j, 1);
                    }
                    break;
                }
            }
        }
    }
    
    // 创建爆炸效果
    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            radius: 5,
            maxRadius: 30,
            growthRate: 2,
            alpha: 1
        });
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.radius += explosion.growthRate;
            explosion.alpha -= 0.05;
            
            if (explosion.alpha <= 0 || explosion.radius >= explosion.maxRadius) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    // 检查两个矩形是否碰撞
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    // 检查敌人是否在刀斧手范围内
    isEnemyInWarriorRange(warrior, enemy) {
        // 计算刀斧手中心点到敌人中心点的距离
        const warriorCenterX = warrior.x + warrior.width / 2;
        const warriorCenterY = warrior.y + warrior.height / 2;
        const enemyCenterX = enemy.x + enemy.width / 2;
        const enemyCenterY = enemy.y + enemy.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(warriorCenterX - enemyCenterX, 2) + 
            Math.pow(warriorCenterY - enemyCenterY, 2)
        );
        
        // 判断敌人是否在刀斧手攻击范围内
        return distance <= warrior.attackRange;
    }
    
    // 检查刀斧手是否与其他刀斧手重叠
    isWarriorOverlapping(currentWarrior, warriors) {
        for (const warrior of warriors) {
            // 排除自己
            if (warrior === currentWarrior) continue;
            
            // 检查是否重叠（使用距离判断）
            const dx = (currentWarrior.x + currentWarrior.width/2) - (warrior.x + warrior.width/2);
            const dy = (currentWarrior.y + currentWarrior.height/2) - (warrior.y + warrior.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 如果距离小于一定值，则认为重叠
            if (distance < currentWarrior.width) {
                return true;
            }
        }
        return false;
    }
    
    updateUnits() {
        // 先收集所有刀斧手
        const warriors = this.units.filter(unit => unit.type === 'warrior');
        
        for (let i = this.units.length - 1; i >= 0; i--) {
            const unit = this.units[i];
            
            // 攻击冷却
            if (unit.attackCooldown > 0) {
                unit.attackCooldown--;
            }
            
            // 如果是弓箭手且不在冷却中，则发射箭矢
            if (unit.type === 'archer' && unit.attackCooldown <= 0) {
                // 检查是否有足够的金币购买箭矢
                if (this.gold >= this.arrowCost) {
                    // 寻找最近的敌人
                    let closestEnemy = null;
                    let closestDistance = unit.attackRange;
                    
                    for (let j = 0; j < this.enemies.length; j++) {
                        const enemy = this.enemies[j];
                        const distance = Math.sqrt(
                            Math.pow(unit.x - enemy.x, 2) + Math.pow(unit.y - enemy.y, 2)
                        );
                        
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestEnemy = enemy;
                        }
                    }
                    
                    // 如果找到敌人，发射箭矢
                    if (closestEnemy) {
                        // 消耗金币
                        this.gold -= this.arrowCost;
                        this.updateGoldDisplay();
                        
                        // 计算箭矢方向
                        const dx = (closestEnemy.x + closestEnemy.width/2) - (unit.x + unit.width/2);
                        const dy = (closestEnemy.y + closestEnemy.height/2) - (unit.y + unit.height/2);
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const speed = 5; // 箭矢速度
                        
                        // 创建箭矢
                        const arrow = {
                            type: 'archer',
                            x: unit.x + unit.width / 2,
                            y: unit.y + unit.height / 2,
                            width: 12,
                            height: 4,
                            speedX: (dx / distance) * speed,
                            speedY: (dy / distance) * speed,
                            damage: unit.damage,
                            color: '#f1c40f'
                        };
                        
                        this.arrows.push(arrow);
                        unit.attackCooldown = unit.maxAttackCooldown;
                    }
                }
            }
            
            // 如果是刀斧手
            else if (unit.type === 'warrior') {
                // 刀斧手寻找最近的敌人并移动
                let closestEnemy = null;
                let closestDistance = Infinity;
                
                for (let j = 0; j < this.enemies.length; j++) {
                    const enemy = this.enemies[j];
                    const distance = Math.sqrt(
                        Math.pow(unit.x - enemy.x, 2) + Math.pow(unit.y - enemy.y, 2)
                    );
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }
                
                // 如果找到敌人，向敌人移动
                if (closestEnemy) {
                    const dx = (closestEnemy.x + closestEnemy.width/2) - (unit.x + unit.width/2);
                    const dy = (closestEnemy.y + closestEnemy.height/2) - (unit.y + unit.height/2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // 检查移动后是否会与其他刀斧手重叠
                    const newX = unit.x + (dx / distance) * unit.speed;
                    const newY = unit.y + (dy / distance) * unit.speed;
                    
                    // 创建临时位置对象用于重叠检测
                    const tempWarrior = {
                        x: newX,
                        y: newY,
                        width: unit.width,
                        height: unit.height
                    };
                    
                    // 只有在不会与超过一个其他刀斧手重叠时才移动
                    const overlappingWarriors = [];
                    for (const warrior of warriors) {
                        // 排除自己
                        if (warrior === unit) continue;
                        
                        // 检查是否重叠
                        const dx2 = (tempWarrior.x + tempWarrior.width/2) - (warrior.x + warrior.width/2);
                        const dy2 = (tempWarrior.y + tempWarrior.height/2) - (warrior.y + warrior.height/2);
                        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                        
                        if (distance2 < tempWarrior.width) {
                            overlappingWarriors.push(warrior);
                        }
                    }
                    
                    // 如果重叠的刀斧手不超过1个，则移动
                    if (overlappingWarriors.length <= 1) {
                        if (distance > 5) { // 避免过度靠近
                            unit.x = newX;
                            unit.y = newY;
                        }
                    }
                    
                    // 检查是否在攻击范围内
                    if (distance <= unit.attackRange && unit.attackCooldown <= 0) {
                        // 攻击敌人
                        closestEnemy.health -= unit.damage;
                        unit.attackCooldown = unit.maxAttackCooldown;
                        
                        // 刀斧手击杀数增加
                        unit.kills = (unit.kills || 0) + 1;
                        
                        // 如果刀斧手消灭了5个以上敌人，则死亡
                        if (unit.kills >= 5) {
                            this.units.splice(i, 1);
                            continue;
                        }
                        
                        if (closestEnemy.health <= 0) {
                            this.gold += closestEnemy.value;
                            this.updateGoldDisplay();
                            // 从敌人列表中移除死亡的敌人
                            const index = this.enemies.indexOf(closestEnemy);
                            if (index > -1) {
                                this.enemies.splice(index, 1);
                            }
                        }
                    }
                }
            }
            
            // 如果是坦克兵
            else if (unit.type === 'tank') {
                // 坦克兵纵向移动
                // 这里我们让坦克兵在一定范围内上下移动
                if (!unit.moveDirection) unit.moveDirection = 1; // 1表示向下，-1表示向上
                
                unit.y += unit.moveDirection * 0.5; // 纵向移动速度
                
                // 边界检测
                if (unit.y <= 50) {
                    unit.y = 50;
                    unit.moveDirection = 1;
                } else if (unit.y + unit.height >= this.canvas.height - 50) {
                    unit.y = this.canvas.height - 50 - unit.height;
                    unit.moveDirection = -1;
                }
                
                // 寻找最近的敌人
                let closestEnemy = null;
                let closestDistance = unit.attackRange;
                
                for (let j = 0; j < this.enemies.length; j++) {
                    const enemy = this.enemies[j];
                    const distance = Math.sqrt(
                        Math.pow(unit.x - enemy.x, 2) + Math.pow(unit.y - enemy.y, 2)
                    );
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }
                
                // 如果找到敌人，发射炮弹
                if (closestEnemy && unit.attackCooldown <= 0) {
                    // 计算炮弹方向
                    const dx = (closestEnemy.x + closestEnemy.width/2) - (unit.x + unit.width/2);
                    const dy = (closestEnemy.y + closestEnemy.height/2) - (unit.y + unit.height/2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const speed = 4; // 炮弹速度
                    
                    // 创建炮弹
                    const shell = {
                        type: 'tank',
                        x: unit.x + unit.width / 2,
                        y: unit.y + unit.height / 2,
                        width: 10,
                        height: 10,
                        speedX: (dx / distance) * speed,
                        speedY: (dy / distance) * speed,
                        damage: unit.damage,
                        color: '#7f8c8d'
                    };
                    
                    this.arrows.push(shell);
                    unit.attackCooldown = unit.maxAttackCooldown;
                }
                
                // 检查碰撞
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    // 检查坦克兵与敌人是否碰撞
                    if (this.isColliding(unit, enemy)) {
                        // 敌人死亡
                        this.gold += enemy.value;
                        this.updateGoldDisplay();
                        this.enemies.splice(j, 1);
                        
                        // 坦克兵受击次数增加
                        unit.hits = (unit.hits || 0) + 1;
                        
                        // 如果坦克兵累计受到3次攻击，则死亡
                        if (unit.hits >= 3) {
                            this.units.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // 敌人朝大本营移动
            const dx = enemy.targetX - (enemy.x + enemy.width / 2);
            const dy = enemy.targetY - (enemy.y + enemy.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 1) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            // 检查敌人是否到达大本营
            if (this.isColliding(enemy, this.homeBase)) {
                this.homeBase.enemiesEntered++;
                this.enemies.splice(i, 1);
                
                // 检查是否失败
                if (this.homeBase.enemiesEntered >= this.homeBase.maxEnemies) {
                    this.gameOver = true;
                    this.showGameOver();
                }
                continue;
            }
            
            // 检查敌人是否与弓箭手碰撞
            for (let j = this.units.length - 1; j >= 0; j--) {
                const unit = this.units[j];
                if (unit.type === 'archer' && this.isColliding(enemy, unit)) {
                    // 弓箭手与敌人同归于尽
                    this.enemies.splice(i, 1);
                    this.units.splice(j, 1);
                    this.gold += enemy.value; // 获得15金币奖励
                    this.updateGoldDisplay();
                    break;
                }
            }
            
            // 检查敌人是否死亡
            if (enemy.health <= 0) {
                this.gold += enemy.value; // 获得15金币奖励
                this.updateGoldDisplay();
                this.enemies.splice(i, 1);
            }
        }
    }
    
    updateGoldDisplay() {
        this.goldElement.textContent = this.gold;
        
        // 更新按钮状态
        document.getElementById('archer-btn').disabled = this.gold < this.unitTypes.archer.cost;
        document.getElementById('warrior-btn').disabled = this.gold < this.unitTypes.warrior.cost;
        document.getElementById('tank-btn').disabled = this.gold < this.unitTypes.tank.cost;
        
        // 更新弓箭手攻击状态（是否有足够的金币购买箭矢）
        const archers = this.units.filter(unit => unit.type === 'archer');
        for (const archer of archers) {
            archer.disabled = this.gold < this.arrowCost;
        }
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制坐标系
        this.drawCoordinateSystem();
        
        // 绘制路径
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(0, 50, this.canvas.width, this.canvas.height - 100);
        
        // 绘制大本营
        this.ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
        this.ctx.fillRect(this.homeBase.x, this.homeBase.y, this.homeBase.width, this.homeBase.height);
        this.ctx.strokeStyle = '#8e44ad';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.homeBase.x, this.homeBase.y, this.homeBase.width, this.homeBase.height);
        
        // 绘制大本营信息
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`大本营: ${this.homeBase.enemiesEntered}/${this.homeBase.maxEnemies}`, 20, this.homeBase.y + 20);
        
        // 显示当前波次信息
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`当前波次: ${this.currentWave === 'strong' ? '强波' : '弱波'}`, 20, 30);
        
        // 绘制爆炸效果
        for (const explosion of this.explosions) {
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 165, 0, ${explosion.alpha})`;
            this.ctx.fill();
            
            // 内圈
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.radius * 0.6, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 69, 0, ${explosion.alpha})`;
            this.ctx.fill();
        }
        
        // 绘制箭矢和炮弹
        for (const arrow of this.arrows) {
            this.ctx.fillStyle = arrow.color;
            this.ctx.fillRect(arrow.x, arrow.y, arrow.width, arrow.height);
            
            // 如果是炮弹，绘制圆形
            if (arrow.type === 'tank') {
                this.ctx.beginPath();
                this.ctx.arc(arrow.x + arrow.width/2, arrow.y + arrow.height/2, arrow.width/2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // 绘制箭头
                this.ctx.save();
                this.ctx.translate(arrow.x + arrow.width/2, arrow.y + arrow.height/2);
                // 计算旋转角度
                const angle = Math.atan2(arrow.speedY, arrow.speedX);
                this.ctx.rotate(angle);
                
                this.ctx.beginPath();
                this.ctx.moveTo(arrow.width/2, 0);
                this.ctx.lineTo(-arrow.width/2, -arrow.height/2);
                this.ctx.lineTo(-arrow.width/2, arrow.height/2);
                this.ctx.closePath();
                this.ctx.fillStyle = arrow.color;
                this.ctx.fill();
                this.ctx.restore();
            }
        }
        
        // 绘制单位
        for (const unit of this.units) {
            // 绘制单位主体
            this.ctx.fillStyle = unit.color;
            this.ctx.fillRect(unit.x, unit.y, unit.width, unit.height);
            
            // 绘制血条
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(unit.x, unit.y - 10, unit.width, 5);
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(unit.x, unit.y - 10, unit.width * (unit.health / unit.maxHealth), 5);
            
            // 如果是刀斧手，绘制攻击范围和击杀数
            if (unit.type === 'warrior') {
                this.ctx.beginPath();
                this.ctx.arc(
                    unit.x + unit.width / 2, 
                    unit.y + unit.height / 2, 
                    unit.attackRange, 
                    0, 
                    Math.PI * 2
                );
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.stroke();
                
                // 显示击杀数
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    unit.kills ? unit.kills.toString() : '0', 
                    unit.x + unit.width / 2, 
                    unit.y + unit.height / 2 + 4
                );
                this.ctx.textAlign = 'left';
            }
            
            // 如果是坦克兵，显示受击次数
            if (unit.type === 'tank') {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    unit.hits ? unit.hits.toString() : '0', 
                    unit.x + unit.width / 2, 
                    unit.y + unit.height / 2 + 4
                );
                this.ctx.textAlign = 'left';
            }
        }
        
        // 绘制正在拖拽的单位
        if (this.isDragging && this.dragUnit) {
            this.ctx.fillStyle = this.dragUnit.color;
            this.ctx.fillRect(this.dragUnit.x, this.dragUnit.y, this.dragUnit.width, this.dragUnit.height);
            
            // 添加半透明效果表示正在拖拽
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(this.dragUnit.x, this.dragUnit.y, this.dragUnit.width, this.dragUnit.height);
        }
        
        // 绘制敌人
        for (const enemy of this.enemies) {
            // 绘制敌人主体
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 绘制血条
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 3);
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * (enemy.health / enemy.maxHealth), 3);
            
            // 如果是强波敌人，添加标识
            if (enemy.isStrong) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('强', enemy.x + enemy.width/2, enemy.y - 10);
                this.ctx.textAlign = 'left';
            }
        }
        
        // 显示游戏结束画面
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束', this.canvas.width/2, this.canvas.height/2 - 40);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`敌人进入大本营: ${this.homeBase.enemiesEntered}/${this.homeBase.maxEnemies}`, this.canvas.width/2, this.canvas.height/2 + 20);
            
            this.ctx.font = '20px Arial';
            this.ctx.fillText('点击任意位置重新开始', this.canvas.width/2, this.canvas.height/2 + 60);
            this.ctx.textAlign = 'left';
        }
    }
    
    // 绘制坐标系
    drawCoordinateSystem() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 绘制网格
        ctx.strokeStyle = '#dddddd';
        ctx.lineWidth = 1;
        
        // 垂直线
        for (let x = 0; x <= width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            
            // 绘制坐标标记
            if (x > 0) {
                ctx.fillStyle = '#666666';
                ctx.font = '12px Arial';
                ctx.fillText(x, x + 2, 12);
            }
        }
        
        // 水平线
        for (let y = 0; y <= height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            
            // 绘制坐标标记
            if (y > 0) {
                ctx.fillStyle = '#666666';
                ctx.font = '12px Arial';
                ctx.fillText(y, 2, y - 2);
            }
        }
        
        // 绘制坐标轴
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        
        // 绘制轴标签
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText('X', width - 20, height / 2 - 10);
        ctx.fillText('Y', width / 2 + 10, 20);
    }
    
    buyUnit(type) {
        const unitType = this.unitTypes[type];
        if (this.gold >= unitType.cost) {
            this.gold -= unitType.cost;
            this.updateGoldDisplay();
            
            // 创建单位
            const unit = {
                type: type,
                x: 50 + Math.random() * 100,
                y: 100 + Math.random() * 400,
                width: type === 'tank' ? 50 : 20, // 坦克兵边长设为50
                height: type === 'tank' ? 50 : 20, // 坦克兵边长设为50
                color: unitType.color,
                health: 100,
                maxHealth: 100,
                speed: type === 'archer' ? 0 : type === 'warrior' ? 1 : type === 'tank' ? 0 : 0, // 坦克兵不可移动
                damage: type === 'archer' ? 20 : type === 'warrior' ? 30 : type === 'tank' ? 0 : 0,
                attackRange: type === 'archer' ? 100 : type === 'warrior' ? 50 : 0,
                attackCooldown: 0,
                maxAttackCooldown: type === 'archer' ? 30 : type === 'warrior' ? 20 : type === 'tank' ? 0 : 0,
                kills: type === 'tank' ? 0 : undefined // 坦克兵击杀计数
            };
            
            this.units.push(unit);
        }
    }
    
    showGameOver() {
        // 添加点击事件监听器以重新开始游戏
        const restartHandler = () => {
            this.canvas.removeEventListener('click', restartHandler);
            this.restartGame();
        };
        this.canvas.addEventListener('click', restartHandler);
    }
    
    restartGame() {
        // 重置游戏状态
        this.gold = 100;
        this.units = [];
        this.enemies = [];
        this.arrows = [];
        this.explosions = [];
        
        // 重置大本营
        this.homeBase.enemiesEntered = 0;
        
        // 重置波次系统
        this.waveTimer = 0;
        this.currentWave = 'weak';
        this.enemySpawnTimer = 0;
        
        // 重置游戏结束状态
        this.gameOver = false;
        
        // 更新金币显示
        this.updateGoldDisplay();
    }
    
    gameLoop() {
        if (!this.gameOver) {
            this.spawnEnemy();
            this.updateUnits();
            this.updateEnemies();
            this.updateArrows(); // 更新箭矢和炮弹
            this.updateExplosions(); // 更新爆炸效果
        }
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new TowerDefenseGame();
});