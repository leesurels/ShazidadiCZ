'use client';

import React from 'react';
import { useGameStore } from '@/game/store';
import { Season } from '@/game/types';

const SEASON_NAMES: Record<Season, string> = {
  [Season.SPRING]: '春',
  [Season.SUMMER]: '夏',
  [Season.AUTUMN]: '秋',
  [Season.WINTER]: '冬',
};

const SEASON_EMOJI: Record<Season, string> = {
  [Season.SPRING]: '🌸',
  [Season.SUMMER]: '☀️',
  [Season.AUTUMN]: '🍂',
  [Season.WINTER]: '❄️',
};

function formatDate(timestamp: number): string {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPlayTime(ticks: number): string {
  if (!ticks) return '-';
  const days = Math.floor(ticks / 2);
  const hours = Math.floor(days / 24);
  const remainingDays = days % 24;
  if (hours > 0) {
    return `${hours}小时${remainingDays}分钟`;
  }
  return `${days}天`;
}

interface SaveSlotCardProps {
  slotId: number;
  name: string;
  timestamp: number;
  population: number;
  year: number;
  season: Season;
  currentRank: string;
  playTime: number;
  isEmpty: boolean;
  onLoad: () => void;
  onDelete: () => void;
}

function SaveSlotCard({
  slotId,
  name,
  timestamp,
  population,
  year,
  season,
  currentRank,
  playTime,
  isEmpty,
  onLoad,
  onDelete,
}: SaveSlotCardProps) {
  return (
    <div
      className="w-full rounded-lg overflow-hidden transition-all"
      style={{
        background: isEmpty
          ? 'linear-gradient(to bottom, rgba(100, 80, 50, 0.3), rgba(60, 50, 30, 0.3))'
          : 'linear-gradient(to bottom, rgba(180, 130, 60, 0.4), rgba(120, 80, 40, 0.4))',
        border: `2px solid ${isEmpty ? 'rgba(218, 165, 32, 0.3)' : 'rgba(218, 165, 32, 0.6)'}`,
        boxShadow: isEmpty
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(218, 165, 32, 0.2)',
      }}
    >
      {/* Slot Header */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{
          background: isEmpty
            ? 'rgba(80, 60, 40, 0.5)'
            : 'rgba(180, 130, 60, 0.3)',
          borderBottom: '1px solid rgba(218, 165, 32, 0.2)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <span className="text-base font-bold" style={{ color: '#FFD700' }}>
            {name}
          </span>
        </div>
        {isEmpty && (
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(100, 100, 100, 0.5)', color: '#aaa' }}>
            空
          </span>
        )}
        {!isEmpty && (
          <span className="text-sm" style={{ color: '#DAA520' }}>
            {currentRank}
          </span>
        )}
      </div>

      {/* Slot Content */}
      <div className="px-4 py-3">
        {isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-2xl">✨</span>
            <p className="text-sm" style={{ color: '#B8860B' }}>
              点击上方「新建游戏」开始
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Year and Season */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#B8860B' }}>
                👥 人口: <span className="font-bold" style={{ color: '#FFD700' }}>{population}</span>
              </span>
              <span className="text-sm" style={{ color: '#888' }}>
                📅 {year > 0 ? `${year}${SEASON_NAMES[season]}${SEASON_EMOJI[season]}` : '-'}
              </span>
            </div>

            {/* Save Time and Play Time */}
            <div className="flex items-center justify-between text-xs" style={{ color: '#888' }}>
              <span>💾 保存: {formatDate(timestamp)}</span>
              <span>⏱️ 时长: {formatPlayTime(playTime)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={onLoad}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(to bottom, #DAA520, #B8860B)',
                  color: '#1a0a00',
                  border: '2px solid #FFD700',
                }}
              >
                📂 读取存档
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-2 rounded-lg text-sm transition-all active:scale-95"
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Slot Selection Modal for New Game =====
interface SlotSelectionModalProps {
  slots: ReturnType<typeof useGameStore.getState>['getSaveSlots'];
  onSelect: (slotId: number) => void;
  onClose: () => void;
}

function SlotSelectionModal({ slots, onSelect, onClose }: SlotSelectionModalProps) {
  const [selectedSlot, setSelectedSlot] = React.useState<number | null>(
    slots.find(s => s.timestamp === 0)?.id || slots[0]?.id || null
  );
  const hasEmptySlot = slots.some(s => s.timestamp === 0);

  const handleConfirm = () => {
    if (selectedSlot !== null) {
      onSelect(selectedSlot);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div
        className="mx-4 p-6 rounded-lg w-full max-w-sm"
        style={{
          background: 'linear-gradient(to bottom, #2a1500, #1a0a00)',
          border: '2px solid rgba(218, 165, 32, 0.6)',
          boxShadow: '0 0 30px rgba(218, 165, 32, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl">✨</span>
          <h3 className="text-lg font-bold" style={{ color: '#FFD700' }}>
            {hasEmptySlot ? '选择存档位保存新游戏' : '选择要覆盖的存档位'}
          </h3>
        </div>

        {/* Slot Options */}
        <div className="flex flex-col gap-2 mb-6">
          {slots.map((slot) => {
            const isEmpty = slot.timestamp === 0;
            const isSelected = selectedSlot === slot.id;

            return (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  isSelected ? 'ring-2 ring-yellow-400' : ''
                }`}
                style={{
                  background: isSelected
                    ? 'rgba(218, 165, 32, 0.3)'
                    : isEmpty
                      ? 'rgba(80, 60, 40, 0.4)'
                      : 'rgba(60, 40, 20, 0.4)',
                  border: `2px solid ${isSelected ? '#FFD700' : isEmpty ? 'rgba(218, 165, 32, 0.3)' : 'rgba(218, 165, 32, 0.5)'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Radio indicator */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isSelected ? '#FFD700' : 'transparent',
                      border: `2px solid ${isSelected ? '#FFD700' : '#888'}`,
                    }}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#1a0a00]" />}
                  </div>

                  {/* Slot info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: '#FFD700' }}>
                        📜 {slot.name}
                      </span>
                      {isEmpty && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(100, 100, 100, 0.5)', color: '#aaa' }}>
                          空
                        </span>
                      )}
                    </div>
                    {isEmpty ? (
                      <p className="text-xs mt-1" style={{ color: '#888' }}>
                        空的存档位
                      </p>
                    ) : (
                      <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: '#B8860B' }}>
                        <span>{slot.currentRank}</span>
                        <span>👥 {slot.population}</span>
                        <span>📅 {slot.year}{SEASON_NAMES[slot.season]}</span>
                      </div>
                    )}
                  </div>

                  {/* Warning for overwriting */}
                  {!isEmpty && isSelected && (
                    <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                      将覆盖
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95"
            style={{
              background: 'linear-gradient(to bottom, #555, #333)',
              color: '#FFD700',
              border: '1px solid #666',
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95"
            style={{
              background: 'linear-gradient(to bottom, #DAA520, #B8860B)',
              color: '#1a0a00',
              border: '2px solid #FFD700',
            }}
          >
            ✨ 确定开始
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StartScreen() {
  const { loadFromSlot, deleteSlot, startNewGame, getSaveSlots } = useGameStore();
  const [slots, setSlots] = React.useState<ReturnType<typeof getSaveSlots>>([]);
  const [showSlotSelection, setShowSlotSelection] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null);

  // Load save slots on mount and when returning to start screen
  React.useEffect(() => {
    setSlots(getSaveSlots());
  }, [getSaveSlots]);

  const handleLoad = (slotId: number) => {
    const success = loadFromSlot(slotId);
    if (!success) {
      alert('加载存档失败！存档可能已损坏。');
    }
  };

  const handleDelete = (slotId: number) => {
    setDeleteConfirm(slotId);
  };

  const confirmDelete = () => {
    if (deleteConfirm !== null) {
      deleteSlot(deleteConfirm);
      setSlots(getSaveSlots());
      setDeleteConfirm(null);
    }
  };

  const handleNewGame = () => {
    setShowSlotSelection(true);
  };

  const handleSlotSelect = (slotId: number) => {
    setShowSlotSelection(false);
    startNewGame(slotId);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#1a0a00] via-[#2a1500] to-[#0a0500]">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,215,0,0.1) 35px, rgba(255,215,0,0.1) 36px)',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-sm">
        {/* Title */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-6xl sm:text-7xl">👑</div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-wider"
            style={{
              color: '#FFD700',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(255,215,0,0.3)',
              fontFamily: 'serif',
            }}
          >
            傻子大帝
          </h1>
          <p
            className="text-base sm:text-lg tracking-widest"
            style={{
              color: '#DAA520',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            建造你的罗马帝国
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-3">
          <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#DAA520]" />
          <span className="text-xl">🏛️</span>
          <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#DAA520]" />
        </div>

        {/* New Game Button */}
        <button
          onClick={handleNewGame}
          className="w-full py-3 px-6 rounded-lg font-bold text-lg transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(to bottom, #DAA520, #B8860B)',
            color: '#1a0a00',
            border: '3px solid #FFD700',
            boxShadow: '0 4px 15px rgba(218, 165, 32, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          ✨ 新建游戏
        </button>

        {/* Save Slots */}
        <div className="flex flex-col gap-3 w-full">
          {slots.map((slot) => (
            <SaveSlotCard
              key={slot.id}
              slotId={slot.id}
              name={slot.name}
              timestamp={slot.timestamp}
              population={slot.population}
              year={slot.year}
              season={slot.season}
              currentRank={slot.currentRank}
              playTime={slot.playTime}
              isEmpty={slot.timestamp === 0}
              onLoad={() => handleLoad(slot.id)}
              onDelete={() => handleDelete(slot.id)}
            />
          ))}
        </div>

        {/* Slot Selection Modal */}
        {showSlotSelection && (
          <SlotSelectionModal
            slots={slots}
            onSelect={handleSlotSelect}
            onClose={() => setShowSlotSelection(false)}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm !== null && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70">
            <div
              className="mx-4 p-6 rounded-lg w-full max-w-xs"
              style={{
                background: 'linear-gradient(to bottom, #2a1500, #1a0a00)',
                border: '2px solid rgba(239, 68, 68, 0.5)',
              }}
            >
              <h3 className="text-lg font-bold mb-4 text-center" style={{ color: '#ef4444' }}>
                ⚠️ 删除存档
              </h3>
              <p className="text-sm mb-6 text-center" style={{ color: '#DAA520' }}>
                确定要删除「存档{deleteConfirm}」吗？<br />
                此操作无法撤销！
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(to bottom, #dc2626, #b91c1c)',
                    color: '#fff',
                    border: '1px solid #ef4444',
                  }}
                >
                  🗑️ 删除
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(to bottom, #555, #333)',
                    color: '#FFD700',
                    border: '1px solid #666',
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-2">
          触屏拖动移动地图 · 双指缩放 · 点击建造
        </p>
        <p className="text-xs text-gray-600">
          60x60 俯瞰视角 · 注意随机事件！
        </p>
      </div>
    </div>
  );
}
