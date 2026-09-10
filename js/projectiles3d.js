/* ==========================================================================
   CYBER BRAWL 3D PROJECTILE & VFX ENGINE (Three.js WebGL)
   3D Energy Orbs with PointLight illumination & 3D space movement.
   ========================================================================== */

class Projectile3D {
    constructor(scene, owner, x, y, z, direction, damage, color) {
        this.scene = scene;
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = 0.28 * direction;
        this.damage = damage;
        this.isActive = true;
        this.life = 120;

        // 3D Glowing Mesh
        const geo = new THREE.SphereGeometry(0.45, 16, 16);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1.0
        });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.set(x, y, z);

        // Dynamic 3D Point Light Source attached to orb
        this.light = new THREE.PointLight(color, 2.5, 8);
        this.mesh.add(this.light);

        this.scene.add(this.mesh);
        soundManager.playSpecialMove();
    }

    update() {
        this.x += this.vx;
        this.mesh.position.x = this.x;
        this.life--;

        if (this.life <= 0 || this.x < -18 || this.x > 18) {
            this.destroy();
        }
    }

    destroy() {
        this.isActive = false;
        this.scene.remove(this.mesh);
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

    spawn(owner, x, y, z, direction, damage, color) {
        if (!this.scene) return;
        this.projectiles.push(new Projectile3D(this.scene, owner, x, y, z, direction, damage, color));
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
