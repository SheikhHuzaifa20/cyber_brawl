/* ==========================================================================
   CYBER BRAWL 3D MOBILE VIRTUAL TOUCH CONTROLLER ENGINE
   Binds touch & mouse events on virtual D-Pad and arcade attack action buttons.
   ========================================================================== */

class TouchControllerManager {
    constructor() {
        this.isEnabled = true;
        this.activeStates = {
            up: false,
            down: false,
            left: false,
            right: false,
            lpunch: false,
            hpunch: false,
            kick: false,
            spec1: false,
            spec2: false,
            block: false
        };

        this.initListeners();
    }

    initListeners() {
        const bindButton = (id, keyName) => {
            const el = document.getElementById(id);
            if (!el) return;

            const startAction = (e) => {
                if (e.cancelable) e.preventDefault();
                this.activeStates[keyName] = true;
                if (keyName === 'block') el.classList.add('guard-active');
                this.triggerGameInput(keyName, true);
            };

            const endAction = (e) => {
                if (e.cancelable) e.preventDefault();
                this.activeStates[keyName] = false;
                if (keyName === 'block') el.classList.remove('guard-active');
                this.triggerGameInput(keyName, false);
            };

            el.addEventListener('pointerdown', (e) => {
                if (e.cancelable) e.preventDefault();
                try {
                    if (e.pointerId !== undefined) el.setPointerCapture?.(e.pointerId);
                } catch (error) {}
                startAction(e);
            });
            el.addEventListener('pointerup', endAction);
            el.addEventListener('pointercancel', endAction);
            el.addEventListener('lostpointercapture', endAction);
        };

        // Bind D-Pad
        bindButton('btn-touch-up', 'up');
        bindButton('btn-touch-down', 'down');
        bindButton('btn-touch-left', 'left');
        bindButton('btn-touch-right', 'right');

        // Bind Action Attacks
        bindButton('btn-touch-lpunch', 'lpunch');
        bindButton('btn-touch-hpunch', 'hpunch');
        bindButton('btn-touch-kick', 'kick');
        bindButton('btn-touch-spec1', 'spec1');
        bindButton('btn-touch-spec2', 'spec2');
        bindButton('btn-touch-block', 'block');
    }

    triggerGameInput(keyName, isPressed) {
        if (!window.gameInstance || window.gameInstance.gameState !== 'FIGHTING') return;

        const p1 = window.gameInstance.p1;
        if (!p1) return;

        if (isPressed) {
            if (keyName === 'left') p1.moveLeft();
            else if (keyName === 'right') p1.moveRight();
            else if (keyName === 'up') p1.jump();
            else if (keyName === 'down') p1.crouch();
            else if (keyName === 'lpunch') p1.punchLight();
            else if (keyName === 'hpunch') p1.punchHeavy();
            else if (keyName === 'kick') p1.kick();
            else if (keyName === 'spec1') p1.special1();
            else if (keyName === 'spec2') p1.special2();
            else if (keyName === 'block') p1.block();
            if (window.gameInstance) window.gameInstance.showCombatAction(keyName);
        } else {
            if (keyName === 'left' || keyName === 'right') p1.stopMove();
            else if (keyName === 'down') p1.uncrouch();
            else if (keyName === 'block') p1.unblock();
        }
    }

    updateHeldInput(fighter) {
        if (!fighter) return;
        if (this.activeStates.left && !this.activeStates.right) fighter.moveLeft();
        else if (this.activeStates.right && !this.activeStates.left) fighter.moveRight();
        else if (!this.activeStates.left && !this.activeStates.right) fighter.stopMove();

        if (this.activeStates.down) fighter.crouch();
        else fighter.uncrouch();
    }

    toggleVisibility() {
        this.isEnabled = !this.isEnabled;
        const overlay = document.getElementById('touch-controller-overlay');
        if (overlay) {
            if (this.isEnabled) overlay.classList.remove('hidden');
            else overlay.classList.add('hidden');
        }
        return this.isEnabled;
    }
}

const touchController = new TouchControllerManager();
