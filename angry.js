// --- PAGE NAVIGATION OVERRIDE ---
document.addEventListener("click", (e) => {
    const link = e.target.closest("nav a");
    if (link) {
        e.preventDefault();
        const targetUrl = link.href;
        const overlay = document.getElementById('intro-overlay');
        const mainSite = document.getElementById('main-site');

        // 1. Hide the current content
        if (mainSite) mainSite.style.opacity = '0';

        // 2. Drop the curtain (fastRise handles the downward movement)
        overlay.style.display = 'flex';
        overlay.setAttribute('data-state', 'rising-fast'); 
        
        // 3. Wait for the curtain to hit bottom (300ms match fastRise duration)
        // Then move to the next page
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 750);
    }
});

// --- ENTRANCE LOGIC (Keep your existing code but ensure it runs on load) ---
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById('intro-overlay');
    const mainSite = document.getElementById('main-site');
    
    if (!overlay || !mainSite) return;

    // Start with curtain down
    overlay.style.display = 'flex';
    overlay.setAttribute('data-state', 'rising-ttyd'); 
    overlay.style.transform = 'translateY(0)';

    setTimeout(() => {
        // Trigger the TTYD style rising animation
        overlay.setAttribute('data-state', 'rising-ttyd');
        mainSite.classList.add('reveal-site');
    }, 600); 

setTimeout(() => {
        const topElements = document.querySelectorAll('.reveal-on-scroll');
        topElements.forEach(el => el.classList.add('active'));
    }, 1000); // Happens right after the curtain rises


    overlay.addEventListener('animationend', (e) => {
        if (e.animationName === 'ttydRise') {
            overlay.style.display = 'none';
			
			
        }
    });
});

/* --- PART 2: ANGRY BIRDS PHYSICS GAME --- */
// ... (Your Matter.js code remains exactly the same below here)

/* --- PART 2: ANGRY BIRDS PHYSICS GAME --- */
const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Constraint, Events } = Matter;

let engine, render, runner, bird, slingshot;
let score = 0;
let pigs = [];
let birdsRemaining = 6;
let isFlying = false;
let isInitialized = false;

function launchGame() {
    document.getElementById('game-overlay').style.display = 'flex';
    if (!isInitialized) {
        initPhysics();
        isInitialized = true;
    }
}

function initPhysics() {
    const container = document.getElementById('canvas-container');
    container.innerHTML = '';

    engine = Engine.create();
    render = Render.create({
        element: container,
        engine: engine,
        options: { 
            width: 1100, height: 500, 
            wireframes: false, background: '#87CEEB' 
        }
    });

    const ground = Bodies.rectangle(550, 490, 1110, 40, { 
        isStatic: true, label: 'ground', friction: 1,
        render: { fillStyle: '#48b858' } 
    });
    
    setupSlingshot();
    createMegaCastle();

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });

    Events.on(mouseConstraint, 'mousedown', (e) => {
        if (e.source.body && (e.source.body !== bird || isFlying)) {
            mouseConstraint.body = null;
        }
    });

    World.add(engine.world, [ground, mouseConstraint]);

    Events.on(mouseConstraint, 'enddrag', (e) => {
        if (e.body === bird) {
            isFlying = true;
            setTimeout(() => { slingshot.bodyB = null; }, 30);
        }
    });

    Events.on(engine, 'afterUpdate', () => {
        if (isFlying && bird) {
            if (bird.speed < 0.2 || bird.position.x > 900 || bird.position.x < 0) {
                World.remove(engine.world, bird);
                bird = null;
                isFlying = false;
                if (birdsRemaining > 1) {
                    birdsRemaining--;
                    setupSlingshot();
                } else {
                    setTimeout(checkWinCondition, 1500);
                }
            }
        }
    });

    Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;
            const force = pair.collision.depth * 50; 

            const processHit = (obj) => {
                if (['ice', 'wood', 'stone'].includes(obj.label)) {
                    let breakHP = obj.label === 'ice' ? 150 : obj.label === 'wood' ? 450 : 700;
                    if (force > breakHP) {
                        score += 500;
                        World.remove(engine.world, obj);
                    } else {
                        score += Math.min(499, Math.floor(force * 2));
                    }
                }
                if (obj.label === 'pig' && force > 100) {
                    score += 5000;
                    World.remove(engine.world, obj);
                    pigs = pigs.filter(p => p !== obj);
                    if (pigs.length === 0) setTimeout(checkWinCondition, 2000); 
                }
            };
            processHit(bodyA);
            processHit(bodyB);
            document.getElementById('score').innerText = score;
        });
    });

    Render.run(render);
    runner = Runner.create();
    Runner.run(runner, engine);
}

function setupSlingshot() {
    bird = Bodies.circle(300, 350, 15, { 
        density: 0.015, restitution: 0.1, label: 'bird',
        render: { fillStyle: '#f75d59' } 
    });
    slingshot = Constraint.create({
        pointA: { x: 300, y: 350 },
        bodyB: bird,
        stiffness: 0.02,
        length: 0,
        render: { strokeStyle: '#444', lineWidth: 4 }
    });
    World.add(engine.world, [bird, slingshot]);
}

function createMegaCastle() {
    const stone = { label: 'stone', color: '#7f8c8d', den: 0.15 };
    const wood = { label: 'wood', color: '#a67c52', den: 0.1 };
    const ice = { label: 'ice', color: '#ade6ff', den: 0.05 };

    const addB = (x, y, w, h, m) => {
        let b = Bodies.rectangle(x, y, w, h, {
            label: m.label, density: m.den, friction: 0.4,
            render: { fillStyle: m.color }
        });
        World.add(engine.world, b);
    };

    for(let i=0; i<4; i++) { addB(550 + (i*90), 420, 25, 100, stone); addB(590 + (i*90), 420, 25, 100, stone); }
    for(let i=0; i<4; i++) { addB(570 + (i*90), 360, 90, 15, wood); }
    for(let i=0; i<3; i++) { addB(580 + (i*110), 320, 20, 80, wood); addB(640 + (i*110), 320, 20, 80, wood); }
    for(let i=0; i<3; i++) { addB(610 + (i*110), 265, 100, 15, stone); }
    for(let i=0; i<9; i++) { addB(580 + (i*35), 240, 30, 30, ice); }

    const pigLocs = [{x: 610, y: 330}, {x: 830, y: 330}, {x: 720, y: 150}];
    pigLocs.forEach(pos => {
        let p = Bodies.circle(pos.x, pos.y, 18, { label: 'pig', density: 0.01, render: { fillStyle: '#b2ff59' } });
        pigs.push(p);
        World.add(engine.world, p);
    });
}

function checkWinCondition() {
    if (pigs.length === 0) {
        const bonus = (birdsRemaining - 1) * 10000;
        score += bonus;
        document.getElementById('score').innerText = score;
        let stars = score >= 85000 ? "★★★" : score >= 65000 ? "★★☆" : score >= 25000 ? "★☆☆" : "☆☆☆" ;
        document.getElementById('result-msg').innerHTML = `<div style="color:#ffd700;">${stars}</div> SCORE: ${score}`;
    } else if (birdsRemaining <= 1 && !isFlying) {
        document.getElementById('result-msg').innerText = "GAME OVER";
    }
}

function restartLevel() {
    score = 0; birdsRemaining = 6; pigs = []; isFlying = false;
    document.getElementById('score').innerText = "0";
    document.getElementById('result-msg').innerText = "";
    if (runner) Runner.stop(runner);
    if (render) { Render.stop(render); render.canvas.remove(); }
    World.clear(engine.world); Engine.clear(engine);
    isInitialized = false;
    initPhysics();
}

function hideGame() {
    document.getElementById('game-overlay').style.display = 'none';
    if (runner) Runner.stop(runner);
}
