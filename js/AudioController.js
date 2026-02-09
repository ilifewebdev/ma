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
        
        // Synth Melody (Fallback) - Expanded to be richer
        this.melodies = {
            default: [
                // Section A: Cheerful intro (C Major)
                { f: 523.25, d: 0.2 }, { f: 659.25, d: 0.2 }, { f: 783.99, d: 0.2 }, { f: 523.25, d: 0.2 },
                { f: 880.00, d: 0.4 }, { f: 783.99, d: 0.4 }, 
                { f: 698.46, d: 0.2 }, { f: 659.25, d: 0.2 }, { f: 587.33, d: 0.2 }, { f: 523.25, d: 0.2 },
                { f: 587.33, d: 0.4 }, { f: 783.99, d: 0.4 },
                
                // Section B: Bouncy rhythm
                { f: 523.25, d: 0.15 }, { f: 0, d: 0.05 }, { f: 523.25, d: 0.15 }, { f: 0, d: 0.05 },
                { f: 659.25, d: 0.2 }, { f: 783.99, d: 0.2 },
                { f: 1046.50, d: 0.4 }, { f: 783.99, d: 0.2 }, { f: 523.25, d: 0.2 },
                { f: 587.33, d: 0.6 }, { f: 0, d: 0.2 }
            ],
            boss: [
                // Urgent / Tension
                { f: 110, d: 0.1 }, { f: 123, d: 0.1 }, { f: 110, d: 0.1 }, { f: 123, d: 0.1 },
                { f: 146, d: 0.2 }, { f: 130, d: 0.2 }, { f: 110, d: 0.4 },
                { f: 98, d: 0.1 }, { f: 110, d: 0.1 }, { f: 130, d: 0.2 }, { f: 0, d: 0.2 }
            ],
            victory: [
                // Fanfare: Sol-Do-Mi-Sol (Arpeggio up)
                { f: 392.00, d: 0.1 }, { f: 523.25, d: 0.1 }, { f: 659.25, d: 0.1 }, { f: 783.99, d: 0.3 },
                // High finish
                { f: 659.25, d: 0.1 }, { f: 783.99, d: 0.1 }, { f: 1046.50, d: 0.8 }, 
                // Echo/Tail
                { f: 0, d: 0.2 }, { f: 523.25, d: 0.1 }, { f: 1046.50, d: 0.4 }, { f: 0, d: 1.0 }
            ]
        };
        this.currentMelodyKey = 'default';
        this.melody = this.melodies['default'];
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

    playMelody(key) {
        if (!this.melodies[key]) return;
        if (this.currentMelodyKey === key && this.bgmInterval) return; // Already playing
        
        this.stopBGM(); // Stop current
        
        this.currentMelodyKey = key;
        this.melody = this.melodies[key];
        this.currentNote = 0;
        this.bgmEnabled = true; // Force enable
        
        this.playNextNote();
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
            const osc2 = this.ctx.createOscillator(); // Harmony
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle'; // Main melody
            osc2.type = 'sine';    // Soft harmony
            
            osc.frequency.setValueAtTime(note.f, this.ctx.currentTime);
            osc2.frequency.setValueAtTime(note.f * 0.5, this.ctx.currentTime); // Lower octave
            
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime); 
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + note.d * 0.9);
            
            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc2.start();
            
            const stopTime = this.ctx.currentTime + note.d;
            osc.stop(stopTime);
            osc2.stop(stopTime);
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
