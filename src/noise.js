// Simplified Simplex Noise or Perlin Noise implementation
// This is a basic 2D and 3D noise generator

export class Noise {
    constructor(seed = 12345) {
        this.p = new Uint8Array(256);
        this.seed(seed);
    }

    seed(seed) {
        for (let i = 0; i < 256; i++) this.p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }
        this.p2 = new Uint8Array(512);
        for (let i = 0; i < 512; i++) this.p2[i] = this.p[i & 255];
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    perlin2(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const A = this.p2[X] + Y, AA = this.p2[A], AB = this.p2[A + 1];
        const B = this.p2[X + 1] + Y, BA = this.p2[B], BB = this.p2[B + 1];

        return this.lerp(v, this.lerp(u, this.grad(this.p2[AA], x, y, 0),
                                     this.grad(this.p2[BA], x - 1, y, 0)),
                           this.lerp(u, this.grad(this.p2[AB], x, y - 1, 0),
                                     this.grad(this.p2[BB], x - 1, y - 1, 0)));
    }

    perlin3(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        const A = this.p2[X] + Y, AA = this.p2[A] + Z, AB = this.p2[A + 1] + Z;
        const B = this.p2[X + 1] + Y, BA = this.p2[B] + Z, BB = this.p2[B + 1] + Z;

        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p2[AA], x, y, z),
                                                    this.grad(this.p2[BA], x - 1, y, z)),
                                         this.lerp(u, this.grad(this.p2[AB], x, y - 1, z),
                                                    this.grad(this.p2[BB], x - 1, y - 1, z))),
                           this.lerp(v, this.lerp(u, this.grad(this.p2[AA + 1], x, y, z - 1),
                                                    this.grad(this.p2[BA + 1], x - 1, y, z - 1)),
                                         this.lerp(u, this.grad(this.p2[AB + 1], x, y - 1, z - 1),
                                                    this.grad(this.p2[BB + 1], x - 1, y - 1, z - 1))));
    }
}
