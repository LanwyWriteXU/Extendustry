# Extendustry

A visual editor for creating Scratch extensions.

## Features

- Visual block editor with drag-and-drop interface
- Multiple element types: labels, text inputs, number inputs, dropdowns, color pickers, booleans, and statement branches
- Project file management (save/load .ext files)
- Internationalization support
- Dark mode support
- Real-time block preview using Blockly
- Block library management
- Extension configuration (name, ID, author, license, color, icons)

## Quick Start

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## Usage

### Creating Blocks

1. Select block type (command, event, conditional, loop, reporter, boolean)
2. Click "Add Element" to add elements to your block
3. Configure element properties in the element list
4. Preview your block in real-time

### Project Management

- **Save Project**: File > Save Project
- **Save As**: File > Save As
- **Open Project**: File > Open Project
- **New Extension**: File > New Extension

### Block Library

Click the block library button in the toolbar to:
- View all blocks in the current project
- Switch between blocks
- Manage the block list

### Extension Settings

Click the project settings button to:
- Set extension name and ID
- Add author information and license
- Set description and color
- Upload extension and block icons

## Project Structure

```
Extendustry/
├── src/
│   ├── components/           # React components
│   ├── contexts/             # React contexts
│   ├── locales/              # Internationalization files
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Main app component
│   └── main.jsx              # React entry
├── public/                   # Static assets
├── online/                   # Build output
├── index.html                # HTML template
├── package.json              # Project config
├── vite.config.js            # Vite config
└── README.md                 # This file
```

## Project File Format

Extendustry uses `.ext` format for project files:

```json
{
  "version": "1.0",
  "extensionName": "My Extension",
  "extensionSettings": {
    "extensionName": "My Extension",
    "extensionId": "myExtension",
    "author": "Extendustry",
    "license": "MIT",
    "description": "",
    "color1": "#66CCFF",
    "extensionIcon": "",
    "blockIcon": ""
  },
  "blocks": [...],
  "savedAt": "2026-03-07T..."
}
```

## License

GNU General Public License v3.0