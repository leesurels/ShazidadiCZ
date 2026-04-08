'use client';

import React from 'react';
import { useGameStore } from '@/game/store';
import { EVENT_DEFS, EVENT_PREPARATION, SEASON_EFFECTS } from '@/game/constants';
import { GameEventType } from '@/game/types';

export default function EventForecastPanel() {
  const {
    showEventForecast,
    setShowEventForecast,
    eventForecasts,
    tickCount,
    currentSeason,
  } = useGameStore();

  if (!showEventForecast) return null;

  const activeForecasts = eventForecasts.filter(f => f.isActive);

  // Severity colors
  const severityColors = {
    minor: { bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)', text: '#FFD700' },
    major: { bg: 'rgba(255,165,0,0.1)', border: 'rgba(255,165,0,0.3)', text: '#FFA500' },
    catastrophic: { bg: 'rgba(255,0,0,0.1)', border: 'rgba(255,0,0,0.3)', text: '#FF4444' },
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={() => setShowEventForecast(false)}
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
            <span className="text-lg">📊</span>
            <span className="font-bold" style={{ color: '#FFD700' }}>事件预测</span>
          </div>
          <button
            onClick={() => setShowEventForecast(false)}
            className="text-lg hover:opacity-70 transition-opacity"
            style={{ color: '#888' }}
          >
            ✕
          </button>
        </div>

        {/* Current season */}
        <div className="px-4 py-2" style={{
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#888' }}>
            <span>{SEASON_EFFECTS[currentSeason].emoji}</span>
            <span>{SEASON_EFFECTS[currentSeason].description}</span>
          </div>
        </div>

        {/* Active forecasts */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {activeForecasts.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">🔮</span>
              <p className="mt-2 text-sm" style={{ color: '#888' }}>
                目前没有预测到任何事件
              </p>
              <p className="mt-1 text-xs" style={{ color: '#666' }}>
                继续保持警惕，城市发展越快，事件越频繁
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {activeForecasts.map(forecast => {
                const eventDef = EVENT_DEFS.find(e => e.type === forecast.eventType);
                if (!eventDef) return null;
                
                const colors = severityColors[forecast.severity];
                const daysUntil = forecast.predictedTick - tickCount;
                const prep = EVENT_PREPARATION[forecast.eventType];

                return (
                  <div
                    key={forecast.id}
                    className="p-3 rounded-lg"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{eventDef.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm" style={{ color: colors.text }}>
                              {eventDef.title}
                            </span>
                            <span 
                              className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                              style={{ 
                                background: colors.bg,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                              }}
                            >
                              {forecast.severity === 'minor' ? '轻微' : forecast.severity === 'major' ? '严重' : '灾难'}
                            </span>
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: '#888' }}>
                            预计 {daysUntil > 0 ? `${daysUntil}天后` : '即将到来'} 发生
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Preparation score */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px]" style={{ color: '#888' }}>
                          📋 准备度
                        </span>
                        <span 
                          className="text-[10px] font-bold"
                          style={{ color: forecast.preparationScore >= 70 ? '#32CD32' : forecast.preparationScore >= 40 ? '#FFA500' : '#FF4444' }}
                        >
                          {Math.floor(forecast.preparationScore)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${forecast.preparationScore}%`,
                            background: forecast.preparationScore >= 70 
                              ? 'linear-gradient(to right, #32CD32, #90EE90)'
                              : forecast.preparationScore >= 40
                                ? 'linear-gradient(to right, #FFA500, #FFD700)'
                                : 'linear-gradient(to right, #FF4444, #FF6B6B)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Warnings */}
                    {forecast.warnings.length > 0 && (
                      <div className="mt-2 pt-2" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                        <div className="flex flex-wrap gap-1">
                          {forecast.warnings.map((warning, i) => (
                            <span 
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{ 
                                background: 'rgba(255,255,255,0.05)',
                                color: '#aaa',
                              }}
                            >
                              ⚠️ {warning}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preparation tips */}
                    {prep && (
                      <div className="mt-2 text-[10px]" style={{ color: '#666' }}>
                        💡 {prep.description} 可提高准备度
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="px-4 py-3" style={{
          borderTop: '1px solid rgba(218,165,32,0.1)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div className="flex items-center justify-between text-[10px]" style={{ color: '#666' }}>
            <span>💡 准备度达到100%可将灾害转为收益</span>
            <span>预警中: {activeForecasts.length}个</span>
          </div>
        </div>
      </div>
    </div>
  );
}
