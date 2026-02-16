export const BLOCK_TYPES = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    PLANKS: 5,
    CRAFTING_TABLE: 6
};

export const BLOCK_DATA = {
    [BLOCK_TYPES.GRASS]: { name: "Grass", color: "#4caf50" },
    [BLOCK_TYPES.DIRT]: { name: "Dirt", color: "#795548" },
    [BLOCK_TYPES.STONE]: { name: "Stone", color: "#9e9e9e" },
    [BLOCK_TYPES.WOOD]: { name: "Wood", color: "#5d4037" },
    [BLOCK_TYPES.PLANKS]: { name: "Planks", color: "#d2b48c" },
    [BLOCK_TYPES.CRAFTING_TABLE]: { name: "Crafting Table", color: "#8b4513" }
};

export class Inventory {
    constructor() {
        this.slots = new Array(27).fill(null).map(() => null); // 27 inventory slots
        this.hotbar = new Array(9).fill(null).map(() => null); // 9 hotbar slots
        this.selectedHotbarIndex = 0;

        // Start with some items
        this.addItem(BLOCK_TYPES.WOOD, 4);
    }

    addItem(type, count = 1) {
        // Try hotbar first
        for (let i = 0; i < 9; i++) {
            if (this.hotbar[i] && this.hotbar[i].type === type) {
                this.hotbar[i].count += count;
                return true;
            }
        }
        for (let i = 0; i < 9; i++) {
            if (!this.hotbar[i]) {
                this.hotbar[i] = { type, count };
                return true;
            }
        }

        // Then inventory
        for (let i = 0; i < 27; i++) {
            if (this.slots[i] && this.slots[i].type === type) {
                this.slots[i].count += count;
                return true;
            }
        }
        for (let i = 0; i < 27; i++) {
            if (!this.slots[i]) {
                this.slots[i] = { type, count };
                return true;
            }
        }
        return false;
    }

    getSelectedItem() {
        return this.hotbar[this.selectedHotbarIndex];
    }

    removeSelectedItem(count = 1) {
        const item = this.hotbar[this.selectedHotbarIndex];
        if (item) {
            item.count -= count;
            if (item.count <= 0) {
                this.hotbar[this.selectedHotbarIndex] = null;
            }
            return true;
        }
        return false;
    }
}
