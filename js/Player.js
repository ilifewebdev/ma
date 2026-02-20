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
        let baseSpeed = 5;
        
        // Vehicle Speed Bonus
        const vehicle = VEHICLES[currentVehicleIndex];
        if (vehicle) baseSpeed += vehicle.speedBonus || 0;
        
        // Zecora Bonus
        if (SKINS[currentSkinIndex].id === 'zecora') baseSpeed *= 1.1;

        if (dir === 'left') this.vx = -baseSpeed;
        if (dir === 'right') this.vx = baseSpeed;
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
            
            // Daily Mission: Jump
            dailyMissions.missions.forEach(m => {
                if (!m.claimed && m.id === 'jump') m.current++;
            });
            
        } else if (this.jumpCount < 2) {
            this.vy = CONSTANTS.doubleJumpForce + jumpBonus;
            this.jumpCount = 2;
            audio.playJump();
            triggerHaptic('medium');
            createParticles(this.x + this.width/2, this.y + this.height, 8, '#FFD700');
            
            // Daily Mission: Jump
            dailyMissions.missions.forEach(m => {
                if (!m.claimed && m.id === 'jump') m.current++;
            });
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
        
        // Apply dimensions (unless sliding which handles its own height)
        if (!this.isSliding) {
            this.width = targetW;
            this.height = targetH;
        }

        if (this.isSliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.height = targetH; // Restore height
                this.y = canvas.height - CONSTANTS.groundHeight - this.height; // Snap to ground
            } else {
                this.height = sizeState === 'big' ? 40 : (sizeState === 'small' ? 20 : 30);
            }
        } else {
            // Apply Gravity
            this.vy += CONSTANTS.gravity;
            this.y += this.vy;

            // Ground Collision
            const groundY = canvas.height - CONSTANTS.groundHeight - this.height;
            if (this.y >= groundY) {
                this.y = groundY;
                this.vy = 0;
                this.isJumping = false;
                this.jumpCount = 0;
                
                // Ground Interaction Effects (Footsteps)
                // Only spawn particles if moving fast or landing
                if (this.vx !== 0 && frames % 10 === 0 && (gameState === 'PLAYING' || gameState === 'ENDLESS')) {
                     const config = LEVEL_CONFIGS[currentLevel - 1];
                     const theme = config ? config.theme : 'meadow';
                     let pColor = '#8D6E63';
                     if (theme === 'beach') pColor = '#4FC3F7';
                     else if (theme === 'snow') pColor = '#FFF';
                     else if (theme === 'desert') pColor = '#E65100';
                     
                     createParticles(this.x + 20, this.y + this.height, 2, pColor); 
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
        const hasVehicle = VEHICLES[currentVehicleIndex] && VEHICLES[currentVehicleIndex].id !== 'none';
        
        // Leg Animation: If vehicle, keep legs static or subtle
        const legOffset = hasVehicle ? 0 : (Math.floor(frames / 5) % 2) * 8; 
        
        // 1. Back Legs
        c.fillStyle = skin.body;
        c.beginPath();
        if (hasVehicle) {
            // Sitting position
            c.ellipse(20, 45, 6, 12, 0.5, 0, Math.PI * 2); 
            c.fill();
            c.beginPath();
            c.ellipse(40, 45, 6, 12, 0.5, 0, Math.PI * 2); 
            c.fill();
        } else {
            c.ellipse(15, 45, 6, 12, 0, 0, Math.PI * 2); 
            c.fill();
            c.beginPath();
            c.ellipse(35, 45, 6, 12, 0, 0, Math.PI * 2); 
            c.fill();
        }

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
        } else if (hasVehicle) {
             // Driving position (arms forward)
            c.beginPath(); c.ellipse(15, 40, 6, 12, -0.5, 0, Math.PI*2); c.fill();
            c.beginPath(); c.ellipse(35, 40, 6, 12, -0.5, 0, Math.PI*2); c.fill();
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
        
        // 9.5. Accessories
        const accessory = ACCESSORIES[currentAccessoryIndex];
        if (accessory && accessory.id !== 'none') {
            // ... (accessory drawing code) ...
            if (accessory.id === 'crown') {
                c.fillStyle = '#FFD700'; // Gold
                c.beginPath();
                c.moveTo(38, -5);
                c.lineTo(35, -15);
                c.lineTo(42, -5);
                c.lineTo(45, -15);
                c.lineTo(48, -5);
                c.lineTo(51, -15);
                c.lineTo(48, -2);
                c.fill();
            } else if (accessory.id === 'bow') {
                c.fillStyle = '#FF4081'; // Pink
                c.beginPath();
                c.arc(40, -5, 5, 0, Math.PI*2); // Center
                c.fill();
                c.beginPath();
                c.moveTo(40, -5);
                c.lineTo(30, -10);
                c.lineTo(30, 0);
                c.fill();
                c.beginPath();
                c.moveTo(40, -5);
                c.lineTo(50, -10);
                c.lineTo(50, 0);
                c.fill();
            } else if (accessory.id === 'shades') {
                c.fillStyle = '#333';
                c.beginPath();
                c.rect(46, 5, 10, 5); // Lens 1
                c.rect(50, 5, 2, 2); // Bridge
                c.rect(54, 5, 8, 5); // Lens 2 (Actually just one big block looks better on side profile)
                // Let's do a side profile shade
                c.beginPath();
                c.moveTo(48, 5);
                c.lineTo(58, 5);
                c.lineTo(55, 12);
                c.lineTo(48, 10);
                c.fill();
                // Temple
                c.lineWidth = 1;
                c.strokeStyle = '#333';
                c.beginPath();
                c.moveTo(48, 7);
                c.lineTo(40, 5);
                c.stroke();
            } else if (accessory.id === 'flower') {
                c.fillStyle = '#FFF';
                c.beginPath();
                c.arc(40, -2, 3, 0, Math.PI*2); c.fill();
                c.arc(45, -5, 3, 0, Math.PI*2); c.fill();
                c.arc(48, 0, 3, 0, Math.PI*2); c.fill();
                c.arc(43, 3, 3, 0, Math.PI*2); c.fill();
                c.arc(38, 0, 3, 0, Math.PI*2); c.fill();
                c.fillStyle = '#FFEB3B';
                c.beginPath();
                c.arc(43, -1, 2, 0, Math.PI*2); c.fill();
            } else if (accessory.id === 'santa') {
                c.fillStyle = '#D32F2F'; // Red hat
                c.beginPath();
                c.moveTo(35, 0);
                c.lineTo(45, -20);
                c.lineTo(55, 0);
                c.fill();
                c.fillStyle = '#FFF'; // White trim
                c.beginPath();
                c.rect(35, -2, 20, 5);
                c.fill();
                c.beginPath(); // Ball
                c.arc(45, -20, 4, 0, Math.PI*2);
                c.fill();
            }
        }
        
        // 9.8. Vehicles
        const vehicle = VEHICLES[currentVehicleIndex];
        if (vehicle && vehicle.id !== 'none') {
            c.save();
            c.translate(25, 50); // Base position under pony
            
            // Apply scale for larger vehicles
            c.scale(1.2, 1.2); 
            c.translate(0, -5); // Adjust Y to keep wheels on ground

            // Wheel Rotation
            const wheelRotation = frames * 0.5;

            if (vehicle.id === 'bike') {
                c.strokeStyle = '#555';
                c.lineWidth = 3;
                // Wheels
                drawWheel(c, -15, 5, 12, wheelRotation); // Increased radius from 10 to 12
                drawWheel(c, 25, 5, 12, wheelRotation);
                // Frame
                c.strokeStyle = '#F44336';
                c.beginPath();
                c.moveTo(-15, 5); c.lineTo(5, 5); c.lineTo(15, -10); c.lineTo(25, 5); 
                c.moveTo(5, 5); c.lineTo(5, -10); 
                c.moveTo(15, -10); c.lineTo(20, -15); 
                c.stroke();
            } else if (vehicle.id === 'scooter') {
                c.strokeStyle = '#999';
                c.lineWidth = 2;
                // Wheels
                drawWheel(c, -10, 10, 6, wheelRotation); // Increased from 5 to 6
                drawWheel(c, 20, 10, 6, wheelRotation);
                // Deck
                c.fillStyle = '#4CAF50';
                c.fillRect(-10, 5, 30, 5);
                // Handle
                c.beginPath(); c.moveTo(20, 5); c.lineTo(18, -25); c.lineTo(12, -25); c.stroke();
            } else if (vehicle.id === 'motorcycle') {
                c.fillStyle = '#333';
                // Wheels
                drawWheel(c, -15, 5, 14, wheelRotation, true); // Increased from 12 to 14
                drawWheel(c, 25, 5, 14, wheelRotation, true);
                // Body
                c.fillStyle = '#2196F3';
                c.beginPath();
                c.moveTo(-15, 5);
                c.lineTo(25, 5);
                c.lineTo(20, -15);
                c.lineTo(5, -15);
                c.lineTo(-5, 0);
                c.fill();
                // Exhaust
                c.fillStyle = '#9E9E9E';
                c.fillRect(-20, 0, 10, 5);
            } else if (vehicle.id === 'car') {
                c.fillStyle = '#E91E63'; // Pink convertible
                // Body
                c.beginPath();
                c.moveTo(-35, 10); // Longer body
                c.lineTo(45, 10);
                c.lineTo(45, 0);
                c.lineTo(25, 0);
                c.lineTo(15, -12); // Higher windshield
                c.lineTo(-25, -12);
                c.lineTo(-35, 0);
                c.fill();
                // Wheels
                drawWheel(c, -20, 10, 10, wheelRotation, true); // Increased radius & spread
                drawWheel(c, 30, 10, 10, wheelRotation, true);
            }
            
            c.restore();
        }

        // 9.9. Pets
        const pet = PETS[currentPetIndex];
        if (pet && pet.id !== 'none') {
            c.save();
            // Pet position: Floating in FRONT of pony (Player facing right)
            // Bobbing animation
            const bobY = Math.sin(frames * 0.1) * 5;
            const petX = 80; // Changed from -30 (behind) to 80 (front)
            const petY = 20 + bobY;
            
            c.translate(petX, petY);
            
            // Draw Pet based on type
            c.font = '24px Arial';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            
            // Add a DARKER background circle to make pet more visible (without looking like a ghost)
            // c.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Old
            // c.beginPath();
            // c.arc(0, 0, 18, 0, Math.PI * 2);
            // c.fill();
            
            // Just shadow is enough if we add a white stroke/glow to the emoji itself?
            // Canvas fillText doesn't support stroke well for emojis.
            // Let's try a subtle dark glow behind the emoji
            c.shadowColor = 'rgba(0,0,0,0.8)';
            c.shadowBlur = 5;
            
            // Shadow
            c.fillStyle = 'rgba(0,0,0,0.3)';
            c.beginPath();
            c.ellipse(0, 15, 8, 3, 0, 0, Math.PI*2);
            c.fill();
            
            // Icon
            // Flip the pet icon horizontally so it faces forward (right)
            c.save();
            c.scale(-1, 1); 
            // Draw slightly larger to be clearer
            c.font = '28px Arial'; 
            c.fillText(pet.icon, 0, 0);
            c.restore();
            
            c.shadowBlur = 0; // Reset shadow
            
            c.restore();
            
            // Pet Logic (Run every frame)
            if (gameState === 'PLAYING' || gameState === 'ENDLESS') {
                if (pet.id === 'spike') {
                    // Coin generation
                    if (frames % pet.interval === 0) {
                        coins += pet.value;
                        createParticles(this.x + petX + 25, this.y + petY + 25, 5, '#FFD700'); // Sparkle
                        // Show +10 text
                        // (Simplified: Just add to score/coins, UI updates automatically)
                    }
                } else if (pet.id === 'tank') {
                    // Shield logic handled in Game.js collision
                    // Visual indicator
                    if (!hasShield) {
                        // Tank gives a shield effectively, but maybe we treat it as a special "pet shield"
                        // For simplicity, let's say Tank GIVES you a shield at start of level, 
                        // or regenerates one.
                        // Let's implement: Tank grants 'hasShield' if not present, once per level.
                        // We need a flag for "petAbilityUsed"
                    }
                } else if (pet.id === 'winona') {
                    // Magnet logic handled in Game.js update
                    // Visuals
                    if (frames % 20 === 0) {
                        createParticles(this.x - 10, this.y + 20, 1, '#FFF');
                    }
                }
            }
        }

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
