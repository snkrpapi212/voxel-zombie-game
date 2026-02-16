import { BLOCK_TYPES } from './inventory.js';

export const RECIPES = [
    {
        input: [BLOCK_TYPES.WOOD],
        output: { type: BLOCK_TYPES.PLANKS, count: 4 },
        shape: [1]
    },
    {
        input: [BLOCK_TYPES.PLANKS, BLOCK_TYPES.PLANKS, BLOCK_TYPES.PLANKS, BLOCK_TYPES.PLANKS],
        output: { type: BLOCK_TYPES.CRAFTING_TABLE, count: 1 },
        shape: [2, 2]
    }
];

export class Crafting {
    static checkRecipe(grid) {
        // grid is 2x2 array of types
        // Simple matching logic
        if (grid[0] === BLOCK_TYPES.WOOD && !grid[1] && !grid[2] && !grid[3]) {
            return { type: BLOCK_TYPES.PLANKS, count: 4 };
        }
        if (grid[0] === BLOCK_TYPES.PLANKS && grid[1] === BLOCK_TYPES.PLANKS && 
            grid[2] === BLOCK_TYPES.PLANKS && grid[3] === BLOCK_TYPES.PLANKS) {
            return { type: BLOCK_TYPES.CRAFTING_TABLE, count: 1 };
        }
        return null;
    }
}
