"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

export function MatterHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const cw = window.innerWidth;
    const ch = Math.min(600, window.innerHeight * 0.7);

    canvas.width = cw;
    canvas.height = ch;

    // Matter.jsのセットアップ
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;

    const engine = Engine.create({
      gravity: { x: 0, y: 0.5, scale: 0.001 },
    });
    engineRef.current = engine;

    const render = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: cw,
        height: ch,
        wireframes: false,
        background: "transparent",
      },
    });

    // カラーパレット（柔らかく美しい色）
    const colors = [
      "#A8E6CF", // ミントグリーン
      "#FFD3B6", // ピーチ
      "#FFAAA5", // コーラル
      "#FF8B94", // ローズ
      "#B4A7D6", // ラベンダー
      "#9AD1D4", // スカイブルー
    ];

    // 壁を作成
    const wallOptions = {
      isStatic: true,
      render: { fillStyle: "transparent" },
    };

    const walls = [
      Bodies.rectangle(cw / 2, -25, cw, 50, wallOptions), // 上
      Bodies.rectangle(cw / 2, ch + 25, cw, 50, wallOptions), // 下
      Bodies.rectangle(-25, ch / 2, 50, ch, wallOptions), // 左
      Bodies.rectangle(cw + 25, ch / 2, 50, ch, wallOptions), // 右
    ];

    // シンプルなオブジェクトを作成
    const objects: Matter.Body[] = [];

    // 円と四角形をランダムに配置
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * cw * 0.8 + cw * 0.1;
      const y = Math.random() * ch * 0.3;
      const size = Math.random() * 30 + 25;
      const color = colors[Math.floor(Math.random() * colors.length)];

      let shape;
      if (Math.random() > 0.5) {
        // 円
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
        // 四角形
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

    // "Portal.C"のテキストを表現する大きな円
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

    // すべてのオブジェクトをワールドに追加
    World.add(engine.world, [...walls, ...objects, ...logoCircles]);

    // マウスコントロールを追加
    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    World.add(engine.world, mouseConstraint);

    // レンダリングを開始
    Matter.Runner.run(engine);
    Render.run(render);

    // ウィンドウリサイズ対応
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = Math.min(600, window.innerHeight * 0.7);

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

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", handleResize);
      Render.stop(render);
      World.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
      <canvas
        ref={canvasRef}
        className="relative z-10"
        style={{ display: "block", touchAction: "none" }}
      />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4 drop-shadow-lg">
          Portal.C
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 drop-shadow-md">
          Tech.C Venture メンバー管理システム
        </p>
        <div className="mt-8 pointer-events-auto">
          <a
            href="/events"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            イベントを見る
          </a>
        </div>
      </div>
    </div>
  );
}
