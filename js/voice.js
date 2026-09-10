/* ==========================================================================
   CYBER BRAWL 3D VOICE SYNTHESIZER ENGINE (MALE & FEMALE FIGHTERS)
   Web Speech Synthesis & Formant SFX for Male/Female Battle Cries & Pain Grunts
   ========================================================================== */

class VoiceEngine {
    constructor() {
        this.synth = window.speechSynthesis || null;
        this.enabled = true;
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
                    const maleVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Male') || v.name.includes('David')));
                    if (maleVoice) utter.voice = maleVoice;
                }
            }
            this.synth.speak(utter);
        } catch (e) {
            console.error('Voice synth error:', e);
        }
    }

    playAttackCry(characterId, type) {
        const isFemale = characterId === 'mai' || characterId === 'athena';
        const pitch = isFemale ? 1.5 : (characterId === 'titan' ? 0.6 : 0.9);

        if (type === 'SPECIAL_1') {
            if (characterId === 'titan') this.speak('GROUND SHOCKWAVE!', pitch, 1.1);
            else if (characterId === 'mai') this.speak('FIRE KUNAI BLAST!', pitch, 1.3, true);
            else if (characterId === 'kyo') this.speak('HADOUKEN!', pitch, 1.2);
            else this.speak('PLASMA SHIELD!', pitch, 1.3, true);
        } else if (type === 'SPECIAL_2') {
            if (characterId === 'titan') this.speak('POWER LARIAT!', pitch, 1.1);
            else if (characterId === 'mai') this.speak('FLYING NINJA KICK!', pitch, 1.4, true);
            else if (characterId === 'kyo') this.speak('SHORYUKEN!', pitch, 1.3);
            else this.speak('LIGHTNING SURGE!', pitch, 1.4, true);
        } else {
            const maleShouts = ['HAH!', 'TAKE THIS!', 'HYAH!', 'HO!'];
            const femaleShouts = ['HI-YA!', 'TAKE THAT!', 'HAH!', 'YAH!'];
            const shouts = isFemale ? femaleShouts : maleShouts;
            const shout = shouts[Math.floor(Math.random() * shouts.length)];
            this.speak(shout, pitch, 1.4, isFemale);
        }
    }

    playHurtGrunt(characterId) {
        const isFemale = characterId === 'mai' || characterId === 'athena';
        const pitch = isFemale ? 1.6 : (characterId === 'titan' ? 0.55 : 0.8);
        const grunts = isFemale ? ['AAH!', 'KYAH!', 'OOF!', 'UGH!'] : ['OOF!', 'UGH!', 'ARGH!', 'GAH!'];
        const grunt = grunts[Math.floor(Math.random() * grunts.length)];
        this.speak(grunt, pitch, 1.5, isFemale);
    }

    announceSelect() { this.speak('SELECT YOUR FIGHTER!', 0.85, 1.0); }
    announceVS() { this.speak('BATTLE OF CHAMPIONS!', 0.85, 1.0); }
    announceRound1() { this.speak('ROUND ONE... FIGHT!', 0.8, 1.1); }
    announceKO() { this.speak('K.O.!', 0.7, 1.0); }
    announceWinner(name) { this.speak(`${name} WINS! VICTORY!`, 0.85, 1.0); }
}

const voiceEngine = new VoiceEngine();
