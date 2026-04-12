// ===== 傻子大帝 - Game Constants =====
import { BuildingType, TerrainType, GameEventType, Season, TechType, type BuildingDef, type Resources, type VictoryTier, type EventDef, type Tech, type Achievement, type NeighborCity, type Trader, type TradeOffer } from './types';

// Map
export const MAP_SIZE = 60;
export const TILE_WIDTH = 48;
export const TILE_HEIGHT = 48;

// Starting resources
export const STARTING_RESOURCES: Resources = {
  food: 100,
  wood: 50,
  stone: 30,
  pottery: 0,
  gold: 500,
  wheat: 20,
  flour: 0,
  bread: 0,
  clay: 0,
  iron: 0,
  tools: 0,
};

// ===== 季节系统常量 =====
export const SEASON_LENGTH = 30; // 每个季节持续30tick
export const SEASONS: Season[] = [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER];
export const SEASON_EFFECTS: Record<Season, {
  farmMultiplier: number;
  foodConsumptionMultiplier: number;
  description: string;
  emoji: string;
}> = {
  [Season.SPRING]: {
    farmMultiplier: 0.7,
    foodConsumptionMultiplier: 1.0,
    description: '春季 - 播种季节',
    emoji: '🌸',
  },
  [Season.SUMMER]: {
    farmMultiplier: 1.0,
    foodConsumptionMultiplier: 1.0,
    description: '夏季 - 正常生长',
    emoji: '☀️',
  },
  [Season.AUTUMN]: {
    farmMultiplier: 1.5,
    foodConsumptionMultiplier: 1.0,
    description: '秋季 - 丰收季节',
    emoji: '🍂',
  },
  [Season.WINTER]: {
    farmMultiplier: 0,
    foodConsumptionMultiplier: 1.2,
    description: '冬季 - 储备过冬',
    emoji: '❄️',
  },
};
export const WINTER_WARNING_DAYS = 10; // 入冬前10天预警

// Game speeds (ms per tick)
export const GAME_SPEEDS: Record<number, number> = {
  0: 0,      // paused
  1: 1000,   // 1x
  2: 500,    // 2x
  3: 333,    // 3x
};

// Victory tiers
export const VICTORY_TIERS: VictoryTier[] = [
  { name: '小村长', population: 100, emoji: '🏘️' },
  { name: '城镇总督', population: 200, emoji: '🏛️' },
  { name: '行省总督', population: 500, emoji: '👑' },
  { name: '傻子大帝', population: 1000, emoji: '👑' },
];

// ===== 科技系统定义 =====
export const TECH_DEFS: Record<TechType, Tech> = {
  [TechType.POTTERY_MASTERY]: {
    id: TechType.POTTERY_MASTERY,
    name: '制陶工艺',
    description: '提升陶器工坊产出50%',
    emoji: '🏺',
    researchCost: 50,
    researchProgress: 0,
    isResearched: false,
    effects: [{ type: 'production_bonus', value: 1.5, building: BuildingType.POTTERY_WORKSHOP }],
  },
  [TechType.IRON_WORKING]: {
    id: TechType.IRON_WORKING,
    name: '炼铁术',
    description: '解锁铁矿和铁匠铺',
    emoji: '⚒️',
    researchCost: 80,
    researchProgress: 0,
    isResearched: false,
    effects: [{ type: 'unlock_building', value: 1, building: BuildingType.IRON_MINE }],
  },
  [TechType.ADVANCED_FARMING]: {
    id: TechType.ADVANCED_FARMING,
    name: '先进农业',
    description: '农场产出+30%，磨坊效率+20%',
    emoji: '🌾',
    researchCost: 60,
    researchProgress: 0,
    isResearched: false,
    effects: [
      { type: 'production_bonus', value: 1.3, building: BuildingType.FARM },
      { type: 'production_bonus', value: 1.2, building: BuildingType.MILL },
    ],
  },
  [TechType.ROAD_ENGINEERING]: {
    id: TechType.ROAD_ENGINEERING,
    name: '道路工程',
    description: '道路建设成本-30%，增加道路吸引力',
    emoji: '🛤️',
    researchCost: 40,
    researchProgress: 0,
    isResearched: false,
    effects: [{ type: 'cost_reduction', value: 0.7, building: BuildingType.ROAD }],
  },
  [TechType.WATER_MANAGEMENT]: {
    id: TechType.WATER_MANAGEMENT,
    name: '水利工程',
    description: '水井范围+2，所有建筑舒适度+5',
    emoji: '💧',
    researchCost: 50,
    researchProgress: 0,
    isResearched: false,
    effects: [{ type: 'happiness_bonus', value: 5 }],
  },
  [TechType.TRADE_NETWORK]: {
    id: TechType.TRADE_NETWORK,
    name: '贸易网络',
    description: '市场税收+50%，解锁邻城外交',
    emoji: '🤝',
    researchCost: 70,
    researchProgress: 0,
    isResearched: false,
    effects: [{ type: 'production_bonus', value: 1.5, building: BuildingType.MARKET }],
  },
  [TechType.MILITARY_TACTICS]: {
    id: TechType.MILITARY_TACTICS,
    name: '军事战术',
    description: '警卫塔防御效果翻倍，蛮族入侵概率-30%',
    emoji: '⚔️',
    researchCost: 90,
    researchProgress: 0,
    isResearched: false,
    effects: [{ type: 'happiness_bonus', value: 10, building: BuildingType.GUARD_TOWER }],
  },
  [TechType.RELIGIOUS_STUDIES]: {
    id: TechType.RELIGIOUS_STUDIES,
    name: '宗教研究',
    description: '神庙幸福度+100%，研究速度+25%',
    emoji: '🏛️',
    researchCost: 80,
    researchProgress: 0,
    isResearched: false,
    effects: [{ type: 'happiness_bonus', value: 10, building: BuildingType.TEMPLE }],
  },
};

// ===== 建筑解锁条件 =====
export const BUILDING_UNLOCKS: Record<BuildingType, { population?: number; tech?: TechType; building?: BuildingType }> = {
  [BuildingType.POTTERY_WORKSHOP]: { population: 50 },
  [BuildingType.MARKET]: { population: 50 },
  [BuildingType.TEMPLE]: { population: 150 },
  [BuildingType.TAX_OFFICE]: { population: 150 },
  [BuildingType.FIRE_STATION]: { population: 150 },
  [BuildingType.GUARD_TOWER]: { population: 150 },
  [BuildingType.UNIVERSITY]: { population: 500 },
  [BuildingType.MILL]: { population: 80 },
  [BuildingType.BAKERY]: { population: 100 },
  [BuildingType.CLAY_PIT]: { population: 60 },
  [BuildingType.IRON_MINE]: { population: 200, tech: TechType.IRON_WORKING },
  [BuildingType.BLACKSMITH]: { population: 250, tech: TechType.IRON_WORKING },
  // 前期食物建筑
  [BuildingType.FISHER_HUT]: { population: 20 },
};

// 初始解锁建筑
export const INITIAL_UNLOCKED_BUILDINGS: BuildingType[] = [
  BuildingType.ROAD,
  BuildingType.HOUSE,
  BuildingType.FARM,
  BuildingType.WELL,
  BuildingType.WAREHOUSE,
  BuildingType.LUMBER_MILL,
  BuildingType.QUARRY,
  BuildingType.BRIDGE,
  BuildingType.GARDEN,
  // 前期食物建筑
  BuildingType.HUNTER_HUT,
];

// Building definitions
export const BUILDING_DEFS: Record<string, BuildingDef> = {
  [BuildingType.ROAD]: {
    type: BuildingType.ROAD,
    name: '道路',
    emoji: '🛤️',
    cost: { gold: 2, wood: 0, stone: 0 },
    color: '#8B7355',
  },
  [BuildingType.HOUSE]: {
    type: BuildingType.HOUSE,
    name: '住宅',
    emoji: '🏠',
    cost: { gold: 10, wood: 5, stone: 2 },
    color: '#D4A574',
    roofColor: '#8B4513',
    populationCapacity: 10,
  },
  [BuildingType.FARM]: {
    type: BuildingType.FARM,
    name: '农场',
    emoji: '🌾',
    cost: { gold: 15, wood: 3, stone: 0 },
    color: '#90EE90',
    production: { wheat: 3 },
    needsNearby: { type: BuildingType.WELL, range: 3, resource: 'well_water' },
    workersNeeded: 3,
  },
  [BuildingType.WELL]: {
    type: BuildingType.WELL,
    name: '水井',
    emoji: '⛲',
    cost: { gold: 8, wood: 1, stone: 2 },
    color: '#87CEEB',
    range: 3,
  },
  [BuildingType.WAREHOUSE]: {
    type: BuildingType.WAREHOUSE,
    name: '仓库',
    emoji: '📦',
    cost: { gold: 20, wood: 8, stone: 5 },
    color: '#8B4513',
    roofColor: '#654321',
    range: 5,
    storageBonus: 150,
  },
  [BuildingType.MARKET]: {
    type: BuildingType.MARKET,
    name: '市场',
    emoji: '🏪',
    cost: { gold: 25, wood: 5, stone: 3 },
    color: '#DAA520',
    roofColor: '#B8860B',
    happinessBonus: 8,
    range: 4,
  },
  [BuildingType.LUMBER_MILL]: {
    type: BuildingType.LUMBER_MILL,
    name: '伐木场',
    emoji: '🪓',
    cost: { gold: 20, wood: 0, stone: 2 },
    color: '#228B22',
    production: { wood: 2 },
    workersNeeded: 2,
  },
  [BuildingType.QUARRY]: {
    type: BuildingType.QUARRY,
    name: '采石场',
    emoji: '⛏️',
    cost: { gold: 20, wood: 2, stone: 0 },
    color: '#808080',
    production: { stone: 2 },
    workersNeeded: 3,
  },
  [BuildingType.POTTERY_WORKSHOP]: {
    type: BuildingType.POTTERY_WORKSHOP,
    name: '陶器工坊',
    emoji: '🏺',
    cost: { gold: 30, wood: 3, stone: 5 },
    color: '#CD853F',
    roofColor: '#A0522D',
    production: { pottery: 1 },
    needsNearby: { type: BuildingType.WAREHOUSE, range: 5 },
    workersNeeded: 2,
  },
  [BuildingType.TAX_OFFICE]: {
    type: BuildingType.TAX_OFFICE,
    name: '征税站',
    emoji: '💰',
    cost: { gold: 35, wood: 5, stone: 5 },
    color: '#B8860B',
    roofColor: '#8B6914',
    range: 5,
    workersNeeded: 1,
  },
  [BuildingType.TEMPLE]: {
    type: BuildingType.TEMPLE,
    name: '神庙',
    emoji: '🏛️',
    cost: { gold: 50, wood: 10, stone: 8 },
    color: '#F5F5F5',
    roofColor: '#FFD700',
    happinessBonus: 10,
    range: 5,
  },
  [BuildingType.GARDEN]: {
    type: BuildingType.GARDEN,
    name: '花园',
    emoji: '🌸',
    cost: { gold: 5, wood: 1, stone: 0 },
    color: '#32CD32',
    desirabilityBonus: 3,
  },
  [BuildingType.GUARD_TOWER]: {
    type: BuildingType.GUARD_TOWER,
    name: '警卫塔',
    emoji: '🗼',
    cost: { gold: 30, wood: 5, stone: 3 },
    color: '#696969',
    roofColor: '#555555',
    happinessBonus: 5,
    range: 5,
  },
  [BuildingType.FIRE_STATION]: {
    type: BuildingType.FIRE_STATION,
    name: '消防站',
    emoji: '🚒',
    cost: { gold: 40, wood: 8, stone: 5 },
    color: '#CC3333',
    roofColor: '#991111',
    happinessBonus: 3,
    range: 6,
  },
  [BuildingType.BRIDGE]: {
    type: BuildingType.BRIDGE,
    name: '桥梁',
    emoji: '🌉',
    cost: { gold: 15, wood: 5, stone: 3 },
    color: '#8B7355',
  },
  // ===== 新产业链建筑 =====
  [BuildingType.MILL]: {
    type: BuildingType.MILL,
    name: '磨坊',
    emoji: '🌀',
    cost: { gold: 25, wood: 6, stone: 4 },
    color: '#D2B48C',
    roofColor: '#8B7355',
    production: { flour: 1 },
    consumption: { wheat: 2 },
    productionChain: {
      input: { resource: 'wheat', amount: 2 },
      output: { resource: 'flour', amount: 1 },
    },
    needsNearby: { type: BuildingType.WELL, range: 4 },
    workersNeeded: 2,
  },
  [BuildingType.BAKERY]: {
    type: BuildingType.BAKERY,
    name: '面包房',
    emoji: '🥖',
    cost: { gold: 30, wood: 4, stone: 6 },
    color: '#DEB887',
    roofColor: '#CD853F',
    production: { bread: 1, food: 2 },
    consumption: { flour: 1 },
    productionChain: {
      input: { resource: 'flour', amount: 1 },
      output: { resource: 'bread', amount: 1 },
    },
    needsNearby: { type: BuildingType.WAREHOUSE, range: 4 },
    workersNeeded: 2,
  },
  [BuildingType.CLAY_PIT]: {
    type: BuildingType.CLAY_PIT,
    name: '粘土矿',
    emoji: '🟤',
    cost: { gold: 20, wood: 2, stone: 3 },
    color: '#8B4513',
    roofColor: '#654321',
    production: { clay: 2 },
    workersNeeded: 3,
  },
  [BuildingType.IRON_MINE]: {
    type: BuildingType.IRON_MINE,
    name: '铁矿',
    emoji: '⛏️',
    cost: { gold: 50, wood: 8, stone: 10 },
    color: '#556B2F',
    roofColor: '#2F4F4F',
    production: { iron: 1 },
    workersNeeded: 4,
    unlockCondition: { population: 200, tech: TechType.IRON_WORKING },
  },
  [BuildingType.BLACKSMITH]: {
    type: BuildingType.BLACKSMITH,
    name: '铁匠铺',
    emoji: '🔨',
    cost: { gold: 40, wood: 6, stone: 8 },
    color: '#708090',
    roofColor: '#2F4F4F',
    production: { tools: 1 },
    consumption: { iron: 1, clay: 1 },
    productionChain: {
      input: { resource: 'iron', amount: 1 },
      output: { resource: 'tools', amount: 1 },
    },
    needsNearby: { type: BuildingType.WAREHOUSE, range: 5 },
    workersNeeded: 3,
    unlockCondition: { population: 250, tech: TechType.IRON_WORKING },
  },
  [BuildingType.UNIVERSITY]: {
    type: BuildingType.UNIVERSITY,
    name: '大学',
    emoji: '🎓',
    cost: { gold: 100, wood: 15, stone: 20 },
    color: '#4169E1',
    roofColor: '#191970',
    happinessBonus: 15,
    range: 8,
    desirabilityBonus: 5,
  },
  // ===== 前期食物建筑 =====
  [BuildingType.HUNTER_HUT]: {
    type: BuildingType.HUNTER_HUT,
    name: '猎人小屋',
    emoji: '🏹',
    cost: { gold: 12, wood: 3, stone: 0 },
    color: '#8B4513',
    roofColor: '#654321',
    production: { food: 2 },
    needsNearbyTerrain: { type: TerrainType.FOREST, range: 2 },
    workersNeeded: 2,
  },
  [BuildingType.FISHER_HUT]: {
    type: BuildingType.FISHER_HUT,
    name: '渔人小屋',
    emoji: '🎣',
    cost: { gold: 10, wood: 4, stone: 0 },
    color: '#4682B4',
    production: { food: 3 },
    needsNearbyTerrain: { type: TerrainType.WATER, range: 2 },
    workersNeeded: 2,
  },
};

// Building order for UI
export const BUILD_ORDER: BuildingType[] = [
  BuildingType.HOUSE,
  BuildingType.ROAD,
  BuildingType.BRIDGE,
  // 前期食物建筑
  BuildingType.HUNTER_HUT,
  BuildingType.FISHER_HUT,
  BuildingType.FARM,
  BuildingType.WELL,
  BuildingType.WAREHOUSE,
  BuildingType.MARKET,
  BuildingType.LUMBER_MILL,
  BuildingType.QUARRY,
  BuildingType.POTTERY_WORKSHOP,
  BuildingType.TAX_OFFICE,
  BuildingType.TEMPLE,
  BuildingType.GARDEN,
  BuildingType.GUARD_TOWER,
  BuildingType.FIRE_STATION,
  // 产业链建筑
  BuildingType.MILL,
  BuildingType.BAKERY,
  BuildingType.CLAY_PIT,
  BuildingType.IRON_MINE,
  BuildingType.BLACKSMITH,
  BuildingType.UNIVERSITY,
];

// Desirability modifiers per building type
export const DESIRABILITY_EFFECTS: Record<string, number> = {
  [BuildingType.ROAD]: 1,
  [BuildingType.HOUSE]: 0,
  [BuildingType.FARM]: -1,
  [BuildingType.WELL]: 2,
  [BuildingType.WAREHOUSE]: -2,
  [BuildingType.MARKET]: 3,
  [BuildingType.LUMBER_MILL]: -3,
  [BuildingType.QUARRY]: -4,
  [BuildingType.POTTERY_WORKSHOP]: -2,
  [BuildingType.TAX_OFFICE]: -1,
  [BuildingType.TEMPLE]: 5,
  [BuildingType.GARDEN]: 4,
  [BuildingType.GUARD_TOWER]: 1,
  [BuildingType.FIRE_STATION]: 1,
  [BuildingType.BRIDGE]: 0,
  // 产业链建筑
  [BuildingType.MILL]: -2,
  [BuildingType.BAKERY]: 2,
  [BuildingType.CLAY_PIT]: -3,
  [BuildingType.IRON_MINE]: -4,
  [BuildingType.BLACKSMITH]: -2,
  [BuildingType.UNIVERSITY]: 5,
  // 前期食物建筑
  [BuildingType.HUNTER_HUT]: -1,
  [BuildingType.FISHER_HUT]: 0,
};

// Food consumption
export const FOOD_PER_PERSON_PER_TICK = 0.5;

// Storage system
export const BASE_STORAGE = 200;
export const WAREHOUSE_STORAGE_BONUS = 150;
export const GOLD_STORAGE_MULTIPLIER = 5;

// Trade options for market
export const TRADE_OPTIONS: { id: string; name: string; emoji: string; giveResource: keyof Resources; giveAmount: number; receiveResource: keyof Resources; receiveAmount: number }[] = [
  { id: 'sell_food', name: '出售食物', emoji: '🍞', giveResource: 'food', giveAmount: 10, receiveResource: 'gold', receiveAmount: 5 },
  { id: 'sell_wood', name: '出售木材', emoji: '🪵', giveResource: 'wood', giveAmount: 10, receiveResource: 'gold', receiveAmount: 4 },
  { id: 'sell_stone', name: '出售石材', emoji: '🪨', giveResource: 'stone', giveAmount: 10, receiveResource: 'gold', receiveAmount: 6 },
  { id: 'sell_pottery', name: '出售陶器', emoji: '🏺', giveResource: 'pottery', giveAmount: 5, receiveResource: 'gold', receiveAmount: 8 },
  { id: 'sell_bread', name: '出售面包', emoji: '🥖', giveResource: 'bread', giveAmount: 5, receiveResource: 'gold', receiveAmount: 10 },
  { id: 'sell_tools', name: '出售工具', emoji: '🔧', giveResource: 'tools', giveAmount: 3, receiveResource: 'gold', receiveAmount: 15 },
  { id: 'buy_food', name: '购买食物', emoji: '🍞', giveResource: 'gold', giveAmount: 5, receiveResource: 'food', receiveAmount: 10 },
  { id: 'buy_wood', name: '购买木材', emoji: '🪵', giveResource: 'gold', giveAmount: 4, receiveResource: 'wood', giveAmount: 10 },
  { id: 'buy_stone', name: '购买石材', emoji: '🪨', giveResource: 'gold', giveAmount: 6, receiveResource: 'stone', receiveAmount: 10 },
  { id: 'buy_pottery', name: '购买陶器', emoji: '🏺', giveResource: 'gold', giveAmount: 8, receiveResource: 'pottery', receiveAmount: 5 },
];

// Trade cooldown (ticks)
export const TRADE_COOLDOWN = 3;

// House level definitions
export const HOUSE_LEVELS = [
  { level: 0, name: '茅草屋',   populationCapacity: 10,  happinessReq: 0,   desirabilityReq: -999, color: '#D4A574', roofColor: '#8B4513' },
  { level: 1, name: '小屋',     populationCapacity: 15,  happinessReq: 35,  desirabilityReq: 0,    color: '#C9956B', roofColor: '#7A4020' },
  { level: 2, name: '砖房',     populationCapacity: 25,  happinessReq: 50,  desirabilityReq: 5,    color: '#B8845C', roofColor: '#6B3A18' },
  { level: 3, name: '大宅',     populationCapacity: 40,  happinessReq: 65,  desirabilityReq: 15,   color: '#A8734E', roofColor: '#5C3010' },
  { level: 4, name: '豪宅',     populationCapacity: 60,  happinessReq: 80,  desirabilityReq: 25,   color: '#E8D5B7', roofColor: '#B8860B' },
];

// Max pedestrians on the map
export const MAX_PEDESTRIANS = 30;

// Fire station fire reduction multiplier
export const FIRE_STATION_REDUCTION = 0.4;

// Max camera zoom
export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 3.0;

// Touch thresholds
export const TAP_THRESHOLD = 15;
export const LONG_PRESS_DURATION = 500;

// Auto-save interval
export const AUTO_SAVE_INTERVAL = 30000;

// Save key
export const SAVE_KEY = 'shazi-di-da-save';

// ===== 多存档系统常量 =====
export const SAVE_SLOTS_COUNT = 3;  // 存档位数量
export const SAVE_KEY_PREFIX = 'shazi-di-da-save-';  // 存档键前缀
export const SAVE_META_KEY = 'shazi-di-da-save-meta';  // 存档元信息键

// Terrain colors
export const TERRAIN_COLORS = {
  grass: '#4a8c3f',
  water: '#3b7dd8',
  desert: '#c2a64e',
  forest: '#2d6b2e',
};

// ===== 事件系统（扩展） =====
export interface EventDef {
  type: GameEventType;
  title: string;
  emoji: string;
  descriptionTemplate: string;
  severity: 'good' | 'bad' | 'neutral';
  weight: number;
  minPopulation: number;
  minBuildings: number;
  forecastable: boolean;
  forecastTicks: number; // 提前多少tick预报
  season?: Season; // 特定季节才能发生
}

export const EVENT_DEFS: EventDef[] = [
  {
    type: GameEventType.FIRE,
    title: '火灾',
    emoji: '🔥',
    descriptionTemplate: '大火烧毁了{count}座建筑！',
    severity: 'bad',
    weight: 15,
    minPopulation: 10,
    minBuildings: 1,
    forecastable: true,
    forecastTicks: 5,
  },
  {
    type: GameEventType.BARBARIAN,
    title: '蛮族入侵',
    emoji: '⚔️',
    descriptionTemplate: '蛮族来袭，{count}人不幸遇难！',
    severity: 'bad',
    weight: 15,
    minPopulation: 20,
    minBuildings: 0,
    forecastable: true,
    forecastTicks: 8,
  },
  {
    type: GameEventType.PLAGUE,
    title: '瘟疫',
    emoji: '😷',
    descriptionTemplate: '瘟疫蔓延，{count}人病亡，幸福度下降！',
    severity: 'bad',
    weight: 10,
    minPopulation: 20,
    minBuildings: 0,
    forecastable: true,
    forecastTicks: 10,
  },
  {
    type: GameEventType.EARTHQUAKE,
    title: '地震',
    emoji: '💥',
    descriptionTemplate: '地震摧毁了{count}座建筑！',
    severity: 'bad',
    weight: 10,
    minPopulation: 10,
    minBuildings: 2,
    forecastable: true,
    forecastTicks: 12,
  },
  {
    type: GameEventType.GOOD_HARVEST,
    title: '丰收',
    emoji: '🌾',
    descriptionTemplate: '风调雨顺，获得{count}食物！',
    severity: 'good',
    weight: 20,
    minPopulation: 10,
    minBuildings: 0,
    forecastable: true,
    forecastTicks: 3,
  },
  {
    type: GameEventType.GOLD_DISCOVERY,
    title: '发现金矿',
    emoji: '💰',
    descriptionTemplate: '矿工发现了金矿脉，获得{count}金币！',
    severity: 'good',
    weight: 15,
    minPopulation: 10,
    minBuildings: 0,
    forecastable: true,
    forecastTicks: 5,
  },
  {
    type: GameEventType.IMMIGRANTS,
    title: '移民到来',
    emoji: '👥',
    descriptionTemplate: '一批移民慕名而来，增加了{count}人口！',
    severity: 'good',
    weight: 15,
    minPopulation: 10,
    minBuildings: 0,
    forecastable: false,
    forecastTicks: 0,
  },
  {
    type: GameEventType.BLIZZARD,
    title: '暴风雪',
    emoji: '🌨️',
    descriptionTemplate: '暴风雪来袭，{count}人冻死，食物消耗翻倍！',
    severity: 'bad',
    weight: 25,
    minPopulation: 15,
    minBuildings: 0,
    forecastable: true,
    forecastTicks: 15,
    season: Season.WINTER,
  },
  {
    type: GameEventType.DROUGHT,
    title: '干旱',
    emoji: '☀️',
    descriptionTemplate: '持续干旱，农场产出减半，持续{count}天！',
    severity: 'bad',
    weight: 20,
    minPopulation: 20,
    minBuildings: 1,
    forecastable: true,
    forecastTicks: 8,
    season: Season.SUMMER,
  },
];

// ===== 成就系统定义 =====
export const ACHIEVEMENT_DEFS: Achievement[] = [
  {
    id: 'food_tycoon',
    name: '粮食大亨',
    description: '累计生产10000单位食物',
    emoji: '🌾',
    isUnlocked: false,
    condition: { type: 'resource_total', target: 10000, resource: 'food' },
  },
  {
    id: 'gold_rush',
    name: '淘金热',
    description: '累计获得5000金币',
    emoji: '💰',
    isUnlocked: false,
    condition: { type: 'resource_total', target: 5000, resource: 'gold' },
  },
  {
    id: 'city_planner',
    name: '城市规划师',
    description: '单城人口超过500',
    emoji: '🏙️',
    isUnlocked: false,
    condition: { type: 'population_peak', target: 500 },
  },
  {
    id: 'empire_builder',
    name: '帝国缔造者',
    description: '人口达到1000',
    emoji: '👑',
    isUnlocked: false,
    condition: { type: 'population_peak', target: 1000 },
  },
  {
    id: 'survivor',
    name: '劫后余生',
    description: '经历3次灾难后人口反弹超过200%',
    emoji: '🛡️',
    isUnlocked: false,
    condition: { type: 'survival', target: 3 },
  },
  {
    id: 'tech_scholar',
    name: '学术泰斗',
    description: '研究完成5项科技',
    emoji: '📚',
    isUnlocked: false,
    condition: { type: 'tech_count', target: 5 },
  },
  {
    id: 'builder',
    name: '建筑大师',
    description: '建造100座建筑',
    emoji: '🏗️',
    isUnlocked: false,
    condition: { type: 'building_count', target: 100 },
  },
  {
    id: 'bread_master',
    name: '面包大师',
    description: '累计生产500个面包',
    emoji: '🥖',
    isUnlocked: false,
    condition: { type: 'resource_total', target: 500, resource: 'bread' },
  },
  {
    id: 'iron_age',
    name: '铁器时代',
    description: '累计生产200单位铁器',
    emoji: '⚒️',
    isUnlocked: false,
    condition: { type: 'resource_total', target: 200, resource: 'iron' },
  },
  {
    id: 'first_year',
    name: '元年',
    description: '度过完整的四季',
    emoji: '📅',
    isUnlocked: false,
    condition: { type: 'custom', target: 120 }, // 120 ticks = 1 year
  },
];

// ===== 贸易商队系统 =====
export const TRADER_NAMES = [
  { name: '威尼斯商人', emoji: '🧔' },
  { name: '丝绸之路商队', emoji: '🐫' },
  { name: '阿拉伯商团', emoji: '🧕' },
  { name: '草原马帮', emoji: '🐎' },
  { name: '海上贸易商', emoji: '⛵' },
];

export const TRADER_GOODS: TradeOffer[] = [
  { id: 'exotic_food', giveResource: 'gold', giveAmount: 50, receiveResource: 'food', receiveAmount: 100, quantity: 3 },
  { id: 'exotic_wood', giveResource: 'gold', giveAmount: 40, receiveResource: 'wood', receiveAmount: 100, quantity: 3 },
  { id: 'buy_pottery', giveResource: 'gold', giveAmount: 80, receiveResource: 'pottery', receiveAmount: 50, quantity: 2 },
  { id: 'buy_tools', giveResource: 'gold', giveAmount: 150, receiveResource: 'tools', receiveAmount: 30, quantity: 2 },
  { id: 'sell_bread', giveResource: 'bread', giveAmount: 50, receiveResource: 'gold', receiveAmount: 100, quantity: 2 },
];

export const TRADER_INTERVAL_MIN = 30;
export const TRADER_INTERVAL_MAX = 50;
export const TRADER_STAY_DURATION = 10;

// ===== 邻城系统 =====
export const NEIGHBOR_CITIES: NeighborCity[] = [
  { id: 'north_kingdom', name: '北境王国', emoji: '🏰', relation: 0, tradeBonus: 0, isHostile: false },
  { id: 'east_empire', name: '东方帝国', emoji: '🐉', relation: 0, tradeBonus: 0, isHostile: false },
  { id: 'west_tribes', name: '西部部落', emoji: '🏹', relation: 0, tradeBonus: 0, isHostile: false },
];

// ===== 事件预测准备度计算 =====
export const EVENT_PREPARATION: Record<GameEventType, {
  keyBuilding: BuildingType;
  keyFactor: string;
  description: string;
}> = {
  [GameEventType.FIRE]: {
    keyBuilding: BuildingType.FIRE_STATION,
    keyFactor: 'fireCoverage',
    description: '消防站覆盖率',
  },
  [GameEventType.BARBARIAN]: {
    keyBuilding: BuildingType.GUARD_TOWER,
    keyFactor: 'guardCount',
    description: '警卫塔数量',
  },
  [GameEventType.PLAGUE]: {
    keyBuilding: BuildingType.TEMPLE,
    keyFactor: 'templeWellCount',
    description: '神庙+水井数量',
  },
  [GameEventType.BLIZZARD]: {
    keyBuilding: BuildingType.WAREHOUSE,
    keyFactor: 'foodStorage',
    description: '食物储备量',
  },
  [GameEventType.DROUGHT]: {
    keyBuilding: BuildingType.WELL,
    keyFactor: 'wellCount',
    description: '水井数量',
  },
};
