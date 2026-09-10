/* ==========================================================================
   CYBER CLASH PROJECTILE ENGINE
   Handles movement, hitboxes, animation, and particle bursts for ranged attacks.
   ========================================================================== */

class Projectile {
    constructor(owner, type, x, y, vx, damage, color) {
        this.owner = owner; // Player P1 or P2
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.damage = damage;
        this.color = color;
        this.width = 45;
        this.height = 35;
        this.isActive = true;
        this.life = 120; // 2 seconds max
    }

    update() {
        this.x += this.vx;
        this.life--;
        if (this.life <= 0 || this.x < -100 || this.x > 1380) {
            this.isActive = false;
        }

        // Spawn trailing particles
        if (Math.random() < 0.6) {
            particleManager.particles.push(
                new Particle(this.x, this.y, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, this.color, 4, 12, 'burst')
            );
        }
    }

    getHitbox() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        if (this.type === 'PLASMA') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 22, 0, Math.PI * 2);
            ctx.fill();

            // Inner Core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'BLADE') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.stroke();
        } else if (this.type === 'SHOCKWAVE') {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - 20, 530, 40, 50);
        } else if (this.type === 'LIGHTNING') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.x - 25, this.y - 15);
            ctx.lineTo(this.x, this.y + 15);
            ctx.lineTo(this.x + 25, this.y - 15);
            ctx.stroke();
        }

        ctx.restore();
    }
}

class ProjectileManager {
    constructor() {
        this.projectiles = [];
    }

    spawn(owner, type, x, y, direction, damage, color) {
        const speed = 12 * direction;
        this.projectiles.push(new Projectile(owner, type, x, y, speed, damage, color));
        soundManager.playSpecialMove();
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

    draw(ctx) {
        for (const p of this.projectiles) {
            p.draw(ctx);
        }
    }

    clear() {
        this.projectiles = [];
    }
}

const projectileManager = new ProjectileManager();
