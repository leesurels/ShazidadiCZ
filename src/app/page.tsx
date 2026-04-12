'use client';

import React from 'react';
import StartScreen from '@/components/game/StartScreen';
import TopBar from '@/components/game/TopBar';
import ResourceBar from '@/components/game/ResourceBar';
import GameCanvas from '@/components/game/GameCanvas';
import BuildBar from '@/components/game/BuildBar';
import InfoBar from '@/components/game/InfoBar';
import StatsPanel from '@/components/game/StatsPanel';
import BuildingInfo from '@/components/game/BuildingInfo';
import MarketTradePanel from '@/components/game/MarketTradePanel';
import VictoryModal from '@/components/game/VictoryModal';
import NotificationBanner from '@/components/game/NotificationBanner';
import EventLog from '@/components/game/EventLog';
// New panels
import TechPanel from '@/components/game/TechPanel';
import EventForecastPanel from '@/components/game/EventForecastPanel';
import AchievementPanel from '@/components/game/AchievementPanel';
import TraderPanel from '@/components/game/TraderPanel';
import { useGameStore } from '@/game/store';
import MiniMap from '@/components/game/MiniMap';

export default function Home() {
  const showStartScreen = useGameStore(s => s.showStartScreen);

  return (
    <div
      className="flex flex-col h-dvh w-screen overflow-hidden"
      style={{
        background: '#0a0500',
        color: '#fff',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Start Screen Overlay */}
      {showStartScreen && <StartScreen />}

      {/* Top Bar */}
      <TopBar />

      {/* Resource Bar */}
      <ResourceBar />

      {/* Game Canvas */}
      <GameCanvas />
      
      {/* Mini Map */}
      <MiniMap />

      {/* Building Bar */}
      <BuildBar />

      {/* Info Bar */}
      <InfoBar />

      {/* Bottom Panels */}
      <TechPanel />
      <EventForecastPanel />
      <AchievementPanel />
      <TraderPanel />
      <EventLog />

      {/* Modals */}
      <StatsPanel />
      <BuildingInfo />
      <MarketTradePanel />
      <VictoryModal />
      <NotificationBanner />
    </div>
  );
}
