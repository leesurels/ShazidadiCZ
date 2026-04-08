// ===== 傻子大帝 - Game Types =====

export enum TerrainType {
  GRASS = 'grass',
  WATER = 'water',
  DESERT = 'desert',
  FOREST = 'forest',
}

export enum BuildingType {
  ROAD = 'road',
  HOUSE = 'house',
  FARM = 'farm',
  WELL = 'well',
  WAREHOUSE = 'warehouse',
  MARKET = 'market',
  LUMBER_MILL = 'lumber_mill',
  QUARRY = 'quarry',
  POTTERY_WORKSHOP = 'pottery_workshop',
  TAX_OFFICE = 'tax_office',
  TEMPLE = 'temple',
  GARDEN = 'garden',
  GUARD_TOWER = 'guard_tower',
  FIRE_STATION = 'fire_station',
  BRIDGE = 'bridge',
  DEMOLISH = 'demolish',
  // 新产业链建筑
  MILL = 'mill',           // 磨坊：小麦→面粉
  BAKERY = 'bakery',       // 面包房：面粉→面包
  CLAY_PIT = 'clay_pit',   // 粘土矿：产出粘土
  IRON_MINE = 'iron_mine', // 铁矿：产出铁矿
  BLACKSMITH = 'blacksmith', // 铁匠铺：铁+粘土→工具
  UNIVERSITY = 'university', // 大学：加速科技研究
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
}

export enum TechType {
  POTTERY_MASTERY = 'pottery_mastery',
  IRON_WORKING = 'iron_working',
  ADVANCED_FARMING = 'advanced_farming',
  ROAD_ENGINEERING = 'road_engineering',
  WATER_MANAGEMENT = 'water_management',
  TRADE_NETWORK = 'trade_network',
  MILITARY_TACTICS = 'military_tactics',
  RELIGIOUS_STUDIES = 'religious_studies',
}

export enum GameEventType {
  FIRE = 'fire',
  BARBARIAN = 'barbarian',
  PLAGUE = 'plague',
  EARTHQUAKE = 'earthquake',
  GOOD_HARVEST = 'good_harvest',
  GOLD_DISCOVERY = 'gold_discovery',
  IMMIGRANTS = 'immigrants',
  BLIZZARD = 'blizzard', // 暴风雪（冬季特有）
  DROUGHT = 'drought',   // 干旱（夏季特有）
}

export interface GameEvent {
  type: GameEventType;
  title: string;
  emoji: string;
  description: string;
  tickOccurred: number;
  severity: 'good' | 'bad' | 'neutral';
  remainingTicks?: number;
}

export interface GameNotification {
  id: string;
  event: GameEvent;
  timestamp: number;
  read: boolean;
}

// ===== 资源系统（扩展） =====
export interface Resources {
  // 基础资源
  food: number;
  wood: number;
  stone: number;
  pottery: number;
  gold: number;
  // 产业链资源
  wheat?: number;     // 小麦（农场产出）
  flour?: number;    // 面粉（磨坊产出）
  bread?: number;     // 面包（面包房产出）
  clay?: number;      // 粘土（粘土矿产出）
  iron?: number;      // 铁矿（铁矿产出）
  tools?: number;     // 工具（铁匠铺产出）
}

// ===== 科技系统 =====
export interface Tech {
  id: TechType;
  name: string;
  description: string;
  emoji: string;
  researchCost: number; // 研究所需tick数
  researchProgress: number; // 当前研究进度
  isResearched: boolean;
  effects: TechEffect[];
}

export interface TechEffect {
  type: 'production_bonus' | 'cost_reduction' | 'unlock_building' | 'happiness_bonus';
  value: number;
  building?: BuildingType;
}

// ===== 事件预测系统 =====
export interface EventForecast {
  id: string;
  eventType: GameEventType;
  predictedTick: number;
  severity: 'minor' | 'major' | 'catastrophic';
  preparationScore: number; // 0-100
  warnings: string[];
  isActive: boolean;
}

// ===== 商队与贸易系统 =====
export interface Trader {
  id: string;
  name: string;
  emoji: string;
  arrivalTick: number;
  departureTick: number;
  goods: TradeOffer[];
  mood: 'friendly' | 'neutral' | 'hostile';
}

export interface TradeOffer {
  id: string;
  giveResource: string;
  giveAmount: number;
  receiveResource: string;
  receiveAmount: number;
  quantity: number; // 可交易次数
}

export interface NeighborCity {
  id: string;
  name: string;
  emoji: string;
  relation: number; // -100 to 100
  tradeBonus: number; // 贸易折扣百分比
  isHostile: boolean;
}

// ===== 成就系统 =====
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  condition: AchievementCondition;
}

export interface AchievementCondition {
  type: 'resource_total' | 'population_peak' | 'survival' | 'building_count' | 'tech_count' | 'custom';
  target?: number;
  resource?: string;
  building?: BuildingType;
  comparison?: 'gte' | 'eq';
}

// ===== 建筑定义扩展 =====
export interface BuildingCost {
  gold: number;
  wood: number;
  stone: number;
  wheat?: number;
  flour?: number;
  clay?: number;
  iron?: number;
  tools?: number;
}

export interface BuildingDef {
  type: BuildingType;
  name: string;
  emoji: string;
  cost: BuildingCost;
  color: string;
  roofColor?: string;
  production?: Partial<Resources>;
  consumption?: Partial<Resources>; // 原料消耗
  happinessBonus?: number;
  desirabilityBonus?: number;
  populationCapacity?: number;
  range?: number;
  needsNearby?: { type: BuildingType; range: number; resource?: string };
  workersNeeded?: number;
  storageBonus?: number;
  requiredTech?: TechType; // 需要科技解锁
  unlockCondition?: { population?: number; building?: BuildingType };
  // 产业链相关
  productionChain?: {
    input?: { resource: keyof Resources; amount: number };
    output?: { resource: keyof Resources; amount: number };
  };
}

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  building: BuildingType | null;
  desirability: number;
  happinessBonus: number;
  houseLevel: number;
  // 建筑实例数据
  workersAssigned?: number;
  productionProgress?: number;
}

// ===== 游戏状态扩展 =====
export interface GameState {
  // Map
  map: Tile[][];
  mapSize: number;

  // Resources
  resources: Resources;
  totalResourcesProduced: Partial<Record<keyof Resources, number>>; // 累计产出

  // Population
  population: number;
  maxPopulation: number;
  populationGrowthRate: number;
  peakPopulation: number; // 历史最高人口

  // Workers
  workersNeeded: number;
  workersAvailable: number;
  workerAssignments: Record<string, number>; // buildingId -> workers

  // Storage
  storageCapacity: number;

  // Happiness
  happiness: number;

  // Game control
  gameSpeed: number;
  isRunning: boolean;
  selectedBuilding: BuildingType | null;
  isDemolishMode: boolean;

  // Camera
  cameraX: number;
  cameraY: number;
  zoom: number;

  // Victory
  currentRank: string;
  highestPopulation: number;

  // UI state
  showStartScreen: boolean;
  showStatsPanel: boolean;
  selectedTile: { x: number; y: number } | null;
  showBuildingInfo: boolean;
  showMarketTrade: boolean;
  showTechPanel: boolean;
  showEventForecast: boolean;
  showAchievementPanel: boolean;
  showTraderPanel: boolean;
  victoryNotification: string | null;

  // Timing
  tickCount: number;
  lastTradeTick: number;

  // ===== 季节与农业系统 =====
  currentSeason: Season;
  daysInSeason: number; // 当前季节已过天数
  year: number;
  isSowingSeason: boolean; // 播种季（春季）
  isHarvestSeason: boolean; // 收获季（秋季）
  winterWarning: boolean; // 冬季预警

  // ===== 科技系统 =====
  unlockedBuildings: BuildingType[];
  researchedTechs: TechType[];
  currentResearch: TechType | null;
  researchProgress: number;

  // ===== 事件预测系统 =====
  eventForecasts: EventForecast[];
  lastForecastTick: number;

  // Events & Notifications
  notifications: GameNotification[];
  activeEvents: GameEvent[];
  lastEventTick: number;

  // ===== 贸易系统 =====
  currentTrader: Trader | null;
  neighborCities: NeighborCity[];

  // ===== 成就系统 =====
  achievements: Achievement[];
  unlockedAchievements: string[];

  // Pedestrians
  pedestrians: Pedestrian[];

  // ===== 历史统计 =====
  buildingsDestroyed: number;
  disastersSurvived: number;
}

export interface TradeOption {
  id: string;
  name: string;
  emoji: string;
  giveResource: keyof Resources;
  giveAmount: number;
  receiveResource: keyof Resources;
  receiveAmount: number;
}

export interface ProductionRates {
  food: number;
  wood: number;
  stone: number;
  pottery: number;
  gold: number;
  wheat: number;
  flour: number;
  bread: number;
  clay: number;
  iron: number;
  tools: number;
  workersNeeded: number;
  workersAvailable: number;
  workerEfficiency: number;
  seasonMultiplier: number;
}

export interface VictoryTier {
  name: string;
  population: number;
  emoji: string;
}

export interface Pedestrian {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
  isFirefighter: boolean;
}

export interface RenderState {
  highlightedTile: { x: number; y: number } | null;
  buildingRangePreview: { x: number; y: number; range: number } | null;
  demolishPreview: boolean;
  animationTime: number;
  pedestrians: Pedestrian[];
}
