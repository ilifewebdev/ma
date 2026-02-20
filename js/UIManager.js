// UI Elements
const uiLayer = document.getElementById('ui-layer');
const startScreen = document.getElementById('start-screen');
const mapScreen = document.getElementById('level-map-screen'); 
const hud = document.getElementById('hud');
const gameOverScreen = document.getElementById('game-over-screen');
const heartsSpan = document.getElementById('hearts');
const distanceSpan = document.getElementById('distance');
const levelSpan = document.getElementById('level-num');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const nextLevelBtn = document.getElementById('next-level-btn');
const returnMapBtn = document.getElementById('return-map-btn'); 
const backMapBtn = document.getElementById('back-map-btn'); 
const skinBtn = document.getElementById('skin-btn');
const skinBtnMap = document.getElementById('skin-btn-map'); 
const finalDistanceSpan = document.getElementById('final-distance');
const finalHeartsSpan = document.getElementById('final-hearts');
const titleDisplay = document.getElementById('title-display');
const titleText = document.querySelector('.title-text');
const levelTitle = document.getElementById('level-title');
const levelGrid = document.getElementById('level-grid'); 

const endlessBtn = document.getElementById('endless-btn');
const achievementsBtn = document.getElementById('achievements-btn');
const achievementsScreen = document.getElementById('achievements-screen');
const achievementsList = document.getElementById('achievements-list');
const closeAchievementsBtn = document.getElementById('close-achievements-btn');
const missionsBtn = document.getElementById('missions-btn');
const missionsScreen = document.getElementById('missions-screen');
const missionsList = document.getElementById('missions-list');
const closeMissionsBtn = document.getElementById('close-missions-btn');

const helpBtn = document.getElementById('help-btn');
const helpScreen = document.getElementById('help-screen');
const closeHelpBtn = document.getElementById('close-help-btn');
const bgmBtn = document.getElementById('bgm-btn');
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const exitBtn = document.getElementById('exit-btn');

const shopBtn = document.getElementById('shop-btn');
const shopScreen = document.getElementById('shop-screen');
const closeShopBtn = document.getElementById('close-shop-btn');
const shopGrid = document.getElementById('shop-grid');
const shopCoinCount = document.getElementById('shop-coin-count');
const hudCoinCount = document.getElementById('hud-coin-count');

// Share UI
const shareBtn = document.getElementById('share-btn');
const shareScreen = document.getElementById('share-screen');
const closeShareBtn = document.getElementById('close-share-btn');
const shareImg = document.getElementById('share-img');

// Calendar UI
const calendarBtn = document.getElementById('calendar-btn');
const calendarScreen = document.getElementById('calendar-screen');
const closeCalendarBtn = document.getElementById('close-calendar-btn');
const calendarMonth = document.getElementById('calendar-month');
const calendarGrid = document.getElementById('calendar-grid');
const dailyStats = document.getElementById('daily-stats');

// Login UI
const loginScreen = document.getElementById('login-screen');
const loginBtn = document.getElementById('login-btn');
const nicknameInput = document.getElementById('nickname-input');

let shopTab = 'skins'; // 'skins' or 'accessories'

// Shop Tabs
    document.getElementById('tab-skins').addEventListener('click', () => {
        shopTab = 'skins';
        updateShopTabs();
        showShop();
    });
    document.getElementById('tab-accessories').addEventListener('click', () => {
        shopTab = 'accessories';
        updateShopTabs();
        showShop();
    });
    document.getElementById('tab-vehicles').addEventListener('click', () => {
        shopTab = 'vehicles';
        updateShopTabs();
        showShop();
    });
    document.getElementById('tab-pets').addEventListener('click', () => {
        shopTab = 'pets';
        updateShopTabs();
        showShop();
    });

// Share Button
if (shareBtn) {
    shareBtn.addEventListener('click', showShare);
}

updateMissionUI();
    // Daily Mission UI
    /* Removed old overlay UI
    const missionContainer = document.createElement('div');
    missionContainer.id = 'daily-missions';
    missionContainer.style = 'position: absolute; top: 60px; right: 10px; background: rgba(255,255,255,0.9); padding: 10px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); max-width: 200px; font-size: 12px; z-index: 100;';
    
    // Only show on Map
    
    document.getElementById('game-container').appendChild(missionContainer);
    
    updateMissionUI();
    */

    if (shopBtn) shopBtn.addEventListener('click', showShop);
if (closeShopBtn) closeShopBtn.addEventListener('click', () => {
    shopScreen.classList.add('hidden');
    audio.playClick();
});

// Add Clear Save Button Logic
const resetSaveBtn = document.getElementById('reset-save-btn');
if (resetSaveBtn) {
    resetSaveBtn.addEventListener('click', () => {
        if (confirm('⚠️ 确定要清除所有存档吗？\n这将删除你的金币、解锁物品和通关记录。\n操作不可撤销！')) {
            localStorage.removeItem(`ma_data_${currentUser}`);
            localStorage.removeItem('ma_current_user');
            location.reload();
        }
    });
}

// Add Money Button Logic
const addMoneyBtn = document.getElementById('add-money-btn');
if (addMoneyBtn) {
    addMoneyBtn.addEventListener('click', () => {
        totalCoins += 10000;
        saveProgress();
        
        // Visual feedback
        audio.playWin();
        if (shopCoinCount) shopCoinCount.textContent = totalCoins;
        showToast('💰 获得 10000 金币！');
        
        // Refresh shop if open
        if (!shopScreen.classList.contains('hidden')) {
            showShop();
        }
    });
}

if (achievementsBtn) achievementsBtn.addEventListener('click', showAchievements);
if (closeAchievementsBtn) closeAchievementsBtn.addEventListener('click', () => {
    achievementsScreen.classList.add('hidden');
    audio.playClick();
});

if (missionsBtn) missionsBtn.addEventListener('click', showMissions);
if (closeMissionsBtn) closeMissionsBtn.addEventListener('click', () => {
    missionsScreen.classList.add('hidden');
    audio.playClick();
});

function updateHUD() {
    const levelContainer = document.querySelector('.level-container');
    
    if (isEndless) {
        levelContainer.innerHTML = '♾️ 无尽模式';
        distanceSpan.textContent = `${Math.floor(score)}`;
    } else {
        levelContainer.innerHTML = `第 <span id="level-num">${currentLevel}</span> 关`;
        distanceSpan.textContent = `${Math.floor(score)} / ${LEVEL_CONFIGS[currentLevel-1].target}`;
    }
    
    heartsSpan.textContent = '❤️'.repeat(Math.max(0, hearts));
    if (hudCoinCount) hudCoinCount.textContent = coins;
}

function updateSkinButtons() {
    if (shopCoinCount) shopCoinCount.textContent = totalCoins;
    if (hudCoinCount) hudCoinCount.textContent = coins;
    
    if(bgmBtn) bgmBtn.textContent = audio.bgmEnabled ? '🎵 音乐' : '🎵 静音';
}

function updateShopTabs() {
    const tabSkins = document.getElementById('tab-skins');
    const tabAccessories = document.getElementById('tab-accessories');
    const tabVehicles = document.getElementById('tab-vehicles');
const tabPets = document.getElementById('tab-pets');

// Reset all
tabSkins.className = 'btn small-btn secondary-btn';
tabAccessories.className = 'btn small-btn secondary-btn';
tabVehicles.className = 'btn small-btn secondary-btn';
tabPets.className = 'btn small-btn secondary-btn';

// Active one
    if (shopTab === 'skins') {
        tabSkins.classList.remove('secondary-btn');
        tabSkins.classList.add('primary-btn');
    } else if (shopTab === 'accessories') {
        tabAccessories.classList.remove('secondary-btn');
        tabAccessories.classList.add('primary-btn');
    } else if (shopTab === 'vehicles') {
        tabVehicles.classList.remove('secondary-btn');
        tabVehicles.classList.add('primary-btn');
    } else if (shopTab === 'pets') {
        tabPets.classList.remove('secondary-btn');
        tabPets.classList.add('primary-btn');
    }
}

function updateMissionUI() {
    // Check if tasks available for button badge
    const badge = document.getElementById('mission-badge');
    let hasClaimable = false;
    
    dailyMissions.missions.forEach(m => {
        if (!m.claimed && m.current >= m.target) hasClaimable = true;
    });
    
    if (missionsBtn) {
        if (hasClaimable) {
            missionsBtn.style.border = '2px solid #FFD700';
            missionsBtn.innerHTML = '🎯 任务 <span style="color: #FFD700;">●</span>';
        } else {
            missionsBtn.style.border = '';
            missionsBtn.innerHTML = '🎯 任务';
        }
    }
}

// Hook into showMap to update UI
const originalShowMap = showMap;
showMap = function() {
    originalShowMap();
    updateMissionUI();
};

function showShop() {
    shopScreen.classList.remove('hidden');
    shopGrid.innerHTML = '';
    
    shopCoinCount.textContent = totalCoins;
    
    // Update Tabs UI
    updateShopTabs();

    let items = SKINS;
    let currentIndex = currentSkinIndex;
    
    if (shopTab === 'accessories') {
        items = ACCESSORIES;
        currentIndex = currentAccessoryIndex;
    } else if (shopTab === 'vehicles') {
        items = VEHICLES;
        currentIndex = currentVehicleIndex;
    } else if (shopTab === 'pets') {
        items = PETS;
        currentIndex = currentPetIndex;
    }
    
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `shop-item ${index === currentIndex ? 'selected' : ''} ${!item.unlocked ? 'locked' : ''}`;
        
        const preview = document.createElement('div');
        preview.className = 'shop-preview';
        
        if (shopTab === 'skins') {
            preview.innerHTML = `
                <div style="width: 30px; height: 30px; background: ${item.body}; border-radius: 50%; border: 2px solid ${item.mane}; position: relative;">
                    ${item.horn ? '<div style="position: absolute; top: -10px; left: 10px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 15px solid #FFD700;"></div>' : ''}
                </div>
            `;
        } else {
            // Accessories & Vehicles & Pets icon
            preview.innerHTML = `<div style="font-size: 30px;">${item.icon || '📦'}</div>`;
        }
        
        const info = document.createElement('div');
        info.className = 'shop-info';
        info.innerHTML = `
            <div class="shop-name">${item.name}</div>
            <div class="shop-desc" style="font-size: 12px; color: #666; margin: 4px 0;">${item.desc}</div>
        `;
        
        if (item.trait) {
             info.innerHTML += `<div class="shop-trait" style="font-size: 12px; color: #E91E63; font-weight: bold;">✨ ${item.trait}</div>`;
        }
        if (item.speedBonus) {
             info.innerHTML += `<div class="shop-trait" style="font-size: 12px; color: #2196F3; font-weight: bold;">⚡ 速度 +${item.speedBonus}</div>`;
        }
        if (item.type && item.type !== 'none') {
             info.innerHTML += `<div class="shop-trait" style="font-size: 12px; color: #4CAF50; font-weight: bold;">🐾 宠物技能</div>`;
        }
        
        const btn = document.createElement('button');
        btn.className = 'shop-btn';
        
        if (index === currentIndex) {
            btn.textContent = '使用中';
            btn.disabled = true;
            btn.classList.add('btn-select');
        } else if (item.unlocked) {
            btn.textContent = '选择';
            btn.classList.add('btn-select');
            btn.onclick = () => {
                if (shopTab === 'skins') currentSkinIndex = index;
                else if (shopTab === 'accessories') currentAccessoryIndex = index;
                else if (shopTab === 'vehicles') currentVehicleIndex = index;
                else currentPetIndex = index;
                
                saveProgress();
                audio.playClick();
                showShop(); 
            };
        } else {
            info.innerHTML += `<div class="shop-price">🪙 ${item.price}</div>`;
            btn.textContent = '购买';
            btn.classList.add('btn-buy');
            if (totalCoins >= item.price) {
                btn.onclick = () => {
                    totalCoins -= item.price;
                    item.unlocked = true;
                    if (shopTab === 'skins') currentSkinIndex = index;
                    else if (shopTab === 'accessories') currentAccessoryIndex = index;
                    else if (shopTab === 'vehicles') currentVehicleIndex = index;
                    else currentPetIndex = index;
                    
                    saveProgress();
                    audio.playWin(); 
                    showShop(); 
                };
            } else {
                btn.disabled = true;
                btn.style.opacity = 0.5;
            }
        }
        
        div.appendChild(preview);
        div.appendChild(info);
        div.appendChild(btn);
        shopGrid.appendChild(div);
    });
    
    audio.playClick();
}

function changeSkin() {
    currentSkinIndex = (currentSkinIndex + 1) % SKINS.length;
    saveProgress();
    audio.playClick();
    updateSkinButtons();
}

function togglePause() {
    if (gameState === 'PLAYING' || gameState === 'ENDLESS') {
        gameState = 'PAUSED';
        pauseScreen.classList.remove('hidden');
        audio.stopBGM(); 
    } else if (gameState === 'PAUSED') {
        gameState = isEndless ? 'ENDLESS' : 'PLAYING';
        pauseScreen.classList.add('hidden');
        audio.startBGM(); 
        gameLoop(); 
    }
    audio.playClick();
}

function showAchievements() {
    achievementsScreen.classList.remove('hidden');
    achievementsList.innerHTML = '';
    
    ACHIEVEMENT_DEFS.forEach(ach => {
        const div = document.createElement('div');
        div.className = `achievement-item ${achievements[ach.id] ? 'unlocked' : ''}`;
        div.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">${ach.title}</div>
                <div class="achievement-desc">${ach.desc}</div>
            </div>
        `;
        achievementsList.appendChild(div);
    });
    audio.playClick();
}

function showMissions() {
    missionsScreen.classList.remove('hidden');
    missionsList.innerHTML = '';
    
    dailyMissions.missions.forEach(m => {
        const div = document.createElement('div');
        // Use achievements style for consistency but slightly modified for tasks
        div.className = 'achievement-item'; 
        div.style.alignItems = 'center'; // Vertical align
        div.style.padding = '12px'; // More padding
        
        const isComplete = m.current >= m.target;
        const progressPercent = Math.min(100, Math.floor((m.current / m.target) * 100));
        
        div.innerHTML = `
            <div class="achievement-icon" style="background: ${isComplete ? '#4CAF50' : '#E0E0E0'}; color: white; width: 50px; height: 50px; font-size: 24px; flex-shrink: 0; margin-right: 15px;">
                ${isComplete ? '✅' : '🎯'}
            </div>
            <div class="achievement-info" style="flex: 1; min-width: 0;">
                <div class="achievement-title" style="font-size: 16px; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.desc}</div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 12px; color: #666;">进度: ${Math.min(m.current, m.target)}/${m.target}</span>
                    <span style="font-size: 13px; color: #FF9800; font-weight: bold;">🪙 +${m.reward}</span>
                </div>
                
                <div style="width: 100%; height: 8px; background: #EEE; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${progressPercent}%; height: 100%; background: ${isComplete ? '#4CAF50' : '#2196F3'}; transition: width 0.3s;"></div>
                </div>
            </div>
        `;
        
        const actionDiv = document.createElement('div');
        actionDiv.style.marginLeft = '15px';
        actionDiv.style.flexShrink = '0';
        
        if (isComplete && !m.claimed) {
            const btn = document.createElement('button');
            btn.textContent = '领取';
            btn.className = 'btn small-btn primary-btn';
            btn.style = 'background: #FFD700; color: #333; padding: 8px 20px; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border: none;';
            btn.onclick = () => {
                m.claimed = true;
                totalCoins += m.reward;
                saveProgress();
                audio.playWin();
                showMissions(); // Refresh list
                updateMissionUI(); // Refresh badge
                if (document.getElementById('shop-coin-count')) document.getElementById('shop-coin-count').textContent = totalCoins;
            };
            actionDiv.appendChild(btn);
        } else if (m.claimed) {
             div.classList.add('unlocked'); // Dim it
             actionDiv.innerHTML = `<span style="color: #4CAF50; font-weight: bold; font-size: 24px;">✓</span>`;
        } else {
             actionDiv.innerHTML = `<span style="color: #999; font-size: 12px; white-space: nowrap;">进行中</span>`;
        }
        
        div.appendChild(actionDiv);
        missionsList.appendChild(div);
    });
    
    audio.playClick();
}

function startEndlessMode() {
    if (maxUnlockedLevel <= 1 && endlessBestScore === 0) return; 
    
    isEndless = true;
    
    // Initialize endless mode index globally
    window.currentEndlessLevelIndex = Math.floor(Math.random() * LEVEL_CONFIGS.length);
    const randomTheme = LEVEL_CONFIGS[window.currentEndlessLevelIndex].theme;
    
    currentLevel = 1; 
    
    applyTheme(randomTheme);
    initBackgrounds(randomTheme);
    
    mapScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
    const title = document.querySelector('.game-title');
    title.textContent = `♾️ 快乐无限跑`;
    startBtn.textContent = '开始无限挑战';
    
    const levelContainer = document.querySelector('.level-container');
    if (levelContainer) levelContainer.innerHTML = '♾️ 无尽模式';
}

function showMap() {
    gameState = 'MAP';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.add('hidden');
    mapScreen.classList.remove('hidden');
    achievementsScreen.classList.add('hidden'); 
    missionsScreen.classList.add('hidden');
    helpScreen.classList.add('hidden'); 
    calendarScreen.classList.add('hidden');
    loginScreen.classList.add('hidden');
    
    // Welcome message
    const title = document.querySelector('.map-title');
    title.textContent = `🏰 ${currentUser} 的小马王国`;

    if (maxUnlockedLevel > 1 || endlessBestScore > 0) {
        endlessBtn.classList.remove('locked-mode');
        endlessBtn.onclick = startEndlessMode; 
    } else {
        endlessBtn.classList.add('locked-mode');
        endlessBtn.onclick = () => { };
    }
    
    levelGrid.innerHTML = '';
    LEVEL_CONFIGS.forEach((config) => {
        const btn = document.createElement('button');
        btn.classList.add('level-btn');
        
        // Scene preview background
        const preview = document.createElement('div');
        preview.className = 'level-scene-preview';
        
        // Set color based on theme
        const themeColors = THEME_COLORS[config.theme] || THEME_COLORS['meadow'];
        preview.style.background = `linear-gradient(to bottom, ${themeColors.sky} 0%, ${themeColors.ground} 100%)`;
        
        const numSpan = document.createElement('span');
        numSpan.classList.add('level-num');
        numSpan.textContent = config.level;
        
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('level-icon');
        iconSpan.textContent = config.icon;
        
        btn.appendChild(preview);
        btn.appendChild(numSpan);
        btn.appendChild(iconSpan);
        
        if (config.level <= maxUnlockedLevel) {
            btn.classList.add('unlocked');
            if (config.level < maxUnlockedLevel) {
                btn.classList.add('completed');
                
                // Add star for completed levels
                const star = document.createElement('div');
                star.textContent = '⭐';
                star.style.position = 'absolute';
                star.style.bottom = '2px';
                star.style.right = '2px';
                star.style.fontSize = '12px';
                star.style.zIndex = '2';
                btn.appendChild(star);
            }
            btn.onclick = () => {
                audio.playClick();
                isEndless = false;
                prepareLevel(config.level);
            };
        } else {
            btn.classList.add('locked');
            preview.style.filter = 'grayscale(1) brightness(0.7)'; // Dim preview for locked
            btn.onclick = () => {
                // Shake animation or sound for locked?
            };
        }
        levelGrid.appendChild(btn);
    });
    
    applyTheme('meadow');
    initBackgrounds('meadow');
}

function prepareLevel(level) {
    currentLevel = level;
    mapScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
    const title = document.querySelector('.game-title');
    title.textContent = `第 ${currentLevel} 关`;
    startBtn.textContent = '开始挑战';
    
    const config = LEVEL_CONFIGS[currentLevel - 1];
    applyTheme(config.theme);
    
    drawStartScreenPreview();
}

function drawStartScreenPreview() {
    frames++; 
    draw(); 
    
    player.x = canvas.width / 2 - 25; 
    player.y = canvas.height - CONSTANTS.groundHeight - 50;
    
    player.isJumping = false;
    player.isSliding = false;
    
    draw();
}

function applyTheme(theme) {
    const container = document.getElementById('game-container');
    container.className = ''; 
    container.classList.add(`theme-${theme}`);
}

function levelComplete() {
    gameState = 'GAMEOVER';
    audio.playWin();
    
    totalCoins += coins;

    if (currentLevel === maxUnlockedLevel && currentLevel < 11) {
        maxUnlockedLevel = currentLevel + 1;
    }
    
    saveProgress(); 
    saveDailyRecord(score);
    
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    finalDistanceSpan.textContent = Math.floor(score);
    finalHeartsSpan.textContent = '❤️'.repeat(Math.max(0, hearts));
    
    const resultTitle = document.getElementById('result-title');
    const resultMsg = document.getElementById('result-msg');
    
    resultTitle.textContent = `🏆 第 ${currentLevel} 关完成！`;
    resultMsg.textContent = '太棒了！你的小马是冠军！';
    
    restartBtn.textContent = '🐎 再试一次';
    restartBtn.classList.remove('primary-btn');
    restartBtn.classList.add('secondary-btn');
    
    if (currentLevel < 11) {
        nextLevelBtn.classList.remove('hidden');
        nextLevelBtn.textContent = `➡️ 下一关`;
    } else {
        nextLevelBtn.classList.add('hidden');
        resultMsg.textContent = '🎉 恭喜你通关了所有关卡！ 🎉';
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    audio.playHit();
    triggerHaptic('heavy');
    
    totalCoins += coins;
    saveProgress();
    saveDailyRecord(score);
    
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    finalDistanceSpan.textContent = Math.floor(score);
    finalHeartsSpan.textContent = '❤️'.repeat(Math.max(0, hearts));
    
    const resultTitle = document.getElementById('result-title');
    const resultMsg = document.getElementById('result-msg');
    
    resultTitle.textContent = '😢 跑累了...';
    resultMsg.textContent = '不要灰心，再试一次吧！';
    
    nextLevelBtn.classList.add('hidden');
    restartBtn.textContent = '🐎 再跑一次';
    restartBtn.classList.add('primary-btn');
    restartBtn.classList.remove('secondary-btn');
}

function generateShareImage() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 600;
    tempCanvas.height = 800;
    const tCtx = tempCanvas.getContext('2d');
    
    // 1. Determine Theme
    let theme = 'meadow';
    if (isEndless) {
        theme = 'rainbow'; 
    } else {
        const config = LEVEL_CONFIGS[currentLevel - 1];
        if (config) theme = config.theme;
    }
    const colors = THEME_COLORS[theme] || THEME_COLORS['meadow'];
    
    // 2. Draw Background
    const gradient = tCtx.createLinearGradient(0, 0, 0, tempCanvas.height);
    if (theme === 'space') {
        gradient.addColorStop(0, '#1A237E');
        gradient.addColorStop(1, '#4527A0');
    } else if (theme === 'volcano') {
         gradient.addColorStop(0, '#FF5722');
         gradient.addColorStop(1, '#FFCCBC');
    } else {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F7FA');
    }
    tCtx.fillStyle = gradient;
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw Ground
    tCtx.fillStyle = colors.ground;
    tCtx.fillRect(0, 600, 600, 200);
    
    // 3. Draw Title
    tCtx.shadowColor = 'rgba(0,0,0,0.3)';
    tCtx.shadowBlur = 10;
    tCtx.shadowOffsetY = 5;
    
    tCtx.fillStyle = '#FF9800';
    tCtx.font = 'bold 40px "Microsoft YaHei", Arial';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillText(`🏰 ${currentUser} 的小马王国`, 300, 80);
    
    tCtx.shadowBlur = 0;
    tCtx.shadowOffsetY = 0;
    
    // 4. Draw Level Info
    tCtx.fillStyle = '#FFF';
    tCtx.font = 'bold 36px Arial';
    tCtx.strokeStyle = '#333';
    tCtx.lineWidth = 4;
    
    let levelText = isEndless ? '♾️ 无尽挑战模式' : `🚩 第 ${currentLevel} 关`;
    tCtx.strokeText(levelText, 300, 150);
    tCtx.fillText(levelText, 300, 150);
    
    // 5. Draw Score Box
    tCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    tCtx.roundRect ? tCtx.roundRect(100, 200, 400, 120, 20) : tCtx.fillRect(100, 200, 400, 120);
    tCtx.fill();
    
    tCtx.fillStyle = '#666';
    tCtx.font = '28px Arial';
    tCtx.fillText('本次奔跑距离', 300, 240);
    
    tCtx.fillStyle = '#E91E63';
    tCtx.font = 'bold 50px Arial';
    tCtx.fillText(`${Math.floor(score)} 米`, 300, 290);
    
    // 6. Draw Pony (Player)
    const originalX = player.x;
    const originalY = player.y;
    const originalScale = sizeState; // Assuming global or need to access player.width/height logic
    
    // Setup for screenshot
     player.x = 275; 
     player.y = 550; 
     
     // Mock jump for cute pose
     const wasJumping = player.isJumping;
     player.isJumping = true;

     // Force draw scale
     const ctxScale = 1.5; 
     
     // Draw confetti/stars behind
    tCtx.fillStyle = '#FFD700';
    for(let i=0; i<15; i++) {
        const x = 100 + Math.random() * 400;
        const y = 400 + Math.random() * 200;
        tCtx.beginPath();
        tCtx.arc(x, y, 4 + Math.random() * 4, 0, Math.PI*2);
        tCtx.fill();
    }
    
    // We need to simulate player draw but on tCtx
    // The player.draw method takes a context.
    // We need to trick the player drawing logic which relies on global sizeState sometimes
    // But player.draw(tCtx) should work if we pass tCtx.
    
    // Let's just call it.
    player.draw(tCtx);
    
    // Restore
     player.x = originalX;
     player.y = originalY;
     player.isJumping = wasJumping;
     
    // 8. Footer
    tCtx.fillStyle = '#FFF';
    tCtx.font = '24px Arial';
    tCtx.fillText(`— ${currentUser} 的高光时刻 —`, 300, 750);
    
    return tempCanvas.toDataURL('image/png');
}

function showShare() {
    const dataUrl = generateShareImage();
    shareImg.src = dataUrl;
    shareScreen.classList.remove('hidden');
    audio.playClick();
}

function showCalendar() {
    calendarScreen.classList.remove('hidden');
    const now = new Date();
    renderCalendar(now.getFullYear(), now.getMonth());
    audio.playClick();
}

function renderCalendar(year, month) {
    calendarMonth.textContent = `${year}年 ${month + 1}月`;
    calendarGrid.innerHTML = '';
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    
    // Fill empty slots
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        calendarGrid.appendChild(empty);
    }
    
    const todayStr = new Date().toLocaleDateString('zh-CN');
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dateStr = dateObj.toLocaleDateString('zh-CN');
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = d;
        
        if (dateStr === todayStr) {
            dayEl.classList.add('today');
        }
        
        if (dailyRecords[dateStr]) {
            dayEl.classList.add('has-record');
        }
        
        dayEl.onclick = () => {
            document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('active'));
            dayEl.classList.add('active');
            
            const record = dailyRecords[dateStr];
            if (record) {
                let levelText = record.maxLevel ? `${record.maxLevel} 关` : '未记录';
                if (record.maxLevel === 0) levelText = '未通关';
                
                dailyStats.innerHTML = `
                    <p>日期：<span class="highlight">${dateStr}</span></p>
                    <p>奔跑距离：<span class="highlight">${record.distance}</span> 米</p>
                    <p>挑战次数：<span class="highlight">${record.runs}</span> 次</p>
                    <p>最高到达：<span class="highlight" style="color: #E91E63;">第 ${levelText}</span></p>
                `;
            } else {
                dailyStats.innerHTML = `
                    <p>日期：<span class="highlight">${dateStr}</span></p>
                    <p>这一天没有奔跑记录哦～</p>
                `;
            }
            audio.playClick();
        };
        
        calendarGrid.appendChild(dayEl);
    }
}

function showLogin() {
    loginScreen.classList.remove('hidden');
    mapScreen.classList.add('hidden');
    hud.classList.add('hidden');
    
    if (currentUser) {
        nicknameInput.value = currentUser;
    }
    
    // Focus input
    setTimeout(() => nicknameInput.focus(), 500);
}
