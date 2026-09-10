/* ==========================================================================
   CYBER CLASH STAGE ENGINE
   Multi-Layer Parallax Background Renderer with Dynamic Ambient Animations
   ========================================================================== */

class StageRenderer {
    constructor() {
        this.currentStage = 'cyberpunk';
        this.groundY = 580;
        this.time = 0;
    }

    setStage(stageId) {
        this.currentStage = stageId;
    }

    update() {
        this.time += 0.05;
    }

    draw(ctx, cameraX = 0) {
        ctx.save();
        
        if (this.currentStage === 'cyberpunk') {
            this.drawCyberpunkStage(ctx, cameraX);
        } else if (this.currentStage === 'dojo') {
            this.drawDojoStage(ctx, cameraX);
        } else if (this.currentStage === 'volcano') {
            this.drawVolcanoStage(ctx, cameraX);
        }

        // Draw Stage Arena Floor Ground
        this.drawGround(ctx, cameraX);

        ctx.restore();
    }

    // Stage 1: Cyberpunk Neon Alley
    drawCyberpunkStage(ctx, cameraX) {
        const w = 1280;
        const h = 720;
        const p1 = cameraX * 0.1;
        const p2 = cameraX * 0.3;

        // Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#050714');
        skyGrad.addColorStop(0.6, '#0f1430');
        skyGrad.addColorStop(1, '#1e0836');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Far Distant City Buildings Layer 1
        ctx.fillStyle = '#0b0f22';
        for (let i = -2; i < 8; i++) {
            const bx = i * 200 - p1;
            const bh = 300 + (i % 3) * 60;
            ctx.fillRect(bx, h - bh, 160, bh);

            // Windows
            ctx.fillStyle = (i % 2 === 0) ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 0, 119, 0.4)';
            for (let wy = h - bh + 20; wy < h - 120; wy += 30) {
                for (let wx = bx + 20; wx < bx + 140; wx += 25) {
                    if (Math.sin(wx + wy + this.time * 0.5) > -0.2) {
                        ctx.fillRect(wx, wy, 12, 16);
                    }
                }
            }
            ctx.fillStyle = '#0b0f22';
        }

        // Midground Neon Structures Layer 2
        ctx.fillStyle = '#141832';
        for (let i = -1; i < 6; i++) {
            const bx = i * 320 - p2;
            const bh = 240 + (i % 2) * 50;
            ctx.fillRect(bx, h - bh, 240, bh);
        }

        // Animated Neon Signs
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f0ff';
        ctx.fillStyle = '#00f0ff';
        ctx.font = '700 24px Orbitron';
        ctx.fillText('CYBER BAR', 300 - p2, 300);

        ctx.shadowColor = '#ff0077';
        ctx.fillStyle = '#ff0077';
        ctx.fillText('FIGHT ARENA 2026', 800 - p2, 260);
        ctx.shadowBlur = 0;

        // Ambient Rain Particles
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 40; i++) {
            const rx = (i * 35 + this.time * 500) % w;
            const ry = (i * 25 + this.time * 700) % h;
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 5, ry + 20);
        }
        ctx.stroke();
    }

    // Stage 2: Ancient Shrine Dojo
    drawDojoStage(ctx, cameraX) {
        const w = 1280;
        const h = 720;
        const p1 = cameraX * 0.2;

        // Sunset Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#360914');
        skyGrad.addColorStop(0.5, '#7a1f26');
        skyGrad.addColorStop(1, '#d95a2b');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Giant Glowing Sun
        ctx.fillStyle = 'rgba(255, 220, 150, 0.8)';
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ffaa00';
        ctx.beginPath();
        ctx.arc(640, 260, 140, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Japanese Torii Gate Silhouette
        ctx.fillStyle = '#1a0509';
        const tx = 500 - p1;
        ctx.fillRect(tx, 220, 280, 25); // Top Beam
        ctx.fillRect(tx + 20, 260, 240, 18); // Mid Beam
        ctx.fillRect(tx + 40, 220, 30, 360); // Left Pillar
        ctx.fillRect(tx + 210, 220, 30, 360); // Right Pillar

        // Falling Cherry Blossom Petals
        ctx.fillStyle = 'rgba(255, 180, 200, 0.7)';
        for (let i = 0; i < 30; i++) {
            const px = (i * 45 + Math.sin(this.time + i) * 60) % w;
            const py = (i * 30 + this.time * 80) % h;
            ctx.beginPath();
            ctx.ellipse(px, py, 6, 3, Math.sin(this.time + i), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Stage 3: Volcanic Magma Crater
    drawVolcanoStage(ctx, cameraX) {
        const w = 1280;
        const h = 720;
        const p1 = cameraX * 0.2;

        // Volcanic Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#100000');
        skyGrad.addColorStop(0.6, '#380000');
        skyGrad.addColorStop(1, '#660d00');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Craggy Volcano Mountains
        ctx.fillStyle = '#1f0404';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(200 - p1, 280);
        ctx.lineTo(400 - p1, 400);
        ctx.lineTo(700 - p1, 220);
        ctx.lineTo(950 - p1, 420);
        ctx.lineTo(1280 - p1, 250);
        ctx.lineTo(1280, h);
        ctx.fill();

        // Magma Glow Effect
        ctx.fillStyle = 'rgba(255, 68, 0, 0.3)';
        ctx.fillRect(0, 480, w, 240);

        // Glowing Embers Particles
        ctx.fillStyle = '#ffcc00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff4400';
        for (let i = 0; i < 35; i++) {
            const ex = (i * 40 + Math.cos(this.time * 0.5 + i) * 30) % w;
            const ey = h - ((i * 20 + this.time * 120) % 500);
            ctx.beginPath();
            ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    // Draw Ground Platform & Grid Lines
    drawGround(ctx, cameraX) {
        const h = 720;
        const w = 1280;

        // Ground Metallic / Stone Platform
        ctx.fillStyle = '#0a0d1a';
        ctx.fillRect(0, this.groundY, w, h - this.groundY);

        // Floor Border Top Line Glow
        ctx.strokeStyle = this.currentStage === 'cyberpunk' ? '#00f0ff' : (this.currentStage === 'dojo' ? '#ffaa00' : '#ff4400');
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(w, this.groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Floor Perspective Grid Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let x = - cameraX % 80; x < w; x += 80) {
            ctx.beginPath();
            ctx.moveTo(x, this.groundY);
            ctx.lineTo(x - (x - w / 2) * 0.3, h);
            ctx.stroke();
        }
    }
}

const stageRenderer = new StageRenderer();
