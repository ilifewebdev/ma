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
        
        if (theme === 'beach' || theme === 'zombie') {
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
        if (theme === 'rainbow') return '🦄';
        if (theme === 'zombie') return '🧟‍♂️';
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
        if (theme === 'rainbow') return '✨';
        if (theme === 'zombie') return '🧠';
        return '☄️'; 
    }
    
    update() {
        if (!this.active) return;
        
        // --- 1. Phase Management ---
        const config = LEVEL_CONFIGS[currentLevel - 1];
        // Calculate Boss Health/Phase based on level progress
        // Boss appears at 60% progress. Defeated at 100%.
        // Nerfed: Boss appears at 80% progress (shorter fight)
        const fightStart = config.target * 0.8; 
        const fightEnd = config.target;
        const fightProgress = Math.max(0, (score - fightStart) / (fightEnd - fightStart));
        
        // Phase 2 triggers at 50% fight progress
        const isPhase2 = fightProgress > 0.5;
        this.anger = isPhase2 ? 1 : 0; // 0: Normal, 1: Angry
        
        // --- 2. Movement Logic ---
        this.moveTimer += 0.03;
        this.distanceTimer++;
        
        if (this.distanceTimer > 200 + Math.random() * 100) {
            this.distanceTimer = 0;
            // In Phase 2, boss moves closer and more erratically
            const minDist = isPhase2 ? 100 : 200;
            const maxDist = isPhase2 ? 200 : 350;
            this.targetBaseDistance = minDist + Math.random() * (maxDist - minDist);
        }
        
        this.currentBaseDistance += (this.targetBaseDistance - this.currentBaseDistance) * 0.05; // Smoother move
        
        // Bobbing
        const bobSpeed = isPhase2 ? 0.1 : 0.05;
        const bobAmp = isPhase2 ? 80 : 50;
        const bobX = Math.sin(frames * bobSpeed) * bobAmp; 
        
        // Target X position (Right side of screen, relative to player)
        // Boss stays at fixed screen position relative to canvas width usually, 
        // but here it seems relative to player.x which might be static in screen coordinates?
        // Wait, player.x changes? No, player x is clamped.
        // Actually player.x is usually ~50-100.
        // Boss x should be canvas.width - distance.
        this.x = canvas.width - this.currentBaseDistance + bobX;

        // Y Movement
        if (this.moveType === 'fly') {
            this.yOffset = Math.sin(frames * 0.1) * 20;
        } else {
            // Ground boss jumps occasionally in Phase 2?
            if (isPhase2 && frames % 120 === 0 && Math.random() > 0.5) {
                 this.vy = -15; // Jump!
            }
            
            // Apply gravity if jumping
            if (this.y < canvas.height - CONSTANTS.groundHeight - 80) {
                 this.vy += 0.8;
                 this.y += this.vy;
            } else {
                 this.y = canvas.height - CONSTANTS.groundHeight - 80;
                 this.vy = 0;
                 this.yOffset = 0;
            }
        }
        
        // --- 3. Attack Logic ---
        this.attackTimer++;
        // Attack rate increases in Phase 2
        // Nerfed: increased intervals (easier)
        const attackInterval = isPhase2 ? 90 : 150; // Was 60/120, now 90/150
        
        if (this.attackTimer > attackInterval) {
            this.attackTimer = 0;
            this.shoot(isPhase2);
        }
        
        // --- 4. Projectile Physics ---
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            
            // Simple physics: move left
            p.x -= p.vx;
            p.y += p.vy;
            
            // Gravity for arched projectiles
            if (p.type === 'arch') {
                p.vy += 0.5;
            }
            
            // Bounce logic for ground projectiles
            if (p.y > canvas.height - CONSTANTS.groundHeight - 10) {
                 if (p.type === 'bounce') {
                     p.y = canvas.height - CONSTANTS.groundHeight - 10;
                     p.vy = -p.vy * 0.8; // Dampen
                 }
            }

            // Collision
            // ... (keep existing collision logic)
             if (checkCollision(player, {x: p.x - 15, y: p.y - 15, width: 30, height: 30})) {
                handleCollision();
                this.projectiles.splice(i, 1);
                continue;
            }
            
            if (p.x < -50 || p.y > canvas.height) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    shoot(isAngry) {
        // Attack Patterns
        const pattern = isAngry ? Math.floor(Math.random() * 3) : 0;
        
        if (pattern === 0) {
            // Standard Shot
            this.projectiles.push({
                x: this.x,
                y: this.y + 50,
                vx: speed + 5,
                vy: 0,
                emoji: this.projectileEmoji,
                type: 'straight'
            });
        } else if (pattern === 1) {
            // Spread Shot (3 way)
            [-2, 0, 2].forEach(dy => {
                this.projectiles.push({
                    x: this.x,
                    y: this.y + 50,
                    vx: speed + 4,
                    vy: dy,
                    emoji: this.projectileEmoji,
                    type: 'straight'
                });
            });
        } else if (pattern === 2) {
            // Arcing Bomb
            this.projectiles.push({
                x: this.x,
                y: this.y,
                vx: speed + 2,
                vy: -10, // Lob up
                emoji: '💣',
                type: 'arch'
            });
        }
    }
    
    draw() {
        if (!this.active) return;
        
        ctx.save();
        
        // Visual Anger Effect
        if (this.anger > 0) {
             ctx.filter = 'sepia(1) hue-rotate(-50deg) saturate(3)'; // Reddish tint
             if (frames % 10 < 5) {
                 ctx.translate(Math.random()*4 - 2, Math.random()*4 - 2); // Shake
             }
        }

        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw Boss
        ctx.fillText(this.emoji, this.x + 50, this.y + 50 + this.yOffset);
        
        ctx.restore();
        
        // Angry Icon
        if (this.anger > 0) {
            ctx.font = '40px Arial';
            ctx.fillText('💢', this.x + 80, this.y + 20);
        }
        
        // Draw Projectiles
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
