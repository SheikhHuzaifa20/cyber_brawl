/* ==========================================================================
   CYBER BRAWL 3D CPU OPPONENT AI ENGINE
   Dynamic decision tree for 3D spacing, reactive blocking, combos & specials.
   ========================================================================== */

class CPUController {
    constructor(fighter, target) {
        this.fighter = fighter;
        this.target = target;
        this.decisionTimer = 0;
        this.reactionDelay = 10; // Decision frames
    }

    update() {
        if (!this.fighter || !this.target) return;
        if (this.fighter.state === 'HURT' || this.fighter.state === 'KNOCKOUT') return;

        this.decisionTimer++;
        if (this.decisionTimer < this.reactionDelay) return;
        this.decisionTimer = 0;

        const dist = Math.abs(this.fighter.x - this.target.x);
        const isTargetAttacking = this.target.isAttacking();

        // 1. Reactive Block Decision
        if (isTargetAttacking && dist < 3.2) {
            if (Math.random() < 0.65) {
                this.fighter.block();
                return;
            }
        } else if (this.fighter.state === 'BLOCK') {
            this.fighter.unblock();
        }

        // 2. Anti-Air Decision (If target is jumping near CPU)
        if (!this.target.isGrounded && dist < 3.5) {
            if (Math.random() < 0.75) {
                this.fighter.daoStrike(); // Rising Dragon Uppercut Anti-Air
                return;
            }
        }

        // 3. Melee Attack Distance (dist < 2.4 units)
        if (dist < 2.4) {
            const rand = Math.random();
            if (rand < 0.30) {
                this.fighter.punch();
            } else if (rand < 0.55) {
                this.fighter.kick();
            } else if (rand < 0.75) {
                this.fighter.punch();
            } else if (rand < 0.90) {
                this.fighter.kick();
            } else {
                this.fighter.daoStrike();
            }
            return;
        }

        // 4. Mid Distance Spacing (2.4 to 6.5 units)
        if (dist >= 2.4 && dist <= 6.5) {
            const rand = Math.random();
            if (rand < 0.35) {
                this.fighter.usePower(); // Ki Hadouken Projectile
            } else if (rand < 0.75) {
                // Advance or retreat
                if (this.fighter.x < this.target.x) this.fighter.moveRight();
                else this.fighter.moveLeft();
            } else {
                this.fighter.jump();
            }
            return;
        }

        // 5. Far Distance Spacing (> 6.5 units)
        if (dist > 6.5) {
            if (Math.random() < 0.40) {
                this.fighter.usePower();
            } else {
                if (this.fighter.x < this.target.x) this.fighter.moveRight();
                else this.fighter.moveLeft();
            }
        }
    }
}
