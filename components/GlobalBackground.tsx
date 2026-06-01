import React, { useEffect, useRef } from 'react';

const GlobalBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // --- PART 1: Canvas Particle System ---
        class CanvasParticle {
            x: number;
            y: number;
            z: number;
            size: number;
            speedX: number;
            speedY: number;
            speedZ: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.z = Math.random() * 1000;
                this.size = Math.random() * 2;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.speedZ = Math.random() * 2;
            }

            update() {
                this.z -= this.speedZ;

                if (this.z <= 0) {
                    this.z = 1000;
                    this.x = Math.random() * canvas!.width;
                    this.y = Math.random() * canvas!.height;
                }

                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas!.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas!.height) this.speedY *= -1;
            }

            draw() {
                const x = (this.x - canvas!.width / 2) * (1000 / this.z) + canvas!.width / 2;
                const y = (this.y - canvas!.height / 2) * (1000 / this.z) + canvas!.height / 2;
                const opacity = 1 - this.z / 1000;
                const size = (1 - this.z / 1000) * 3;

                ctx!.beginPath();
                ctx!.arc(x, y, size, 0, Math.PI * 2);
                ctx!.fillStyle = `rgba(0, 120, 255, ${opacity * 0.3})`;
                ctx!.fill();
            }
        }

        const canvasParticles: CanvasParticle[] = [];
        for (let i = 0; i < 200; i++) {
            canvasParticles.push(new CanvasParticle());
        }

        let animationFrameId: number;

        const animateCanvas = () => {
            ctx.fillStyle = 'rgba(240, 248, 255, 0.1)'; // Trail effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            canvasParticles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            canvasParticles.forEach((p1, i) => {
                canvasParticles.slice(i + 1).forEach((p2) => {
                    if (Math.abs(p1.z - p2.z) > 100) return;

                    const x1 = (p1.x - canvas.width / 2) * (1000 / p1.z) + canvas.width / 2;
                    const y1 = (p1.y - canvas.height / 2) * (1000 / p1.z) + canvas.height / 2;
                    const x2 = (p2.x - canvas.width / 2) * (1000 / p2.z) + canvas.width / 2;
                    const y2 = (p2.y - canvas.height / 2) * (1000 / p2.z) + canvas.height / 2;

                    const dx = x1 - x2;
                    const dy = y1 - y2;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.strokeStyle = `rgba(0, 120, 255, ${0.1 * (1 - distance / 100)})`;
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(animateCanvas);
        };

        animateCanvas();

        // --- PART 2: Floating DOM Particles ---
        const container = particlesRef.current;
        if (container) {
            // Clear existing particles if any (though useEffect runs once)
            container.innerHTML = '';

            for (let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';

                // Styles that were in CSS class
                particle.style.position = 'absolute';
                particle.style.pointerEvents = 'none';
                particle.style.opacity = '0.5';
                // Animation is handled by global CSS or inline styles below if we want to be self-contained
                // But for simplicity, we'll add the keyframes to a style tag or assume global CSS.
                // Let's inject the keyframes via a style tag in the render to be safe.

                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';

                const size = Math.random() * 10 + 5 + 'px';
                particle.style.width = size;
                particle.style.height = size;

                particle.style.background = `radial-gradient(circle, rgba(0, 120, 255, 0.5), transparent)`;
                particle.style.borderRadius = '50%';

                particle.style.animation = `float ${Math.random() * 10 + 10}s infinite ease-in-out`;
                particle.style.animationDelay = Math.random() * 10 + 's';

                container.appendChild(particle);
            }
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Layer 1: Base Gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, #f0f8ff 0%, #d9e9ff 50%, #b8d4f1 100%)'
                }}
            />

            {/* Layer 2: Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />

            {/* Layer 3: Particles */}
            <div ref={particlesRef} className="absolute inset-0 w-full h-full" />

            {/* Inject Keyframes */}
            <style>{`
        @keyframes float {
            0%, 100% {
                transform: translateY(0) translateX(0) rotate(0deg);
            }
            33% {
                transform: translateY(-100px) translateX(50px) rotate(120deg);
            }
            66% {
                transform: translateY(50px) translateX(-50px) rotate(240deg);
            }
        }
      `}</style>
        </div>
    );
};

export default GlobalBackground;
