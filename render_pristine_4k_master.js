const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_MP4 = '/Users/aryanrai/Desktop/HALO_30s_Commercial.mp4';
const TEMP_DIR = path.join(__dirname, 'pristine_frames');
const AUDIO_DIR = path.join(__dirname, 'audio_boosted');

async function renderPristineMaster() {
  console.log('🚀 Starting Fast Ultra-HD 4K Video & Studio Audio Synthesizer...');

  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
  else fs.readdirSync(TEMP_DIR).forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));

  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR);
  else fs.readdirSync(AUDIO_DIR).forEach(f => fs.unlinkSync(path.join(AUDIO_DIR, f)));

  // 1. Synthesize Studio Voiceover Audio Files with Boosted Gain (+12dB) & Clarity
  const script = [
    { text: "In a world of noise... silence is luxury.", file: 'vo1.aiff' },
    { text: "Meet HALO. The ambient wall clock with glowing interchangeable light rings.", file: 'vo2.aiff' },
    { text: "With Mood Sync smart feature, transform your room's ambiance from dawn to dusk with a single swipe.", file: 'vo3.aiff' },
    { text: "Engineered with ultra-quiet continuous silent sweep motion. No ticking sound — just pure elegance for work and home.", file: 'vo4.aiff' },
    { text: "Architectural light, premium craftsmanship, and timeless design.", file: 'vo5.aiff' },
    { text: "HALO. It's your time to shine.", file: 'vo6.aiff' }
  ];

  script.forEach((item) => {
    const aiff = path.join(AUDIO_DIR, item.file);
    const mp3 = path.join(AUDIO_DIR, item.file.replace('.aiff', '.mp3'));
    execSync(`say -v Daniel "${item.text}" -o "${aiff}"`);
    // Boost volume by 3.5x (+11dB) and apply audio clarity equalizer
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${aiff}" -filter:a "volume=3.5, equalizer=f=3200:width_type=h:width=1200:g=6" "${mp3}"`);
  });

  // Build Master Studio Audio Track
  const masterAudio = path.join(AUDIO_DIR, 'master_audio_boosted.mp3');
  const vo1 = path.join(AUDIO_DIR, 'vo1.mp3');
  const vo2 = path.join(AUDIO_DIR, 'vo2.mp3');
  const vo3 = path.join(AUDIO_DIR, 'vo3.mp3');
  const vo4 = path.join(AUDIO_DIR, 'vo4.mp3');
  const vo5 = path.join(AUDIO_DIR, 'vo5.mp3');
  const vo6 = path.join(AUDIO_DIR, 'vo6.mp3');

  const mixCmd = `/opt/homebrew/bin/ffmpeg -y \
    -f lavfi -i "sine=frequency=55:duration=30" \
    -i "${vo1}" -i "${vo2}" -i "${vo3}" -i "${vo4}" -i "${vo5}" -i "${vo6}" \
    -filter_complex "\
      [0:a]volume=0.3[hum]; \
      [1:a]adelay=400|400[v1]; \
      [2:a]adelay=4400|4400[v2]; \
      [3:a]adelay=9400|9400[v3]; \
      [4:a]adelay=15400|15400[v4]; \
      [5:a]adelay=21400|21400[v5]; \
      [6:a]adelay=26400|26400[v6]; \
      [hum][v1][v2][v3][v4][v5][v6]amix=inputs=7:duration=first:dropout_transition=2,volume=2.8[outa]" \
    -map "[outa]" -c:a mp3 -b:a 320k "${masterAudio}"`;

  console.log('🔊 Building Boosted Studio Audio Track...');
  execSync(mixCmd);

  // 2. Launch Puppeteer in 4K (3840x2160) Viewport & Capture 98% Ultra Quality JPEG Frames
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--window-size=3840,2160',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 }); // 4K 3840x2160 resolution

  console.log('🌐 Loading WebGL 3D Scene in Ultra-HD 4K...');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

  // Clean UI overlays for pure 4K video frame capture
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

  console.log(`📸 Capturing ${totalFrames} 4K Ultra-Quality Frames at 30 FPS...`);

  for (let i = 0; i < totalFrames; i++) {
    const targetTime = (i / totalFrames) * durationSec;

    await page.evaluate((t) => {
      if (window.seekTo) window.seekTo(t);
    }, targetTime);

    const framePath = path.join(TEMP_DIR, `frame_${String(i).padStart(4, '0')}.jpg`);
    await page.screenshot({ path: framePath, type: 'jpeg', quality: 98 });

    if (i % 150 === 0 || i === totalFrames - 1) {
      console.log(`   Captured frame ${i}/${totalFrames} (time: ${targetTime.toFixed(1)}s, ${Math.round((i / totalFrames) * 100)}%)...`);
    }
  }

  await browser.close();

  console.log('🎞️ Encoding Ultra-HD 4K Video with CRF 12 Quality + Loud Studio Audio...');

  const ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y \
    -framerate ${fps} -i "${TEMP_DIR}/frame_%04d.jpg" \
    -i "${masterAudio}" \
    -c:v libx264 -preset medium -crf 12 -pix_fmt yuv420p \
    -c:a aac -b:a 320k \
    -movflags +faststart \
    "${OUTPUT_MP4}"`;

  execSync(ffmpegCmd);

  console.log(`🎉 PRISTINE 4K MASTER MP4 SAVED TO: ${OUTPUT_MP4}`);

  // Cleanup temp files
  fs.readdirSync(TEMP_DIR).forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));
  fs.rmdirSync(TEMP_DIR);
  fs.readdirSync(AUDIO_DIR).forEach(f => fs.unlinkSync(path.join(AUDIO_DIR, f)));
  fs.rmdirSync(AUDIO_DIR);
}

renderPristineMaster().catch(err => {
  console.error('❌ Render failed:', err);
  process.exit(1);
});
