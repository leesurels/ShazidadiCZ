'use client';

import React from 'react';
import { useGameStore } from '@/game/store';
import { GameEventType, Season } from '@/game/types';
import { SEASON_EFFECTS, SEASON_LENGTH } from '@/game/constants';

const ACTIVE_EVENT_DISPLAY: Record<string, { emoji: string; label: string; bgColor: string }> = {
  [GameEventType.PLAGUE]: { emoji: '😷', label: '瘟疫', bgColor: 'rgba(139,69,19,0.3)' },
  [GameEventType.BARBARIAN]: { emoji: '⚔️', label: '蛮族入侵', bgColor: 'rgba(139,0,0,0.3)' },
  [GameEventType.FIRE]: { emoji: '🔥', label: '火灾', bgColor: 'rgba(255,69,0,0.3)' },
  [GameEventType.EARTHQUAKE]: { emoji: '💥', label: '地震', bgColor: 'rgba(128,128,128,0.3)' },
  [GameEventType.BLIZZARD]: { emoji: '🌨️', label: '暴风雪', bgColor: 'rgba(70,130,180,0.3)' },
  [GameEventType.DROUGHT]: { emoji: '☀️', label: '干旱', bgColor: 'rgba(255,165,0,0.3)' },
};

export default function InfoBar() {
  const {
    population, maxPopulation, happiness, gameSpeed, togglePause,
    activeEvents, currentSeason, daysInSeason, year,
    winterWarning, resources, eventForecasts, unlockedBuildings,
    setShowEventForecast, setShowTechPanel, currentResearch,
    researchProgress, researchedTechs, setShowStatsPanel
  } = useGameStore();

  const speedEmoji = ['⏸️', '▶️', '▶▶', '▶▶▶'][gameSpeed] ?? '▶️';
  const speedLabel = ['暂停', '1x', '2x', '3x'][gameSpeed] ?? '1x';

  const happinessEmoji = happiness >= 70 ? '😊' : happiness >= 40 ? '😐' : '😟';

  // Display active bad events
  const displayEvents = activeEvents.filter(e => ACTIVE_EVENT_DISPLAY[e.type]);

  // Season info
  const seasonInfo = SEASON_EFFECTS[currentSeason];
  const daysRemaining = SEASON_LENGTH - daysInSeason;

  // Active forecasts
  const activeForecasts = eventForecasts.filter(f => f.isActive);

  return (
    <div
      className="shrink-0"
      style={{
        background: 'linear-gradient(to bottom, #1a0a00, #0a0500)',
        borderTop: '1px solid rgba(218,165,32,0.2)',
        paddingBottom: 'env(safe-area-inset-bottom, 4px)',
      }}
    >
      {/* Active event indicator */}
      {displayEvents.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-1" style={{
          background: 'rgba(255,50,50,0.15)',
          borderBottom: '1px solid rgba(255,50,50,0.2)',
        }}>
          {displayEvents.map((evt, i) => {
            const display = ACTIVE_EVENT_DISPLAY[evt.type];
            return (
              <span key={`active-event-${i}`} className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ 
                color: '#ef4444',
                background: display.bgColor,
              }}>
                {display.emoji} {display.label}
                {evt.remainingTicks !== undefined && evt.remainingTicks > 0 && (
                  <span style={{ color: '#999' }}> ({evt.remainingTicks}天)</span>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Winter warning */}
      {winterWarning && currentSeason === Season.WINTER && (
        <div className="flex items-center justify-center gap-2 py-1 px-3" style={{
          background: 'rgba(70,130,180,0.2)',
          borderBottom: '1px solid rgba(70,130,180,0.3)',
        }}>
          <span className="text-xs">⚠️</span>
          <span className="text-xs font-bold" style={{ color: '#87CEEB' }}>
            冬季即将来临！剩余{daysRemaining}天，请储备食物！
          </span>
        </div>
      )}

      {/* Season and Year */}
      <div className="flex items-center justify-center gap-3 py-1 px-3" style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(218,165,32,0.1)',
      }}>
        <button
          onClick={() => setShowStatsPanel(true)}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <span className="text-sm">{seasonInfo.emoji}</span>
          <span className="text-xs font-medium" style={{ color: '#aaa' }}>
            {seasonInfo.description}
          </span>
        </button>
        <span className="text-xs" style={{ color: '#666' }}>|</span>
        <span className="text-xs" style={{ color: '#888' }}>
          第{year}年 · 第{daysInSeason + 1}天
        </span>
        <span className="text-xs" style={{ color: '#666' }}>|</span>
        <span className="text-xs" style={{ color: '#888' }}>
          剩余{daysRemaining}天
        </span>
      </div>

      <div className="flex items-center justify-between px-3 py-2">
        {/* Population */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">👥</span>
          <span className="text-xs font-bold" style={{ color: '#FFD700' }}>
            {population}
          </span>
          <span className="text-xs" style={{ color: '#888' }}>/</span>
          <span className="text-xs" style={{ color: '#aaa' }}>
            {maxPopulation}
          </span>
        </div>

        {/* Happiness */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{happinessEmoji}</span>
          <span className="text-xs font-bold" style={{ color: '#FFD700' }}>
            {happiness}%
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1">
          {/* Event Forecast */}
          <button
            onClick={() => setShowEventForecast(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded transition-all active:scale-90"
            style={{
              background: activeForecasts.length > 0 ? 'rgba(255,165,0,0.2)' : 'rgba(255,255,255,0.05)',
              border: activeForecasts.length > 0 ? '1px solid rgba(255,165,0,0.3)' : '1px solid rgba(255,255,255,0.1)',
            }}
            title="事件预测"
          >
            <span className="text-xs">📊</span>
            {activeForecasts.length > 0 && (
              <span className="text-[10px] font-bold" style={{ color: '#FFA500' }}>
                {activeForecasts.length}
              </span>
            )}
          </button>

          {/* Tech Panel */}
          <button
            onClick={() => setShowTechPanel(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded transition-all active:scale-90"
            style={{
              background: currentResearch || researchedTechs.length > 0 ? 'rgba(65,105,225,0.2)' : 'rgba(255,255,255,0.05)',
              border: currentResearch || researchedTechs.length > 0 ? '1px solid rgba(65,105,225,0.3)' : '1px solid rgba(255,255,255,0.1)',
            }}
            title="科技研究"
          >
            <span className="text-xs">🔬</span>
            {currentResearch && (
              <span className="text-[10px] font-bold" style={{ color: '#4169E1' }}>
                {researchedTechs.length + 1}/{Object.keys(unlockedBuildings).length}
              </span>
            )}
          </button>

          {/* Speed control */}
          <button
            onClick={togglePause}
            className="flex items-center gap-1 px-2 py-0.5 rounded transition-all active:scale-90"
            style={{
              background: 'rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-sm">{speedEmoji}</span>
            <span className="text-xs" style={{ color: '#ccc' }}>
              {speedLabel}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
