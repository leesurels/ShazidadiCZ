'use client';

import React from 'react';
import { useGameStore } from '@/game/store';
import { Season } from '@/game/types';
import { SEASON_EFFECTS } from '@/game/constants';

const RESOURCE_ITEMS = [
  { key: 'food' as const, emoji: '🍞', name: '食物' },
  { key: 'wood' as const, emoji: '🪵', name: '木材' },
  { key: 'stone' as const, emoji: '🪨', name: '石材' },
  { key: 'pottery' as const, emoji: '🏺', name: '陶器' },
  { key: 'gold' as const, emoji: '💰', name: '金币' },
];

// Extended resources for production chain
const EXTENDED_RESOURCES = [
  { key: 'wheat' as const, emoji: '🌾', name: '小麦' },
  { key: 'flour' as const, emoji: '🌾', name: '面粉' },
  { key: 'bread' as const, emoji: '🥖', name: '面包' },
  { key: 'clay' as const, emoji: '🟤', name: '粘土' },
  { key: 'iron' as const, emoji: '⚙️', name: '铁矿' },
  { key: 'tools' as const, emoji: '🔧', name: '工具' },
];

export default function ResourceBar() {
  const resources = useGameStore(s => s.resources);
  const storageCapacity = useGameStore(s => s.storageCapacity);
  const workersNeeded = useGameStore(s => s.workersNeeded);
  const workersAvailable = useGameStore(s => s.workersAvailable);
  const population = useGameStore(s => s.population);
  const hasRunningGame = useGameStore(s => s.isRunning);
  const currentSeason = useGameStore(s => s.currentSeason);
  const unlockedBuildings = useGameStore(s => s.unlockedBuildings);
  const tickCount = useGameStore(s => s.tickCount);

  const goldCap = storageCapacity * 5;
  const workerPercent = workersNeeded > 0 ? Math.min(100, Math.round((population / workersNeeded) * 100)) : 100;
  const workerColor = workerPercent >= 100 ? '#66cc66' : workerPercent >= 70 ? '#ffcc00' : '#ff6666';

  // Check if production chain resources are unlocked
  const hasMill = unlockedBuildings.includes('mill');
  const hasBakery = unlockedBuildings.includes('bakery');
  const hasClayPit = unlockedBuildings.includes('clay_pit');
  const hasIronMine = unlockedBuildings.includes('iron_mine');
  const hasBlacksmith = unlockedBuildings.includes('blacksmith');

  // Show extended resources if any production chain building is unlocked
  const showExtended = hasMill || hasBakery || hasClayPit || hasIronMine || hasBlacksmith;

  // Season effects display
  const seasonInfo = SEASON_EFFECTS[currentSeason];

  return (
    <div
      className="flex items-center gap-1 px-1.5 py-1 overflow-x-auto shrink-0"
      style={{
        background: 'linear-gradient(to bottom, #1a0a00, #150800)',
        borderBottom: '1px solid rgba(218,165,32,0.2)',
      }}
    >
      {/* Season indicator */}
      {hasRunningGame && (
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
          style={{ 
            background: currentSeason === Season.WINTER ? 'rgba(70,130,180,0.2)' : 
                       currentSeason === Season.SUMMER ? 'rgba(255,165,0,0.15)' :
                       currentSeason === Season.AUTUMN ? 'rgba(210,105,30,0.15)' :
                       'rgba(144,238,144,0.15)',
          }}
          title={`${seasonInfo.description} - 农场产出x${seasonInfo.farmMultiplier}`}
        >
          <span className="text-xs">{seasonInfo.emoji}</span>
        </div>
      )}

      {/* Worker indicator */}
      {hasRunningGame && population > 0 && (
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          title={`工人: ${Math.min(population, workersNeeded)}/${workersNeeded} 效率${workerPercent}%`}
        >
          <span className="text-xs">👷</span>
          <span
            className="text-[10px] font-bold tabular-nums"
            style={{ color: workerColor }}
          >
            {workerPercent}%
          </span>
        </div>
      )}

      {/* Storage indicator */}
      {hasRunningGame && (
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          title={`仓储容量: ${storageCapacity} (金币: ${goldCap})`}
        >
          <span className="text-xs">📦</span>
          <span
            className="text-[10px] font-bold tabular-nums"
            style={{ color: '#DAA520' }}
          >
            {storageCapacity}
          </span>
        </div>
      )}

      {/* Divider */}
      {hasRunningGame && population > 0 && (
        <div className="w-px h-4 shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />
      )}

      {/* Basic Resources */}
      {RESOURCE_ITEMS.map(item => {
        const cap = item.key === 'gold' ? goldCap : storageCapacity;
        const isNearCap = resources[item.key] >= cap * 0.9;
        return (
          <div
            key={item.key}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
            style={{
              background: 'rgba(255,255,255,0.05)',
            }}
            title={`${item.name}: ${Math.floor(resources[item.key])}/${cap}`}
          >
            <span className="text-sm">{item.emoji}</span>
            <span
              className="text-xs font-bold tabular-nums"
              style={{ color: isNearCap ? '#ff9944' : '#FFD700' }}
            >
              {Math.floor(resources[item.key])}
            </span>
          </div>
        );
      })}

      {/* Extended Resources - Production Chain */}
      {showExtended && (
        <>
          <div className="w-px h-4 shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-[8px] shrink-0" style={{ color: '#666' }}>产业链</span>
        </>
      )}

      {(hasMill || hasBakery) && (
        <>
          {hasMill && (
            <div
              key="wheat"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
              style={{ background: 'rgba(255,255,255,0.03)' }}
              title={`小麦: ${Math.floor(resources.wheat || 0)}`}
            >
              <span className="text-xs">🌾</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#90EE90' }}>
                {Math.floor(resources.wheat || 0)}
              </span>
            </div>
          )}
          {hasBakery && (
            <>
              <div
                key="flour"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
                style={{ background: 'rgba(255,255,255,0.03)' }}
                title={`面粉: ${Math.floor(resources.flour || 0)}`}
              >
                <span className="text-xs">🌫️</span>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: '#D2B48C' }}>
                  {Math.floor(resources.flour || 0)}
                </span>
              </div>
              <div
                key="bread"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
                style={{ background: 'rgba(255,255,255,0.03)' }}
                title={`面包: ${Math.floor(resources.bread || 0)}`}
              >
                <span className="text-xs">🥖</span>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: '#DEB887' }}>
                  {Math.floor(resources.bread || 0)}
                </span>
              </div>
            </>
          )}
        </>
      )}

      {(hasClayPit || hasIronMine || hasBlacksmith) && (
        <>
          {hasClayPit && (
            <div
              key="clay"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
              style={{ background: 'rgba(255,255,255,0.03)' }}
              title={`粘土: ${Math.floor(resources.clay || 0)}`}
            >
              <span className="text-xs">🟤</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#8B4513' }}>
                {Math.floor(resources.clay || 0)}
              </span>
            </div>
          )}
          {hasIronMine && (
            <div
              key="iron"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
              style={{ background: 'rgba(255,255,255,0.03)' }}
              title={`铁矿: ${Math.floor(resources.iron || 0)}`}
            >
              <span className="text-xs">⚙️</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#708090' }}>
                {Math.floor(resources.iron || 0)}
              </span>
            </div>
          )}
          {hasBlacksmith && (
            <div
              key="tools"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shrink-0"
              style={{ background: 'rgba(255,255,255,0.03)' }}
              title={`工具: ${Math.floor(resources.tools || 0)}`}
            >
              <span className="text-xs">🔧</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#CD853F' }}>
                {Math.floor(resources.tools || 0)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
