"use client";

import { useEffect, useRef } from "react";
import {
  Bodies,
  Engine,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World,
} from "matter-js";
import type { Body } from "matter-js";

const BRAND = "#2a61b3";
const ACCENT_2 = "#b7e0e4";

export function MatterHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = Engine.create();
    const initialWidth = window.innerWidth;
    const initialHeight =
      window.innerWidth < 768
        ? Math.min(500, window.innerHeight * 0.6)
        : Math.min(600, window.innerHeight * 0.7);

    canvas.width = initialWidth;
    canvas.height = initialHeight;

    const render = Render.create({
      canvas,
      engine,
      options: {
        width: initialWidth,
        height: initialHeight,
        wireframes: false,
        background: "transparent",
        pixelRatio: window.devicePixelRatio || 1,
      },
    });

    const cw = initialWidth;
    const ch = initialHeight;
    const wallThickness = 50;
    const walls = [
      Bodies.rectangle(cw / 2, -wallThickness / 2, cw, wallThickness, {
        isStatic: true,
      }),
      Bodies.rectangle(cw / 2, ch + wallThickness / 2, cw, wallThickness, {
        isStatic: true,
      }),
      Bodies.rectangle(-wallThickness / 2, ch / 2, wallThickness, ch, {
        isStatic: true,
      }),
      Bodies.rectangle(cw + wallThickness / 2, ch / 2, wallThickness, ch, {
        isStatic: true,
      }),
    ];

    const colors = [BRAND, ACCENT_2, "#7aa5e5", "#f4b1c2"];
    const objects: Body[] = [];
    const objectCount = window.innerWidth < 768 ? 10 : 16;

    for (let i = 0; i < objectCount; i += 1) {
      const size = 12 + Math.random() * 18;
      const x = Math.random() * cw;
      const y = Math.random() * ch * 0.6;
      const color = colors[i % colors.length];
      let shape: Body;
      if (Math.random() > 0.5) {
        shape = Bodies.circle(x, y, size, {
          restitution: 0.6,
          friction: 0.05,
          render: {
            fillStyle: color,
            strokeStyle: "rgba(255, 255, 255, 0.5)",
            lineWidth: 2,
          },
        });
      } else {
        shape = Bodies.rectangle(x, y, size * 2, size * 2, {
          restitution: 0.6,
          friction: 0.05,
          chamfer: { radius: 10 },
          render: {
            fillStyle: color,
            strokeStyle: "rgba(255, 255, 255, 0.5)",
            lineWidth: 2,
          },
        });
      }
      objects.push(shape);
    }

    const logoCircles = [
      Bodies.circle(cw * 0.3, ch * 0.5, 50, {
        isStatic: false,
        restitution: 0.8,
        friction: 0.01,
        render: {
          fillStyle: "#667EEA",
          strokeStyle: "#FFFFFF",
          lineWidth: 3,
        },
      }),
      Bodies.circle(cw * 0.7, ch * 0.5, 50, {
        isStatic: false,
        restitution: 0.8,
        friction: 0.01,
        render: {
          fillStyle: "#764BA2",
          strokeStyle: "#FFFFFF",
          lineWidth: 3,
        },
      }),
    ];

    World.add(engine.world, [...walls, ...objects, ...logoCircles]);

    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    World.add(engine.world, mouseConstraint);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight =
        window.innerWidth < 768
          ? Math.min(500, window.innerHeight * 0.6)
          : Math.min(600, window.innerHeight * 0.7);

      canvas.width = newWidth;
      canvas.height = newHeight;

      render.bounds.max.x = newWidth;
      render.bounds.max.y = newHeight;
      render.options.width = newWidth;
      render.options.height = newHeight;
      render.canvas.width = newWidth;
      render.canvas.height = newHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
      <canvas
        ref={canvasRef}
        className="relative z-10 w-full"
        style={{ display: "block", touchAction: "none", maxWidth: "100%" }}
      />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-gray-800 mb-2 md:mb-4 drop-shadow-lg text-center">
          Tech.C Venture 総合ポータル
        </h1>
        <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-gray-700 drop-shadow-md text-center px-4">
          Tech.C Venture メンバー管理システム
        </p>
        <div className="mt-4 md:mt-8 pointer-events-auto">
          <a
            href="/events"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-full text-sm md:text-base font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            イベントを見る
          </a>
        </div>
      </div>
    </div>
  );
}
