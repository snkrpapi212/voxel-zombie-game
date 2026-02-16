import * as THREE from 'three';
import { Inventory, BLOCK_TYPES } from './inventory.js';

export class Player {
    constructor(game) {
        this.game = game;
        this.camera = game.camera;
        this.inventory = new Inventory();
        
        this.velocity = new THREE.Vector3();
        // Start player higher up to avoid immediate ground collision issues
        this.position = new THREE.Vector3(8, 30, 8);
        this.height = 1.8;
        this.radius = 0.4;
        
        this.health = 100;
        this.hunger = 100;
        
        this.onGround = false;
        
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 5;
        
        this.init();
    }

    init() {
        window.addEventListener('mousedown', (e) => {
            if (!this.game.controls.isLocked()) return;
            if (e.button === 0) this.breakBlock();
            if (e.button === 2) this.placeBlock();
        });

        window.addEventListener('wheel', (e) => {
            if (!this.game.controls.isLocked()) return;
            if (e.deltaY > 0) {
                this.inventory.selectedHotbarIndex = (this.inventory.selectedHotbarIndex + 1) % 9;
            } else {
                this.inventory.selectedHotbarIndex = (this.inventory.selectedHotbarIndex - 1 + 9) % 9;
            }
            this.game.ui.updateHotbar();
        });
    }

    update(dt) {
        this.handleMovement(dt);
        this.applyGravity(dt);
        this.checkCollisions();
        
        this.camera.position.copy(this.position);
        this.camera.position.y += this.height * 0.8;

        // Auto-heal/hunger logic
        if (this.hunger > 0) {
            this.hunger -= 0.01 * dt;
        }
    }

    handleMovement(dt) {
        const moveVec = this.game.controls.getMovementVector();
        const speed = this.game.controls.isSprinting() ? 10 : 5;
        
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        
        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        
        const wishDir = new THREE.Vector3()
            .addScaledVector(forward, -moveVec.z)
            .addScaledVector(right, moveVec.x)
            .normalize();
            
        this.velocity.x = wishDir.x * speed;
        this.velocity.z = wishDir.z * speed;
        
        if (this.game.controls.isJumping() && this.onGround) {
            this.velocity.y = 8;
            this.onGround = false;
        }
    }

    applyGravity(dt) {
        this.velocity.y -= 25 * dt;
        if (this.velocity.y < -50) this.velocity.y = -50;
    }

    checkCollisions() {
        const nextPos = this.position.clone().addScaledVector(this.velocity, 1/60);
        
        // Simple voxel collision
        const blockX = Math.floor(nextPos.x);
        const blockY = Math.floor(nextPos.y);
        const blockZ = Math.floor(nextPos.z);
        
        const groundBlock = this.game.world.getBlock(blockX, Math.floor(nextPos.y - 0.1), blockZ);
        if (groundBlock !== BLOCK_TYPES.AIR) {
            if (this.velocity.y < 0) {
                this.velocity.y = 0;
                this.onGround = true;
                nextPos.y = Math.floor(nextPos.y) + 1;
            }
        } else {
            this.onGround = false;
        }

        // Horizontal collision (very basic)
        const wallBlock = this.game.world.getBlock(Math.floor(nextPos.x), Math.floor(nextPos.y + 0.5), Math.floor(nextPos.z));
        if (wallBlock !== BLOCK_TYPES.AIR) {
            this.velocity.x = 0;
            this.velocity.z = 0;
            return;
        }

        this.position.copy(nextPos);
    }

    breakBlock() {
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const intersects = this.raycaster.intersectObjects(this.game.world.getChunkMeshes());
        
        if (intersects.length > 0) {
            const intersect = intersects[0];
            // Point is slightly inside the block to get the correct coordinate
            const pos = intersect.point.clone().addScaledVector(intersect.face.normal, -0.5);
            const x = Math.floor(pos.x);
            const y = Math.floor(pos.y);
            const z = Math.floor(pos.z);
            
            const type = this.game.world.getBlock(x, y, z);
            if (type !== BLOCK_TYPES.AIR) {
                this.game.world.setBlock(x, y, z, BLOCK_TYPES.AIR);
                this.inventory.addItem(type, 1);
                this.game.ui.updateHotbar();
            }
        }
    }

    placeBlock() {
        const selectedItem = this.inventory.getSelectedItem();
        if (!selectedItem) return;

        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const intersects = this.raycaster.intersectObjects(this.game.world.getChunkMeshes());
        
        if (intersects.length > 0) {
            const intersect = intersects[0];
            // Point is slightly outside the block
            const pos = intersect.point.clone().addScaledVector(intersect.face.normal, 0.5);
            const x = Math.floor(pos.x);
            const y = Math.floor(pos.y);
            const z = Math.floor(pos.z);
            
            // Check if block is inside player
            const playerBox = new THREE.Box3().setFromCenterAndSize(
                this.position.clone().add(new THREE.Vector3(0, this.height/2, 0)),
                new THREE.Vector3(this.radius*2, this.height, this.radius*2)
            );
            const blockBox = new THREE.Box3(new THREE.Vector3(x, y, z), new THREE.Vector3(x+1, y+1, z+1));
            
            if (!playerBox.intersectsBox(blockBox)) {
                this.game.world.setBlock(x, y, z, selectedItem.type);
                this.inventory.removeSelectedItem(1);
                this.game.ui.updateHotbar();
            }
        }
    }
}
