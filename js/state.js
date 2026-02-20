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
let currentAccessoryIndex = 0;
let currentVehicleIndex = 0;
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
        currentAccessoryIndex = data.currentAccessoryIndex || 0;
        currentVehicleIndex = data.currentVehicleIndex || 0;
        totalCoins = data.totalCoins || 0;
        achievements = data.achievements || {};
        dailyRecords = data.dailyRecords || {};
        
        // Restore skin unlocks
        if (data.unlockedSkins) {
            // Check if it's new format (ID array) or old format (boolean array)
            if (data.unlockedSkins.length > 0 && typeof data.unlockedSkins[0] === 'string') {
                SKINS.forEach(skin => { if (data.unlockedSkins.includes(skin.id)) skin.unlocked = true; });
            } else {
                SKINS.forEach((skin, i) => { if (data.unlockedSkins[i]) skin.unlocked = true; });
            }
        }
        
        // Restore accessory unlocks
        if (data.unlockedAccessories) {
            // Force reset to default before applying save
            ACCESSORIES.forEach(a => a.unlocked = (a.price === 0));

            if (data.unlockedAccessories.length > 0 && typeof data.unlockedAccessories[0] === 'string') {
                ACCESSORIES.forEach(acc => { if (data.unlockedAccessories.includes(acc.id)) acc.unlocked = true; });
            } else {
                ACCESSORIES.forEach((acc, i) => { if (data.unlockedAccessories[i]) acc.unlocked = true; });
            }
        }

        // Restore vehicle unlocks
        if (data.unlockedVehicles) {
            VEHICLES.forEach(v => v.unlocked = (v.price === 0));
            
            if (data.unlockedVehicles.length > 0 && typeof data.unlockedVehicles[0] === 'string') {
                VEHICLES.forEach(v => { if (data.unlockedVehicles.includes(v.id)) v.unlocked = true; });
            } else {
                VEHICLES.forEach((v, i) => { if (data.unlockedVehicles[i]) v.unlocked = true; });
            }
        }

        // Restore Selection by ID (Robust) or Index (Legacy)
        if (data.currentSkinId) {
            const idx = SKINS.findIndex(s => s.id === data.currentSkinId);
            if (idx !== -1) currentSkinIndex = idx;
        } else {
            currentSkinIndex = data.currentSkinIndex || 0;
        }

        if (data.currentAccessoryId) {
            const idx = ACCESSORIES.findIndex(a => a.id === data.currentAccessoryId);
            if (idx !== -1) currentAccessoryIndex = idx;
        } else {
            currentAccessoryIndex = data.currentAccessoryIndex || 0;
        }

        if (data.currentVehicleId) {
            const idx = VEHICLES.findIndex(v => v.id === data.currentVehicleId);
            if (idx !== -1) currentVehicleIndex = idx;
        } else {
            currentVehicleIndex = data.currentVehicleIndex || 0;
        }

    } else {
        // Reset for new user
        maxUnlockedLevel = 1;
        endlessBestScore = 0;
        currentSkinIndex = 0;
        currentAccessoryIndex = 0;
        currentVehicleIndex = 0;
        totalCoins = 0;
        achievements = {};
        dailyRecords = {};
        // Default unlocks
        SKINS.forEach(s => s.unlocked = (s.price === 0));
        ACCESSORIES.forEach(a => a.unlocked = (a.price === 0));
        VEHICLES.forEach(v => v.unlocked = (v.price === 0));
    }
}

function saveProgress() {
    if (!currentUser) return;

    // Helper to get unlocked IDs
    const getUnlockedIds = (items) => items.filter(i => i.unlocked).map(i => i.id);

    const data = {
        maxUnlockedLevel,
        endlessBestScore,
        currentSkinIndex,
        currentAccessoryIndex,
        currentVehicleIndex,
        // Save IDs for robust selection restoration
        currentSkinId: SKINS[currentSkinIndex] ? SKINS[currentSkinIndex].id : null,
        currentAccessoryId: ACCESSORIES[currentAccessoryIndex] ? ACCESSORIES[currentAccessoryIndex].id : null,
        currentVehicleId: VEHICLES[currentVehicleIndex] ? VEHICLES[currentVehicleIndex].id : null,
        
        totalCoins,
        achievements,
        dailyRecords,
        // Save ID array of unlocked items (Robust against reordering)
        unlockedSkins: getUnlockedIds(SKINS),
        unlockedAccessories: getUnlockedIds(ACCESSORIES),
        unlockedVehicles: getUnlockedIds(VEHICLES)
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

// Auto-load on startup if user exists
if (currentUser) {
    loadProgress();
}
