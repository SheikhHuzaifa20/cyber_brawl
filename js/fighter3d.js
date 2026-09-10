/* ==========================================================================
   CYBER BRAWL 3D ULTRA FIGHTER ENGINE
   Male Bodybuilder & Female Ninja/Martial Artist 3D Meshes & Skeletal Rigging
   ========================================================================== */

const ULTRA_ROSTER = {
    titan: {
        id: 'titan',
        name: 'TITAN REX',
        title: 'MALE BODYBUILDER HEAVYWEIGHT',
        type: 'MALE',
        rank: 'SUPER DIAMOND RANK',
        vtrigger: 'TITAN FORCE',
        colors: { primary: 0xff4400, secondary: 0x200800, skin: 0xd58555 }
    },
    mai: {
        id: 'mai',
        name: 'MAI SHIRANUI',
        title: 'FEMALE NINJA ASSASSIN',
        type: 'FEMALE',
        rank: 'DIAMOND MASTER RANK',
        vtrigger: 'NINJA BLOSSOM',
        colors: { primary: 0xcc1133, secondary: 0xffffff, skin: 0xf5cfb0 }
    },
    kyo: {
        id: 'kyo',
        name: 'KYO KUSANAGI',
        title: 'FLAME MARTIAL ARTIST',
        type: 'MALE',
        rank: 'ULTIMATE MASTER RANK',
        vtrigger: 'CRIMSON FLAME',
        colors: { primary: 0x151b33, secondary: 0xffaa00, skin: 0xe5a575 }
    },
    athena: {
        id: 'athena',
        name: 'ATHENA ASAMI',
        title: 'FEMALE PLASMA VALKYRIE',
        type: 'FEMALE',
        rank: 'GRANDMASTER RANK',
        vtrigger: 'PSYCHO POWER',
        colors: { primary: 0x00f0ff, secondary: 0x8000ff, skin: 0xfae0d0 }
    }
};

class Fighter3D {
    constructor(id, characterId, initialX, isP1 = true, isP2Recolor = false) {
        this.id = id;
        this.characterId = characterId;
        this.isP1 = isP1;
        this.isP2Recolor = isP2Recolor;

        this.x = initialX;
        this.y = 0;
        this.z = 0;
        this.vx = 0;
        this.vy = 0;
        this.facing = isP1 ? 1 : -1;
        this.isGrounded = true;

        this.speed = 0.14;
        this.jumpForce = 0.38;
        this.gravity = 0.018;

        this.maxHealth = 100;
        this.health = 100;
        this.energy = 0;
        this.combo = 0;
        this.comboTimer = 0;

        this.state = 'IDLE';
        this.animTime = 0;
        this.attackTimer = 0;
        this.hitStunTimer = 0;
        this.activeHitbox = null;
        this.hasHitEnemy = false;

        this.group = new THREE.Group();
        this.limbs = {};
        this.build3DCharacterMesh();
    }

    build3DCharacterMesh() {
        const charData = ULTRA_ROSTER[this.characterId] || ULTRA_ROSTER.titan;
        const isFemale = charData.type === 'FEMALE';
        
        const pColor = this.isP1 ? charData.colors.primary : (this.isP2Recolor ? 0xffaa00 : charData.colors.secondary);
        const sColor = charData.colors.secondary;
        const skinColor = charData.colors.skin;

        const matPrimary = new THREE.MeshStandardMaterial({ color: pColor, roughness: 0.3, metalness: 0.6 });
        const matSecondary = new THREE.MeshStandardMaterial({ color: sColor, roughness: 0.4 });
        const matSkin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });
        const matGold = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.9, roughness: 0.2 });

        // Pelvis
        const pelvisW = isFemale ? 0.7 : 0.95;
        const pelvisGeo = new THREE.BoxGeometry(pelvisW, 0.45, 0.55);
        const pelvis = new THREE.Mesh(pelvisGeo, matSecondary);
        pelvis.position.y = 1.6;
        pelvis.castShadow = true;
        this.group.add(pelvis);

        // Torso / Chest (Male Muscular V-Taper vs Female Hourglass)
        const chestTopW = isFemale ? 0.85 : 1.3;
        const chestBotW = isFemale ? 0.65 : 0.85;
        const chestGeo = new THREE.CylinderGeometry(chestTopW, chestBotW, 1.25, 10);
        const chest = new THREE.Mesh(chestGeo, isFemale ? matSecondary : matPrimary);
        chest.position.y = 0.95;
        chest.castShadow = true;
        pelvis.add(chest);

        // Male 6-Pack Abs / Female Sash
        if (!isFemale) {
            for (let i = 0; i < 3; i++) {
                const absGeo = new THREE.BoxGeometry(0.6, 0.2, 0.15);
                const abs = new THREE.Mesh(absGeo, matSkin);
                abs.position.set(0, -0.2 - i * 0.25, 0.4);
                chest.add(abs);
            }
        } else {
            // Ninja Waist Sash
            const sashGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.25, 12);
            const sash = new THREE.Mesh(sashGeo, matGold);
            sash.position.y = -0.45;
            chest.add(sash);
        }

        // Head & Hair
        const headGeo = new THREE.SphereGeometry(0.33, 16, 16);
        const head = new THREE.Mesh(headGeo, matSkin);
        head.position.y = 0.9;
        head.castShadow = true;
        chest.add(head);

        // Female Ponytail Hair / Male Headband
        if (isFemale) {
            const hairGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
            const hair = new THREE.Mesh(hairGeo, matPrimary);
            hair.rotation.x = -Math.PI / 3;
            hair.position.set(0, 0.2, -0.35);
            head.add(hair);
        } else if (this.characterId === 'kyo') {
            const bandGeo = new THREE.TorusGeometry(0.34, 0.04, 8, 16);
            const band = new THREE.Mesh(bandGeo, matGold);
            band.rotation.x = Math.PI / 2;
            head.add(band);
        }

        // Arms & Muscular Biceps
        const bicepSize = isFemale ? 0.25 : 0.42;
        const armThickness = isFemale ? 0.18 : 0.28;
        const bicepGeo = new THREE.SphereGeometry(bicepSize, 16, 16);
        const armGeo = new THREE.CylinderGeometry(armThickness, armThickness * 0.8, 0.8, 12);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(chestTopW * 0.75, 0.4, 0);
        chest.add(leftShoulder);
        leftShoulder.add(new THREE.Mesh(bicepGeo, matSkin));
        const lForearm = new THREE.Mesh(armGeo, matPrimary);
        lForearm.position.y = -0.5;
        leftShoulder.add(lForearm);

        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(-chestTopW * 0.75, 0.4, 0);
        chest.add(rightShoulder);
        rightShoulder.add(new THREE.Mesh(bicepGeo, matSkin));
        const rForearm = new THREE.Mesh(armGeo, matPrimary);
        rForearm.position.y = -0.5;
        rightShoulder.add(rForearm);

        // Legs & Thighs
        const thighW = isFemale ? 0.32 : 0.44;
        const thighGeo = new THREE.CylinderGeometry(thighW, thighW * 0.75, 0.9, 12);
        const calfGeo = new THREE.CylinderGeometry(thighW * 0.75, thighW * 0.55, 0.9, 12);

        const leftHip = new THREE.Group();
        leftHip.position.set(0.35, -0.2, 0);
        pelvis.add(leftHip);
        const lThigh = new THREE.Mesh(thighGeo, matSecondary);
        lThigh.position.y = -0.45;
        leftHip.add(lThigh);
        const lCalf = new THREE.Mesh(calfGeo, matPrimary);
        lCalf.position.y = -0.9;
        leftHip.add(lCalf);

        const rightHip = new THREE.Group();
        rightHip.position.set(-0.35, -0.2, 0);
        pelvis.add(rightHip);
        const rThigh = new THREE.Mesh(thighGeo, matSecondary);
        rThigh.position.y = -0.45;
        rightHip.add(rThigh);
        const rCalf = new THREE.Mesh(calfGeo, matPrimary);
        rCalf.position.y = -0.9;
        rightHip.add(rCalf);

        this.limbs = { pelvis, chest, head, leftShoulder, rightShoulder, leftHip, rightHip };
        this.group.position.set(this.x, this.y, this.z);
    }

    resetPosition(x) {
        this.x = x;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.energy = 0;
        this.state = 'IDLE';
        this.isGrounded = true;
        this.combo = 0;
        this.group.rotation.set(0, 0, 0);
    }

    update(enemy) {
        this.animTime += 0.08;

        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) this.combo = 0;
        }

        if (this.state === 'HURT') {
            this.hitStunTimer--;
            if (this.hitStunTimer <= 0) this.state = 'IDLE';
            this.applyPhysics();
            this.updateSkeletalPose();
            return;
        }

        if (this.state === 'KNOCKOUT') {
            this.applyPhysics();
            this.updateSkeletalPose();
            return;
        }

        if (!this.isAttacking()) {
            this.facing = (this.x < enemy.x) ? 1 : -1;
        }
        this.group.rotation.y = this.facing === 1 ? Math.PI / 2 : -Math.PI / 2;

        if (this.isAttacking()) {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.state = 'IDLE';
                this.activeHitbox = null;
                this.hasHitEnemy = false;
            }
        }

        this.applyPhysics();
        this.updateSkeletalPose();
    }

    applyPhysics() {
        this.x += this.vx;
        this.y += this.vy;

        if (!this.isGrounded) {
            this.vy -= this.gravity;
        }

        if (this.y <= 0) {
            this.y = 0;
            this.isGrounded = true;
            this.vy = 0;
        }

        this.x = Math.max(-14, Math.min(14, this.x));
        this.group.position.set(this.x, this.y, this.z);
    }

    updateSkeletalPose() {
        const { chest, leftShoulder, rightShoulder, leftHip, rightHip } = this.limbs;
        const t = this.animTime;

        if (this.state === 'IDLE') {
            chest.position.y = 0.95 + Math.sin(t * 2) * 0.03;
            leftShoulder.rotation.z = 0.2 + Math.sin(t * 2) * 0.1;
            rightShoulder.rotation.z = -0.2 - Math.sin(t * 2) * 0.1;
            leftHip.rotation.x = 0;
            rightHip.rotation.x = 0;
        } else if (this.state === 'WALK') {
            leftHip.rotation.x = Math.sin(t * 6) * 0.6;
            rightHip.rotation.x = -Math.sin(t * 6) * 0.6;
        } else if (this.state === 'PUNCH_LIGHT' || this.state === 'PUNCH_HEAVY') {
            leftShoulder.rotation.x = -Math.PI / 2.2;
        } else if (this.state === 'KICK') {
            leftHip.rotation.x = -Math.PI / 2.2;
        } else if (this.state === 'SPECIAL_1' || this.state === 'SPECIAL_2') {
            leftShoulder.rotation.x = -Math.PI / 2;
            rightShoulder.rotation.x = -Math.PI / 2;
        } else if (this.state === 'KNOCKOUT') {
            this.group.rotation.z = -Math.PI / 2;
        }
    }

    moveLeft() { if (this.canMove()) { this.vx = -this.speed; this.state = 'WALK'; } }
    moveRight() { if (this.canMove()) { this.vx = this.speed; this.state = 'WALK'; } }
    stopMove() { if (this.state === 'WALK') { this.vx = 0; this.state = 'IDLE'; } }
    crouch() { if (this.canMove() && this.isGrounded) { this.vx = 0; this.state = 'CROUCH'; } }
    uncrouch() { if (this.state === 'CROUCH') this.state = 'IDLE'; }
    jump() { if (this.canMove() && this.isGrounded) { this.vy = this.jumpForce; this.isGrounded = false; this.state = 'JUMP'; } }
    block() { if (this.canMove() && this.isGrounded) { this.vx = 0; this.state = 'BLOCK'; } }
    unblock() { if (this.state === 'BLOCK') this.state = 'IDLE'; }

    punchLight() {
        if (!this.canAttack()) return;
        this.state = 'PUNCH_LIGHT';
        this.attackTimer = 14;
        soundManager.playLightPunch();
        voiceEngine.playAttackCry(this.characterId, 'PUNCH');
        this.activeHitbox = { damage: 8, stun: 12 };
    }

    punchHeavy() {
        if (!this.canAttack()) return;
        this.state = 'PUNCH_HEAVY';
        this.attackTimer = 22;
        soundManager.playHeavyPunch();
        voiceEngine.playAttackCry(this.characterId, 'PUNCH_HEAVY');
        this.activeHitbox = { damage: 15, stun: 20 };
    }

    kick() {
        if (!this.canAttack()) return;
        this.state = 'KICK';
        this.attackTimer = 18;
        soundManager.playKick();
        voiceEngine.playAttackCry(this.characterId, 'KICK');
        this.activeHitbox = { damage: 11, stun: 16 };
    }

    special1() {
        if (!this.canAttack()) return;
        this.state = 'SPECIAL_1';
        this.attackTimer = 24;
        voiceEngine.playAttackCry(this.characterId, 'SPECIAL_1');
        const color = this.isP1 ? 0x00f0ff : 0xff0077;
        projectileManager3D.spawn(this.id, this.x + 1.2 * this.facing, 1.8, 0, this.facing, 20, color);
    }

    special2() {
        if (!this.canAttack()) return;
        this.state = 'SPECIAL_2';
        this.attackTimer = 28;
        this.vx = 0.18 * this.facing;
        this.vy = 0.25;
        this.isGrounded = false;
        soundManager.playSpecialMove();
        voiceEngine.playAttackCry(this.characterId, 'SPECIAL_2');
        this.activeHitbox = { damage: 24, stun: 26 };
    }

    takeDamage(damage, stunFrames, attacker) {
        if (this.state === 'BLOCK') {
            this.health -= Math.floor(damage * 0.2);
            soundManager.playBlock();
            return;
        }

        this.health = Math.max(0, this.health - damage);
        this.hitStunTimer = stunFrames;
        this.state = (this.health <= 0) ? 'KNOCKOUT' : 'HURT';
        this.vx = -0.1 * this.facing;

        voiceEngine.playHurtGrunt(this.characterId);

        attacker.combo++;
        attacker.comboTimer = 90;
        attacker.energy = Math.min(100, attacker.energy + 12);

        if (this.health <= 0) {
            soundManager.playKO();
            voiceEngine.announceKO();
        }
    }

    canMove() { return this.state === 'IDLE' || this.state === 'WALK'; }
    canAttack() { return !this.isAttacking() && this.state !== 'HURT' && this.state !== 'KNOCKOUT'; }
    isAttacking() { return ['PUNCH_LIGHT', 'PUNCH_HEAVY', 'KICK', 'SPECIAL_1', 'SPECIAL_2'].includes(this.state); }
}
