# Upscaler

Upscaler is a Deno script that watches an input directory for image files (JPG or PNG), upscales them incrementally by 2x until their width exceeds a specified maximum (default is 4000px), converts them to PNG format, optimizes them to reduce file size, and saves the processed images to an output directory.

## Features

- **Automatic Upscaling**: Upscales images by 2x increments until they exceed the maximum width.
- **Format Conversion**: Converts images to PNG format after upscaling.
- **Image Optimization**: Optimizes images to reduce file size using Sharp.
- **Directory Watching**: Monitors the input directory for new images and processes them automatically.
- **Configurable Settings**: Important values like directories and maximum width are easily configurable.

## Prerequisites

- **Deno**: Version 2.x (latest version). [Install Deno](https://docs.deno.com/runtime/getting_started/installation/)
- **Sharp**: Image processing library. Imported via Deno's npm compatibility layer (no manual installation required).

## Installation

**Clone the Repository**

```bash
git clone https://github.com/ThomasRitaine/upscaler.git
cd upscaler
```

## Configuration

All important values are defined as constants in `constants.ts`. You can adjust them according to your needs:

```typescript
export const INPUT_DIR = "./input";
export const OUTPUT_DIR = "./output";
export const MAX_WIDTH = 4000; // Width at which we stop upscaling
export const UPSCALE_API_URL = "https://api2.pixelcut.app/image/upscale/v1";
export const WATCH_DELAY_MS = 1000; // Delay to ensure file is fully written
```

- **INPUT_DIR**: Directory to watch for new images.
- **OUTPUT_DIR**: Directory where processed images will be saved.
- **MAX_WIDTH**: Maximum width to stop upscaling.
- **UPSCALE_API_URL**: API endpoint used for upscaling images.
- **WATCH_DELAY_MS**: Delay to ensure the file is fully written before processing.

## Usage

### Running the Script

The project uses Deno tasks for easy script execution. The task is defined in `deno.json`:

```json
{
  "tasks": {
    "dev": "deno run --watch --allow-read --allow-write --allow-net --allow-ffi --allow-env script.ts"
  }
}
```

To run the script in development mode, use:

```bash
deno run dev
```

This command:

- Watches for file changes and restarts automatically.
- Grants necessary permissions:
  - `--allow-read`: Read file system access.
  - `--allow-write`: Write file system access.
  - `--allow-net`: Network access (required for API calls).
  - `--allow-ffi`: Foreign Function Interface (required by Sharp).
  - `--allow-env`: Access to environment variables.

### Processing Images

1. **Add Images to Input Directory**

   Place your `.jpg` or `.png` images in the `input` directory.

2. **Automatic Processing**

   The script automatically detects new images and starts processing them.

3. **Retrieve Processed Images**

   Processed images will be saved in the `output` directory in PNG format.

### Example

```bash
$ deno run dev
Watching for new images in ./input...
New image detected: ./input/sample.jpg
Original image width: 800px
Upscaling image to width: 1600px
New image width: 1600px
Upscaling image to width: 3200px
New image width: 3200px
Upscaling image to width: 6400px
New image width: 6400px
Processed and saved: ./output/sample.png
```

## Dependencies

- **Deno 2.x**: A modern JavaScript and TypeScript runtime.
- **Sharp**: High-performance image processing library.

## Notes

- The script utilizes Deno's native APIs and is written in TypeScript with typed imports.
- It uses the Sharp library via Deno's npm compatibility layer, so no manual installation of Sharp is necessary.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

[MIT License](LICENSE)
