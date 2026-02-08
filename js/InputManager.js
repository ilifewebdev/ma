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
    let touchStartY = 0;
    
    gameContainer.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, {passive: false});

    gameContainer.addEventListener('touchend', (e) => {
        if (gameState !== 'PLAYING') return;
        
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        
        let touchEndY = e.changedTouches[0].clientY;
        let diffY = touchEndY - touchStartY;

        if (Math.abs(diffY) < 30) {
            player.jump();
            audio.resume();
        } else if (diffY > 30) {
            player.slide();
            audio.resume();
        } else if (diffY < -30) {
            player.jump();
            audio.resume();
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
