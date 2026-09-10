/* ==========================================================================
   CYBER CLASH FIGHTER ENTITY ENGINE
   Handles fighter physics, state machine, hitboxes, health & super energy.
   ========================================================================== */

class Fighter {
    constructor(id, characterId, x, isP1 = true, isP2Recolor = false) {
        this.id = id; // 'p1' or 'p2'
        this.characterId = characterId;
        this.isP1 = isP1;
        this.isP2Recolor = isP2Recolor;

        // Position & Physics
        this.x = x;
        this.y = 580; // Ground Y level
        this.vx = 0;
        this.vy = 0;
        this.facing = isP1 ? 1 : -1;
        this.isGrounded = true;
        this.speed = 7;
        this.jumpForce = -17;
        this.gravity = 0.85;

        // Dimensions for hurtbox
        this.width = 70;
        this.height = 130;

        // Health & Super Energy
        this.maxHealth = 100;
        this.health = 100;
        this.energy = 0; // 0 to 100
        this.wins = 0;
        this.combo = 0;
        this.comboTimer = 0;

        // State Machine: IDLE, WALK, CROUCH, JUMP, BLOCK, PUNCH_LIGHT, PUNCH_HEAVY, KICK, SPECIAL_1, SPECIAL_2, HURT, KNOCKOUT, WIN
        this.state = 'IDLE';
        this.animFrame = 0;
        this.attackTimer = 0;
        this.hitStunTimer = 0;
        this.activeHitbox = null;
        this.hasHitEnemy = false;
    }

    resetPosition(x) {
        this.x = x;
        this.y = 580;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.energy = 0;
        this.state = 'IDLE';
        this.isGrounded = true;
        this.combo = 0;
        this.facing = this.isP1 ? 1 : -1;
    }

    update(enemy) {
        this.animFrame++;

        // Combo decay timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        // Hit Stun Recovery
        if (this.state === 'HURT') {
            this.hitStunTimer--;
            if (this.hitStunTimer <= 0) {
                this.state = 'IDLE';
            }
            this.applyPhysics();
            return;
        }

        if (this.state === 'KNOCKOUT') {
            this.applyPhysics();
            return;
        }

        // Face enemy if not locked in attack
        if (!this.isAttacking() && this.state !== 'HURT') {
            this.facing = (this.x < enemy.x) ? 1 : -1;
        }

        // Attack Timer Update
        if (this.isAttacking()) {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.state = 'IDLE';
                this.activeHitbox = null;
                this.hasHitEnemy = false;
            }
        }

        this.applyPhysics();
    }

    applyPhysics() {
        this.x += this.vx;
        this.y += this.vy;

        // Gravity
        if (!this.isGrounded) {
            this.vy += this.gravity;
        }

        // Ground Collision
        if (this.y >= 580) {
            this.y = 580;
            if (!this.isGrounded) {
                particleManager.createDust(this.x, 580);
            }
            this.isGrounded = true;
            this.vy = 0;
        }

        // Screen Boundary Constraints
        this.x = Math.max(50, Math.min(1230, this.x));
    }

    // Input Actions
    moveLeft() {
        if (this.canMove()) {
            this.vx = -this.speed;
            if (this.isGrounded && this.state !== 'WALK') this.state = 'WALK';
        }
    }

    moveRight() {
        if (this.canMove()) {
            this.vx = this.speed;
            if (this.isGrounded && this.state !== 'WALK') this.state = 'WALK';
        }
    }

    stopMove() {
        if (this.state === 'WALK') {
            this.vx = 0;
            this.state = 'IDLE';
        }
    }

    crouch() {
        if (this.canMove() && this.isGrounded) {
            this.vx = 0;
            this.state = 'CROUCH';
        }
    }

    uncrouch() {
        if (this.state === 'CROUCH') {
            this.state = 'IDLE';
        }
    }

    jump() {
        if (this.canMove() && this.isGrounded) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
            this.state = 'JUMP';
            particleManager.createDust(this.x, 580);
        }
    }

    block() {
        if (this.canMove() && this.isGrounded) {
            this.vx = 0;
            this.state = 'BLOCK';
        }
    }

    unblock() {
        if (this.state === 'BLOCK') {
            this.state = 'IDLE';
        }
    }

    // Attacks
    punchLight() {
        if (!this.canAttack()) return;
        this.state = 'PUNCH_LIGHT';
        this.attackTimer = 14;
        this.vx = 0;
        soundManager.playLightPunch();
        this.activeHitbox = { offsetX: 40 * this.facing, offsetY: -85, width: 55, height: 35, damage: 7, stun: 12 };
    }

    punchHeavy() {
        if (!this.canAttack()) return;
        this.state = 'PUNCH_HEAVY';
        this.attackTimer = 22;
        this.vx = 0;
        soundManager.playHeavyPunch();
        this.activeHitbox = { offsetX: 50 * this.facing, offsetY: -90, width: 65, height: 45, damage: 14, stun: 20 };
    }

    kick() {
        if (!this.canAttack()) return;
        this.state = 'KICK';
        this.attackTimer = 18;
        this.vx = 0;
        soundManager.playKick();
        this.activeHitbox = { offsetX: 45 * this.facing, offsetY: -50, width: 60, height: 40, damage: 10, stun: 16 };
    }

    special1() {
        if (!this.canAttack()) return;
        this.state = 'SPECIAL_1';
        this.attackTimer = 25;
        this.vx = 0;
        
        // Spawn Projectile
        const projX = this.x + 50 * this.facing;
        const projY = this.y - 75;
        const charData = FIGHTER_ROSTER[this.characterId];
        projectileManager.spawn(this.id, 'PLASMA', projX, projY, this.facing, 18, charData.colors.primary);
    }

    special2() {
        if (!this.canAttack()) return;
        this.state = 'SPECIAL_2';
        this.attackTimer = 28;
        this.vx = 8 * this.facing; // Dash Forward Uppercut
        this.vy = -8;
        this.isGrounded = false;
        soundManager.playSpecialMove();
        this.activeHitbox = { offsetX: 55 * this.facing, offsetY: -100, width: 75, height: 60, damage: 22, stun: 25 };
    }

    // Hit Registration Logic
    takeDamage(damage, stunFrames, attacker) {
        if (this.state === 'BLOCK') {
            this.health -= Math.floor(damage * 0.2); // Block reduces 80% damage
            soundManager.playBlock();
            particleManager.createHitSparks(this.x, this.y - 80, '#ffffff', 8);
            this.energy = Math.min(100, this.energy + 3);
            return;
        }

        this.health = Math.max(0, this.health - damage);
        this.hitStunTimer = stunFrames;
        this.state = (this.health <= 0) ? 'KNOCKOUT' : 'HURT';
        this.vx = -4 * this.facing; // Pushback

        // Attacker Gain Combo & Energy
        attacker.combo++;
        attacker.comboTimer = 90; // 1.5s combo window
        attacker.energy = Math.min(100, attacker.energy + 10);

        if (this.health <= 0) {
            soundManager.playKO();
            particleManager.createBurst(this.x, this.y - 80, '#ff0033', 35);
        } else {
            const charData = FIGHTER_ROSTER[attacker.characterId];
            particleManager.createHitSparks(this.x, this.y - 80, charData.colors.primary, 20);
        }
    }

    canMove() {
        return this.state === 'IDLE' || this.state === 'WALK';
    }

    canAttack() {
        return !this.isAttacking() && this.state !== 'HURT' && this.state !== 'KNOCKOUT';
    }

    isAttacking() {
        return ['PUNCH_LIGHT', 'PUNCH_HEAVY', 'KICK', 'SPECIAL_1', 'SPECIAL_2'].includes(this.state);
    }

    getHurtbox() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height,
            width: this.width,
            height: this.height
        };
    }

    getAbsoluteHitbox() {
        if (!this.activeHitbox) return null;
        return {
            x: this.x + (this.facing === 1 ? 0 : -this.activeHitbox.width) + this.activeHitbox.offsetX,
            y: this.y + this.activeHitbox.offsetY,
            width: this.activeHitbox.width,
            height: this.activeHitbox.height,
            damage: this.activeHitbox.damage,
            stun: this.activeHitbox.stun
        };
    }
}
