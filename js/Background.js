class BackgroundLayer {
    constructor(speedFactor, type, color) {
        this.speedFactor = speedFactor;
        this.type = type; 
        this.baseColor = color;
        this.items = [];
        this.generateItems();
    }
    
    generateItems() {
        const count = 5;
        // Clouds need fewer items, scattered high
        if (this.type === 'cloud' || this.type === 'planet') {
             for(let i=0; i<3; i++) {
                this.items.push({
                    x: i * (canvas.width / 2) + Math.random() * 200,
                    y: Math.random() * (canvas.height / 2), // Sky area
                    w: Math.random() * 100 + 60,
                    h: Math.random() * 40 + 30,
                    color: this.baseColor || '#FFF',
                    shape: this.type
                });
             }
             return;
        }

        for(let i=0; i<count; i++) {
            this.items.push({
                x: i * (canvas.width / 3) + Math.random() * 100,
                y: canvas.height - CONSTANTS.groundHeight, // Base Y
                w: Math.random() * 100 + 100,
                h: Math.random() * 100 + 50,
                color: this.baseColor || this.getColor(),
                shape: this.type
            });
        }
    }
    
    getColor() {
        if (this.type === 'mountain') return '#9FA8DA';
        if (this.type === 'city') return '#B0BEC5';
        if (this.type === 'forest') return '#A5D6A7';
        if (this.type === 'desert') return '#FFCC80';
        return '#EEE';
    }

    update(gameSpeed) {
        this.items.forEach(item => {
            item.x -= gameSpeed * this.speedFactor;
            
            // Loop logic
            let boundary = -200;
            
            if (item.x + item.w < boundary) {
                item.x += canvas.width + 400; // Loop back far
                
                // Randomize on respawn
                if (this.type === 'cloud') {
                     item.y = Math.random() * (canvas.height / 2);
                } else if (this.type !== 'planet') {
                     item.h = Math.random() * 100 + 50;
                }
            }
        });
    }

    draw() {
        this.items.forEach(item => {
            ctx.fillStyle = item.color;
            
            if (this.type === 'mountain' || this.type === 'pyramid') {
                ctx.beginPath();
                ctx.moveTo(item.x, item.y);
                ctx.lineTo(item.x + item.w/2, item.y - item.h);
                ctx.lineTo(item.x + item.w, item.y);
                ctx.fill();
            } else if (this.type === 'city' || this.type === 'barn') {
                ctx.fillRect(item.x, item.y - item.h, item.w * 0.8, item.h);
                
                if (this.type === 'barn') {
                     // Barn roof
                     ctx.beginPath();
                     ctx.moveTo(item.x, item.y - item.h);
                     ctx.lineTo(item.x + item.w*0.4, item.y - item.h - 30);
                     ctx.lineTo(item.x + item.w*0.8, item.y - item.h);
                     ctx.fill();
                } else {
                    // City Windows
                    ctx.fillStyle = 'rgba(255,255,255,0.5)';
                    for(let wy=10; wy<item.h; wy+=20) {
                        for(let wx=5; wx<item.w*0.8 - 10; wx+=15) {
                            if (Math.random() > 0.5) ctx.fillRect(item.x + wx, item.y - item.h + wy, 5, 10);
                        }
                    }
                }
            } else if (this.type === 'tree' || this.type === 'forest') {
                // Round trees
                ctx.beginPath();
                ctx.arc(item.x, item.y, item.w/2, 0, Math.PI, true);
                ctx.fill();
            } else if (this.type === 'pine') {
                // Pine tree (triangle stack)
                const trunkW = 20;
                const trunkH = 30;
                // Trunk
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(item.x + item.w/2 - trunkW/2, item.y - trunkH, trunkW, trunkH);
                // Leaves
                ctx.fillStyle = item.color;
                ctx.beginPath();
                ctx.moveTo(item.x, item.y - trunkH);
                ctx.lineTo(item.x + item.w/2, item.y - item.h - trunkH);
                ctx.lineTo(item.x + item.w, item.y - trunkH);
                ctx.fill();
            } else if (this.type === 'palm') {
                 // Palm tree
                 const trunkW = 15;
                 // Trunk
                 ctx.fillStyle = '#795548';
                 ctx.fillRect(item.x + item.w/2 - trunkW/2, item.y - item.h, trunkW, item.h);
                 // Leaves
                 ctx.fillStyle = item.color;
                 ctx.beginPath();
                 ctx.arc(item.x + item.w/2, item.y - item.h, 40, Math.PI, 0); 
                 ctx.fill();
            } else if (this.type === 'cloud') {
                ctx.beginPath();
                ctx.arc(item.x, item.y, 30, 0, Math.PI * 2);
                ctx.arc(item.x + 40, item.y, 40, 0, Math.PI * 2);
                ctx.arc(item.x + 80, item.y, 30, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'wave') {
                ctx.beginPath();
                ctx.arc(item.x, item.y + 20, item.w/2, Math.PI, 0); 
                ctx.fill();
            } else if (this.type === 'planet') {
                ctx.beginPath();
                ctx.arc(item.x, item.y, item.w/2, 0, Math.PI * 2);
                ctx.fill();
                // Ring
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.ellipse(item.x, item.y, item.w, item.w/3, 0.2, 0, Math.PI*2);
                ctx.stroke();
            } else if (this.type === 'ruin') {
                // Ruined building
                ctx.fillStyle = item.color;
                ctx.fillRect(item.x, item.y - item.h, item.w, item.h);
                // Windows (broken)
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                for(let wy=10; wy<item.h; wy+=30) {
                    if (Math.random() > 0.3) ctx.fillRect(item.x + 10, item.y - item.h + wy, 10, 15);
                    if (Math.random() > 0.3) ctx.fillRect(item.x + 30, item.y - item.h + wy, 10, 15);
                }
                // Damage
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.moveTo(item.x, item.y - item.h);
                ctx.lineTo(item.x + 15, item.y - item.h + 20);
                ctx.lineTo(item.x + 30, item.y - item.h);
                ctx.fill();
            }
        });
    }
}

function initBackgrounds(theme) {
    bgLayers = [];
    
    // Common: Clouds (except space)
    if (theme !== 'space') {
        bgLayers.push(new BackgroundLayer(0.1, 'cloud', 'rgba(255,255,255,0.6)'));
    }

    if (theme === 'meadow') {
        bgLayers.push(new BackgroundLayer(0.2, 'mountain', '#C5E1A5')); // Light Green Hills
        bgLayers.push(new BackgroundLayer(0.5, 'tree', '#7CB342')); // Darker Trees
    } else if (theme === 'beach') {
        bgLayers.push(new BackgroundLayer(0.1, 'cloud', '#FFF'));
        bgLayers.push(new BackgroundLayer(0.3, 'wave', '#4FC3F7')); // Waves
        bgLayers.push(new BackgroundLayer(0.5, 'palm', '#66BB6A')); // Palm Trees
    } else if (theme === 'farm') {
        bgLayers.push(new BackgroundLayer(0.2, 'mountain', '#D7CCC8')); // Brown Hills
        bgLayers.push(new BackgroundLayer(0.5, 'barn', '#A1887F')); // Barns
    } else if (theme === 'city') {
        bgLayers.push(new BackgroundLayer(0.2, 'city', '#90A4AE')); // Far buildings
        bgLayers.push(new BackgroundLayer(0.5, 'city', '#546E7A')); // Near buildings
    } else if (theme === 'desert') {
        bgLayers.push(new BackgroundLayer(0.2, 'pyramid', '#FFE0B2')); // Pyramids
        bgLayers.push(new BackgroundLayer(0.5, 'mountain', '#FFB74D')); // Dunes
    } else if (theme === 'snow') {
        bgLayers.push(new BackgroundLayer(0.2, 'mountain', '#E1F5FE')); // Snow mountains
        bgLayers.push(new BackgroundLayer(0.5, 'pine', '#00695C')); // Pine trees
    } else if (theme === 'forest') {
        bgLayers.push(new BackgroundLayer(0.2, 'pine', '#2E7D32')); // Far trees
        bgLayers.push(new BackgroundLayer(0.5, 'tree', '#1B5E20')); // Near bushes
    } else if (theme === 'volcano') {
        bgLayers.push(new BackgroundLayer(0.2, 'mountain', '#3E2723')); // Dark mountains
        bgLayers.push(new BackgroundLayer(0.5, 'mountain', '#BF360C')); // Lava peaks
    } else if (theme === 'space') {
        bgLayers.push(new BackgroundLayer(0.05, 'planet', '#311B92')); // Distant planets
        bgLayers.push(new BackgroundLayer(0.1, 'planet', '#673AB7')); // Closer planets
    } else if (theme === 'rainbow') {
        bgLayers.push(new BackgroundLayer(0.2, 'cloud', '#F8BBD0')); // Pink clouds
        bgLayers.push(new BackgroundLayer(0.5, 'cloud', '#E1BEE7')); // Purple clouds
    } else if (theme === 'zombie') {
        bgLayers.push(new BackgroundLayer(0.2, 'ruin', '#424242')); // Dark ruins
        bgLayers.push(new BackgroundLayer(0.5, 'ruin', '#616161')); // Closer ruins
    }
}

function drawBackground() {
    // Priority: global currentTheme > level config > default
    let themeKey = 'meadow';
    
    if (typeof window.currentTheme !== 'undefined') {
        themeKey = window.currentTheme;
    } else if (LEVEL_CONFIGS[currentLevel - 1]) {
        themeKey = LEVEL_CONFIGS[currentLevel - 1].theme;
    }
    
    // Sky Gradient
    let skyColor1 = '#87CEEB';
    let skyColor2 = '#E0F7FA';
    
    // Theme-specific Sky
    if (themeKey === 'meadow') {
        skyColor1 = '#4FC3F7'; skyColor2 = '#E1F5FE';
    } else if (themeKey === 'beach') {
        skyColor1 = '#29B6F6'; skyColor2 = '#B3E5FC';
    } else if (themeKey === 'farm') {
        skyColor1 = '#FFCC80'; skyColor2 = '#FFF3E0'; 
    } else if (themeKey === 'city') {
        skyColor1 = '#263238'; skyColor2 = '#546E7A'; 
    } else if (themeKey === 'desert') {
        skyColor1 = '#FF7043'; skyColor2 = '#FFAB91'; 
    } else if (themeKey === 'snow') {
        skyColor1 = '#B3E5FC'; skyColor2 = '#FFFFFF'; 
    } else if (themeKey === 'forest') {
        skyColor1 = '#1B5E20'; skyColor2 = '#4CAF50'; 
    } else if (themeKey === 'volcano') {
        skyColor1 = '#210000'; skyColor2 = '#BF360C'; 
    } else if (themeKey === 'space') {
        skyColor1 = '#000000'; skyColor2 = '#1A237E'; 
    } else if (themeKey === 'rainbow') {
        skyColor1 = '#F06292'; skyColor2 = '#F8BBD0'; 
    } else if (themeKey === 'zombie') {
        skyColor1 = '#212121'; skyColor2 = '#3E2723'; 
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, skyColor1); 
    gradient.addColorStop(1, skyColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (bgLayers && bgLayers.length > 0) {
         bgLayers.forEach(layer => layer.draw());
    } else {
        initBackgrounds(themeKey);
        bgLayers.forEach(layer => layer.draw());
    }
}
