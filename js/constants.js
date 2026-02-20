// Level Configuration
const LEVEL_CONFIGS = [
    // 1. Meadow: Fence, Bee
    { level: 1, theme: 'meadow', icon: '🌿', target: 500, speed: 5.0, spawnRate: 120, obstacles: [0, 10] },
    
    // 2. Beach: Crab, Seagull
    { level: 2, theme: 'beach', icon: '🏖️', target: 750, speed: 5.5, spawnRate: 110, obstacles: [1, 11] },
    
    // 3. Farm: Hay Bale, Crow
    { level: 3, theme: 'farm', icon: '🚜', target: 1000, speed: 6.0, spawnRate: 105, obstacles: [2, 12] },
    
    // 4. City: Hydrant, Drone
    { level: 4, theme: 'city', icon: '🏢', target: 1250, speed: 6.5, spawnRate: 100, obstacles: [3, 13] },
    
    // 5. Desert: Cactus, Vulture
    { level: 5, theme: 'desert', icon: '🌵', target: 1500, speed: 7.0, spawnRate: 95, obstacles: [4, 14] },
    
    // 6. Snow: Snowman, Penguin (Sliding)
    { level: 6, theme: 'snow', icon: '⛄', target: 1750, speed: 7.5, spawnRate: 90, obstacles: [5, 15] },
    
    // 7. Forest: Stump, Bat
    { level: 7, theme: 'forest', icon: '🌲', target: 2000, speed: 8.0, spawnRate: 85, obstacles: [6, 16] },
    
    // 8. Volcano: Lava Rock, Fire Bat
    { level: 8, theme: 'volcano', icon: '🌋', target: 2250, speed: 8.5, spawnRate: 80, obstacles: [7, 17] },
    
    // 9. Space: Alien Rock, UFO
    { level: 9, theme: 'space', icon: '🚀', target: 2500, speed: 9.0, spawnRate: 75, obstacles: [8, 18] },
    
    // 10. Rainbow: Cloud, Unicorn Bird
    { level: 10, theme: 'rainbow', icon: '🌈', target: 3000, speed: 10.0, spawnRate: 60, obstacles: [9, 19] },

    // 11. Zombie City: Ruined City, Zombies
    { level: 11, theme: 'zombie', icon: '🧟', target: 3500, speed: 10.5, spawnRate: 65, obstacles: [20, 21] }
];

// Theme Colors
const THEME_COLORS = {
    meadow: { ground: '#8BC34A', decor: '#689F38' },
    beach:  { ground: '#FFEB3B', decor: '#4FC3F7' },
    farm:   { ground: '#795548', decor: '#FF9800' },
    city:   { ground: '#9E9E9E', decor: '#616161' },
    desert: { ground: '#E65100', decor: '#F57C00' },
    snow:   { ground: '#E0F7FA', decor: '#B2EBF2' },
    forest: { ground: '#1B5E20', decor: '#2E7D32' },
    volcano:{ ground: '#3E2723', decor: '#BF360C' },
    space:  { ground: '#311B92', decor: '#6200EA' },
    rainbow:{ ground: '#F48FB1', decor: '#CE93D8' },
    zombie: { ground: '#424242', decor: '#212121' }
};

// Game Constants
const CONSTANTS = {
    gravity: 0.6,
    jumpForce: -12,
    doubleJumpForce: -10,
    groundHeight: 100,
    invincibleTime: 60,
    meterScale: 0.1,
    slideDuration: 40
};

// Achievements Config
const ACHIEVEMENT_DEFS = [
    { id: 'first_win', icon: '🌱', title: '初次胜利', desc: '第一次完成一局游戏' },
    { id: 'dist_500', icon: '🏃', title: '小小跑者', desc: '单局跑过 500 米' },
    { id: 'dist_1000', icon: '🐎', title: '千里马', desc: '单局跑过 1000 米' },
    { id: 'shield_save', icon: '🛡️', title: '幸运护盾', desc: '使用护盾抵挡一次伤害' },
    { id: 'magnet_lover', icon: '🧲', title: '吸金小能手', desc: '使用磁铁吸取 5 个物品' },
    { id: 'endless_master', icon: '♾️', title: '无尽挑战者', desc: '在无尽模式跑过 2000 米' },
    { id: 'daily_3_days', icon: '📅', title: '坚持不懈', desc: '在 3 个不同的日子进行过挑战' },
    { id: 'daily_marathon', icon: '🏃‍♀️', title: '每日马拉松', desc: '单日累计奔跑距离超过 5000 米' }
];

// Powerup Config
const POWERUP_TYPES = ['heart', 'magnet', 'shield', 'mushroom', 'potion', 'star'];

// Skins Configuration
const SKINS = [
    { 
        id: 'applejack', 
        name: '苹果嘉儿', 
        body: '#FFD54F', // Orange/Yellowish
        mane: '#FFF176', // Blonde
        horn: false, 
        price: 0, 
        unlocked: true,
        desc: '诚实勤劳的小马，喜欢苹果。',
        trait: '无特殊能力'
    },
    { 
        id: 'rarity', 
        name: '瑞瑞', 
        body: '#F5F5F5', 
        mane: '#7E57C2', // Purple mane
        horn: true, 
        price: 100, 
        unlocked: false,
        desc: '慷慨优雅，时尚界的宠儿。',
        trait: '跳跃高度 +5%'
    },
    { 
        id: 'rainbow', 
        name: '云宝', 
        body: '#4FC3F7', // Blue
        mane: '#FF5252', // Rainbow (Simplified to red/multi in drawing logic if needed, but here just main color)
        horn: false, 
        price: 200, 
        unlocked: false,
        desc: '忠诚勇敢，飞行速度极快。',
        trait: '金币收益 +10%'
    },
    { 
        id: 'zecora', 
        name: '泽科拉', 
        body: '#EEEEEE', 
        mane: '#212121', 
        style: 'zebra', 
        price: 300, 
        unlocked: false,
        desc: '来自远方的神秘斑马巫医。',
        trait: '奔跑速度感 +10%'
    },
    { 
        id: 'pinkie', 
        name: '碧琪', 
        body: '#F48FB1', 
        mane: '#F06292', 
        horn: false, 
        price: 500, 
        unlocked: false,
        desc: '乐观开朗，派对之王！',
        trait: '护盾持续时间 +20%'
    },
    { 
        id: 'twilight', 
        name: '紫悦公主', 
        body: '#E1BEE7', 
        mane: '#4A148C', 
        horn: true, 
        price: 1000, 
        unlocked: false,
        desc: '友谊公主，拥有强大的魔法。',
        trait: '开局自带磁铁'
    }
];

// Accessories Configuration
const ACCESSORIES = [
    {
        id: 'none',
        name: '无头饰',
        icon: '🚫',
        price: 0,
        unlocked: true,
        desc: '保持自然美。'
    },
    {
        id: 'flower',
        name: '花朵',
        icon: '🌸',
        price: 150,
        unlocked: false,
        desc: '清新自然的小花。'
    },
    {
        id: 'bow',
        name: '蝴蝶结',
        icon: '🎀',
        price: 200,
        unlocked: false,
        desc: '可爱的粉色蝴蝶结。'
    },
    {
        id: 'shades',
        name: '墨镜',
        icon: '😎',
        price: 300,
        unlocked: false,
        desc: '酷酷的墨镜。'
    },
    {
        id: 'santa',
        name: '圣诞帽',
        icon: '🎅',
        price: 400,
        unlocked: false,
        desc: '节日快乐！'
    },
    {
        id: 'crown',
        name: '皇冠',
        icon: '👑',
        price: 500,
        unlocked: false,
        desc: '尊贵的象征。'
    }
];

// Vehicles Configuration
const VEHICLES = [
    {
        id: 'none',
        name: '徒步奔跑',
        icon: '🦵',
        price: 0,
        unlocked: true,
        desc: '依靠强健的四肢奔跑。',
        speedBonus: 0
    },
    {
        id: 'bike',
        name: '自行车',
        icon: '🚲',
        price: 500,
        unlocked: false,
        desc: '环保又健康，速度稍快。',
        speedBonus: 0.5
    },
    {
        id: 'scooter',
        name: '滑板车',
        icon: '🛴',
        price: 800,
        unlocked: false,
        desc: '轻便灵活，滑行更远。',
        speedBonus: 0.8
    },
    {
        id: 'motorcycle',
        name: '摩托车',
        icon: '🏍️',
        price: 1500,
        unlocked: false,
        desc: '轰鸣的引擎，极速狂飙！',
        speedBonus: 1.5
    },
    {
        id: 'car',
        name: '敞篷跑车',
        icon: '🚗',
        price: 3000,
        unlocked: false,
        desc: '尊贵座驾，无视小碰撞。',
        speedBonus: 2.0
    }
];
