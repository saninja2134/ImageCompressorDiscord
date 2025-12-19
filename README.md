# ImageCompressor Vencord Plugin

A Vencord plugin that allows you to upload images larger than 10MB by automatically compressing them to fit just under Discord's non-Nitro limit.

## Features
- **Smart Compression**: Uses binary search to find the highest possible quality that fits under 10MB.
- **High Resolution Support**: Supports up to 8K resolution before downscaling.
- **Dedicated Button**: Adds a new image icon to your chat bar for easy access.
- **Bypass Limits**: No more "File is too powerful" popups for images.

## Installation

### 1. Prerequisites
You must have a local installation of Vencord. If you don't, follow the [Vencord Contribution Guide](https://github.com/Vendicated/Vencord/blob/main/CONTRIBUTING.md).

### 2. Setup Plugin Folder
1. Navigate to your Vencord directory.
2. Create a new folder: `src/userplugins/imageCompressor`.
3. Copy the `index.tsx` file from this repository into that folder.

### 3. Build and Inject
Run the following commands in your Vencord directory:
```powershell
pnpm install
pnpm build
pnpm inject
```

### 4. Enable the Plugin
1. Restart Discord.
2. Go to **User Settings** > **Vencord** > **Plugins**.
3. Search for **ImageCompressor** and enable it.

## Usage
Click the new **Image Icon** in your chat bar (next to the GIF/Sticker buttons). Select an image, and the plugin will handle the rest!

## License
GPL-3.0-or-later
