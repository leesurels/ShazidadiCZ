// ===== 傻子大帝 - Game Store (Zustand) =====
import { create } from 'zustand';
import { BuildingType, TerrainType, GameEventType, Season, TechType, type GameState, type ProductionRates, type GameEvent, type GameNotification, type EventForecast, type Tech, type Achievement, type Trader, type NeighborCity, type Resources, type SaveSlot, type SaveData } from './types';
import {
  MAP_SIZE, TILE_WIDTH, TILE_HEIGHT,
  STARTING_RESOURCES, BUILDING_DEFS,
  VICTORY_TIERS, FOOD_PER_PERSON_PER_TICK,
  SAVE_KEY, DESIRABILITY_EFFECTS, MIN_ZOOM, MAX_ZOOM,
  EVENT_DEFS, HOUSE_LEVELS, MAX_PEDESTRIANS, FIRE_STATION_REDUCTION,
  BASE_STORAGE, WAREHOUSE_STORAGE_BONUS, GOLD_STORAGE_MULTIPLIER,
  TRADE_OPTIONS, TRADE_COOLDOWN, SEASON_LENGTH, SEASONS, SEASON_EFFECTS,
  WINTER_WARNING_DAYS, BUILDING_UNLOCKS, INITIAL_UNLOCKED_BUILDINGS,
  TECH_DEFS, ACHIEVEMENT_DEFS, NEIGHBOR_CITIES, TRADER_NAMES,
  TRADER_GOODS, TRADER_INTERVAL_MIN, TRADER_INTERVAL_MAX,
  TRADER_STAY_DURATION, EVENT_PREPARATION,
  SAVE_SLOTS_COUNT, SAVE_KEY_PREFIX, SAVE_META_KEY,
} from './constants';
import { generateMap, findNearbyBuilding } from './mapGenerator';
import type { Tile, Pedestrian } from './types';

interface GameActions {
  // Game control
  startNewGame: (slotId?: number) => void;
  loadGame: (slotId: number) => boolean;
  saveGame: () => void;
  saveToSlot: (slotId: number) => void;
  loadFromSlot: (slotId: number) => boolean;
  deleteSlot: (slotId: number) => void;
  getSaveSlots: () => SaveSlot[];
  getSlotDetail: (slotId: number) => SaveSlot | null;
  getCurrentSlotInfo: () => SaveSlot | null;
  setGameSpeed: (speed: number) => void;
  togglePause: () => void;

  // Building
  selectBuilding: (type: BuildingType | null) => void;
  placeBuilding: (x: number, y: number) => boolean;
  demolishBuilding: (x: number, y: number) => boolean;
  setSelectedTile: (tile: { x: number; y: number } | null) => void;

  // Camera
  setCamera: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;

  // UI
  setShowStartScreen: (show: boolean) => void;
  setShowStatsPanel: (show: boolean) => void;
  setShowBuildingInfo: (show: boolean) => void;
  setShowMarketTrade: (show: boolean) => void;
  setShowTechPanel: (show: boolean) => void;
  setShowEventForecast: (show: boolean) => void;
  setShowAchievementPanel: (show: boolean) => void;
  setShowTraderPanel: (show: boolean) => void;
  setVictoryNotification: (msg: string | null) => void;
  toggleDemolishMode: () => void;

  // Trading
  executeTrade: (tradeId: string) => boolean;

  // Notifications
  dismissNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Tech system
  startResearch: (techType: TechType) => void;
  checkTechCompletion: () => void;

  // Event forecast
  generateForecasts: () => void;
  updateForecastScores: () => void;

  // Achievements
  checkAchievements: () => void;

  // Trader
  spawnTrader: () => void;
  executeTraderTrade: (offerId: string) => boolean;
  dismissTrader: () => void;

  // Game tick
  gameTick: () => void;

  // Computed
  getProductionRates: () => ProductionRates;
  getCurrentRank: () => string;
  getBuildingCounts: () => Record<string, number>;
  getSeasonInfo: () => { season: Season; daysRemaining: number; effect: typeof SEASON_EFFECTS[Season] };
}

type GameStore = GameState & GameActions;

function getDefaultState(): GameState {
  return {
    map: generateMap(),
    mapSize: MAP_SIZE,
    resources: { ...STARTING_RESOURCES },
    totalResourcesProduced: {},
    population: 0,
    maxPopulation: 0,
    populationGrowthRate: 0,
    peakPopulation: 0,
    workersNeeded: 0,
    workersAvailable: 0,
    workerAssignments: {},
    storageCapacity: BASE_STORAGE,
    happiness: 50,
    gameSpeed: 1,
    isRunning: false,
    selectedBuilding: null,
    isDemolishMode: false,
    cameraX: 0,
    cameraY: 0,
    zoom: 1,
    currentRank: '小村长',
    highestPopulation: 0,
    showStartScreen: true,
    showStatsPanel: false,
    selectedTile: null,
    showBuildingInfo: false,
    showMarketTrade: false,
    showTechPanel: false,
    showEventForecast: false,
    showAchievementPanel: false,
    showTraderPanel: false,
    victoryNotification: null,
    tickCount: 0,
    lastTradeTick: -100,
    // 季节系统
    currentSeason: Season.SPRING,
    daysInSeason: 0,
    year: 1,
    isSowingSeason: true,
    isHarvestSeason: false,
    winterWarning: false,
    // 科技系统
    unlockedBuildings: [...INITIAL_UNLOCKED_BUILDINGS],
    researchedTechs: [],
    currentResearch: null,
    researchProgress: 0,
    // 事件预测
    eventForecasts: [],
    lastForecastTick: -100,
    // 通知与事件
    notifications: [],
    activeEvents: [],
    lastEventTick: -100,
    // 贸易系统
    currentTrader: null,
    neighborCities: NEIGHBOR_CITIES.map(c => ({ ...c })),
    // 成就系统
    achievements: ACHIEVEMENT_DEFS.map(a => ({ ...a })),
    unlockedAchievements: [],
    // 行人
    pedestrians: [],
    // 统计
    buildingsDestroyed: 0,
    disastersSurvived: 0,
    // 多存档系统
    currentSaveSlot: null,
  };
}

let notificationIdCounter = 0;
let forecastIdCounter = 0;

// ===== Helper: Check if a tile has adjacent road access =====
function hasRoadAccess(map: Tile[][], x: number, y: number): boolean {
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  for (const [dx, dy] of dirs) {
    const tx = x + dx;
    const ty = y + dy;
    if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
      const b = map[ty][tx].building;
      if (b === BuildingType.ROAD || b === BuildingType.BRIDGE) return true;
    }
  }
  return false;
}

// ===== Helper: Check if a tile is covered by a fire station =====
function hasFireStationCoverage(map: Tile[][], x: number, y: number): boolean {
  return findNearbyBuilding(map, x, y, BuildingType.FIRE_STATION,
    BUILDING_DEFS[BuildingType.FIRE_STATION]?.range || 6);
}

// ===== Helper: Check if there's a specific terrain type nearby =====
function findNearbyTerrain(
  map: Tile[][],
  cx: number,
  cy: number,
  terrainType: TerrainType,
  range: number
): boolean {
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      const tx = cx + dx;
      const ty = cy + dy;
      if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
        if (map[ty][tx].terrain === terrainType) {
          return true;
        }
      }
    }
  }
  return false;
}

// ===== Helper: Count guard towers in the city =====
function countBuildings(map: Tile[][], type: BuildingType): number {
  let count = 0;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (map[y][x].building === type) count++;
    }
  }
  return count;
}

// ===== Helper: Calculate total workers needed =====
function calculateWorkersNeeded(map: Tile[][]): number {
  let total = 0;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const building = map[y][x].building;
      if (!building) continue;
      const def = BUILDING_DEFS[building];
      if (def?.workersNeeded) total += def.workersNeeded;
    }
  }
  return total;
}

// ===== Helper: Calculate storage capacity =====
function calculateStorageCapacity(map: Tile[][]): number {
  const warehouseCount = countBuildings(map, BuildingType.WAREHOUSE);
  return BASE_STORAGE + warehouseCount * WAREHOUSE_STORAGE_BONUS;
}

// ===== Helper: Cap resources to storage capacity =====
function capResources(resources: Resources, capacity: number) {
  const goldCap = capacity * GOLD_STORAGE_MULTIPLIER;
  const keys: (keyof Resources)[] = ['food', 'wood', 'stone', 'pottery', 'wheat', 'flour', 'bread', 'clay', 'iron', 'tools'];
  for (const key of keys) {
    if (resources[key] !== undefined) {
      resources[key] = Math.min(resources[key] as number, capacity);
    }
  }
  resources.gold = Math.min(resources.gold, goldCap);
}

// ===== Helper: Calculate max population based on house levels =====
function calculateMaxPopulation(map: Tile[][]): number {
  let total = 0;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (map[y][x].building === BuildingType.HOUSE) {
        const level = map[y][x].houseLevel || 0;
        const lvl = HOUSE_LEVELS[Math.min(level, HOUSE_LEVELS.length - 1)];
        total += lvl.populationCapacity;
      }
    }
  }
  return total;
}

// ===== Helper: Recalculate desirability =====
function recalculateDesirability(map: Tile[][]): void {
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      map[y][x].desirability = 0;
    }
  }
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const building = map[y][x].building;
      if (!building) continue;
      const effect = DESIRABILITY_EFFECTS[building];
      if (effect === undefined) continue;
      const range = building === BuildingType.GARDEN ? 1 : 2;
      for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist <= range) {
            const tx = x + dx;
            const ty = y + dy;
            if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
              const falloff = building === BuildingType.GARDEN ? 1 : (1 - dist / (range + 1));
              map[ty][tx].desirability += Math.round(effect * falloff);
            }
          }
        }
      }
    }
  }
}

// ===== Helper: Collect all road/bridge tiles for pedestrian spawning =====
function collectRoadTiles(map: Tile[][]): { x: number; y: number }[] {
  const roads: { x: number; y: number }[] = [];
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const b = map[y][x].building;
      if (b === BuildingType.ROAD || b === BuildingType.BRIDGE) {
        roads.push({ x, y });
      }
    }
  }
  return roads;
}

// ===== Helper: Find a random adjacent road tile for a pedestrian =====
function findAdjacentRoad(map: Tile[][], x: number, y: number): { x: number; y: number } | null {
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  const options: { x: number; y: number }[] = [];
  for (const [dx, dy] of dirs) {
    const tx = x + dx;
    const ty = y + dy;
    if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
      const b = map[ty][tx].building;
      if (b === BuildingType.ROAD || b === BuildingType.BRIDGE) {
        options.push({ x: tx, y: ty });
      }
    }
  }
  if (options.length === 0) return null;
  return options[Math.floor(Math.random() * options.length)];
}

// ===== Helper: Update pedestrian positions each tick =====
function updatePedestrians(pedestrians: Pedestrian[], map: Tile[][]): Pedestrian[] {
  const roadTiles = collectRoadTiles(map);
  if (roadTiles.length === 0) return [];

  const targetCount = Math.min(MAX_PEDESTRIANS, Math.floor(roadTiles.length / 3));
  const updated = [...pedestrians];

  for (let i = updated.length - 1; i >= 0; i--) {
    const p = updated[i];
    p.progress += p.speed;
    if (p.progress >= 1) {
      p.x = p.targetX;
      p.y = p.targetY;
      p.progress = 0;
      const next = findAdjacentRoad(map, p.x, p.y);
      if (next) {
        p.targetX = next.x;
        p.targetY = next.y;
      } else {
        updated.splice(i, 1);
      }
    }
  }

  while (updated.length < targetCount) {
    const road = roadTiles[Math.floor(Math.random() * roadTiles.length)];
    const next = findAdjacentRoad(map, road.x, road.y);
    if (!next) continue;

    const isFirefighter = Math.random() < 0.15;
    updated.push({
      x: road.x,
      y: road.y,
      targetX: next.x,
      targetY: next.y,
      progress: 0,
      speed: 0.15 + Math.random() * 0.15,
      color: isFirefighter ? '#CC3333' : ['#8B6914', '#654321', '#4a3520', '#2c1e10'][Math.floor(Math.random() * 4)],
      isFirefighter,
    });
  }

  while (updated.length > targetCount) {
    updated.pop();
  }

  return updated;
}

// ===== Helper: Upgrade houses based on happiness & desirability =====
function processHouseUpgrades(map: Tile[][], happiness: number): boolean {
  let changed = false;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (map[y][x].building !== BuildingType.HOUSE) continue;

      const currentLevel = map[y][x].houseLevel || 0;
      if (currentLevel >= HOUSE_LEVELS.length - 1) continue;

      const nextLevel = HOUSE_LEVELS[currentLevel + 1];
      if (happiness >= nextLevel.happinessReq && map[y][x].desirability >= nextLevel.desirabilityReq) {
        const upgradeChance = 0.05 + (happiness - nextLevel.happinessReq) * 0.005;
        if (Math.random() < upgradeChance) {
          map[y][x].houseLevel = currentLevel + 1;
          changed = true;
        }
      } else if (happiness < HOUSE_LEVELS[currentLevel].happinessReq - 15) {
        if (currentLevel > 0 && Math.random() < 0.08) {
          map[y][x].houseLevel = currentLevel - 1;
          changed = true;
        }
      }
    }
  }
  return changed;
}

// ===== Helper: Calculate event preparation score =====
function calculatePreparationScore(map: Tile[][], eventType: GameEventType, population: number, resources: Resources): number {
  const prep = EVENT_PREPARATION[eventType];
  if (!prep) return 0;

  switch (prep.keyFactor) {
    case 'fireCoverage': {
      let coverage = 0;
      for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
          if (map[y][x].building === BuildingType.FIRE_STATION) {
            coverage += (BUILDING_DEFS[BuildingType.FIRE_STATION]?.range || 6) ** 2;
          }
        }
      }
      return Math.min(100, coverage / 10);
    }
    case 'guardCount': {
      const guardCount = countBuildings(map, BuildingType.GUARD_TOWER);
      return Math.min(100, guardCount * 25);
    }
    case 'templeWellCount': {
      const templeCount = countBuildings(map, BuildingType.TEMPLE);
      const wellCount = countBuildings(map, BuildingType.WELL);
      return Math.min(100, (templeCount * 30) + (wellCount * 15));
    }
    case 'foodStorage': {
      const storageCap = calculateStorageCapacity(map);
      const foodRatio = resources.food / storageCap;
      return Math.min(100, foodRatio * 100);
    }
    case 'wellCount': {
      return Math.min(100, countBuildings(map, BuildingType.WELL) * 20);
    }
    default:
      return 50;
  }
}

// ===== Helper: Process a random event with preparation score =====
function processRandomEvent(
  map: Tile[][],
  resources: Resources,
  population: number,
  tickCount: number,
  forecasts: EventForecast[]
): {
  event: GameEvent;
  description: string;
  populationLoss?: number;
  populationGain?: number;
  resourceGain?: number;
  isMitigated?: boolean;
} | null {
  let buildingCount = 0;
  const buildingPositions: { x: number; y: number }[] = [];
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (map[y][x].building) {
        buildingCount++;
        buildingPositions.push({ x, y });
      }
    }
  }

  // Check if there's an active forecast for this event
  const activeForecast = forecasts.find(f => f.isActive && f.predictedTick <= tickCount);

  const eligible = EVENT_DEFS.filter(e => {
    if (population < e.minPopulation) return false;
    if (buildingCount < e.minBuildings) return false;
    return true;
  });
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  let selected = eligible[0];
  for (const e of eligible) {
    roll -= e.weight;
    if (roll <= 0) {
      selected = e;
      break;
    }
  }

  const event: GameEvent = {
    type: selected.type,
    title: selected.title,
    emoji: selected.emoji,
    description: '',
    tickOccurred: tickCount,
    severity: selected.severity,
  };

  // Calculate preparation score
  const prepScore = calculatePreparationScore(map, selected.type, population, resources);

  switch (selected.type) {
    case GameEventType.FIRE: {
      let eligibleBuildings = buildingPositions.filter(p => {
        if (map[p.y][p.x].building === BuildingType.BRIDGE) return false;
        return true;
      });
      const unprotected = eligibleBuildings.filter(p => !hasFireStationCoverage(map, p.x, p.y));
      if (unprotected.length === 0) {
        if (Math.random() > FIRE_STATION_REDUCTION) return null;
      } else {
        eligibleBuildings = unprotected;
      }
      if (eligibleBuildings.length === 0) return null;

      // Apply preparation score to reduce damage
      let count = Math.min(2, eligibleBuildings.length);
      if (prepScore >= 100 && Math.random() < 0.3) {
        // Perfect preparation - fire prevented!
        event.description = '消防站成功预防了一场大火！';
        event.severity = 'neutral';
        return { event, description: event.description, isMitigated: true };
      } else if (prepScore >= 50) {
        count = Math.max(1, Math.floor(count * (1 - prepScore / 200)));
      }

      const shuffled = [...eligibleBuildings].sort(() => Math.random() - 0.5);
      for (let i = 0; i < count; i++) {
        const pos = shuffled[i];
        map[pos.y][pos.x].building = null;
        if (map[pos.y][pos.x].houseLevel !== undefined) map[pos.y][pos.x].houseLevel = 0;
      }
      const description = selected.descriptionTemplate.replace('{count}', String(count));
      event.description = description;
      return { event, description };
    }
    case GameEventType.BARBARIAN: {
      const guardCount = countBuildings(map, BuildingType.GUARD_TOWER);
      const reductionFactor = Math.min(0.8, guardCount * 0.25 + prepScore * 0.005);
      const baseLoss = Math.max(3, Math.floor(population * (0.05 + Math.random() * 0.1)));
      let loss = Math.max(1, Math.floor(baseLoss * (1 - reductionFactor)));

      // Perfect preparation (100%) turns this into a positive event!
      if (prepScore >= 100) {
        const loot = 20 + Math.floor(Math.random() * 30);
        resources.gold += loot;
        event.description = `警卫塔完美防御！击退蛮族获得${loot}金币战利品！`;
        event.severity = 'good';
        return { event, description: event.description, resourceGain: loot };
      }

      const description = selected.descriptionTemplate.replace('{count}', String(loss)) +
        (guardCount > 0 || prepScore > 0 ? `（防御减免${Math.floor(reductionFactor * 100)}%伤害）` : '');
      event.description = description;
      return { event, description, populationLoss: loss };
    }
    case GameEventType.PLAGUE: {
      const templeCount = countBuildings(map, BuildingType.TEMPLE);
      const wellCount = countBuildings(map, BuildingType.WELL);
      const healthBonus = Math.min(0.5, (templeCount * 0.1) + (wellCount * 0.05) + (prepScore * 0.003));
      const loss = Math.max(3, Math.floor(population * (0.03 + Math.random() * 0.07) * (1 - healthBonus)));
      const description = selected.descriptionTemplate.replace('{count}', String(loss));
      event.description = description;
      if (prepScore >= 80) {
        event.severity = 'neutral';
        event.description = `神庙祈福减轻了瘟疫，只有${loss}人病亡。`;
      }
      return { event, description, populationLoss: loss };
    }
    case GameEventType.EARTHQUAKE: {
      const eligibleBuildings = buildingPositions.filter(p => map[p.y][p.x].building !== BuildingType.BRIDGE);
      if (eligibleBuildings.length === 0) return null;
      const center = eligibleBuildings[Math.floor(Math.random() * eligibleBuildings.length)];
      const targets: { x: number; y: number }[] = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const tx = center.x + dx;
          const ty = center.y + dy;
          if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
            if (map[ty][tx].building && map[ty][tx].building !== BuildingType.BRIDGE) {
              targets.push({ x: tx, y: ty });
            }
          }
        }
      }
      if (targets.length === 0) return null;
      let count = Math.min(2 + Math.floor(Math.random() * 3), targets.length);
      if (prepScore >= 70) {
        count = Math.max(1, Math.floor(count * 0.5));
      }
      const shuffled = [...targets].sort(() => Math.random() - 0.5);
      for (let i = 0; i < count; i++) {
        map[shuffled[i].y][shuffled[i].x].building = null;
        if (map[shuffled[i].y][shuffled[i].x].houseLevel !== undefined) map[shuffled[i].y][shuffled[i].x].houseLevel = 0;
      }
      const description = selected.descriptionTemplate.replace('{count}', String(count));
      event.description = description;
      return { event, description };
    }
    case GameEventType.BLIZZARD: {
      // Winter event - food consumption doubles, some population loss
      const loss = Math.max(2, Math.floor(population * (0.02 + Math.random() * 0.05)));
      event.remainingTicks = 5;
      const description = selected.descriptionTemplate.replace('{count}', String(loss));
      event.description = description;
      return { event, description, populationLoss: loss };
    }
    case GameEventType.DROUGHT: {
      // Summer event - farm output halved
      event.remainingTicks = 8;
      const description = selected.descriptionTemplate.replace('{count}', String(event.remainingTicks));
      event.description = description;
      return { event, description };
    }
    case GameEventType.GOOD_HARVEST: {
      const gain = 30 + Math.floor(Math.random() * 21);
      const description = selected.descriptionTemplate.replace('{count}', String(gain));
      event.description = description;
      return { event, description, resourceGain: gain };
    }
    case GameEventType.GOLD_DISCOVERY: {
      const gain = 50 + Math.floor(Math.random() * 51);
      const description = selected.descriptionTemplate.replace('{count}', String(gain));
      event.description = description;
      return { event, description, resourceGain: gain };
    }
    case GameEventType.IMMIGRANTS: {
      const gain = 5 + Math.floor(Math.random() * 6);
      const description = selected.descriptionTemplate.replace('{count}', String(gain));
      event.description = description;
      return { event, description, populationGain: gain };
    }
    default:
      return null;
  }
}

// ===== Buildings that don't require road access =====
const ROAD_EXEMPT_BUILDINGS = new Set([
  BuildingType.FARM,
  BuildingType.WELL,
  BuildingType.ROAD,
  BuildingType.BRIDGE,
  BuildingType.GARDEN,
  BuildingType.MILL,
  BuildingType.CLAY_PIT,
  BuildingType.IRON_MINE,
]);

// ===== Helper: Find first empty save slot =====
function findFirstEmptySlot(): number {
  for (let i = 1; i <= SAVE_SLOTS_COUNT; i++) {
    const slotKey = `${SAVE_KEY_PREFIX}${i}`;
    if (!localStorage.getItem(slotKey)) {
      return i;
    }
  }
  return 1; // 如果都满了，返回第一个槽位
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...getDefaultState(),

  // ===== 多存档系统辅助函数 =====
  getSaveSlots: () => {
    const slots: SaveSlot[] = [];
    for (let i = 1; i <= SAVE_SLOTS_COUNT; i++) {
      const slotKey = `${SAVE_KEY_PREFIX}${i}`;
      const saved = localStorage.getItem(slotKey);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          const meta = data._meta as SaveSlot;
          slots.push(meta);
        } catch (e) {
          // 损坏的存档，标记为空槽
          slots.push({
            id: i,
            name: `存档${i}`,
            timestamp: 0,
            population: 0,
            year: 0,
            season: Season.SPRING,
            currentRank: '无',
            playTime: 0,
          });
        }
      } else {
        // 空槽位
        slots.push({
          id: i,
          name: `存档${i}`,
          timestamp: 0,
          population: 0,
          year: 0,
          season: Season.SPRING,
          currentRank: '无',
          playTime: 0,
        });
      }
    }
    return slots;
  },

  getSlotDetail: (slotId: number) => {
    const slots = get().getSaveSlots();
    return slots.find(s => s.id === slotId) || null;
  },

  getCurrentSlotInfo: () => {
    const { currentSaveSlot } = get();
    if (currentSaveSlot === null) return null;
    return get().getSlotDetail(currentSaveSlot);
  },

  deleteSlot: (slotId: number) => {
    const slotKey = `${SAVE_KEY_PREFIX}${slotId}`;
    localStorage.removeItem(slotKey);
    // 如果删除的是当前存档位，重置状态
    if (get().currentSaveSlot === slotId) {
      set({ currentSaveSlot: null });
    }
  },

  startNewGame: (slotId?: number) => {
    // 如果指定了存档位，使用该存档位，否则找第一个空槽
    const targetSlot = slotId || findFirstEmptySlot();
    const slotKey = `${SAVE_KEY_PREFIX}${targetSlot}`;
    
    // 清除该存档位
    localStorage.removeItem(slotKey);
    
    const state = getDefaultState();
    state.showStartScreen = false;
    state.isRunning = true;
    state.currentSaveSlot = targetSlot;
    set(state);
    
    // 立即保存到指定槽位
    get().saveToSlot(targetSlot);
  },

  loadFromSlot: (slotId: number) => {
    const slotKey = `${SAVE_KEY_PREFIX}${slotId}`;
    try {
      const saved = localStorage.getItem(slotKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.mapSize !== MAP_SIZE) {
          console.error('存档地图大小不匹配');
          return false;
        }
        // 移除内部元数据
        const { _meta, ...gameData } = data;
        
        gameData.showStartScreen = false;
        gameData.showStatsPanel = false;
        gameData.showBuildingInfo = false;
        gameData.showTechPanel = false;
        gameData.showEventForecast = false;
        gameData.showAchievementPanel = false;
        gameData.showTraderPanel = false;
        gameData.victoryNotification = null;
        gameData.isRunning = true;
        gameData.currentSaveSlot = slotId;
        
        // Ensure defaults for new fields
        if (!gameData.notifications) gameData.notifications = [];
        if (!gameData.activeEvents) gameData.activeEvents = [];
        if (!gameData.lastEventTick) gameData.lastEventTick = -100;
        if (!gameData.pedestrians) gameData.pedestrians = [];
        if (!gameData.workersNeeded) gameData.workersNeeded = 0;
        if (!gameData.workersAvailable) gameData.workersAvailable = 0;
        if (!gameData.storageCapacity) gameData.storageCapacity = BASE_STORAGE;
        if (!gameData.lastTradeTick) gameData.lastTradeTick = -100;
        if (!gameData.showMarketTrade) gameData.showMarketTrade = false;
        // Season system
        if (!gameData.currentSeason) gameData.currentSeason = Season.SPRING;
        if (!gameData.daysInSeason) gameData.daysInSeason = 0;
        if (!gameData.year) gameData.year = 1;
        // Tech system
        if (!gameData.unlockedBuildings) gameData.unlockedBuildings = [...INITIAL_UNLOCKED_BUILDINGS];
        if (!gameData.researchedTechs) gameData.researchedTechs = [];
        if (!gameData.currentResearch) gameData.currentResearch = null;
        if (!gameData.researchProgress) gameData.researchProgress = 0;
        // Event forecast
        if (!gameData.eventForecasts) gameData.eventForecasts = [];
        if (!gameData.lastForecastTick) gameData.lastForecastTick = -100;
        // Resources expansion
        if (gameData.resources.wheat === undefined) gameData.resources.wheat = 0;
        if (gameData.resources.flour === undefined) gameData.resources.flour = 0;
        if (gameData.resources.bread === undefined) gameData.resources.bread = 0;
        if (gameData.resources.clay === undefined) gameData.resources.clay = 0;
        if (gameData.resources.iron === undefined) gameData.resources.iron = 0;
        if (gameData.resources.tools === undefined) gameData.resources.tools = 0;
        // Achievements
        if (!gameData.achievements) gameData.achievements = ACHIEVEMENT_DEFS.map(a => ({ ...a }));
        if (!gameData.unlockedAchievements) gameData.unlockedAchievements = [];
        // Neighbor cities
        if (!gameData.neighborCities) gameData.neighborCities = NEIGHBOR_CITIES.map(c => ({ ...c }));
        // Stats
        if (!gameData.buildingsDestroyed) gameData.buildingsDestroyed = 0;
        if (!gameData.disastersSurvived) gameData.disastersSurvived = 0;
        if (!gameData.peakPopulation) gameData.peakPopulation = gameData.population || 0;
        if (!gameData.totalResourcesProduced) gameData.totalResourcesProduced = {};
        // Ensure houseLevel exists
        if (gameData.map) {
          for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
              if (gameData.map[y][x].houseLevel === undefined) {
                gameData.map[y][x].houseLevel = 0;
              }
            }
          }
        }
        set(gameData);
        return true;
      }
    } catch (e) {
      console.error('Failed to load game from slot:', e);
    }
    return false;
  },

  // 向后兼容的 loadGame 方法
  loadGame: (slotId: number) => {
    return get().loadFromSlot(slotId);
  },

  saveToSlot: (slotId: number) => {
    try {
      const state = get();
      const saveData: SaveData & { _meta: SaveSlot } = {
        map: state.map,
        mapSize: state.mapSize,
        resources: state.resources,
        totalResourcesProduced: state.totalResourcesProduced,
        population: state.population,
        maxPopulation: state.maxPopulation,
        happiness: state.happiness,
        gameSpeed: state.gameSpeed,
        cameraX: state.cameraX,
        cameraY: state.cameraY,
        zoom: state.zoom,
        currentRank: state.currentRank,
        highestPopulation: state.highestPopulation,
        peakPopulation: state.peakPopulation,
        tickCount: state.tickCount,
        notifications: state.notifications,
        activeEvents: state.activeEvents,
        lastEventTick: state.lastEventTick,
        lastTradeTick: state.lastTradeTick,
        pedestrians: state.pedestrians,
        currentSeason: state.currentSeason,
        daysInSeason: state.daysInSeason,
        year: state.year,
        unlockedBuildings: state.unlockedBuildings,
        researchedTechs: state.researchedTechs,
        currentResearch: state.currentResearch,
        researchProgress: state.researchProgress,
        eventForecasts: state.eventForecasts,
        lastForecastTick: state.lastForecastTick,
        achievements: state.achievements,
        unlockedAchievements: state.unlockedAchievements,
        neighborCities: state.neighborCities,
        buildingsDestroyed: state.buildingsDestroyed,
        disastersSurvived: state.disastersSurvived,
        // 元数据
        _meta: {
          id: slotId,
          name: `存档${slotId}`,
          timestamp: Date.now(),
          population: state.population,
          year: state.year,
          season: state.currentSeason,
          currentRank: state.currentRank,
          playTime: state.tickCount,
        },
      };
      const slotKey = `${SAVE_KEY_PREFIX}${slotId}`;
      localStorage.setItem(slotKey, JSON.stringify(saveData));
      set({ currentSaveSlot: slotId });
    } catch (e) {
      console.error('Failed to save game to slot:', e);
    }
  },

  // 保存到当前存档位
  saveGame: () => {
    const { currentSaveSlot } = get();
    if (currentSaveSlot !== null) {
      get().saveToSlot(currentSaveSlot);
    } else {
      // 如果没有当前存档位（新游戏），自动保存到第一个空位
      const firstEmpty = findFirstEmptySlot();
      if (firstEmpty !== null) {
        get().saveToSlot(firstEmpty);
      }
    }
  },

  setGameSpeed: (speed) => set({ gameSpeed: speed, isRunning: speed > 0 }),
  togglePause: () => {
    const { gameSpeed } = get();
    if (gameSpeed === 0) set({ gameSpeed: 1, isRunning: true });
    else set({ gameSpeed: 0, isRunning: false });
  },

  selectBuilding: (type) => set({
    selectedBuilding: type,
    isDemolishMode: false,
    showBuildingInfo: false,
  }),

  placeBuilding: (x, y) => {
    const state = get();
    const tile = state.map[y]?.[x];
    if (!tile) return false;

    const buildingType = state.selectedBuilding;
    if (!buildingType || buildingType === BuildingType.DEMOLISH) return false;

    // Check if building is unlocked
    if (!state.unlockedBuildings.includes(buildingType)) return false;

    const def = BUILDING_DEFS[buildingType];
    if (!def) return false;

    if (tile.terrain === TerrainType.WATER) {
      if (buildingType !== BuildingType.BRIDGE) return false;
    }
    if (tile.building !== null) return false;
    if (tile.terrain === TerrainType.FOREST) return false;

    // Check for required nearby terrain (e.g., Fisher Hut needs water)
    if (def.needsNearbyTerrain) {
      if (!findNearbyTerrain(state.map, x, y, def.needsNearbyTerrain.type, def.needsNearbyTerrain.range)) {
        return false;
      }
    }

    const { resources } = state;
    if (resources.gold < def.cost.gold) return false;
    if (resources.wood < def.cost.wood) return false;
    if (resources.stone < def.cost.stone) return false;

    const newResources = { ...resources };
    newResources.gold -= def.cost.gold;
    newResources.wood -= def.cost.wood;
    newResources.stone -= def.cost.stone;

    const newMap = state.map.map((row: Tile[]) => row.map((t: Tile) => ({ ...t })));
    newMap[y][x].building = buildingType;
    if (buildingType === BuildingType.HOUSE) {
      newMap[y][x].houseLevel = 0;
    }

    recalculateDesirability(newMap);
    const maxPop = calculateMaxPopulation(newMap);

    set({
      map: newMap,
      resources: newResources,
      maxPopulation: maxPop,
    });

    return true;
  },

  demolishBuilding: (x, y) => {
    const state = get();
    const tile = state.map[y]?.[x];
    if (!tile || !tile.building) return false;

    const def = BUILDING_DEFS[tile.building];
    if (!def) return false;

    const newResources = { ...state.resources };
    newResources.gold += Math.floor(def.cost.gold * 0.5);
    newResources.wood += Math.floor(def.cost.wood * 0.5);
    newResources.stone += Math.floor(def.cost.stone * 0.5);

    const newMap = state.map.map((row: Tile[]) => row.map((t: Tile) => ({ ...t })));
    newMap[y][x].building = null;
    newMap[y][x].houseLevel = 0;

    recalculateDesirability(newMap);
    const maxPop = calculateMaxPopulation(newMap);

    set({
      map: newMap,
      resources: newResources,
      maxPopulation: maxPop,
      showBuildingInfo: false,
      selectedTile: null,
      buildingsDestroyed: state.buildingsDestroyed + 1,
    });

    return true;
  },

  setSelectedTile: (tile) => set({ selectedTile: tile, showBuildingInfo: tile !== null }),
  setCamera: (x, y) => set({ cameraX: x, cameraY: y }),
  setZoom: (zoom) => set({ zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)) }),

  setShowStartScreen: (show) => set({ showStartScreen: show }),
  setShowStatsPanel: (show) => set({ showStatsPanel: show }),
  setShowBuildingInfo: (show) => set({ showBuildingInfo: show }),
  setShowMarketTrade: (show) => set({ showMarketTrade: show }),
  setShowTechPanel: (show) => set({ showTechPanel: show }),
  setShowEventForecast: (show) => set({ showEventForecast: show }),
  setShowAchievementPanel: (show) => set({ showAchievementPanel: show }),
  setShowTraderPanel: (show) => set({ showTraderPanel: show }),
  setVictoryNotification: (msg) => set({ victoryNotification: msg }),

  toggleDemolishMode: () => {
    const { isDemolishMode } = get();
    set({
      isDemolishMode: !isDemolishMode,
      selectedBuilding: !isDemolishMode ? BuildingType.DEMOLISH : null,
    });
  },

  dismissNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  markNotificationRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [], activeEvents: [] });
  },

  // ===== 科技系统 =====
  startResearch: (techType) => {
    const state = get();
    if (state.currentResearch) return; // Already researching
    if (state.researchedTechs.includes(techType)) return; // Already researched
    set({ currentResearch: techType, researchProgress: 0 });
  },

  checkTechCompletion: () => {
    const state = get();
    if (!state.currentResearch) return;

    const tech = TECH_DEFS[state.currentResearch];
    if (!tech) return;

    const universityCount = countBuildings(state.map, BuildingType.UNIVERSITY);
    const researchSpeed = 1 + (universityCount * 0.25);

    const newProgress = state.researchProgress + researchSpeed;

    if (newProgress >= tech.researchCost) {
      // Tech completed!
      const newResearchedTechs = [...state.researchedTechs, state.currentResearch];
      const techDef = TECH_DEFS[state.currentResearch];
      
      // Apply tech effects - unlock buildings
      const newUnlockedBuildings = [...state.unlockedBuildings];
      
      // Check for building unlocks from this tech
      for (const buildingType of Object.values(BuildingType)) {
        const unlockReq = BUILDING_UNLOCKS[buildingType];
        if (unlockReq?.tech === state.currentResearch) {
          if (!newUnlockedBuildings.includes(buildingType)) {
            newUnlockedBuildings.push(buildingType);
          }
        }
      }

      set({
        researchedTechs: newResearchedTechs,
        currentResearch: null,
        researchProgress: 0,
        unlockedBuildings: newUnlockedBuildings,
      });

      // Add notification
      const notification: GameNotification = {
        id: `notif-${++notificationIdCounter}-${Date.now()}`,
        event: {
          type: GameEventType.GOLD_DISCOVERY,
          title: '科技完成',
          emoji: techDef.emoji,
          description: `研究完成：${techDef.name}！${techDef.description}`,
          tickOccurred: state.tickCount,
          severity: 'good',
        },
        timestamp: Date.now(),
        read: false,
      };
      set(state => ({
        notifications: [notification, ...state.notifications].slice(0, 50),
      }));
    } else {
      set({ researchProgress: newProgress });
    }
  },

  // ===== 事件预测系统 =====
  generateForecasts: () => {
    const state = get();
    if (state.tickCount - state.lastForecastTick < 10) return;

    const forecasts: EventForecast[] = [];
    const forecastableEvents = EVENT_DEFS.filter(e => e.forecastable);

    for (const eventDef of forecastableEvents) {
      // Check if already forecasted
      const existingForecast = state.eventForecasts.find(f => f.eventType === eventDef.type && f.isActive);
      if (existingForecast) continue;

      // Check eligibility
      if (state.population < eventDef.minPopulation) continue;
      if (eventDef.season && eventDef.season !== state.currentSeason) continue;

      // Random chance to generate forecast
      const forecastChance = 0.1 + (state.population / 1000) * 0.05;
      if (Math.random() > forecastChance) continue;

      const prepScore = calculatePreparationScore(state.map, eventDef.type, state.population, state.resources);

      const forecast: EventForecast = {
        id: `forecast-${++forecastIdCounter}`,
        eventType: eventDef.type,
        predictedTick: state.tickCount + eventDef.forecastTicks + Math.floor(Math.random() * 5),
        severity: prepScore < 30 ? 'catastrophic' : prepScore < 60 ? 'major' : 'minor',
        preparationScore: prepScore,
        warnings: [],
        isActive: true,
      };

      // Generate warnings
      const prep = EVENT_PREPARATION[eventDef.type];
      if (prep) {
        forecast.warnings.push(`建议增加${prep.description}`);
        if (eventDef.type === GameEventType.BLIZZARD) {
          forecast.warnings.push('储备足够的食物！');
        }
      }

      forecasts.push(forecast);
    }

    if (forecasts.length > 0) {
      set(state => ({
        eventForecasts: [...state.eventForecasts.filter(f => f.isActive), ...forecasts],
        lastForecastTick: state.tickCount,
      }));
    }
  },

  updateForecastScores: () => {
    const state = get();
    const updatedForecasts = state.eventForecasts.map(forecast => {
      if (!forecast.isActive) return forecast;
      const newScore = calculatePreparationScore(state.map, forecast.eventType, state.population, state.resources);
      return { ...forecast, preparationScore: newScore };
    });
    set({ eventForecasts: updatedForecasts });
  },

  // ===== 成就系统 =====
  checkAchievements: () => {
    const state = get();
    const newUnlocked: string[] = [];

    for (const achievement of state.achievements) {
      if (state.unlockedAchievements.includes(achievement.id)) continue;

      let unlocked = false;
      const cond = achievement.condition;

      switch (cond.type) {
        case 'resource_total': {
          const total = state.totalResourcesProduced[cond.resource as keyof Resources] || 0;
          if (cond.comparison === 'gte' ? total >= (cond.target || 0) : total === cond.target) {
            unlocked = true;
          }
          break;
        }
        case 'population_peak':
          if (state.peakPopulation >= (cond.target || 0)) unlocked = true;
          break;
        case 'survival':
          if (state.disastersSurvived >= (cond.target || 0)) unlocked = true;
          break;
        case 'tech_count':
          if (state.researchedTechs.length >= (cond.target || 0)) unlocked = true;
          break;
        case 'building_count':
          // Count all buildings on map
          let buildingCount = 0;
          for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
              if (state.map[y][x].building) buildingCount++;
            }
          }
          if (buildingCount >= (cond.target || 0)) unlocked = true;
          break;
        case 'custom':
          // First year achievement
          if (state.tickCount >= (cond.target || 0)) unlocked = true;
          break;
      }

      if (unlocked) {
        newUnlocked.push(achievement.id);
      }
    }

    if (newUnlocked.length > 0) {
      const updatedAchievements = state.achievements.map(a =>
        state.unlockedAchievements.includes(a.id) ? a : { ...a, isUnlocked: true, unlockedAt: Date.now() }
      );
      set(state => ({
        achievements: updatedAchievements,
        unlockedAchievements: [...state.unlockedAchievements, ...newUnlocked],
      }));

      // Add notification for each unlocked achievement
      for (const id of newUnlocked) {
        const ach = state.achievements.find(a => a.id === id);
        if (ach) {
          const notification: GameNotification = {
            id: `ach-${id}-${Date.now()}`,
            event: {
              type: GameEventType.IMMIGRANTS,
              title: '成就解锁',
              emoji: ach.emoji,
              description: `恭喜解锁成就：${ach.name}！${ach.description}`,
              tickOccurred: state.tickCount,
              severity: 'good',
            },
            timestamp: Date.now(),
            read: false,
          };
          set(state => ({
            notifications: [notification, ...state.notifications].slice(0, 50),
          }));
        }
      }
    }
  },

  // ===== 商队系统 =====
  spawnTrader: () => {
    const state = get();
    if (state.currentTrader) return;

    const traderTemplate = TRADER_NAMES[Math.floor(Math.random() * TRADER_NAMES.length)];
    const goods = TRADER_GOODS.map(g => ({ ...g }));

    const trader: Trader = {
      id: `trader-${Date.now()}`,
      name: traderTemplate.name,
      emoji: traderTemplate.emoji,
      arrivalTick: state.tickCount,
      departureTick: state.tickCount + TRADER_STAY_DURATION,
      goods,
      mood: 'neutral',
    };

    set({ currentTrader: trader, showTraderPanel: true });

    // Add notification
    const notification: GameNotification = {
      id: `trader-${Date.now()}`,
      event: {
        type: GameEventType.IMMIGRANTS,
        title: '商队到来',
        emoji: trader.emoji,
        description: `${trader.name}来到了你的城市！快去交易吧！`,
        tickOccurred: state.tickCount,
        severity: 'good',
      },
      timestamp: Date.now(),
      read: false,
    };
    set(state => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    }));
  },

  executeTraderTrade: (offerId) => {
    const state = get();
    if (!state.currentTrader) return false;

    const offer = state.currentTrader.goods.find(g => g.id === offerId);
    if (!offer || offer.quantity <= 0) return false;

    const newResources = { ...state.resources };

    // Check if player has enough to give
    if ((newResources[offer.giveResource as keyof Resources] as number || 0) < offer.giveAmount) return false;

    // Season price modifier
    const seasonMod = state.currentSeason === Season.WINTER ? 1.2 : state.currentSeason === Season.SUMMER ? 0.9 : 1;

    newResources[offer.giveResource as keyof Resources] = (newResources[offer.giveResource as keyof Resources] as number || 0) - Math.floor(offer.giveAmount * seasonMod);
    newResources[offer.receiveResource as keyof Resources] = (newResources[offer.receiveResource as keyof Resources] as number || 0) + Math.floor(offer.receiveAmount * seasonMod);

    const newTrader = { ...state.currentTrader };
    newTrader.goods = newTrader.goods.map(g => g.id === offerId ? { ...g, quantity: g.quantity - 1 } : g);

    // If no more goods, remove trader
    if (newTrader.goods.every(g => g.quantity <= 0)) {
      set({ currentTrader: null, showTraderPanel: false });
    } else {
      set({ currentTrader: newTrader });
    }

    set({ resources: newResources });
    return true;
  },

  dismissTrader: () => {
    set({ currentTrader: null, showTraderPanel: false });
  },

  executeTrade: (tradeId: string) => {
    const state = get();
    if (state.tickCount - state.lastTradeTick < TRADE_COOLDOWN) return false;

    let hasMarket = false;
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        if (state.map[y][x].building === BuildingType.MARKET && hasRoadAccess(state.map, x, y)) {
          hasMarket = true;
          break;
        }
      }
      if (hasMarket) break;
    }
    if (!hasMarket) return false;

    const trade = TRADE_OPTIONS.find(t => t.id === tradeId);
    if (!trade) return false;

    const newResources = { ...state.resources };
    const storageCap = calculateStorageCapacity(state.map);
    const goldCap = storageCap * GOLD_STORAGE_MULTIPLIER;

    if ((newResources[trade.giveResource] || 0) < trade.giveAmount) return false;
    const cap = trade.receiveResource === 'gold' ? goldCap : storageCap;
    if ((newResources[trade.receiveResource] || 0) + trade.receiveAmount > cap) return false;

    newResources[trade.giveResource] = (newResources[trade.giveResource] || 0) - trade.giveAmount;
    newResources[trade.receiveResource] = (newResources[trade.receiveResource] || 0) + trade.receiveAmount;

    set({
      resources: newResources,
      lastTradeTick: state.tickCount,
    });
    return true;
  },

  gameTick: () => {
    const state = get();
    if (!state.isRunning || state.gameSpeed === 0) return;

    const newResources = { ...state.resources };
    const newTotalProduced = { ...state.totalResourcesProduced };

    const newMap = state.map.map((row: Tile[]) => row.map((t: Tile) => ({ ...t })));
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        newMap[y][x].happinessBonus = 0;
      }
    }

    // ===== 季节系统 =====
    let newDaysInSeason = state.daysInSeason + 1;
    let newSeason = state.currentSeason;
    let newYear = state.year;
    let seasonMultiplier = SEASON_EFFECTS[state.currentSeason].farmMultiplier;
    let foodConsumptionMultiplier = SEASON_EFFECTS[state.currentSeason].foodConsumptionMultiplier;
    let winterWarning = false;

    if (newDaysInSeason >= SEASON_LENGTH) {
      newDaysInSeason = 0;
      const currentSeasonIndex = SEASONS.indexOf(state.currentSeason);
      newSeason = SEASONS[(currentSeasonIndex + 1) % 4];
      if (newSeason === Season.SPRING) newYear++;

      // Add notification
      const notification: GameNotification = {
        id: `season-${Date.now()}`,
        event: {
          type: GameEventType.GOOD_HARVEST,
          title: '季节更替',
          emoji: SEASON_EFFECTS[newSeason].emoji,
          description: `新季节到来：${SEASON_EFFECTS[newSeason].description}`,
          tickOccurred: state.tickCount,
          severity: 'neutral',
        },
        timestamp: Date.now(),
        read: false,
      };
      set(s => ({
        notifications: [notification, ...s.notifications].slice(0, 50),
      }));
    }

    // Winter warning
    if (newSeason === Season.WINTER && newDaysInSeason >= SEASON_LENGTH - WINTER_WARNING_DAYS) {
      winterWarning = true;
    }

    const isSowingSeason = newSeason === Season.SPRING;
    const isHarvestSeason = newSeason === Season.AUTUMN;

    // Calculate worker and storage stats
    const totalWorkersNeeded = calculateWorkersNeeded(newMap);
    const storageCap = calculateStorageCapacity(newMap);
    const workerEfficiency = totalWorkersNeeded > 0
      ? Math.min(1, state.population / totalWorkersNeeded)
      : (state.population > 0 ? 1 : 0);

    // Process each building
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        const tile = newMap[y][x];
        if (!tile.building) continue;

        const def = BUILDING_DEFS[tile.building];
        if (!def) continue;

        // Resource production (affected by worker efficiency and season)
        if (def.production) {
          let canProduce = true;

          // Check needs
          if (def.needsNearby) {
            if (def.needsNearby.resource === 'well_water') {
              canProduce = findNearbyBuilding(newMap, x, y, BuildingType.WELL, def.needsNearby.range);
            } else if (def.needsNearby.type === BuildingType.WAREHOUSE) {
              canProduce = findNearbyBuilding(newMap, x, y, BuildingType.WAREHOUSE, def.needsNearby.range);
            }
          }

          // Check for required nearby terrain (e.g., Fisher Hut needs water)
          if (canProduce && def.needsNearbyTerrain) {
            canProduce = findNearbyTerrain(newMap, x, y, def.needsNearbyTerrain.type, def.needsNearbyTerrain.range);
          }

          // Road access check
          if (canProduce && !ROAD_EXEMPT_BUILDINGS.has(tile.building)) {
            canProduce = hasRoadAccess(newMap, x, y);
          }

          // Worker check
          if (canProduce && (def.workersNeeded || 0) > 0) {
            canProduce = workerEfficiency > 0;
          }

          // Season check for farms
          if (canProduce && (tile.building === BuildingType.FARM || tile.building === BuildingType.MILL)) {
            canProduce = seasonMultiplier > 0;
          }

          // Check for drought event
          const hasDrought = state.activeEvents.some(e => e.type === GameEventType.DROUGHT);
          if (canProduce && hasDrought && (tile.building === BuildingType.FARM)) {
            canProduce = false; // Drought stops farms
          }

          if (canProduce) {
            const eff = (def.workersNeeded || 0) > 0 ? workerEfficiency : 1;
            let seasonMod = 1;

            // Farm output affected by season
            if (tile.building === BuildingType.FARM) {
              seasonMod = seasonMultiplier;
            }

            // Production chain buildings (mill, bakery, etc.)
            if (def.productionChain?.input) {
              const inputResource = def.productionChain.input.resource;
              const inputAmount = def.productionChain.input.amount * eff * seasonMod;
              if ((newResources[inputResource] || 0) >= inputAmount) {
                newResources[inputResource] = (newResources[inputResource] || 0) - inputAmount;
                if (def.productionChain.output) {
                  const outputResource = def.productionChain.output.resource;
                  const outputAmount = def.productionChain.output.amount * eff * seasonMod;
                  newResources[outputResource] = (newResources[outputResource] || 0) + outputAmount;
                  newTotalProduced[outputResource] = (newTotalProduced[outputResource] || 0) + outputAmount;
                }
              }
            } else {
              // Simple production
              if (def.production.wheat) {
                const amount = def.production.wheat * eff * seasonMod;
                newResources.wheat = (newResources.wheat || 0) + amount;
                newTotalProduced.wheat = (newTotalProduced.wheat || 0) + amount;
              }
              if (def.production.food) {
                const amount = def.production.food * eff * seasonMod;
                newResources.food = (newResources.food || 0) + amount;
                newTotalProduced.food = (newTotalProduced.food || 0) + amount;
              }
              if (def.production.wood) {
                newResources.wood = (newResources.wood || 0) + def.production.wood * eff;
                newTotalProduced.wood = (newTotalProduced.wood || 0) + def.production.wood * eff;
              }
              if (def.production.stone) {
                newResources.stone = (newResources.stone || 0) + def.production.stone * eff;
                newTotalProduced.stone = (newTotalProduced.stone || 0) + def.production.stone * eff;
              }
              if (def.production.pottery) {
                newResources.pottery = (newResources.pottery || 0) + def.production.pottery * eff;
                newTotalProduced.pottery = (newTotalProduced.pottery || 0) + def.production.pottery * eff;
              }
              if (def.production.clay) {
                newResources.clay = (newResources.clay || 0) + def.production.clay * eff;
                newTotalProduced.clay = (newTotalProduced.clay || 0) + def.production.clay * eff;
              }
              if (def.production.iron) {
                newResources.iron = (newResources.iron || 0) + def.production.iron * eff;
                newTotalProduced.iron = (newTotalProduced.iron || 0) + def.production.iron * eff;
              }
              if (def.production.tools) {
                newResources.tools = (newResources.tools || 0) + def.production.tools * eff;
                newTotalProduced.tools = (newTotalProduced.tools || 0) + def.production.tools * eff;
              }
            }
          }
        }

        // Tax office
        if (tile.building === BuildingType.TAX_OFFICE && def.range) {
          if (hasRoadAccess(newMap, x, y) && workerEfficiency > 0) {
            let nearbyPop = 0;
            for (let dy = -def.range; dy <= def.range; dy++) {
              for (let dx = -def.range; dx <= def.range; dx++) {
                const dist = Math.abs(dx) + Math.abs(dy);
                if (dist <= def.range) {
                  const tx = x + dx;
                  const ty = y + dy;
                  if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
                    if (newMap[ty][tx].building === BuildingType.HOUSE) {
                      const hLevel = newMap[ty][tx].houseLevel || 0;
                      const lvl = HOUSE_LEVELS[Math.min(hLevel, HOUSE_LEVELS.length - 1)];
                      nearbyPop += lvl.populationCapacity;
                    }
                  }
                }
              }
            }
            const popRatio = state.population > 0 ? Math.min(1, nearbyPop / Math.max(1, state.population)) : 0;
            const taxGold = Math.floor(5 * Math.ceil(state.population / 10) * popRatio * workerEfficiency);
            if (taxGold > 0) newResources.gold += taxGold;
          }
        }

        // Happiness buildings
        if ((def.happinessBonus || 0) > 0 && def.range) {
          for (let dy = -def.range; dy <= def.range; dy++) {
            for (let dx = -def.range; dx <= def.range; dx++) {
              const dist = Math.abs(dx) + Math.abs(dy);
              if (dist <= def.range) {
                const tx = x + dx;
                const ty = y + dy;
                if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
                  newMap[ty][tx].happinessBonus += def.happinessBonus || 0;
                }
              }
            }
          }
        }
      }
    }

    // ===== 食物系统 =====
    // Convert wheat to food (bread provides more food)
    const breadFoodValue = 3;
    const wheatFoodValue = 1;
    const breadToConsume = Math.min(newResources.bread || 0, Math.ceil((state.population * FOOD_PER_PERSON_PER_TICK * foodConsumptionMultiplier) / breadFoodValue));
    if (breadToConsume > 0) {
      newResources.bread = (newResources.bread || 0) - breadToConsume;
      const foodFromBread = breadToConsume * breadFoodValue;
      newResources.food = (newResources.food || 0) + foodFromBread;
      newTotalProduced.food = (newTotalProduced.food || 0) + foodFromBread;
    }

    // Regular food consumption
    const foodConsumed = state.population * FOOD_PER_PERSON_PER_TICK * foodConsumptionMultiplier;
    newResources.food = (newResources.food || 0) - foodConsumed;
    if (newResources.food < 0) newResources.food = 0;

    // Check for blizzard doubling consumption
    const hasBlizzard = state.activeEvents.some(e => e.type === GameEventType.BLIZZARD);
    if (hasBlizzard) {
      // Additional food consumed during blizzard (already accounted in multiplier, but extra pop loss)
    }

    // Pottery consumption
    const potteryConsumption = state.population > 0 ? Math.max(1, Math.ceil(state.population / 60)) : 0;
    newResources.pottery = (newResources.pottery || 0) - potteryConsumption;
    if (newResources.pottery < 0) newResources.pottery = 0;

    // Apply storage capacity limits
    capResources(newResources, storageCap);

    // House upgrade processing
    const currentMaxPop = calculateMaxPopulation(newMap);
    processHouseUpgrades(newMap, state.happiness);
    const maxPop = calculateMaxPopulation(newMap);

    // Population growth
    let newPopulation = state.population;
    if (newResources.food > 20 && newPopulation < maxPop) {
      const growthRate = state.happiness / 100;
      const growth = Math.max(1, Math.floor(growthRate * 2));
      newPopulation = Math.min(maxPop, newPopulation + growth);
    } else if (newResources.food <= 0 && newPopulation > 0) {
      newPopulation = Math.max(0, newPopulation - 2);
    }

    // Update peak population
    const peakPopulation = Math.max(state.peakPopulation, newPopulation);

    // Calculate happiness
    let totalHappinessBonus = 0;
    let houseCount = 0;

    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        if (newMap[y][x].building === BuildingType.HOUSE) {
          houseCount++;
          totalHappinessBonus += newMap[y][x].happinessBonus;
        }
      }
    }

    let happiness = 50;
    if (houseCount > 0) {
      happiness += Math.floor(totalHappinessBonus / houseCount);
    }
    if ((newResources.pottery || 0) > 0) {
      const potteryBonus = Math.min(12, 5 + (newResources.pottery || 0));
      happiness += potteryBonus;
    }
    if (newResources.food <= 0) happiness -= 20;
    const guardCount = countBuildings(newMap, BuildingType.GUARD_TOWER);
    if (guardCount > 0) {
      happiness += Math.min(10, guardCount * 3);
    }

    // Process active events
    let updatedActiveEvents = [...state.activeEvents];
    let eventHappinessPenalty = 0;
    for (let i = updatedActiveEvents.length - 1; i >= 0; i--) {
      const evt = updatedActiveEvents[i];
      if (evt.remainingTicks !== undefined && evt.remainingTicks > 0) {
        evt.remainingTicks -= 1;
        if (evt.remainingTicks <= 0) {
          updatedActiveEvents.splice(i, 1);
        } else {
          if (evt.type === GameEventType.PLAGUE) {
            eventHappinessPenalty -= 15;
          }
        }
      }
    }
    happiness += eventHappinessPenalty;
    happiness = Math.max(0, Math.min(100, happiness));

    // Victory check
    let highestPop = Math.max(state.highestPopulation, newPopulation);
    let currentRank = state.currentRank;
    let victoryNotification: string | null = null;

    for (const tier of VICTORY_TIERS) {
      if (newPopulation >= tier.population && highestPop >= tier.population) {
        const prevIndex = VICTORY_TIERS.findIndex(t => t.name === currentRank);
        const tierIndex = VICTORY_TIERS.findIndex(t => t.name === tier.name);
        if (tierIndex > prevIndex) {
          currentRank = tier.name;
          victoryNotification = `恭喜晋升为 ${tier.emoji} ${tier.name}！`;
        }
      }
    }

    const newTickCount = state.tickCount + 1;

    // Process research
    if (state.currentResearch) {
      get().checkTechCompletion();
    }

    // Generate event forecasts periodically
    get().generateForecasts();
    get().updateForecastScores();

    // Check achievements
    get().checkAchievements();

    // Spawn trader periodically
    if (!state.currentTrader && state.population >= 30) {
      const traderInterval = TRADER_INTERVAL_MIN + Math.floor(Math.random() * (TRADER_INTERVAL_MAX - TRADER_INTERVAL_MIN));
      if (newTickCount - state.lastEventTick >= traderInterval) {
        get().spawnTrader();
      }
    }

    // Remove expired trader
    if (state.currentTrader && newTickCount >= state.currentTrader.departureTick) {
      get().dismissTrader();
    }

    // Deactivate expired forecasts
    const updatedForecasts = state.eventForecasts.map(f => {
      if (f.isActive && f.predictedTick <= newTickCount) {
        return { ...f, isActive: false };
      }
      return f;
    }).filter(f => !f.isActive || f.predictedTick > newTickCount - 5); // Keep recent inactive forecasts

    // Process random events
    let newNotifications = [...state.notifications];
    let newLastEventTick = state.lastEventTick;
    let disastersSurvived = state.disastersSurvived;

    if (newPopulation >= 10 && newTickCount - state.lastEventTick >= 20) {
      const guardCount2 = countBuildings(newMap, BuildingType.GUARD_TOWER);
      const eventChance = 0.02 + (newPopulation / 1000) * 0.03;
      if (Math.random() < eventChance) {
        const eventResult = processRandomEvent(newMap, newResources, newPopulation, newTickCount, state.eventForecasts);
        if (eventResult) {
          const { event: gameEvent, description } = eventResult;

          if (gameEvent.type === GameEventType.FIRE || gameEvent.type === GameEventType.EARTHQUAKE) {
            const newMaxPop = calculateMaxPopulation(newMap);
            if (newPopulation > newMaxPop) newPopulation = newMaxPop;
            disastersSurvived++;
          }
          if (gameEvent.type === GameEventType.BARBARIAN || gameEvent.type === GameEventType.PLAGUE || gameEvent.type === GameEventType.BLIZZARD) {
            newPopulation = Math.max(0, newPopulation - (eventResult.populationLoss || 0));
            if (!eventResult.isMitigated) disastersSurvived++;
          }
          if (gameEvent.type === GameEventType.GOOD_HARVEST) {
            newResources.food = (newResources.food || 0) + (eventResult.resourceGain || 0);
            newTotalProduced.food = (newTotalProduced.food || 0) + (eventResult.resourceGain || 0);
          }
          if (gameEvent.type === GameEventType.GOLD_DISCOVERY) {
            newResources.gold += eventResult.resourceGain || 0;
          }
          if (gameEvent.type === GameEventType.IMMIGRANTS) {
            newPopulation = Math.min(maxPop, newPopulation + (eventResult.populationGain || 0));
          }

          if (gameEvent.type === GameEventType.PLAGUE || gameEvent.type === GameEventType.BLIZZARD || gameEvent.type === GameEventType.DROUGHT) {
            gameEvent.remainingTicks = gameEvent.remainingTicks || 10;
            updatedActiveEvents.push(gameEvent);
          }

          if (gameEvent.type === GameEventType.BARBARIAN && guardCount2 > 0) {
            const blockChance = Math.min(0.8, guardCount2 * 0.2);
            if (Math.random() < blockChance) {
              gameEvent.description = `蛮族来袭，但被${guardCount2}座警卫塔成功击退！无人伤亡！`;
              gameEvent.severity = 'good';
              if (eventResult.populationLoss) {
                eventResult.populationLoss = 0;
              }
              happiness = Math.min(100, happiness + 3);
            }
          }

          const notification: GameNotification = {
            id: `notif-${++notificationIdCounter}-${Date.now()}`,
            event: { ...gameEvent, description },
            timestamp: Date.now(),
            read: false,
          };
          newNotifications.unshift(notification);
          if (newNotifications.length > 50) {
            newNotifications = newNotifications.slice(0, 50);
          }
          newLastEventTick = newTickCount;
        }
      }
    }

    // Update pedestrians
    const newPedestrians = updatePedestrians(state.pedestrians, newMap);

    const workersAvailable = Math.max(0, newPopulation - totalWorkersNeeded);

    // Check for building unlocks based on population
    let newUnlockedBuildings = [...state.unlockedBuildings];
    for (const [buildingType, unlockReq] of Object.entries(BUILDING_UNLOCKS)) {
      if (!newUnlockedBuildings.includes(buildingType as BuildingType)) {
        if (unlockReq.population && newPopulation >= unlockReq.population) {
          if (!unlockReq.tech || newUnlockedBuildings.includes(BuildingType.POTTERY_WORKSHOP)) {
            newUnlockedBuildings.push(buildingType as BuildingType);
            // Add notification
            const def = BUILDING_DEFS[buildingType];
            if (def) {
              const notification: GameNotification = {
                id: `unlock-${buildingType}-${Date.now()}`,
                event: {
                  type: GameEventType.IMMIGRANTS,
                  title: '建筑解锁',
                  emoji: def.emoji,
                  description: `新建筑已解锁：${def.name}！`,
                  tickOccurred: newTickCount,
                  severity: 'good',
                },
                timestamp: Date.now(),
                read: false,
              };
              newNotifications.unshift(notification);
            }
          }
        }
      }
    }

    set({
      map: newMap,
      resources: newResources,
      totalResourcesProduced: newTotalProduced,
      population: newPopulation,
      maxPopulation: maxPop,
      peakPopulation,
      happiness,
      highestPopulation: highestPop,
      currentRank,
      tickCount: newTickCount,
      victoryNotification,
      notifications: newNotifications,
      activeEvents: updatedActiveEvents,
      lastEventTick: newLastEventTick,
      pedestrians: newPedestrians,
      workersNeeded: totalWorkersNeeded,
      workersAvailable,
      storageCapacity: storageCap,
      // Season
      currentSeason: newSeason,
      daysInSeason: newDaysInSeason,
      year: newYear,
      isSowingSeason,
      isHarvestSeason,
      winterWarning,
      // Tech & unlocks
      unlockedBuildings: newUnlockedBuildings,
      eventForecasts: updatedForecasts,
      disastersSurvived,
    });
  },

  getProductionRates: () => {
    const state = get();
    const rates: ProductionRates = {
      food: 0, wood: 0, stone: 0, pottery: 0, gold: 0,
      wheat: 0, flour: 0, bread: 0, clay: 0, iron: 0, tools: 0,
      workersNeeded: 0, workersAvailable: 0, workerEfficiency: 1,
      seasonMultiplier: SEASON_EFFECTS[state.currentSeason].farmMultiplier,
    };

    const totalWorkersNeeded = calculateWorkersNeeded(state.map);
    const workerEfficiency = totalWorkersNeeded > 0
      ? Math.min(1, state.population / totalWorkersNeeded)
      : (state.population > 0 ? 1 : 0);
    rates.workersNeeded = totalWorkersNeeded;
    rates.workersAvailable = Math.max(0, state.population - totalWorkersNeeded);
    rates.workerEfficiency = workerEfficiency;

    const seasonMultiplier = SEASON_EFFECTS[state.currentSeason].farmMultiplier;

    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        const tile = state.map[y][x];
        if (!tile.building) continue;
        const def = BUILDING_DEFS[tile.building];
        if (!def) continue;

        if (def.production) {
          let canProduce = true;
          if (def.needsNearby) {
            if (def.needsNearby.resource === 'well_water') {
              canProduce = findNearbyBuilding(state.map, x, y, BuildingType.WELL, def.needsNearby.range);
            } else if (def.needsNearby.type === BuildingType.WAREHOUSE) {
              canProduce = findNearbyBuilding(state.map, x, y, BuildingType.WAREHOUSE, def.needsNearby.range);
            }
          }
          // Check for required nearby terrain (e.g., Fisher Hut needs water)
          if (canProduce && def.needsNearbyTerrain) {
            canProduce = findNearbyTerrain(state.map, x, y, def.needsNearbyTerrain.type, def.needsNearbyTerrain.range);
          }
          if (canProduce && !ROAD_EXEMPT_BUILDINGS.has(tile.building)) {
            canProduce = hasRoadAccess(state.map, x, y);
          }
          if (canProduce) {
            if (def.production.wheat) rates.wheat += def.production.wheat * seasonMultiplier;
            if (def.production.food) rates.food += def.production.food;
            if (def.production.wood) rates.wood += def.production.wood;
            if (def.production.stone) rates.stone += def.production.stone;
            if (def.production.pottery) rates.pottery += def.production.pottery;
            if (def.production.clay) rates.clay += def.production.clay;
            if (def.production.iron) rates.iron += def.production.iron;
            if (def.production.tools) rates.tools += def.production.tools;
          }
        }

        if (tile.building === BuildingType.TAX_OFFICE && def.range) {
          if (hasRoadAccess(state.map, x, y) && workerEfficiency > 0) {
            let nearbyPop = 0;
            for (let dy = -def.range; dy <= def.range; dy++) {
              for (let dx = -def.range; dx <= def.range; dx++) {
                const dist = Math.abs(dx) + Math.abs(dy);
                if (dist <= def.range) {
                  const tx = x + dx;
                  const ty = y + dy;
                  if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
                    if (state.map[ty][tx].building === BuildingType.HOUSE) {
                      const hLevel = state.map[ty][tx].houseLevel || 0;
                      const lvl = HOUSE_LEVELS[Math.min(hLevel, HOUSE_LEVELS.length - 1)];
                      nearbyPop += lvl.populationCapacity;
                    }
                  }
                }
              }
            }
            const popRatio = state.population > 0 ? Math.min(1, nearbyPop / Math.max(1, state.population)) : 0;
            const taxGold = Math.floor(5 * Math.ceil(state.population / 10) * popRatio * workerEfficiency);
            rates.gold += taxGold;
          }
        }
      }
    }

    return rates;
  },

  getCurrentRank: () => {
    const { population, highestPopulation } = get();
    for (let i = VICTORY_TIERS.length - 1; i >= 0; i--) {
      const tier = VICTORY_TIERS[i];
      if (population >= tier.population || highestPopulation >= tier.population) {
        return tier.name;
      }
    }
    return '小村长';
  },

  getBuildingCounts: () => {
    const state = get();
    const counts: Record<string, number> = {};
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        const building = state.map[y][x].building;
        if (building) {
          counts[building] = (counts[building] || 0) + 1;
        }
      }
    }
    return counts;
  },

  getSeasonInfo: () => {
    const state = get();
    return {
      season: state.currentSeason,
      daysRemaining: SEASON_LENGTH - state.daysInSeason,
      effect: SEASON_EFFECTS[state.currentSeason],
    };
  },
}));
