const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_MP4 = '/Users/aryanrai/Desktop/HALO_30s_Commercial.mp4';
const TEMP_DIR = path.join(__dirname, 'audio_temp');

function buildAudioAndVideo() {
  console.log('🎙️ Synthesizing Voiceover Narration & Sound FX Tracks...');

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
  }

  // 1. Generate Voiceover Audio Files using macOS speech synthesizer
  const script = [
    { time: 0.5, text: "In a world of noise... silence is luxury.", file: 'vo1.aiff' },
    { time: 4.5, text: "Meet HALO. The ambient wall clock with glowing interchangeable light rings.", file: 'vo2.aiff' },
    { time: 9.5, text: "With Mood Sync smart feature, transform your room's ambiance from dawn to dusk with a single swipe.", file: 'vo3.aiff' },
    { time: 15.5, text: "Engineered with ultra-quiet continuous silent sweep motion. No ticking sound — just pure elegance for work and home.", file: 'vo4.aiff' },
    { time: 21.5, text: "Architectural light, premium craftsmanship, and timeless design.", file: 'vo5.aiff' },
    { time: 26.5, text: "HALO. It's your time to shine.", file: 'vo6.aiff' }
  ];

  script.forEach(item => {
    const filePath = path.join(TEMP_DIR, item.file);
    console.log(`  🗣️ Generating voiceover: "${item.text.substring(0, 30)}..."`);
    execSync(`say -v Daniel "${item.text}" -o "${filePath}"`);
  });

  // Convert AIFF to MP3
  script.forEach(item => {
    const aiffPath = path.join(TEMP_DIR, item.file);
    const mp3Path = path.join(TEMP_DIR, item.file.replace('.aiff', '.mp3'));
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${aiffPath}" "${mp3Path}"`);
  });

  console.log('🎵 Building Master Audio Track with Ambient Synth Hum...');

  // Build audio timeline filter for ffmpeg
  const vo1 = path.join(TEMP_DIR, 'vo1.mp3');
  const vo2 = path.join(TEMP_DIR, 'vo2.mp3');
  const vo3 = path.join(TEMP_DIR, 'vo3.mp3');
  const vo4 = path.join(TEMP_DIR, 'vo4.mp3');
  const vo5 = path.join(TEMP_DIR, 'vo5.mp3');
  const vo6 = path.join(TEMP_DIR, 'vo6.mp3');
  const masterAudio = path.join(TEMP_DIR, 'master_audio.mp3');

  // Complex audio filter to mix synth hum + delayed voiceovers
  const ffmpegAudioCmd = `/opt/homebrew/bin/ffmpeg -y \
    -f lavfi -i "sine=frequency=60:duration=30" \
    -i "${vo1}" -i "${vo2}" -i "${vo3}" -i "${vo4}" -i "${vo5}" -i "${vo6}" \
    -filter_complex "\
      [0:a]volume=0.15[hum]; \
      [1:a]adelay=500|500[v1]; \
      [2:a]adelay=4500|4500[v2]; \
      [3:a]adelay=9500|9500[v3]; \
      [4:a]adelay=15500|15500[v4]; \
      [5:a]adelay=21500|21500[v5]; \
      [6:a]adelay=26500|26500[v6]; \
      [hum][v1][v2][v3][v4][v5][v6]amix=inputs=7:duration=first:dropout_transition=2[outa]" \
    -map "[outa]" -c:a mp3 -b:a 192k "${masterAudio}"`;

  execSync(ffmpegAudioCmd);

  console.log('🎬 Merging Master Audio with 100% Smooth Video Track...');

  const tempVideo = path.join(TEMP_DIR, 'temp_video.mp4');
  const fastFramesDir = path.join(__dirname, 'fast_frames');

  // Re-encode video if fast_frames exists, or combine directly
  if (fs.existsSync(fastFramesDir) && fs.readdirSync(fastFramesDir).length > 0) {
    execSync(`/opt/homebrew/bin/ffmpeg -y -framerate 30 -i "${fastFramesDir}/frame_%04d.jpg" -c:v libx264 -pix_fmt yuv420p -crf 18 "${tempVideo}"`);
  } else {
    execSync(`cp "${OUTPUT_MP4}" "${tempVideo}"`);
  }

  // Combine video + audio into final Desktop MP4
  const finalCombineCmd = `/opt/homebrew/bin/ffmpeg -y -i "${tempVideo}" -i "${masterAudio}" -c:v copy -c:a aac -b:a 192k -movflags +faststart "${OUTPUT_MP4}"`;
  execSync(finalCombineCmd);

  console.log(`🎉 AUDIO & VIDEO SUCCESSFULLY MERGED! Saved to: ${OUTPUT_MP4}`);

  // Cleanup temp audio
  fs.readdirSync(TEMP_DIR).forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));
  fs.rmdirSync(TEMP_DIR);
}

try {
  buildAudioAndVideo();
} catch (err) {
  console.error('❌ Audio build error:', err);
}
