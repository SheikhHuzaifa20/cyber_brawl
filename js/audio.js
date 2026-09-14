/* ==========================================================================
   CYBER BRAWL 3D VIP AUDIO & SFX SYNTHESIZER ENGINE (Web Audio API)
   Generates Sub-Bass Martial Arts Strikes, Metal Guard Clashes, Crowd Roar & BGM
   ========================================================================== */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = false;
        this.bgmGain = null;
        this.bgmPlaying = false;
        this.crowdNode = null;
        this.crowdGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended' && !this.isMuted) {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        }
        if (this.bgmGain && this.ctx) {
            this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.18, this.ctx.currentTime);
        }
        if (this.crowdGain && this.ctx) {
            this.crowdGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    toggleMute() {
        return this.setMuted(!this.isMuted);
    }

    // Play synthesized tone with envelope routed through masterGain
    playTone(freq, type, duration, startVol = 0.3, endVol = 0.001) {
        this.init();
        if (this.isMuted || !this.ctx || !this.masterGain) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(endVol, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    // Sound FX: Fast Light Punch (Jab)
    playLightPunch() {
        if (this.isMuted) return;
        this.init();
        this.playTone(220, 'triangle', 0.09, 0.45, 0.01);
        this.playTone(110, 'sine', 0.07, 0.6, 0.01);
    }

    // Sound FX: Heavy Dragon Punch (Deep Sub-Bass Impact)
    playHeavyPunch() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
            gain.gain.setValueAtTime(0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.25);

            this.playTone(75, 'sawtooth', 0.18, 0.5, 0.01);
        } catch (e) {}
    }

    // Sound FX: Martial Arts Roundhouse Kick
    playKick() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);
            gain.gain.setValueAtTime(0.65, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.18);
        } catch (e) {}
    }

    // Sound FX: Special Ki Fireball Launch
    playSpecialMove() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.32);
            gain.gain.setValueAtTime(0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }

    // Sound FX: Guard Shield Impact (Metallic Clash)
    playBlock() {
        if (this.isMuted) return;
        this.init();
        this.playTone(650, 'triangle', 0.10, 0.45, 0.01);
        this.playTone(880, 'sine', 0.12, 0.5, 0.01);
    }

    // Sound FX: Knockout Explosive Burst
    playKO() {
        if (this.isMuted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.85);
            gain.gain.setValueAtTime(0.9, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.9);
        } catch (e) {}
    }

    // Stadium Crowd Ambient Roar
    startCrowdRoar() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx || this.crowdNode || !this.masterGain) return;
        try {
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, this.ctx.currentTime);

            this.crowdGain = this.ctx.createGain();
            this.crowdGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);

            noise.connect(filter);
            filter.connect(this.crowdGain);
            this.crowdGain.connect(this.masterGain);

            noise.start();
            this.crowdNode = noise;
        } catch (e) {}
    }

    stopCrowdRoar() {
        if (this.crowdNode) {
            try { this.crowdNode.stop(); } catch (e) {}
            this.crowdNode = null;
        }
    }

    // Dynamic Arcade BGM Fight Synthesizer Loop
    startFightBGM() {
        if (this.isMuted) return;
        this.init();
        this.startCrowdRoar();
        if (!this.ctx || this.bgmPlaying || !this.masterGain) return;

        this.bgmPlaying = true;
        const bpm = 128;
        const stepTime = 60 / bpm / 4;
        const bassNotes = [110, 110, 130.8, 146.8, 110, 98, 110, 164.8];
        let step = 0;

        const playBassStep = () => {
            if (!this.bgmPlaying || this.isMuted || !this.ctx) return;
            const freq = bassNotes[step % bassNotes.length];
            this.playTone(freq, 'sawtooth', 0.12, 0.15, 0.01);
            step++;
            this.bgmTimeout = setTimeout(playBassStep, stepTime * 1000 * 2);
        };

        playBassStep();
    }

    stopFightBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimeout) clearTimeout(this.bgmTimeout);
        this.stopCrowdRoar();
    }
}

const soundManager = new SoundEngine();
