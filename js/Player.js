const player = {
    x: 50,
    y: 0,
    width: 50, 
    height: 50,
    vx: 0, 
    vy: 0,
    isJumping: false,
    jumpCount: 0,
    isSliding: false,
    slideTimer: 0,
    invincible: 0,
    
    reset() {
        this.x = 50; 
        this.y = canvas.height - CONSTANTS.groundHeight - this.height;
        this.vx = 0;
        this.vy = 0;
        this.isJumping = false;
        this.jumpCount = 0;
        this.isSliding = false;
        this.slideTimer = 0;
        this.invincible = 0;
        this.height = 50;
        hasShield = false;
        hasRevive = false; 
        activeMagnet = 0;
        sizeState = 'normal';
        sizeTimer = 0;
        this.width = 50;
        this.height = 50;
    },

    move(dir) {
        if (dir === 'left') this.vx = -5;
        if (dir === 'right') this.vx = 5;
        if (dir === 'stop') this.vx = 0;
    },

    jump() {
        if (this.isSliding) return;
        
        let jumpBonus = 0;
        if (SKINS[currentSkinIndex].id === 'rarity') jumpBonus = -2; 

        if (!this.isJumping) {
            this.vy = CONSTANTS.jumpForce + jumpBonus;
            this.isJumping = true;
            this.jumpCount = 1;
            audio.playJump();
            triggerHaptic('medium');
            createParticles(this.x + this.width/2, this.y + this.height, 5, '#FFF');
        } else if (this.jumpCount < 2) {
            this.vy = CONSTANTS.doubleJumpForce + jumpBonus;
            this.jumpCount = 2;
            audio.playJump();
            triggerHaptic('medium');
            createParticles(this.x + this.width/2, this.y + this.height, 8, '#FFD700');
        }
    },

    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = CONSTANTS.slideDuration;
            this.height = 30; 
            this.y = canvas.height - CONSTANTS.groundHeight - this.height;
            audio.playClick();
        }
    },

    update() {
        // Horizontal Movement
        this.x += this.vx;
        // Clamp X
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;

        // Size Timer Logic
        if (sizeTimer > 0) {
            sizeTimer--;
            if (sizeTimer <= 0) {
                // Revert size
                sizeState = 'normal';
                audio.playClick(); 
                createParticles(this.x + this.width/2, this.y + this.height/2, 10, '#FFF');
            }
        }
        
        // Update dimensions based on state
        let targetW = 50;
        let targetH = 50;
        
        if (sizeState === 'big') {
            targetW = 80;
            targetH = 80;
        } else if (sizeState === 'small') {
            targetW = 30;
            targetH = 30;
        }
        
        if (!this.isSliding) {
            this.width = targetW;
            this.height = targetH;
        }

        if (this.isSliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.y = canvas.height - CONSTANTS.groundHeight - this.height;
            } else {
                this.height = sizeState === 'big' ? 40 : (sizeState === 'small' ? 20 : 30);
            }
        } else {
            this.vy += CONSTANTS.gravity;
            this.y += this.vy;

            const groundY = canvas.height - CONSTANTS.groundHeight - this.height;
            if (this.y >= groundY) {
                this.y = groundY;
                this.vy = 0;
                this.isJumping = false;
                this.jumpCount = 0;
                
                // Ground Interaction Effects (Footsteps)
                if (frames % 10 === 0 && (gameState === 'PLAYING' || gameState === 'ENDLESS')) {
                    const config = LEVEL_CONFIGS[currentLevel - 1];
                    const theme = config ? config.theme : 'meadow';
                    
                    if (theme === 'beach') {
                          createParticles(this.x + 20, this.y + this.height, 2, '#4FC3F7'); 
                     } else if (theme === 'snow') {
                          createParticles(this.x + 20, this.y + this.height, 2, '#FFF'); 
                     } else if (theme === 'desert') {
                          createParticles(this.x + 20, this.y + this.height, 2, '#E65100'); 
                     } else if (theme === 'farm' || theme === 'meadow') {
                          createParticles(this.x + 20, this.y + this.height, 1, '#8D6E63'); 
                     }
                 }
             }
        }

        if (this.invincible > 0) this.invincible--;
    },

    draw(context) {
        if (this.invincible > 0 && Math.floor(frames / 5) % 2 === 0) return;
        
        const c = context || ctx;
        c.save();
        let drawY = this.y;
        let scaleY = 1;

        if (this.isJumping) {
            scaleY = 0.9; 
            drawY += 5;
        }
        
        if (this.isSliding) {
            scaleY = 0.6; 
            drawY += 20;
        }

        c.translate(this.x, drawY);
        
        if (sizeState === 'big') {
            c.scale(1.6, 1.6);
        } else if (sizeState === 'small') {
            c.scale(0.6, 0.6);
        }
        
        c.scale(1, scaleY);
        
        const skin = SKINS[currentSkinIndex];
        const legOffset = (Math.floor(frames / 5) % 2) * 8; 
        
        // 1. Back Legs
        c.fillStyle = skin.body;
        c.beginPath();
        c.ellipse(15, 45, 6, 12, 0, 0, Math.PI * 2); 
        c.fill();
        c.beginPath();
        c.ellipse(35, 45, 6, 12, 0, 0, Math.PI * 2); 
        c.fill();

        // 2. Tail
        c.fillStyle = skin.mane;
        c.beginPath();
        c.moveTo(5, 25);
        c.quadraticCurveTo(-5, 35, 5, 45);
        c.quadraticCurveTo(10, 35, 5, 25);
        c.fill();

        // 3. Body
        c.fillStyle = skin.body;
        c.beginPath();
        c.moveTo(10, 20);
        c.lineTo(40, 20);
        c.quadraticCurveTo(50, 20, 50, 30);
        c.lineTo(50, 40);
        c.quadraticCurveTo(50, 50, 40, 50);
        c.lineTo(10, 50);
        c.quadraticCurveTo(0, 50, 0, 40);
        c.lineTo(0, 30);
        c.quadraticCurveTo(0, 20, 10, 20);
        c.fill();
        
        // Zebra Stripes
        if (skin.id === 'zecora') {
            c.fillStyle = '#212121';
            c.beginPath();
            c.moveTo(15, 20); c.lineTo(12, 50); c.lineTo(15, 50); c.lineTo(18, 20);
            c.moveTo(25, 20); c.lineTo(22, 50); c.lineTo(25, 50); c.lineTo(28, 20);
            c.moveTo(35, 20); c.lineTo(32, 50); c.lineTo(35, 50); c.lineTo(38, 20);
            c.fill();
        }

        // 4. Front Legs
        c.fillStyle = skin.body;
        if (this.isJumping) {
            c.beginPath(); c.ellipse(15, 40, 6, 10, -0.5, 0, Math.PI*2); c.fill();
            c.beginPath(); c.ellipse(35, 40, 6, 10, -0.5, 0, Math.PI*2); c.fill();
        } else {
            c.beginPath(); c.ellipse(15, 45 + (scaleY===1?legOffset:0), 6, 12, 0, 0, Math.PI*2); c.fill();
            c.beginPath(); c.ellipse(35, 45 - (scaleY===1?legOffset:0), 6, 12, 0, 0, Math.PI*2); c.fill();
        }

        // 5. Neck & Head
        c.fillStyle = skin.body;
        c.beginPath();
        c.ellipse(40, 15, 12, 18, -0.3, 0, Math.PI * 2); 
        c.fill();
        
        c.beginPath();
        c.ellipse(45, 10, 14, 12, 0, 0, Math.PI * 2); 
        c.fill();
        
        // Snout
        c.fillStyle = skin.body === '#F5F5F5' ? '#FFE0B2' : (skin.body === '#424242' ? '#616161' : '#D7CCC8'); 
        c.beginPath();
        c.ellipse(55, 12, 6, 5, 0, 0, Math.PI * 2);
        c.fill();

        // 6. Mane
        c.fillStyle = skin.mane;
        c.beginPath();
        c.moveTo(38, 0);
        c.quadraticCurveTo(30, 10, 35, 20);
        c.quadraticCurveTo(45, 15, 38, 0);
        c.fill();

        // 7. Eye
        c.fillStyle = 'white';
        c.beginPath();
        c.arc(48, 8, 5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'black';
        c.beginPath();
        c.arc(50, 8, 2, 0, Math.PI * 2);
        c.fill();
        
        // 8. Horn
        if (skin.horn) {
            c.fillStyle = '#FFD700'; 
            c.beginPath();
            c.moveTo(48, 2);
            c.lineTo(52, -10);
            c.lineTo(54, 2);
            c.fill();
        }
        
        // 9. Ear
        c.fillStyle = skin.body;
        c.beginPath();
        c.moveTo(38, 5);
        c.lineTo(35, -2);
        c.lineTo(42, 2);
        c.fill();
        
        // 10. Shield Bubble
        if (hasShield) {
            c.save();
            c.strokeStyle = 'rgba(100, 200, 255, 0.8)';
            c.fillStyle = 'rgba(100, 200, 255, 0.2)';
            c.lineWidth = 3;
            c.beginPath();
            c.arc(25, 25, 40, 0, Math.PI * 2);
            c.stroke();
            c.fill();
            c.restore();
        }
        
        // 11. Magnet Glow
        if (activeMagnet > 0) {
            c.save();
            c.strokeStyle = 'rgba(255, 50, 50, 0.5)';
            c.lineWidth = 2;
            c.setLineDash([5, 5]);
            c.beginPath();
            c.arc(25, 25, 60 + Math.sin(frames * 0.2) * 10, 0, Math.PI * 2);
            c.stroke();
            c.restore();
        }
        
        // 12. Revive Halo
        if (hasRevive) {
            c.save();
            c.strokeStyle = '#FFD700';
            c.lineWidth = 3;
            c.beginPath();
            c.ellipse(40, 5, 15, 5, 0, 0, Math.PI*2); 
            c.stroke();
            c.restore();
        }

        c.restore();
    }
};
