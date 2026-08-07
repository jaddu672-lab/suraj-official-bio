const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_MP4 = '/Users/aryanrai/Desktop/HALO_30s_Commercial.mp4';
const TEMP_DIR = path.join(__dirname, 'fast_frames');

async function recordCommercial() {
  console.log('⚡ Starting High-Speed Frame Recorder for HALO 30-Second Commercial...');
  
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
  } else {
    fs.readdirSync(TEMP_DIR).forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--window-size=1920,1080',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  console.log('🌐 Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

  // Hide UI overlays for ultra-clean video rendering
  await page.evaluate(() => {
    const header = document.querySelector('.app-header');
    const sidebar = document.querySelector('.sidebar-section');
    const controls = document.querySelector('.player-control-bar');
    const playOverlay = document.querySelector('.play-overlay-trigger');
    const main = document.querySelector('.main-container');
    const frame = document.querySelector('.video-frame-wrapper');

    if (header) header.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
    if (controls) controls.style.display = 'none';
    if (playOverlay) playOverlay.style.display = 'none';
    if (main) {
      main.style.display = 'block';
      main.style.padding = '0';
      main.style.maxWidth = '100%';
    }
    if (frame) {
      frame.style.maxWidth = '100vw';
      frame.style.height = '100vh';
      frame.style.borderRadius = '0';
      frame.style.border = 'none';
    }
  });

  const fps = 30;
  const durationSec = 30;
  const totalFrames = fps * durationSec; // 900 frames

  console.log(`📸 Capturing ${totalFrames} frame-accurate JPEG screenshots at 30 FPS...`);

  for (let i = 0; i < totalFrames; i++) {
    const targetTime = (i / totalFrames) * durationSec;

    // Advance 3D scene & camera position frame-by-frame
    await page.evaluate((time) => {
      if (window.seekTo) {
        window.seekTo(time);
      }
    }, targetTime);

    const framePath = path.join(TEMP_DIR, `frame_${String(i).padStart(4, '0')}.jpg`);
    await page.screenshot({ path: framePath, type: 'jpeg', quality: 90 });

    if (i % 150 === 0 || i === totalFrames - 1) {
      console.log(`   Captured frame ${i}/${totalFrames} (time: ${targetTime.toFixed(1)}s, ${Math.round((i / totalFrames) * 100)}%)...`);
    }
  }

  console.log('✅ Frame capture complete! Closing browser...');
  await browser.close();

  console.log('🎞️ Rendering MP4 video using ffmpeg...');
  const ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -framerate ${fps} -i "${TEMP_DIR}/frame_%04d.jpg" -c:v libx264 -pix_fmt yuv420p -crf 18 "${OUTPUT_MP4}"`;
  
  execSync(ffmpegCmd);

  console.log(`🎉 100% PERFECT SMOOTH MP4 VIDEO SAVED TO: ${OUTPUT_MP4}`);
  
  // Cleanup temp frames
  fs.readdirSync(TEMP_DIR).forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));
  fs.rmdirSync(TEMP_DIR);
}

recordCommercial().catch(err => {
  console.error('❌ Recording failed:', err);
  process.exit(1);
});
