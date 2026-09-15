/* ==========================================================================
   CYBER BRAWL 3D MAIN ENGINE (Ultra VIP Edition)
   Handles 3D Scene Initialization, Anime Bodybuilders & Realistic Stages
   ========================================================================== */

class GameEngine3D {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');

        // Three.js Core Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        const isSmallDevice = window.innerWidth <= 900 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
        try {
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: !isSmallDevice,
                alpha: false,
                powerPreference: 'high-performance'
            });
        } catch (error) {
            this.showWebGLError();
            return;
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallDevice ? 1 : 1.5));
        this.renderer.shadowMap.enabled = !isSmallDevice;
        this.renderer.shadowMap.type = isSmallDevice ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;

        this.camera.position.set(0, 3.6, 12.5);
        this.camera.lookAt(0, 2, 0);

        this.stage = new Stage3DRenderer(this.scene);
        projectileManager3D.init(this.scene);

        this.gameState = 'MENU';
        this.gameMode = 'CPU';

        // Initialize 3D Fighters (Titan vs Mai)
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
        this.lastHudUpdate = 0;

        this.keys = {};
        this.orientationDismissed = false;

        this.initDOMListeners();
        this.initInputListeners();
        this.onWindowResize();
        this.startLoop();
    }

    showWebGLError() {
        this.canvas.style.display = 'none';
        const message = document.createElement('div');
        message.className = 'webgl-error-message';
        message.innerHTML = '<h2>3D graphics are unavailable</h2><p>Please enable hardware acceleration or update your browser, then reload the game.</p>';
        document.getElementById('app-container').appendChild(message);
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

        // Stage Selector
        const stageSelect = document.getElementById('stage-select');
        if (stageSelect) {
            stageSelect.addEventListener('change', (e) => {
                const sId = e.target.value;
                this.stage.setStage(sId);
                const stageNames = {
                    metropolis: 'METROPOLIS CYBER ARENA',
                    dojo: 'ANCIENT DRAGON DOJO',
                    volcano: 'VOLCANIC MAGMA CRATER'
                };
                const sName = stageNames[sId] || 'CYBER ARENA';
                document.getElementById('stage-display').innerText = sName;
                document.getElementById('vs-stage-footer').innerText = `ARENA: ${sName}`;
            });
        }

        document.getElementById('btn-start-match').addEventListener('click', () => this.triggerVSScreenAndStart());
        document.getElementById('btn-back-to-menu').addEventListener('click', () => this.showScreen('menu-screen'));

        // Top Utility Buttons
        document.getElementById('btn-pause-ingame').addEventListener('click', () => this.togglePause());

        document.getElementById('btn-touch-toggle').addEventListener('click', () => {
            const isVisible = touchController.toggleVisibility();
            const btn = document.getElementById('btn-touch-toggle');
            if (btn) btn.classList.toggle('active', isVisible);
        });

        document.getElementById('btn-audio-toggle').addEventListener('click', () => {
            const isMuted = soundManager.toggleMute();
            voiceEngine.setMuted(isMuted);
            const audioBtn = document.getElementById('btn-audio-toggle');
            if (audioBtn) {
                audioBtn.innerText = isMuted ? '🔇' : '🔊';
                audioBtn.classList.toggle('muted', isMuted);
            }
        });

        // Orientation Dismissal
        const orientDismiss = document.getElementById('btn-dismiss-orientation');
        if (orientDismiss) {
            orientDismiss.addEventListener('click', () => {
                this.orientationDismissed = true;
                document.getElementById('orientation-overlay').classList.add('hidden');
            });
        }

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

        window.addEventListener('resize', () => {
            this.onWindowResize();
            this.checkOrientation();
        });
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.onWindowResize();
                this.checkOrientation();
            }, 200);
        });
    }

    checkOrientation() {
        const orientModal = document.getElementById('orientation-overlay');
        if (!orientModal) return;
        const isMobilePortrait = window.innerWidth <= 850 && window.innerHeight > window.innerWidth;
        if (isMobilePortrait && !this.orientationDismissed && (this.gameState === 'FIGHTING' || this.gameState === 'CHAR_SELECT')) {
            orientModal.classList.remove('hidden');
        } else {
            orientModal.classList.add('hidden');
        }
    }

    initInputListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (this.gameState === 'FIGHTING') {
                // Key P: POWER ATTACK
                if (e.code === 'KeyP') {
                    this.p1.usePower();
                    this.showCombatAction('power');
                }
                // Key F or J: PUNCH
                if (e.code === 'KeyF' || e.code === 'KeyJ') {
                    this.p1.punch();
                    this.showCombatAction('punch');
                }
                // Key H or K: KICK
                if (e.code === 'KeyH' || e.code === 'KeyK') {
                    this.p1.kick();
                    this.showCombatAction('kick');
                }
                // Key G or L: DAO GRAPPLE SLAM
                if (e.code === 'KeyG' || e.code === 'KeyL') {
                    this.p1.daoStrike(this.p2);
                    this.showCombatAction('dao');
                }
                // Key Q or Shift: GUARD
                if (e.code === 'KeyQ' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                    this.p1.block();
                    this.showCombatAction('block');
                }
            }

            if (e.code === 'Escape' && (this.gameState === 'FIGHTING' || this.gameState === 'PAUSED')) {
                this.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'KeyQ' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.p1.unblock();
            }
        });
    }

    onWindowResize() {
        if (!this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    openCharSelect(mode) {
        this.gameMode = mode;
        document.getElementById('p2-header-label').innerText = mode === '2P' ? 'PLAYER 2' : (mode === 'PRACTICE' ? 'DUMMY BOT' : '3D CPU OPPONENT');
        this.showScreen('char-select-screen');
        voiceEngine.announceSelect();
        this.checkOrientation();
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

        // Update Stat Bars
        if (p1Data.stats) {
            document.getElementById('p1-stat-power').style.width = p1Data.stats.power + '%';
            document.getElementById('p1-stat-speed').style.width = p1Data.stats.speed + '%';
            document.getElementById('p1-stat-defense').style.width = p1Data.stats.defense + '%';
        }
        if (p2Data.stats) {
            document.getElementById('p2-stat-power').style.width = p2Data.stats.power + '%';
            document.getElementById('p2-stat-speed').style.width = p2Data.stats.speed + '%';
            document.getElementById('p2-stat-defense').style.width = p2Data.stats.defense + '%';
        }

        // Update Real Portrait Images
        const p1Img = document.getElementById('p1-portrait-img');
        const p2Img = document.getElementById('p2-portrait-img');
        if (p1Img) p1Img.src = `images/${this.p1.characterId}.jpg`;
        if (p2Img) p2Img.src = `images/${this.p2.characterId}.jpg`;

        const p1SelImg = document.getElementById('p1-select-img');
        const p2SelImg = document.getElementById('p2-select-img');
        if (p1SelImg) p1SelImg.src = `images/${this.p1.characterId}.jpg`;
        if (p2SelImg) p2SelImg.src = `images/${this.p2.characterId}.jpg`;

        const vs1Img = document.getElementById('vs-p1-img');
        const vs2Img = document.getElementById('vs-p2-img');
        if (vs1Img) vs1Img.src = `images/${this.p1.characterId}.jpg`;
        if (vs2Img) vs2Img.src = `images/${this.p2.characterId}.jpg`;
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

        const roundBadge = document.getElementById('round-number-badge');
        if (this.roundNumber >= 3) {
            roundBadge.innerText = 'FINAL ROUND';
        } else {
            roundBadge.innerText = `ROUND ${this.roundNumber}`;
        }

        if (this.timerInterval) clearInterval(this.timerInterval);

        const banner = document.getElementById('announcer-banner');
        const text = document.getElementById('announcer-text');
        banner.classList.remove('hidden');
        text.innerText = 'READY...';

        if (this.roundNumber === 1) voiceEngine.announceRound1();
        else if (this.roundNumber === 2) voiceEngine.announceRound2();
        else voiceEngine.announceFinalRound();

        setTimeout(() => {
            text.innerText = 'FIGHT!';
            setTimeout(() => {
                // Force-hide and clear the announcer banner
                banner.classList.add('hidden');
                banner.style.display = 'none';
                text.innerText = '';
                this.gameState = 'FIGHTING';
                soundManager.startFightBGM();
                this.startTimer();
                this.checkOrientation();
            }, 550);
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

        // Virtual joystick axis & keys
        const leftHeld = this.keys['KeyA'] || touchController.activeStates.left;
        const rightHeld = this.keys['KeyD'] || touchController.activeStates.right;
        if (leftHeld && !rightHeld) this.p1.moveLeft();
        else if (rightHeld && !leftHeld) this.p1.moveRight();
        else if (!touchController.isDraggingJoystick) this.p1.stopMove();

        if (this.keys['KeyS'] || touchController.activeStates.down) this.p1.crouch();
        else if (!touchController.activeStates.down && !this.keys['KeyS']) this.p1.uncrouch();

        if (this.keys['KeyW']) this.p1.jump();

        // 2-Player Local Mode
        if (this.gameMode === '2P') {
            if (this.keys['ArrowLeft']) this.p2.moveLeft();
            else if (this.keys['ArrowRight']) this.p2.moveRight();
            else this.p2.stopMove();

            if (this.keys['ArrowDown']) this.p2.crouch();
            else this.p2.uncrouch();

            if (this.keys['ArrowUp']) this.p2.jump();
            if (this.keys['Numpad1']) this.p2.punch();
            if (this.keys['Numpad2']) this.p2.kick();
            if (this.keys['Numpad3']) this.p2.daoStrike(this.p1);
            if (this.keys['Numpad0']) this.p2.usePower();
        } else if (this.gameMode === 'CPU' && this.cpu) {
            this.cpu.update();
        }
    }

    checkCollisions() {
        if (this.gameState !== 'FIGHTING') return;

        const dist = Math.abs(this.p1.x - this.p2.x);

        // Melee Strikes
        if (this.p1.isAttacking() && !this.p1.hasHitEnemy && dist < 2.3) {
            this.p1.hasHitEnemy = true;
            const dmg = this.p1.activeHitbox ? this.p1.activeHitbox.damage : 12;
            this.p2.takeDamage(dmg, 18, this.p1);
            this.shakeCamera(0.38, 9);
            if (this.p2.health <= 0) this.onKnockout(this.p1, this.p2);
        }

        if (this.p2.isAttacking() && !this.p2.hasHitEnemy && dist < 2.3) {
            this.p2.hasHitEnemy = true;
            const dmg = this.p2.activeHitbox ? this.p2.activeHitbox.damage : 12;
            this.p1.takeDamage(dmg, 18, this.p2);
            this.shakeCamera(0.38, 9);
            if (this.p1.health <= 0) this.onKnockout(this.p2, this.p1);
        }

        // Power Projectiles
        for (const proj of projectileManager3D.projectiles) {
            if (!proj.isActive) continue;
            const target = proj.owner === 'p1' ? this.p2 : this.p1;
            const attacker = proj.owner === 'p1' ? this.p1 : this.p2;

            if (Math.abs(proj.x - target.x) < 1.6) {
                proj.destroy();
                target.takeDamage(proj.damage, 24, attacker);
                this.shakeCamera(0.50, 14);
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
        banner.style.display = '';      // Restore after force-hide
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
                }, 2400);
            } else {
                text.innerText = `ROUND ${this.roundNumber} COMPLETE`;
                this.showCombatAction('next-round', `Next round begins shortly`);
                setTimeout(() => this.startMatch(), 1800);
            }
        }, 1200);
    }

    showCombatAction(action, detail = '') {
        const labels = {
            power: ['UNIQUE POWER [P]', 'Elemental Ki Energy Blast'],
            punch: ['PUNCH STRIKE [F/J]', 'Heavy Boxing Jab'],
            kick: ['MARTIAL KICK [H/K]', 'High Impact Kick'],
            dao: ['DAO TAKEDOWN [G/L]', 'Martial Arts Takedown Strike'],
            block: ['GUARD SHIELD [Q]', 'Energy Defense Barrier'],
            jump: ['AERIAL JUMP', 'Airborne Attack Stance'],
            'match-winner': ['MATCH CHAMPION', detail],
            'next-round': ['NEXT ROUND', detail]
        };
        const result = labels[action] || ['READY', detail || 'Engage opponent with attacks.'];
        document.getElementById('combat-action').innerText = result[0];
        document.getElementById('combat-detail').innerText = result[1];
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
            const vec = new THREE.Vector3(fighter.x, fighter.y + 3.2, fighter.z);
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
        const now = performance.now();
        if (now - this.lastHudUpdate < 80) return;
        this.lastHudUpdate = now;

        const p1Pct = (this.p1.health / this.p1.maxHealth * 100);
        const p2Pct = (this.p2.health / this.p2.maxHealth * 100);

        document.getElementById('p1-health-fill').style.width = p1Pct + '%';
        document.getElementById('p2-health-fill').style.width = p2Pct + '%';

        const d1 = document.getElementById('p1-health-damage');
        const d2 = document.getElementById('p2-health-damage');
        if (d1) d1.style.width = p1Pct + '%';
        if (d2) d2.style.width = p2Pct + '%';

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

        // Dynamic Camera Zoom & Center Track
        const midX = (this.p1.x + this.p2.x) / 2;
        const dist = Math.abs(this.p1.x - this.p2.x);
        this.camera.position.x += (midX - this.camera.position.x) * 0.06;
        this.camera.position.z += (Math.max(10, 8.5 + dist * 0.45) - this.camera.position.z) * 0.06;
        this.camera.lookAt(midX, 2.2, 0);

        // Screen Shake
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
