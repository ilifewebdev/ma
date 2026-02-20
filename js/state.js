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
let currentPetIndex = 0;
let achievements = {}; // { id: boolean }
let coins = 0; // Current run coins
let totalCoins = 10000; // Persistent coins
let coinsArray = []; // Coins on screen

// Daily Mission System
let dailyMissions = {
    date: '',
    missions: [] // { id, desc, target, current, reward, claimed }
};

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
        currentPetIndex = data.currentPetIndex || 0;
        
        // Fix: Use data.totalCoins if exists, otherwise 0
        totalCoins = (data.totalCoins !== undefined) ? data.totalCoins : 0;
        
        // 💰 FORCE GIVE 10000 COINS (Cheat Mode)
        if (totalCoins < 10000) {
            totalCoins = 10000;
            saveProgress(); // Save immediately
        }
        
        achievements = data.achievements || {};
        dailyRecords = data.dailyRecords || {};
        dailyMissions = data.dailyMissions || { date: '', missions: [] };
        
        checkDailyMissions(); // Ensure missions exist for today
        
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

        // Restore pet unlocks
        if (data.unlockedPets) {
            PETS.forEach(p => p.unlocked = (p.price === 0));
            if (data.unlockedPets.length > 0 && typeof data.unlockedPets[0] === 'string') {
                PETS.forEach(p => { if (data.unlockedPets.includes(p.id)) p.unlocked = true; });
            } else {
                PETS.forEach((p, i) => { if (data.unlockedPets[i]) p.unlocked = true; });
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

        if (data.currentPetId) {
            const idx = PETS.findIndex(p => p.id === data.currentPetId);
            if (idx !== -1) currentPetIndex = idx;
        } else {
            currentPetIndex = data.currentPetIndex || 0;
        }

    } else {
        // Reset for new user
        maxUnlockedLevel = 1;
        endlessBestScore = 0;
        currentSkinIndex = 0;
        currentAccessoryIndex = 0;
        currentVehicleIndex = 0;
        currentPetIndex = 0;
        totalCoins = 10000; // Start with 10000 coins
        achievements = {};
        dailyRecords = {};
        dailyMissions = { date: '', missions: [] };
        checkDailyMissions();
        
        // Default unlocks
        SKINS.forEach(s => s.unlocked = (s.price === 0));
        ACCESSORIES.forEach(a => a.unlocked = (a.price === 0));
        VEHICLES.forEach(v => v.unlocked = (v.price === 0));
        PETS.forEach(p => p.unlocked = (p.price === 0));
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
        currentPetIndex,
        // Save IDs for robust selection restoration
        currentSkinId: SKINS[currentSkinIndex] ? SKINS[currentSkinIndex].id : null,
        currentAccessoryId: ACCESSORIES[currentAccessoryIndex] ? ACCESSORIES[currentAccessoryIndex].id : null,
        currentVehicleId: VEHICLES[currentVehicleIndex] ? VEHICLES[currentVehicleIndex].id : null,
        currentPetId: PETS[currentPetIndex] ? PETS[currentPetIndex].id : null,
        
        totalCoins,
        achievements,
        dailyRecords,
        dailyMissions,
        // Save ID array of unlocked items (Robust against reordering)
        unlockedSkins: getUnlockedIds(SKINS),
        unlockedAccessories: getUnlockedIds(ACCESSORIES),
        unlockedVehicles: getUnlockedIds(VEHICLES),
        unlockedPets: getUnlockedIds(PETS)
    };
    
    localStorage.setItem(`ma_data_${currentUser}`, JSON.stringify(data));
}

function checkDailyMissions() {
    const today = new Date().toLocaleDateString('zh-CN');
    
    if (dailyMissions.date !== today) {
        // Generate new missions
        dailyMissions.date = today;
        dailyMissions.missions = generateMissions();
    }
}

function generateMissions() {
    const templates = [
        { id: 'collect_coins', desc: '单局收集 {N} 金币', base: 50, step: 50, reward: 100 },
        { id: 'distance', desc: '累计奔跑 {N} 米', base: 1000, step: 500, reward: 150 },
        { id: 'jump', desc: '跳跃 {N} 次', base: 50, step: 20, reward: 80 },
        { id: 'play_level', desc: '完成 {N} 次关卡', base: 3, step: 1, reward: 200 }
    ];
    
    let missions = [];
    // Pick 3 random missions
    const shuffled = templates.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    shuffled.forEach(t => {
        const factor = Math.floor(Math.random() * 3) + 1; // 1 to 3 difficulty
        const target = t.base * factor;
        const reward = t.reward * factor;
        
        missions.push({
            id: t.id,
            desc: t.desc.replace('{N}', target),
            target: target,
            current: 0,
            reward: reward,
            claimed: false
        });
    });
    
    return missions;
}

function updateMissions(type, value) {
    let changed = false;
    dailyMissions.missions.forEach(m => {
        if (!m.claimed && m.current < m.target) {
            if (type === 'coins' && m.id === 'collect_coins') {
                 // For single run coins, we check if current run coins > target? 
                 // Or cumulative? Description says "Single Run" usually implies one go.
                 // But let's make it cumulative for easier implementation unless specified.
                 // "单局" means single run.
                 if (value >= m.target) {
                     m.current = value;
                     changed = true;
                     showToast(`✅ 任务完成：${m.desc}`);
                 }
            } else if (type === 'distance' && m.id === 'distance') {
                m.current += value;
                if (m.current >= m.target && !m.completed) {
                    showToast(`✅ 任务完成：${m.desc}`);
                }
                changed = true;
            } else if (type === 'jump' && m.id === 'jump') {
                m.current += value;
                if (m.current >= m.target && !m.completed) {
                     showToast(`✅ 任务完成：${m.desc}`);
                }
                changed = true;
            } else if (type === 'play' && m.id === 'play_level') {
                m.current += value;
                if (m.current >= m.target && !m.completed) {
                     showToast(`✅ 任务完成：${m.desc}`);
                }
                changed = true;
            }
        }
    });
    
    if (changed) saveProgress();
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
    
    // Update Daily Mission: Distance
    dailyMissions.missions.forEach(m => {
        if (!m.claimed && m.id === 'distance') {
             m.current += Math.floor(dist);
             if (m.current >= m.target) showToast('✅ 任务完成！');
        } else if (!m.claimed && m.id === 'play_level') {
             m.current += 1;
             if (m.current >= m.target) showToast('✅ 任务完成！');
        } else if (!m.claimed && m.id === 'collect_coins') {
            // Check max single run coins
            // Assuming dist here is end of level, check global 'coins' variable
             if (coins >= m.target) {
                 m.current = coins;
                 showToast('✅ 任务完成！');
             }
        }
    });

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
