import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { Controls } from './controls.js';
import { UI } from './ui.js';
import { ZombieManager } from './zombie.js';
import { DayNightCycle } from './dayNight.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            console.error("Canvas element not found!");
            return;
        }
        
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.controls = new Controls(this.camera, this.canvas);
        this.world = new World(this.scene);
        this.player = new Player(this);
        this.dayNight = new DayNightCycle(this.scene);
        this.zombies = new ZombieManager(this);
        this.ui = new UI(this);

        this.lastTime = performance.now();
        
        this.init();
    }

    init() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Initial world generation
        try {
            console.log("Generating initial chunks...");
            this.world.update(this.player.position);
            console.log("Initial chunks generated.");
        } catch (error) {
            console.error("Error during world generation:", error);
        }
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = performance.now();
        const dt = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;

        if (this.controls.isLocked()) {
            this.player.update(dt);
            this.world.update(this.player.position);
            this.dayNight.update(dt);
            this.zombies.update(dt);
            this.ui.updateStats();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Start game
try {
    new Game();
} catch (e) {
    console.error("Critical error starting game:", e);
}
