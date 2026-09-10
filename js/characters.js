/* ==========================================================================
   CYBER CLASH CHARACTER DEFINITIONS & VECTOR CANVAS SPRITE DRAW ENGINE
   Procedural skeletal vector animations for high 60FPS fidelity & zero asset downloads.
   ========================================================================== */

const FIGHTER_ROSTER = {
    kaelen: {
        id: 'kaelen',
        name: 'KAELEN',
        title: 'CYBER RONIN',
        stats: { power: 80, speed: 75, defense: 70 },
        colors: {
            primary: '#00f0ff',
            secondary: '#1a2035',
            accent: '#ffffff',
            skin: '#f0c8a0',
            glow: 'rgba(0, 240, 255, 0.6)'
        },
        specials: {
            spec1Name: 'PLASMA BLAST',
            spec2Name: 'DRAGON UPPERCUT'
        }
    },
    vespera: {
        id: 'vespera',
        name: 'VESPERA',
        title: 'SHADOW BLADE',
        stats: { power: 70, speed: 95, defense: 60 },
        colors: {
            primary: '#ff0077',
            secondary: '#180028',
            accent: '#e0b0ff',
            skin: '#f5d5c0',
            glow: 'rgba(255, 0, 119, 0.6)'
        },
        specials: {
            spec1Name: 'BLADE WAVE',
            spec2Name: 'TELEPORT DASH'
        }
    },
    ignis: {
        id: 'ignis',
        name: 'IGNIS',
        title: 'MAGMA TITAN',
        stats: { power: 95, speed: 55, defense: 90 },
        colors: {
            primary: '#ff4400',
            secondary: '#251008',
            accent: '#ffe600',
            skin: '#8a4b38',
            glow: 'rgba(255, 68, 0, 0.7)'
        },
        specials: {
            spec1Name: 'MAGMA STOMP',
            spec2Name: 'POWER LARIAT'
        }
    },
    electro: {
        id: 'electro',
        name: 'ELECTRO',
        title: 'NEON VOLTAGE',
        stats: { power: 75, speed: 85, defense: 75 },
        colors: {
            primary: '#ffe600',
            secondary: '#0b1d3a',
            accent: '#00ffff',
            skin: '#e0c090',
            glow: 'rgba(255, 230, 0, 0.7)'
        },
        specials: {
            spec1Name: 'LIGHTNING BOLT',
            spec2Name: 'THUNDER SURGE'
        }
    }
};

class CharacterSpriteRenderer {
    static drawFighter(ctx, fighter) {
        ctx.save();
        
        // Position & Flip Facing Direction
        ctx.translate(fighter.x, fighter.y);
        if (fighter.facing === -1) {
            ctx.scale(-1, 1);
        }

        const data = FIGHTER_ROSTER[fighter.characterId] || FIGHTER_ROSTER.kaelen;
        const c = fighter.isP2Recolor ? {
            ...data.colors,
            primary: data.colors.primary === '#00f0ff' ? '#ffaa00' : '#00ff88',
            glow: 'rgba(255, 200, 0, 0.6)'
        } : data.colors;

        const state = fighter.state;
        const frame = fighter.animFrame;
        const isHit = state === 'HURT' || state === 'KNOCKOUT';
        const isBlock = state === 'BLOCK';

        // Hit Flashing Red FX
        if (isHit && Math.floor(frame / 2) % 2 === 0) {
            ctx.fillStyle = '#ff0033';
        } else {
            ctx.fillStyle = c.primary;
        }

        // Draw Shadow on Floor
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 45, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animation Pose Offsets
        let headY = -120;
        let torsoY = -80;
        let pArmAngle = 0;
        let fArmAngle = 0;
        let pLegAngle = 0.2;
        let fLegAngle = -0.2;

        if (state === 'CROUCH') {
            headY += 30;
            torsoY += 30;
            pLegAngle = 1.0;
            fLegAngle = -0.8;
        } else if (state === 'JUMP') {
            pLegAngle = 0.6;
            fLegAngle = 0.8;
        } else if (state === 'PUNCH_LIGHT') {
            fArmAngle = -1.4;
        } else if (state === 'PUNCH_HEAVY') {
            fArmAngle = -1.7;
            pArmAngle = 0.8;
        } else if (state === 'KICK') {
            fLegAngle = -1.6;
        } else if (state === 'SPECIAL_1' || state === 'SPECIAL_2') {
            fArmAngle = -1.8;
            pArmAngle = -1.8;
        } else if (isBlock) {
            fArmAngle = -1.2;
            pArmAngle = -1.2;
        } else if (state === 'WALK') {
            const cycle = Math.sin(frame * 0.4);
            pLegAngle = cycle * 0.5;
            fLegAngle = -cycle * 0.5;
            pArmAngle = -cycle * 0.4;
            fArmAngle = cycle * 0.4;
        }

        // Back Leg
        this.drawLimb(ctx, 0, torsoY + 20, pLegAngle, 50, c.secondary, 18);
        
        // Front Leg
        this.drawLimb(ctx, 0, torsoY + 20, fLegAngle, 50, c.primary, 20);

        // Torso / Armor Body
        ctx.fillStyle = c.secondary;
        ctx.strokeStyle = c.primary;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = c.glow;

        ctx.beginPath();
        ctx.roundRect(-22, torsoY - 25, 44, 55, 8);
        ctx.fill();
        ctx.stroke();

        // Chest Armor Core Emblem
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.arc(0, torsoY - 5, 8, 0, Math.PI * 2);
        ctx.fill();

        // Back Arm
        this.drawLimb(ctx, 0, torsoY - 15, pArmAngle, 40, c.secondary, 14);

        // Head & Helmet
        ctx.fillStyle = c.skin;
        ctx.beginPath();
        ctx.arc(0, headY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Helmet Visor
        ctx.fillStyle = c.primary;
        ctx.fillRect(2, headY - 6, 16, 10);

        // Front Arm / Weapon
        this.drawLimb(ctx, 0, torsoY - 15, fArmAngle, 40, c.primary, 16);

        // Character Specific Weapon Glow
        if (fighter.characterId === 'kaelen' && (state.includes('PUNCH') || state.includes('SPECIAL'))) {
            // Energy Katana
            ctx.strokeStyle = c.primary;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 20;
            ctx.shadowColor = c.primary;
            ctx.beginPath();
            ctx.moveTo(35, torsoY - 30);
            ctx.lineTo(85, torsoY - 55);
            ctx.stroke();
        }

        ctx.restore();
    }

    static drawLimb(ctx, x, y, angle, length, color, thickness) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(-thickness / 2, 0, thickness, length, thickness / 2);
        ctx.fill();
        ctx.restore();
    }
}
