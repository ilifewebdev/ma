class Coin {
    constructor() {
        this.x = canvas.width + Math.random() * 100; 
        const groundY = canvas.height - CONSTANTS.groundHeight;
        this.y = groundY - 30 - Math.random() * 100; 
        this.width = 30;
        this.height = 30;
        this.passed = false;
        
        this.vx = 0;
        this.vy = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Gold Coin
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(15, 15, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Shine
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(10, 10, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Symbol
        ctx.fillStyle = '#F57F17';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 15, 16);
        
        ctx.restore();
    }
    
    update() {
        if (activeMagnet > 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 400) { // Magnet range
                this.x += dx * 0.15;
                this.y += dy * 0.15;
            } else {
                this.x -= speed;
            }
        } else {
            this.x -= speed;
        }
    }
}
