import React, { useState, useMemo } from 'react';
import pokemons from '../pokemons.json';
import moves from '../moves.json';
import moveUsage from './data/moveUsage.json';
import abilitiesData from './data/abilities.js';
import { MOVE_EFFECTS } from './data/moveEffects.js';
import StickyDamageBar from './components/StickyDamageBar';
import SelectionModal from './components/SelectionModal';
import ModalTriggerInput from './components/ModalTriggerInput';
import { getBasePokemonName, getMegaForms } from './utils/megaUtils';
import './App.css';

// --- 端数処理 ---
const floor = (val) => Math.floor(val);
const roundHalfDown = (val) => {
  const floorVal = Math.floor(val);
  return (val - floorVal) > 0.5 ? Math.ceil(val) : floorVal;
};

// --- 全タイプ定義 ---
const ALL_TYPES = [
  'ノーマル', 'ほのお', 'みず', 'くさ', 'でんき', 'こおり', 
  'かくとう', 'どく', 'じめん', 'ひこう', 'エスパー', 'むし', 
  'いわ', 'ゴースト', 'ドラゴン', 'あく', 'はがね', 'フェアリー'
];

// --- タイプごとの背景色定義 ---
const TYPE_COLORS = {
  ノーマル: '#a8a878',
  ほのお: '#f08030',
  みず: '#6890f0',
  くさ: '#78c850',
  でんき: '#f8d030',
  こおり: '#98d8d8',
  かくとう: '#c03028',
  どく: '#a040a0',
  じめん: '#e0c068',
  ひこう: '#a890f0',
  エスパー: '#f85888',
  むし: '#a8b820',
  いわ: '#b8a038',
  ゴースト: '#705898',
  ドラゴン: '#7038f8',
  あく: '#705848',
  はがね: '#b8b8d0',
  フェアリー: '#ee99ac',
};

// --- タイプ相性表 ---
const TYPE_CHART = {
  ノーマル: { いわ: 0.5, ゴースト: 0, はがね: 0.5 },
  ほのお: { ほのお: 0.5, みず: 0.5, くさ: 2, こおり: 2, むし: 2, いわ: 0.5, ドラゴン: 0.5, はがね: 2 },
  みず: { ほのお: 2, みず: 0.5, くさ: 0.5, じめん: 2, いわ: 2, ドラゴン: 0.5 },
  くさ: { ほのお: 0.5, みず: 2, くさ: 0.5, どく: 0.5, じめん: 2, ひこう: 0.5, むし: 0.5, いわ: 2, ドラゴン: 0.5, はがね: 0.5 },
  でんき: { みず: 2, くさ: 0.5, でんき: 0.5, じめん: 0, ひこう: 2, ドラゴン: 0.5 },
  こおり: { ほのお: 0.5, みず: 0.5, くさ: 2, こおり: 0.5, じめん: 2, ひこう: 2, ドラゴン: 2, はがね: 0.5 },
  かくとう: { ノーマル: 2, こおり: 2, どく: 0.5, ひこう: 0.5, エスパー: 0.5, むし: 0.5, いわ: 2, ゴースト: 0, あく: 2, はがね: 2, フェアリー: 0.5 },
  どく: { くさ: 2, どく: 0.5, じめん: 0.5, いわ: 0.5, ゴースト: 0.5, はがね: 0, フェアリー: 2 },
  じめん: { ほのお: 2, くさ: 0.5, でんき: 2, どく: 2, ひこう: 0, むし: 0.5, いわ: 2, はがね: 2 },
  ひこう: { くさ: 2, でんき: 0.5, かくとう: 2, むし: 2, いわ: 0.5, はがね: 0.5 },
  エスパー: { かくとう: 2, どく: 2, エスパー: 0.5, あく: 0, はがね: 0.5 },
  むし: { ほのお: 0.5, くさ: 2, かくとう: 0.5, どく: 0.5, ひこう: 0.5, エスパー: 2, ゴースト: 0.5, あく: 2, はがね: 0.5 },
  いわ: { ほのお: 2, こおり: 2, かくとう: 0.5, じめん: 0.5, ひこう: 2, むし: 2, はがね: 0.5 },
  ゴースト: { ノーマル: 0, エスパー: 2, ゴースト: 2, あく: 0.5 },
  ドラゴン: { ドラゴン: 2, はがね: 0.5, フェアリー: 0 },
  あく: { かくとう: 0.5, エスパー: 2, ゴースト: 2, あく: 0.5, フェアリー: 0.5 },
  はがね: { ほのお: 0.5, みず: 0.5, でんき: 0.5, こおり: 2, いわ: 2, はがね: 0.5, フェアリー: 2 },
  フェアリー: { ほのお: 0.5, かくとう: 2, どく: 0.5, ドラゴン: 2, あく: 2, はがね: 0.5 }
};

// 連続技定義
const MULTI_HIT_MOVES = {
  スイープビンタ: 5, スケイルショット: 5, タネマシンガン: 5, ダブルアタック: 2,
  ダブルウイング: 2, ツインビーム: 2, つららばり: 5, トリプルアクセル: 3,
  トリプルキック: 3, ドラゴンアロー: 2, ネズミざん: 10, ふくろだたき: 6,
  ボーンラッシュ: 5, ミサイルばり: 5, みずしゅりけん: 5, ロックブラスト: 5,
};

// ヒット数に応じた基礎威力を算出する関数
const getMoveBasePower = (moveName, defaultPower, hitCount) => {
  if (moveName === 'トリプルアクセル') {
    let totalPower = 0;
    for (let i = 1; i <= hitCount; i++) {
      totalPower += 20 * i;
    }
    return totalPower;
  }
  if (moveName === 'トリプルキック') {
    let totalPower = 0;
    for (let i = 1; i <= hitCount; i++) {
      totalPower += 10 * i;
    }
    return totalPower;
  }
  return defaultPower * hitCount;
};

// 特殊技だが相手の「防御(def)」を参照する技
const PHYSICAL_DEFENSE_SPECIAL_MOVES = ['サイコショック', 'サイコブレイク', 'しんぴのつるぎ'];

// 持ち物リスト
const ITEM_OPTIONS = [
  'なし',
  'いのちのたま',
  'たつじんのおび',
  'ちからのハチマキ',
  'ものしりメガネ',
  'タイプ強化アイテム (1.2倍)'
];

export default function App() {
  const defaultPkm = pokemons[0] || { name: 'マスカーニャ', types: ['くさ', 'あく'], baseStats: { hp: 76, atk: 110, def: 70, spAtk: 81, spDef: 70, spd: 123 }, abilities: ['変幻自在', '新緑'] };
  const defaultDefenderPkm = pokemons[1] || { name: 'ガブリアス', types: ['ドラゴン', 'じめん'], baseStats: { hp: 108, atk: 130, def: 95, spAtk: 80, spDef: 85, spd: 102 }, abilities: ['さめはだ'] };
  const defaultMove = moves.find(m => m.name === 'トリプルアクセル') || moves[0] || { name: 'トリプルアクセル', type: 'こおり', category: '物理', power: 20, flags: [] };

  // 攻撃ポケモンのリスト管理（複数ターン対応）
  const [attackers, setAttackers] = useState([
    {
      id: Date.now(),
      pokemon: defaultPkm,
      types: defaultPkm.types || ['くさ', 'あく'],
      move: defaultMove,
      ability: defaultPkm.abilities?.[0] || '',
      item: 'なし',
      atkEv: 32,
      atkNature: 1.0,
      atkRank: 0,
      hitCount: 3,
      isAttackerProteanActive: true,
      moveConditionActive: false,
      attackerHpPercent: 100
    }
  ]);
  const [activeAttackerIndex, setActiveAttackerIndex] = useState(0);

  // 現在選択中の攻撃側データのショートカット
  const currentAttacker = attackers[activeAttackerIndex] || attackers[0];

  const [defender, setDefender] = useState(defaultDefenderPkm);
  const [selectedDefenderAbility, setSelectedDefenderAbility] = useState(defaultDefenderPkm.abilities?.[0] || '');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'move',
    target: 'attacker',
    index: 0
  });

  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const openModal = (type, target, index = activeAttackerIndex) => {
    setModalConfig({ isOpen: true, type, target, index });
  };

  // 攻撃ポケモンの追加・削除関数
  const addAttacker = () => {
    const newAttacker = {
      id: Date.now(),
      pokemon: defaultPkm,
      types: defaultPkm.types || ['くさ', 'あく'],
      move: defaultMove,
      ability: defaultPkm.abilities?.[0] || '',
      item: 'なし',
      atkEv: 32,
      atkNature: 1.0,
      atkRank: 0,
      hitCount: 3,
      isAttackerProteanActive: true,
      moveConditionActive: false,
      attackerHpPercent: 100
    };
    setAttackers(prev => [...prev, newAttacker]);
    setActiveAttackerIndex(attackers.length);
  };

  const removeAttacker = (indexToRemove) => {
    if (attackers.length <= 1) return; // 最低1匹は維持
    setAttackers(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setActiveAttackerIndex(prev => Math.max(0, prev >= indexToRemove ? prev - 1 : prev));
  };

  const updateCurrentAttacker = (fields) => {
    setAttackers(prev => prev.map((item, idx) => 
      idx === activeAttackerIndex ? { ...item, ...fields } : item
    ));
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleModalSelect = (selectedName) => {
    if (modalConfig.type === 'pokemon') {
      if (modalConfig.target === 'attacker') {
        const pkm = pokemons.find(p => p.name === selectedName) || { name: selectedName };
        updateCurrentAttacker({
          pokemon: pkm,
          types: pkm.types || [],
          ability: pkm.abilities?.[0] || ''
        });
      } else {
        handleDefenderChange(selectedName);
      }
    } else if (modalConfig.type === 'move') {
      const move = moves.find(m => m.name === selectedName) || { name: selectedName, type: 'ノーマル', category: '物理', power: 50 };
      const maxHits = MULTI_HIT_MOVES[move.name] || move.maxHits || 1;
      updateCurrentAttacker({
        move,
        hitCount: maxHits,
        moveConditionActive: false
      });
    }
  };

  // 防御側ステータス
  const [defHpEv, setDefHpEv] = useState(32);
  const [defEv, setDefEv] = useState(0);
  const [defNature, setDefNature] = useState(1.0);
  const [defRank, setDefRank] = useState(0);

  const [isCritical, setIsCritical] = useState(false);

  // へんげんじざい用の状態
  const [defenderProteanType, setDefenderProteanType] = useState('元タイプ');

  // 持ち物ステート（防御側）
  const [selectedDefenderItem, setSelectedDefenderItem] = useState('なし');

  // 状態異常・場・設置技・定数ダメージ
  const [isBurned, setIsBurned] = useState(false);
  const [isHelpingHand, setIsHelpingHand] = useState(false);
  const [isCharge, setIsCharge] = useState(false);
  const [isSoak, setIsSoak] = useState(false);
  const [isReflectWall, setIsReflectWall] = useState(false);
  const [isStealthRock, setIsStealthRock] = useState(false);
  const [isSpikes, setIsSpikes] = useState(false);
  const [isLifeOrbRecoil, setIsLifeOrbRecoil] = useState(false);
  const [isDisguise, setIsDisguise] = useState(false);

  // 防御側の追加状態
  const [isProtect, setIsProtect] = useState(false);
  const [isRoost, setIsRoost] = useState(false);
  const [customFixedFraction, setCustomFixedFraction] = useState(null);

  // 天候・フィールド
  const [weather, setWeather] = useState('なし');
  const [field, setField] = useState('なし');

  // 技固有の条件ステート
  const [stockpileCount, setStockpileCount] = useState(1);
  const [faintedCount, setFaintedCount] = useState(0);
  const [defenderHpPercent, setDefenderHpPercent] = useState(100);

  // 特性由来の動的トグル状態
  const [abilityToggles, setAbilityToggles] = useState({});
  const [abilityOptions, setAbilityOptions] = useState({});
  const [abilityValues, setAbilityValues] = useState({});

  // ショートカット変数
  const attacker = currentAttacker.pokemon;
  const attackerTypes = currentAttacker.types;
  const selectedAbility = currentAttacker.ability;
  const selectedMove = currentAttacker.move;
  const selectedItem = currentAttacker.item;
  const atkEv = currentAttacker.atkEv;
  const atkNature = currentAttacker.atkNature;
  const atkRank = currentAttacker.atkRank;
  const hitCount = currentAttacker.hitCount;
  const isAttackerProteanActive = currentAttacker.isAttackerProteanActive;
  const moveConditionActive = currentAttacker.moveConditionActive;
  const attackerHpPercent = currentAttacker.attackerHpPercent;

  // --- 特性オブジェクト & 技固有エフェクト取得 ---
  const atkAbilityData = useMemo(() => abilitiesData.find(a => a.name === selectedAbility), [selectedAbility]);
  const defAbilityData = useMemo(() => abilitiesData.find(a => a.name === selectedDefenderAbility), [selectedDefenderAbility]);
  const currentEffect = useMemo(() => MOVE_EFFECTS[selectedMove.name], [selectedMove]);

  // へんげんじざい / リベロ 判定
  const isAttackerProtean = useMemo(() => ['へんげんじざい', '変幻自在', 'リベロ'].includes(selectedAbility), [selectedAbility]);
  const isDefenderProtean = useMemo(() => ['へんげんじざい', '変幻自在', 'リベロ'].includes(selectedDefenderAbility), [selectedDefenderAbility]);

  // 防御側の実際のタイプ
  const effectiveDefenderTypes = useMemo(() => {
    let types = defender.types || ['ノーマル'];
    if (isDefenderProtean && defenderProteanType !== '元タイプ') {
      types = [defenderProteanType];
    }

    if (isRoost) {
      types = types.filter(t => t !== 'ひこう');
      if (types.length === 0) {
        types = ['ノーマル'];
      }
    }

    return types;
  }, [defender, isDefenderProtean, defenderProteanType, isRoost]);

  // ミミッキュ判定
  const isMimikyu = useMemo(() => {
    return defender.name === 'ミミッキュ' || selectedDefenderAbility === 'ばけのかわ';
  }, [defender.name, selectedDefenderAbility]);

  // 連続技判定と最大ヒット数
  const maxHitsForSelectedMove = useMemo(() => {
    return MULTI_HIT_MOVES[selectedMove.name] || selectedMove.maxHits || 1;
  }, [selectedMove]);

  // ポケモン・技変更処理
  const handleAttackerChange = (name) => {
    const pkm = pokemons.find(p => p.name === name);
    if (pkm) {
      updateCurrentAttacker({
        pokemon: pkm,
        types: pkm.types || [],
        ability: pkm.abilities?.[0] || ''
      });
    } else {
      updateCurrentAttacker({
        pokemon: { ...attacker, name }
      });
    }
  };

  const handleDefenderChange = (name) => {
    const pkm = pokemons.find(p => p.name === name);
    if (pkm) {
      setDefender(pkm);
      const defAbility = pkm.abilities?.[0] || '';
      setSelectedDefenderAbility(defAbility);
      setIsDisguise(pkm.name === 'ミミッキュ' || defAbility === 'ばけのかわ');
      setDefenderProteanType('元タイプ');
    } else {
      setDefender(prev => ({ ...prev, name }));
      setIsDisguise(name === 'ミミッキュ');
    }
  };

  const handleMoveChange = (name) => {
    const move = moves.find(m => m.name === name);
    const targetMove = move || { name, type: 'ノーマル', category: '物理', power: 50 };
    const maxHits = MULTI_HIT_MOVES[targetMove.name] || targetMove.maxHits || 1;
    updateCurrentAttacker({
      move: targetMove,
      hitCount: maxHits,
      moveConditionActive: false
    });
  };

  const handleToggleAttackerMega = (targetMegaName) => {
    const isCurrentTarget = attacker.name === targetMegaName;
    const nextName = isCurrentTarget ? getBasePokemonName(attacker.name) : targetMegaName;
    handleAttackerChange(nextName);
  };

  const handleToggleDefenderMega = (targetMegaName) => {
    const isCurrentTarget = defender.name === targetMegaName;
    const nextName = isCurrentTarget ? getBasePokemonName(defender.name) : targetMegaName;
    handleDefenderChange(nextName);
  };

  const handleSwap = () => {
    const tempAttacker = attacker;
    const tempDefender = defender;

    setDefender(tempAttacker);
    setSelectedDefenderAbility(selectedAbility);

    const tempAtkEv = atkEv;
    const tempAtkNature = atkNature;
    const tempAtkRank = atkRank;

    updateCurrentAttacker({
      pokemon: tempDefender,
      types: effectiveDefenderTypes,
      ability: selectedDefenderAbility,
      item: ITEM_OPTIONS.includes(selectedDefenderItem) ? selectedDefenderItem : 'なし',
      atkEv: defEv,
      atkNature: defNature,
      atkRank: defRank,
      isAttackerProteanActive: true
    });

    setDefEv(tempAtkEv);
    setDefNature(tempAtkNature);
    setDefRank(tempAtkRank);

    setSelectedDefenderItem(ITEM_OPTIONS.includes(selectedItem) ? selectedItem : 'なし');
    setDefenderProteanType('元タイプ');
    setIsDisguise(tempAttacker.name === 'ミミッキュ' || selectedAbility === 'ばけのかわ');
  };

  // よく使われる技（Popular Moves）用の計算ヘルパー関数
  const calculatePopularMoveDamage = (moveData) => {
    if (!moveData || !attacker || !defender) return null;

    const fullMove = moves.find(m => m.name === moveData.name) || { 
      name: moveData.name, 
      type: 'ノーマル', 
      category: '物理', 
      power: 0 
    };

    const moveType = fullMove.type || 'ノーマル';
    const movePower = fullMove.power || 0;

    // タイプ相性計算
    let typeEff = 1.0;
    (effectiveDefenderTypes || []).forEach(defType => {
      typeEff *= (TYPE_CHART[moveType]?.[defType] ?? 1.0);
    });

    // 攻撃・防御ステータス取得
    const isSpecial = fullMove.category === '特殊';
    const baseAtk = isSpecial ? (attacker?.baseStats?.spAtk ?? 100) : (attacker?.baseStats?.atk ?? 100);
    const calculatedAtk = floor((baseAtk + 20 + atkEv) * atkNature);

    const isTargetPhys = fullMove.category === '物理' || PHYSICAL_DEFENSE_SPECIAL_MOVES.includes(fullMove.name);
    const baseDef = isTargetPhys ? (defender?.baseStats?.def ?? 100) : (defender?.baseStats?.spDef ?? 100);
    const calculatedDef = floor((baseDef + 20 + defEv) * defNature);

    if (movePower === 0) return { minDmg: 0, maxDmg: 0, minPct: '0.0', maxPct: '0.0', fullMove };

    // 簡易ダメージ計算 (レベル50)
    const step1 = floor((50 * 2) / 5) + 2;
    const step2 = floor((step1 * movePower * calculatedAtk) / calculatedDef);
    let baseDmg = floor(step2 / 50) + 2;

    if ((attackerTypes || []).includes(moveType)) {
      baseDmg = floor(baseDmg * 1.5);
    }
    baseDmg = floor(baseDmg * typeEff);

    const minDmg = floor(baseDmg * 0.85);
    const maxDmg = baseDmg;

    const minPct = ((minDmg / defHpStat) * 100).toFixed(1);
    const maxPct = ((maxDmg / defHpStat) * 100).toFixed(1);

    return { minDmg, maxDmg, minPct, maxPct, fullMove };
  };

  // 1. 技のタイプ変質判定
  const currentMoveType = useMemo(() => {
    if (currentEffect) {
      if (currentEffect.type === 'weather_ball') {
        if (weather === 'はれ') return 'ほのお';
        if (weather === 'あめ') return 'みず';
        if (weather === 'ゆき') return 'こおり';
        if (weather === 'すな') return 'いわ';
      }
      if (currentEffect.type === 'nature_power' && field !== 'なし') {
        if (field === 'エレキ') return 'でんき';
        if (field === 'グラス') return 'くさ';
        if (field === 'サイコ') return 'エスパー';
        if (field === 'ミスト') return 'フェアリー';
      }
    }
    if (atkAbilityData?.conditions?.changeNormalTypeTo && selectedMove.type === 'ノーマル') {
      return atkAbilityData.conditions.changeNormalTypeTo;
    }
    return selectedMove.type;
  }, [atkAbilityData, selectedMove, currentEffect, weather, field]);

  // 2. 判定：相手の防御ステータス参照
  const isTargetingPhysicalDef = selectedMove.category === '物理' || PHYSICAL_DEFENSE_SPECIAL_MOVES.includes(selectedMove.name);

  // 3. タイプ相性＆完全無効化特性判定
  const typeEffectiveness = useMemo(() => {
    if (!selectedMove || !effectiveDefenderTypes) return 1.0;

    if (defAbilityData?.phase === 'immune') {
      const cond = defAbilityData.conditions;
      if (cond.immuneType === currentMoveType) return 0;
      if (cond.immuneType === 'sound' && selectedMove.flags?.includes('sound')) return 0;
      if (cond.immuneType === 'bullet' && selectedMove.flags?.includes('bullet')) return 0;
    }

    let eff = 1.0;
    effectiveDefenderTypes.forEach(defType => {
      const mult = TYPE_CHART[currentMoveType]?.[defType] ?? 1.0;
      eff *= mult;
    });

    if (atkAbilityData?.conditions?.ignoreGhostImmunity && eff === 0 && (currentMoveType === 'ノーマル' || currentMoveType === 'かくとう')) {
      eff = 1.0;
    }

    if (selectedDefenderItem === 'くろいてっきゅう' && currentMoveType === 'じめん' && eff === 0) {
      eff = 1.0;
    }

    return eff;
  }, [effectiveDefenderTypes, selectedMove, currentMoveType, defAbilityData, atkAbilityData, selectedDefenderItem]);

  // 4. ステータス計算
  const defHpStat = (defender?.baseStats?.hp ?? 100) + 75 + defHpEv;

  let baseAtkStat = 100;

  if (selectedMove.name === 'イカサマ') {
    baseAtkStat = defender?.baseStats?.atk ?? 100;
  } else if (selectedMove.name === 'ボディプレス') {
    baseAtkStat = attacker?.baseStats?.def ?? 100;
  } else if (selectedMove.category === '物理') {
    baseAtkStat = attacker?.baseStats?.atk ?? 100;
  } else {
    baseAtkStat = attacker?.baseStats?.spAtk ?? 100;
  }

  let atkStat = floor((baseAtkStat + 20 + atkEv) * atkNature);

  if (atkAbilityData?.phase === 'stat_atk') {
    const cond = atkAbilityData.conditions;
    let applies = true;

    if (cond.category && cond.category !== selectedMove.category) applies = false;
    if (cond.moveTypes && !cond.moveTypes.includes(currentMoveType)) applies = false;
    if (cond.weather && cond.weather !== weather) applies = false;
    if (cond.requiresToggle && !abilityToggles[cond.toggleKey]) applies = false;

    if (applies) {
      const mult = cond.requiresOption 
        ? (abilityOptions[cond.optionKey] ?? atkAbilityData.multiplier)
        : atkAbilityData.multiplier;
      
      if (mult === 1.5) {
        atkStat = roundHalfDown((atkStat * 6144) / 4096);
      } else {
        atkStat = floor(atkStat * mult);
      }
    }
  }

  const baseDefStat = isTargetingPhysicalDef 
    ? (defender?.baseStats?.def ?? 100) 
    : (defender?.baseStats?.spDef ?? 100);
  
  let rawDefStat = floor((baseDefStat + 20 + defEv) * defNature);

  if (defAbilityData?.phase === 'stat_def') {
    const cond = defAbilityData.conditions;
    let applies = true;

    if (cond.category && cond.category !== selectedMove.category) applies = false;
    if (cond.requiresToggle && !abilityToggles[cond.toggleKey]) applies = false;

    if (applies) {
      rawDefStat = roundHalfDown((rawDefStat * (defAbilityData.multiplier * 4096)) / 4096);
    }
  }

  if (weather === 'すな' && !isTargetingPhysicalDef && effectiveDefenderTypes.includes('いわ')) {
    rawDefStat = roundHalfDown((rawDefStat * 6144) / 4096);
  }
  if (weather === 'ゆき' && isTargetingPhysicalDef && effectiveDefenderTypes.includes('こおり')) {
    rawDefStat = roundHalfDown((rawDefStat * 6144) / 4096);
  }

  const defStat = rawDefStat;

  // 5. ランク補正
  const getRankMultiplier = (rank) => rank >= 0 ? (2 + rank) / 2 : 2 / (2 - rank);

  let rawAtkRank = atkRank;

  let effectiveAtkRank = (isCritical && rawAtkRank < 0) ? 0 : rawAtkRank;
  if (defAbilityData?.conditions?.ignoreStatRanks) effectiveAtkRank = 0;

  let effectiveDefRank = (isCritical && defRank > 0) ? 0 : defRank;
  if (atkAbilityData?.conditions?.ignoreStatRanks) effectiveDefRank = 0;

  const finalAtk = Math.max(1, floor(atkStat * getRankMultiplier(effectiveAtkRank)));
  const finalDef = Math.max(1, floor(defStat * getRankMultiplier(effectiveDefRank)));

  // 6. 基礎威力計算
  const isSkillLink = atkAbilityData?.conditions?.alwaysMaxHits;
  const activeHits = isSkillLink ? maxHitsForSelectedMove : Math.min(hitCount, maxHitsForSelectedMove);

  const rawSinglePower = Math.max(1, selectedMove.power || 0);
  let basePower = getMoveBasePower(selectedMove.name, rawSinglePower, activeHits);

  if (selectedMove.name === 'はたきおとす' && selectedDefenderItem !== 'なし') {
    basePower = roundHalfDown((basePower * 6144) / 4096);
  }

  if (currentEffect) {
    if (currentEffect.type === 'toggle' && moveConditionActive) {
      basePower = floor(basePower * currentEffect.multiplier);
    }
    if (currentEffect.type === 'weather_ball' && weather !== 'なし') basePower *= 2;
    if (currentEffect.type === 'nature_power' && field !== 'なし') basePower *= 2;
    if (currentEffect.type === 'solar_beam' && ['あめ', 'ゆき', 'すな'].includes(weather)) {
      basePower = floor(basePower * 0.5);
    }
    if (currentEffect.type === 'terrain_double' && field === currentEffect.terrain) basePower *= 2;
    if (currentEffect.type === 'terrain_boost' && field === currentEffect.terrain) basePower = floor(basePower * currentEffect.multiplier);
    if (currentEffect.type === 'terrain_half' && field === currentEffect.terrain) basePower = floor(basePower * 0.5);
    if (currentEffect.type === 'earthquake' && field === 'グラス') basePower = floor(basePower * 0.5);

    if (currentEffect.type === 'water_spout') {
      basePower = Math.max(1, floor((150 * attackerHpPercent) / 100));
    }
    if (currentEffect.type === 'crush_grip') {
      basePower = Math.max(1, floor((100 * defenderHpPercent) / 100));
    }
    if (currentEffect.type === 'stockpile') {
      basePower = stockpileCount * 100;
    }
    if (currentEffect.type === 'fainted_count') {
      basePower = Math.min(
        currentEffect.basePower + (currentEffect.powerPerFainted * faintedCount),
        currentEffect.maxPower
      );
    }
  }

  if (atkAbilityData?.phase === 'power') {
    const cond = atkAbilityData.conditions;
    let applies = true;

    if (cond.maxBasePower && basePower > cond.maxBasePower) applies = false;
    if (cond.isContact && !selectedMove.flags?.includes('contact')) applies = false;
    if (cond.moveFlags && !cond.moveFlags.some(flag => selectedMove.flags?.includes(flag))) applies = false;
    if (cond.moveTypes && !cond.moveTypes.includes(currentMoveType)) applies = false;
    if (cond.weather && cond.weather !== weather) applies = false;
    if (cond.moveHasSecondaryEffect && !selectedMove.hasSecondaryEffect) applies = false;
    if (cond.requiresToggle && !abilityToggles[cond.toggleKey]) applies = false;

    if (applies) {
      let mult = atkAbilityData.multiplier;
      if (cond.requiresValue) {
        const val = abilityValues[cond.valueKey] || 0;
        mult = Math.min(cond.maxMultiplier, 1.0 + val * cond.perUnitMultiplier);
      }
      basePower = roundHalfDown((basePower * (mult * 4096)) / 4096);
    }
  }

  if (defAbilityData?.phase === 'power') {
    const cond = defAbilityData.conditions;
    let applies = true;

    if (cond.moveTypes && !cond.moveTypes.includes(currentMoveType)) applies = false;

    if (applies) {
      basePower = roundHalfDown((basePower * (defAbilityData.multiplier * 4096)) / 4096);
    }
  }

  if (atkAbilityData?.name === 'フェアリーオーラ' || defAbilityData?.name === 'フェアリーオーラ') {
    if (currentMoveType === 'フェアリー') {
      basePower = roundHalfDown((basePower * 5461) / 4096);
    }
  }

  if (selectedItem === 'ちからのハチマキ' && selectedMove.category === '物理') basePower = floor(basePower * 1.1);
  if (selectedItem === 'ものしりメガネ' && selectedMove.category === '特殊') basePower = floor(basePower * 1.1);
  if (selectedItem === 'タイプ強化アイテム (1.2倍)') basePower = floor(basePower * 1.2);

  if (isHelpingHand) basePower = floor(basePower * 1.5);
  if (isCharge && currentMoveType === 'でんき') basePower = floor(basePower * 2);

  if (field === 'グラス' && currentMoveType === 'くさ') basePower = floor(basePower * 1.3);
  if (field === 'エレキ' && currentMoveType === 'でんき') basePower = floor(basePower * 1.3);
  if (field === 'サイコ' && currentMoveType === 'エスパー') basePower = floor(basePower * 1.3);
  if (field === 'ミスト' && currentMoveType === 'ドラゴン') basePower = floor(basePower * 0.5);

  const level = 50;
  const step1 = floor((level * 2) / 5) + 2;
  const step2 = floor((step1 * basePower * finalAtk) / finalDef);
  let baseDamage = floor(step2 / 50) + 2;

  const ignoresScreens = atkAbilityData?.conditions?.ignoresReflectAndScreens;
  if (isReflectWall && !isCritical && !ignoresScreens) {
    baseDamage = floor(baseDamage * 0.5);
  }

  const isFacade = currentEffect?.ignoreBurn;
  const isGuts = atkAbilityData?.name === 'こんじょう';
  if (isBurned && selectedMove.category === '物理' && !isGuts && !isFacade) {
    baseDamage = floor(baseDamage * 0.5);
  }

  if ((weather === 'はれ' && currentMoveType === 'ほのお') || (weather === 'あめ' && currentMoveType === 'みず')) {
    baseDamage = floor(baseDamage * 1.5);
  } else if ((weather === 'はれ' && currentMoveType === 'みず') || (weather === 'あめ' && currentMoveType === 'ほのお')) {
    baseDamage = floor(baseDamage * 0.5);
  }

  // 単一の攻撃側のダメージ（16段階配列）を計算する関数
  const calculateAttackerRolls = (atkObj) => {
    const atkPkm = atkObj.pokemon;
    const atkTypes = atkObj.types;
    const atkAbility = atkObj.ability;
    const atkMove = atkObj.move;
    const atkItem = atkObj.item;
    const aEv = atkObj.atkEv;
    const aNat = atkObj.atkNature;
    const aRank = atkObj.atkRank;
    const aHit = atkObj.hitCount;
    const aProteanActive = atkObj.isAttackerProteanActive;
    const mCondActive = atkObj.moveConditionActive;
    const aHpPct = atkObj.attackerHpPercent;

    const aAbilityData = abilitiesData.find(a => a.name === atkAbility);
    const mEffect = MOVE_EFFECTS[atkMove.name];
    const aProtean = ['へんげんじざい', '変幻自在', 'リベロ'].includes(atkAbility);

    let moveType = atkMove.type;
    if (mEffect) {
      if (mEffect.type === 'weather_ball') {
        if (weather === 'はれ') moveType = 'ほのお';
        if (weather === 'あめ') moveType = 'みず';
        if (weather === 'ゆき') moveType = 'こおり';
        if (weather === 'すな') moveType = 'いわ';
      }
      if (mEffect.type === 'nature_power' && field !== 'なし') {
        if (field === 'エレキ') moveType = 'でんき';
        if (field === 'グラス') moveType = 'くさ';
        if (field === 'サイコ') moveType = 'エスパー';
        if (field === 'ミスト') moveType = 'フェアリー';
      }
    }
    if (aAbilityData?.conditions?.changeNormalTypeTo && atkMove.type === 'ノーマル') {
      moveType = aAbilityData.conditions.changeNormalTypeTo;
    }

    const isPhys = atkMove.category === '物理' || PHYSICAL_DEFENSE_SPECIAL_MOVES.includes(atkMove.name);

    let typeEff = 1.0;
    if (defAbilityData?.phase === 'immune') {
      const cond = defAbilityData.conditions;
      if (cond.immuneType === moveType) return Array(16).fill(0);
      if (cond.immuneType === 'sound' && atkMove.flags?.includes('sound')) return Array(16).fill(0);
      if (cond.immuneType === 'bullet' && atkMove.flags?.includes('bullet')) return Array(16).fill(0);
    }

    effectiveDefenderTypes.forEach(defType => {
      typeEff *= (TYPE_CHART[moveType]?.[defType] ?? 1.0);
    });

    if (aAbilityData?.conditions?.ignoreGhostImmunity && typeEff === 0 && (moveType === 'ノーマル' || moveType === 'かくとう')) {
      typeEff = 1.0;
    }
    if (selectedDefenderItem === 'くろいてっきゅう' && moveType === 'じめ人' && typeEff === 0) {
      typeEff = 1.0;
    }

    let bAtkStat = 100;
    if (atkMove.name === 'イカサマ') {
      bAtkStat = defender?.baseStats?.atk ?? 100;
    } else if (atkMove.name === 'ボディプレス') {
      bAtkStat = atkPkm?.baseStats?.def ?? 100;
    } else if (atkMove.category === '物理') {
      bAtkStat = atkPkm?.baseStats?.atk ?? 100;
    } else {
      bAtkStat = atkPkm?.baseStats?.spAtk ?? 100;
    }

    let calculatedAtk = floor((bAtkStat + 20 + aEv) * aNat);

    if (aAbilityData?.phase === 'stat_atk') {
      const cond = aAbilityData.conditions;
      let applies = true;
      if (cond.category && cond.category !== atkMove.category) applies = false;
      if (cond.moveTypes && !cond.moveTypes.includes(moveType)) applies = false;
      if (cond.weather && cond.weather !== weather) applies = false;
      if (cond.requiresToggle && !abilityToggles[cond.toggleKey]) applies = false;

      if (applies) {
        const mult = cond.requiresOption 
          ? (abilityOptions[cond.optionKey] ?? aAbilityData.multiplier)
          : aAbilityData.multiplier;
        if (mult === 1.5) {
          calculatedAtk = roundHalfDown((calculatedAtk * 6144) / 4096);
        } else {
          calculatedAtk = floor(calculatedAtk * mult);
        }
      }
    }

    let effectiveAtkRank = (isCritical && aRank < 0) ? 0 : aRank;
    if (defAbilityData?.conditions?.ignoreStatRanks) effectiveAtkRank = 0;

    let effectiveDefRank = (isCritical && defRank > 0) ? 0 : defRank;
    if (aAbilityData?.conditions?.ignoreStatRanks) effectiveDefRank = 0;

    const fAtk = Math.max(1, floor(calculatedAtk * getRankMultiplier(effectiveAtkRank)));
    const fDef = Math.max(1, floor(defStat * getRankMultiplier(effectiveDefRank)));

    const maxH = MULTI_HIT_MOVES[atkMove.name] || atkMove.maxHits || 1;
    const isSkillL = aAbilityData?.conditions?.alwaysMaxHits;
    const aHits = isSkillL ? maxH : Math.min(aHit, maxH);

    const rSinglePower = Math.max(1, atkMove.power || 0);
    let bPower = getMoveBasePower(atkMove.name, rSinglePower, aHits);

    if (atkMove.name === 'はたきおとす' && selectedDefenderItem !== 'なし') {
      bPower = roundHalfDown((bPower * 6144) / 4096);
    }

    if (mEffect) {
      if (mEffect.type === 'toggle' && mCondActive) {
        bPower = floor(bPower * mEffect.multiplier);
      }
      if (mEffect.type === 'weather_ball' && weather !== 'なし') bPower *= 2;
      if (mEffect.type === 'nature_power' && field !== 'なし') bPower *= 2;
      if (mEffect.type === 'solar_beam' && ['あめ', 'ゆき', 'すな'].includes(weather)) {
        bPower = floor(bPower * 0.5);
      }
      if (mEffect.type === 'terrain_double' && field === mEffect.terrain) bPower *= 2;
      if (mEffect.type === 'terrain_boost' && field === mEffect.terrain) bPower = floor(bPower * mEffect.multiplier);
      if (mEffect.type === 'terrain_half' && field === mEffect.terrain) bPower = floor(bPower * 0.5);
      if (mEffect.type === 'earthquake' && field === 'グラス') bPower = floor(bPower * 0.5);

      if (mEffect.type === 'water_spout') {
        bPower = Math.max(1, floor((150 * aHpPct) / 100));
      }
      if (mEffect.type === 'crush_grip') {
        bPower = Math.max(1, floor((100 * defenderHpPercent) / 100));
      }
      if (mEffect.type === 'stockpile') {
        bPower = stockpileCount * 100;
      }
      if (mEffect.type === 'fainted_count') {
        bPower = Math.min(
          mEffect.basePower + (mEffect.powerPerFainted * faintedCount),
          mEffect.maxPower
        );
      }
    }

    if (aAbilityData?.phase === 'power') {
      const cond = aAbilityData.conditions;
      let applies = true;
      if (cond.maxBasePower && bPower > cond.maxBasePower) applies = false;
      if (cond.isContact && !atkMove.flags?.includes('contact')) applies = false;
      if (cond.moveFlags && !cond.moveFlags.some(flag => atkMove.flags?.includes(flag))) applies = false;
      if (cond.moveTypes && !cond.moveTypes.includes(moveType)) applies = false;
      if (cond.weather && cond.weather !== weather) applies = false;
      if (cond.moveHasSecondaryEffect && !atkMove.hasSecondaryEffect) applies = false;
      if (cond.requiresToggle && !abilityToggles[cond.toggleKey]) applies = false;

      if (applies) {
        let mult = aAbilityData.multiplier;
        if (cond.requiresValue) {
          const val = abilityValues[cond.valueKey] || 0;
          mult = Math.min(cond.maxMultiplier, 1.0 + val * cond.perUnitMultiplier);
        }
        bPower = roundHalfDown((bPower * (mult * 4096)) / 4096);
      }
    }

    if (defAbilityData?.phase === 'power') {
      const cond = defAbilityData.conditions;
      let applies = true;
      if (cond.moveTypes && !cond.moveTypes.includes(moveType)) applies = false;

      if (applies) {
        bPower = roundHalfDown((bPower * (defAbilityData.multiplier * 4096)) / 4096);
      }
    }

    if (aAbilityData?.name === 'フェアリーオーラ' || defAbilityData?.name === 'フェアリーオーラ') {
      if (moveType === 'フェアリー') {
        bPower = roundHalfDown((bPower * 5461) / 4096);
      }
    }

    if (atkItem === 'ちからのハチマキ' && atkMove.category === '物理') bPower = floor(bPower * 1.1);
    if (atkItem === 'ものしりメガネ' && atkMove.category === '特殊') bPower = floor(bPower * 1.1);
    if (atkItem === 'タイプ強化アイテム (1.2倍)') bPower = floor(bPower * 1.2);

    if (isHelpingHand) bPower = floor(bPower * 1.5);
    if (isCharge && moveType === 'でんき') bPower = floor(bPower * 2);

    if (field === 'グラス' && moveType === 'くさ') bPower = floor(bPower * 1.3);
    if (field === 'エレキ' && moveType === 'でんき') bPower = floor(bPower * 1.3);
    if (field === 'サイコ' && moveType === 'エスパー') bPower = floor(bPower * 1.3);
    if (field === 'ミスト' && moveType === 'ドラゴン') bPower = floor(bPower * 0.5);

    const step1 = floor((50 * 2) / 5) + 2;
    const step2 = floor((step1 * bPower * fAtk) / fDef);
    let baseDmg = floor(step2 / 50) + 2;

    const ignoresScreens = aAbilityData?.conditions?.ignoresReflectAndScreens;
    if (isReflectWall && !isCritical && !ignoresScreens) {
      baseDmg = floor(baseDmg * 0.5);
    }

    const isFacade = mEffect?.ignoreBurn;
    const isGuts = aAbilityData?.name === 'こんじょう';
    if (isBurned && atkMove.category === '物理' && !isGuts && !isFacade) {
      baseDmg = floor(baseDmg * 0.5);
    }

    if ((weather === 'はれ' && moveType === 'ほのお') || (weather === 'あめ' && moveType === 'みず')) {
      baseDmg = floor(baseDmg * 1.5);
    } else if ((weather === 'はれ' && moveType === 'みず') || (weather === 'あめ' && moveType === 'ほのお')) {
      baseDmg = floor(baseDmg * 0.5);
    }

    const resultRolls = [];
    for (let i = 85; i <= 100; i++) {
      let currentDmg = baseDmg;

      if (isCritical) {
        const critMult = (aAbilityData?.name === 'スナイパー') ? 2.25 : 1.5;
        currentDmg = roundHalfDown((currentDmg * (critMult * 4096)) / 4096);
      }

      currentDmg = floor((currentDmg * i) / 100);

      const effAtkTypes = isSoak ? ['みず'] : (atkTypes || []);
      let isSameType = aProtean ? aProteanActive : effAtkTypes.includes(moveType);

      if (isSameType) {
        const stabMult = (aAbilityData?.phase === 'stab') ? aAbilityData.multiplier : 1.5;
        currentDmg = roundHalfDown((currentDmg * (stabMult * 4096)) / 4096);
      }

      currentDmg = floor(currentDmg * typeEff);

      if (defAbilityData?.conditions?.defMoveTypeMultiplier?.[moveType]) {
        const mult = defAbilityData.conditions.defMoveTypeMultiplier[moveType];
        currentDmg = roundHalfDown((currentDmg * (mult * 4096)) / 4096);
      }

      if (defAbilityData?.phase === 'final_damage') {
        const cond = defAbilityData.conditions;
        let applies = true;

        if (cond.moveTypes && !cond.moveTypes.includes(moveType)) applies = false;
        if (cond.category && cond.category !== atkMove.category) applies = false;
        if (cond.superEffectiveOnly && typeEff <= 1.0) applies = false;
        if (cond.requiresToggle && !abilityToggles[cond.toggleKey]) applies = false;

        if (applies) {
          currentDmg = roundHalfDown((currentDmg * (defAbilityData.multiplier * 4096)) / 4096);
        }

        if (cond.contactMultiplier && atkMove.flags?.includes('contact')) {
          currentDmg = roundHalfDown((currentDmg * (cond.contactMultiplier * 4096)) / 4096);
        }
        if (cond.moveTypeMultiplier?.[moveType]) {
          const mult = cond.moveTypeMultiplier[moveType];
          currentDmg = roundHalfDown((currentDmg * (mult * 4096)) / 4096);
        }
      }

      if (atkItem === 'たつじんのおび' && typeEff > 1.0) {
        currentDmg = roundHalfDown((currentDmg * 4915) / 4096);
      } else if (atkItem === 'いのちのたま') {
        currentDmg = roundHalfDown((currentDmg * 5324) / 4096);
      }

      if (selectedDefenderItem === '半減きのみ') {
        if (moveType === 'ノーマル' || typeEff > 1.0) {
          currentDmg = roundHalfDown((currentDmg * 2048) / 4096);
        }
      }

      let totalHitDmg = 0;
      for (let h = 1; h <= aHits; h++) {
        let singleHitDmg = currentDmg;

        if (['トリプルアクセル', 'トリプルキック'].includes(atkMove.name) && aHits > 1) {
          singleHitDmg = floor(singleHitDmg * (h / aHits));
        }

        if (isMimikyu && isDisguise) {
          if (h === 1) {
            singleHitDmg = floor(singleHitDmg * 0.125);
          }
        }

        if (isProtect) {
          const isUnseenFist = ['ふかしのこぶし', 'かんつうドリル'].includes(atkAbility);
          const isContactMove = atkMove.flags?.includes('contact');

          if (isUnseenFist && isContactMove) {
            singleHitDmg = roundHalfDown((singleHitDmg * 1024) / 4096);
          } else {
            singleHitDmg = 0;
          }
        }

        if (typeEff > 0 && singleHitDmg < 1) {
          singleHitDmg = 1;
        }

        totalHitDmg += singleHitDmg;
      }

      resultRolls.push(totalHitDmg);
    }

    return resultRolls;
  };

  // 8. 設置技・定数ダメージ
  let entryHazardDamage = 0;
  const isMagicGuard = defAbilityData?.conditions?.ignoreIndirectDamage;

  if (!isMagicGuard) {
    if (isStealthRock && effectiveDefenderTypes) {
      let rockEff = 1.0;
      effectiveDefenderTypes.forEach(t => { rockEff *= TYPE_CHART['いわ']?.[t] ?? 1.0; });
      entryHazardDamage += floor(defHpStat * (0.125 * rockEff));
    }
    if (isSpikes && !effectiveDefenderTypes.includes('ひこう') && defAbilityData?.name !== 'ふゆう') {
      entryHazardDamage += floor(defHpStat * 0.125);
    }
    if (isLifeOrbRecoil) {
      entryHazardDamage += floor(defHpStat * 0.1);
    }

    if (customFixedFraction) {
      const [num, den] = customFixedFraction.split('/').map(Number);
      if (num && den) {
        entryHazardDamage += floor((defHpStat * num) / den);
      }
    }
  }

  // 全攻撃ポケモンの乱数結果を合計（定数ダメージを加算）
  const combinedRolls = useMemo(() => {
    const total = Array(16).fill(0);
    attackers.forEach(atk => {
      const rolls = calculateAttackerRolls(atk);
      rolls.forEach((val, idx) => {
        total[idx] += val;
      });
    });
    return total.map(dmg => dmg + entryHazardDamage);
  }, [attackers, defender, defHpEv, defEv, defNature, defRank, selectedDefenderAbility, selectedDefenderItem, isCritical, defenderProteanType, isBurned, isHelpingHand, isCharge, isSoak, isReflectWall, isStealthRock, isSpikes, isLifeOrbRecoil, isDisguise, isProtect, isRoost, weather, field, stockpileCount, faintedCount, defenderHpPercent, abilityToggles, abilityOptions, abilityValues, entryHazardDamage]);

  const minDamage = combinedRolls[0] || 0;
  const maxDamage = combinedRolls[15] || 0;

  // 種族値ヘッダー
  const BaseStatsHeader = ({ stats }) => {
    if (!stats) return null;
    const { hp, atk, def, spAtk, spDef, spd } = stats;
    return (
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
        {[hp, atk, def, spAtk, spDef, spd].map((val, idx) => (
          <span key={idx} style={{ background: '#333336', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{val ?? '-'}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="pokemon-calc-app">
      
      {/* ヘッダー領域 */}
      <div className="app-header">
        <button className="header-btn" onClick={handleSwap}>攻防交代</button>
        <h2 className="header-title">Champions</h2>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button className="header-btn" onClick={() => window.location.reload()}>リセット</button>
          <button className="info-btn" onClick={() => setIsInfoOpen(true)} title="アプリ情報">i</button>
        </div>
      </div>

      {/* 🖥 攻撃・防御 2列グリッド */}
      <div className="calc-grid">
        
        {/* 🔴 攻撃エリア */}
        <div className="calc-card attacker">
          <div className="card-header attacker">
            <span>攻撃 (ターン数: {attackers.length})</span>
            <button 
              type="button" 
              onClick={addAttacker}
              style={{ backgroundColor: '#ffffff', color: '#e53e3e', border: 'none', borderRadius: '4px', padding: '2px 8px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              ＋ ターン追加
            </button>
          </div>

          {/* 複数ターン切り替えタブ */}
          {attackers.length > 1 && (
            <div style={{ display: 'flex', gap: '4px', padding: '6px 10px', backgroundColor: '#1a0e0f', overflowX: 'auto' }}>
              {attackers.map((atk, idx) => (
                <div 
                  key={atk.id} 
                  onClick={() => setActiveAttackerIndex(idx)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backgroundColor: activeAttackerIndex === idx ? '#e53e3e' : '#2d1a1c',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>T{idx + 1}: {atk.pokemon.name}</span>
                  {attackers.length > 1 && (
                    <span 
                      onClick={(e) => { e.stopPropagation(); removeAttacker(idx); }}
                      style={{ color: '#ff8a8a', marginLeft: '4px', cursor: 'pointer' }}
                    >
                      ×
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="card-body">
            
            {/* 種族値 ＆ タイプ変更 */}
            <div>
              <BaseStatsHeader stats={attacker.baseStats} />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {(Array.isArray(attackerTypes) && attackerTypes.length > 0 ? attackerTypes : (attacker?.types || [])).map((type, idx) => (
                  <span 
                    key={idx} 
                    style={{ backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #ef4444', fontSize: '0.8rem', padding: '3px 10px', borderRadius: '6px', fontWeight: 'bold' }}
                  >
                    {type}
                  </span>
                ))}
                <button 
                  onClick={() => {
                    const nextType = prompt('変更後のタイプを入力してください（例: ほのお）', attackerTypes?.[0] || 'ノーマル');
                    if (nextType) updateCurrentAttacker({ types: [nextType] });
                  }}
                  style={{ backgroundColor: '#374151', color: '#f3f4f6', border: '1px solid #4b5563', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  タイプ変更
                </button>
              </div>

              {/* ポケモン選択 & メガシンカ */}
              <div className="form-field-row" style={{ marginBottom: '4px' }}>
                <span className="form-label">名前</span>
                {getMegaForms(attacker.name).length > 0 && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {getMegaForms(attacker.name).map((megaName) => {
                      let label = "メガ";
                      if (megaName.endsWith("X")) label = "メガX";
                      if (megaName.endsWith("Y")) label = "メガY";
                      const isActive = attacker.name === megaName;
                      return (
                        <button
                          key={megaName}
                          onClick={() => handleToggleAttackerMega(megaName)}
                          style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid', borderColor: isActive ? '#ffd54f' : '#666', backgroundColor: isActive ? '#ffd54f' : '#1a1a1a', color: isActive ? '#000' : '#fff', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <ModalTriggerInput 
                value={attacker.name} 
                placeholder="ポケモンを選択" 
                onClick={() => openModal('pokemon', 'attacker')} 
              />
            </div>

            {/* ステータス入力ボックス */}
            <div className="stat-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#f8d7da', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {selectedMove.name === 'ボディプレス' 
                      ? '防御' 
                      : (selectedMove.category === '物理' ? '攻撃' : '特攻')}
                  </span>
                  <span className="val" style={{ background: '#111', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid #444' }}>
                    {atkStat}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#aaa', fontSize: '0.8rem' }}>努力値</span>
                  <input
                    type="number"
                    min="0"
                    max="32"
                    value={atkEv}
                    onChange={(e) => updateCurrentAttacker({ atkEv: Math.min(32, Math.max(0, Number(e.target.value))) })}
                    className="ev-num-input"
                  />
                  <button type="button" onClick={() => updateCurrentAttacker({ atkEv: 0 })} className="quick-btn">0</button>
                  <button type="button" onClick={() => updateCurrentAttacker({ atkEv: 12 })} className="quick-btn">12</button>
                  <button type="button" onClick={() => updateCurrentAttacker({ atkEv: 32 })} className="quick-btn">32</button>
                </div>
              </div>

              <div style={{ width: '100%' }}>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={atkEv}
                  onChange={(e) => updateCurrentAttacker({ atkEv: Number(e.target.value) })}
                  className="ev-range-slider"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>性格</span>
                  <div className="segmented-group">
                    {[0.9, 1.0, 1.1].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateCurrentAttacker({ atkNature: val })}
                        className={`segmented-btn ${atkNature === val ? 'active' : ''}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>ランク</span>
                  <button type="button" onClick={() => updateCurrentAttacker({ atkRank: 0 })} className="rank-btn" style={{ minWidth: '40px', textAlign: 'center' }}>
                    {atkRank > 0 ? `+${atkRank}` : atkRank === 0 ? '±0' : atkRank}
                  </button>
                  <button type="button" onClick={() => updateCurrentAttacker({ atkRank: Math.min(6, atkRank + 1) })} className="rank-btn">＋</button>
                  <button type="button" onClick={() => updateCurrentAttacker({ atkRank: Math.max(-6, atkRank - 1) })} className="rank-btn">－</button>
                </div>
              </div>
            </div>

            {/* 特性 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ minWidth: '32px', fontSize: '0.85rem', color: '#fff' }}>特性</span>
              <select 
                value={selectedAbility} 
                onChange={(e) => updateCurrentAttacker({ ability: e.target.value })} 
                className="ability-select"
              >
                {attacker.abilities?.map(a => <option key={a} value={a}>{a}</option>)}
              </select>

              {(() => {
                const isToggleable = isAttackerProtean || atkAbilityData?.conditions?.requiresToggle;
                
                const isActive = isAttackerProtean 
                  ? isAttackerProteanActive 
                  : !!abilityToggles[atkAbilityData?.conditions?.toggleKey];

                const handleToggle = (activeState) => {
                  if (isAttackerProtean) {
                    updateCurrentAttacker({ isAttackerProteanActive: activeState });
                  } else if (atkAbilityData?.conditions?.toggleKey) {
                    setAbilityToggles(prev => ({
                      ...prev,
                      [atkAbilityData.conditions.toggleKey]: activeState
                    }));
                  }
                };

                return (
                  <div className="ability-toggle-group">
                    <button
                      type="button"
                      disabled={!isToggleable}
                      onClick={() => handleToggle(true)}
                      className={`ability-toggle-btn ${isActive ? 'active' : ''}`}
                    >
                      有効
                    </button>
                    <button
                      type="button"
                      disabled={!isToggleable}
                      onClick={() => handleToggle(false)}
                      className={`ability-toggle-btn ${!isActive ? 'active' : ''}`}
                    >
                      無効
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* 道具 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ minWidth: '40px', fontSize: '0.9rem', color: '#fff' }}>道具</span>
              <select 
                value={selectedItem} 
                onChange={(e) => updateCurrentAttacker({ item: e.target.value })} 
                className="form-select" 
                style={{ flex: 1, margin: 0, backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 14px' }}
              >
                {ITEM_OPTIONS.map(item => <option key={item}>{item}</option>)}
              </select>
            </div>

            {/* 技名 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ minWidth: '40px', fontSize: '0.9rem', color: '#fff' }}>技名</span>
              <div style={{ flex: 1 }}>
                <ModalTriggerInput 
                  value={selectedMove.name} 
                  placeholder="技を選択" 
                  onClick={() => openModal('move', 'attacker')} 
                />
              </div>
            </div>

            {/* 威力 ＆ タイプ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ minWidth: '40px', fontSize: '0.9rem', color: '#fff' }}>威力</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                <input
                  type="number"
                  value={basePower}
                  onChange={(e) => updateCurrentAttacker({ move: { ...selectedMove, power: Number(e.target.value) } })}
                  className="ev-num-input power-input"
                  style={{ 
                    flex: 1,                 
                    width: '60px',           
                    minWidth: '30px', 
                    backgroundColor: '#000', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    padding: '8px 12px', 
                    textAlign: 'center', 
                    fontSize: '1rem', 
                    fontWeight: 'bold' 
                  }}
                />
                <div className="type-box" style={{ backgroundColor: '#000', color: '#fff', padding: '8px 20px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  {currentMoveType}
                </div>
              </div>
            </div>

            {/* 技効果補正 & 威力表示 */}
            {currentEffect && (
              <div className="power-info-box">
                <div style={{ fontSize: '0.8rem', color: '#ffca28', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>⚔️ 技補正: <b>{selectedMove.name}</b></span>
                  <span>(計算威力: <b style={{ color: '#4caf50', fontSize: '0.95rem' }}>{basePower}</b> / タイプ: <b>{currentMoveType}</b>)</span>
                </div>

                {currentEffect.type === 'toggle' && (
                  <button onClick={() => updateCurrentAttacker({ moveConditionActive: !moveConditionActive })} className={`toggle-btn ${moveConditionActive ? 'active' : ''}`}>
                    {moveConditionActive ? '✨ ' : '⚪ '}{currentEffect.label} ({moveConditionActive ? '適用中' : '未適用'})
                  </button>
                )}

                {currentEffect.type === 'water_spout' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#ffca28' }}>自分のHP割合: <b>{attackerHpPercent}%</b></label>
                    <input type="range" min="1" max="100" value={attackerHpPercent} onChange={(e) => updateCurrentAttacker({ attackerHpPercent: Number(e.target.value) })} style={{ width: '100%', accentColor: '#ffca28' }} />
                  </div>
                )}
              </div>
            )}

            {/* ヒット数UI */}
            {maxHitsForSelectedMove > 1 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="form-label" style={{ fontSize: '0.85rem' }}>
                    ヒット数 (威力: <b style={{ color: '#ffd54f' }}>{basePower}</b>):
                  </span>
                </div>
                <div className="toggle-btn-group">
                  {Array.from({ length: maxHitsForSelectedMove }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      disabled={isSkillLink}
                      onClick={() => updateCurrentAttacker({ hitCount: num })}
                      className={`toggle-btn ${activeHits === num ? 'active' : ''}`}
                    >
                      {num}回
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 状態 (やけど / じゅうでん / てだすけ / みずびたし) */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '8px' }}>状態</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsBurned(!isBurned)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: isBurned ? '#ef4444' : '#000',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  やけど
                </button>

                <button
                  type="button"
                  onClick={() => setIsCharge(!isCharge)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: isCharge ? '#ef4444' : '#000',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  じゅうでん
                </button>

                <button
                  type="button"
                  onClick={() => setIsHelpingHand(!isHelpingHand)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: isHelpingHand ? '#ef4444' : '#000',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  てだすけ
                </button>

                <button
                  type="button"
                  onClick={() => setIsSoak(!isSoak)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: isSoak ? '#ef4444' : '#000',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  みずびたし
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 🔵 防御エリア */}
        <div className="calc-card defender">
          <div className="card-header defender">
            <span>防御</span>
          </div>

          <div className="card-body">
            {/* 種族値 & タイプ & 名前 */}
            <div>
              <BaseStatsHeader stats={defender.baseStats} />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {(Array.isArray(effectiveDefenderTypes) && effectiveDefenderTypes.length > 0 ? effectiveDefenderTypes : (defender?.types || [])).map((type, idx) => (
                  <span 
                    key={idx} 
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', border: '1px solid #3b82f6', fontSize: '0.8rem', padding: '3px 10px', borderRadius: '6px', fontWeight: 'bold' }}
                  >
                    {type}
                  </span>
                ))}
                <button 
                  onClick={() => {
                    const nextType = prompt('変更後のタイプを入力してください（例: ほのお）', effectiveDefenderTypes?.[0] || 'ノーマル');
                    if (nextType) setDefenderProteanType(nextType);
                  }}
                  style={{ backgroundColor: '#374151', color: '#f3f4f6', border: '1px solid #4b5563', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  タイプ変更
                </button>
              </div>

              <div className="form-field-row" style={{ marginBottom: '4px' }}>
                <span className="form-label">名前</span>
                {getMegaForms(defender.name).length > 0 && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {getMegaForms(defender.name).map((megaName) => {
                      let label = "メガ";
                      if (megaName.endsWith("X")) label = "メガX";
                      if (megaName.endsWith("Y")) label = "メガY";
                      const isActive = defender.name === megaName;
                      return (
                        <button
                          key={megaName}
                          onClick={() => handleToggleDefenderMega(megaName)}
                          style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid', borderColor: isActive ? '#ffd54f' : '#666', backgroundColor: isActive ? '#ffd54f' : '#1a1a1a', color: isActive ? '#000' : '#fff', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <ModalTriggerInput 
                value={defender.name} 
                placeholder="ポケモンを選択" 
                onClick={() => openModal('pokemon', 'defender')} 
              />
            </div>

            {/* 防御側 HP入力 */}
            <div className="stat-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#d0e1fd', fontSize: '0.9rem', fontWeight: 'bold' }}>HP</span>
                  <span className="val" style={{ background: '#111', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid #444' }}>
                    {defHpStat}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#aaa', fontSize: '0.8rem' }}>努力値</span>
                  <input type="number" min="0" max="32" value={defHpEv} onChange={(e) => setDefHpEv(Math.min(32, Math.max(0, Number(e.target.value))))} className="ev-num-input" />
                  <button type="button" onClick={() => setDefHpEv(0)} className="quick-btn">0</button>
                  <button type="button" onClick={() => setDefHpEv(32)} className="quick-btn">32</button>
                </div>
              </div>
              <div style={{ width: '100%' }}>
                <input type="range" min="0" max="32" value={defHpEv} onChange={(e) => setDefHpEv(Number(e.target.value))} className="ev-range-slider defender-slider" style={{ width: '100%' }} />
              </div>
            </div>

            {/* 防御側 防御・特防入力 */}
            <div className="stat-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#d0e1fd', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {isTargetingPhysicalDef ? '防御' : '特防'}
                  </span>
                  <span className="val" style={{ background: '#111', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid #444' }}>
                    {defStat}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#aaa', fontSize: '0.8rem' }}>努力値</span>
                  <input type="number" min="0" max="32" value={defEv} onChange={(e) => setDefEv(Math.min(32, Math.max(0, Number(e.target.value))))} className="ev-num-input" />
                  <button type="button" onClick={() => setDefEv(0)} className="quick-btn">0</button>
                  <button type="button" onClick={() => setDefEv(32)} className="quick-btn">32</button>
                </div>
              </div>

              <div style={{ width: '100%' }}>
                <input type="range" min="0" max="32" value={defEv} onChange={(e) => setDefEv(Number(e.target.value))} className="ev-range-slider defender-slider" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>性格</span>
                  <div className="segmented-group">
                    {[0.9, 1.0, 1.1].map(val => (
                      <button key={val} type="button" onClick={() => setDefNature(val)} className={`segmented-btn ${defNature === val ? 'active-def' : ''}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>ランク</span>
                  <button type="button" onClick={() => setDefRank(0)} className="rank-btn" style={{ minWidth: '40px', textAlign: 'center' }}>
                    {defRank > 0 ? `+${defRank}` : defRank === 0 ? '±0' : defRank}
                  </button>
                  <button type="button" onClick={() => setDefRank(r => Math.min(6, r + 1))} className="rank-btn">＋</button>
                  <button type="button" onClick={() => setDefRank(r => Math.max(-6, r - 1))} className="rank-btn">－</button>
                </div>
              </div>
            </div>

            {/* 特性 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', marginBottom: '12px' }}>
              <span style={{ minWidth: '40px', fontSize: '0.9rem', color: '#fff' }}>特性</span>
              <select 
                value={selectedDefenderAbility} 
                onChange={(e) => setSelectedDefenderAbility(e.target.value)} 
                className="form-select" 
                style={{ flex: 1, margin: 0, backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 14px' }}
              >
                {defender.abilities?.map(a => <option key={a}>{a}</option>)}
              </select>

              {isMimikyu && (
                <div style={{ display: 'flex', background: '#18181b', borderRadius: '8px', padding: '2px', border: '1px solid #27272a' }}>
                  <button
                    type="button"
                    onClick={() => setIsDisguise(true)}
                    className={`btn-toggle ${isDisguise ? 'active-blue' : ''}`}
                  >
                    1/8込
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDisguise(false)}
                    className={`btn-toggle ${!isDisguise ? 'active-red' : ''}`}
                  >
                    1/8無
                  </button>
                </div>
              )}
            </div>

            {/* 道具 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ minWidth: '40px', fontSize: '0.9rem', color: '#fff' }}>道具</span>
              <select 
                value={selectedDefenderItem} 
                onChange={(e) => setSelectedDefenderItem(e.target.value)} 
                className="form-select" 
                style={{ flex: 1, margin: 0, backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 14px' }}
              >
                <option value="なし">なし</option>
                <option value="半減きのみ">半減きのみ</option>
                <option value="くろいてっきゅう">くろいてっきゅう</option>
                <option value="その他アイテム">その他アイテム</option>
              </select>
            </div>

            {/* 状態 */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '8px' }}>状態</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsProtect(!isProtect)}
                  className={`toggle-btn ${isProtect ? 'active' : ''}`}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: isProtect ? '#3b82f6' : '#000',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  まもる
                </button>
                <button
                  type="button"
                  onClick={() => setIsReflectWall(!isReflectWall)}
                  className={`toggle-btn ${isReflectWall ? 'active' : ''}`}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: isReflectWall ? '#3b82f6' : '#000',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  リフレク・光の壁
                </button>
                <button
                  type="button"
                  onClick={() => setIsStealthRock(!isStealthRock)}
                  className={`toggle-btn ${isStealthRock ? 'active' : ''}`}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: isStealthRock ? '#3b82f6' : '#000',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ステルスロック
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsRoost(!isRoost)}
                  className={`toggle-btn ${isRoost ? 'active' : ''}`}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: isRoost ? '#3b82f6' : '#000',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  はねやすめ
                </button>
                <button
                  type="button"
                  onClick={() => setIsSpikes(!isSpikes)}
                  className={`toggle-btn ${isSpikes ? 'active' : ''}`}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: isSpikes ? '#3b82f6' : '#000',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  まきびし
                </button>
                <button
                  type="button"
                  onClick={() => setIsLifeOrbRecoil(!isLifeOrbRecoil)}
                  className={`toggle-btn ${isLifeOrbRecoil ? 'active' : ''}`}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: isLifeOrbRecoil ? '#3b82f6' : '#000',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  命の珠
                </button>
              </div>

              {/* 定数ダメージ */}
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>定数ダメージ</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                  {['1/32', '1/16', '1/8', '1/4', '1/2', '1/10', '2/10', '3/10'].map((frac) => (
                    <button
                      key={frac}
                      type="button"
                      onClick={() => setCustomFixedFraction(customFixedFraction === frac ? null : frac)}
                      className={`toggle-btn ${customFixedFraction === frac ? 'active' : ''}`}
                      style={{
                        padding: '6px 0',
                        borderRadius: '6px',
                        border: '1px solid #444',
                        backgroundColor: customFixedFraction === frac ? '#ffd54f' : '#000',
                        color: customFixedFraction === frac ? '#000' : '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        textAlign: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {frac}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 🟩 その他エリア (天候・フィールド) */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: '#1b3227', 
        borderLeft: '12px solid #55ab26', 
        borderRadius: '2px', 
        padding: '16px 20px', 
        alignItems: 'center', 
        gap: '24px', 
        marginTop: '16px',
        color: '#ffffff'
      }}>
        <div style={{ 
          fontSize: '0.9rem', 
          writingMode: 'vertical-rl', 
          textOrientation: 'upright', 
          letterSpacing: '2px', 
          color: '#ffffff',
          fontWeight: '500'
        }}>
          状況
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          
          {/* 天候行 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '1.2rem', minWidth: '90px', letterSpacing: '4px' }}>天候</span>
            <div style={{ 
              display: 'flex', 
              backgroundColor: '#273f34', 
              borderRadius: '20px', 
              padding: '3px', 
              flex: 1 
            }}>
              {['なし', 'あめ', 'はれ', 'すな', 'ゆき'].map(w => (
                <button
                  key={w}
                  onClick={() => setWeather(w)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '17px',
                    border: 'none',
                    backgroundColor: weather === w ? '#5e716e' : 'transparent',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: weather === w ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* フィールド行 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '1.2rem', minWidth: '90px', letterSpacing: '2px' }}>フィールド</span>
            <div style={{ 
              display: 'flex', 
              backgroundColor: '#273f34', 
              borderRadius: '20px', 
              padding: '3px', 
              flex: 1 
            }}>
              {['なし', 'エレキ', 'グラス', 'サイコ', 'ミスト'].map(f => (
                <button
                  key={f}
                  onClick={() => setField(f)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '17px',
                    border: 'none',
                    backgroundColor: field === f ? '#5e716e' : 'transparent',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: field === f ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* よく使われる技リスト */}
      {(() => {
        const baseName = getBasePokemonName(attacker?.name);
        const currentPopularMoves = moveUsage[baseName]?.popular || moveUsage[attacker?.name]?.popular || [];
        if (currentPopularMoves.length === 0) return null;

        return (
          <div style={{ marginTop: '16px', backgroundColor: '#18181b', borderRadius: '8px', padding: '12px', border: '1px solid #27272a' }}>
            <div style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px' }}>
              よく使われる技
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentPopularMoves.map((moveName, idx) => {
                const calc = calculatePopularMoveDamage({ name: moveName });
                if (!calc) return null;

                const minDmg = calc.minDmg;
                const maxDmg = calc.maxDmg;
                const maxHp = defHpStat;

                const minRemHp = Math.max(0, maxHp - maxDmg);
                const maxRemHp = Math.max(0, maxHp - minDmg);

                const minRemPct = Math.max(0, (minRemHp / maxHp) * 100);
                const maxRemPct = Math.max(0, (maxRemHp / maxHp) * 100);

                const getBarColor = (pct) => {
                  if (pct > 50) return '#4caf50';
                  if (pct > 20) return '#ffeb3b';
                  return '#f44336';
                };

                const barColor = getBarColor((maxRemHp / maxHp) * 100);

                return (
                  <div key={idx} style={{ padding: '8px', borderBottom: '1px solid #27272a', backgroundColor: '#121215', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          backgroundColor: TYPE_COLORS[calc.fullMove.type] || '#2563eb', 
                          color: '#fff', 
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {moveName}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>
                          {calc.fullMove.category || '物理'} / 威力{calc.fullMove.power || '-'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <span style={{ color: '#ff6b6b', marginRight: '6px' }}>{minDmg} ～ {maxDmg}</span>
                        <span style={{ color: '#ffd54f' }}>({calc.minPct}% ～ {calc.maxPct}%)</span>
                      </div>
                    </div>

                    <div style={{
                      position: 'relative',
                      height: '10px',
                      backgroundColor: '#333',
                      borderRadius: '5px',
                      overflow: 'hidden',
                      margin: '4px 0'
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${maxRemPct}%`,
                        backgroundColor: barColor,
                        opacity: 0.4,
                        transition: 'width 0.2s ease'
                      }} />

                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${minRemPct}%`,
                        backgroundColor: barColor,
                        transition: 'width 0.2s ease'
                      }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ fontSize: '0.75rem' }}>
                        <span style={{ color: '#aaa', marginRight: '4px' }}>残りHP:</span>
                        <span style={{ fontWeight: 'bold', color: '#4fc3f7' }}>
                          {minRemHp} ～ {maxRemHp}
                        </span>
                        <span style={{ color: '#888', marginLeft: '2px' }}>/ {maxHp}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMoveChange(moveName)}
                        style={{ 
                          padding: '2px 10px', 
                          borderRadius: '12px', 
                          border: '1px solid #3b82f6', 
                          backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                          color: '#60a5fa', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold',
                          cursor: 'pointer' 
                        }}
                      >
                        選択 ＋
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 最下部固定バー */}
      <StickyDamageBar 
        attacker={{ movePower: basePower, atkStat: atkStat }}
        defender={{ hpStat: defHpStat, defStat: defStat }}
        damageResult={{ 
          rolls: combinedRolls,
          minDamage: minDamage, 
          maxDamage: maxDamage 
        }}
      />

      {/* 検索・選択モーダル */}
      <SelectionModal
        key={`${modalConfig.type}-${modalConfig.target}-${modalConfig.isOpen}`}
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        type={modalConfig.type}
        pokemonName={modalConfig.target === 'attacker' ? attacker.name : defender.name}
        itemList={modalConfig.type === 'move' ? moves : pokemons}
        onSelect={handleModalSelect}
      />

      {/* ℹ️ アプリ情報モーダル */}
      {isInfoOpen && (
        <div className="info-modal-overlay" onClick={() => setIsInfoOpen(false)}>
          <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal-header">
              <span className="info-modal-title">アプリ情報</span>
              <button className="info-modal-close" onClick={() => setIsInfoOpen(false)}>✕</button>
            </div>

            <div className="info-modal-section">
              <h4>アプリ名 / バージョン</h4>
              <p><b>Champions</b> v1.0.0</p>
            </div>

            <div className="info-modal-section">
              <h4>作成者 / SNS</h4>
              <p>
                Created by <a href="https://twitter.com/your_twitter_id" target="_blank" rel="noopener noreferrer">@作成者アカウント</a>
              </p>
            </div>

            <div className="info-modal-section">
              <h4>権利表記・免責事項</h4>
              <p>※当アプリは個人によって制作された非公式のファンコンテンツです。任天堂・クリーチャーズ・ゲームフリーク等とは一切関係ありません。</p>
              <p style={{ marginTop: '4px' }}>※ポケモンの名称・データ等の著作権および商標権は、それぞれの権利者に帰属します。</p>
            </div>
          </div>
        </div>
      )}

{/* 📄 フッター（アプリ情報・権利表記・作成者情報） */}
      <footer className="app-footer">
        <div className="footer-info">
          <span className="app-title-ver">Champions v1.0.0</span>
          <span className="author-info">
            Created by <a href="https://twitter.com/your_twitter_id" target="_blank" rel="noopener noreferrer">@作成者アカウント</a>
          </span>
        </div>
        <div className="footer-disclaimer">
          <p>※当アプリは個人によって制作された非公式のファンコンテンツです。任天堂・クリーチャーズ・ゲームフリーク等とは一切関係ありません。</p>
          <p>※ポケモンの名称・データ等の著作権および商標権は、それぞれの権利者に帰属します。</p>
        </div>
      </footer>
    </div>
  );
}