/* ==========================================================================
   CYBER BRAWL 3D MAIN ENGINE (Ultra VIP Edition)
   Handles 3D Scene Initialization, Male/Female 3D Roster & English UI Banners
   ========================================================================== */

class GameEngine3D {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');

        // Three.js Core Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.camera.position.set(0, 3.5, 12);
        this.camera.lookAt(0, 2, 0);

        this.stage = new Stage3DRenderer(this.scene);
        projectileManager3D.init(this.scene);

        this.gameState = 'MENU';
        this.gameMode = 'CPU';

        // Male Bodybuilder (Titan) vs Female Ninja (Mai)
        this.p1 = new Fighter3D('p1', 'titan', -4, true, false);
        this.p2 = new Fighter3D('p2', 'mai', 4, false, false);
        this.scene.add(this.p1.group);
        this.scene.add(this.p2.group);

        this.cpu = null;

        this.shakeTime = 0;
        this.shakeIntensity = 0;

        this.roundTimer = 99;
        this.timerInterval = null;
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.roundNumber = 1;

        this.keys = {};

        this.initDOMListeners();
        this.initInputListeners();
        this.onWindowResize();
        this.startLoop();
    }

    initDOMListeners() {
        document.getElementById('btn-mode-cpu').addEventListener('click', () => this.openCharSelect('CPU'));
        document.getElementById('btn-mode-2p').addEventListener('click', () => this.openCharSelect('2P'));
        document.getElementById('btn-mode-practice').addEventListener('click', () => this.openCharSelect('PRACTICE'));
        document.getElementById('btn-controls-modal').addEventListener('click', () => this.showModal('controls-modal'));
        document.getElementById('btn-close-controls').addEventListener('click', () => this.hideModal('controls-modal'));

        document.querySelectorAll('.char-thumb').forEach(t => {
            t.addEventListener('click', () => {
                const charId = t.getAttribute('data-id');
                this.selectRosterChar(charId);
            });
        });

        document.getElementById('btn-start-match').addEventListener('click', () => this.triggerVSScreenAndStart());
        document.getElementById('btn-back-to-menu').addEventListener('click', () => this.showScreen('menu-screen'));

        document.getElementById('btn-pause-ingame').addEventListener('click', () => this.togglePause());
        document.getElementById('btn-touch-toggle').addEventListener('click', () => {
            const isVisible = touchController.toggleVisibility();
            document.getElementById('btn-touch-toggle').innerText = isVisible ? '📱 MOBILE TOUCH: ON' : '💻 MOBILE TOUCH: OFF';
        });

        document.getElementById('btn-audio-toggle').addEventListener('click', () => {
            const isMuted = soundManager.toggleMute();
            voiceEngine.enabled = !isMuted;
            document.getElementById('btn-audio-toggle').innerText = isMuted ? '🔇 UNMUTE VOICE & SFX' : '🔊 MUTE VOICE & SFX';
        });

        document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.hideModal('pause-screen');
            this.triggerVSScreenAndStart();
        });
        document.getElementById('btn-change-fighters').addEventListener('click', () => {
            this.hideModal('pause-screen');
            this.openCharSelect(this.gameMode);
        });
        document.getElementById('btn-menu').addEventListener('click', () => {
            this.hideModal('pause-screen');
            this.showScreen('menu-screen');
        });

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initInputListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (this.gameState === 'FIGHTING' && (e.code === 'KeyQ' || e.code === 'ShiftLeft' || e.code === 'ShiftRight')) {
                this.p1.block();
                this.showCombatAction('block');
            }
            if (e.code === 'Escape' && (this.gameState === 'FIGHTING' || this.gameState === 'PAUSED')) {
                this.togglePause();
            }
        });
        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyQ' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.p1.unblock();
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    openCharSelect(mode) {
        this.gameMode = mode;
        document.getElementById('p2-header-label').innerText = mode === '2P' ? 'PLAYER 2' : (mode === 'PRACTICE' ? 'DUMMY BOT' : '3D CPU OPPONENT');
        this.showScreen('char-select-screen');
        voiceEngine.announceSelect();
    }

    selectRosterChar(charId) {
        if (this.p1.characterId !== charId) {
            this.scene.remove(this.p1.group);
            this.p1 = new Fighter3D('p1', charId, -4, true, false);
            this.scene.add(this.p1.group);
        } else {
            this.scene.remove(this.p2.group);
            this.p2 = new Fighter3D('p2', charId === 'titan' ? 'mai' : charId, 4, false, true);
            this.scene.add(this.p2.group);
        }

        document.querySelectorAll('.char-thumb').forEach(t => {
            const id = t.getAttribute('data-id');
            t.classList.remove('selected-p1', 'selected-p2');
            if (id === this.p1.characterId) t.classList.add('selected-p1');
            if (id === this.p2.characterId) t.classList.add('selected-p2');
        });

        const p1Data = ULTRA_ROSTER[this.p1.characterId];
        const p2Data = ULTRA_ROSTER[this.p2.characterId];

        document.getElementById('p1-select-name').innerText = p1Data.name;
        document.getElementById('p1-name').innerText = p1Data.name;
        document.getElementById('vs-p1-name').innerText = p1Data.name;

        document.getElementById('p2-select-name').innerText = p2Data.name;
        document.getElementById('p2-name').innerText = p2Data.name;
        document.getElementById('vs-p2-name').innerText = p2Data.name;
    }

    showScreen(screenId) {
        document.querySelectorAll('.ui-screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('hud-overlay').classList.add('hidden');
        document.getElementById('touch-controller-overlay').classList.add('hidden');
        document.getElementById('p1-overhead-marker').classList.add('hidden');
        document.getElementById('p2-overhead-marker').classList.add('hidden');

        if (screenId !== 'none') {
            document.getElementById(screenId).classList.remove('hidden');
        }
        this.gameState = screenId === 'menu-screen' ? 'MENU' : (screenId === 'char-select-screen' ? 'CHAR_SELECT' : 'FIGHTING');
        soundManager.stopFightBGM();
    }

    showModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }
    hideModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

    togglePause() {
        if (this.gameState === 'FIGHTING') {
            this.gameState = 'PAUSED';
            this.showModal('pause-screen');
            soundManager.stopFightBGM();
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'FIGHTING';
            this.hideModal('pause-screen');
            soundManager.startFightBGM();
        }
    }

    triggerVSScreenAndStart() {
        this.showScreen('vs-screen');
        voiceEngine.announceVS();

        setTimeout(() => {
            this.startMatch();
        }, 2200);
    }

    startMatch() {
        this.showScreen('none');
        document.getElementById('hud-overlay').classList.remove('hidden');
        document.getElementById('touch-controller-overlay').classList.remove('hidden');
        document.getElementById('p1-overhead-marker').classList.remove('hidden');
        document.getElementById('p2-overhead-marker').classList.remove('hidden');

        this.p1.resetPosition(-4);
        this.p2.resetPosition(4);

        if (this.gameMode === 'CPU') this.cpu = new CPUController(this.p2, this.p1);
        else this.cpu = null;

        projectileManager3D.clear();

        this.roundTimer = 99;
        this.roundNumber = Math.max(1, this.p1Wins + this.p2Wins + 1);
        document.getElementById('round-timer').innerText = '99';
        if (this.timerInterval) clearInterval(this.timerInterval);

        const banner = document.getElementById('announcer-banner');
        const text = document.getElementById('announcer-text');
        banner.classList.remove('hidden');
        text.innerText = 'READY...';
        voiceEngine.announceRound1();

        setTimeout(() => {
            text.innerText = 'FIGHT!';
            setTimeout(() => {
                banner.classList.add('hidden');
                this.gameState = 'FIGHTING';
                soundManager.startFightBGM();
                this.startTimer();
            }, 600);
        }, 800);
    }

    startTimer() {
        if (this.gameMode === 'PRACTICE') {
            document.getElementById('round-timer').innerText = '∞';
            return;
        }
        this.timerInterval = setInterval(() => {
            if (this.gameState === 'FIGHTING' && this.roundTimer > 0) {
                this.roundTimer--;
                document.getElementById('round-timer').innerText = this.roundTimer;
                if (this.roundTimer === 0) {
                    const winner = this.p1.health >= this.p2.health ? this.p1 : this.p2;
                    const loser = winner === this.p1 ? this.p2 : this.p1;
                    this.onKnockout(winner, loser);
                }
            }
        }, 1000);
    }

    handlePlayerInputs() {
        if (this.gameState !== 'FIGHTING') return;

        const leftHeld = this.keys['KeyA'] || touchController.activeStates.left;
        const rightHeld = this.keys['KeyD'] || touchController.activeStates.right;
        if (leftHeld && !rightHeld) this.p1.moveLeft();
        else if (rightHeld && !leftHeld) this.p1.moveRight();
        else this.p1.stopMove();

        if (this.keys['KeyS'] || touchController.activeStates.down) this.p1.crouch();
        else this.p1.uncrouch();

        if (this.keys['KeyW'] || touchController.activeStates.up) this.p1.jump();
        if (this.keys['KeyF']) this.p1.punchLight();
        if (this.keys['KeyG']) this.p1.punchHeavy();
        if (this.keys['KeyH']) this.p1.kick();
        if (this.keys['KeyQ'] || this.keys['ShiftLeft'] || this.keys['ShiftRight']) this.p1.block();

        if (this.keys['KeyS'] && this.keys['KeyD'] && this.keys['KeyF']) this.p1.special1();
        if (this.keys['KeyS'] && this.keys['KeyW'] && this.keys['KeyG']) this.p1.special2();

        if (this.gameMode === '2P') {
            if (this.keys['ArrowLeft']) this.p2.moveLeft();
            else if (this.keys['ArrowRight']) this.p2.moveRight();
            else this.p2.stopMove();

            if (this.keys['ArrowDown']) this.p2.crouch();
            else this.p2.uncrouch();

            if (this.keys['ArrowUp']) this.p2.jump();
            if (this.keys['KeyJ'] || this.keys['Numpad1']) this.p2.punchLight();
            if (this.keys['KeyK'] || this.keys['Numpad2']) this.p2.punchHeavy();
            if (this.keys['KeyL'] || this.keys['Numpad3']) this.p2.kick();
        } else if (this.gameMode === 'CPU' && this.cpu) {
            this.cpu.update();
        }
    }

    checkCollisions() {
        if (this.gameState !== 'FIGHTING') return;

        const dist = Math.abs(this.p1.x - this.p2.x);

        if (this.p1.isAttacking() && !this.p1.hasHitEnemy && dist < 2.2) {
            this.p1.hasHitEnemy = true;
            this.p2.takeDamage(this.p1.activeHitbox ? this.p1.activeHitbox.damage : 10, 18, this.p1);
            this.shakeCamera(0.3, 8);
            if (this.p2.health <= 0) this.onKnockout(this.p1, this.p2);
        }

        if (this.p2.isAttacking() && !this.p2.hasHitEnemy && dist < 2.2) {
            this.p2.hasHitEnemy = true;
            this.p1.takeDamage(this.p2.activeHitbox ? this.p2.activeHitbox.damage : 10, 18, this.p2);
            this.shakeCamera(0.3, 8);
            if (this.p1.health <= 0) this.onKnockout(this.p2, this.p1);
        }

        for (const proj of projectileManager3D.projectiles) {
            if (!proj.isActive) continue;
            const target = proj.owner === 'p1' ? this.p2 : this.p1;
            const attacker = proj.owner === 'p1' ? this.p1 : this.p2;

            if (Math.abs(proj.x - target.x) < 1.4) {
                proj.destroy();
                target.takeDamage(proj.damage, 20, attacker);
                this.shakeCamera(0.4, 10);
                if (target.health <= 0) this.onKnockout(attacker, target);
            }
        }
    }

    onKnockout(winner, loser) {
        if (this.gameState === 'KO') return;
        this.gameState = 'KO';
        soundManager.stopFightBGM();
        if (winner.isP1) this.p1Wins++;
        else this.p2Wins++;
        this.updateHUDWins();

        const banner = document.getElementById('announcer-banner');
        const text = document.getElementById('announcer-text');
        banner.classList.remove('hidden');
        text.innerText = 'K.O.!';

        const winnerName = ULTRA_ROSTER[winner.characterId].name;
        voiceEngine.announceWinner(winnerName);

        const matchWon = winner.isP1 ? this.p1Wins >= 2 : this.p2Wins >= 2;
        setTimeout(() => {
            if (matchWon) {
                text.innerText = `${winnerName} WINS THE MATCH!`;
                this.showCombatAction('match-winner', winnerName);
                setTimeout(() => {
                    this.p1Wins = 0;
                    this.p2Wins = 0;
                    this.updateHUDWins();
                    this.openCharSelect(this.gameMode);
                }, 2200);
            } else {
                text.innerText = `ROUND ${this.roundNumber} COMPLETE`;
                this.showCombatAction('next-round', `Round ${this.roundNumber + 1} starts next`);
                setTimeout(() => this.startMatch(), 1600);
            }
        }, 1100);
    }

    showCombatAction(action, detail = '') {
        const labels = {
            lpunch: ['LIGHT PUNCH', 'F / TOUCH PUNCH'],
            hpunch: ['HEAVY PUNCH', 'G / TOUCH H.PUNCH'],
            kick: ['HIGH KICK', 'H / TOUCH KICK'],
            block: ['GUARDING', 'Q or SHIFT / HOLD GUARD'],
            spec1: ['SPECIAL 1', 'S + D + F / TOUCH FIREBALL'],
            spec2: ['SPECIAL 2', 'S + W + G / TOUCH POWER RUSH'],
            'match-winner': ['MATCH VICTORY', detail],
            'next-round': ['NEXT ROUND', detail]
        };
        const result = labels[action] || ['READY', detail || 'Choose an action to enter the arena.'];
        document.getElementById('combat-action').innerText = result[0];
        document.getElementById('combat-detail').innerText = result[1];
        document.getElementById('combat-status').classList.toggle('active', action !== 'ready');
    }

    updateHUDWins() {
        document.getElementById('p1-score').innerText = `WINS: ${this.p1Wins}`;
        document.getElementById('p2-score').innerText = `WINS: ${this.p2Wins}`;
    }

    shakeCamera(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTime = duration;
    }

    updateOverheadMarkers() {
        if (this.gameState !== 'FIGHTING') return;

        const projectPoint = (fighter, markerId) => {
            const vec = new THREE.Vector3(fighter.x, fighter.y + 3.0, fighter.z);
            vec.project(this.camera);

            const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
            const y = -(vec.y * 0.5 - 0.5) * window.innerHeight;

            const marker = document.getElementById(markerId);
            if (marker) {
                marker.style.left = `${x}px`;
                marker.style.top = `${y}px`;
            }
        };

        projectPoint(this.p1, 'p1-overhead-marker');
        projectPoint(this.p2, 'p2-overhead-marker');
    }

    updateHUD() {
        document.getElementById('p1-health-fill').style.width = (this.p1.health / this.p1.maxHealth * 100) + '%';
        document.getElementById('p2-health-fill').style.width = (this.p2.health / this.p2.maxHealth * 100) + '%';
        document.getElementById('p1-energy-fill').style.width = this.p1.energy + '%';
        document.getElementById('p2-energy-fill').style.width = this.p2.energy + '%';

        const p1ComboEl = document.getElementById('p1-combo');
        if (this.p1.combo >= 2) {
            p1ComboEl.classList.remove('hidden');
            p1ComboEl.querySelector('.combo-count').innerText = this.p1.combo;
        } else p1ComboEl.classList.add('hidden');

        const p2ComboEl = document.getElementById('p2-combo');
        if (this.p2.combo >= 2) {
            p2ComboEl.classList.remove('hidden');
            p2ComboEl.querySelector('.combo-count').innerText = this.p2.combo;
        } else p2ComboEl.classList.add('hidden');
    }

    startLoop() {
        const animate = () => {
            this.update();
            this.render();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    update() {
        if (this.gameState === 'MENU' || this.gameState === 'CHAR_SELECT') return;

        this.handlePlayerInputs();
        this.p1.update(this.p2);
        this.p2.update(this.p1);

        this.stage.update();
        projectileManager3D.update();

        this.checkCollisions();
        this.updateHUD();
        this.updateOverheadMarkers();

        const midX = (this.p1.x + this.p2.x) / 2;
        const dist = Math.abs(this.p1.x - this.p2.x);
        this.camera.position.x += (midX - this.camera.position.x) * 0.05;
        this.camera.position.z += (Math.max(10, 8 + dist * 0.4) - this.camera.position.z) * 0.05;
        this.camera.lookAt(midX, 2, 0);

        if (this.shakeTime > 0) {
            this.shakeTime--;
            this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new GameEngine3D();
});
