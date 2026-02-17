function init() {
    loadProgress();
    resize();
    window.addEventListener('resize', resize);
    
    setupInputs();
    
    updateSkinButtons(); 
    
    if (currentUser) {
        showMap();
    } else {
        showLogin(); 
    }
}

function resize() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    if (gameState !== 'PLAYING' && gameState !== 'ENDLESS') {
        player.y = canvas.height - CONSTANTS.groundHeight - player.height;
    }
}

function startGame(level) {
    audio.resume();
    audio.playClick();
    audio.playMelody('default'); // Always restart BGM with default melody
    
    if (typeof level === 'number') currentLevel = level;
    
    const config = LEVEL_CONFIGS[currentLevel - 1];
    applyTheme(config.theme);

    initBackgrounds(config.theme); 
    boss = new Boss(config.theme);

    gameState = 'PLAYING';
    score = 0;
    coins = 0; 
    hearts = 3;
    frames = 0;
    speed = config.speed;
    obstacles = [];
    particles = [];
    powerups = [];
    coinsArray = [];
    atmosphereParticles = []; 
    
    player.reset();
    
    if (SKINS[currentSkinIndex].id === 'twilight') {
        activeMagnet = 600; 
        showToast('✨ 紫悦公主：魔法磁铁启动！');
    }
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    mapScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    
    updateHUD();
    
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    
    // Reset Time
    lastTime = performance.now();
    gameLoop(lastTime);
}

let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function update(deltaTime) {
    const config = LEVEL_CONFIGS[currentLevel - 1];
    
    // Always increment frames for animations
    frames++;
    
    // Scale factor: if device is 120Hz (delta ~8ms), scale ~0.5. If 60Hz (delta ~16ms), scale ~1.
    // However, since we are throttling gameLoop to targetFPS (60), we can just run logic once per loop
    // But to be safe on high refresh rate screens where requestAnimationFrame fires faster, our throttle above handles it.
    
    // We already throttle in gameLoop to 60 FPS, so we don't need complex delta time scaling for physics 
    // unless we want to support variable frame rates below 60.
    // For this simple game, fixed timestep (throttled loop) is safer to prevent tunneling.

    score += speed * CONSTANTS.meterScale;
    
    // ... rest of update logic ...


    if (score >= 500) unlockAchievement('dist_500');
    if (score >= 1000) unlockAchievement('dist_1000');
    if (isEndless && score >= 2000) unlockAchievement('endless_master');

    if (!isEndless && score >= config.target) {
        audio.playMelody('victory'); // Victory music
        levelComplete();
        return;
    }
    
    if (!isEndless && score > config.target * 0.6 && boss) {
        if (!boss.active) {
            boss.active = true;
            audio.playMelody('boss'); // Switch to boss music
        }
    }
    if (boss && boss.active) boss.update();
    
    player.update();
    tutorial.update();
    
    if (frames % Math.floor(config.spawnRate) === 0) {
         obstacles.push(new Obstacle(config.obstacles));
    }
    
    let powerupRate = 300;
    if (currentLevel <= 2 && !isEndless) powerupRate = 180; 
    
    if (frames % powerupRate === 0 && Math.random() > 0.5) { 
        powerups.push(new PowerUp());
    }

    if (frames % 60 === 0 && Math.random() > 0.2) { 
        const pattern = Math.floor(Math.random() * 3);
        
        if (pattern === 0) {
            for(let k=0; k<3; k++) coinsArray.push(new Coin());
        } else {
            coinsArray.push(new Coin());
        }
    }
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.update();
        
        if (!obs.passed && player.invincible === 0 && checkCollision(player, obs)) {
            handleCollision();
            obs.passed = true;
        }
        
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }
    
    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        p.update();
        
        if (checkCollision(player, p)) {
            applyPowerUp(p.type);
            powerups.splice(i, 1);
            continue;
        }
        
        if (p.x + p.width < 0) {
            powerups.splice(i, 1);
        }
    }

    for (let i = coinsArray.length - 1; i >= 0; i--) {
        let c = coinsArray[i];
        c.update();
        
        if (!c.passed && checkCollision(player, c)) {
            let bonus = 1;
            if (SKINS[currentSkinIndex].id === 'rainbow') bonus = 2; 
            
            coins += bonus;
            c.passed = true;
            coinsArray.splice(i, 1);
            audio.playClick(); 
            triggerHaptic('light');
            createParticles(c.x, c.y, 5, '#FFD700');
            continue;
        }
        
        if (c.x + c.width < -100) {
            coinsArray.splice(i, 1);
        }
    }
    
    if (activeMagnet > 0) activeMagnet--;
    
    updateAtmosphere(); 
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
    
    updateHUD();
}

function handleCollision() {
    if (hasShield) {
        hasShield = false;
        audio.playClick(); 
        createParticles(player.x, player.y, 15, '#66CCFF');
        unlockAchievement('shield_save');
        return;
    }
    
    if (sizeState === 'big') {
        audio.playClick(); 
        createParticles(player.x + player.width, player.y + player.height, 10, '#8D6E63');
        return; 
    }

    hearts--;
    player.invincible = CONSTANTS.invincibleTime;
    audio.playHit();
    createParticles(player.x + player.width/2, player.y + player.height/2, 10, '#FF0000');
    
    if (hearts <= 0) {
        if (hasRevive) {
            hasRevive = false;
            hearts = 3; 
            audio.playWin(); 
            createParticles(player.x, player.y, 30, '#FFD700'); 
            showToast('🌟 复活生效！满血复活！');
            player.invincible = 180; 
        } else {
            saveProgress(); 
            saveDailyRecord(score, currentLevel);
            
            hud.classList.add('hidden');
            gameOver();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const config = LEVEL_CONFIGS[currentLevel - 1];
    const themeKey = (config && config.theme) ? config.theme : 'meadow';
    const themeColors = THEME_COLORS[themeKey] || THEME_COLORS['meadow'];
    
    drawBackground();
    
    atmosphereParticles.forEach(p => {
        if (p.type === 'star') p.draw();
    });
    
    if (config) {
        if (config.theme === 'city') {
             ctx.fillStyle = 'rgba(150, 150, 150, 0.1)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (config.theme === 'desert') {
             ctx.fillStyle = 'rgba(255, 100, 0, 0.05)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    ctx.fillStyle = themeColors.ground;
    ctx.fillRect(0, canvas.height - CONSTANTS.groundHeight, canvas.width, CONSTANTS.groundHeight);
    
    ctx.fillStyle = themeColors.decor;
    for(let i=0; i<canvas.width; i+=100) {
        ctx.fillRect((i - (frames * speed) % 100) % canvas.width, canvas.height - CONSTANTS.groundHeight, 20, 10);
    }

    obstacles.forEach(obs => obs.draw());
    powerups.forEach(p => p.draw());
    coinsArray.forEach(c => c.draw());
    particles.forEach(p => p.draw());
    
    atmosphereParticles.forEach(p => {
        if (p.type !== 'star') p.draw();
    });
    
    if (boss) boss.draw();
    
    player.draw();
}

function gameLoop(timestamp) {
    if (gameState === 'PAUSED') {
        gameLoopId = requestAnimationFrame(gameLoop);
        lastTime = timestamp;
        return;
    }

    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;

    if (elapsed > frameInterval) {
        lastTime = timestamp - (elapsed % frameInterval);
        
        // Capped update
        if (gameState === 'PLAYING' || gameState === 'ENDLESS') {
            update(elapsed);
            draw();
        } else if (!startScreen.classList.contains('hidden')) {
            drawStartScreenPreview();
        } else {
             draw();
        }
    }
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

init();
