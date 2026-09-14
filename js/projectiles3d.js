/* ==========================================================================
   CYBER BRAWL 3D PROJECTILE & VFX ENGINE (Three.js WebGL)
   Unique Character Powers: Electric Lightning, Crimson Fire, Solar Sun, Plasma Wave
   ========================================================================== */

class Projectile3D {
    constructor(scene, owner, x, y, z, direction, damage, color, powerType = 'ELECTRIC') {
        this.scene = scene;
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.z = z;
        this.direction = direction;
        this.vx = 0.32 * direction;
        this.damage = damage;
        this.isActive = true;
        this.life = 100;
        this.powerType = powerType;

        this.group = new THREE.Group();
        this.group.position.set(x, y, z);

        // Core Glowing Orb
        const coreGeo = new THREE.SphereGeometry(0.48, 16, 16);
        const coreMat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1.4,
            roughness: 0.2
        });
        this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
        this.group.add(this.coreMesh);

        // Character-Specific Outer Aura / Rings
        if (powerType === 'ELECTRIC') {
            // Thunder Lightning Arc Ring
            const ringGeo = new THREE.TorusGeometry(0.65, 0.08, 8, 20);
            const ringMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 1.5 });
            this.ring = new THREE.Mesh(ringGeo, ringMat);
            this.group.add(this.ring);
        } else if (powerType === 'FIRE') {
            // Blazing Phoenix Fire Shell
            const fireGeo = new THREE.ConeGeometry(0.55, 1.2, 8);
            const fireMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xef4444, emissiveIntensity: 1.6 });
            this.ring = new THREE.Mesh(fireGeo, fireMat);
            this.ring.rotation.z = -Math.PI / 2 * direction;
            this.group.add(this.ring);
        } else if (powerType === 'SOLAR') {
            // Solar Sun Corona Ring
            const sunGeo = new THREE.TorusGeometry(0.72, 0.12, 8, 24);
            const sunMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.8 });
            this.ring = new THREE.Mesh(sunGeo, sunMat);
            this.group.add(this.ring);
        } else {
            // Plasma Valkyrie Wave
            const waveGeo = new THREE.RingGeometry(0.3, 0.85, 16);
            const waveMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.8, side: THREE.DoubleSide });
            this.ring = new THREE.Mesh(waveGeo, waveMat);
            this.ring.rotation.y = Math.PI / 2;
            this.group.add(this.ring);
        }

        // Dynamic 3D Point Light Source
        this.light = new THREE.PointLight(color, 3.5, 12);
        this.group.add(this.light);

        this.scene.add(this.group);
        soundManager.playSpecialMove();
    }

    update() {
        this.x += this.vx;
        this.group.position.x = this.x;
        this.life--;

        // Animate outer ring rotation
        if (this.ring) {
            this.ring.rotation.x += 0.15;
            this.ring.rotation.y += 0.18;
        }

        if (this.life <= 0 || this.x < -18 || this.x > 18) {
            this.destroy();
        }
    }

    destroy() {
        this.isActive = false;
        this.scene.remove(this.group);
    }
}

class ProjectileManager3D {
    constructor() {
        this.projectiles = [];
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
    }

    spawn(owner, x, y, z, direction, damage, color, powerType = 'ELECTRIC') {
        if (!this.scene) return;
        this.projectiles.push(new Projectile3D(this.scene, owner, x, y, z, direction, damage, color, powerType));
    }

    update() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update();
            if (!p.isActive) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    clear() {
        for (const p of this.projectiles) {
            p.destroy();
        }
        this.projectiles = [];
    }
}

const projectileManager3D = new ProjectileManager3D();
