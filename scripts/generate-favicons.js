import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateFavicons() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const svgPath = path.join(publicDir, 'favicon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG files
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(svgBuffer).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'android-chrome-512x512.png'));

  // Copy 32x32 or 64x64 as favicon.ico
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✅ Favicon files generated successfully in /public!');
}

generateFavicons().catch(err => {
  console.error('❌ Error generating favicons:', err);
  process.exit(1);
});
