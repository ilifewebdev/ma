class TutorialManager {
    constructor() {
        this.active = false;
        this.hasShownJump = false;
        this.hasShownSlide = false;
        this.hasShownDoubleJump = false;
        
        // DOM Elements
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay hidden';
        this.overlay.innerHTML = `
            <div class="tutorial-finger">👆</div>
            <div class="tutorial-text">点击跳跃</div>
        `;
        document.getElementById('ui-layer').appendChild(this.overlay);
        
        this.finger = this.overlay.querySelector('.tutorial-finger');
        this.text = this.overlay.querySelector('.tutorial-text');
        
        this.hideTimer = 0;
    }
    
    reset() {
        this.hasShownJump = false;
        this.hasShownSlide = false;
        this.hasShownDoubleJump = false;
        this.hide();
    }
    
    show(type) {
        this.overlay.classList.remove('hidden');
        this.active = true;
        this.hideTimer = 120; // Show for 2 seconds
        
        if (type === 'jump') {
            this.finger.textContent = '👆';
            this.finger.style.animationName = 'tap';
            this.text.textContent = '点击跳跃';
        } else if (type === 'doubleJump') {
            this.finger.textContent = '👆👆';
            this.finger.style.animationName = 'tap'; 
            this.text.textContent = '空中再次点击';
        } else if (type === 'slide') {
            this.finger.textContent = '👇';
            this.finger.style.animationName = 'swipe-down';
            this.text.textContent = '下滑躲避';
        }
    }
    
    hide() {
        this.overlay.classList.add('hidden');
        this.active = false;
    }
    
    update() {
        if (currentLevel !== 1 || isEndless) return; // Only Level 1 Story Mode
        
        if (this.active) {
            this.hideTimer--;
            if (this.hideTimer <= 0) {
                this.hide();
            }
        }
        
        // Check nearest obstacle
        // Find obstacle ahead of player within 300px
        const nextObs = obstacles.find(o => o.x > player.x && o.x < player.x + 300);
        
        if (nextObs) {
            const dist = nextObs.x - player.x;
            
            // Logic for showing hints
            // Bee is flying (moveType 'fly') or high Y
            if (nextObs.moveType === 'fly' || nextObs.y < canvas.height - CONSTANTS.groundHeight - 50) {
                // High obstacle -> Slide
                if (!this.hasShownSlide && dist < 250) {
                    this.show('slide');
                    this.hasShownSlide = true;
                }
            } else {
                // Ground obstacle -> Jump
                if (!this.hasShownJump && dist < 200) {
                    this.show('jump');
                    this.hasShownJump = true;
                }
            }
        }
        
        // Double Jump hint: Show when falling from first jump if not shown yet
        // A bit arbitrary, but good for teaching mechanics
        if (player.isJumping && player.jumpCount === 1 && !this.hasShownDoubleJump && player.vy > -5) {
             // When upward velocity slows down, suggest double jump
             // But only if there is no immediate obstacle requiring a slide? 
             // Let's just show it once.
             this.show('doubleJump');
             this.hasShownDoubleJump = true;
        }
    }
}

const tutorial = new TutorialManager();
