class Particle {
    constructor(x, y, color, type = 'normal') {
        this.x = x; this.y = y; this.color = color;
        this.type = type;
        this.size = Math.random() * 5 + 2;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 30;
        
        // Specialized particle behaviors
        if (type === 'snow') {
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = Math.random() * 2 + 1; // Fall down
            this.life = 120; // Longer life
            this.size = Math.random() * 4 + 2;
        } else if (type === 'ember') {
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = -(Math.random() * 2 + 1); // Float up
            this.life = 60;
            this.size = Math.random() * 6 + 2;
        } else if (type === 'leaf') {
            this.vx = (Math.random() - 0.5) * 3;
            this.vy = Math.random() * 1 + 1;
            this.life = 100;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.2;
        } else if (type === 'bubble') {
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = -(Math.random() * 2 + 1); // Float up
            this.life = 80;
            this.size = Math.random() * 6 + 2;
        } else if (type === 'dandelion') {
            this.vx = Math.random() * 2 + 1; // Float right
            this.vy = (Math.random() - 0.5) * 0.5;
            this.life = 120;
            this.size = Math.random() * 3 + 1;
        } else if (type === 'sparkle') {
            this.vx = 0;
            this.vy = 0;
            this.life = 40;
            this.size = Math.random() * 5 + 2;
        } else if (type === 'star') {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * (canvas.height - CONSTANTS.groundHeight);
            this.vx = -0.5; // Slow drift
            this.vy = 0;
            this.life = 1000; // Persist
            this.size = Math.random() * 3 + 1;
            this.twinkle = Math.random() * 0.1;
        }
    }
    
    update() { 
        this.x += this.vx; 
        this.y += this.vy; 
        this.life--; 
        
        if (this.type === 'leaf') {
            this.x += Math.sin(frames * 0.05) * 0.5; // Sway
            this.rotation += this.rotSpeed;
        }
        
        if (this.type === 'star') {
            if (this.x < 0) this.x = canvas.width;
            this.life = 1000; // Keep alive
        }
    }
    
    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        
        if (this.type === 'star') {
             ctx.globalAlpha = 0.5 + Math.sin(frames * 0.1 + this.x) * 0.4;
        } else {
             ctx.globalAlpha = Math.min(1, this.life / 30);
        }

        if (this.type === 'leaf') {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size/2, 0, 0, Math.PI*2);
            ctx.fill();
        } else if (this.type === 'dandelion') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            // Stem
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - 2, this.y + 5);
            ctx.stroke();
        } else if (this.type === 'bubble') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(this.x - this.size*0.3, this.y - this.size*0.3, this.size*0.2, 0, Math.PI*2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function createParticles(x, y, count, color, type = 'normal') {
    for(let i=0; i<count; i++) particles.push(new Particle(x, y, color, type));
}

function updateAtmosphere() {
    const config = LEVEL_CONFIGS[currentLevel - 1];
    if (!config) return; 
    
    const theme = config.theme;
    
    // Spawn particles based on theme
    if (gameState === 'PLAYING' || gameState === 'ENDLESS') {
        if (theme === 'snow' && Math.random() > 0.8) {
             atmosphereParticles.push(new Particle(Math.random() * canvas.width, -10, '#FFF', 'snow'));
        } else if (theme === 'volcano' && Math.random() > 0.8) {
             atmosphereParticles.push(new Particle(Math.random() * canvas.width, canvas.height, '#FF5722', 'ember'));
        } else if (theme === 'forest' && Math.random() > 0.9) {
             atmosphereParticles.push(new Particle(Math.random() * canvas.width, -10, '#81C784', 'leaf'));
        } else if (theme === 'beach' && Math.random() > 0.9) {
             atmosphereParticles.push(new Particle(Math.random() * canvas.width, canvas.height, '#B3E5FC', 'bubble'));
        } else if (theme === 'farm' && Math.random() > 0.9) {
             atmosphereParticles.push(new Particle(0, Math.random() * canvas.height, '#FFF', 'dandelion'));
        } else if (theme === 'rainbow' && Math.random() > 0.8) {
             atmosphereParticles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, '#FFD700', 'sparkle'));
        } else if (theme === 'space' && atmosphereParticles.length < 50) {
             atmosphereParticles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, '#FFF', 'star'));
        }
    }
    
    // Update existing
    for (let i = atmosphereParticles.length - 1; i >= 0; i--) {
        atmosphereParticles[i].update();
        if (atmosphereParticles[i].life <= 0) atmosphereParticles.splice(i, 1);
    }
}
