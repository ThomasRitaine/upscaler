import {
  INPUT_DIR,
  OUTPUT_DIR,
  MAX_WIDTH,
  UPSCALE_API_URL,
  WATCH_DELAY_MS,
} from "./constants.ts";
import sharp from "npm:sharp";

// Ensure the in and out directories exist
await Deno.mkdir(INPUT_DIR, { recursive: true });
await Deno.mkdir(OUTPUT_DIR, { recursive: true });

// Watch the input directory for new images
const watcher = Deno.watchFs(INPUT_DIR);

console.log(`Watching for new images in ${INPUT_DIR}...`);

for await (const event of watcher) {
  for (const path of event.paths) {
    if (
      event.kind === "create" &&
      (path.endsWith(".jpg") || path.endsWith(".png"))
    ) {
      console.log(`New image detected: ${path}`);
      processImage(path).catch((error) =>
        console.error(`Error processing image: ${error}`),
      );
    }
  }
}

async function processImage(filePath: string) {
  // Wait to ensure the file is fully written
  await delay(WATCH_DELAY_MS);

  // Read the image using sharp
  let image = sharp(filePath);
  let metadata = await image.metadata();
  let width = metadata.width || 0;

  console.log(`Original image width: ${width}px`);

  // Upscale the image until the width exceeds MAX_WIDTH
  while (width < MAX_WIDTH) {
    console.log(`Upscaling image to width: ${width * 2}px`);

    // Get the image buffer
    const imageBuffer = await image.toBuffer();

    // Send the image to the API
    const upscaledImageBuffer = await upscaleImage(imageBuffer);

    // Replace the current image with the upscaled one
    image = sharp(upscaledImageBuffer);

    // Update the width
    metadata = await image.metadata();
    width = metadata.width || 0;

    console.log(`New image width: ${width}px`);
  }

  // Convert to PNG and optimize
  const optimizedBuffer = await image
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();

  // Save to output directory
  const outputFileName = `${OUTPUT_DIR}/${getFileName(filePath)}.png`;
  await Deno.writeFile(outputFileName, optimizedBuffer);

  console.log(`Processed and saved: ${outputFileName}`);
}

function getFileName(filePath: string): string {
  const fileName = filePath.split("/").pop() || "";
  return fileName.replace(/\.[^/.]+$/, ""); // Remove extension
}

async function upscaleImage(imageBuffer: Uint8Array): Promise<Uint8Array> {
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/png" });
  formData.append("image", blob, "image.png");
  formData.append("scale", "2");

  const response = await fetch(UPSCALE_API_URL, {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
      "x-client-version": "web",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upscaling failed: ${response.statusText}`);
  }

  const jsonResponse = await response.json();
  const resultUrl = jsonResponse.result_url;

  // Download the upscaled image
  const imageResponse = await fetch(resultUrl);

  if (!imageResponse.ok) {
    throw new Error(
      `Failed to download upscaled image: ${imageResponse.statusText}`,
    );
  }

  const upscaledImageBuffer = new Uint8Array(await imageResponse.arrayBuffer());
  return upscaledImageBuffer;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
