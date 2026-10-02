(() => {
  "use strict";

  const DEFAULTS = {
    spriteSrc: "/nezuko-sprite-v1.png",
    size: 84,
    mobileSize: 64,
    speed: 68,
    gravity: 1180,
    jumpPower: 520,
    platformSelector:
      "[data-mascot-platform], main article, main .mock-image, main a:has(> img), main a:has(> .mock-image)",
    phrases: ["음—!", "폴짝!", "여기도 가볼까?", "후웅…"],
  };

  let activeMascot = null;

  function mountMascot(options = {}) {
    if (activeMascot) return activeMascot;

    const config = {
      ...DEFAULTS,
      ...(window.DECHIVE_MASCOT || {}),
      ...options,
    };
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isSmallScreen = window.matchMedia("(max-width: 639px)").matches;
    const size = isSmallScreen ? config.mobileSize : config.size;

    const style = document.createElement("style");
    style.dataset.dechiveMascot = "styles";
    style.textContent = `
      .dechive-mascot {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 45;
        width: var(--mascot-size);
        height: var(--mascot-size);
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        transform: translate3d(var(--mascot-x), var(--mascot-y), 0);
        transform-origin: 50% 100%;
        filter: drop-shadow(0 4px 5px rgb(9 41 68 / 18%));
        will-change: transform;
        -webkit-tap-highlight-color: transparent;
      }

      .dechive-mascot:focus-visible {
        outline: 2px solid #c4532f;
        outline-offset: 4px;
        border-radius: 50%;
      }

      .dechive-mascot__figure {
        display: block;
        width: 100%;
        height: 100%;
        background-image: var(--mascot-sprite);
        background-repeat: no-repeat;
        background-position: 0 0;
        background-size: 400% 400%;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        opacity: 0;
        user-select: none;
        pointer-events: none;
        transform: scaleX(var(--mascot-direction));
        transform-origin: 50% 100%;
        transition: opacity 120ms ease, transform 80ms linear;
      }

      .dechive-mascot__figure[data-ready="true"] {
        opacity: 1;
      }

      .dechive-mascot[data-state="run"] .dechive-mascot__figure {
        background-position-y: 0%;
        animation: dechive-mascot-frames-4 430ms linear infinite;
      }

      .dechive-mascot[data-state="jump"] .dechive-mascot__figure {
        background-position-y: 66.667%;
        animation: dechive-mascot-frames-4 540ms linear infinite;
      }

      .dechive-mascot[data-state="rest"] .dechive-mascot__figure {
        background-position-y: 33.333%;
        animation: dechive-mascot-frames-2 1.1s linear infinite;
      }

      .dechive-mascot[data-state="land"] .dechive-mascot__figure {
        background-position-y: 100%;
        animation: dechive-mascot-frames-4 420ms linear 1 both;
      }

      .dechive-mascot__bubble {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 6px);
        width: max-content;
        max-width: 124px;
        padding: 7px 9px;
        border: 1px solid rgb(9 41 68 / 20%);
        border-radius: 10px 10px 10px 2px;
        background: rgb(255 250 242 / 94%);
        color: #092944;
        box-shadow: 0 5px 18px rgb(9 41 68 / 12%);
        font: 600 11px/1.35 system-ui, -apple-system, sans-serif;
        letter-spacing: -0.02em;
        opacity: 0;
        transform: translate(-50%, 6px) scale(.96);
        transition: opacity 180ms ease, transform 180ms ease;
        pointer-events: none;
      }

      .dechive-mascot__bubble[data-visible="true"] {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
      }

      .dechive-mascot__dust {
        position: absolute;
        left: 50%;
        bottom: 3px;
        width: 7px;
        height: 3px;
        border-radius: 50%;
        background: rgb(196 83 47 / 34%);
        opacity: 0;
        pointer-events: none;
      }

      .dechive-mascot[data-landed="true"] .dechive-mascot__dust {
        animation: dechive-mascot-dust 360ms ease-out;
      }

      @keyframes dechive-mascot-frames-4 {
        0%, 24.99% { background-position-x: 0%; }
        25%, 49.99% { background-position-x: 33.333%; }
        50%, 74.99% { background-position-x: 66.667%; }
        75%, 100% { background-position-x: 100%; }
      }

      @keyframes dechive-mascot-frames-2 {
        0%, 49.99% { background-position-x: 0%; }
        50%, 100% { background-position-x: 33.333%; }
      }

      @keyframes dechive-mascot-dust {
        0% { opacity: .9; transform: translateX(-50%) scale(.6); }
        100% { opacity: 0; transform: translateX(-50%) scale(5, 2); }
      }

      @media (max-width: 639px) {
        .dechive-mascot { z-index: 40; opacity: .94; }
        .dechive-mascot__bubble { display: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        .dechive-mascot {
          left: auto;
          right: 14px;
          top: auto;
          bottom: 10px;
          transform: none;
          cursor: default;
        }
        .dechive-mascot__figure {
          animation: none !important;
          background-position: 0 33.333%;
        }
      }
    `;

    const mascot = document.createElement("button");
    mascot.className = "dechive-mascot";
    mascot.type = "button";
    mascot.setAttribute("aria-label", "네즈코 점프시키기");
    mascot.dataset.state = reduceMotion ? "rest" : "run";
    mascot.style.setProperty("--mascot-size", `${size}px`);
    mascot.style.setProperty("--mascot-direction", "1");

    const bubble = document.createElement("span");
    bubble.className = "dechive-mascot__bubble";
    bubble.setAttribute("aria-hidden", "true");

    const figure = document.createElement("span");
    figure.className = "dechive-mascot__figure";
    figure.setAttribute("aria-hidden", "true");

    const dust = document.createElement("span");
    dust.className = "dechive-mascot__dust";
    dust.setAttribute("aria-hidden", "true");

    mascot.append(bubble, figure, dust);
    document.head.append(style);
    document.body.append(mascot);

    let x = Math.min(window.innerWidth - size - 24, window.innerWidth * 0.72);
    let y = window.innerHeight - size - 12;
    let vx = config.speed;
    let vy = 0;
    let grounded = true;
    let resting = false;
    let lastTime = performance.now();
    let nextDecision = lastTime + randomBetween(1000, 2300);
    let nextSpeech = lastTime + randomBetween(9000, 16000);
    let restUntil = 0;
    let platformRefresh = 0;
    let platforms = [];
    let animationFrame = 0;
    let bubbleTimer = 0;
    let landingUntil = 0;
    let spriteObjectUrl = "";

    function randomBetween(min, max) {
      return min + Math.random() * (max - min);
    }

    async function prepareSprite() {
      const image = new Image();
      image.decoding = "async";
      image.src = config.spriteSrc;
      await image.decode();

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Unable to prepare mascot sprite");

      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const visited = new Uint8Array(canvas.width * canvas.height);
      const queue = new Int32Array(canvas.width * canvas.height);
      let queueStart = 0;
      let queueEnd = 0;

      function isBackdrop(pixelIndex) {
        const offset = pixelIndex * 4;
        const red = pixels.data[offset];
        const green = pixels.data[offset + 1];
        const blue = pixels.data[offset + 2];
        const brightest = Math.max(red, green, blue);
        const darkest = Math.min(red, green, blue);
        return brightest - darkest <= 13 && brightest >= 145;
      }

      function enqueue(pixelIndex) {
        if (visited[pixelIndex] || !isBackdrop(pixelIndex)) return;
        visited[pixelIndex] = 1;
        queue[queueEnd++] = pixelIndex;
      }

      for (let xIndex = 0; xIndex < canvas.width; xIndex += 1) {
        enqueue(xIndex);
        enqueue((canvas.height - 1) * canvas.width + xIndex);
      }
      for (let yIndex = 0; yIndex < canvas.height; yIndex += 1) {
        enqueue(yIndex * canvas.width);
        enqueue(yIndex * canvas.width + canvas.width - 1);
      }

      while (queueStart < queueEnd) {
        const pixelIndex = queue[queueStart++];
        const xIndex = pixelIndex % canvas.width;
        const yIndex = Math.floor(pixelIndex / canvas.width);
        pixels.data[pixelIndex * 4 + 3] = 0;
        if (xIndex > 0) enqueue(pixelIndex - 1);
        if (xIndex + 1 < canvas.width) enqueue(pixelIndex + 1);
        if (yIndex > 0) enqueue(pixelIndex - canvas.width);
        if (yIndex + 1 < canvas.height) enqueue(pixelIndex + canvas.width);
      }

      context.putImageData(pixels, 0, 0);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Unable to encode mascot sprite");

      spriteObjectUrl = URL.createObjectURL(blob);
      figure.style.setProperty("--mascot-sprite", `url("${spriteObjectUrl}")`);
      figure.dataset.ready = "true";
    }

    void prepareSprite().catch(() => {
      figure.style.setProperty("--mascot-sprite", `url("${config.spriteSrc}")`);
      figure.dataset.ready = "true";
    });

    function refreshPlatforms(now) {
      if (now < platformRefresh) return;
      platformRefresh = now + 260;

      let candidates = [];
      try {
        candidates = [...document.querySelectorAll(config.platformSelector)];
      } catch {
        candidates = [
          ...document.querySelectorAll("main article, main .mock-image"),
        ];
      }

      platforms = candidates
        .map((element) => element.getBoundingClientRect())
        .filter(
          (rect) =>
            rect.width >= size * 1.35 &&
            rect.height >= 24 &&
            rect.top > 80 &&
            rect.top < window.innerHeight - 18 &&
            rect.right > 0 &&
            rect.left < window.innerWidth,
        )
        .map((rect) => ({ left: rect.left, right: rect.right, top: rect.top }))
        .sort((a, b) => a.top - b.top);
    }

    function showBubble(text, duration = 1900) {
      if (!text || isSmallScreen) return;
      window.clearTimeout(bubbleTimer);
      bubble.textContent = text;
      bubble.dataset.visible = "true";
      bubbleTimer = window.setTimeout(() => {
        bubble.dataset.visible = "false";
      }, duration);
    }

    function jump(power = config.jumpPower) {
      if (reduceMotion) return;
      vy = -power;
      grounded = false;
      resting = false;
      restUntil = 0;
      landingUntil = 0;
      mascot.dataset.state = "jump";
    }

    function getSafeTop() {
      const headerBottom =
        document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const bubbleClearance =
        bubble.dataset.visible === "true" ? bubble.offsetHeight + 10 : 0;
      return Math.max(8, headerBottom + 8 + bubbleClearance);
    }

    function land(onY) {
      const wasAirborne = !grounded;
      y = onY - size;
      vy = 0;
      grounded = true;
      if (wasAirborne) {
        landingUntil = performance.now() + 420;
        mascot.dataset.state = "land";
        mascot.dataset.landed = "false";
        requestAnimationFrame(() => {
          mascot.dataset.landed = "true";
          window.setTimeout(() => {
            mascot.dataset.landed = "false";
          }, 380);
        });
      } else if (performance.now() >= landingUntil) {
        mascot.dataset.state = resting ? "rest" : "run";
      }
    }

    function makeDecision(now) {
      if (now < restUntil) return;

      if (resting) {
        resting = false;
        vx = config.speed * (Math.random() > 0.5 ? 1 : -1);
        mascot.dataset.state = grounded ? "run" : "jump";
      } else {
        const choice = Math.random();
        if (choice < 0.52 && grounded) {
          jump(randomBetween(config.jumpPower * 0.82, config.jumpPower * 1.08));
        } else if (choice < 0.74 && grounded) {
          resting = true;
          vx = 0;
          restUntil = now + randomBetween(1400, 3000);
          mascot.dataset.state = "rest";
        } else {
          vx = config.speed * (Math.random() > 0.5 ? 1 : -1);
        }
      }
      nextDecision = now + randomBetween(1000, 2700);
    }

    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.034);
      lastTime = now;
      refreshPlatforms(now);

      if (now >= nextDecision) makeDecision(now);
      if (now >= nextSpeech) {
        showBubble(
          config.phrases[Math.floor(Math.random() * config.phrases.length)],
        );
        nextSpeech = now + randomBetween(12000, 22000);
      }

      const previousBottom = y + size;
      x += vx * dt;
      vy += config.gravity * dt;
      let nextY = y + vy * dt;

      const safeTop = getSafeTop();
      if (nextY < safeTop) {
        nextY = safeTop;
        if (vy < 0) vy = 0;
      }

      const leftLimit = 8;
      const rightLimit = window.innerWidth - size - 8;
      if (x <= leftLimit) {
        x = leftLimit;
        vx = Math.abs(config.speed);
      } else if (x >= rightLimit) {
        x = rightLimit;
        vx = -Math.abs(config.speed);
      }

      let landingY = null;
      if (vy >= 0) {
        const footX = x + size * 0.5;
        const nextBottom = nextY + size;
        for (const platform of platforms) {
          if (
            footX > platform.left + 5 &&
            footX < platform.right - 5 &&
            previousBottom <= platform.top + 7 &&
            nextBottom >= platform.top
          ) {
            landingY = platform.top;
            break;
          }
        }
      }

      const floorY = window.innerHeight - 10;
      if (landingY !== null) {
        land(landingY);
      } else if (nextY + size >= floorY) {
        land(floorY);
      } else {
        y = nextY;
        grounded = false;
        mascot.dataset.state = "jump";
      }

      const direction = vx < 0 ? -1 : 1;
      mascot.style.setProperty("--mascot-direction", String(direction));
      mascot.style.setProperty("--mascot-x", `${x.toFixed(2)}px`);
      mascot.style.setProperty("--mascot-y", `${y.toFixed(2)}px`);
      animationFrame = requestAnimationFrame(tick);
    }

    function onResize() {
      x = Math.min(x, window.innerWidth - size - 8);
      y = Math.min(y, window.innerHeight - size - 10);
      platformRefresh = 0;
    }

    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
      } else if (!reduceMotion) {
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(tick);
      }
    }

    function onScroll() {
      platformRefresh = 0;
    }

    mascot.addEventListener("click", () => {
      jump(config.jumpPower * 1.08);
      showBubble("음!", 1200);
    });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    mascot.style.setProperty("--mascot-x", `${x}px`);
    mascot.style.setProperty("--mascot-y", `${y}px`);
    if (!reduceMotion) animationFrame = requestAnimationFrame(tick);

    activeMascot = {
      element: mascot,
      jump,
      say: showBubble,
      destroy() {
        cancelAnimationFrame(animationFrame);
        window.clearTimeout(bubbleTimer);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (spriteObjectUrl) URL.revokeObjectURL(spriteObjectUrl);
        mascot.remove();
        style.remove();
        activeMascot = null;
      },
    };

    return activeMascot;
  }

  window.DechiveMascot = {
    mount: mountMascot,
    jump: () => activeMascot?.jump(),
    say: (text, duration) => activeMascot?.say(text, duration),
    destroy: () => activeMascot?.destroy(),
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountMascot(), {
      once: true,
    });
  } else {
    mountMascot();
  }
})();
