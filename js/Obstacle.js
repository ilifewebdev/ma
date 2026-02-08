class Obstacle {
    constructor(allowedTypes) {
        this.typeId = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
        this.x = canvas.width;
        this.passed = false;
        
        const obsDef = this.getObstacleDef(this.typeId);
        this.width = obsDef.width;
        this.height = obsDef.height;
        this.emoji = obsDef.emoji;
        this.y = obsDef.y;
        
        // Movement properties
        this.moveType = obsDef.move; // 'fly' or undefined
        this.baseY = this.y;
        this.timeOffset = Math.random() * 100;
    }

    getObstacleDef(id) {
        const groundY = canvas.height - CONSTANTS.groundHeight;
        
        const defs = {
            // Meadow
            0: { w: 40, h: 40, e: '🐇', y: groundY - 40, move: 'hop' }, // Rabbit
            10: { w: 40, h: 40, e: '🐝', y: groundY - 120, move: 'fly' }, // Bee
            
            // Beach
            1: { w: 50, h: 30, e: '🦀', y: groundY - 30, move: 'hop' }, // Crab
            11: { w: 50, h: 40, e: '🕊️', y: groundY - 120, move: 'fly' }, // Seagull
            
            // Farm
            2: { w: 40, h: 40, e: '🐔', y: groundY - 40, move: 'hop' }, // Chicken
            12: { w: 40, h: 40, e: '🦅', y: groundY - 120, move: 'fly' }, // Crow
            
            // City
            3: { w: 50, h: 30, e: '🐁', y: groundY - 30, move: 'run' }, // Mouse
            13: { w: 50, h: 30, e: '🚁', y: groundY - 120, move: 'fly' }, // Drone
            
            // Desert
            4: { w: 50, h: 30, e: '🐍', y: groundY - 30, move: 'crawl' }, // Snake
            14: { w: 50, h: 40, e: '🦅', y: groundY - 120, move: 'fly' }, // Vulture
            
            // Snow
            5: { w: 40, h: 50, e: '🐧', y: groundY - 50, move: 'hop' }, // Penguin
            15: { w: 40, h: 40, e: '🦉', y: groundY - 120, move: 'fly' }, // Owl
            
            // Forest
            6: { w: 50, h: 40, e: '🐿️', y: groundY - 40, move: 'hop' }, // Squirrel
            16: { w: 50, h: 30, e: '🦇', y: groundY - 120, move: 'fly' }, // Bat
            
            // Volcano
            7: { w: 50, h: 40, e: '🦎', y: groundY - 40, move: 'crawl' }, // Lizard
            17: { w: 50, h: 40, e: '🔥', y: groundY - 120, move: 'fly' }, // Fireball
            
            // Space
            8: { w: 50, h: 50, e: '👾', y: groundY - 50, move: 'float' }, // Alien
            18: { w: 60, h: 30, e: '🛸', y: groundY - 120, move: 'fly' }, // UFO
            
            // Rainbow
            9: { w: 50, h: 30, e: '🐢', y: groundY - 30, move: 'crawl' }, // Turtle
            19: { w: 50, h: 50, e: '🦄', y: groundY - 120, move: 'fly' }, // Unicorn
        };
        
        const d = defs[id] || defs[0];
        return { width: d.w, height: d.h, emoji: d.e, y: d.y, move: d.move };
    }

    update() {
        this.x -= speed;
        
        if (this.moveType === 'fly') {
            this.y = this.baseY + Math.sin((frames + this.timeOffset) * 0.1) * 30;
        } else if (this.moveType === 'hop') {
            this.y = this.baseY - Math.abs(Math.sin((frames + this.timeOffset) * 0.15)) * 20;
        } else if (this.moveType === 'float') {
            this.y = this.baseY + Math.sin((frames + this.timeOffset) * 0.05) * 10;
        }
    }

    draw() {
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);
        
        if (this.moveType === 'crawl' || this.moveType === 'run') {
             ctx.rotate(Math.sin(frames * 0.2) * 0.1);
        }
        
        if (this.moveType === 'float') {
             ctx.rotate(Math.sin(frames * 0.05) * 0.1);
        }
        
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 5); 
        ctx.restore();
    }
}
