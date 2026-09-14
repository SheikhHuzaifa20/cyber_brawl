/* ==========================================================================
   CYBER BRAWL 3D VIP VIRTUAL ANALOG JOYSTICK & ARCADE CONTROLLER ENGINE
   Interactive 360° Drag Joystick with 5 Core Combat Buttons:
   1. ⚡ POWER [P]  2. 🥊 PUNCH [F/J]  3. 🦵 KICK [H/K]  4. 🥋 DAO [G/L]  5. 🛡️ GUARD [Q]
   ========================================================================== */

class TouchControllerManager {
    constructor() {
        this.isEnabled = true;
        this.isDraggingJoystick = false;
        this.joystickPointerId = null;
        this.baseCenter = { x: 0, y: 0 };
        this.maxRadius = 50;

        this.axisX = 0; // -1 (left) to +1 (right)
        this.axisY = 0; // -1 (up) to +1 (down)

        this.activeStates = {
            up: false,
            down: false,
            left: false,
            right: false,
            punch: false,
            kick: false,
            dao: false,
            power: false,
            block: false
        };

        this.initJoystick();
        this.initActionButtons();
    }

    initJoystick() {
        const base = document.getElementById('joystick-base');
        const stick = document.getElementById('joystick-stick');
        const zone = document.getElementById('joystick-zone') || base;
        if (!base || !stick) return;

        const onPointerDown = (e) => {
            if (e.cancelable) e.preventDefault();
            this.isDraggingJoystick = true;
            this.joystickPointerId = e.pointerId;
            try {
                if (base.setPointerCapture) base.setPointerCapture(e.pointerId);
            } catch (err) {}

            const rect = base.getBoundingClientRect();
            this.baseCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            this.maxRadius = Math.max(35, rect.width * 0.38);

            base.classList.add('joystick-active');
            this.handleJoystickMove(e.clientX, e.clientY, stick);
        };

        const onPointerMove = (e) => {
            if (!this.isDraggingJoystick) return;
            if (this.joystickPointerId !== null && e.pointerId !== this.joystickPointerId) return;
            if (e.cancelable) e.preventDefault();
            this.handleJoystickMove(e.clientX, e.clientY, stick);
        };

        const onPointerUp = (e) => {
            if (!this.isDraggingJoystick) return;
            if (this.joystickPointerId !== null && e.pointerId !== this.joystickPointerId) return;
            if (e.cancelable) e.preventDefault();
            this.resetJoystick(stick, base);
        };

        base.addEventListener('pointerdown', onPointerDown);
        if (zone !== base) zone.addEventListener('pointerdown', onPointerDown);

        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp, { passive: false });
        window.addEventListener('pointercancel', onPointerUp, { passive: false });
    }

    handleJoystickMove(clientX, clientY, stick) {
        const dx = clientX - this.baseCenter.x;
        const dy = clientY - this.baseCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let clampedDist = Math.min(dist, this.maxRadius);
        let angle = Math.atan2(dy, dx);

        const stickX = Math.cos(angle) * clampedDist;
        const stickY = Math.sin(angle) * clampedDist;

        stick.style.transform = `translate(${stickX}px, ${stickY}px)`;

        // Normalized axes (-1 to +1)
        this.axisX = (clampedDist > 8) ? stickX / this.maxRadius : 0;
        this.axisY = (clampedDist > 8) ? stickY / this.maxRadius : 0;

        const prevUp = this.activeStates.up;
        const prevDown = this.activeStates.down;
        const prevLeft = this.activeStates.left;
        const prevRight = this.activeStates.right;

        this.activeStates.left = this.axisX < -0.28;
        this.activeStates.right = this.axisX > 0.28;
        this.activeStates.up = this.axisY < -0.38;
        this.activeStates.down = this.axisY > 0.35;

        const p1 = window.gameInstance?.p1;
        if (!p1 || window.gameInstance?.gameState !== 'FIGHTING') return;

        // Jump impulse trigger on upward flick
        if (this.activeStates.up && !prevUp) {
            p1.jump();
            window.gameInstance.showCombatAction('jump');
        }

        // Crouch state
        if (this.activeStates.down && !prevDown) {
            p1.crouch();
        } else if (!this.activeStates.down && prevDown) {
            p1.uncrouch();
        }

        // Horizontal movement (Fast combat advance vs retreat)
        if (this.activeStates.left) {
            p1.moveLeft();
        } else if (this.activeStates.right) {
            p1.moveRight();
        } else if (prevLeft || prevRight) {
            p1.stopMove();
        }
    }

    resetJoystick(stick, base) {
        this.isDraggingJoystick = false;
        this.joystickPointerId = null;
        this.axisX = 0;
        this.axisY = 0;

        stick.style.transform = `translate(0px, 0px)`;
        base.classList.remove('joystick-active');

        this.activeStates.left = false;
        this.activeStates.right = false;
        this.activeStates.up = false;
        this.activeStates.down = false;

        const p1 = window.gameInstance?.p1;
        if (p1) {
            p1.stopMove();
            p1.uncrouch();
        }
    }

    initActionButtons() {
        const bindButton = (id, keyName) => {
            const el = document.getElementById(id);
            if (!el) return;

            const startAction = (e) => {
                if (e.cancelable) e.preventDefault();
                this.activeStates[keyName] = true;
                el.classList.add('active');
                if (keyName === 'block') el.classList.add('guard-active');
                this.triggerGameInput(keyName, true);
            };

            const endAction = (e) => {
                if (e.cancelable) e.preventDefault();
                this.activeStates[keyName] = false;
                el.classList.remove('active', 'guard-active');
                this.triggerGameInput(keyName, false);
            };

            el.addEventListener('pointerdown', (e) => {
                if (e.cancelable) e.preventDefault();
                try {
                    if (e.pointerId !== undefined && el.setPointerCapture) el.setPointerCapture(e.pointerId);
                } catch (error) {}
                startAction(e);
            });
            el.addEventListener('pointerup', endAction);
            el.addEventListener('pointercancel', endAction);
            el.addEventListener('lostpointercapture', endAction);
        };

        // Bind the 5 VIP Combat Buttons
        bindButton('btn-touch-power', 'power');
        bindButton('btn-touch-punch', 'punch');
        bindButton('btn-touch-kick', 'kick');
        bindButton('btn-touch-dao', 'dao');
        bindButton('btn-touch-block', 'block');
    }

    triggerGameInput(keyName, isPressed) {
        if (!window.gameInstance || window.gameInstance.gameState !== 'FIGHTING') return;

        const p1 = window.gameInstance.p1;
        if (!p1) return;

        if (isPressed) {
            if (keyName === 'power') p1.usePower();
            else if (keyName === 'punch') p1.punch();
            else if (keyName === 'kick') p1.kick();
            else if (keyName === 'dao') p1.daoStrike();
            else if (keyName === 'block') p1.block();
            window.gameInstance.showCombatAction(keyName);
        } else {
            if (keyName === 'block') p1.unblock();
        }
    }

    updateHeldInput(fighter) {
        if (!fighter) return;
        if (this.activeStates.left && !this.activeStates.right) fighter.moveLeft();
        else if (this.activeStates.right && !this.activeStates.left) fighter.moveRight();
        else if (!this.activeStates.left && !this.activeStates.right && !this.isDraggingJoystick) fighter.stopMove();

        if (this.activeStates.down) fighter.crouch();
        else if (!this.isDraggingJoystick) fighter.uncrouch();
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
