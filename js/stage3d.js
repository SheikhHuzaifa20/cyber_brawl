/* ==========================================================================
   CYBER BRAWL 3D STAGE & ENVIRONMENT RENDERER (Three.js WebGL)
   Renders 3D Colosseum arena, glossy reflective floor, stadium lights & fog.
   ========================================================================== */

class Stage3DRenderer {
    constructor(scene) {
        this.scene = scene;
        this.groundMesh = null;
        this.ringPillars = [];
        this.spotlights = [];
        this.time = 0;
        this.currentStage = 'neon_colosseum';

        this.buildStage();
    }

    buildStage() {
        // Clear old meshes
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }

        // 1. Ambient & Directional Lighting
        const ambLight = new THREE.AmbientLight(0x1a2035, 1.2);
        this.scene.add(ambLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(0, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 50;
        dirLight.shadow.camera.left = -15;
        dirLight.shadow.camera.right = 15;
        dirLight.shadow.camera.top = 15;
        dirLight.shadow.camera.bottom = -5;
        this.scene.add(dirLight);

        // 2. Stadium Neon Spotlights (Blue & Pink)
        const spot1 = new THREE.SpotLight(0x00f0ff, 3.5, 30, Math.PI / 4, 0.4);
        spot1.position.set(-10, 15, 5);
        spot1.target.position.set(0, 2, 0);
        this.scene.add(spot1);
        this.scene.add(spot1.target);

        const spot2 = new THREE.SpotLight(0xff0077, 3.5, 30, Math.PI / 4, 0.4);
        spot2.position.set(10, 15, 5);
        spot2.target.position.set(0, 2, 0);
        this.scene.add(spot2);
        this.scene.add(spot2.target);

        this.spotlights = [spot1, spot2];

        // 3. Reflective Metallic Arena Floor
        const groundGeo = new THREE.PlaneGeometry(35, 15);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x090c1a,
            roughness: 0.2,
            metalness: 0.8,
        });
        this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
        this.groundMesh.rotation.x = -Math.PI / 2;
        this.groundMesh.position.y = 0;
        this.groundMesh.receiveShadow = true;
        this.scene.add(this.groundMesh);

        // Ground Grid Neon Lines
        const gridHelper = new THREE.GridHelper(35, 35, 0x00f0ff, 0x222a45);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);

        // 4. Ring Neon Light Pillars
        const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 8, 16);
        const pillarMatP1 = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8 });
        const pillarMatP2 = new THREE.MeshStandardMaterial({ color: 0xff0077, emissive: 0xff0077, emissiveIntensity: 0.8 });

        const p1 = new THREE.Mesh(pillarGeo, pillarMatP1);
        p1.position.set(-12, 4, -4);
        this.scene.add(p1);

        const p2 = new THREE.Mesh(pillarGeo, pillarMatP2);
        p2.position.set(12, 4, -4);
        this.scene.add(p2);

        this.ringPillars = [p1, p2];

        // 5. 3D Stadium Crowd Background Arch
        const archGeo = new THREE.TorusGeometry(18, 0.5, 16, 100, Math.PI);
        const archMat = new THREE.MeshStandardMaterial({ color: 0x11162d, roughness: 0.5 });
        const arch = new THREE.Mesh(archGeo, archMat);
        arch.position.set(0, 0, -6);
        this.scene.add(arch);

        // Fog Environment
        this.scene.fog = new THREE.FogExp2(0x05060b, 0.025);
    }

    update() {
        this.time += 0.03;
        if (this.spotlights.length >= 2) {
            this.spotlights[0].position.x = -10 + Math.sin(this.time) * 3;
            this.spotlights[1].position.x = 10 - Math.sin(this.time) * 3;
        }
    }
}
