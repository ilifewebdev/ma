class AudioController {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        
        // Web Audio API
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
        
        // Sound Assets
        this.sounds = {};
        this.assetsLoaded = false;
        this.loadAssets();
        
        // BGM State
        this.bgmEnabled = true;
        this.bgmOsc = null;
        this.bgmGain = null;
        this.bgmInterval = null;
        this.currentNote = 0;
        this.bgmAudio = null; // For MP3 BGM
        
        // Synth Melody (Fallback)
        this.melody = [
            { f: 261.63, d: 0.2 }, { f: 329.63, d: 0.2 }, { f: 392.00, d: 0.2 }, { f: 329.63, d: 0.2 },
            { f: 261.63, d: 0.2 }, { f: 196.00, d: 0.2 }, { f: 261.63, d: 0.4 }, { f: 0, d: 0.2 },
            { f: 261.63, d: 0.2 }, { f: 293.66, d: 0.2 }, { f: 329.63, d: 0.2 }, { f: 349.23, d: 0.2 },
            { f: 392.00, d: 0.4 }, { f: 392.00, d: 0.4 }, { f: 0, d: 0.2 }
        ];
    }
    
    loadAssets() {
        const fileNames = {
            jump: 'assets/audio/jump.mp3',
            hit: 'assets/audio/hit.mp3',
            coin: 'assets/audio/coin.mp3',
            win: 'assets/audio/win.mp3',
            click: 'assets/audio/click.mp3',
            bgm: 'assets/audio/bgm.mp3'
        };
        
        for (const [key, path] of Object.entries(fileNames)) {
            const audio = new Audio(path);
            audio.preload = 'auto';
            
            if (key === 'bgm') {
                audio.loop = true;
                this.bgmAudio = audio;
            } else {
                this.sounds[key] = audio;
            }
            
            // Optional: Check if loaded successfully
            audio.addEventListener('canplaythrough', () => {
                // console.log(`Loaded ${key}`);
            });
            audio.addEventListener('error', () => {
                console.warn(`Failed to load audio: ${path}. Using synthesizer fallback.`);
                this.sounds[key] = null; // Explicitly null to trigger fallback
                if (key === 'bgm') this.bgmAudio = null;
            });
        }
    }

    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
        return this.bgmEnabled;
    }

    startBGM() {
        if (!this.bgmEnabled) return;
        
        // Try MP3 BGM first
        if (this.bgmAudio && this.bgmAudio.readyState >= 2) {
            this.bgmAudio.play().catch(e => console.log('Autoplay blocked', e));
            return;
        }
        
        // Fallback to Synth
        if (!this.enabled || !this.ctx || this.bgmInterval) return;
        this.currentNote = 0;
        this.playNextNote();
    }

    stopBGM() {
        // Stop MP3
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
        }
        
        // Stop Synth
        if (this.bgmInterval) {
            clearTimeout(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    playNextNote() {
        if (!this.bgmEnabled) return;
        
        const note = this.melody[this.currentNote];
        const nextNoteDelay = note.d * 1000; 
        
        if (note.f > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle'; 
            osc.frequency.setValueAtTime(note.f, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime); 
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + note.d * 0.9);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + note.d);
        }
        
        this.currentNote = (this.currentNote + 1) % this.melody.length;
        
        this.bgmInterval = setTimeout(() => {
            this.playNextNote();
        }, nextNoteDelay);
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    playSound(name) {
        if (this.sounds[name] && this.sounds[name].readyState >= 2) {
            // Clone node to allow overlapping sounds
            const clone = this.sounds[name].cloneNode();
            clone.volume = 0.5; // Default volume
            clone.play().catch(e => {});
            return true;
        }
        return false;
    }

    playTone(freq, type, duration, volume = 0.1) {
        if (!this.enabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playJump() {
        if (this.playSound('jump')) return;
        
        // Fallback
        if (!this.enabled || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playHit() {
        if (this.playSound('hit')) return;
        this.playTone(150, 'sawtooth', 0.3, 0.2);
    }

    playWin() {
        if (this.playSound('win')) return;
        
        if (!this.enabled || !this.ctx) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; 
        let time = this.ctx.currentTime;
        
        notes.forEach((note, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note, time + index * 0.1);
            
            gain.gain.setValueAtTime(0.1, time + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, time + index * 0.1 + 0.3);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(time + index * 0.1);
            osc.stop(time + index * 0.1 + 0.3);
        });
    }

    playClick() {
        if (this.playSound('click')) return;
        if (this.playSound('coin')) return; // Alternate for coin
        this.playTone(800, 'sine', 0.1, 0.1);
    }
}
