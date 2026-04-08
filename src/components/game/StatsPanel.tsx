'use client';

import React from 'react';
import { useGameStore } from '@/game/store';
import { BUILDING_DEFS, VICTORY_TIERS, SEASON_EFFECTS, SEASON_LENGTH, TECH_DEFS } from '@/game/constants';
import { Season } from '@/game/types';

export default function StatsPanel() {
  const {
    showStatsPanel,
    setShowStatsPanel,
    population,
    maxPopulation,
    happiness,
    resources,
    tickCount,
    currentRank,
    storageCapacity,
    getProductionRates,
    getBuildingCounts,
    currentSeason,
    daysInSeason,
    year,
    researchedTechs,
    currentResearch,
    researchProgress,
    unlockedBuildings,
    buildingsDestroyed,
    disastersSurvived,
  } = useGameStore();

  if (!showStatsPanel) return null;

  const rates = getProductionRates();
  const buildingCounts = getBuildingCounts();
  const totalBuildings = Object.values(buildingCounts).reduce((a, b) => a + b, 0);
  const gameTime = tickCount;
  const seasonInfo = SEASON_EFFECTS[currentSeason];

  // Format time
  const days = Math.floor(gameTime / SEASON_LENGTH);
  const hours = Math.floor((gameTime % SEASON_LENGTH) * (24 / SEASON_LENGTH));
  const timeStr = `${days}天${hours}时`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      onClick={() => setShowStatsPanel(false)}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-t-2xl p-4 pb-6 max-h-[85vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(to bottom, #2a1500, #1a0a00)',
          borderTop: '2px solid rgba(218,165,32,0.4)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-bold"
            style={{ color: '#FFD700', fontFamily: 'serif' }}
          >
            📊 城市统计
          </h2>
          <button
            onClick={() => setShowStatsPanel(false)}
            className="text-gray-400 text-xl px-2 active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Season & Time */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard 
            label={`${seasonInfo.emoji} 当前季节`} 
            value={seasonInfo.description.split(' - ')[0]} 
          />
          <StatCard 
            label="📅 年份" 
            value={`第${year}年`} 
          />
          <StatCard label="🏆 头衔" value={currentRank} />
          <StatCard label="👥 人口" value={`${population} / ${maxPopulation}`} />
          <StatCard label="😊 幸福度" value={`${happiness}%`} />
          <StatCard label="⏱️ 游戏时间" value={timeStr} />
        </div>

        {/* Season Effects */}
        <div className="mb-4 p-3 rounded-lg" style={{ 
          background: currentSeason === Season.WINTER ? 'rgba(70,130,180,0.1)' : 
                     currentSeason === Season.SUMMER ? 'rgba(255,165,0,0.1)' :
                     currentSeason === Season.AUTUMN ? 'rgba(210,105,30,0.1)' :
                     'rgba(144,238,144,0.1)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div className="text-sm font-bold mb-2" style={{ color: seasonInfo.description.includes('春季') ? '#90EE90' :
                                                                    seasonInfo.description.includes('夏季') ? '#FFA500' :
                                                                    seasonInfo.description.includes('秋季') ? '#D2691E' :
                                                                    '#87CEEB' }}>
            {seasonInfo.emoji} {seasonInfo.description}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: '#aaa' }}>
            <div>🌾 农场产出: x{seasonInfo.farmMultiplier}</div>
            <div>🍞 食物消耗: x{seasonInfo.foodConsumptionMultiplier}</div>
            <div>📅 季节剩余: {SEASON_LENGTH - daysInSeason}天</div>
            <div>📈 年份: 第{year}年</div>
          </div>
        </div>

        {/* Resources */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#DAA520' }}>
            📦 资源
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <ResourceRow emoji="🍞" name="食物" amount={Math.floor(resources.food)} rate={rates.food} />
            <ResourceRow emoji="🪵" name="木材" amount={Math.floor(resources.wood)} rate={rates.wood} />
            <ResourceRow emoji="🪨" name="石材" amount={Math.floor(resources.stone)} rate={rates.stone} />
            <ResourceRow emoji="🏺" name="陶器" amount={Math.floor(resources.pottery)} rate={rates.pottery} />
            <ResourceRow emoji="💰" name="金币" amount={Math.floor(resources.gold)} rate={rates.gold} />
          </div>
          
          {/* Production Chain Resources */}
          {(rates.wheat > 0 || rates.flour > 0 || rates.bread > 0 || rates.clay > 0 || rates.iron > 0 || rates.tools > 0) && (
            <>
              <h4 className="text-xs font-bold mt-3 mb-2" style={{ color: '#888' }}>
                🔄 产业链资源
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {rates.wheat > 0 && <ResourceRow emoji="🌾" name="小麦" amount={Math.floor(resources.wheat || 0)} rate={rates.wheat} />}
                {rates.flour > 0 && <ResourceRow emoji="🌫️" name="面粉" amount={Math.floor(resources.flour || 0)} rate={rates.flour} />}
                {rates.bread > 0 && <ResourceRow emoji="🥖" name="面包" amount={Math.floor(resources.bread || 0)} rate={rates.bread} />}
                {rates.clay > 0 && <ResourceRow emoji="🟤" name="粘土" amount={Math.floor(resources.clay || 0)} rate={rates.clay} />}
                {rates.iron > 0 && <ResourceRow emoji="⚙️" name="铁矿" amount={Math.floor(resources.iron || 0)} rate={rates.iron} />}
                {rates.tools > 0 && <ResourceRow emoji="🔧" name="工具" amount={Math.floor(resources.tools || 0)} rate={rates.tools} />}
              </div>
            </>
          )}
        </div>

        {/* Production rates */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#DAA520' }}>
            📈 每回合产出
          </h3>
          <div className="text-xs space-y-1" style={{ color: '#ccc' }}>
            <p>🍞 食物: +{rates.food.toFixed(1)} | 消耗: -{(population * 0.5 * SEASON_EFFECTS[currentSeason].foodConsumptionMultiplier).toFixed(1)}</p>
            <p>🪵 木材: +{rates.wood.toFixed(1)}</p>
            <p>🪨 石材: +{rates.stone.toFixed(1)}</p>
            <p>🏺 陶器: +{rates.pottery.toFixed(1)}</p>
            <p>💰 金币: +{rates.gold.toFixed(1)}</p>
            {rates.wheat > 0 && <p>🌾 小麦: +{rates.wheat.toFixed(1)}</p>}
            {rates.flour > 0 && <p>🌫️ 面粉: +{rates.flour.toFixed(1)}</p>}
            {rates.bread > 0 && <p>🥖 面包: +{rates.bread.toFixed(1)}</p>}
            <p style={{ color: rates.workerEfficiency < 1 ? '#ff9944' : '#888' }}>
              👷 工人效率: {Math.round(rates.workerEfficiency * 100)}% {rates.workerEfficiency < 1 ? '(人手不足!)' : ''}
            </p>
          </div>
        </div>

        {/* Tech Progress */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#4169E1' }}>
            🔬 科技研究
          </h3>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(65,105,225,0.1)', border: '1px solid rgba(65,105,225,0.2)' }}>
            {currentResearch ? (
              <div>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span>{TECH_DEFS[currentResearch].emoji}</span>
                  <span style={{ color: '#6495ED' }}>正在研究: {TECH_DEFS[currentResearch].name}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${Math.min(100, (researchProgress / TECH_DEFS[currentResearch].researchCost) * 100)}%`,
                      background: 'linear-gradient(to right, #4169E1, #6495ED)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs" style={{ color: '#888' }}>
                点击🔬按钮开始研究
              </div>
            )}
            <div className="text-[10px] mt-1" style={{ color: '#666' }}>
              已研究: {researchedTechs.length}/{Object.keys(TECH_DEFS).length}
            </div>
          </div>
        </div>

        {/* Building counts */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#DAA520' }}>
            🏗️ 建筑统计 ({totalBuildings})
          </h3>
          <div className="grid grid-cols-2 gap-1 text-xs" style={{ color: '#ccc' }}>
            {Object.entries(buildingCounts)
              .filter(([, count]) => count > 0)
              .map(([type, count]) => {
                const def = BUILDING_DEFS[type];
                const locked = !unlockedBuildings.includes(type as any);
                return def ? (
                  <div key={type} className="flex items-center gap-1" style={{ opacity: locked ? 0.5 : 1 }}>
                    <span>{def.emoji}</span>
                    <span>{def.name}</span>
                    <span style={{ color: '#FFD700' }}>x{count}</span>
                  </div>
                ) : null;
              })}
            {Object.keys(buildingCounts).length === 0 && (
              <p className="col-span-2 text-gray-500">还没有建造任何建筑</p>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#888' }}>
            📊 历史统计
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-sm font-bold" style={{ color: '#FFD700' }}>{tickCount}</div>
              <div className="text-[10px]" style={{ color: '#666' }}>总天数</div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-sm font-bold" style={{ color: '#FF6B6B' }}>{disastersSurvived}</div>
              <div className="text-[10px]" style={{ color: '#666' }}>经历灾难</div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-sm font-bold" style={{ color: '#888' }}>{buildingsDestroyed}</div>
              <div className="text-[10px]" style={{ color: '#666' }}>拆除建筑</div>
            </div>
          </div>
        </div>

        {/* Victory progress */}
        <div>
          <h3 className="text-sm font-bold mb-2" style={{ color: '#DAA520' }}>
            🏆 晋升进度
          </h3>
          <div className="space-y-2">
            {VICTORY_TIERS.map(tier => {
              const achieved = population >= tier.population;
              const progress = Math.min(100, (population / tier.population) * 100);
              return (
                <div key={tier.name}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span style={{ color: achieved ? '#FFD700' : '#999' }}>
                      {tier.emoji} {tier.name}
                    </span>
                    <span style={{ color: achieved ? '#FFD700' : '#666' }}>
                      {population}/{tier.population}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        background: achieved
                          ? 'linear-gradient(to right, #DAA520, #FFD700)'
                          : 'rgba(218,165,32,0.4)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg p-2.5"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="text-[10px] mb-0.5" style={{ color: '#888' }}>{label}</div>
      <div className="text-sm font-bold" style={{ color: '#FFD700' }}>{value}</div>
    </div>
  );
}

function ResourceRow({ emoji, name, amount, rate }: { emoji: string; name: string; amount: number; rate: number }) {
  return (
    <div
      className="flex items-center justify-between rounded-md px-2 py-1"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-1">
        <span className="text-sm">{emoji}</span>
        <span className="text-xs" style={{ color: '#ccc' }}>{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: '#FFD700' }}>{amount}</span>
        {rate > 0 && (
          <span className="text-[10px]" style={{ color: '#4ade80' }}>+{rate.toFixed(1)}</span>
        )}
      </div>
    </div>
  );
}
