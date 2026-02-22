/**
 * Ants Cursor Effect — vendored from tholman/cursor-effects (unreleased)
 * https://github.com/tholman/cursor-effects/blob/master/src/antsCursor.js
 * License: MIT
 *
 * Little ants wander around, then follow your cursor in a line.
 */

interface AntsCursorOptions {
  element?: HTMLElement;
  numberOfAnts?: number;
  followRange?: number;
  color?: string;
  speed?: number;
  zIndex?: string;
}

export function antsCursor(options?: AntsCursorOptions) {
  const hasWrapperEl = options?.element;
  const element = hasWrapperEl || document.body;

  let width = window.innerWidth;
  let height = window.innerHeight;
  const cursor = { x: width / 2, y: height / 2 };
  const ants: Ant[] = [];
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let animationFrame: number;

  const numberOfAnts = options?.numberOfAnts || 20;
  const followRange = options?.followRange || 60;
  const antColor = options?.color || "#4a2c0a";
  const antSpeed = options?.speed || 1.2;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  prefersReducedMotion.onchange = () => {
    if (prefersReducedMotion.matches) {
      destroy();
    } else {
      init();
    }
  };

  function init() {
    if (prefersReducedMotion.matches) return;

    canvas = document.createElement("canvas");
    context = canvas.getContext("2d")!;
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = options?.zIndex || "9999999999";

    if (hasWrapperEl) {
      canvas.style.position = "absolute";
      element.appendChild(canvas);
      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;
    } else {
      canvas.style.position = "fixed";
      document.body.appendChild(canvas);
      canvas.width = width;
      canvas.height = height;
    }

    for (let i = 0; i < numberOfAnts; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ants.push(new Ant(x, y));
    }

    element.addEventListener("mousemove", onMouseMove);
    element.addEventListener("touchmove", onTouchMove, { passive: true });
    element.addEventListener("touchstart", onTouchMove, { passive: true });
    window.addEventListener("resize", onWindowResize);
    loop();
  }

  function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (hasWrapperEl) {
      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;
    } else {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
      if (hasWrapperEl) {
        const rect = element.getBoundingClientRect();
        cursor.x = e.touches[0].clientX - rect.left;
        cursor.y = e.touches[0].clientY - rect.top;
      } else {
        cursor.x = e.touches[0].clientX;
        cursor.y = e.touches[0].clientY;
      }
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (hasWrapperEl) {
      const rect = element.getBoundingClientRect();
      cursor.x = e.clientX - rect.left;
      cursor.y = e.clientY - rect.top;
    } else {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    }
  }

  function updateAnts() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    ants.forEach((ant) => {
      ant.following = false;
      ant.target = null;
    });

    const followingAnts: Ant[] = [];

    let closestToCursor: Ant | null = null;
    let closestDist = Infinity;

    ants.forEach((ant) => {
      const dist = Math.hypot(ant.position.x - cursor.x, ant.position.y - cursor.y);
      if (dist < followRange && dist < closestDist) {
        closestDist = dist;
        closestToCursor = ant;
      }
    });

    if (closestToCursor) {
      (closestToCursor as Ant).following = true;
      (closestToCursor as Ant).target = cursor;
      followingAnts.push(closestToCursor);
    }

    let addedNew = true;
    while (addedNew) {
      addedNew = false;
      ants.forEach((ant) => {
        if (ant.following) return;
        let nearestDist = Infinity;
        let nearestAnt: Ant | null = null;
        followingAnts.forEach((fa) => {
          const dist = Math.hypot(ant.position.x - fa.position.x, ant.position.y - fa.position.y);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestAnt = fa;
          }
        });
        if (nearestDist < followRange && nearestAnt) {
          ant.following = true;
          ant.target = (nearestAnt as Ant).position;
          followingAnts.push(ant);
          addedNew = true;
        }
      });
    }

    ants.forEach((ant) => {
      if (ant.following && ant.target) {
        ant.moveToward(ant.target);
      } else {
        ant.wander();
      }
      ant.update();
      ant.draw(context);
    });
  }

  function loop() {
    updateAnts();
    animationFrame = requestAnimationFrame(loop);
  }

  function destroy() {
    canvas?.remove();
    cancelAnimationFrame(animationFrame);
    element.removeEventListener("mousemove", onMouseMove);
    element.removeEventListener("touchmove", onTouchMove);
    element.removeEventListener("touchstart", onTouchMove);
    window.removeEventListener("resize", onWindowResize);
  }

  class Ant {
    position: { x: number; y: number };
    velocity = { x: 0, y: 0 };
    angle: number;
    wanderAngle: number;
    following = false;
    target: { x: number; y: number } | null = null;
    legPhase: number;
    size: number;

    constructor(x: number, y: number) {
      this.position = { x, y };
      this.angle = Math.random() * Math.PI * 2;
      this.wanderAngle = this.angle;
      this.legPhase = Math.random() * Math.PI * 2;
      this.size = 1.5 + Math.random() * 1;
    }

    wander() {
      this.wanderAngle += (Math.random() - 0.5) * 0.3;
      const tvx = Math.cos(this.wanderAngle) * antSpeed * 0.5;
      const tvy = Math.sin(this.wanderAngle) * antSpeed * 0.5;
      this.velocity.x += (tvx - this.velocity.x) * 0.05;
      this.velocity.y += (tvy - this.velocity.y) * 0.05;
      if (this.position.x < 20) this.wanderAngle = 0;
      if (this.position.x > canvas.width - 20) this.wanderAngle = Math.PI;
      if (this.position.y < 20) this.wanderAngle = Math.PI / 2;
      if (this.position.y > canvas.height - 20) this.wanderAngle = -Math.PI / 2;
    }

    moveToward(target: { x: number; y: number }) {
      const dx = target.x - this.position.x;
      const dy = target.y - this.position.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 8) {
        const ta = Math.atan2(dy, dx);
        let ad = ta - this.angle;
        while (ad > Math.PI) ad -= Math.PI * 2;
        while (ad < -Math.PI) ad += Math.PI * 2;
        this.angle += ad * 0.3;
        const speed = Math.min(antSpeed * 1.8, dist * 0.15);
        const tvx = Math.cos(this.angle) * speed;
        const tvy = Math.sin(this.angle) * speed;
        this.velocity.x += (tvx - this.velocity.x) * 0.2;
        this.velocity.y += (tvy - this.velocity.y) * 0.2;
      } else {
        this.velocity.x *= 0.8;
        this.velocity.y *= 0.8;
      }
    }

    update() {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      if (Math.hypot(this.velocity.x, this.velocity.y) > 0.1) {
        this.angle = Math.atan2(this.velocity.y, this.velocity.x);
      }
      this.position.x = Math.max(5, Math.min(canvas.width - 5, this.position.x));
      this.position.y = Math.max(5, Math.min(canvas.height - 5, this.position.y));
      this.legPhase += Math.hypot(this.velocity.x, this.velocity.y) * 0.3;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.angle);
      const s = this.size;
      const phase = this.legPhase;

      ctx.strokeStyle = antColor;
      ctx.lineWidth = 0.5;
      const legs = [
        { x: s * 0.4, side: -1, group: 0 },
        { x: s * 0.4, side: 1, group: 1 },
        { x: 0, side: -1, group: 1 },
        { x: 0, side: 1, group: 0 },
        { x: -s * 0.5, side: -1, group: 0 },
        { x: -s * 0.5, side: 1, group: 1 },
      ];
      legs.forEach((leg) => {
        const wiggle = Math.sin(phase + leg.group * Math.PI) * 0.4;
        const ey = s * 0.9 * leg.side;
        const ex = leg.x - s * 0.3 + wiggle * s * 0.3;
        ctx.beginPath();
        ctx.moveTo(leg.x, 0);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      });

      ctx.fillStyle = antColor;
      ctx.beginPath();
      ctx.ellipse(s * 0.9, 0, s * 0.5, s * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-s * 1.1, 0, s * 0.7, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = antColor;
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(s * 1.2, -s * 0.2);
      ctx.quadraticCurveTo(s * 1.6, -s * 0.6, s * 1.8, -s * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 1.2, s * 0.2);
      ctx.quadraticCurveTo(s * 1.6, s * 0.6, s * 1.8, s * 0.3);
      ctx.stroke();

      ctx.restore();
    }
  }

  init();
  return { destroy };
}
