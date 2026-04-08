'use client';

import React from 'react';
import { useGameStore } from '@/game/store';
import { BUILDING_DEFS, BUILD_ORDER, BUILDING_UNLOCKS } from '@/game/constants';
import { BuildingType } from '@/game/types';

export default function BuildBar() {
  const {
    selectedBuilding,
    isDemolishMode,
    selectBuilding,
    toggleDemolishMode,
    resources,
    setShowBuildingInfo,
    setSelectedTile,
    unlockedBuildings,
    population,
    setShowAchievementPanel,
  } = useGameStore();

  // Check if a building is unlocked
  const isUnlocked = (type: BuildingType): boolean => {
    return unlockedBuildings.includes(type);
  };

  // Get unlock requirement text
  const getUnlockText = (type: BuildingType): string | null => {
    if (isUnlocked(type)) return null;
    const req = BUILDING_UNLOCKS[type];
    if (!req) return '人口达到50';
    if (req.population) {
      return `人口达到${req.population}`;
    }
    return null;
  };

  return (
    <div
      className="shrink-0"
      style={{
        background: 'linear-gradient(to top, #1a0a00, #150800)',
        borderTop: '1px solid rgba(218,165,32,0.3)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      {/* Building buttons */}
      <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto">
        {BUILD_ORDER.map(type => {
          const def = BUILDING_DEFS[type];
          if (!def) return null;
          const isSelected = selectedBuilding === type && !isDemolishMode;
          const unlocked = isUnlocked(type);
          const canAfford =
            resources.gold >= def.cost.gold &&
            resources.wood >= def.cost.wood &&
            resources.stone >= def.cost.stone;
          const unlockText = getUnlockText(type);

          return (
            <button
              key={type}
              onClick={() => {
                if (!unlocked) return;
                if (isSelected) {
                  selectBuilding(null);
                  setShowBuildingInfo(false);
                  setSelectedTile(null);
                } else {
                  selectBuilding(type);
                }
              }}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded shrink-0 transition-all min-w-[48px]"
              style={{
                background: isSelected
                  ? 'rgba(218,165,32,0.3)'
                  : 'rgba(255,255,255,0.05)',
                border: isSelected
                  ? '2px solid #FFD700'
                  : '1px solid rgba(255,255,255,0.1)',
                opacity: unlocked ? (canAfford ? 1 : 0.6) : 0.4,
                cursor: unlocked ? 'pointer' : 'not-allowed',
                position: 'relative',
              }}
              title={unlocked 
                ? `${def.name} (💰${def.cost.gold} 🪵${def.cost.wood} 🪨${def.cost.stone})`
                : `🔒 ${def.name} - ${unlockText || '未解锁'}`
              }
              disabled={!unlocked}
            >
              {/* Lock icon for locked buildings */}
              {!unlocked && (
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                  style={{ background: 'rgba(128,128,128,0.8)' }}
                >
                  🔒
                </div>
              )}
              <span className="text-xl leading-none relative">
                {def.emoji}
                {isSelected && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-yellow-400 rounded-full" />
                )}
              </span>
              <span
                className="text-[10px] leading-tight"
                style={{ color: isSelected ? '#FFD700' : (unlocked ? '#ccc' : '#666') }}
              >
                {def.name}
              </span>
              {!canAfford && unlocked && (
                <span className="text-[8px] text-red-400">资源不足</span>
              )}
            </button>
          );
        })}

        {/* Demolish button */}
        <button
          onClick={toggleDemolishMode}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded shrink-0 transition-all active:scale-90 min-w-[48px]"
          style={{
            background: isDemolishMode
              ? 'rgba(255,50,50,0.3)'
              : 'rgba(255,255,255,0.05)',
            border: isDemolishMode
              ? '2px solid #ff3333'
              : '1px solid rgba(255,255,255,0.1)',
          }}
          title="拆除建筑"
        >
          <span className="text-xl leading-none">💥</span>
          <span
            className="text-[10px] leading-tight"
            style={{ color: isDemolishMode ? '#ff3333' : '#ccc' }}
          >
            拆除
          </span>
        </button>

        {/* Achievement button */}
        <button
          onClick={() => setShowAchievementPanel(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded shrink-0 transition-all active:scale-90 min-w-[48px]"
          style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.2)',
          }}
          title="成就系统"
        >
          <span className="text-xl leading-none">🏆</span>
          <span className="text-[10px] leading-tight" style={{ color: '#FFD700' }}>
            成就
          </span>
        </button>
      </div>

      {/* Current selection indicator */}
      {(selectedBuilding || isDemolishMode) && (
        <div className="px-3 pb-1.5">
          <span className="text-xs" style={{ color: '#999' }}>
            {isDemolishMode
              ? '👆 点击建筑进行拆除 (返还50%金币)'
              : selectedBuilding
                ? (() => {
                    const def = BUILDING_DEFS[selectedBuilding];
                    const productionChain = def.productionChain;
                    return def
                      ? `当前: ${def.emoji} ${def.name} (💰${def.cost.gold} 🪵${def.cost.wood} 🪨${def.cost.stone})`
                      : '';
                  })()
                : ''}
          </span>
        </div>
      )}

      {/* Production chain hint */}
      {selectedBuilding && (() => {
        const def = BUILDING_DEFS[selectedBuilding];
        if (!def?.productionChain) return null;
        return (
          <div className="px-3 pb-1.5">
            <span className="text-[10px]" style={{ color: '#888' }}>
              {def.productionChain.input && def.productionChain.output && (
                <>🔄 产业链: {def.productionChain.input.amount} {def.productionChain.input.resource} → {def.productionChain.output.amount} {def.productionChain.output.resource}</>
              )}
            </span>
          </div>
        );
      })()}
    </div>
  );
}
