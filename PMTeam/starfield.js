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

    // Initialize stars
    for (let i = 0; i < STARS_COUNT; i++) {
        stars.push(new Star());
    }

    // Resize handler
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

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

        requestAnimationFrame(animate);
    }

    // Start animation
    animate();
})();