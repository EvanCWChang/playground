(function () {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Star configurations
    const STARS_COUNT = 150;
    const stars = [];

    // Shooting star (meteor) configuration
    const meteors = [];
    let lastMeteorSpawnTime = Date.now();
    const METEOR_INTERVAL = 3000; // 3 seconds in milliseconds

    // Brand Colors
    const GOLD_COLORS = ['#bca46a', '#9c844f', '#f4efe6', '#dfc78c'];
    const BLUE_COLORS = ['#13c2c2', '#e6fffb', '#87e8de', '#36cfc9'];
    const WHITE_COLORS = ['#ffffff', '#f5f5f5', '#e8e8e8', '#d9d9d9'];

    // Terminal Scenery Configurations
    const runwayLights = [];

    function initRunwayLights() {
        runwayLights.length = 0;
        const vpX = width * 0.8;
        const vpY = height * 0.65;
        const lines = [
            { dx: -0.85, dy: 0.35, count: 12, col: '#13c2c2' }, // Left taxiway blue
            { dx: -0.45, dy: 0.35, count: 12, col: '#52c41a' }, // Centerline green
            { dx: -0.20, dy: 0.35, count: 12, col: '#ffffff' }, // Runway white
            { dx: 0.15, dy: 0.35, count: 12, col: '#faad14' },  // Edge gold
            { dx: 0.35, dy: 0.35, count: 12, col: '#ff4d4f' }   // End of runway red
        ];
        lines.forEach(l => {
            for (let i = 0; i < l.count; i++) {
                const t = (i + 1) / l.count;
                const factor = Math.pow(t, 2); // Perspective effect (closer lights are further apart)
                runwayLights.push({
                    x: vpX + l.dx * width * factor,
                    y: vpY + l.dy * height * factor,
                    size: 1 + factor * 2.5,
                    color: l.col,
                    blinkPhase: Math.random() * Math.PI * 2,
                    blinkSpeed: 1.2 + Math.random() * 1.8
                });
            }
        });
    }

    class Star {
        constructor() {
            this.reset();
            // Start randomly in their animation cycle so they don't twinkle together
            this.phase = Math.random() * Math.PI * 2;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.3; // sizes between 0.3px and 1.8px
            
            // Speed of drift (extremely slow to stay premium and non-distracting)
            this.vx = (Math.random() * 0.03 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
            this.vy = (Math.random() * 0.03 + 0.01) * (Math.random() > 0.5 ? 1 : -1);

            // Assign premium brand colors to stars
            const rand = Math.random();
            if (rand < 0.15) {
                // Gold star (Starlux vibe)
                this.color = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
            } else if (rand < 0.25) {
                // Cyber lake-blue star
                this.color = BLUE_COLORS[Math.floor(Math.random() * BLUE_COLORS.length)];
            } else {
                // Pure/Silver white star
                this.color = WHITE_COLORS[Math.floor(Math.random() * WHITE_COLORS.length)];
            }

            // Twinkle speed
            this.twinkleSpeed = 0.008 + Math.random() * 0.015;
            this.maxOpacity = 0.3 + Math.random() * 0.7;
        }

        update() {
            // Drift
            this.x += this.vx;
            this.y += this.vy;

            // Twinkle phase
            this.phase += this.twinkleSpeed;

            // Boundary wrapping
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            // Calculate twinkle opacity using sine wave
            const opacity = (Math.sin(this.phase) + 1) / 2 * this.maxOpacity;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();

            // Give larger stars a slight glow/bloom
            if (this.size > 1.2 && opacity > 0.7) {
                ctx.shadowBlur = 6;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    class Meteor {
        constructor() {
            this.reset();
        }

        reset() {
            // Spawn on top or left, travel diagonally down-right
            const side = Math.random() > 0.5;
            if (side) {
                // Spawn on top
                this.x = Math.random() * (width * 0.7);
                this.y = -20;
            } else {
                // Spawn on left
                this.x = -20;
                this.y = Math.random() * (height * 0.5);
            }

            this.length = 80 + Math.random() * 120; // Length of the trail
            this.speed = 6 + Math.random() * 8;    // Fast movement but elegant
            
            // Angle of entry (typically around 30 to 45 degrees)
            this.angle = (30 + Math.random() * 20) * Math.PI / 180;
            
            this.dx = Math.cos(this.angle) * this.speed;
            this.dy = Math.sin(this.angle) * this.speed;

            // Starry gold or cyber blue for meteor
            this.color = Math.random() > 0.4 ? '#bca46a' : '#13c2c2';
            this.opacity = 1.0;
            this.active = true;
        }

        update() {
            if (!this.active) return;
            this.x += this.dx;
            this.y += this.dy;

            // Fade out as it goes
            this.opacity -= 0.015;

            // Check if offscreen or completely faded
            if (this.x > width + 100 || this.y > height + 100 || this.opacity <= 0) {
                this.active = false;
            }
        }

        draw() {
            if (!this.active) return;

            ctx.save();
            ctx.globalAlpha = Math.max(0, this.opacity);
            
            // Draw gradient line for the meteor trail
            const gradient = ctx.createLinearGradient(
                this.x, this.y,
                this.x - Math.cos(this.angle) * this.length,
                this.y - Math.sin(this.angle) * this.length
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.1, this.color);
            gradient.addColorStop(1, 'transparent');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.2 + Math.random() * 1.5;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x - Math.cos(this.angle) * this.length,
                this.y - Math.sin(this.angle) * this.length
            );
            ctx.stroke();

            ctx.restore();
        }
    }

    function drawAirportTerminal() {
        // 1. Draw Ground (Apron) with dark color
        const groundGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
        groundGrad.addColorStop(0, 'rgba(10, 13, 16, 0.15)');
        groundGrad.addColorStop(1, 'rgba(18, 22, 27, 0.35)');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, height * 0.65, width, height * 0.35);

        // 2. Draw Runway Lights (Perspective)
        runwayLights.forEach(light => {
            const blinkOpacity = (Math.sin(Date.now() / 1000 * light.blinkSpeed + light.blinkPhase) + 1) / 2;
            const finalOpacity = light.color === '#ffffff' ? 0.35 : 0.15 + blinkOpacity * 0.65;

            ctx.save();
            ctx.globalAlpha = finalOpacity * 0.4; // Controlled 10-20% opacity feeling
            ctx.fillStyle = light.color;
            ctx.beginPath();
            ctx.arc(light.x, light.y, light.size, 0, Math.PI * 2);
            ctx.fill();

            if (light.size > 2) {
                ctx.shadowBlur = 6;
                ctx.shadowColor = light.color;
                ctx.beginPath();
                ctx.arc(light.x, light.y, light.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        // 3. Draw Distant Control Tower
        drawControlTower(width * 0.82, height * 0.65, width > 768 ? 1.0 : 0.6);

        // 4. Draw Parked Airplane Silhouette
        drawAirplaneSilhouette(width * 0.18, height * 0.65, width > 768 ? 1.15 : 0.7);

        // 5. Draw Floor-to-ceiling Glass Window Frames (落地窗)
        ctx.save();
        ctx.strokeStyle = 'rgba(188, 164, 106, 0.08)'; // Golden window frame, very subtle
        ctx.lineWidth = 3;
        const spacing = width > 768 ? 320 : 160;
        const offset = (width % spacing) / 2;
        for (let x = offset; x < width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

            // Structural detail lines
            ctx.strokeStyle = 'rgba(188, 164, 106, 0.03)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 5, 0);
            ctx.lineTo(x - 5, height);
            ctx.moveTo(x + 5, 0);
            ctx.lineTo(x + 5, height);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(188, 164, 106, 0.08)';
            ctx.lineWidth = 3;
        }
        // Horizontal mullion dividers
        ctx.strokeStyle = 'rgba(188, 164, 106, 0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.22);
        ctx.lineTo(width, height * 0.22);
        ctx.moveTo(0, height * 0.65);
        ctx.lineTo(width, height * 0.65);
        ctx.stroke();
        ctx.restore();
    }

    function drawControlTower(x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = 'rgba(12, 15, 18, 0.45)';
        ctx.strokeStyle = 'rgba(188, 164, 106, 0.08)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-8, -65);
        ctx.lineTo(-20, -78);
        ctx.lineTo(-16, -95);
        ctx.lineTo(16, -95);
        ctx.lineTo(20, -78);
        ctx.lineTo(8, -65);
        ctx.lineTo(12, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Control cabin windows glow
        ctx.fillStyle = 'rgba(250, 173, 20, 0.15)'; // Amber glow
        ctx.beginPath();
        ctx.moveTo(-15, -92);
        ctx.lineTo(-18, -80);
        ctx.lineTo(18, -80);
        ctx.lineTo(15, -92);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawAirplaneSilhouette(x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = 'rgba(14, 18, 22, 0.55)';
        ctx.strokeStyle = 'rgba(188, 164, 106, 0.10)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        // Nose to Tail
        ctx.moveTo(-100, 8);
        ctx.bezierCurveTo(-90, -4, -60, -9, -30, -9);
        ctx.lineTo(60, -9);
        ctx.lineTo(82, -32);
        ctx.lineTo(95, -32);
        ctx.lineTo(91, 8);
        ctx.lineTo(84, 10);
        ctx.lineTo(60, 4);
        ctx.lineTo(-40, 4);
        ctx.bezierCurveTo(-70, 4, -95, 13, -100, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Jet engine
        ctx.fillStyle = 'rgba(10, 13, 16, 0.6)';
        ctx.fillRect(-10, 4, 22, 7);
        ctx.strokeRect(-10, 4, 22, 7);

        // Swept Wing
        ctx.fillStyle = 'rgba(11, 15, 18, 0.65)';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(28, 18);
        ctx.lineTo(42, 18);
        ctx.lineTo(4, -2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    // Initialize stars and airport scenery
    for (let i = 0; i < STARS_COUNT; i++) {
        stars.push(new Star());
    }
    initRunwayLights();

    // Resize handler
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        initRunwayLights();

        // Re-randomize stars that might now be outside boundaries
        stars.forEach(star => {
            if (star.x > width || star.y > height) {
                star.reset();
            }
        });
    });

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and draw stars
        stars.forEach(star => {
            star.update();
            star.draw();
        });

        // Spawn meteor every 3 seconds at random positions
        const now = Date.now();
        if (now - lastMeteorSpawnTime >= METEOR_INTERVAL) {
            meteors.push(new Meteor());
            lastMeteorSpawnTime = now;
        }

        // Update and draw meteors
        for (let i = meteors.length - 1; i >= 0; i--) {
            const meteor = meteors[i];
            meteor.update();
            if (!meteor.active) {
                meteors.splice(i, 1);
            } else {
                meteor.draw();
            }
        }

        // Draw Airport Terminal and Runway Lights in front of stars
        drawAirportTerminal();

        requestAnimationFrame(animate);
    }

    // Start animation
    animate();
})();