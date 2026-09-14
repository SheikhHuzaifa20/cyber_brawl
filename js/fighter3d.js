/* ==========================================================================
   CYBER BRAWL 3D VIP FIGHTER ENGINE
   Anime Stylized Characters, Fast Combat Dash, Dao Takedown & Unique Powers
   ========================================================================== */

const ULTRA_ROSTER = {
    titan: {
        id: 'titan',
        name: 'RAIDEN TITAN',
        title: 'THE THUNDER CHAMPION',
        type: 'MALE',
        rank: 'SUPER DIAMOND RANK ★★★★★',
        powerName: 'ELECTRIC THUNDER SURGE',
        powerType: 'ELECTRIC',
        powerColor: 0x00f0ff,
        eyeColor: 0x00f0ff,
        hairColor: 0x1a2233,
        colors: {
            primary: 0x1e293b,
            secondary: 0xd97706,
            accent: 0x00f0ff,
            skin: 0xdf9b6d,
            hair: 0x111827,
            pants: 0x0f172a,
            belt: 0xd97706,
            gloves: 0xef4444
        },
        stats: { power: 98, speed: 82, defense: 92 }
    },
    mai: {
        id: 'mai',
        name: 'MAI KASUMI',
        title: 'THE CRIMSON FLAME SHINOBI',
        type: 'FEMALE',
        rank: 'DIAMOND MASTER RANK ★★★★☆',
        powerName: 'PHOENIX FLAME BLAZE',
        powerType: 'FIRE',
        powerColor: 0xef4444,
        eyeColor: 0x10b981,
        hairColor: 0x27130a,
        colors: {
            primary: 0xdc2626,
            secondary: 0xffffff,
            accent: 0xf59e0b,
            skin: 0xfbd0b5,
            hair: 0x1c100b,
            pants: 0xdc2626,
            belt: 0xffffff,
            gloves: 0x991b1b
        },
        stats: { power: 85, speed: 99, defense: 72 }
    },
    kyo: {
        id: 'kyo',
        name: 'KYO RYUKEN',
        title: 'THE DRAGON FLAME MASTER',
        type: 'MALE',
        rank: 'ULTIMATE MASTER RANK ★★★★★',
        powerName: 'SOLAR DRAGON HADOUKEN',
        powerType: 'SOLAR',
        powerColor: 0xf59e0b,
        eyeColor: 0xf59e0b,
        hairColor: 0x1a1512,
        colors: {
            primary: 0x1e1b4b,
            secondary: 0xf59e0b,
            accent: 0xef4444,
            skin: 0xe8ad86,
            hair: 0x181412,
            pants: 0x111827,
            belt: 0xf59e0b,
            gloves: 0xf59e0b
        },
        stats: { power: 92, speed: 90, defense: 84 }
    },
    athena: {
        id: 'athena',
        name: 'VALKYRIE ATHENA',
        title: 'THE CYBER PLASMA WARRIOR',
        type: 'FEMALE',
        rank: 'GRANDMASTER RANK ★★★★★',
        powerName: 'PSYCHO PLASMA WAVE',
        powerType: 'PLASMA',
        powerColor: 0xa855f7,
        eyeColor: 0xa855f7,
        hairColor: 0x311b92,
        colors: {
            primary: 0x06b6d4,
            secondary: 0xa855f7,
            accent: 0xec4899,
            skin: 0xfbe2d3,
            hair: 0x311b92,
            pants: 0x0e7490,
            belt: 0xec4899,
            gloves: 0x06b6d4
        },
        stats: { power: 84, speed: 95, defense: 88 }
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

        this.speedForward = 0.23;  // Fast combat dash advance
        this.speedBackward = 0.13; // Tactical retreat spacing
        this.jumpForce = 0.40;
        this.gravity = 0.019;

        this.maxHealth = 100;
        this.health = 100;
        this.energy = 100;
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
        this.buildAnimeBodybuilderMesh();
    }

    buildAnimeBodybuilderMesh() {
        const charData = ULTRA_ROSTER[this.characterId] || ULTRA_ROSTER.titan;
        const isFemale = charData.type === 'FEMALE';

        const pColor = this.isP1 ? charData.colors.primary : (this.isP2Recolor ? 0xd97706 : charData.colors.secondary);
        const skinColor = charData.colors.skin;
        const hairColor = charData.hairColor || charData.colors.hair;
        const pantsColor = this.isP1 ? charData.colors.pants : (this.isP2Recolor ? 0x0284c7 : 0x334155);
        const beltColor = charData.colors.belt;
        const gloveColor = this.isP1 ? charData.colors.gloves : 0xf59e0b;

        // Premium PBR Materials with Stylized Highlights
        const matSkin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.55, metalness: 0.05 });
        const matPants = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.45, metalness: 0.15 });
        const matBelt = new THREE.MeshStandardMaterial({ color: beltColor, roughness: 0.35, metalness: 0.3 });
        const matHair = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.4, metalness: 0.2 });
        const matGloves = new THREE.MeshStandardMaterial({ color: gloveColor, roughness: 0.3, metalness: 0.45 });
        const matMetal = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
        const matGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });

        // 1. Pelvis / Hips Center
        const pelvisW = isFemale ? 0.72 : 0.98;
        const pelvisGeo = new THREE.BoxGeometry(pelvisW, 0.44, 0.56);
        const pelvis = new THREE.Mesh(pelvisGeo, matPants);
        pelvis.position.y = 1.62;
        pelvis.castShadow = true;
        this.group.add(pelvis);

        // Martial Arts Obi Belt
        const beltGeo = new THREE.BoxGeometry(pelvisW * 1.06, 0.18, 0.62);
        const belt = new THREE.Mesh(beltGeo, matBelt);
        belt.position.y = 0.16;
        pelvis.add(belt);

        // Hanging Belt Ties (Physics Sway)
        const sashTieGroup = new THREE.Group();
        sashTieGroup.position.set(0.18, 0.05, 0.32);
        const sashTieGeo = new THREE.BoxGeometry(0.14, 0.75, 0.04);
        const sashTie1 = new THREE.Mesh(sashTieGeo, matBelt);
        sashTie1.position.y = -0.35;
        sashTieGroup.add(sashTie1);
        const sashTie2 = new THREE.Mesh(sashTieGeo, matBelt);
        sashTie2.position.set(0.1, -0.32, -0.02);
        sashTie2.rotation.z = -0.15;
        sashTieGroup.add(sashTie2);
        pelvis.add(sashTieGroup);

        // 2. Muscular V-Taper Torso
        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 0.22;
        pelvis.add(torsoGroup);

        // Lower Core & 8-Pack Abs
        const absCoreGeo = new THREE.BoxGeometry(isFemale ? 0.68 : 0.88, 0.6, 0.5);
        const absCore = new THREE.Mesh(absCoreGeo, isFemale ? matPants : matSkin);
        absCore.position.y = 0.3;
        absCore.castShadow = true;
        torsoGroup.add(absCore);

        if (!isFemale) {
            const abW = 0.26, abH = 0.12, abD = 0.12;
            for (let row = 0; row < 4; row++) {
                const yOff = 0.46 - row * 0.14;
                const leftAb = new THREE.Mesh(new THREE.BoxGeometry(abW, abH, abD), matSkin);
                leftAb.position.set(-0.16, yOff, 0.24);
                absCore.add(leftAb);

                const rightAb = new THREE.Mesh(new THREE.BoxGeometry(abW, abH, abD), matSkin);
                rightAb.position.set(0.16, yOff, 0.24);
                absCore.add(rightAb);
            }
        }

        // Pectorals / Chest
        const chest = new THREE.Group();
        chest.position.y = 0.72;
        torsoGroup.add(chest);

        const chestWidth = isFemale ? 0.9 : 1.35;
        const chestBackGeo = new THREE.BoxGeometry(chestWidth * 0.92, 0.65, 0.58);
        const chestBack = new THREE.Mesh(chestBackGeo, isFemale ? matPants : matSkin);
        chestBack.castShadow = true;
        chest.add(chestBack);

        if (!isFemale) {
            const pecGeo = new THREE.BoxGeometry(0.55, 0.38, 0.24);
            const leftPec = new THREE.Mesh(pecGeo, matSkin);
            leftPec.position.set(-0.30, 0.08, 0.26);
            leftPec.rotation.z = -0.08;
            chest.add(leftPec);

            const rightPec = new THREE.Mesh(pecGeo, matSkin);
            rightPec.position.set(0.30, 0.08, 0.26);
            rightPec.rotation.z = 0.08;
            chest.add(rightPec);
        } else {
            const vestGeo = new THREE.BoxGeometry(0.88, 0.55, 0.32);
            const vest = new THREE.Mesh(vestGeo, matGloves);
            vest.position.set(0, 0.06, 0.16);
            chest.add(vest);
        }

        // Neck
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.3, 12), matSkin);
        neck.position.y = 0.42;
        chest.add(neck);

        // 3. ANIME HEAD & EXPRESSIVE ANIME EYES
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.32;
        neck.add(headGroup);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 20), matSkin);
        headMesh.scale.set(0.92, 1.08, 1.0);
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        // Anime Chin
        const chinMesh = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.24, 6), matSkin);
        chinMesh.rotation.x = Math.PI;
        chinMesh.position.set(0, -0.32, 0.12);
        headGroup.add(chinMesh);

        // Expressive Anime Eyes (Sclera + Colored Iris + Pupil + Specular Gleam)
        const eyeColorHex = charData.eyeColor || 0x00f0ff;
        const matEyeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const matIris = new THREE.MeshBasicMaterial({ color: eyeColorHex });
        const matPupil = new THREE.MeshBasicMaterial({ color: 0x050505 });
        const matEyeGleam = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const matEyebrow = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.3 });

        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.14, 0.02, 0.33);

            const sclera = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.10), matEyeWhite);
            sclera.rotation.y = side * 0.18;
            eyeGroup.add(sclera);

            const iris = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14), matIris);
            iris.position.set(side * -0.01, -0.005, 0.002);
            eyeGroup.add(iris);

            const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.024, 10), matPupil);
            pupil.position.set(side * -0.01, -0.005, 0.004);
            eyeGroup.add(pupil);

            const gleam = new THREE.Mesh(new THREE.CircleGeometry(0.014, 8), matEyeGleam);
            gleam.position.set(side * -0.02 + 0.015, 0.02, 0.006);
            eyeGroup.add(gleam);

            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.035, 0.05), matEyebrow);
            brow.position.set(side * 0.14, 0.10, 0.33);
            brow.rotation.z = side * -0.22;
            headGroup.add(brow);

            headGroup.add(eyeGroup);
        });

        // Anime Nose
        const noseMesh = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.06, 4), matSkin);
        noseMesh.rotation.x = -Math.PI / 4;
        noseMesh.position.set(0, -0.05, 0.36);
        headGroup.add(noseMesh);

        // 4. ANIME HAIR
        const hairGroup = new THREE.Group();
        headGroup.add(hairGroup);

        if (!isFemale) {
            const spikeConfigs = [
                { x: 0, y: 0.42, z: 0.08, h: 0.38, rx: -0.2, rz: 0 },
                { x: -0.16, y: 0.38, z: 0.12, h: 0.32, rx: -0.15, rz: 0.35 },
                { x: 0.16, y: 0.38, z: 0.12, h: 0.32, rx: -0.15, rz: -0.35 },
                { x: -0.26, y: 0.28, z: 0, h: 0.28, rx: 0, rz: 0.65 },
                { x: 0.26, y: 0.28, z: 0, h: 0.28, rx: 0, rz: -0.65 },
                { x: 0, y: 0.34, z: -0.22, h: 0.35, rx: 0.5, rz: 0 },
                { x: -0.18, y: 0.30, z: -0.18, h: 0.30, rx: 0.4, rz: 0.3 },
                { x: 0.18, y: 0.30, z: -0.18, h: 0.30, rx: 0.4, rz: -0.3 }
            ];
            spikeConfigs.forEach(cfg => {
                const cone = new THREE.Mesh(new THREE.ConeGeometry(0.12, cfg.h, 6), matHair);
                cone.position.set(cfg.x, cfg.y, cfg.z);
                cone.rotation.set(cfg.rx, 0, cfg.rz);
                cone.castShadow = true;
                hairGroup.add(cone);
            });

            // Headband
            const bandMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 16), matBelt);
            bandMesh.position.y = 0.14;
            headGroup.add(bandMesh);
        } else {
            const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), matHair);
            hairCap.position.set(0, 0.05, -0.08);
            hairGroup.add(hairCap);

            // High Ponytail
            const ponyGroup = new THREE.Group();
            ponyGroup.position.set(0, 0.35, -0.32);
            hairGroup.add(ponyGroup);

            const ponyTie = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 8, 16), matGold);
            ponyGroup.add(ponyTie);

            const tail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.10, 0.6, 8), matHair);
            tail1.position.set(0, -0.28, -0.15);
            tail1.rotation.x = -0.55;
            ponyGroup.add(tail1);

            const tail2 = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.8, 8), matHair);
            tail2.position.set(0, -0.75, -0.42);
            tail2.rotation.x = -0.7;
            ponyGroup.add(tail2);
        }

        // 5. BULGING ARMS & COMBAT GAUNTLETS
        const shoulderSpread = chestWidth * 0.58;
        const bicepSize = isFemale ? 0.22 : 0.38;
        const forearmSize = isFemale ? 0.16 : 0.28;

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(shoulderSpread, 0.25, 0);
        chest.add(leftShoulder);

        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(-shoulderSpread, 0.25, 0);
        chest.add(rightShoulder);

        leftShoulder.add(new THREE.Mesh(new THREE.SphereGeometry(bicepSize * 1.05, 14, 14), matSkin));
        rightShoulder.add(new THREE.Mesh(new THREE.SphereGeometry(bicepSize * 1.05, 14, 14), matSkin));

        const armGeo = new THREE.CylinderGeometry(bicepSize * 0.9, bicepSize * 0.78, 0.65, 12);
        const lBicep = new THREE.Mesh(armGeo, matSkin);
        lBicep.position.y = -0.36;
        leftShoulder.add(lBicep);

        const rBicep = new THREE.Mesh(armGeo, matSkin);
        rBicep.position.y = -0.36;
        rightShoulder.add(rBicep);

        const leftElbow = new THREE.Group();
        leftElbow.position.y = -0.7;
        leftShoulder.add(leftElbow);

        const rightElbow = new THREE.Group();
        rightElbow.position.y = -0.7;
        rightShoulder.add(rightElbow);

        const forearmGeo = new THREE.CylinderGeometry(forearmSize * 1.05, forearmSize * 0.82, 0.7, 12);
        const lForearm = new THREE.Mesh(forearmGeo, matGloves);
        lForearm.position.y = -0.35;
        leftElbow.add(lForearm);

        const rForearm = new THREE.Mesh(forearmGeo, matGloves);
        rForearm.position.y = -0.35;
        rightElbow.add(rForearm);

        // Knuckle Plates
        const fistGeo = new THREE.BoxGeometry(forearmSize * 1.35, forearmSize * 1.1, forearmSize * 1.25);
        const lFist = new THREE.Mesh(fistGeo, matGloves);
        lFist.position.y = -0.75;
        leftElbow.add(lFist);

        const rFist = new THREE.Mesh(fistGeo, matGloves);
        rFist.position.y = -0.75;
        rightElbow.add(rFist);

        const knucklePlateGeo = new THREE.BoxGeometry(forearmSize * 1.1, 0.08, forearmSize * 0.9);
        const lPlate = new THREE.Mesh(knucklePlateGeo, matMetal);
        lPlate.position.set(0, -0.75, forearmSize * 0.6);
        leftElbow.add(lPlate);

        const rPlate = new THREE.Mesh(knucklePlateGeo, matMetal);
        rPlate.position.set(0, -0.75, forearmSize * 0.6);
        rightElbow.add(rPlate);

        // 6. SCULPTED LEGS & COMBAT BOOTS
        const hipSpread = isFemale ? 0.32 : 0.42;
        const thighRadius = isFemale ? 0.28 : 0.40;

        const leftHip = new THREE.Group();
        leftHip.position.set(hipSpread, -0.15, 0);
        pelvis.add(leftHip);

        const rightHip = new THREE.Group();
        rightHip.position.set(-hipSpread, -0.15, 0);
        pelvis.add(rightHip);

        const thighGeo = new THREE.CylinderGeometry(thighRadius, thighRadius * 0.78, 0.85, 12);
        const lThigh = new THREE.Mesh(thighGeo, matPants);
        lThigh.position.y = -0.42;
        leftHip.add(lThigh);

        const rThigh = new THREE.Mesh(thighGeo, matPants);
        rThigh.position.y = -0.42;
        rightHip.add(rThigh);

        const leftKnee = new THREE.Group();
        leftKnee.position.y = -0.85;
        leftHip.add(leftKnee);

        const rightKnee = new THREE.Group();
        rightKnee.position.y = -0.85;
        rightHip.add(rightKnee);

        const shinGeo = new THREE.CylinderGeometry(thighRadius * 0.75, thighRadius * 0.55, 0.85, 12);
        const lShin = new THREE.Mesh(shinGeo, matPants);
        lShin.position.y = -0.42;
        leftKnee.add(lShin);

        const rShin = new THREE.Mesh(shinGeo, matPants);
        rShin.position.y = -0.42;
        rightKnee.add(rShin);

        const bootGeo = new THREE.BoxGeometry(thighRadius * 1.1, 0.45, thighRadius * 1.8);
        const lBoot = new THREE.Mesh(bootGeo, matGloves);
        lBoot.position.set(0, -0.88, thighRadius * 0.3);
        leftKnee.add(lBoot);

        const rBoot = new THREE.Mesh(bootGeo, matGloves);
        rBoot.position.set(0, -0.88, thighRadius * 0.3);
        rightKnee.add(rBoot);

        // 7. ENERGY BLOCK SHIELD
        const shieldGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.08, 6);
        const shieldMat = new THREE.MeshStandardMaterial({
            color: this.isP1 ? 0x00f0ff : 0xff0077,
            emissive: this.isP1 ? 0x00f0ff : 0xff0077,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.0
        });
        const energyShield = new THREE.Mesh(shieldGeo, shieldMat);
        energyShield.rotation.x = Math.PI / 2;
        energyShield.position.set(0, 1.2, 1.2);
        this.group.add(energyShield);

        this.limbs = {
            pelvis,
            torsoGroup,
            chest,
            headGroup,
            leftShoulder,
            rightShoulder,
            leftElbow,
            rightElbow,
            leftHip,
            rightHip,
            leftKnee,
            rightKnee,
            sashTieGroup,
            energyShield
        };

        this.group.position.set(this.x, this.y, this.z);
    }

    resetPosition(x) {
        this.x = x;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.energy = 100;
        this.state = 'IDLE';
        this.isGrounded = true;
        this.combo = 0;
        this.group.rotation.set(0, 0, 0);
        if (this.limbs.energyShield) this.limbs.energyShield.material.opacity = 0;
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
        const {
            pelvis, torsoGroup, chest, headGroup,
            leftShoulder, rightShoulder, leftElbow, rightElbow,
            leftHip, rightHip, leftKnee, rightKnee,
            sashTieGroup, energyShield
        } = this.limbs;

        const t = this.animTime;

        if (energyShield) {
            energyShield.material.opacity = (this.state === 'BLOCK') ? 0.65 : 0;
        }

        if (sashTieGroup) {
            sashTieGroup.rotation.z = Math.sin(t * 3) * 0.12 + this.vx * 1.5;
        }

        if (this.state === 'IDLE') {
            pelvis.position.y = 1.62 + Math.sin(t * 3) * 0.04;
            chest.rotation.set(0, 0.25, 0);
            headGroup.rotation.y = -0.25;

            leftShoulder.rotation.set(-0.6 + Math.sin(t * 3) * 0.05, 0.4, 0.3);
            leftElbow.rotation.set(-1.2, 0, 0);

            rightShoulder.rotation.set(-0.4, -0.3, -0.3);
            rightElbow.rotation.set(-1.5, 0, 0);

            leftHip.rotation.set(0.12, 0, 0);
            leftKnee.rotation.set(0.15, 0, 0);
            rightHip.rotation.set(-0.18, 0, 0);
            rightKnee.rotation.set(0.20, 0, 0);

        } else if (this.state === 'DASH_FORWARD') {
            // Aggressive forward combat rush lean
            const step = Math.sin(t * 9);
            pelvis.position.y = 1.55 + Math.abs(Math.sin(t * 9)) * 0.08;
            torsoGroup.rotation.x = 0.30; // Forward lunging angle

            leftHip.rotation.x = step * 0.85;
            leftKnee.rotation.x = Math.max(0, -step * 0.7);

            rightHip.rotation.x = -step * 0.85;
            rightKnee.rotation.x = Math.max(0, step * 0.7);

            leftShoulder.rotation.set(-0.9, 0.2, 0.3);
            rightShoulder.rotation.set(-0.9, -0.2, -0.3);

        } else if (this.state === 'RETREAT_GUARD') {
            // Defensive backstep spacing
            const step = Math.sin(t * 6);
            pelvis.position.y = 1.62;
            torsoGroup.rotation.x = -0.15; // Lean back

            leftHip.rotation.x = step * 0.45;
            rightHip.rotation.x = -step * 0.45;

        } else if (this.state === 'CROUCH') {
            pelvis.position.y = 1.05;
            leftHip.rotation.x = 0.95;
            leftKnee.rotation.x = 1.2;
            rightHip.rotation.x = 0.8;
            rightKnee.rotation.x = 1.1;

            leftShoulder.rotation.set(-0.9, 0.3, 0.2);
            rightShoulder.rotation.set(-0.9, -0.3, -0.2);

        } else if (this.state === 'JUMP') {
            pelvis.position.y = 1.62;
            leftHip.rotation.x = 0.6;
            leftKnee.rotation.x = 1.1;
            rightHip.rotation.x = 0.3;
            rightKnee.rotation.x = 0.8;
            leftShoulder.rotation.x = -1.5;
            rightShoulder.rotation.x = -1.2;

        } else if (this.state === 'PUNCH') {
            // Fast Straight Boxing Jab
            chest.rotation.y = 0.4;
            leftShoulder.rotation.set(-Math.PI / 2.1, 0.1, 0.1);
            leftElbow.rotation.set(-0.05, 0, 0);
            rightShoulder.rotation.set(-0.4, -0.3, -0.2);

        } else if (this.state === 'KICK') {
            // High Martial Arts Kick
            torsoGroup.rotation.z = -0.35;
            leftHip.rotation.set(-Math.PI / 1.9, 0.3, 0.4);
            leftKnee.rotation.set(0.05, 0, 0);
            rightHip.rotation.set(0.35, 0, -0.1);

        } else if (this.state === 'DAO_STRIKE') {
            // Martial Arts Takedown / Flying Sweep Grapple
            torsoGroup.rotation.x = 0.45;
            chest.rotation.y = -0.5;
            leftHip.rotation.set(-Math.PI / 2.2, 0.4, 0.3); // Lead leg sweep
            rightShoulder.rotation.set(-Math.PI / 1.9, -0.3, -0.2); // Outstretched arm
            rightElbow.rotation.set(0, 0, 0);

        } else if (this.state === 'POWER_ATTACK') {
            // Anime Power Blast Charge & Release
            chest.rotation.y = 0;
            leftShoulder.rotation.set(-Math.PI / 2.1, 0.3, 0);
            leftElbow.rotation.set(-0.2, 0, 0);
            rightShoulder.rotation.set(-Math.PI / 2.1, -0.3, 0);
            rightElbow.rotation.set(-0.2, 0, 0);

        } else if (this.state === 'BLOCK') {
            leftShoulder.rotation.set(-1.3, 0.6, 0.4);
            leftElbow.rotation.set(-1.6, 0, 0);
            rightShoulder.rotation.set(-1.3, -0.6, -0.4);
            rightElbow.rotation.set(-1.6, 0, 0);

        } else if (this.state === 'HURT') {
            chest.rotation.x = -0.35;
            headGroup.rotation.x = 0.4;
            leftShoulder.rotation.set(0.3, 0.4, 0.5);
            rightShoulder.rotation.set(0.3, -0.4, -0.5);

        } else if (this.state === 'KNOCKOUT') {
            this.group.rotation.z = -Math.PI / 2;
            this.group.position.y = 0.3;
        }
    }

    // Movement: Fast combat advance vs tactical retreat
    moveLeft() {
        if (!this.canMove()) return;
        const isForward = this.facing === -1;
        this.vx = isForward ? -this.speedForward : -this.speedBackward;
        this.state = isForward ? 'DASH_FORWARD' : 'RETREAT_GUARD';
    }

    moveRight() {
        if (!this.canMove()) return;
        const isForward = this.facing === 1;
        this.vx = isForward ? this.speedForward : this.speedBackward;
        this.state = isForward ? 'DASH_FORWARD' : 'RETREAT_GUARD';
    }

    stopMove() {
        if (this.state === 'DASH_FORWARD' || this.state === 'RETREAT_GUARD') {
            this.vx = 0;
            this.state = 'IDLE';
        }
    }

    crouch() { if (this.canMove() && this.isGrounded) { this.vx = 0; this.state = 'CROUCH'; } }
    uncrouch() { if (this.state === 'CROUCH') this.state = 'IDLE'; }
    jump() { if (this.canMove() && this.isGrounded) { this.vy = this.jumpForce; this.isGrounded = false; this.state = 'JUMP'; } }
    block() { if (this.canMove() && this.isGrounded) { this.vx = 0; this.state = 'BLOCK'; } }
    unblock() { if (this.state === 'BLOCK') this.state = 'IDLE'; }

    // 1. PUNCH [F / J]
    punch() {
        if (!this.canAttack()) return;
        this.state = 'PUNCH';
        this.attackTimer = 13;
        soundManager.playLightPunch();
        voiceEngine.playAttackCry(this.characterId, 'PUNCH');
        this.activeHitbox = { damage: 10, stun: 14 };
    }

    // 2. KICK [H / K]
    kick() {
        if (!this.canAttack()) return;
        this.state = 'KICK';
        this.attackTimer = 16;
        soundManager.playKick();
        voiceEngine.playAttackCry(this.characterId, 'KICK');
        this.activeHitbox = { damage: 14, stun: 18 };
    }

    // 3. DAO (Takedown / Grapple Sweep) [G / L]
    daoStrike() {
        if (!this.canAttack()) return;
        this.state = 'DAO_STRIKE';
        this.attackTimer = 24;
        this.vx = 0.32 * this.facing; // Rapid lunging tackle step!
        soundManager.playHeavyPunch();
        voiceEngine.playAttackCry(this.characterId, 'DAO');
        this.activeHitbox = { damage: 20, stun: 26 };
    }

    // 4. POWER (Electric / Fire / Solar / Plasma) [P]
    usePower() {
        if (!this.canAttack()) return;
        this.energy = Math.max(0, this.energy - 20);
        this.state = 'POWER_ATTACK';
        this.attackTimer = 22;

        const charData = ULTRA_ROSTER[this.characterId] || ULTRA_ROSTER.titan;
        voiceEngine.playAttackCry(this.characterId, 'POWER');

        projectileManager3D.spawn(
            this.id,
            this.x + 1.3 * this.facing,
            1.8,
            0,
            this.facing,
            24,
            charData.powerColor,
            charData.powerType
        );
    }

    takeDamage(damage, stunFrames, attacker) {
        if (this.state === 'BLOCK') {
            this.health -= Math.floor(damage * 0.15);
            soundManager.playBlock();
            return;
        }

        this.health = Math.max(0, this.health - damage);
        this.hitStunTimer = stunFrames;
        this.state = (this.health <= 0) ? 'KNOCKOUT' : 'HURT';
        this.vx = -0.14 * this.facing;

        voiceEngine.playHurtGrunt(this.characterId);

        attacker.combo++;
        attacker.comboTimer = 90;
        attacker.energy = Math.min(100, attacker.energy + 15);

        if (this.health <= 0) {
            soundManager.playKO();
            voiceEngine.announceKO();
        }
    }

    canMove() { return this.state === 'IDLE' || this.state === 'DASH_FORWARD' || this.state === 'RETREAT_GUARD'; }
    canAttack() { return !this.isAttacking() && this.state !== 'HURT' && this.state !== 'KNOCKOUT'; }
    isAttacking() { return ['PUNCH', 'KICK', 'DAO_STRIKE', 'POWER_ATTACK'].includes(this.state); }
}
