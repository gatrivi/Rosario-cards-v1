const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// Config: Adjust these
const inputDir = './input-images'; // Folder with your original images (e.g., jpg/png)
const outputDir = './output-pixelated'; // Where to save processed ones
const pixelSize = 8; // Lower = more pixelated (e.g., 4-16 for 1988-98 vibe)
const outputWidth = 256; // Final width after upscaling

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.readdirSync(inputDir).forEach(async (file) => {
  if (file.endsWith('.jpg') || file.endsWith('.png')) {
    const img = await loadImage(`${inputDir}/${file}`);
    const smallWidth = Math.floor(img.width / pixelSize);
    const smallHeight = Math.floor(img.height / pixelSize);
    
    const smallCanvas = createCanvas(smallWidth, smallHeight);
    const smallCtx = smallCanvas.getContext('2d');
    smallCtx.drawImage(img, 0, 0, smallWidth, smallHeight);
    
    const finalCanvas = createCanvas(outputWidth, outputWidth * (smallHeight / smallWidth));
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.imageSmoothingEnabled = false; // Key for pixelation
    finalCtx.drawImage(smallCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
    
    const buffer = finalCanvas.toBuffer('image/png');
    fs.writeFileSync(`${outputDir}/${file.replace(/\.[^/.]+$/, '')}-pixelated.png`, buffer);
    console.log(`Pixelated: ${file}`);
  }
});