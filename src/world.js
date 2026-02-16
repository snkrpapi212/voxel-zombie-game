import * as THREE from 'three';
import { Chunk, CHUNK_SIZE } from './chunk.js';
import { Noise } from './noise.js';
import { BLOCK_TYPES } from './inventory.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map();
        this.noise = new Noise();
        this.renderDistance = 4;
    }

    getHeight(x, z) {
        const n = this.noise.perlin2(x * 0.05, z * 0.05);
        return Math.floor((n + 1) * 8) + 5;
    }

    getChunkKey(x, y, z) {
        return `${x},${y},${z}`;
    }

    getBlock(x, y, z) {
        const cx = Math.floor(x / CHUNK_SIZE);
        const cy = Math.floor(y / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const chunk = this.chunks.get(this.getChunkKey(cx, cy, cz));
        
        if (!chunk) return BLOCK_TYPES.AIR;
        
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const ly = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        
        return chunk.getBlock(lx, ly, lz);
    }

    setBlock(x, y, z, type) {
        const cx = Math.floor(x / CHUNK_SIZE);
        const cy = Math.floor(y / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const key = this.getChunkKey(cx, cy, cz);
        let chunk = this.chunks.get(key);
        
        if (!chunk) {
            chunk = new Chunk(this, cx, cy, cz);
            this.chunks.set(key, chunk);
        }
        
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const ly = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        
        chunk.setBlock(lx, ly, lz, type);
        chunk.updateMesh();

        // Update neighbors if block is on edge
        if (lx === 0) this.updateChunkMesh(cx - 1, cy, cz);
        if (lx === CHUNK_SIZE - 1) this.updateChunkMesh(cx + 1, cy, cz);
        if (ly === 0) this.updateChunkMesh(cx, cy - 1, cz);
        if (ly === CHUNK_SIZE - 1) this.updateChunkMesh(cx, cy + 1, cz);
        if (lz === 0) this.updateChunkMesh(cx, cy, cz - 1);
        if (lz === CHUNK_SIZE - 1) this.updateChunkMesh(cx, cy, cz + 1);
    }

    updateChunkMesh(cx, cy, cz) {
        const chunk = this.chunks.get(this.getChunkKey(cx, cy, cz));
        if (chunk) {
            chunk.isDirty = true;
            chunk.updateMesh();
        }
    }

    update(playerPosition) {
        const px = Math.floor(playerPosition.x / CHUNK_SIZE);
        const py = Math.floor(playerPosition.y / CHUNK_SIZE);
        const pz = Math.floor(playerPosition.z / CHUNK_SIZE);

        const newChunks = new Set();

        for (let x = px - this.renderDistance; x <= px + this.renderDistance; x++) {
            for (let y = 0; y < 2; y++) { // Height range
                for (let z = pz - this.renderDistance; z <= pz + this.renderDistance; z++) {
                    const key = this.getChunkKey(x, y, z);
                    newChunks.add(key);
                    if (!this.chunks.has(key)) {
                        const chunk = new Chunk(this, x, y, z);
                        this.chunks.set(key, chunk);
                    }
                }
            }
        }

        // Unload old chunks
        for (const [key, chunk] of this.chunks) {
            if (!newChunks.has(key)) {
                chunk.dispose();
                this.chunks.delete(key);
            }
        }

        // Update meshes
        for (const chunk of this.chunks.values()) {
            chunk.updateMesh();
        }
    }

    getChunkMeshes() {
        return Array.from(this.chunks.values())
            .map(c => c.mesh)
            .filter(m => m !== null);
    }
}
