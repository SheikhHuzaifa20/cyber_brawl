/* ==========================================================================
   CYBER BRAWL 3D CPU OPPONENT AI ENGINE
   Dynamic decision tree for 3D spacing, reactive blocking, combos & specials.
   ========================================================================== */

class CPUController {
    constructor(fighter, target, difficultyLevel = 1) {
        this.fighter = fighter;
        this.target = target;
        this.difficultyLevel = Math.max(1, Math.floor(difficultyLevel));
        this.decisionTimer = 0;
        this.reactionDelay = Math.max(10, (fighter?.isTrainingDummy ? 42 : 28) - (this.difficultyLevel - 1) * 2);
        this.attackCooldownLength = Math.max(20, 48 - (this.difficultyLevel - 1) * 2);
        this.blockChance = Math.min(0.68, 0.38 + (this.difficultyLevel - 1) * 0.025);
        this.powerChance = Math.min(0.5, 0.18 + (this.difficultyLevel - 1) * 0.02);
        this.attackCooldown = 0;
    }

    update() {
        if (!this.fighter || !this.target) return;
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.fighter.state === 'HURT' || this.fighter.state === 'KNOCKOUT') return;

        this.decisionTimer++;
        if (this.decisionTimer < this.reactionDelay) return;
        this.decisionTimer = 0;

        const dist = Math.abs(this.fighter.x - this.target.x);
        const isTargetAttacking = this.target.isAttacking();

        // 1. Reactive Block Decision
        if (isTargetAttacking && dist < 3.2) {
            if (Math.random() < this.blockChance) {
                this.fighter.block();
                return;
            }
        } else if (this.fighter.state === 'BLOCK') {
            this.fighter.unblock();
        }

        // 2. Anti-Air Decision (If target is jumping near CPU)
        if (!this.target.isGrounded && dist < 3.5) {
            if (this.attackCooldown === 0 && Math.random() < 0.3) {
                this.fighter.kick();
                this.attackCooldown = this.attackCooldownLength;
                return;
            }
        }

        // 3. Melee Attack Distance (dist < 2.4 units)
        if (dist < 2.4 && this.attackCooldown === 0) {
            const rand = Math.random();
            if (rand < 0.5) {
                this.fighter.punch();
            } else if (rand < 0.85) {
                this.fighter.kick();
            } else {
                this.fighter.daoStrike(this.target);
            }
            this.attackCooldown = this.attackCooldownLength;
            return;
        }

        // 4. Mid Distance Spacing (2.4 to 6.5 units)
        if (dist >= 2.4 && dist <= 6.5) {
            const rand = Math.random();
            if (rand < this.powerChance && this.fighter.energy >= 100) {
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
            if (this.fighter.energy >= 100 && Math.random() < 0.2) {
                this.fighter.usePower();
            } else {
                if (this.fighter.x < this.target.x) this.fighter.moveRight();
                else this.fighter.moveLeft();
            }
        }
    }
}
