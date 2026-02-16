import { BLOCK_DATA } from './inventory.js';
import { Crafting } from './crafting.js';

export class UI {
    constructor(game) {
        this.game = game;
        this.inventoryGrid = document.getElementById('inventory-grid');
        this.hotbarSlots = document.querySelectorAll('.hotbar-slot');
        this.healthBar = document.getElementById('health-bar');
        this.hungerBar = document.getElementById('hunger-bar');
        this.inventoryModal = document.getElementById('inventory-modal');
        this.craftingInputSlots = document.querySelectorAll('#crafting-input-grid .crafting-slot');
        this.craftingOutputSlot = document.getElementById('crafting-output-slot');

        this.craftingGrid = [null, null, null, null];

        this.init();
    }

    init() {
        this.updateHotbar();
        window.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                this.toggleInventory();
            }
        });

        this.craftingInputSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => this.handleCraftingInputClick(index));
        });

        this.craftingOutputSlot.addEventListener('click', () => this.handleCraftingOutputClick());
    }

    updateHotbar() {
        this.hotbarSlots.forEach((slot, i) => {
            const item = this.game.player.inventory.hotbar[i];
            slot.innerHTML = '';
            if (item) {
                const color = BLOCK_DATA[item.type].color;
                slot.innerHTML = `<div class="item-icon" style="background-color: ${color}"></div><span class="item-count">${item.count}</span>`;
            }
            if (i === this.game.player.inventory.selectedHotbarIndex) {
                slot.classList.add('selected');
            } else {
                slot.classList.remove('selected');
            }
        });
    }

    updateInventory() {
        if (!this.inventoryGrid) return;
        this.inventoryGrid.innerHTML = '';
        for (let i = 0; i < 27; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            const item = this.game.player.inventory.slots[i];
            if (item) {
                const color = BLOCK_DATA[item.type].color;
                slot.innerHTML = `<div class="item-icon" style="background-color: ${color}"></div><span class="item-count">${item.count}</span>`;
            }
            this.inventoryGrid.appendChild(slot);
        }
    }

    updateStats() {
        this.healthBar.style.width = `${this.game.player.health}%`;
        this.hungerBar.style.width = `${this.game.player.hunger}%`;
    }

    toggleInventory() {
        const isHidden = this.inventoryModal.classList.contains('hidden');
        if (isHidden) {
            this.inventoryModal.classList.remove('hidden');
            this.updateInventory();
            this.game.controls.unlock();
        } else {
            this.inventoryModal.classList.add('hidden');
            this.game.controls.lock();
        }
    }

    handleCraftingInputClick(index) {
        // Simple crafting logic: take from selected hotbar item
        const item = this.game.player.inventory.getSelectedItem();
        if (item) {
            this.craftingGrid[index] = item.type;
            this.game.player.inventory.removeSelectedItem(1);
            this.updateHotbar();
            this.refreshCraftingUI();
        }
    }

    refreshCraftingUI() {
        this.craftingInputSlots.forEach((slot, i) => {
            const type = this.craftingGrid[i];
            slot.innerHTML = '';
            if (type) {
                const color = BLOCK_DATA[type].color;
                slot.innerHTML = `<div class="item-icon" style="background-color: ${color}"></div>`;
            }
        });

        const result = Crafting.checkRecipe(this.craftingGrid);
        this.craftingOutputSlot.innerHTML = '';
        if (result) {
            const color = BLOCK_DATA[result.type].color;
            this.craftingOutputSlot.innerHTML = `<div class="item-icon" style="background-color: ${color}"></div><span class="item-count">${result.count}</span>`;
        }
    }

    handleCraftingOutputClick() {
        const result = Crafting.checkRecipe(this.craftingGrid);
        if (result) {
            this.game.player.inventory.addItem(result.type, result.count);
            this.craftingGrid = [null, null, null, null];
            this.refreshCraftingUI();
            this.updateHotbar();
            this.updateInventory();
        }
    }
}
