/* ==========================================================================
   CYBER CLASH AUDIO SYNTHESIZER ENGINE (Web Audio API)
   Generates offline retro arcade sound effects, voice synth & background BGM.
   ========================================================================== */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmNode = null;
        this.bgmGain = null;
        this.bgmPlaying = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgmGain) {
            this.bgmGain.gain.value = this.isMuted ? 0 : 0.15;
        }
        return this.isMuted;
    }

    // Play procedural tone buffer
    playTone(freq, type, duration, startVol = 0.3, endVol = 0.001) {
        if (this.isMuted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(endVol, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.error('Audio synth error:', e);
        }
    }

    // Sound FX: Light Punch
    playLightPunch() {
        this.init();
        if (this.isMuted) return;
        this.playTone(180, 'triangle', 0.1, 0.4, 0.01);
        this.playTone(90, 'sine', 0.08, 0.5, 0.01);
    }

    // Sound FX: Heavy Punch
    playHeavyPunch() {
        this.init();
        if (this.isMuted) return;
        this.playTone(120, 'sawtooth', 0.18, 0.6, 0.01);
        this.playTone(60, 'square', 0.22, 0.7, 0.01);
    }

    // Sound FX: Kick
    playKick() {
        this.init();
        if (this.isMuted) return;
        this.playTone(220, 'sawtooth', 0.12, 0.5, 0.01);
        this.playTone(70, 'sine', 0.15, 0.6, 0.01);
    }

    // Sound FX: Special Fireball Launch
    playSpecialMove() {
        this.init();
        if (this.isMuted) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }

    // Sound FX: Block / Guard Impact
    playBlock() {
        this.init();
        if (this.isMuted) return;
        this.playTone(440, 'sine', 0.08, 0.3, 0.01);
    }

    // Sound FX: K.O. Impact Burst
    playKO() {
        this.init();
        if (this.isMuted) return;
        this.playTone(100, 'square', 0.6, 0.8, 0.001);
        this.playTone(50, 'sawtooth', 0.8, 0.9, 0.001);
    }

    // Announcer Chime Synth
    playAnnouncerFight() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'square', 0.25, 0.4, 0.01);
            }, idx * 80);
        });
    }

    // Background Fighting BGM Generator (Looping Synthwave Bass & Lead)
    startFightBGM() {
        this.init();
        if (this.bgmPlaying || !this.ctx) return;
        
        try {
            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.value = this.isMuted ? 0 : 0.12;
            this.bgmGain.connect(this.ctx.destination);

            const bassNotes = [110, 110, 130.81, 146.83, 110, 110, 98, 123.47];
            let noteIdx = 0;

            const playNextBass = () => {
                if (!this.bgmPlaying) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const noteGain = this.ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(bassNotes[noteIdx], now);
                noteGain.gain.setValueAtTime(0.4, now);
                noteGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

                osc.connect(noteGain);
                noteGain.connect(this.bgmGain);

                osc.start(now);
                osc.stop(now + 0.2);

                noteIdx = (noteIdx + 1) % bassNotes.length;
            };

            this.bgmPlaying = true;
            this.bgmInterval = setInterval(playNextBass, 220);
        } catch (e) {
            console.error('BGM start error:', e);
        }
    }

    stopFightBGM() {
        this.bgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
}

const soundManager = new SoundEngine();
