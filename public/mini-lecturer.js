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
      "[data-mascot-platform], main section, main article, main figure, main nav, main hr, main .mock-image, main a:has(> img), main a:has(> .mock-image)",
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
        animation: dechive-mascot-jump-frames 510ms linear infinite;
      }

      .dechive-mascot[data-state="rest"] .dechive-mascot__figure {
        background-position-y: 33.333%;
        animation: dechive-mascot-frames-2 1.1s linear infinite;
      }

      .dechive-mascot[data-state="land"] .dechive-mascot__figure {
        background-position-y: 100%;
        animation: dechive-mascot-frames-4 420ms linear 1 both;
      }

      .dechive-mascot[data-state="crouch"] .dechive-mascot__figure {
        background-position: 0% 66.667%;
        animation: none;
      }

      .dechive-mascot[data-state="crawl"] .dechive-mascot__figure {
        background-position-y: 66.667%;
        animation: dechive-mascot-crawl-frames 460ms linear infinite;
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

      .dechive-mascot[data-state="land"][data-landed="true"] .dechive-mascot__dust {
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

      @keyframes dechive-mascot-jump-frames {
        0%, 49.99% { background-position-x: 0%; }
        50%, 100% { background-position-x: 100%; }
      }

      @keyframes dechive-mascot-crawl-frames {
        0%, 49.99% { background-position-x: 0%; }
        50%, 100% { background-position-x: 100%; }
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
    mascot.dataset.behavior = reduceMotion ? "rest" : "roam";
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
    let obstacles = [];
    let animationFrame = 0;
    let bubbleTimer = 0;
    let landingUntil = 0;
    let spriteObjectUrl = "";
    let targetPlatform = null;
    let currentSurfaceY = null;
    let surfaceSince = lastTime;
    let dropThroughY = null;
    let dropThroughUntil = 0;
    let crouchUntil = 0;
    let crawlUntil = 0;
    let resumeDirection = 1;
    let facingDirection = 1;
    let edgeReactionCooldown = 0;
    let edgeReactionCount = 0;
    let obstacleReactionCooldown = 0;
    let lastTurnTime = 0;
    let turnStreak = 0;

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

      const cellWidth = Math.floor(canvas.width / 4);
      const cellHeight = Math.floor(canvas.height / 4);
      const minimumIslandSize = Math.max(
        80,
        Math.floor(cellWidth * cellHeight * 0.004),
      );
      const componentVisited = new Uint8Array(canvas.width * canvas.height);
      const componentQueue = new Int32Array(cellWidth * cellHeight);

      for (let row = 0; row < 4; row += 1) {
        for (let column = 0; column < 4; column += 1) {
          const startX = column * cellWidth;
          const startY = row * cellHeight;
          const endX = column === 3 ? canvas.width : (column + 1) * cellWidth;
          const endY = row === 3 ? canvas.height : (row + 1) * cellHeight;

          for (let cellY = startY; cellY < endY; cellY += 1) {
            for (let cellX = startX; cellX < endX; cellX += 1) {
              const startIndex = cellY * canvas.width + cellX;
              if (
                componentVisited[startIndex] ||
                pixels.data[startIndex * 4 + 3] === 0
              ) {
                continue;
              }

              let componentStart = 0;
              let componentEnd = 0;
              componentVisited[startIndex] = 1;
              componentQueue[componentEnd++] = startIndex;

              while (componentStart < componentEnd) {
                const componentIndex = componentQueue[componentStart++];
                const componentX = componentIndex % canvas.width;
                const componentY = Math.floor(componentIndex / canvas.width);

                for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
                  for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                    if (offsetX === 0 && offsetY === 0) continue;
                    const neighborX = componentX + offsetX;
                    const neighborY = componentY + offsetY;
                    if (
                      neighborX < startX ||
                      neighborX >= endX ||
                      neighborY < startY ||
                      neighborY >= endY
                    ) {
                      continue;
                    }

                    const neighborIndex = neighborY * canvas.width + neighborX;
                    if (
                      componentVisited[neighborIndex] ||
                      pixels.data[neighborIndex * 4 + 3] === 0
                    ) {
                      continue;
                    }
                    componentVisited[neighborIndex] = 1;
                    componentQueue[componentEnd++] = neighborIndex;
                  }
                }
              }

              if (componentEnd < minimumIslandSize) {
                for (let index = 0; index < componentEnd; index += 1) {
                  pixels.data[componentQueue[index] * 4 + 3] = 0;
                }
              }
            }
          }
        }
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
      platformRefresh = now + 420;

      let candidates = [];
      try {
        candidates = [
          ...new Set([
            ...document.querySelectorAll(config.platformSelector),
            ...document.querySelectorAll(
              "main div, main ol, main ul, main aside",
            ),
          ]),
        ];
      } catch {
        candidates = [
          ...document.querySelectorAll(
            "main section, main article, main figure, main nav, main aside, main .mock-image",
          ),
        ];
      }

      const headerBottom =
        document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const nextPlatforms = [];
      const nextObstacles = [];

      function addPlatform(rect, top, kind) {
        if (
          rect.width < size * 1.15 ||
          top <= headerBottom + 3 ||
          top >= window.innerHeight - 8 ||
          rect.right <= 0 ||
          rect.left >= window.innerWidth
        ) {
          return;
        }

        const left = Math.max(0, rect.left);
        const right = Math.min(window.innerWidth, rect.right);
        const duplicate = nextPlatforms.some(
          (platform) =>
            Math.abs(platform.top - top) < 2 &&
            Math.min(platform.right, right) - Math.max(platform.left, left) >
              Math.min(platform.right - platform.left, right - left) * 0.8,
        );
        if (!duplicate) nextPlatforms.push({ left, right, top, kind });
      }

      function addObstacle(rect) {
        if (
          rect.width < size * 0.72 ||
          rect.height < size * 0.38 ||
          rect.bottom <= headerBottom + 3 ||
          rect.top >= window.innerHeight - 8 ||
          rect.right <= 0 ||
          rect.left >= window.innerWidth ||
          (rect.width > window.innerWidth * 0.97 &&
            rect.height > window.innerHeight * 0.72)
        ) {
          return;
        }

        const obstacle = {
          left: Math.max(0, rect.left),
          right: Math.min(window.innerWidth, rect.right),
          top: Math.max(headerBottom + 3, rect.top),
          bottom: Math.min(window.innerHeight, rect.bottom),
        };
        const duplicate = nextObstacles.some(
          (candidate) =>
            Math.abs(candidate.left - obstacle.left) < 2 &&
            Math.abs(candidate.right - obstacle.right) < 2 &&
            Math.abs(candidate.top - obstacle.top) < 2 &&
            Math.abs(candidate.bottom - obstacle.bottom) < 2,
        );
        if (!duplicate) nextObstacles.push(obstacle);
      }

      for (const element of candidates) {
        const rect = element.getBoundingClientRect();
        if (
          rect.width < size * 1.15 ||
          rect.height < 1 ||
          rect.bottom <= headerBottom + 3 ||
          rect.top >= window.innerHeight - 8 ||
          rect.right <= 0 ||
          rect.left >= window.innerWidth
        ) {
          continue;
        }

        const computed = window.getComputedStyle(element);
        const hasTopBorder =
          computed.borderTopStyle !== "none" &&
          Number.parseFloat(computed.borderTopWidth) >= 0.5;
        const hasBottomBorder =
          computed.borderBottomStyle !== "none" &&
          Number.parseFloat(computed.borderBottomWidth) >= 0.5;
        const hasLeftBorder =
          computed.borderLeftStyle !== "none" &&
          Number.parseFloat(computed.borderLeftWidth) >= 0.5;
        const hasRightBorder =
          computed.borderRightStyle !== "none" &&
          Number.parseFloat(computed.borderRightWidth) >= 0.5;
        const isSurface = element.matches(
          "[data-mascot-platform], article, figure, hr, .mock-image, a:has(> img), a:has(> .mock-image)",
        );
        const isObstacle = element.matches(
          "[data-mascot-obstacle], article, figure, .mock-image, a:has(> img), a:has(> .mock-image)",
        );

        if (hasTopBorder || isSurface) addPlatform(rect, rect.top, "top");
        if (hasBottomBorder && !hasTopBorder) {
          addPlatform(rect, rect.bottom, "divider");
        }
        if (hasLeftBorder || hasRightBorder || isObstacle) {
          addObstacle(rect);
        }
      }

      platforms = nextPlatforms.sort((a, b) => a.top - b.top);
      obstacles = nextObstacles;
      mascot.dataset.platformCount = String(platforms.length);
      mascot.dataset.obstacleCount = String(obstacles.length);
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

    function jump(power = config.jumpPower, target = null) {
      if (reduceMotion) return;
      vy = -power;
      grounded = false;
      resting = false;
      restUntil = 0;
      landingUntil = 0;
      targetPlatform = target;
      crouchUntil = 0;
      crawlUntil = 0;
      mascot.dataset.state = "jump";
      mascot.dataset.behavior = target ? "climb" : "jump";
      mascot.dataset.landed = "false";
    }

    function findClimbTarget() {
      const footY = y + size;
      const centerX = x + size * 0.5;
      const reachable = platforms
        .map((platform) => {
          const rise = footY - platform.top;
          const targetX = Math.min(
            Math.max(centerX, platform.left + size * 0.45),
            platform.right - size * 0.45,
          );
          return {
            ...platform,
            rise,
            targetX,
            horizontalDistance: Math.abs(targetX - centerX),
          };
        })
        .filter(
          (platform) =>
            platform.rise > 24 &&
            platform.rise < 480 &&
            platform.horizontalDistance < 290,
        )
        .sort(
          (a, b) =>
            a.horizontalDistance +
            a.rise * 0.32 -
            (b.horizontalDistance + b.rise * 0.32),
        );

      if (!reachable.length) return null;
      return reachable[
        Math.floor(Math.random() * Math.min(3, reachable.length))
      ];
    }

    function jumpToPlatform(platform) {
      const centerX = x + size * 0.5;
      const direction = platform.targetX < centerX ? -1 : 1;
      vx = direction * config.speed * 1.45;
      const requiredPower = Math.sqrt(
        2 * config.gravity * (platform.rise + size * 0.34),
      );
      jump(
        Math.min(
          config.jumpPower * 2.3,
          Math.max(config.jumpPower * 0.9, requiredPower),
        ),
        platform,
      );
    }

    function findCurrentPlatform() {
      const footY = y + size;
      const centerX = x + size * 0.5;
      return platforms.find(
        (platform) =>
          Math.abs(platform.top - footY) < 9 &&
          centerX > platform.left &&
          centerX < platform.right,
      );
    }

    function runTowardEdge(now) {
      const platform = findCurrentPlatform();
      if (!platform || platform.right - platform.left < size * 1.5) {
        return false;
      }

      const centerX = x + size * 0.5;
      const distanceToLeft = centerX - platform.left;
      const distanceToRight = platform.right - centerX;
      const distanceToEdge = Math.min(distanceToLeft, distanceToRight);
      const direction = distanceToLeft < distanceToRight ? -1 : 1;

      resting = false;
      vx = direction * config.speed * 1.45;
      mascot.dataset.state = "run";
      nextDecision =
        now +
        Math.min(
          4200,
          Math.max(
            1200,
            ((distanceToEdge + size * 0.55) / Math.abs(vx)) * 1000 + 280,
          ),
        );
      return true;
    }

    function dropThroughPlatform(now) {
      const platform = findCurrentPlatform();
      if (!platform) return false;

      dropThroughY = platform.top;
      dropThroughUntil = now + 1400;
      vx = config.speed * 0.72 * (Math.random() > 0.5 ? 1 : -1);
      jump(config.jumpPower * 0.42);
      nextDecision = now + 1700;
      surfaceSince = now;
      return true;
    }

    function findObstacleAhead(fromX, toX, isCrawling) {
      if (Math.abs(vx) < 1 || performance.now() < obstacleReactionCooldown) {
        return null;
      }

      const direction = vx < 0 ? -1 : 1;
      const footY = y + size;
      const bodyTop = footY - size * (isCrawling ? 0.43 : 0.8);
      const bodyBottom = footY - 4;
      const fromFront = fromX + size * (direction > 0 ? 0.72 : 0.28);
      const toFront = toX + size * (direction > 0 ? 0.72 : 0.28);

      return (
        obstacles.find((obstacle) => {
          if (
            Math.abs(footY - obstacle.top) < 10 ||
            obstacle.bottom <= bodyTop + 2 ||
            obstacle.top >= bodyBottom
          ) {
            return false;
          }

          const wallX = direction > 0 ? obstacle.left : obstacle.right;
          return direction > 0
            ? fromFront <= wallX + 3 && toFront >= wallX - 3
            : fromFront >= wallX - 3 && toFront <= wallX + 3;
        }) ?? null
      );
    }

    function beginCrawl(now, obstacle) {
      const direction = vx < 0 ? -1 : 1;
      const bodyFront = x + size * (direction > 0 ? 0.72 : 0.28);
      const exitX =
        direction > 0
          ? obstacle.right + size * 0.3
          : obstacle.left - size * 0.3;
      const crawlSpeed = config.speed * 0.58;
      const travelTime = (Math.abs(exitX - bodyFront) / crawlSpeed) * 1000;

      resting = false;
      restUntil = 0;
      targetPlatform = null;
      vx = direction * crawlSpeed;
      crawlUntil = now + Math.min(6500, Math.max(900, travelTime + 320));
      crouchUntil = 0;
      nextDecision = crawlUntil + randomBetween(400, 900);
      mascot.dataset.state = "crawl";
      mascot.dataset.behavior = "crawl";
      mascot.dataset.lastReaction = "crawl-under";
      obstacleReactionCooldown = now + 500;
      turnStreak = 0;
    }

    function beginSurfaceCrawl(now) {
      if (!findCurrentPlatform()) return false;

      const direction = Math.abs(vx) < 1 ? facingDirection : vx < 0 ? -1 : 1;
      vx = direction * config.speed * 0.52;
      resting = false;
      restUntil = 0;
      targetPlatform = null;
      crouchUntil = 0;
      crawlUntil = now + randomBetween(1200, 2200);
      nextDecision = crawlUntil + randomBetween(500, 1100);
      mascot.dataset.state = "crawl";
      mascot.dataset.behavior = "crawl";
      mascot.dataset.lastReaction = "surface-crawl";
      return true;
    }

    function beginEdgeCrawl(now) {
      resumeDirection = vx < 0 ? 1 : -1;
      facingDirection = resumeDirection;
      vx = resumeDirection * config.speed * 0.52;
      resting = false;
      restUntil = 0;
      targetPlatform = null;
      crouchUntil = 0;
      crawlUntil = now + randomBetween(1200, 2100);
      nextDecision = crawlUntil + randomBetween(500, 1000);
      mascot.dataset.state = "crawl";
      mascot.dataset.behavior = "crawl";
      mascot.dataset.lastReaction = "edge-crawl";
      turnStreak = 0;
    }

    function beginTurnAround(now) {
      turnStreak = now - lastTurnTime < 1500 ? turnStreak + 1 : 1;
      lastTurnTime = now;

      if (turnStreak >= 2) {
        turnStreak = 0;
        const climbTarget = findClimbTarget();
        if (climbTarget) {
          jumpToPlatform(climbTarget);
          mascot.dataset.behavior = "escape";
          mascot.dataset.lastReaction = "escape-climb";
          return;
        }
        if (dropThroughPlatform(now)) {
          mascot.dataset.behavior = "escape";
          mascot.dataset.lastReaction = "escape-drop";
          return;
        }

        resumeDirection = vx < 0 ? 1 : -1;
        vx = resumeDirection * config.speed * 1.35;
        jump(config.jumpPower * 0.92);
        mascot.dataset.behavior = "escape";
        mascot.dataset.lastReaction = "escape-jump";
        return;
      }

      resumeDirection = vx < 0 ? 1 : -1;
      facingDirection = resumeDirection;
      vx = 0;
      resting = false;
      restUntil = 0;
      targetPlatform = null;
      crawlUntil = 0;
      crouchUntil = now + randomBetween(520, 880);
      obstacleReactionCooldown = crouchUntil + 320;
      nextDecision = crouchUntil + randomBetween(700, 1300);
      mascot.dataset.state = "crouch";
      mascot.dataset.behavior = "turn";
      mascot.dataset.lastReaction = "turn-around";
    }

    function reactToPlatformEdge(now, proposedX) {
      if (
        !grounded ||
        Math.abs(vx) < 1 ||
        now < crouchUntil ||
        now < crawlUntil ||
        now < edgeReactionCooldown
      ) {
        return false;
      }

      const platform = findCurrentPlatform();
      if (!platform) return false;

      const direction = vx < 0 ? -1 : 1;
      const nextFootX = proposedX + size * 0.5;
      const distanceToEdge =
        direction > 0 ? platform.right - nextFootX : nextFootX - platform.left;
      if (distanceToEdge > size * 0.24) return false;

      edgeReactionCount += 1;
      edgeReactionCooldown = now + 2600;
      if (edgeReactionCount % 2 === 1) {
        beginEdgeCrawl(now);
      } else {
        beginTurnAround(now);
      }
      return true;
    }

    function updateObstacleBehavior(now) {
      if (!grounded) return;

      if (crouchUntil > 0) {
        if (now < crouchUntil) {
          vx = 0;
          mascot.dataset.state = "crouch";
          mascot.dataset.behavior = "turn";
          return;
        }
        crouchUntil = 0;
        vx = resumeDirection * config.speed;
        mascot.dataset.state = "run";
        mascot.dataset.behavior = "roam";
      }

      if (crawlUntil > 0) {
        if (now < crawlUntil) {
          const direction = vx < 0 ? -1 : 1;
          vx = direction * config.speed * 0.58;
          mascot.dataset.state = "crawl";
          mascot.dataset.behavior = "crawl";
          return;
        }
        crawlUntil = 0;
        vx = (vx < 0 ? -1 : 1) * config.speed;
        mascot.dataset.state = "run";
        mascot.dataset.behavior = "roam";
      }
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
      if (currentSurfaceY === null || Math.abs(currentSurfaceY - onY) > 2) {
        currentSurfaceY = onY;
        surfaceSince = performance.now();
        turnStreak = 0;
      }
      y = onY - size;
      vy = 0;
      grounded = true;
      targetPlatform = null;
      if (wasAirborne) {
        landingUntil = performance.now() + 420;
        mascot.dataset.state = "land";
        mascot.dataset.behavior = "land";
        mascot.dataset.landed = "false";
        requestAnimationFrame(() => {
          mascot.dataset.landed = "true";
          window.setTimeout(() => {
            mascot.dataset.landed = "false";
          }, 380);
        });
      } else if (performance.now() >= landingUntil) {
        if (performance.now() < crouchUntil) {
          mascot.dataset.state = "crouch";
          mascot.dataset.behavior = "turn";
        } else if (performance.now() < crawlUntil) {
          mascot.dataset.state = "crawl";
          mascot.dataset.behavior = "crawl";
        } else {
          mascot.dataset.state = resting ? "rest" : "run";
          mascot.dataset.behavior = resting ? "rest" : "roam";
        }
      }
    }

    function makeDecision(now) {
      if (now < restUntil || now < crouchUntil || now < crawlUntil) return;

      if (grounded && now - surfaceSince > 7000 && dropThroughPlatform(now)) {
        return;
      }

      if (resting) {
        resting = false;
        vx = config.speed * (Math.random() > 0.5 ? 1 : -1);
        mascot.dataset.state = grounded ? "run" : "jump";
        mascot.dataset.behavior = grounded ? "roam" : "jump";
      } else {
        const choice = Math.random();
        if (choice < 0.48 && grounded) {
          const climbTarget = findClimbTarget();
          if (climbTarget && Math.random() < 0.78) {
            jumpToPlatform(climbTarget);
          } else {
            jump(
              randomBetween(config.jumpPower * 0.82, config.jumpPower * 1.08),
            );
          }
        } else if (choice < 0.64 && grounded) {
          resting = true;
          vx = 0;
          restUntil = now + randomBetween(1400, 3000);
          mascot.dataset.state = "rest";
          mascot.dataset.behavior = "rest";
        } else if (choice < 0.78 && grounded && beginSurfaceCrawl(now)) {
          return;
        } else if (choice < 0.9 && grounded && runTowardEdge(now)) {
          return;
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
      updateObstacleBehavior(now);

      if (now >= nextDecision) makeDecision(now);
      if (now >= nextSpeech) {
        showBubble(
          config.phrases[Math.floor(Math.random() * config.phrases.length)],
        );
        nextSpeech = now + randomBetween(12000, 22000);
      }

      const previousBottom = y + size;

      if (!grounded && targetPlatform) {
        const centerX = x + size * 0.5;
        const deltaX = targetPlatform.targetX - centerX;
        if (Math.abs(deltaX) > 8) {
          vx += Math.sign(deltaX) * config.speed * 2.2 * dt;
          vx = Math.max(
            -config.speed * 1.75,
            Math.min(config.speed * 1.75, vx),
          );
        }
      }

      const previousX = x;
      const proposedX = x + vx * dt;
      const reactedAtEdge = reactToPlatformEdge(now, proposedX);
      const obstacle =
        grounded && !reactedAtEdge
          ? findObstacleAhead(previousX, proposedX, now < crawlUntil)
          : null;

      if (reactedAtEdge) {
        x += vx * dt;
      } else if (obstacle) {
        const clearance = previousBottom - obstacle.bottom;
        const canCrawl = clearance >= size * 0.43 && clearance <= size * 0.78;
        if (canCrawl) {
          beginCrawl(now, obstacle);
          x += vx * dt;
        } else {
          beginTurnAround(now);
          x = previousX;
        }
      } else {
        x = proposedX;
      }
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
        facingDirection = 1;
      } else if (x >= rightLimit) {
        x = rightLimit;
        vx = -Math.abs(config.speed);
        facingDirection = -1;
      }

      let landingY = null;
      if (vy >= 0) {
        const footX = x + size * 0.5;
        const nextBottom = nextY + size;
        for (const platform of platforms) {
          const isDroppingThrough =
            now < dropThroughUntil &&
            dropThroughY !== null &&
            Math.abs(platform.top - dropThroughY) < 3;
          if (
            !isDroppingThrough &&
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

      if (Math.abs(vx) >= 1) facingDirection = vx < 0 ? -1 : 1;
      mascot.style.setProperty("--mascot-direction", String(facingDirection));
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
      const climbTarget = findClimbTarget();
      if (climbTarget) {
        jumpToPlatform(climbTarget);
      } else {
        jump(config.jumpPower * 1.08);
      }
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
