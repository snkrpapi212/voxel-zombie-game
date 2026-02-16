import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class Controls {
    constructor(camera, canvas) {
        this.controls = new PointerLockControls(camera, canvas);
        this.keys = {};

        this.init();
    }

    init() {
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        const pauseScreen = document.getElementById('pause-screen');
        
        this.controls.addEventListener('lock', () => {
            pauseScreen.classList.add('hidden');
        });

        this.controls.addEventListener('unlock', () => {
            if (!document.getElementById('inventory-modal').classList.contains('hidden')) return;
            pauseScreen.classList.remove('hidden');
        });

        pauseScreen.addEventListener('click', () => {
            this.lock();
        });
    }

    lock() {
        this.controls.lock();
    }

    unlock() {
        this.controls.unlock();
    }

    isLocked() {
        return this.controls.isLocked;
    }

    getMovementVector() {
        const vector = new THREE.Vector3();
        if (this.keys['KeyW']) vector.z -= 1;
        if (this.keys['KeyS']) vector.z += 1;
        if (this.keys['KeyA']) vector.x -= 1;
        if (this.keys['KeyD']) vector.x += 1;
        return vector.normalize();
    }

    isJumping() {
        return this.keys['Space'];
    }

    isSprinting() {
        return this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    }
}
