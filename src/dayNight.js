import * as THREE from 'three';

export class DayNightCycle {
    constructor(scene) {
        this.scene = scene;
        this.time = 0; // 0 to 1
        this.dayDuration = 5 * 60; // 5 minutes day
        this.nightDuration = 3 * 60; // 3 minutes night
        this.totalDuration = this.dayDuration + this.nightDuration;

        this.sun = new THREE.DirectionalLight(0xffffff, 1);
        this.scene.add(this.sun);
        this.ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.ambient);
        
        this.scene.background = new THREE.Color(0x87ceeb); // Initial sky blue
    }

    update(dt) {
        this.time += dt / this.totalDuration;
        if (this.time > 1) this.time = 0;

        const angle = this.time * Math.PI * 2;
        this.sun.position.set(
            Math.cos(angle) * 100,
            Math.sin(angle) * 100,
            50
        );

        const isDay = Math.sin(angle) > 0;
        
        if (isDay) {
            this.sun.intensity = Math.min(Math.sin(angle) * 1.5, 1);
            this.ambient.intensity = 0.5 + Math.sin(angle) * 0.3;
            this.scene.background.setHSL(0.6, 0.7, 0.5 + Math.sin(angle) * 0.2);
        } else {
            this.sun.intensity = 0;
            this.ambient.intensity = 0.1;
            this.scene.background.setHSL(0.6, 0.7, 0.05);
        }
    }

    isNight() {
        const angle = this.time * Math.PI * 2;
        return Math.sin(angle) <= 0;
    }
}
