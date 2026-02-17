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
    
    gameContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, {passive: false});

    gameContainer.addEventListener('touchend', (e) => {
        if (gameState !== 'PLAYING') return;
        
        // Ignore clicks on UI buttons
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        
        let touchEndX = e.changedTouches[0].clientX;
        let touchEndY = e.changedTouches[0].clientY;
        
        let diffX = touchEndX - touchStartX;
        let diffY = touchEndY - touchStartY;
        
        // Check for Horizontal Swipe (Priority: Must be dominant axis and significant distance)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX > 0) {
                player.move('right');
                setTimeout(() => player.move('stop'), 200);
            } else {
                player.move('left');
                setTimeout(() => player.move('stop'), 200);
            }
        } 
        // Vertical Swipe or Tap
        else {
            if (diffY > 40) {
                // Swipe Down -> Slide
                player.slide();
            } else {
                // Swipe Up or Tap -> Jump
                player.jump();
            }
        }
        
        audio.resume();
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
    restartBtn.addEventListener('click', () => startGame(currentLevel));
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
