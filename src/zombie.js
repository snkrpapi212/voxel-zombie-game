import * as THREE from 'three';

export class Zombie {
    constructor(game, position) {
        this.game = game;
        this.position = position.clone();
        this.velocity = new THREE.Vector3();
        this.health = 20;
        this.speed = 3;
        
        this.mesh = this.createMesh();
        this.game.scene.add(this.mesh);
    }

    createMesh() {
        const group = new THREE.Group();
        
        const bodyGeo = new THREE.BoxGeometry(0.6, 0.9, 0.3);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.95;
        group.add(body);
        
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.6;
        group.add(head);
        
        const legGeo = new THREE.BoxGeometry(0.25, 0.5, 0.25);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1a237e });
        const legL = new THREE.Mesh(legGeo, legMat);
        legL.position.set(-0.15, 0.25, 0);
        group.add(legL);
        const legR = new THREE.Mesh(legGeo, legMat);
        legR.position.set(0.15, 0.25, 0);
        group.add(legR);

        return group;
    }

    update(dt) {
        const playerPos = this.game.player.position;
        const dist = this.position.distanceTo(playerPos);
        
        if (dist < 15 && dist > 0.8) {
            const dir = new THREE.Vector3().subVectors(playerPos, this.position);
            dir.y = 0;
            dir.normalize();
            
            this.velocity.x = dir.x * this.speed;
            this.velocity.z = dir.z * this.speed;
            
            // Basic rotation
            this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        } else {
            this.velocity.x = 0;
            this.velocity.z = 0;
        }

        // Gravity
        this.velocity.y -= 25 * dt;

        // Apply movement
        const nextPos = this.position.clone().addScaledVector(this.velocity, dt);
        
        // Simple collision (ground only)
        const groundY = this.game.world.getHeight(Math.floor(nextPos.x), Math.floor(nextPos.z));
        if (nextPos.y < groundY) {
            nextPos.y = groundY;
            this.velocity.y = 0;
        }

        this.position.copy(nextPos);
        this.mesh.position.copy(this.position);

        // Attack
        if (dist < 1.2) {
            this.game.player.health -= 5 * dt;
        }
    }

    dispose() {
        this.game.scene.remove(this.mesh);
        this.mesh.children.forEach(c => {
            c.geometry.dispose();
            c.material.dispose();
        });
    }
}

export class ZombieManager {
    constructor(game) {
        this.game = game;
        this.zombies = [];
        this.maxZombies = 10;
        this.spawnTimer = 0;
    }

    update(dt) {
        if (this.game.dayNight.isNight()) {
            this.spawnTimer += dt;
            if (this.spawnTimer > 5 && this.zombies.length < this.maxZombies) {
                this.spawnZombie();
                this.spawnTimer = 0;
            }
        } else {
            // Despawn zombies during day
            for (let i = this.zombies.length - 1; i >= 0; i--) {
                this.zombies[i].dispose();
                this.zombies.splice(i, 1);
            }
        }

        for (const zombie of this.zombies) {
            zombie.update(dt);
        }
    }

    spawnZombie() {
        const playerPos = this.game.player.position;
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 10;
        const x = playerPos.x + Math.cos(angle) * dist;
        const z = playerPos.z + Math.sin(angle) * dist;
        const y = this.game.world.getHeight(Math.floor(x), Math.floor(z));
        
        this.zombies.push(new Zombie(this.game, new THREE.Vector3(x, y, z)));
    }
}
