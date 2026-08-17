/* ==========================================================================
   GYRO X CHEAT LOADER - FIRE & ICE MAIN CONTROLLER (BGMI EDITION)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. FUTURISTIC WEB AUDIO SYNTHESIZER (SFX ENGINE)
  // ==========================================================================
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type = 'click') {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(130, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'inject') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.warn('Audio SFX error:', e);
    }
  }

  // Sound Toggle Button
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const soundStatusText = document.getElementById('sound-status-text');

  btnSoundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundIcon.className = 'fa-solid fa-volume-high';
      soundStatusText.textContent = 'SFX ON';
      playSound('success');
      showToast('Audio SFX Enabled', 'success');
    } else {
      soundIcon.className = 'fa-solid fa-volume-xmark';
      soundStatusText.textContent = 'SFX OFF';
      showToast('Audio SFX Muted', 'error');
    }
  });

  // ==========================================================================
  // 2. DYNAMIC FIRE & ICE PARTICLES CANVAS
  // ==========================================================================
  const bgCanvas = document.getElementById('fire-ice-canvas');
  const ctx = bgCanvas.getContext('2d');
  let particles = [];
  const particleCount = 50;

  function resizeCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class FireIceParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * bgCanvas.width;
      this.y = Math.random() * bgCanvas.height;
      this.size = Math.random() * 2.5 + 1;
      this.speedX = (Math.random() - 0.5) * 0.9;
      this.speedY = (Math.random() - 0.5) * 0.9;
      this.isFire = Math.random() > 0.5;
      this.color = this.isFire ? 'rgba(255, 51, 0, ' : 'rgba(0, 229, 255, ';
      this.alpha = Math.random() * 0.6 + 0.2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > bgCanvas.width || this.y < 0 || this.y > bgCanvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color + '0.9)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new FireIceParticle());
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          const strokeColor = particles[a].isFire ? 'rgba(255, 51, 0, ' : 'rgba(0, 229, 255, ';
          ctx.strokeStyle = `${strokeColor}${0.18 - dist / 600})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  // ==========================================================================
  // 3. TOAST SYSTEM
  // ==========================================================================
  const toastContainer = document.getElementById('toast-container');

  function showToast(msg, type = 'cyan') {
    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;
    
    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `<i class="${iconClass}"></i> <span>${msg}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ==========================================================================
  // 4. SCREEN SWITCHER
  // ==========================================================================
  const screenLogin = document.getElementById('screen-login');
  const screenDashboard = document.getElementById('screen-dashboard');
  const screenInjecting = document.getElementById('screen-injecting');
  const modalCheatMenu = document.getElementById('modal-cheat-menu');

  function switchScreen(targetScreen) {
    [screenLogin, screenDashboard, screenInjecting].forEach(screen => {
      screen.classList.remove('active');
      screen.classList.add('hidden');
    });

    targetScreen.classList.remove('hidden');
    setTimeout(() => targetScreen.classList.add('active'), 50);
  }

  // ==========================================================================
  // 5. STEP 1: KEY LOGIN
  // ==========================================================================
  const inputLicenseKey = document.getElementById('input-license-key');
  const btnPasteKey = document.getElementById('btn-paste-key');
  const btnToggleMask = document.getElementById('btn-toggle-mask');
  const maskIcon = document.getElementById('mask-icon');
  const keyLoginForm = document.getElementById('key-login-form');

  btnPasteKey.addEventListener('click', async () => {
    playSound('click');
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          inputLicenseKey.value = text.trim();
          showToast('License Key Pasted from Clipboard!', 'success');
          return;
        }
      }
    } catch (e) {
      console.log('Clipboard fallback');
    }
    inputLicenseKey.value = 'GYRO-X98F-2026-PREM';
    showToast('Pasted VIP Demo Key!', 'success');
  });

  btnToggleMask.addEventListener('click', () => {
    playSound('click');
    if (inputLicenseKey.type === 'password') {
      inputLicenseKey.type = 'text';
      maskIcon.className = 'fa-solid fa-eye-slash';
    } else {
      inputLicenseKey.type = 'password';
      maskIcon.className = 'fa-solid fa-eye';
    }
  });

  document.querySelectorAll('.demo-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      playSound('click');
      const key = chip.getAttribute('data-key');
      inputLicenseKey.value = key;
      showToast(`Selected: ${key}`, 'cyan');
    });
  });

  keyLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = inputLicenseKey.value.trim().toUpperCase();

    if (!val) {
      playSound('error');
      showToast('Please enter or paste your license key!', 'error');
      return;
    }

    if (val.includes('EXPIRED')) {
      playSound('error');
      showToast('ERROR: License key has expired! Please renew.', 'error');
      return;
    }

    playSound('success');
    showToast('Connecting to Gyro X Cloud Auth Server...', 'cyan');

    setTimeout(() => {
      showToast('HWID Verified! BGMI Companion Granted.', 'success');
      switchScreen(screenDashboard);
    }, 1200);
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    playSound('click');
    switchScreen(screenLogin);
    showToast('Logged out of Gyro X Loader', 'cyan');
  });

  // ==========================================================================
  // 6. STEP 2: BGMI LAUNCH CONTROLS
  // ==========================================================================
  const modeAuto = document.getElementById('mode-auto');
  const modeManual = document.getElementById('mode-manual');

  modeAuto.addEventListener('click', () => {
    playSound('click');
    modeAuto.classList.add('active');
    modeManual.classList.remove('active');
    showToast('Mode set to Auto Inject', 'cyan');
  });

  modeManual.addEventListener('click', () => {
    playSound('click');
    modeManual.classList.add('active');
    modeAuto.classList.remove('active');
    showToast('Mode set to Manual Configuration', 'cyan');
  });

  const btnCopyLicense = document.getElementById('btn-copy-license');
  const licBtnText = document.getElementById('lic-btn-text');

  btnCopyLicense.addEventListener('click', () => {
    playSound('success');
    const key = inputLicenseKey.value || 'GYRO-X98F-2026-PREM';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(key);
    }
    licBtnText.textContent = 'COPIED TO CLIPBOARD!';
    showToast('License Key copied to clipboard!', 'success');
    setTimeout(() => licBtnText.textContent = 'LICENSE COPIED', 2500);
  });

  document.getElementById('btn-open-menu-direct').addEventListener('click', () => {
    playSound('click');
    modalCheatMenu.classList.remove('hidden');
    showToast('Opened BGMI Cheat Menu Overlay', 'cyan');
  });

  // ==========================================================================
  // 7. STEP 3: BGMI INJECTION ENGINE
  // ==========================================================================
  const btnLaunchGame = document.getElementById('btn-launch-game');
  const injectProgressFill = document.getElementById('inject-progress-fill');
  const injectPercentText = document.getElementById('inject-percent-text');
  const terminalConsole = document.getElementById('terminal-console');
  const injectStatusTitle = document.getElementById('inject-status-title');
  const injectStatusSub = document.getElementById('inject-status-sub');
  const btnCancelInjection = document.getElementById('btn-cancel-injection');

  btnLaunchGame.addEventListener('click', () => {
    playSound('inject');
    switchScreen(screenInjecting);

    injectProgressFill.style.width = '0%';
    injectPercentText.textContent = '0%';
    injectStatusTitle.textContent = 'LAUNCHING GAME...';
    injectStatusSub.textContent = 'INJECTING BGMI ACTIVE PREMIUM LOADER...';
    btnCancelInjection.classList.remove('hidden');
    terminalConsole.innerHTML = '';

    const logs = [
      { text: '[INIT] Starting Gyro X BGMI Kernel Driver v3.5...', delay: 300, class: 'text-cyan' },
      { text: '[KERNEL] Attaching ring-0 hardware spoofer driver...', delay: 800, class: 'text-cyan' },
      { text: '[ANTICHEAT] Bypassing Tencent Protect / EAC... SUCCESS', delay: 1500, class: 'text-green' },
      { text: '[MEMORY] Allocating virtual memory block 0x7FFF98A2...', delay: 2200, class: 'text-orange' },
      { text: '[HOOK] Direct3D 11 Render Hook Attached to BGMI Process!', delay: 2800, class: 'text-cyan' },
      { text: '[PATCH] Injecting Gyro X Core DLL module into target process...', delay: 3500, class: 'text-orange' },
      { text: '[COMPLETE] INJECTION SUCCESSFUL! BGMI Cheat Menu Ready.', delay: 4200, class: 'text-green' }
    ];

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 2;
      if (currentProgress > 100) currentProgress = 100;
      injectProgressFill.style.width = currentProgress + '%';
      injectPercentText.textContent = currentProgress + '%';

      if (currentProgress === 100) {
        clearInterval(progressInterval);
      }
    }, 45);

    logs.forEach(logItem => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = `log-line ${logItem.class}`;
        div.textContent = logItem.text;
        terminalConsole.appendChild(div);
        terminalConsole.scrollTop = terminalConsole.scrollHeight;

        if (logItem.text.includes('COMPLETE')) {
          playSound('success');
          injectStatusTitle.textContent = 'INJECTION COMPLETE!';
          injectStatusSub.textContent = 'OPENING BGMI CHEAT OVERLAY...';
          btnCancelInjection.classList.add('hidden');

          setTimeout(() => {
            switchScreen(screenDashboard);
            modalCheatMenu.classList.remove('hidden');
            showToast('BGMI Cheat Overlay Activated!', 'success');
          }, 1500);
        }
      }, logItem.delay);
    });
  });

  btnCancelInjection.addEventListener('click', () => {
    playSound('error');
    switchScreen(screenDashboard);
    showToast('Injection sequence cancelled', 'error');
  });

  // ==========================================================================
  // 8. STEP 4: OVERLAY MODAL
  // ==========================================================================
  const btnCloseCheatModal = document.getElementById('btn-close-cheat-modal');
  const sidebarTabs = document.querySelectorAll('.sidebar-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  btnCloseCheatModal.addEventListener('click', () => {
    playSound('click');
    modalCheatMenu.classList.add('hidden');
    showToast('Overlay Hidden (Press Insert to toggle)', 'cyan');
  });

  document.getElementById('btn-hide-gui').addEventListener('click', () => {
    playSound('click');
    modalCheatMenu.classList.add('hidden');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Insert') {
      playSound('click');
      modalCheatMenu.classList.toggle('hidden');
    }
  });

  sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('click');
      const targetId = tab.getAttribute('data-tab');

      sidebarTabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => {
        p.classList.remove('active');
        p.classList.add('hidden');
      });

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      targetPane.classList.remove('hidden');
      targetPane.classList.add('active');
    });
  });

  document.getElementById('rng-fov').addEventListener('input', (e) => {
    document.getElementById('val-fov').textContent = e.target.value + ' px';
  });

  document.getElementById('btn-save-cfg').addEventListener('click', () => {
    playSound('success');
    showToast('BGMI Cheat Configuration Saved to Disk', 'success');
  });

  document.getElementById('btn-spoof-now').addEventListener('click', () => {
    playSound('inject');
    showToast('Re-spoofing HWID, MAC, & SMBIOS...', 'cyan');
    setTimeout(() => {
      playSound('success');
      showToast('HWID Serials Virtualized Successfully!', 'success');
    }, 1500);
  });

  // ==========================================================================
  // 9. LIVE ESP CANVAS RADAR PREVIEW
  // ==========================================================================
  const espCanvas = document.getElementById('esp-preview-canvas');
  if (espCanvas) {
    const espCtx = espCanvas.getContext('2d');

    let targets = [
      { x: 100, y: 70, name: 'BGMI_Enemy_1 [142m]', hp: 85, dir: 1 },
      { x: 300, y: 50, name: 'BGMI_VIP_Pro [88m]', hp: 40, dir: -1 },
      { x: 450, y: 90, name: 'Bot_Guard [210m]', hp: 100, dir: 1 }
    ];

    function drawEspPreview() {
      espCtx.clearRect(0, 0, espCanvas.width, espCanvas.height);

      espCtx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      espCtx.lineWidth = 1;
      for (let x = 0; x < espCanvas.width; x += 30) {
        espCtx.beginPath();
        espCtx.moveTo(x, 0);
        espCtx.lineTo(x, espCanvas.height);
        espCtx.stroke();
      }

      const drawBox = document.getElementById('chk-player-box').checked;
      const drawName = document.getElementById('chk-player-name').checked;
      const drawHp = document.getElementById('chk-health-bar').checked;
      const drawCrosshair = document.getElementById('chk-crosshair-dot').checked;

      targets.forEach(t => {
        t.x += t.dir * 0.4;
        if (t.x > espCanvas.width - 50 || t.x < 30) t.dir *= -1;

        const boxW = 32;
        const boxH = 64;

        if (drawBox) {
          espCtx.strokeStyle = '#00e5ff';
          espCtx.lineWidth = 1.5;
          espCtx.shadowColor = '#00e5ff';
          espCtx.shadowBlur = 8;
          espCtx.strokeRect(t.x - boxW / 2, t.y - boxH / 2, boxW, boxH);
          espCtx.shadowBlur = 0;
        }

        if (drawHp) {
          espCtx.fillStyle = t.hp > 50 ? '#00e676' : '#ff5252';
          espCtx.fillRect(t.x - boxW / 2 - 6, t.y - boxH / 2 + (boxH * (100 - t.hp) / 100), 3, boxH * (t.hp / 100));
        }

        if (drawName) {
          espCtx.fillStyle = '#ffffff';
          espCtx.font = '10px Rajdhani';
          espCtx.textAlign = 'center';
          espCtx.fillText(t.name, t.x, t.y - boxH / 2 - 6);
        }
      });

      if (drawCrosshair) {
        espCtx.fillStyle = '#ff3300';
        espCtx.beginPath();
        espCtx.arc(espCanvas.width / 2, espCanvas.height / 2, 3, 0, Math.PI * 2);
        espCtx.fill();
      }

      requestAnimationFrame(drawEspPreview);
    }
    drawEspPreview();
  }

});
