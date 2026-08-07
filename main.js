/* SURAJ BIO PAGE MAIN JAVASCRIPT & PARTICLE ENGINE */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔥 Initializing SURAJ Cinematic Bio Page...');

  // Copy Username functionality
  const btnCopyUsername = document.getElementById('btn-copy-username');
  const copyTitleText = document.getElementById('copy-title-text');
  const copyBadge = document.getElementById('copy-badge');

  btnCopyUsername.addEventListener('click', () => {
    const username = '@TG_SURAJ_OWNER';
    navigator.clipboard.writeText(username).then(() => {
      copyTitleText.textContent = 'COPIED TO CLIPBOARD!';
      copyBadge.textContent = 'SUCCESS';
      copyBadge.style.background = '#FF1A3C';
      copyBadge.style.color = '#FFF';

      setTimeout(() => {
        copyTitleText.textContent = 'COPY USERNAME';
        copyBadge.textContent = 'CLICK TO COPY';
        copyBadge.style.background = 'rgba(255, 255, 255, 0.1)';
        copyBadge.style.color = '#B3A8B8';
      }, 2000);
    });
  });

  // Sound FX Engine (Web Audio API Synthesizer)
  let audioCtx = null;
  let isSoundOn = false;
  const btnSound = document.getElementById('btn-sound');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');

  function playClickSound() {
    if (!isSoundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) { console.log(e); }
  }

  btnSound.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    if (isSoundOn) {
      soundIcon.className = 'fa-solid fa-volume-high';
      soundLabel.textContent = 'SOUND ON';
      btnSound.style.borderColor = '#FF1A3C';
      btnSound.style.boxShadow = '0 0 15px rgba(255, 26, 60, 0.6)';
      playClickSound();
    } else {
      soundIcon.className = 'fa-solid fa-volume-xmark';
      soundLabel.textContent = 'SOUND OFF';
      btnSound.style.borderColor = 'rgba(255, 30, 30, 0.25)';
      btnSound.style.boxShadow = 'none';
    }
  });

  // Add click sound to all interactive elements
  document.querySelectorAll('a, button, .bio-link-card').forEach(el => {
    el.addEventListener('click', () => playClickSound());
  });

  // Background Canvas Particle Ember System
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 65;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        color: Math.random() > 0.4 ? 'rgba(255, 26, 60, ' : 'rgba(255, 255, 255, ',
        opacity: Math.random() * 0.7 + 0.2,
        speedY: -(Math.random() * 0.8 + 0.2),
        speedX: (Math.random() - 0.5) * 0.4
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF1A3C';
        ctx.fill();
      });

      requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }
});
