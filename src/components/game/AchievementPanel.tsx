'use client';

import React from 'react';
import { useGameStore } from '@/game/store';
import { ACHIEVEMENT_DEFS } from '@/game/constants';

export default function AchievementPanel() {
  const {
    showAchievementPanel,
    setShowAchievementPanel,
    achievements,
    unlockedAchievements,
    totalResourcesProduced,
    peakPopulation,
    researchedTechs,
    disastersSurvived,
    tickCount,
  } = useGameStore();

  if (!showAchievementPanel) return null;

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={() => setShowAchievementPanel(false)}
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
            <span className="text-lg">🏆</span>
            <span className="font-bold" style={{ color: '#FFD700' }}>成就系统</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ 
              background: 'rgba(255,215,0,0.2)', 
              color: '#FFD700' 
            }}>
              {unlockedCount}/{totalCount}
            </span>
          </div>
          <button
            onClick={() => setShowAchievementPanel(false)}
            className="text-lg hover:opacity-70 transition-opacity"
            style={{ color: '#888' }}
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-2" style={{
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${(unlockedCount / totalCount) * 100}%`,
                background: 'linear-gradient(to right, #FFD700, #FFA500)',
              }}
            />
          </div>
        </div>

        {/* Achievement list */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          <div className="grid gap-3">
            {achievements.map(achievement => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              
              // Get progress for this achievement
              let progress = 0;
              let progressText = '';
              
              switch (achievement.condition.type) {
                case 'resource_total':
                  const resourceTotal = totalResourcesProduced[achievement.condition.resource as keyof typeof totalResourcesProduced] || 0;
                  const target = achievement.condition.target || 0;
                  progress = Math.min(100, (resourceTotal / target) * 100);
                  progressText = `${Math.floor(resourceTotal)}/${target}`;
                  break;
                case 'population_peak':
                  progress = Math.min(100, (peakPopulation / (achievement.condition.target || 1)) * 100);
                  progressText = `${peakPopulation}/${achievement.condition.target}`;
                  break;
                case 'survival':
                  progress = Math.min(100, (disastersSurvived / (achievement.condition.target || 1)) * 100);
                  progressText = `${disastersSurvived}/${achievement.condition.target}`;
                  break;
                case 'tech_count':
                  progress = Math.min(100, (researchedTechs.length / (achievement.condition.target || 1)) * 100);
                  progressText = `${researchedTechs.length}/${achievement.condition.target}`;
                  break;
                case 'custom':
                  // First year - time based
                  progress = Math.min(100, (tickCount / (achievement.condition.target || 120)) * 100);
                  progressText = `${tickCount}/${achievement.condition.target}`;
                  break;
              }

              return (
                <div
                  key={achievement.id}
                  className="p-3 rounded-lg transition-all"
                  style={{
                    background: isUnlocked 
                      ? 'rgba(255,215,0,0.1)'
                      : 'rgba(255,255,255,0.03)',
                    border: isUnlocked
                      ? '1px solid rgba(255,215,0,0.3)'
                      : '1px solid rgba(255,255,255,0.1)',
                    opacity: isUnlocked ? 1 : (progress > 0 ? 0.8 : 0.5),
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Emoji */}
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{
                        background: isUnlocked 
                          ? 'rgba(255,215,0,0.2)' 
                          : 'rgba(128,128,128,0.2)',
                      }}
                    >
                      {isUnlocked ? achievement.emoji : '🔒'}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-bold text-sm"
                          style={{ color: isUnlocked ? '#FFD700' : '#888' }}
                        >
                          {achievement.name}
                        </span>
                        {isUnlocked && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ 
                            background: 'rgba(50,205,50,0.2)', 
                            color: '#32CD32' 
                          }}>
                            已解锁
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5" style={{ color: '#888' }}>
                        {achievement.description}
                      </p>

                      {/* Progress bar */}
                      {!isUnlocked && progress > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px]" style={{ color: '#666' }}>进度</span>
                            <span className="text-[10px] font-bold" style={{ color: '#FFA500' }}>
                              {progressText} ({Math.floor(progress)}%)
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${progress}%`,
                                background: 'linear-gradient(to right, #FFA500, #FFD700)',
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats summary */}
        <div className="px-4 py-3" style={{
          borderTop: '1px solid rgba(218,165,32,0.1)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold" style={{ color: '#FFD700' }}>{peakPopulation}</div>
              <div className="text-[10px]" style={{ color: '#666' }}>历史最高人口</div>
            </div>
            <div>
              <div className="text-lg font-bold" style={{ color: '#32CD32' }}>{researchedTechs.length}</div>
              <div className="text-[10px]" style={{ color: '#666' }}>已研究科技</div>
            </div>
            <div>
              <div className="text-lg font-bold" style={{ color: '#FF6B6B' }}>{disastersSurvived}</div>
              <div className="text-[10px]" style={{ color: '#666' }}>经历灾难</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
