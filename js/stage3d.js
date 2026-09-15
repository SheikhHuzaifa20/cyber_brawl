/* ==========================================================================
   CYBER BRAWL 3D REALISTIC STAGE & ARENA ENGINE (Three.js WebGL)
   Renders 3 Distinct 3D Stages:
   1. Metropolis Cyber Arena (Skyscrapers, Holograms, Neon Cage)
   2. Ancient Dragon Dojo (Temple Pagoda, Paper Lanterns, Sakura Petals)
   3. Volcanic Magma Crater (Molten Lava Sea, Obsidian Platform, Rising Embers)
   ========================================================================== */

class Stage3DRenderer {
    constructor(scene) {
        this.scene = scene;
        this.currentStageId = 'metropolis';
        this.time = 0;
        this.spotlights = [];
        this.stageMeshes = [];
        this.ambientParticles = [];

        this.buildStage('metropolis');
    }

    setStage(stageId) {
        this.currentStageId = stageId;
        this.buildStage(stageId);
    }

    clearOldStage() {
        // Remove old stage meshes and spotlights
        this.stageMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
                else mesh.material.dispose();
            }
        });
        this.stageMeshes = [];
        this.spotlights = [];
        this.ambientParticles = [];

        // Clear general lights and fog
        const lightsToRemove = [];
        this.scene.traverse((child) => {
            if (child.isLight) lightsToRemove.push(child);
        });
        lightsToRemove.forEach(l => this.scene.remove(l));
    }

    buildStage(stageId) {
        this.clearOldStage();

        if (stageId === 'dojo') {
            this.buildDojoStage();
        } else if (stageId === 'volcano') {
            this.buildVolcanoStage();
        } else {
            this.buildMetropolisStage();
        }
    }

    // ==========================================
    // STAGE 1: METROPOLIS CYBER ARENA (Sky Ring)
    // ==========================================
    buildMetropolisStage() {
        this.scene.fog = new THREE.FogExp2(0x040816, 0.022);

        // Ambient & Directional Lighting
        const ambLight = new THREE.AmbientLight(0x0f172a, 1.4);
        this.scene.add(ambLight);

        const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.6);
        dirLight.position.set(5, 22, 12);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        // Sweeping Neon Spotlights (Cyan & Magenta)
        const spot1 = new THREE.SpotLight(0x00f0ff, 4.0, 35, Math.PI / 4, 0.35);
        spot1.position.set(-12, 18, 6);
        spot1.target.position.set(0, 2, 0);
        this.scene.add(spot1);
        this.scene.add(spot1.target);

        const spot2 = new THREE.SpotLight(0xff0077, 4.0, 35, Math.PI / 4, 0.35);
        spot2.position.set(12, 18, 6);
        spot2.target.position.set(0, 2, 0);
        this.scene.add(spot2);
        this.scene.add(spot2.target);

        this.spotlights = [spot1, spot2];

        // Reflective Metallic Arena Floor
        const floorGeo = new THREE.PlaneGeometry(36, 16);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x070c18,
            roughness: 0.15,
            metalness: 0.85
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.stageMeshes.push(floor);

        // Neon Arena Grid
        const grid = new THREE.GridHelper(36, 36, 0x00f0ff, 0x1e293b);
        grid.position.y = 0.01;
        this.scene.add(grid);
        this.stageMeshes.push(grid);

        // Neon Cage Ring Ropes (3 Levels)
        const ropeGeo = new THREE.CylinderGeometry(0.04, 0.04, 30, 8);
        const ropeMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.9
        });
        [1.2, 2.4, 3.6].forEach(y => {
            const rope = new THREE.Mesh(ropeGeo, ropeMat);
            rope.rotation.z = Math.PI / 2;
            rope.position.set(0, y, -4.5);
            this.scene.add(rope);
            this.stageMeshes.push(rope);
        });

        // Corner Ring Turnbuckle Pillars
        [-15, 15].forEach(x => {
            const pillarGeo = new THREE.CylinderGeometry(0.3, 0.35, 6, 16);
            const pillarMat = new THREE.MeshStandardMaterial({
                color: (x < 0) ? 0x00f0ff : 0xff0077,
                emissive: (x < 0) ? 0x00f0ff : 0xff0077,
                emissiveIntensity: 0.8,
                metalness: 0.8
            });
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(x, 3, -4.5);
            this.scene.add(pillar);
            this.stageMeshes.push(pillar);
        });

        // 3D Distant Cyberpunk Skyscrapers
        for (let i = -7; i <= 7; i++) {
            const h = 18 + Math.abs(Math.sin(i * 1.5)) * 14;
            const w = 3.5 + Math.abs(Math.cos(i * 2.2)) * 2;
            const bGeo = new THREE.BoxGeometry(w, h, 4);
            const bMat = new THREE.MeshStandardMaterial({
                color: 0x090e1f,
                roughness: 0.7,
                metalness: 0.3
            });
            const building = new THREE.Mesh(bGeo, bMat);
            building.position.set(i * 4.5, h / 2 - 2, -14 - Math.abs(i) * 0.8);
            this.scene.add(building);
            this.stageMeshes.push(building);

            // Glowing Window Strips
            if (i % 2 === 0) {
                const winGeo = new THREE.PlaneGeometry(w * 0.7, h * 0.6);
                const winMat = new THREE.MeshBasicMaterial({
                    color: (i % 4 === 0) ? 0x00f0ff : 0xffaa00,
                    transparent: true,
                    opacity: 0.4
                });
                const win = new THREE.Mesh(winGeo, winMat);
                win.position.set(building.position.x, building.position.y, building.position.z + 2.05);
                this.scene.add(win);
                this.stageMeshes.push(win);
            }
        }

        // Floating Digital Spark Particles
        const partGeo = new THREE.BufferGeometry();
        const count = 120;
        const posArray = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 32;
            posArray[i + 1] = Math.random() * 10;
            posArray[i + 2] = (Math.random() - 0.5) * 10 - 2;
        }
        partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const partMat = new THREE.PointsMaterial({
            size: 0.15,
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.8
        });
        const particles = new THREE.Points(partGeo, partMat);
        this.scene.add(particles);
        this.stageMeshes.push(particles);
        this.ambientParticles.push(particles);
    }

    // ==========================================
    // STAGE 2: ANCIENT DRAGON DOJO (Cherry Shrine)
    // ==========================================
    buildDojoStage() {
        this.scene.fog = new THREE.FogExp2(0x1a0f1d, 0.020);

        // Warm Temple Lighting
        const ambLight = new THREE.AmbientLight(0x2d1822, 1.6);
        this.scene.add(ambLight);

        const dirLight = new THREE.DirectionalLight(0xffedd5, 1.8);
        dirLight.position.set(0, 20, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Warm Golden Lantern Lights
        [-10, 10].forEach(x => {
            const lanternLight = new THREE.PointLight(0xf59e0b, 3.0, 18);
            lanternLight.position.set(x, 4.5, -2);
            this.scene.add(lanternLight);
        });

        // Polished Dark Lacquered Wood Floor
        const floorGeo = new THREE.PlaneGeometry(36, 16);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x24140e,
            roughness: 0.22,
            metalness: 0.4
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.stageMeshes.push(floor);

        // Traditional Japanese Temple Pillars
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0xb91c1c, // Vermilion Red Torii/Temple Lacquer
            roughness: 0.35
        });
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.9,
            roughness: 0.2
        });

        [-12, -6, 6, 12].forEach(x => {
            const pillarGeo = new THREE.CylinderGeometry(0.45, 0.5, 9, 16);
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(x, 4.5, -5.5);
            pillar.castShadow = true;
            this.scene.add(pillar);
            this.stageMeshes.push(pillar);

            // Gold Column Rings
            const ringGeo = new THREE.TorusGeometry(0.52, 0.08, 8, 16);
            const ring = new THREE.Mesh(ringGeo, goldMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.set(x, 8.2, -5.5);
            this.scene.add(ring);
            this.stageMeshes.push(ring);
        });

        // Temple Pagoda Roof Beam
        const beamGeo = new THREE.BoxGeometry(32, 0.9, 2.5);
        const beam = new THREE.Mesh(beamGeo, pillarMat);
        beam.position.set(0, 8.8, -5.5);
        this.scene.add(beam);
        this.stageMeshes.push(beam);

        // Hanging Japanese Paper Lanterns (Chochin)
        [-10, -3.5, 3.5, 10].forEach(x => {
            const lanternGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.1, 12);
            const lanternMat = new THREE.MeshStandardMaterial({
                color: 0xef4444,
                emissive: 0xf59e0b,
                emissiveIntensity: 0.9,
                roughness: 0.6
            });
            const lantern = new THREE.Mesh(lanternGeo, lanternMat);
            lantern.position.set(x, 6.2, -5.0);
            this.scene.add(lantern);
            this.stageMeshes.push(lantern);
        });

        // Golden Dragon Sculpted Silhouette in Center
        const dragonGeo = new THREE.TorusGeometry(2.8, 0.3, 12, 32, Math.PI * 1.5);
        const dragon = new THREE.Mesh(dragonGeo, goldMat);
        dragon.position.set(0, 5.0, -7.0);
        this.scene.add(dragon);
        this.stageMeshes.push(dragon);

        // Falling Sakura (Cherry Blossom) Petals
        const sakuraGeo = new THREE.BufferGeometry();
        const count = 150;
        const posArray = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 32;
            posArray[i + 1] = Math.random() * 12;
            posArray[i + 2] = (Math.random() - 0.5) * 10 - 1;
        }
        sakuraGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const sakuraMat = new THREE.PointsMaterial({
            size: 0.22,
            color: 0xf472b6,
            transparent: true,
            opacity: 0.85
        });
        const sakura = new THREE.Points(sakuraGeo, sakuraMat);
        this.scene.add(sakura);
        this.stageMeshes.push(sakura);
        this.ambientParticles.push(sakura);
    }

    // ==========================================
    // STAGE 3: VOLCANIC MAGMA CRATER
    // ==========================================
    buildVolcanoStage() {
        this.scene.fog = new THREE.FogExp2(0x220505, 0.026);

        // Fiery Red Ambient Lighting
        const ambLight = new THREE.AmbientLight(0x450a0a, 1.8);
        this.scene.add(ambLight);

        const dirLight = new THREE.DirectionalLight(0xf97316, 2.0);
        dirLight.position.set(0, 18, 8);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Molten Lava Lake Floor (Surrounding Platform)
        const lavaLakeGeo = new THREE.PlaneGeometry(60, 40);
        const lavaMat = new THREE.MeshStandardMaterial({
            color: 0xdc2626,
            emissive: 0xf97316,
            emissiveIntensity: 1.2,
            roughness: 0.3
        });
        const lavaLake = new THREE.Mesh(lavaLakeGeo, lavaMat);
        lavaLake.rotation.x = -Math.PI / 2;
        lavaLake.position.y = -0.6;
        this.scene.add(lavaLake);
        this.stageMeshes.push(lavaLake);

        // Cracked Obsidian Battle Platform
        const platGeo = new THREE.BoxGeometry(32, 0.8, 14);
        const platMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.8,
            metalness: 0.4
        });
        const platform = new THREE.Mesh(platGeo, platMat);
        platform.position.set(0, -0.4, 0);
        platform.receiveShadow = true;
        this.scene.add(platform);
        this.stageMeshes.push(platform);

        // Jagged Basalt Rock Pillars with Magma Veins
        [-13, -7, 7, 13].forEach((x, i) => {
            const rockH = 7 + (i % 2) * 3;
            const rockGeo = new THREE.CylinderGeometry(0.8, 1.4, rockH, 6);
            const rockMat = new THREE.MeshStandardMaterial({
                color: 0x18181b,
                roughness: 0.9
            });
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(x, rockH / 2 - 0.5, -6.5);
            this.scene.add(rock);
            this.stageMeshes.push(rock);

            // Magma Glow Light
            const rockLight = new THREE.PointLight(0xff4400, 3.0, 12);
            rockLight.position.set(x, 2.5, -5.5);
            this.scene.add(rockLight);
        });

        // Rising Lava Ember Particles
        const emberGeo = new THREE.BufferGeometry();
        const count = 180;
        const posArray = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 34;
            posArray[i + 1] = Math.random() * 12;
            posArray[i + 2] = (Math.random() - 0.5) * 12 - 2;
        }
        emberGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const emberMat = new THREE.PointsMaterial({
            size: 0.20,
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.9
        });
        const embers = new THREE.Points(emberGeo, emberMat);
        this.scene.add(embers);
        this.stageMeshes.push(embers);
        this.ambientParticles.push(embers);
    }

    update() {
        this.time += 0.03;

        // Spotlights sway in Metropolis
        if (this.spotlights.length >= 2) {
            this.spotlights[0].position.x = -12 + Math.sin(this.time) * 4;
            this.spotlights[1].position.x = 12 - Math.sin(this.time) * 4;
        }

        // Particle Drift (Sparks, Sakura Petals, or Embers)
        this.ambientParticles.forEach(pts => {
            const positions = pts.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                if (this.currentStageId === 'dojo') {
                    // Sakura falls downwards
                    positions[i] -= 0.03;
                    if (positions[i] < 0) positions[i] = 12;
                    positions[i - 1] += Math.sin(this.time + i) * 0.02; // Sway
                } else {
                    // Sparks & Embers float upwards
                    positions[i] += 0.04;
                    if (positions[i] > 12) positions[i] = 0;
                }
            }
            pts.geometry.attributes.position.needsUpdate = true;
        });
    }
}

/* ==========================================================================
   VIP ANIMATED CYBERPUNK CITY BACKGROUND (Procedural Canvas 2D)
   Draws a live animated background: neon skyscrapers, flying cars,
   spotlight laser beams, hologram grids, and neon particle rain.
   Runs behind the 3D canvas for an ultra-premium visual feel.
   ========================================================================== */

class BgCityCanvas {
    constructor() {
        this.canvas = document.getElementById('bgAnimCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.t = 0;
        this.cars = this._spawnCars(14);
        this.particles = this._spawnParticles(80);
        this.beams = this._spawnBeams(5);
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this._loop();
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.W = this.canvas.width;
        this.H = this.canvas.height;
        this.buildings = this._buildSkyline();
    }

    _buildSkyline() {
        const W = this.W, H = this.H;
        const buildings = [];
        const neonCols = ['#00f0ff','#a855f7','#ec4899','#fbbf24','#10b981','#f97316'];
        let x = 0;
        while (x < W) {
            const w = 35 + Math.random() * 90;
            const h = H * 0.25 + Math.random() * H * 0.45;
            const color = neonCols[Math.floor(Math.random() * neonCols.length)];
            buildings.push({ x, y: H - h, w, h, color, windows: [] });
            // Generate windows
            const winsX = Math.floor(w / 16);
            const winsY = Math.floor(h / 20);
            for (let wy = 0; wy < winsY; wy++) {
                for (let wx = 0; wx < winsX; wx++) {
                    buildings[buildings.length-1].windows.push({
                        dx: 6 + wx * 16,
                        dy: 10 + wy * 20,
                        lit: Math.random() > 0.38
                    });
                }
            }
            x += w + 4;
        }
        return buildings;
    }

    _spawnCars(n) {
        const cars = [];
        for (let i = 0; i < n; i++) {
            cars.push({
                x: Math.random() * (this.W || 800),
                y: 60 + Math.random() * ((this.H || 600) * 0.5),
                speed: 1.5 + Math.random() * 3.5,
                lane: Math.random() > 0.5 ? 1 : -1,
                color: ['#00f0ff','#f97316','#a855f7','#fbbf24','#ec4899'][Math.floor(Math.random()*5)],
                len: 28 + Math.random() * 36
            });
        }
        return cars;
    }

    _spawnParticles(n) {
        const p = [];
        for (let i = 0; i < n; i++) {
            p.push({
                x: Math.random() * (this.W || 800),
                y: Math.random() * (this.H || 600),
                vy: 0.4 + Math.random() * 1.2,
                alpha: 0.3 + Math.random() * 0.7,
                size: 1 + Math.random() * 2
            });
        }
        return p;
    }

    _spawnBeams(n) {
        const b = [];
        for (let i = 0; i < n; i++) {
            b.push({
                x: (i / n) * (this.W || 800) + 60,
                angle: -Math.PI / 3 + Math.random() * (Math.PI / 1.5),
                speed: 0.004 + Math.random() * 0.008,
                color: ['rgba(0,240,255,0.22)','rgba(168,85,247,0.2)','rgba(251,191,36,0.18)'][i % 3]
            });
        }
        return b;
    }

    _loop() {
        this.t++;
        this._draw();
        requestAnimationFrame(() => this._loop());
    }

    _draw() {
        if (!this.ctx || !this.buildings) return;
        const ctx = this.ctx;
        const W = this.W, H = this.H, t = this.t;

        // ── Sky Gradient ──
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.55, '#0c1133');
        skyGrad.addColorStop(1, '#130c25');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);

        // ── Neon Horizon Glow ──
        const hGrad = ctx.createLinearGradient(0, H * 0.52, 0, H * 0.72);
        hGrad.addColorStop(0, 'rgba(0,240,255,0.14)');
        hGrad.addColorStop(0.5, 'rgba(168,85,247,0.09)');
        hGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hGrad;
        ctx.fillRect(0, H * 0.52, W, H * 0.2);

        // ── Spotlight Laser Beams ──
        this.beams.forEach(b => {
            b.angle += b.speed * Math.sin(t * 0.02);
            ctx.save();
            ctx.translate(b.x, H * 0.95);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            const len = H * 1.1;
            ctx.lineTo(Math.sin(b.angle) * len, -Math.cos(b.angle) * len * 0.85);
            ctx.lineWidth = 18;
            ctx.strokeStyle = b.color;
            ctx.stroke();
            ctx.restore();
        });

        // ── Neon Grid Floor ──
        const gridY = H * 0.72;
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 0.7;
        const scroll = (t * 1.2) % 40;
        for (let gx = -40; gx < W + 40; gx += 40) {
            ctx.beginPath();
            ctx.moveTo(gx, gridY);
            ctx.lineTo(W / 2 + (gx - W / 2) * 2.5, H + 40);
            ctx.stroke();
        }
        for (let gy = 0; gy < H - gridY + 40; gy += 28) {
            const prog = (gy + scroll) / (H - gridY);
            const ty = gridY + gy - scroll;
            const xs = W / 2 - (W * 1.8 * prog) / 2;
            const xe = W / 2 + (W * 1.8 * prog) / 2;
            ctx.beginPath();
            ctx.moveTo(xs, ty);
            ctx.lineTo(xe, ty);
            ctx.stroke();
        }
        ctx.restore();

        // ── Buildings ──
        this.buildings.forEach(bld => {
            // Body
            ctx.fillStyle = '#0b1222';
            ctx.fillRect(bld.x, bld.y, bld.w, bld.h);

            // Neon edge glow
            ctx.save();
            ctx.shadowBlur = 12;
            ctx.shadowColor = bld.color;
            ctx.strokeStyle = bld.color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.65 + 0.2 * Math.sin(t * 0.03 + bld.x);
            ctx.strokeRect(bld.x, bld.y, bld.w, bld.h);
            ctx.restore();

            // Windows
            bld.windows.forEach(win => {
                if (!win.lit) return;
                ctx.fillStyle = `rgba(255, 230, 140, ${0.35 + 0.2 * Math.sin(t * 0.04 + bld.x + win.dy)})`;
                ctx.fillRect(bld.x + win.dx, bld.y + win.dy, 8, 10);
            });

            // Rooftop antenna blink
            ctx.save();
            ctx.globalAlpha = (t % 60 < 30) ? 0.9 : 0.1;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(bld.x + bld.w / 2, bld.y - 6, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // ── Flying Cars with Trails ──
        this.cars.forEach(car => {
            car.x += car.speed * car.lane;
            if (car.lane === 1 && car.x > W + 80) car.x = -80;
            if (car.lane === -1 && car.x < -80) car.x = W + 80;

            // Trail
            const trailGrad = ctx.createLinearGradient(car.x - car.lane * car.len, car.y, car.x, car.y);
            trailGrad.addColorStop(0, 'rgba(0,0,0,0)');
            trailGrad.addColorStop(1, car.color);
            ctx.strokeStyle = trailGrad;
            ctx.lineWidth = 3;
            ctx.shadowColor = car.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(car.x - car.lane * car.len, car.y);
            ctx.lineTo(car.x, car.y);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Car body
            ctx.fillStyle = car.color;
            ctx.fillRect(car.x - 10 * car.lane, car.y - 4, 18, 8);
        });

        // ── Neon Rain Particles ──
        this.particles.forEach(p => {
            p.y += p.vy;
            if (p.y > H) { p.y = 0; p.x = Math.random() * W; }
            ctx.globalAlpha = p.alpha * 0.6;
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(p.x, p.y, p.size, p.size * 4);
        });
        ctx.globalAlpha = 1;
    }
}

// Start animated background on DOM load
window.addEventListener('DOMContentLoaded', () => {
    new BgCityCanvas();
});

