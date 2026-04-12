'use client';

import React from 'react';
import { useGameStore } from '@/game/store';
import { Resources } from '@/game/types';

export default function TraderPanel() {
  const {
    showTraderPanel,
    setShowTraderPanel,
    currentTrader,
    dismissTrader,
    executeTraderTrade,
    resources,
    currentSeason,
  } = useGameStore();

  if (!showTraderPanel || !currentTrader) return null;

  // Season price modifier
  const seasonMod = currentSeason === 'winter' ? 1.2 : currentSeason === 'summer' ? 0.9 : 1;

  // Resource emoji mapping
  const resourceEmoji: Record<string, string> = {
    food: '🍞',
    wood: '🪵',
    stone: '🪨',
    pottery: '🏺',
    gold: '💰',
    wheat: '🌾',
    flour: '🌾',
    bread: '🥖',
    clay: '🟤',
    iron: '⚙️',
    tools: '🔧',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={() => {
        // 只关闭面板，保留商队（玩家可以再次点击图标打开）
        setShowTraderPanel(false);
      }}
    >
      <div 
        className="w-full max-w-md overflow-hidden rounded-lg"
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
            <span className="text-2xl">{currentTrader.emoji}</span>
            <div>
              <div className="font-bold" style={{ color: '#FFD700' }}>{currentTrader.name}</div>
              <div className="text-[10px]" style={{ color: '#888' }}>
                停留时间: {currentTrader.departureTick - useGameStore.getState().tickCount}天
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              // 只关闭面板，保留商队（玩家可以再次点击图标打开）
              setShowTraderPanel(false);
            }}
            className="text-lg hover:opacity-70 transition-opacity"
            style={{ color: '#888' }}
          >
            ✕
          </button>
        </div>

        {/* Trader mood */}
        <div className="px-4 py-2" style={{
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#888' }}>
            <span>
              {currentTrader.mood === 'friendly' ? '😊 态度友好' : 
               currentTrader.mood === 'hostile' ? '😠 态度冷淡' : '😐 态度中立'}
            </span>
            {currentSeason === 'winter' && (
              <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(70,130,180,0.2)', color: '#87CEEB' }}>
                ❄️ 冬季涨价
              </span>
            )}
          </div>
        </div>

        {/* Available goods */}
        <div className="p-4">
          <div className="text-sm font-bold mb-3" style={{ color: '#ccc' }}>
            可交易货物
          </div>
          <div className="grid gap-2">
            {currentTrader.goods.map(offer => {
              if (offer.quantity <= 0) return null;

              const canGive = (resources[offer.giveResource as keyof Resources] || 0) >= offer.giveAmount;
              const modGive = Math.floor(offer.giveAmount * seasonMod);
              const modReceive = Math.floor(offer.receiveAmount * seasonMod);

              return (
                <div
                  key={offer.id}
                  className="p-3 rounded-lg transition-all"
                  style={{
                    background: canGive ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    opacity: canGive ? 1 : 0.5,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Give */}
                      <div className="flex items-center gap-1 text-xs">
                        <span>{resourceEmoji[offer.giveResource] || '❓'}</span>
                        <span style={{ color: '#888' }}>-</span>
                        <span className="font-bold" style={{ color: '#ef4444' }}>{modGive}</span>
                      </div>
                      <span style={{ color: '#666' }}>→</span>
                      {/* Receive */}
                      <div className="flex items-center gap-1 text-xs">
                        <span>{resourceEmoji[offer.receiveResource] || '❓'}</span>
                        <span style={{ color: '#888' }}>+</span>
                        <span className="font-bold" style={{ color: '#32CD32' }}>{modReceive}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: '#666' }}>
                        剩余: {offer.quantity}
                      </span>
                      <button
                        onClick={() => executeTraderTrade(offer.id)}
                        disabled={!canGive || offer.quantity <= 0}
                        className="px-3 py-1 rounded text-xs font-bold transition-all active:scale-95"
                        style={{
                          background: canGive && offer.quantity > 0 
                            ? 'rgba(50,205,50,0.2)' 
                            : 'rgba(128,128,128,0.2)',
                          color: canGive && offer.quantity > 0 ? '#32CD32' : '#666',
                          cursor: canGive && offer.quantity > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        交易
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current resources */}
        <div className="px-4 py-3" style={{
          borderTop: '1px solid rgba(218,165,32,0.1)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div className="text-[10px] mb-2" style={{ color: '#666' }}>你的资源</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(resources).map(([key, value]) => (
              <div 
                key={key}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span>{resourceEmoji[key] || '❓'}</span>
                <span style={{ color: '#aaa' }}>{Math.floor(value as number)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dismiss button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              dismissTrader();
              setShowTraderPanel(false);
            }}
            className="w-full py-2 rounded text-sm font-bold transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#888',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            送别商队
          </button>
        </div>
      </div>
    </div>
  );
}
