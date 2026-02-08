const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// State
let gameState = 'MAP'; // START, PLAYING, GAMEOVER, MAP, ENDLESS, PAUSED
let currentLevel = 1;
let maxUnlockedLevel = 1;
let isEndless = false;
let endlessBestScore = 0;
let frames = 0;
let score = 0;
let hearts = 3;
let speed = 5;
let obstacles = [];
let particles = [];
let powerups = [];
let atmosphereParticles = []; // Weather/Ambience particles
let gameLoopId;
let currentSkinIndex = 0;
let achievements = {}; // { id: boolean }
let coins = 0; // Current run coins
let totalCoins = 0; // Persistent coins
let coinsArray = []; // Coins on screen

let activeMagnet = 0; // Timer
let hasShield = false;
let hasRevive = false; 
let sizeState = 'normal'; // 'normal', 'big', 'small'
let sizeTimer = 0;

// User System
let currentUser = localStorage.getItem('ma_current_user');
let dailyRecords = {}; // { "YYYY-MM-DD": { distance: 0, runs: 0 } }

// Global instances
let bgLayers = [];
let boss = null;

// Audio Instance
const audio = new AudioController();

function loadProgress() {
    if (!currentUser) return;

    const dataStr = localStorage.getItem(`ma_data_${currentUser}`);
    if (dataStr) {
        const data = JSON.parse(dataStr);
        maxUnlockedLevel = data.maxUnlockedLevel || 1;
        endlessBestScore = data.endlessBestScore || 0;
        currentSkinIndex = data.currentSkinIndex || 0;
        totalCoins = data.totalCoins || 0;
        achievements = data.achievements || {};
        dailyRecords = data.dailyRecords || {};
        
        // Restore skin unlocks
        if (data.unlockedSkins) {
            SKINS.forEach((skin, i) => {
                if (data.unlockedSkins[i]) skin.unlocked = true;
            });
        }
    } else {
        // Reset for new user
        maxUnlockedLevel = 1;
        endlessBestScore = 0;
        currentSkinIndex = 0;
        totalCoins = 0;
        achievements = {};
        dailyRecords = {};
        SKINS.forEach(s => s.unlocked = (s.price === 0));
    }
}

function saveProgress() {
    if (!currentUser) return;

    const data = {
        maxUnlockedLevel,
        endlessBestScore,
        currentSkinIndex,
        totalCoins,
        achievements,
        dailyRecords,
        unlockedSkins: SKINS.map(s => s.unlocked)
    };
    
    localStorage.setItem(`ma_data_${currentUser}`, JSON.stringify(data));
}

function saveDailyRecord(dist, level) {
    const today = new Date().toLocaleDateString('zh-CN');
    if (!dailyRecords[today]) {
        dailyRecords[today] = { distance: 0, runs: 0, maxLevel: 0 };
    }
    
    dailyRecords[today].distance += Math.floor(dist);
    dailyRecords[today].runs += 1;
    
    if (level && level > (dailyRecords[today].maxLevel || 0)) {
        dailyRecords[today].maxLevel = level;
    }

    // Check Daily Achievements
    if (dailyRecords[today].distance >= 5000) {
        unlockAchievement('daily_marathon');
    }
    
    if (Object.keys(dailyRecords).length >= 3) {
        unlockAchievement('daily_3_days');
    }
    
    saveProgress();
}

function login(nickname) {
    if (!nickname) return false;
    currentUser = nickname;
    localStorage.setItem('ma_current_user', currentUser);
    loadProgress();
    return true;
}
