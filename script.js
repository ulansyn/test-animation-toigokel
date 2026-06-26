// Premium smooth drawing and fill-fade animation for toilink logo
// All 25 SVG paths are animated continuously to prevent any sudden jumps or color snaps

const PATH_CONFIGS = [
  // 0: Envelope Base Inside
  { strokeStart: 0, strokeDuration: 1000, fillStart: 700, fillDuration: 800, strokeColor: '#d4d4d8', strokeWidth: 2, glowColor: '#d4d4d8' },
  // 1: Right Flap Edge
  { strokeStart: 250, strokeDuration: 850, fillStart: 800, fillDuration: 800, strokeColor: 'url(#a)', strokeWidth: 3, glowColor: '#e73652' },
  // 2: Bottom Left Shadow (No stroke, fade-in only)
  { strokeStart: 0, strokeDuration: 0, fillStart: 1050, fillDuration: 900, strokeColor: 'transparent', strokeWidth: 0, glowColor: 'transparent' },
  // 3: Bottom Right Shadow (No stroke, fade-in only)
  { strokeStart: 0, strokeDuration: 0, fillStart: 1100, fillDuration: 900, strokeColor: 'transparent', strokeWidth: 0, glowColor: 'transparent' },
  // 4: Bottom Flap Main
  { strokeStart: 500, strokeDuration: 900, fillStart: 1100, fillDuration: 800, strokeColor: 'url(#b)', strokeWidth: 3.5, glowColor: '#e73652' },
  // 5: Left Flap Edge
  { strokeStart: 250, strokeDuration: 850, fillStart: 800, fillDuration: 800, strokeColor: 'url(#a)', strokeWidth: 3, glowColor: '#e73652' },
  // 6: Bottom Shadow Overlay (No stroke, fade-in only)
  { strokeStart: 0, strokeDuration: 0, fillStart: 1100, fillDuration: 900, strokeColor: 'transparent', strokeWidth: 0, glowColor: 'transparent' },
  // 7: Top Flap
  { strokeStart: 150, strokeDuration: 850, fillStart: 650, fillDuration: 800, strokeColor: 'url(#l)', strokeWidth: 3, glowColor: '#f18440' },
  // 8: Bottom Flap Fold Border
  { strokeStart: 350, strokeDuration: 900, fillStart: 950, fillDuration: 800, strokeColor: 'url(#m)', strokeWidth: 2, glowColor: '#ec6746' },
  // 9: Left Ornament Part 1
  { strokeStart: 950, strokeDuration: 750, fillStart: 1300, fillDuration: 600, strokeColor: '#ffffff', strokeWidth: 2.5, glowColor: '#ffffff' },
  // 10: Left Ornament Part 2
  { strokeStart: 950, strokeDuration: 750, fillStart: 1300, fillDuration: 600, strokeColor: '#ffffff', strokeWidth: 2.5, glowColor: '#ffffff' },
  // 11: Right Ornament Part 1
  { strokeStart: 1050, strokeDuration: 750, fillStart: 1400, fillDuration: 600, strokeColor: '#ffffff', strokeWidth: 2.5, glowColor: '#ffffff' },
  // 12: Right Ornament Part 2
  { strokeStart: 1050, strokeDuration: 750, fillStart: 1400, fillDuration: 600, strokeColor: '#ffffff', strokeWidth: 2.5, glowColor: '#ffffff' }
];

// Generate configs for the 12 center logo segments (Paths 13 to 24)
for (let i = 0; i < 12; i++) {
  const strokeStart = 1300 + i * 80;
  const strokeDuration = 550;
  const fillStart = strokeStart + 250;
  const fillDuration = 550;
  const glowColors = ['#f18440', '#e73652', '#ec634d'];
  const glowColor = glowColors[i % glowColors.length];
  
  PATH_CONFIGS.push({
    strokeStart,
    strokeDuration,
    fillStart,
    fillDuration,
    strokeColor: 'url(#p)',
    strokeWidth: 3.5,
    glowColor
  });
}

class LogoAnimator {
  constructor() {
    this.svg = document.querySelector('.animated-svg');
    this.welcomeText = document.getElementById('intro-welcome-text-container');
    
    // Animation State
    this.isPlaying = false;
    this.currentTime = 0;
    this.startTime = 0;
    this.totalDuration = 3200; // Fast, fluid, and premium total duration in ms
    
    this.animationFrame = null;
    this.loopTimeout = null;
    
    this.init();
    
    // Start initial animation automatically after a small viewport intro delay
    setTimeout(() => this.start(), 600);
  }
  
  init() {
    // Select ONLY visible paths (exclude those inside defs/mask)
    this.paths = Array.from(this.svg.querySelectorAll('path:not(defs path)'));
    
    // Cache original attributes and initial layout
    this.paths.forEach((path) => {
      const length = path.getTotalLength();
      path.setAttribute('data-length', length);
      
      // Resolve original fill (handle parent elements like <g fill="#fff">)
      let originalFill = path.getAttribute('fill');
      if (!originalFill && path.parentElement) {
        originalFill = path.parentElement.getAttribute('fill');
      }
      if (!originalFill) {
        originalFill = '#ffffff'; // Fallback
      }
      
      // Keep original white colors so they stand out on the red-orange envelope flaps
      
      path.setAttribute('data-original-fill', originalFill);
      
      const originalOpacity = path.getAttribute('opacity') || '1';
      path.setAttribute('data-original-opacity', originalOpacity);
      
      // Setup initial styles (everything hidden)
      path.style.fill = originalFill;
      path.style.fillOpacity = '0';
      path.style.strokeOpacity = '0';
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.stroke = 'transparent';
      path.style.filter = 'none';
    });

  }
  
  start() {
    if (this.loopTimeout) clearTimeout(this.loopTimeout);
    
    this.isPlaying = true;
    this.currentTime = 0;
    this.startTime = performance.now();
    
    const flare = document.querySelector('.logo-flare');
    if (flare) {
      flare.classList.remove('active');
      flare.style.opacity = '';
    }
    
    this.svg.classList.remove('floating');
    this.svg.style.opacity = '1';
    
    // Reset welcome brand text instantly
    if (this.welcomeText) {
      this.welcomeText.classList.remove('active');
      this.welcomeText.style.transition = 'none';
      this.welcomeText.style.opacity = '0';
      this.welcomeText.style.transform = 'translateX(-50%) translateY(15px)';
      this.welcomeText.style.filter = 'blur(5px)';
    }
    
    // Set dynamic body class for active drawing
    document.body.className = 'drawing-active';
    
    // Reset all path styles instantly
    this.paths.forEach(path => {
      const length = path.getAttribute('data-length');
      path.style.strokeDashoffset = length;
      path.style.fillOpacity = '0';
      path.style.strokeOpacity = '0';
      path.style.stroke = 'transparent';
      path.style.filter = 'none';
    });
    
    // Start Loop
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame((ts) => this.loop(ts));
  }
  
  loop(timestamp) {
    if (!this.isPlaying) return;
    
    this.currentTime = timestamp - this.startTime;
    
    if (this.currentTime >= this.totalDuration) {
      this.complete();
      return;
    }
    
    this.tickPaths(this.currentTime);
    this.animationFrame = requestAnimationFrame((ts) => this.loop(ts));
  }
  
  tickPaths(elapsed) {
    this.paths.forEach((path, idx) => {
      const config = PATH_CONFIGS[idx];
      if (!config) return;
      
      const length = parseFloat(path.getAttribute('data-length'));
      
      // Boundary cases to prevent style bleed
      if (elapsed < config.strokeStart && (config.strokeDuration > 0 || elapsed < config.fillStart)) {
        path.style.stroke = 'transparent';
        path.style.strokeOpacity = '0';
        path.style.fillOpacity = '0';
        path.style.filter = 'none';
        return;
      }
      
      // 1. Calculate Stroke Progress (0 to 1)
      let strokeProgress = 0;
      if (config.strokeDuration > 0) {
        if (elapsed >= config.strokeStart) {
          const t = elapsed - config.strokeStart;
          strokeProgress = Math.min(t / config.strokeDuration, 1);
        }
      } else {
        strokeProgress = 1; // Fills (like shadows) have no stroke phase
      }
      
      // 2. Calculate Fill Progress (0 to 1)
      let fillProgress = 0;
      if (elapsed >= config.fillStart) {
        const t = elapsed - config.fillStart;
        fillProgress = Math.min(t / config.fillDuration, 1);
      }
      
      const easedStroke = this.easeInOutCubic(strokeProgress);
      const easedFill = this.easeInOutCubic(fillProgress);
      
      // Apply Stroke Styles
      if (config.strokeDuration > 0 && fillProgress < 1) {
        path.style.stroke = config.strokeColor;
        path.style.strokeWidth = `${config.strokeWidth}px`;
        path.style.strokeDashoffset = length * (1 - easedStroke);
        path.style.strokeOpacity = (1 - easedFill).toFixed(3);
      } else {
        path.style.stroke = 'transparent';
        path.style.strokeOpacity = '0';
      }
      
      // Apply Fill Styles
      const originalOpacity = parseFloat(path.getAttribute('data-original-opacity'));
      path.style.fillOpacity = (easedFill * originalOpacity).toFixed(3);
      
      // Apply Outline Glow Drop-shadow
      if (config.strokeDuration > 0 && strokeProgress > 0 && fillProgress < 1) {
        const strokeGlowIntensity = (1 - easedFill) * 5; // soft glowing outline
        const glowG = config.glowColor.startsWith('url') ? 'var(--accent-color)' : config.glowColor;
        
        if (config.glowColor === '#27272a') {
          // Charcoal ornaments get a tiny elegant dark drop shadow during drawing
          path.style.filter = `drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))`;
        } else {
          path.style.filter = `drop-shadow(0 0 ${strokeGlowIntensity}px ${glowG}) drop-shadow(0 0 1px rgba(255, 255, 255, 0.4))`;
        }
      } else {
        path.style.filter = 'none';
      }
    });

    // Animate welcome text in sync with timeline (starts at 1300ms in parallel with logo)
    if (this.welcomeText) {
      const textStart = 1300;
      const textDuration = 1000;
      
      let textProgress = 0;
      if (elapsed >= textStart) {
        textProgress = Math.min((elapsed - textStart) / textDuration, 1);
      }
      
      const easedText = this.easeInOutCubic(textProgress);
      
      this.welcomeText.style.opacity = (easedText * 0.95).toFixed(3);
      this.welcomeText.style.transform = `translateX(-50%) translateY(${(15 * (1 - easedText)).toFixed(2)}px)`;
      this.welcomeText.style.filter = `blur(${(5 * (1 - easedText)).toFixed(2)}px)`;
    }
  }
  
  complete() {
    this.isPlaying = false;
    this.currentTime = this.totalDuration;
    
    this.paths.forEach((path) => {
      const originalOpacity = path.getAttribute('data-original-opacity');
      path.style.strokeDashoffset = '0';
      path.style.fillOpacity = originalOpacity;
      path.style.strokeOpacity = '0';
      path.style.stroke = 'transparent';
      path.style.filter = 'none';
    });
    
    // Complete effects: shockwave ripple
    const ripple = document.querySelector('.shockwave-ripple');
    if (ripple) {
      ripple.classList.remove('animate');
      void ripple.offsetWidth; // force reflow
      ripple.classList.add('animate');
    }
    
    // Complete effects: light flare
    const flare = document.querySelector('.logo-flare');
    if (flare) flare.classList.add('active');
    
    // Set logo floating and breathing
    this.svg.classList.add('floating');
    
    // Finalize brand welcome text states
    if (this.welcomeText) {
      this.welcomeText.classList.add('active');
      this.welcomeText.style.transition = 'none';
      this.welcomeText.style.opacity = '0.95';
      this.welcomeText.style.transform = 'translateX(-50%) translateY(0)';
      this.welcomeText.style.filter = 'blur(0)';
    }

    
    // Flash background ambient light on completion (Outside the phone)
    document.body.className = 'completion-pulse';
    setTimeout(() => {
      if (document.body.className === 'completion-pulse') {
        document.body.className = 'idle-active';
      }
    }, 1200);
    
    // Auto-loop after a comfortable pause
    this.loopTimeout = setTimeout(() => {
      // Smoothly fade out everything
      this.svg.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
      this.svg.style.opacity = '0';
      if (flare) {
        flare.style.opacity = '0';
      }
      
      // Fade out welcome text on loop restart
      if (this.welcomeText) {
        this.welcomeText.style.transition = 'opacity 1.0s cubic-bezier(0.16, 1, 0.3, 1), filter 1.0s cubic-bezier(0.16, 1, 0.3, 1), transform 1.0s cubic-bezier(0.16, 1, 0.3, 1)';
        this.welcomeText.style.opacity = '0';
        this.welcomeText.style.filter = 'blur(5px)';
        this.welcomeText.style.transform = 'translateX(-50%) translateY(15px)';
      }
      
      this.loopTimeout = setTimeout(() => {
        this.svg.style.transition = '';
        if (this.welcomeText) {
          this.welcomeText.style.transition = '';
        }
        this.start();
      }, 1200);
    }, 4500); // Display for 4.5 seconds before resetting
  }
  
  // Ultra-smooth cubic easing curve
  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
}

// Instantiate the animator once window finishes loading
window.addEventListener('DOMContentLoaded', () => {
  window.animator = new LogoAnimator();
});
