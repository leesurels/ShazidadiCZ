'use client';

import React from 'react';
import { useGameStore } from '@/game/store';
import { TECH_DEFS, BUILDING_DEFS } from '@/game/constants';
import { TechType } from '@/game/types';

export default function TechPanel() {
  const {
    showTechPanel,
    setShowTechPanel,
    currentResearch,
    researchProgress,
    researchedTechs,
    startResearch,
    unlockedBuildings,
    population,
  } = useGameStore();

  if (!showTechPanel) return null;

  const techs = Object.values(TECH_DEFS);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={() => setShowTechPanel(false)}
    >
      <div 
        className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-lg"
        style={{ 
          background: 'linear-gradient(to bottom, #1a1206, #0a0800)',
          border: '1px solid rgba(218,165,32,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{
          borderBottom: '1px solid rgba(218,165,32,0.2)',
        }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔬</span>
            <span className="font-bold" style={{ color: '#FFD700' }}>科技研究</span>
          </div>
          <button
            onClick={() => setShowTechPanel(false)}
            className="text-lg hover:opacity-70 transition-opacity"
            style={{ color: '#888' }}
          >
            ✕
          </button>
        </div>

        {/* Current research */}
        {currentResearch && (
          <div className="px-4 py-3" style={{
            background: 'rgba(65,105,225,0.1)',
            borderBottom: '1px solid rgba(65,105,225,0.2)',
          }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: '#4169E1' }}>正在研究:</span>
              <span className="text-sm font-bold" style={{ color: '#FFD700' }}>
                {TECH_DEFS[currentResearch].emoji} {TECH_DEFS[currentResearch].name}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${Math.min(100, (researchProgress / TECH_DEFS[currentResearch].researchCost) * 100)}%`,
                  background: 'linear-gradient(to right, #4169E1, #6495ED)',
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px]" style={{ color: '#666' }}>
                进度: {Math.floor(researchProgress)}/{TECH_DEFS[currentResearch].researchCost}
              </span>
              <span className="text-[10px]" style={{ color: '#666' }}>
                {Math.floor((researchProgress / TECH_DEFS[currentResearch].researchCost) * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Tech list */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          <div className="grid gap-3">
            {techs.map(tech => {
              const isResearched = researchedTechs.includes(tech.id);
              const isResearching = currentResearch === tech.id;
              const canResearch = !isResearched && !currentResearch && !isResearching;
              const progress = isResearching ? (researchProgress / tech.researchCost) * 100 : 0;

              // Get unlocked buildings from this tech
              const unlockedFromTech: string[] = [];
              if (isResearched) {
                for (const [buildingType, unlockReq] of Object.entries(BUILDING_UNLOCKS)) {
                  if (unlockReq.tech === tech.id && !unlockedBuildings.includes(buildingType as any)) {
                    const def = BUILDING_DEFS[buildingType];
                    if (def) unlockedFromTech.push(`${def.emoji} ${def.name}`);
                  }
                }
              }

              return (
                <div
                  key={tech.id}
                  className="p-3 rounded-lg transition-all"
                  style={{
                    background: isResearched 
                      ? 'rgba(50,205,50,0.1)'
                      : isResearching
                        ? 'rgba(65,105,225,0.1)'
                        : 'rgba(255,255,255,0.03)',
                    border: isResearched
                      ? '1px solid rgba(50,205,50,0.3)'
                      : isResearching
                        ? '1px solid rgba(65,105,225,0.3)'
                        : '1px solid rgba(255,255,255,0.1)',
                    opacity: isResearched ? 1 : (canResearch ? 1 : 0.6),
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tech.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: isResearched ? '#32CD32' : '#ccc' }}>
                            {tech.name}
                          </span>
                          {isResearched && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(50,205,50,0.2)', color: '#32CD32' }}>已研究</span>}
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: '#888' }}>
                          {tech.description}
                        </p>
                      </div>
                    </div>
                    {!isResearched && !isResearching && (
                      <button
                        onClick={() => canResearch && startResearch(tech.id)}
                        disabled={!canResearch}
                        className="px-3 py-1 rounded text-xs font-bold transition-all active:scale-95"
                        style={{
                          background: canResearch ? 'rgba(65,105,225,0.3)' : 'rgba(128,128,128,0.2)',
                          color: canResearch ? '#6495ED' : '#666',
                          cursor: canResearch ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {currentResearch ? '研究中...' : '研究'}
                      </button>
                    )}
                  </div>

                  {/* Research progress bar */}
                  {isResearching && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${progress}%`,
                            background: 'linear-gradient(to right, #4169E1, #00BFFF)',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlocked buildings */}
                  {isResearched && unlockedFromTech.length > 0 && (
                    <div className="mt-2 pt-2" style={{ borderTop: '1px dashed rgba(50,205,50,0.2)' }}>
                      <span className="text-[10px]" style={{ color: '#32CD32' }}>
                        解锁建筑: {unlockedFromTech.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Cost */}
                  {!isResearched && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: '#666' }}>
                        研究周期: {tech.researchCost}天
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Research bonus info */}
        <div className="px-4 py-3" style={{
          borderTop: '1px solid rgba(218,165,32,0.1)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div className="flex items-center justify-between text-[10px]" style={{ color: '#666' }}>
            <span>💡 建造大学可加速研究速度</span>
            <span>已研究: {researchedTechs.length}/{techs.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import BUILDING_UNLOCKS
import { BUILDING_UNLOCKS } from '@/game/constants';
