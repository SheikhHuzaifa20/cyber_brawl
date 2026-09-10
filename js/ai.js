/* ==========================================================================
   CYBER CLASH CPU OPPONENT AI ENGINE
   Dynamic decision tree for spacing, reactive blocking, combo execution & specials.
   ========================================================================== */

class CPUController {
    constructor(fighter, target) {
        this.fighter = fighter;
        this.target = target;
        this.decisionTimer = 0;
        this.reactionDelay = 12; // Decision frames
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
        if (isTargetAttacking && dist < 120) {
            if (Math.random() < 0.75) {
                this.fighter.block();
                return;
            }
        } else if (this.fighter.state === 'BLOCK') {
            this.fighter.unblock();
        }

        // 2. Anti-Air Decision (If target is jumping near CPU)
        if (!this.target.isGrounded && dist < 150) {
            if (Math.random() < 0.8) {
                this.fighter.special2(); // Dragon Uppercut Anti-Air
                return;
            }
        }

        // 3. Melee Attack Distance (< 100px)
        if (dist < 100) {
            const rand = Math.random();
            if (rand < 0.35) {
                this.fighter.punchLight();
            } else if (rand < 0.65) {
                this.fighter.kick();
            } else if (rand < 0.85) {
                this.fighter.punchHeavy();
            } else {
                this.fighter.special2();
            }
            return;
        }

        // 4. Mid Distance Spacing (100px - 280px)
        if (dist >= 100 && dist <= 280) {
            if (Math.random() < 0.4) {
                this.fighter.special1(); // Projectile Blast
            } else if (Math.random() < 0.7) {
                if (this.fighter.x < this.target.x) this.fighter.moveRight();
                else this.fighter.moveLeft();
            } else {
                this.fighter.jump();
            }
            return;
        }

        // 5. Far Distance Spacing (> 280px)
        if (dist > 280) {
            if (Math.random() < 0.5) {
                this.fighter.special1();
            } else {
                if (this.fighter.x < this.target.x) this.fighter.moveRight();
                else this.fighter.moveLeft();
            }
        }
    }
}
