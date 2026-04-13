'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '@/game/store';
import { TerrainType, BuildingType } from '@/game/types';
import { MAP_SIZE, TILE_WIDTH, TILE_HEIGHT } from '@/game/constants';

// 地形颜色映射
const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TerrainType.GRASS]: '#4a8c3f',
  [TerrainType.WATER]: '#3b7dd8',
  [TerrainType.FOREST]: '#2d6b2e',
  [TerrainType.DESERT]: '#c2a64e',
  [TerrainType.MOUNTAIN]: '#5a5a5a',
};

// 建筑颜色（用于小地图显示）
const BUILDING_COLOR = '#d4af37';

interface MiniMapProps {
  size?: number;
}

export default function MiniMap({ size = 120 }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const lastUpdateRef = useRef(0);
  
  const map = useGameStore(s => s.map);
  const cameraX = useGameStore(s => s.cameraX);
  const cameraY = useGameStore(s => s.cameraY);
  const zoom = useGameStore(s => s.zoom);
  const setCamera = useGameStore(s => s.setCamera);
  const showStartScreen = useGameStore(s => s.showStartScreen);
  
  // 获取视口信息
  const getViewportInfo = useCallback(() => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const viewportWidth = canvas.clientWidth / zoom;
    const viewportHeight = canvas.clientHeight / zoom;
    
    // 相机位置转换为世界坐标
    const worldX = -cameraX;
    const worldY = -cameraY;
    
    // 视口覆盖的格子范围
    const startTileX = Math.floor(worldX / TILE_WIDTH);
    const startTileY = Math.floor(worldY / TILE_HEIGHT);
    const endTileX = Math.ceil((worldX + viewportWidth) / TILE_WIDTH);
    const endTileY = Math.ceil((worldY + viewportHeight) / TILE_HEIGHT);
    
    return {
      startTileX: Math.max(0, startTileX),
      startTileY: Math.max(0, startTileY),
      endTileX: Math.min(MAP_SIZE - 1, endTileX),
      endTileY: Math.min(MAP_SIZE - 1, endTileY),
      viewportWidth,
      viewportHeight,
    };
  }, [cameraX, cameraY, zoom]);

  // 绘制小地图
  const drawMiniMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const now = Date.now();
    // 节流更新，避免频繁重绘
    if (now - lastUpdateRef.current < 100 && !isDraggingRef.current) {
      return;
    }
    lastUpdateRef.current = now;
    
    // 清除画布
    ctx.clearRect(0, 0, size, size);
    
    // 计算每个格子的像素大小
    const cellSize = size / MAP_SIZE;
    
    // 绘制地形
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        const tile = map[y]?.[x];
        if (!tile) continue;
        
        const terrainColor = TERRAIN_COLORS[tile.terrain] || '#333';
        
        // 如果有建筑，在地形颜色上叠加建筑标记
        if (tile.building && tile.building !== BuildingType.DEMOLISH) {
          // 先画地形
          ctx.fillStyle = terrainColor;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize + 0.5, cellSize + 0.5);
          // 再画建筑点（只在格子较大时可见）
          if (cellSize >= 2) {
            ctx.fillStyle = BUILDING_COLOR;
            const padding = cellSize * 0.2;
            ctx.fillRect(
              x * cellSize + padding,
              y * cellSize + padding,
              cellSize - padding * 2,
              cellSize - padding * 2
            );
          }
        } else {
          ctx.fillStyle = terrainColor;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize + 0.5, cellSize + 0.5);
        }
      }
    }
    
    // 绘制当前视口位置框
    const viewport = getViewportInfo();
    if (viewport) {
      const viewX = viewport.startTileX * cellSize;
      const viewY = viewport.startTileY * cellSize;
      const viewW = (viewport.endTileX - viewport.startTileX + 1) * cellSize;
      const viewH = (viewport.endTileY - viewport.startTileY + 1) * cellSize;
      
      // 视口框 - 半透明填充
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(viewX, viewY, viewW, viewH);
      
      // 视口框 - 边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(viewX + 0.5, viewY + 0.5, viewW - 1, viewH - 1);
      
      // 中心点标记
      const centerX = ((cameraX + (viewport.viewportWidth / 2)) / TILE_WIDTH) * cellSize;
      const centerY = ((cameraY + (viewport.viewportHeight / 2)) / TILE_HEIGHT) * cellSize;
      
      if (centerX >= 0 && centerX <= size && centerY >= 0 && centerY <= size) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [map, cameraX, cameraY, zoom, size, getViewportInfo]);

  // 点击小地图跳转
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 计算点击位置对应的地图坐标
    const tileX = Math.floor((x / size) * MAP_SIZE);
    const tileY = Math.floor((y / size) * MAP_SIZE);
    
    // 获取当前视口大小，计算新的相机位置
    const viewportWidth = canvas.clientWidth / zoom;
    const viewportHeight = canvas.clientHeight / zoom;
    
    // 设置相机位置，使点击位置居中
    const newCameraX = tileX * TILE_WIDTH - viewportWidth / 2;
    const newCameraY = tileY * TILE_HEIGHT - viewportHeight / 2;
    
    setCamera(newCameraX, newCameraY);
  }, [map, zoom, size, setCamera]);

  // 触摸处理
  const handleTouchStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    
    const touch = e.changedTouches[0];
    if (!touch) return;
    
    // 触发点击逻辑
    const mockEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
    } as React.MouseEvent<HTMLCanvasElement>;
    
    handleClick(mockEvent);
  }, [handleClick]);

  // 定期更新
  useEffect(() => {
    if (showStartScreen) return;
    
    const intervalId = setInterval(() => {
      drawMiniMap();
    }, 200);
    
    return () => clearInterval(intervalId);
  }, [drawMiniMap, showStartScreen]);

  // 初始绘制
  useEffect(() => {
    if (showStartScreen) return;
    drawMiniMap();
  }, [drawMiniMap, showStartScreen, cameraX, cameraY, zoom, map]);

  if (showStartScreen) return null;

  return (
    <div
      style={{
        width: size,
        height: size,
        background: 'rgba(20, 15, 10, 0.85)',
        borderRadius: '8px',
        border: '2px solid rgba(218, 165, 32, 0.4)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
      }}
    >
      {/* 小地图标题 */}
      <div
        className="absolute top-0 left-0 right-0 text-center text-xs font-bold"
        style={{
          background: 'rgba(218, 165, 32, 0.2)',
          color: '#daa520',
          padding: '2px 0',
          fontSize: '10px',
          letterSpacing: '0.5px',
        }}
      >
        🗺️ 小地图
      </div>
      
      {/* 画布 */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'block',
          cursor: 'pointer',
          marginTop: '18px',
        }}
      />
      
      {/* 坐标提示 */}
      <div
        className="absolute bottom-1 left-0 right-0 text-center text-[9px]"
        style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '9px',
        }}
      >
        点击跳转
      </div>
    </div>
  );
}
