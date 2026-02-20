// Persistence
function loadProgress() {
    const savedLevel = localStorage.getItem('horseGameLevel');
    if (savedLevel) {
        maxUnlockedLevel = parseInt(savedLevel, 10);
    } else {
        maxUnlockedLevel = 1;
    }
    
    const savedSkin = localStorage.getItem('horseGameSkin');
    if (savedSkin) {
        currentSkinIndex = parseInt(savedSkin, 10);
    }
    
    const savedEndless = localStorage.getItem('horseGameEndlessBest');
    if (savedEndless) endlessBestScore = parseInt(savedEndless, 10);
    
    const savedAch = localStorage.getItem('horseGameAchievements');
    if (savedAch) achievements = JSON.parse(savedAch);
    
    const savedCoins = localStorage.getItem('horseGameCoins');
    if (savedCoins) totalCoins = parseInt(savedCoins, 10);
    
    const savedUnlockedSkins = localStorage.getItem('horseGameUnlockedSkins');
    if (savedUnlockedSkins) {
        const unlockedIds = JSON.parse(savedUnlockedSkins);
        SKINS.forEach(skin => {
            if (unlockedIds.includes(skin.id)) {
                skin.unlocked = true;
            }
        });
    }
}

function saveProgress() {
    localStorage.setItem('horseGameLevel', maxUnlockedLevel);
    localStorage.setItem('horseGameSkin', currentSkinIndex);
    localStorage.setItem('horseGameEndlessBest', endlessBestScore);
    localStorage.setItem('horseGameAchievements', JSON.stringify(achievements));
    localStorage.setItem('horseGameCoins', totalCoins);
    
    const unlockedIds = SKINS.filter(s => s.unlocked).map(s => s.id);
    localStorage.setItem('horseGameUnlockedSkins', JSON.stringify(unlockedIds));
}

function unlockAchievement(id) {
    if (!achievements[id]) {
        achievements[id] = true;
        saveProgress();
        showToast(`🎉 解锁成就：${ACHIEVEMENT_DEFS.find(a=>a.id===id).title}`);
    }
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.position = 'absolute';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(0,0,0,0.8)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '20px';
    toast.style.zIndex = '1000';
    toast.style.animation = 'popIn 0.5s';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function triggerHaptic(type) {
    if (!navigator.vibrate) return;
    
    if (type === 'light') {
        navigator.vibrate(10); // Coin
    } else if (type === 'medium') {
        navigator.vibrate(30); // Jump
    } else if (type === 'heavy') {
        navigator.vibrate(100); // Hit
    }
}

function checkCollision(p, o) {
    const padding = 10;
    return (
        p.x + padding < o.x + o.width &&
        p.x + p.width - padding > o.x &&
        p.y + padding < o.y + o.height &&
        p.y + p.height - padding > o.y
    );
}

// Global drawing helper for vehicle wheels
function drawWheel(c, x, y, r, rotation, filled=false) {
    c.save();
    c.translate(x, y);
    c.rotate(rotation);
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI*2);
    if (filled) {
        c.fillStyle = '#333';
        c.fill();
        c.strokeStyle = '#555';
        c.lineWidth = 2;
        c.stroke();
        // Inner detail
        c.fillStyle = '#888';
        c.beginPath(); c.arc(0, 0, r/2, 0, Math.PI*2); c.fill();
    } else {
        c.stroke();
        // Spokes for bike
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(0, -r); c.lineTo(0, r);
        c.moveTo(-r, 0); c.lineTo(r, 0);
        c.stroke();
    }
    c.restore();
}
