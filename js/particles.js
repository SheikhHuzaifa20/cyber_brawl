/* ==========================================================================
   CYBER CLASH PARTICLE ENGINE
   Renders hit sparks, energy bursts, flame particles, and dust trails.
   ========================================================================== */

class Particle {
    constructor(x, y, vx, vy, color, size, life, type = 'spark') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.maxLife = life;
        this.life = life;
        this.type = type;
        this.gravity = type === 'dust' ? -0.05 : 0.25;
        this.friction = 0.95;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.life--;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;

        if (this.type === 'spark') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
            ctx.stroke();
        } else if (this.type === 'burst' || this.type === 'fire') {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'dust') {
            ctx.fillStyle = 'rgba(200, 220, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * (1 - alpha * 0.5), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class ParticleManager {
    constructor() {
        this.particles = [];
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    // Spawn Hit Sparks
    createHitSparks(x, y, color = '#00f0ff', count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 8;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(new Particle(x, y, vx, vy, color, 2 + Math.random() * 2, 15 + Math.random() * 10, 'spark'));
        }
    }

    // Spawn Energy Blast Burst
    createBurst(x, y, color = '#ffe600', count = 25) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 10;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(new Particle(x, y, vx, vy, color, 4 + Math.random() * 6, 20 + Math.random() * 15, 'burst'));
        }
    }

    // Spawn Ground Jump Dust
    createDust(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * 3;
            const vy = -Math.random() * 2;
            this.particles.push(new Particle(x, y, vx, vy, '#ffffff', 5 + Math.random() * 8, 20 + Math.random() * 10, 'dust'));
        }
    }

    clear() {
        this.particles = [];
    }
}

const particleManager = new ParticleManager();
