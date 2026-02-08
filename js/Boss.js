class Boss {
    constructor(theme) {
        this.theme = theme;
        this.x = -150; 
        this.y = canvas.height - CONSTANTS.groundHeight - 120; 
        this.targetX = 20; 
        this.active = false;
        this.emoji = this.getBossEmoji(theme);
        this.projectileEmoji = this.getProjectileEmoji(theme);
        this.anger = 0;
        this.projectiles = [];
        this.attackTimer = 0;
        this.moveTimer = 0;
        this.distanceTimer = 0; 
        this.currentBaseDistance = 250; 
        this.targetBaseDistance = 250;
        
        const flyingThemes = ['space', 'rainbow', 'volcano'];
        
        if (flyingThemes.includes(theme)) {
            this.moveType = 'fly';
        } else {
            this.moveType = 'ground'; 
        }
        
        if (theme === 'beach') {
            this.moveType = 'ground'; 
        }
        
        if (this.moveType === 'ground') {
            this.y = canvas.height - CONSTANTS.groundHeight - 80; 
            
            if (theme === 'beach') {
                this.y += 40; 
            }
        }
    }
    
    getBossEmoji(theme) {
        if (theme === 'forest') return '🐻'; 
        if (theme === 'meadow') return '🐺'; 
        if (theme === 'beach') return '🦈'; 
        if (theme === 'farm') return '🦊'; 
        if (theme === 'snow') return '🦁'; 
        if (theme === 'desert') return '🦂'; 
        if (theme === 'space') return '👾';
        if (theme === 'volcano') return '🐲';
        return '🦖'; 
    }

    getProjectileEmoji(theme) {
        if (theme === 'forest') return '🍯'; 
        if (theme === 'meadow') return '🦴'; 
        if (theme === 'beach') return '💧'; 
        if (theme === 'farm') return '🥚'; 
        if (theme === 'snow') return '❄️'; 
        if (theme === 'desert') return '🌵'; 
        if (theme === 'space') return '⚡'; 
        if (theme === 'volcano') return '🔥'; 
        return '☄️'; 
    }
    
    update() {
        if (!this.active) return;
        
        this.moveTimer += 0.03;
        this.distanceTimer++;
        
        if (this.distanceTimer > 200 + Math.random() * 100) {
            this.distanceTimer = 0;
            this.targetBaseDistance = 150 + Math.random() * 250;
        }
        
        this.currentBaseDistance += (this.targetBaseDistance - this.currentBaseDistance) * 0.02;
        
        const bobX = Math.sin(this.moveTimer) * 50; 
        
        this.targetX = (player.x - this.currentBaseDistance) + bobX;
        
        this.x += (this.targetX - this.x) * 0.1; 
        
        if (this.moveType === 'fly') {
            this.yOffset = Math.sin(frames * 0.1) * 10;
        } else {
            this.yOffset = Math.abs(Math.sin(frames * 0.2)) * -5; 
        }
        
        this.attackTimer++;
        if (this.attackTimer > 120) {
            this.attackTimer = 0;
            this.shoot();
        }
        
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            
            if (!p.landed) {
                p.x += p.vx; 
                p.y += p.vy;
                p.vy += 0.5; 
                
                const groundY = canvas.height - CONSTANTS.groundHeight - 20; 
                
                if (p.y >= groundY) {
                    p.y = groundY;
                    p.vy = -p.vy * 0.4; 
                    p.vx *= 0.8; 
                    
                    if (Math.abs(p.vy) < 2) {
                        p.landed = true;
                        p.y = groundY; 
                        p.vx = -speed; 
                    }
                }
            } else {
                p.x -= speed;
            }
            
            if (checkCollision(player, {x: p.x - 15, y: p.y - 15, width: 30, height: 30})) {
                handleCollision();
                this.projectiles.splice(i, 1);
                continue;
            }
            
            if (p.x > canvas.width + 200 || p.x < -300) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    shoot() {
        const startX = this.x + 80; 
        const startY = this.y + 20;
        
        const dist = (player.x + 200) - startX; 
        
        const vx = Math.max(10, dist / 50); 
        let vy = -15; 
        
        if (this.moveType === 'ground') {
             vy = -12; 
        }
        
        this.projectiles.push({
            x: startX,
            y: startY,
            vx: vx, 
            vy: vy, 
            emoji: this.projectileEmoji,
            landed: false
        });
    }
    
    draw() {
        if (!this.active) return;
        
        ctx.save();
        ctx.font = '100px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        
        let drawY = this.y + this.yOffset + 50;
        
        if (this.moveType === 'fly') {
             drawY = this.y + this.yOffset + 50;
        } else {
             drawY = this.y + this.yOffset + 50; 
        }
        
        ctx.save();
        ctx.translate(this.x + 50, drawY); 
        ctx.scale(-1, 1); 
        ctx.fillText(this.emoji, -50, 0); 
        ctx.restore();
        
        if (this.attackTimer > 150 && frames % 10 < 5) {
            ctx.font = '40px Arial';
            ctx.fillText('💢', this.x + 80, this.y - 20);
        }
        
        ctx.restore();
        
        ctx.save();
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this.projectiles.forEach(p => {
            ctx.fillText(p.emoji, p.x, p.y);
        });
        ctx.restore();
    }
}
