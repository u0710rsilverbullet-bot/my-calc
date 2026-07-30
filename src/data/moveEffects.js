// src/data/moveEffects.js

export const MOVE_EFFECTS = {
  // --- 天候・フィールド変化 ---
  "ウェザーボール": { type: "weather_ball" },
  "ソーラービーム": { type: "solar_beam" },
  "ソーラーブレード": { type: "solar_beam" },
  "ライジングボルト": { type: "terrain_double", terrain: "エレキ" },
  "じしん": { type: "earthquake" },
  "じならし": { type: "terrain_half", terrain: "グラス" },
  "ワイドフォース": { type: "terrain_boost", terrain: "サイコ", multiplier: 1.5 },
  "ミストバースト": { type: "terrain_boost", terrain: "ミスト", multiplier: 1.5 },
  "だいちのはどう": { type: "nature_power" },
  "Gのちから": { type: "gravity" },

  // --- 状態異常・アイテム依存 ---
  "からげんき": { type: "attacker_status", multiplier: 2.0, ignoreBurn: true },
  "たたりめ": { type: "defender_status", multiplier: 2.0 },
  "ひゃっきやこう": { type: "defender_status", multiplier: 2.0 },
  "ベノムショック": { type: "defender_poison", multiplier: 2.0 },
  "アクロバット": { type: "no_attacker_item", multiplier: 2.0 },
  "はたきおとす": { type: "defender_has_item", multiplier: 1.5 },

  // --- ターン条件・行動順 ---
  "しっぺがえし": { type: "toggle", label: "自分が後攻", multiplier: 2.0 },
  "うっぷんばらし": { type: "toggle", label: "今期能力ランク低下あり", multiplier: 2.0 },
  "ゆきなだれ": { type: "toggle", label: "今期被ダメージあり", multiplier: 2.0 },
  "ダメおし": { type: "toggle", label: "相手が今期ダメージ済み", multiplier: 2.0 },
  "じだんだ": { type: "toggle", label: "前ターンの技失敗/不能", multiplier: 2.0 },
  "やけっぱち": { type: "toggle", label: "前ターンの技失敗/不能", multiplier: 2.0 },

  // --- 回避状態・ちいさくなる対象 ---
  "うずしお": { type: "toggle", label: "相手がダイビング中", multiplier: 2.0 },
  "なみのり": { type: "toggle", label: "相手がダイビング中", multiplier: 2.0 },
  "ヒートスタンプ": { type: "minimize_and_weight_ratio" },
  "ヘビーボンバー": { type: "minimize_and_weight_ratio" },
  "フライングプレス": { type: "toggle", label: "相手が『ちいさくなる』", multiplier: 2.0, dualType: ["かくとう", "ひこう"] },
  "サンダーダイブ": { type: "toggle", label: "相手が『ちいさくなる』", multiplier: 2.0 },
  "ドラゴンダイブ": { type: "toggle", label: "相手が『ちいさくなる』", multiplier: 2.0 },
  "のしかかり": { type: "toggle", label: "相手が『ちいさくなる』", multiplier: 2.0 },

  // --- ランク上昇・蓄積数 ---
  "アシストパワー": { type: "stat_stages_boost" },
  "つけあがる": { type: "stat_stages_boost" },
  "はきだす": { type: "stockpile" },

  // --- 素早さ・重量・HP計算依存 ---
  "エレキボール": { type: "electro_ball" },
  "ジャイロボール": { type: "gyro_ball" },
  "けたぐり": { type: "weight_target" },
  "くさむすび": { type: "weight_target" },
  "きしかいせい": { type: "reversal" },
  "じたばた": { type: "reversal" },
  "しおふき": { type: "water_spout" },
  "ふんか": { type: "water_spout" },
  "ハードプレス": { type: "crush_grip" },

  // --- 状態依存・特殊効果 ---
  "おはかまいり": {
    type: "fainted_count",
    label: "ひんしになった味方の数",
    basePower: 50,
    powerPerFainted: 50,
    maxPower: 150 // 最大5体ひんし（50 + 50×5 = 300）
  },
};