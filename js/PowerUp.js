class PowerUp {
    constructor(type) {
        this.x = canvas.width + Math.random() * 500; // Spawn further out
        this.y = canvas.height - CONSTANTS.groundHeight - 150; // In the air
        this.width = 40;
        this.height = 40;
        this.type = type || this.randomType();
        this.passed = false;
        
        this.vx = 0;
        this.vy = 0;
    }
    
    randomType() {
        const rand = Math.random();
        if (rand < 0.4) return 'heart';
        if (rand < 0.6) return 'magnet';
        if (rand < 0.75) return 'shield';
        if (rand < 0.85) return 'mushroom'; // Big
        if (rand < 0.95) return 'potion'; // Small
        return 'star'; // Revive Star (Rare: 5%)
    }

    update() {
        if (activeMagnet > 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 300) { 
                this.x += dx * 0.1;
                this.y += dy * 0.1;
            } else {
                this.x -= speed;
            }
        } else {
            this.x -= speed;
        }
        
        this.y += Math.sin(frames * 0.1) * 0.5;
    }

    draw() {
        ctx.save();
        ctx.font = '30px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        let icon = '💖';
        if (this.type === 'magnet') icon = '🧲';
        if (this.type === 'shield') icon = '🛡️';
        if (this.type === 'mushroom') icon = '🍄';
        if (this.type === 'potion') icon = '🧪';
        if (this.type === 'star') icon = '🌟'; 
        ctx.fillText(icon, this.x, this.y);
        ctx.restore();
    }
}

function applyPowerUp(type) {
    audio.playWin();
    if (type === 'heart') {
        hearts = Math.min(3, hearts + 1);
        createParticles(player.x, player.y, 10, '#FF69B4');
    } else if (type === 'magnet') {
        activeMagnet = 360; 
        createParticles(player.x, player.y, 10, '#FF3333');
        unlockAchievement('magnet_lover'); 
    } else if (type === 'shield') {
        hasShield = true;
        createParticles(player.x, player.y, 10, '#66CCFF');
    } else if (type === 'mushroom') {
        sizeState = 'big';
        sizeTimer = 600; 
        createParticles(player.x, player.y, 15, '#FF5722');
        audio.playWin(); 
        showToast('🍄 变大啦！');
    } else if (type === 'potion') {
        sizeState = 'small';
        sizeTimer = 600; 
        createParticles(player.x, player.y, 15, '#AB47BC');
        audio.playWin(); 
        showToast('🧪 变小啦！');
    } else if (type === 'star') {
        hasRevive = true;
        createParticles(player.x, player.y, 20, '#FFD700');
        audio.playWin();
        showToast('🌟 获得复活祝福！');
    }
}
