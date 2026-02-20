function setupInputs() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            if (gameState === 'PLAYING') {
                player.jump();
                audio.resume();
            }
        } else if (e.code === 'ArrowDown') {
            if (gameState === 'PLAYING') {
                player.slide();
                audio.resume();
            }
        } else if (e.code === 'ArrowLeft') {
            if (gameState === 'PLAYING') player.move('left');
        } else if (e.code === 'ArrowRight') {
            if (gameState === 'PLAYING') player.move('right');
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            if (gameState === 'PLAYING') player.move('stop');
        }
    });
    
    const gameContainer = document.getElementById('game-container');
    // Touch Controls
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    gameContainer.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
        
        // Immediate Jump Feedback (Tap to Jump)
        // If it turns out to be a swipe later, we can handle that, but for games, latency matters.
        // However, to support 'slide', we shouldn't jump immediately on every touch.
        // Strategy: Wait for touchend to decide, OR use a very small threshold.
        
        audio.resume();
    }, {passive: false});

    gameContainer.addEventListener('touchmove', (e) => {
        // Prevent default scrolling
        if (e.cancelable) e.preventDefault(); 
        
        if (isSwiping) return; 
        
        let touchX = e.touches[0].clientX;
        let touchY = e.touches[0].clientY;
        let diffX = touchX - touchStartX;
        let diffY = touchY - touchStartY;
        
        // Detect Down Swipe (Slide) early
        if (diffY > 50 && Math.abs(diffX) < 40) {
            if (gameState === 'PLAYING') player.slide();
            isSwiping = true;
        }
    }, {passive: false});

    gameContainer.addEventListener('touchend', (e) => {
        if (gameState !== 'PLAYING') return;
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        
        if (isSwiping) return; // Already handled as a slide

        let touchEndX = e.changedTouches[0].clientX;
        let touchEndY = e.changedTouches[0].clientY;
        let diffX = touchEndX - touchStartX;
        let diffY = touchEndY - touchStartY;
        
        // Horizontal Swipe (Left/Right)
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
             if (diffX > 0) {
                player.move('right');
                setTimeout(() => player.move('stop'), 200);
            } else {
                player.move('left');
                setTimeout(() => player.move('stop'), 200);
            }
        }
        // Tap (Short movement) -> JUMP
        else if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) {
            player.jump();
        }
        // Up Swipe -> JUMP
        else if (diffY < -30) {
            player.jump();
        }
    });
    
    gameContainer.addEventListener('mousedown', (e) => {
        if (e.target.tagName !== 'BUTTON' && !e.target.classList.contains('level-btn')) {
             if (gameState === 'PLAYING') {
                player.jump();
                audio.resume();
            }
        }
    });

    startBtn.addEventListener('click', () => startGame(currentLevel));
    restartBtn.addEventListener('click', () => {
        if (isEndless) {
            // Randomize theme for restart in endless mode
            window.currentEndlessLevelIndex = Math.floor(Math.random() * LEVEL_CONFIGS.length);
        }
        startGame(currentLevel);
    });
    nextLevelBtn.addEventListener('click', () => {
        if (currentLevel < 10) {
            startGame(currentLevel + 1);
        } else {
            showMap(); 
        }
    });
    
    if(returnMapBtn) returnMapBtn.addEventListener('click', showMap);
    if(backMapBtn) backMapBtn.addEventListener('click', showMap);
    
    if(skinBtn) skinBtn.addEventListener('click', changeSkin);
    if(skinBtnMap) skinBtnMap.addEventListener('click', changeSkin); 

    if(endlessBtn) endlessBtn.addEventListener('click', startEndlessMode);
    if(achievementsBtn) achievementsBtn.addEventListener('click', showAchievements);
    if(shopBtn) shopBtn.addEventListener('click', showShop);
    
    if(closeShopBtn) closeShopBtn.addEventListener('click', () => {
        shopScreen.classList.add('hidden');
        audio.playClick();
        updateSkinButtons(); 
    });

    if(closeAchievementsBtn) closeAchievementsBtn.addEventListener('click', () => {
        achievementsScreen.classList.add('hidden');
        audio.playClick();
    });
    
    if(helpBtn) helpBtn.addEventListener('click', () => {
        helpScreen.classList.remove('hidden');
        audio.playClick();
    });
    
    if(closeHelpBtn) closeHelpBtn.addEventListener('click', () => {
        helpScreen.classList.add('hidden');
        audio.playClick();
    });
    
    if(bgmBtn) bgmBtn.addEventListener('click', () => {
        const isPlaying = audio.toggleBGM();
        bgmBtn.textContent = isPlaying ? '🎵 音乐' : '🎵 静音';
        audio.playClick();
    });

    if(calendarBtn) calendarBtn.addEventListener('click', showCalendar);
    if(closeCalendarBtn) closeCalendarBtn.addEventListener('click', () => {
        calendarScreen.classList.add('hidden');
        audio.playClick();
    });

    if(shareBtn) shareBtn.addEventListener('click', showShare);
    if(closeShareBtn) closeShareBtn.addEventListener('click', () => {
        shareScreen.classList.add('hidden');
        audio.playClick();
    });
    
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) logoutBtn.addEventListener('click', () => {
        audio.playClick();
        showLogin();
    });

    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            const name = nicknameInput.value.trim();
            if(name) {
                if(login(name)) {
                    audio.playClick();
                    showMap();
                }
            } else {
                // Shake input or show error?
                nicknameInput.style.borderColor = 'red';
                setTimeout(() => nicknameInput.style.borderColor = '#FF9800', 500);
            }
        });
    }

    if(pauseBtn) pauseBtn.addEventListener('click', togglePause);
    if(resumeBtn) resumeBtn.addEventListener('click', togglePause);
    if(exitBtn) exitBtn.addEventListener('click', () => {
        togglePause(); 
        showMap();
    });
}
