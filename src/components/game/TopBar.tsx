'use client';

import React from 'react';
import { useGameStore } from '@/game/store';
import { openEventLog } from './EventLog';
import { toast } from 'sonner';

export default function TopBar() {
  const { currentRank, setShowStatsPanel, notifications, saveGame, setShowStartScreen, isRunning, currentSaveSlot, getCurrentSlotInfo, currentTrader, tickCount, setShowTraderPanel } = useGameStore();

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentSlotInfo = getCurrentSlotInfo();

  // 计算商队剩余停留时间
  const traderRemainingDays = currentTrader ? Math.max(0, currentTrader.departureTick - tickCount) : 0;

  // 保存游戏
  const handleSave = () => {
    saveGame();
    const slotName = currentSaveSlot ? `存档${currentSaveSlot}` : '新存档';
    toast.success(`💾 已保存至 ${slotName}`, {
      duration: 2000,
      style: {
        background: 'linear-gradient(to bottom, #2a1500, #1a0a00)',
        color: '#FFD700',
        border: '1px solid rgba(218,165,32,0.4)',
      },
    });
  };

  // 返回主界面
  const handleReturnToMain = () => {
    if (isRunning) {
      if (confirm('返回主界面？当前进度会自动保存。')) {
        saveGame();
        setShowStartScreen(true);
      }
    } else {
      setShowStartScreen(true);
    }
  };

  // 退出游戏
  const handleExit = () => {
    if (confirm('确定退出游戏？')) {
      saveGame();
      // 尝试关闭页面
      try {
        window.close();
        // 如果无法关闭，显示提示
        setTimeout(() => {
          toast.info('🚪 请手动关闭此页面', {
            duration: 3000,
            style: {
              background: 'linear-gradient(to bottom, #2a1500, #1a0a00)',
              color: '#DAA520',
              border: '1px solid rgba(218,165,32,0.4)',
            },
          });
        }, 500);
      } catch (e) {
        toast.info('🚪 请手动关闭此页面', {
          duration: 3000,
          style: {
            background: 'linear-gradient(to bottom, #2a1500, #1a0a00)',
            color: '#DAA520',
            border: '1px solid rgba(218,165,32,0.4)',
          },
        });
      }
    }
  };

  return (
    <div
      className="flex items-center justify-between px-3 shrink-0"
      style={{
        paddingTop: 'env(safe-area-inset-top, 12px)',
        paddingBottom: '8px',
        background: 'linear-gradient(to bottom, #2a1500, #1a0a00)',
        borderBottom: '1px solid rgba(218,165,32,0.3)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">👑</span>
        <div className="flex flex-col">
          <span
            className="text-base font-bold tracking-wide leading-tight"
            style={{
              color: '#FFD700',
              fontFamily: 'serif',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            傻子大帝
          </span>
          {currentSaveSlot && (
            <span
              className="text-[10px] leading-tight"
              style={{ color: '#B8860B' }}
            >
              📜 存档{currentSaveSlot}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Victory rank badge */}
        <div
          className="px-2 py-0.5 rounded-full text-xs font-bold hidden sm:block"
          style={{
            background: 'rgba(218,165,32,0.2)',
            color: '#FFD700',
            border: '1px solid rgba(218,165,32,0.4)',
          }}
        >
          🏆 {currentRank}
        </div>

        {/* Notification bell */}
        <button
          onClick={openEventLog}
          className="relative p-1.5 rounded transition-colors active:scale-90"
          style={{ color: '#DAA520' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                background: '#ef4444',
                color: '#fff',
                padding: '0 3px',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Trader notification - 显示商队到达提示 */}
        {currentTrader && (
          <button
            onClick={() => setShowTraderPanel(true)}
            className="relative p-1.5 rounded transition-all active:scale-90 animate-pulse"
            style={{
              color: '#FFD700',
              background: 'linear-gradient(135deg, rgba(218,165,32,0.3), rgba(184,134,11,0.2))',
              border: '1px solid rgba(218,165,32,0.5)',
              boxShadow: '0 0 10px rgba(218,165,32,0.3)',
            }}
            title={`${currentTrader.emoji} ${currentTrader.name} - 点击交易`}
          >
            <span className="text-lg">{currentTrader.emoji}</span>
            <span
              className="absolute -bottom-0.5 -right-0.5 min-w-[16px] h-3.5 flex items-center justify-center rounded-full text-[9px] font-bold px-0.5"
              style={{
                background: '#B8860B',
                color: '#fff',
              }}
            >
              {traderRemainingDays > 0 ? `${traderRemainingDays}天` : '!'}
            </span>
          </button>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          className="p-1.5 rounded transition-colors active:scale-90"
          style={{ color: '#DAA520' }}
          title={currentSaveSlot ? `保存到存档${currentSaveSlot}` : '保存游戏'}
        >
          <span className="text-base">💾</span>
        </button>

        {/* Return to main menu button */}
        <button
          onClick={handleReturnToMain}
          className="p-1.5 rounded transition-colors active:scale-90"
          style={{ color: '#DAA520' }}
          title="返回主界面"
        >
          <span className="text-base">🏠</span>
        </button>

        {/* Exit button */}
        <button
          onClick={handleExit}
          className="p-1.5 rounded transition-colors active:scale-90"
          style={{ color: '#DAA520' }}
          title="退出游戏"
        >
          <span className="text-base">🚪</span>
        </button>

        {/* Stats button */}
        <button
          onClick={() => setShowStatsPanel(true)}
          className="p-1.5 rounded transition-colors active:scale-90"
          style={{ color: '#DAA520' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
