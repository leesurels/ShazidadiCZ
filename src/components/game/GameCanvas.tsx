'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '@/game/store';
import { Renderer } from '@/game/renderer';
import { InputHandler } from '@/game/inputHandler';
import { GameLoop } from '@/game/gameLoop';
import { TILE_WIDTH, TILE_HEIGHT, MAP_SIZE } from '@/game/constants';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const inputHandlerRef = useRef<InputHandler | null>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);

  const initGame = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Create renderer
    const renderer = new Renderer(canvas);
    rendererRef.current = renderer;

    // Initial resize
    const rect = container.getBoundingClientRect();
    renderer.resize(rect.width, rect.height);

    // Initialize camera to center the map on screen (only if at default position)
    // Map center (tile 30,30) should appear at screen center when cameraX=0, cameraY=0
    const state = useGameStore.getState();
    if (state.cameraX === 0 && state.cameraY === 0 && !state.showStartScreen) {
      // Camera is already at (0,0), map will be centered - no action needed
    }

    // Create input handler
    const inputHandler = new InputHandler(renderer, canvas);
    inputHandlerRef.current = inputHandler;

    // Create game loop
    const gameLoop = new GameLoop(renderer, inputHandler);
    gameLoopRef.current = gameLoop;
    gameLoop.start();

    // Resize observer
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (rendererRef.current) {
          rendererRef.current.resize(width, height);
        }
      }
    });
    observer.observe(container);

    return () => {
      gameLoop.stop();
      inputHandler.destroy();
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const cleanup = initGame();
    return cleanup;
  }, [initGame]);

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
