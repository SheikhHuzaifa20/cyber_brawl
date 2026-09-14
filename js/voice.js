/* ==========================================================================
   CYBER BRAWL 3D VIP VOICE SYNTHESIZER & ARENA ANNOUNCER ENGINE
   Web Speech Synthesis & Formant SFX for Real Battle Shouts & Announcer
   ========================================================================== */

class VoiceEngine {
    constructor() {
        this.synth = window.speechSynthesis || null;
        this.enabled = true;
    }

    setMuted(muted) {
        this.enabled = !muted;
        if (muted && this.synth) {
            try {
                this.synth.cancel();
            } catch (e) {}
        }
    }

    speak(phrase, pitch = 1.0, rate = 1.1, forceFemale = false) {
        if (!this.enabled || !this.synth) return;
        try {
            this.synth.cancel();
            const utter = new SpeechSynthesisUtterance(phrase);
            utter.pitch = pitch;
            utter.rate = rate;
            utter.volume = 1.0;

            const voices = this.synth.getVoices();
            if (voices.length > 0) {
                if (forceFemale) {
                    const femaleVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google US English')));
                    if (femaleVoice) utter.voice = femaleVoice;
                } else {
                    const maleVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google UK English Male')));
                    if (maleVoice) utter.voice = maleVoice;
                }
            }
            this.synth.speak(utter);
        } catch (e) {}
    }

    playAttackCry(characterId, type) {
        if (!this.enabled) return;
        const isFemale = characterId === 'mai' || characterId === 'athena';
        const pitch = isFemale ? 1.55 : (characterId === 'titan' ? 0.62 : 0.88);

        if (type === 'POWER') {
            if (characterId === 'titan') this.speak('THUNDER VOLT SHOCKWAVE!', pitch, 1.15);
            else if (characterId === 'mai') this.speak('PHOENIX FLAME BLAZE!', pitch, 1.35, true);
            else if (characterId === 'kyo') this.speak('DRAGON HADOUKEN!', pitch, 1.25);
            else this.speak('PSYCHO PLASMA WAVE!', pitch, 1.35, true);
        } else if (type === 'DAO') {
            if (characterId === 'titan') this.speak('TITAN CRUSH TAKEDOWN!', pitch, 1.15);
            else if (characterId === 'mai') this.speak('SHINOBI SWEEP!', pitch, 1.4, true);
            else if (characterId === 'kyo') this.speak('DRAGON SWEEP STRIKE!', pitch, 1.3);
            else this.speak('PLASMA TACKLE!', pitch, 1.4, true);
        } else if (type === 'KICK') {
            const shouts = isFemale ? ['HYAH!', 'FLYING KICK!', 'CHESTO!'] : ['HYAH!', 'HIGH KICK!', 'TAKE THIS!'];
            this.speak(shouts[Math.floor(Math.random() * shouts.length)], pitch, 1.4, isFemale);
        } else {
            const shouts = isFemale ? ['HI-YA!', 'TAKE THAT!', 'HAH!'] : ['HAH!', 'TAKE THIS!', 'STRIKE!'];
            this.speak(shouts[Math.floor(Math.random() * shouts.length)], pitch, 1.4, isFemale);
        }
    }

    playHurtGrunt(characterId) {
        if (!this.enabled) return;
        const isFemale = characterId === 'mai' || characterId === 'athena';
        const pitch = isFemale ? 1.6 : (characterId === 'titan' ? 0.55 : 0.8);
        const grunts = isFemale ? ['AAH!', 'KYAH!', 'OOF!', 'UGH!'] : ['OOF!', 'UGH!', 'ARGH!', 'GAH!'];
        const grunt = grunts[Math.floor(Math.random() * grunts.length)];
        this.speak(grunt, pitch, 1.5, isFemale);
    }

    announceSelect() { if (this.enabled) this.speak('SELECT YOUR CHAMPION!', 0.85, 1.05); }
    announceVS() { if (this.enabled) this.speak('CHAMPIONSHIP BRAWL! PREPARE TO FIGHT!', 0.85, 1.05); }
    announceRound1() { if (this.enabled) this.speak('ROUND ONE... ENGAGE!', 0.82, 1.1); }
    announceRound2() { if (this.enabled) this.speak('ROUND TWO... FIGHT!', 0.82, 1.1); }
    announceFinalRound() { if (this.enabled) this.speak('FINAL ROUND... DECIDE YOUR DESTINY!', 0.80, 1.05); }
    announceKO() { if (this.enabled) this.speak('K.O.!', 0.70, 1.0); }
    announceWinner(name) { if (this.enabled) this.speak(`${name} WINS! PERFECT VICTORY!`, 0.85, 1.05); }
}

const voiceEngine = new VoiceEngine();
