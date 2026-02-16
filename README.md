# 3D Voxel Survival Game with Zombies

A complete, 3D browser-based voxel survival game built with Three.js. This project features infinite procedural terrain, first-person movement, block placement/breaking, a day/night cycle, and a zombie AI system.

## 🌍 Features

- **Infinite Procedural World**: Chunk-based terrain generation using Perlin noise.
- **Player System**: First-person camera with pointer lock, WASD movement, jumping, and sprinting.
- **Interaction**: Break blocks with Left Click, place blocks with Right Click.
- **Zombie AI**: Zombies spawn at night and hunt the player.
- **Day/Night Cycle**: Dynamic lighting and sky color transitions.
- **Inventory & Crafting**: 9-slot hotbar, full inventory screen ('E'), and a basic crafting system.
- **Optimized Rendering**: Uses chunk-based meshing with face culling for performance.

## 🎮 Controls

| Action | Control |
|--------|---------|
| Move | WASD |
| Jump | Space |
| Sprint | Shift |
| Break Block | Left Click |
| Place Block | Right Click |
| Inventory | E |
| Select Hotbar | Scroll Wheel / 1-9 |
| Lock/Unlock Mouse | Click screen / Esc |

## 🛠️ Crafting Recipes

- **Wood** → **4x Planks** (Single wood in any crafting slot)
- **4x Planks** → **Crafting Table** (2x2 grid of planks)

## 🚀 Getting Started

This game runs as a pure static web application. To avoid CORS issues with ES6 modules, you must serve it using a local web server.

### Option 1: Using Python
```bash
python -m http.server
```

### Option 2: Using Node.js (npx)
```bash
npx serve
```

Once running, open `http://localhost:8000` (or the provided port) in your browser.

## 📁 Folder Structure

```text
/voxel-zombie-game
│── index.html       # Game entry point
│── style.css        # UI styling
│── /src             # Source code
│   │── main.js      # Game initialization
│   │── world.js     # World management
│   │── chunk.js     # Chunk generation & meshing
│   │── player.js    # Player logic & physics
│   │── zombie.js    # Zombie AI & management
│   │── ui.js        # UI interaction logic
│   └── ...
└── /assets          # Placeholders for textures & audio
```

## 🎨 Assets

The game currently uses colored placeholders for textures. You can replace the files in `/assets/textures` and `/assets/audio` to customize the game's appearance and sound.
