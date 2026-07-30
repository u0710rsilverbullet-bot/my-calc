const abilities = [
  {
    "name": "あついしぼう",
    "description": "ほのお・こおりタイプの技を受けた時、ダメージが半減する。",
    "type": "defender",
    "phase": "power",
    "multiplier": 0.5,
    "conditions": {
      "moveTypes": [
        "ほのお",
        "こおり"
      ]
    }
  },
  {
    "name": "アナライズ",
    "description": "自分の攻撃がターンで一番最後の時、技の威力が1.3倍になる。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.3,
    "conditions": {
      "requiresToggle": true,
      "toggleKey": "isMoveLast",
      "toggleLabel": "⏱ 後攻攻撃 (アナライズ)"
    }
  },
  {
    "name": "おやこあい",
    "description": "同じ技を1ターンに2回攻撃できる。2回目の攻撃は、威力が0.25倍になる。能力ランクを下げるなどの効果は2回分与えられる。1ターンに連続して攻撃する技や、複数の相手に攻撃する技の場合は2回攻撃できない。",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1.25,
    "conditions": {
      "note": "2回攻撃 (2回目は0.25倍)"
    }
  },
  {
    "name": "かたいツメ",
    "description": "接触技(直接攻撃)の威力が1.3倍になる。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.3,
    "conditions": {
      "isContact": true
    }
  },
  {
    "name": "かんそうはだ",
    "description": "ほのおタイプの技の受けるダメージが1.25倍になる。",
    "type": "defender",
    "phase": "final_damage",
    "multiplier": 1.25,
    "conditions": {
      "moveTypes": [
        "ほのお"
      ]
    }
  },
  {
    "name": "かんつうドリル",
    "description": "接触技(直接攻撃)を使うと、相手のまもる、みきり、たたみがえし、トーチカ、キングシールド、ニードルガード、ブロッキング、スレッドトラップ、かえんのまもり、ファストガード、ワイドガードの守りの効果を無視して、本来の1/4のダメージを与える。相手の守りの効果以外は発動される。",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "ignoresProtect": true
    }
  },
  {
    "name": "がんじょうあご",
    "description": "あごやキバを使って攻撃する噛み技かみつく、かみくだく、ひっさつまえば、ほのおのキバ、かみなりのキバ、こおりのキバ、どくどくのキバ、サイコファング、エラがみ、くらいつくの威力が1.5倍になる。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.5,
    "conditions": {
      "moveFlags": [
        "bite"
      ]
    }
  },
  {
    "name": "きもったま",
    "description": "相手がゴーストタイプでも、ノーマルかくとうタイプの技が等倍で当たる。",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "ignoreGhostImmunity": true
    }
  },
  {
    "name": "きよめのしお",
    "description": "ゴーストタイプの技の受けるダメージが半減する。",
    "type": "defender",
    "phase": "final_damage",
    "multiplier": 0.5,
    "conditions": {
      "moveTypes": [
        "ゴースト"
      ]
    }
  },
  {
    "name": "きれあじ",
    "description": "切る技アクアカッター、いあいぎり、エアカッター、エアスラッシュ、がんせきアックス、きょじゅうざん、きりさく、クロスポイズン、サイコカッター、サイコブレイド、シェルブレード、シザークロス、しんぴのつるぎ、せいなるつるぎ、ソーラーブレード、タキオンカッター、つじぎり、つばめがえし、ドゲザン、ネズミざん、はっぱカッター、パワフルエッジ、ひけん・ちえなみ、むねんのつるぎ、リーフブレード、れんぞくぎり、フェイタルクロー、ドラゴンクロー、シャドークロー、ブレイククローの威力が1.5倍になる。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.5,
    "conditions": {
      "moveFlags": [
        "slicing"
      ]
    }
  },
  {
    "name": "ぎたい",
    "description": "場フィールドの状態にあわせて、自分の『タイプ』が変化する。エレキフィールドではでんきタイプ、グラスフィールドではくさタイプ、サイコフィールドではエスパータイプ、ミストフィールドではフェアリーになる。フィールドが戻ると、タイプも元に戻る。",
    "type": "both",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "fieldChangeType": true
    }
  },
  {
    "name": "げきりゅう",
    "description": "HPが1/3以下の時、みずタイプの攻撃技を使用した時の『こうげき』『とくこう』が1.5倍になる。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 1.5,
    "conditions": {
      "moveTypes": [
        "みず"
      ],
      "requiresToggle": true,
      "toggleKey": "isPinch",
      "toggleLabel": "🚨 HP1/3以下 (ピンチ技強化)"
    }
  },
  {
    "name": "こんじょう",
    "description": "状態異常の時、『こうげき』が1.5倍になる。またその時、『やけど』状態による『こうげき』半減の効果を受けない。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 1.5,
    "conditions": {
      "requiresToggle": true,
      "toggleKey": "isStatusAilment",
      "toggleLabel": "💫 状態異常 (こんじょう)"
    }
  },
  {
    "name": "さめはだ",
    "description": "接触技(直接攻撃)を受けると、相手のHPを相手の最大HPの1/8減らす。",
    "type": "defender",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "recoilFraction": 0.125,
      "isContact": true
    }
  },
  {
    "name": "サンパワー",
    "description": "天気がはれの時、『とくこう』が1.5倍になるが、毎ターン終了時に最大HPの1/8のダメージを受ける。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 1.5,
    "conditions": {
      "weather": "はれ",
      "category": "特殊"
    }
  },
  {
    "name": "しめりけ",
    "description": "全てのポケモンは技じばく、だいばくはつ、ビックリヘッド、ミストバーストが失敗し、また特性ゆうばくが無効になる。",
    "type": "both",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "blocksSelfDestruct": true
    }
  },
  {
    "name": "しんりょく",
    "description": "HPが1/3以下の時、くさタイプの攻撃技を使用した時の『こうげき』『とくこう』が1.5倍になる。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 1.5,
    "conditions": {
      "moveTypes": [
        "くさ"
      ],
      "requiresToggle": true,
      "toggleKey": "isPinch",
      "toggleLabel": "🚨 HP1/3以下 (ピンチ技強化)"
    }
  },
  {
    "name": "すいほう",
    "description": "みずタイプの技の威力が2倍になる。また、ほのおタイプの技を受けた時、ダメージが半減する。さらに『やけど』状態にならない。",
    "type": "both",
    "phase": "special",
    "multiplier": 2,
    "conditions": {
      "atkMoveType": "みず",
      "defMoveTypeMultiplier": {
        "ほのお": 0.5
      }
    }
  },
  {
    "name": "スカイスキン",
    "description": "自分のノーマルタイプの技がひこうタイプになり、さらに威力が1.2倍になる(第6世代は1.3倍)。ダイマックスすると、ダイジェットになるが、威力の補正はない。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.2,
    "conditions": {
      "changeNormalTypeTo": "ひこう"
    }
  },
  {
    "name": "スキルリンク",
    "description": "1ターンに複数回連続で攻撃する技おうふくビンタ、スイープビンタ、スケイルショット、タネマシンガン、たまなげ、つっぱり、つららばり、とげキャノン、ボーンラッシュ、ミサイルばり、みずしゅりけん、みだれづき、みだれひっかき、れんぞくパンチ、ロックブラスト、トリプルキック、トリプルアクセル、ネズミざんが1度目が成功すれば、必ず最大回数当たる。",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "alwaysMaxHits": true
    }
  },
  {
    "name": "すてみ",
    "description": "技アフロブレイク、ウッドハンマー、じごくぐるま、すてみタックル、とっしん、とびげり、とびひざげり、もろはのずつき、フレアドライブ、ブレイブバード、ボルテッカー、ワイルドボルト、ウェーブタックル、かかとおとし、サンダーダイブ、はめつのひかりの威力が1.2倍になる。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.2,
    "conditions": {
      "moveFlags": [
        "recoil"
      ]
    }
  },
  {
    "name": "スナイパー",
    "description": "自分の攻撃が急所に当たると、ダメージが1.5倍ではなく2.25倍になる。",
    "type": "attacker",
    "phase": "final_damage",
    "multiplier": 1.5,
    "conditions": {
      "isCriticalOnly": true
    }
  },
  {
    "name": "すなのちから",
    "description": "天気がすなあらしの時、自分のじめんいわはがねタイプの技の威力が1.3倍になる。また、すなあらしによるダメージを受けない。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.3,
    "conditions": {
      "weather": "すな",
      "moveTypes": [
        "じめん",
        "いわ",
        "はがね"
      ]
    }
  },
  {
    "name": "すりぬけ",
    "description": "相手のオーロラベール、リフレクター、ひかりのかべ、しろいきり、しんぴのまもり、みがわりの効果を受けない。",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "ignoresReflectAndScreens": true
    }
  },
  {
    "name": "そうだいしょう",
    "description": "場に出た時に、これまでに『ひんし』状態になった味方のポケモン数×10%だけ技の威力が上がる。(最大1.5倍)",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1,
    "conditions": {
      "requiresValue": true,
      "valueKey": "faintedCount",
      "valueLabel": "ひんし味方数",
      "perUnitMultiplier": 0.1,
      "maxMultiplier": 1.5
    }
  },
  {
    "name": "たいねつ",
    "description": "ほのおタイプの技を受けた時と、『やけど』状態によるダメージが半減する。",
    "type": "defender",
    "phase": "final_damage",
    "multiplier": 0.5,
    "conditions": {
      "moveTypes": [
        "ほのお"
      ]
    }
  },
  {
    "name": "ちからずく",
    "description": "追加効果のある技を使うと、追加効果が発動しない代わりに威力が1.3倍になる。また、追加効果がある技を使うと、道具いのちのたまの反動効果やかいがらのすずの回復効果を受けない。攻撃対象の相手の道具だっしゅつボタン、レッドカード、アッキのみ、タラプのみおよび特性にげごし、ききかいひ、へんしょく、わるいてぐせ、ぎゃくじょうの効果も発動させない。なお、自分の能力ランクを下げる技や反動技、ダイマックス技は追加効果の対象ではない。ひみつのちから、かげぬい、うたかたのアリア、アンカーショット、ぶきみなじゅもん、がんせきアックス、ひけん・ちえなみ、いっちょうあがり、みずあめボムは対象となる。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.3,
    "conditions": {
      "moveHasSecondaryEffect": true
    }
  },
  {
    "name": "ちからもち",
    "description": "攻撃時の自分の『こうげき』が2倍になる。なお、技イカサマの場合も、相手の『こうげき』を自分の能力にコピーした後に2倍にして攻撃する。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 2,
    "conditions": {
      "category": "物理"
    }
  },
  {
    "name": "ちくでん",
    "description": "でんきタイプの技を受けるとダメージや効果はなくなり、最大HPの1/4回復する。",
    "type": "defender",
    "phase": "immune",
    "multiplier": 0,
    "conditions": {
      "immuneType": "でんき"
    }
  },
  {
    "name": "ちょすい",
    "description": "みずタイプの技を受けるとダメージや効果はなくなり、最大HPの1/4回復する。",
    "type": "defender",
    "phase": "immune",
    "multiplier": 0,
    "conditions": {
      "immuneType": "みず"
    }
  },
  {
    "name": "てきおうりょく",
    "description": "自分の『タイプ』と同じ『タイプ』の技のダメージが1.5倍ではなく2倍になる。テラスタル状態の時は、テラスタイプのみが対象となり、テラスタイプが元のタイプと同じ場合は2.25倍、異なる場合は2倍になる。",
    "type": "attacker",
    "phase": "stab",
    "multiplier": 2,
    "conditions": {
      "sameTypeAttack": true
    }
  },
  {
    "name": "テクニシャン",
    "description": "威力が60以下の技の威力が1.5倍になる。基礎威力が変動する技は、変動後の威力で判定する。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.5,
    "conditions": {
      "maxBasePower": 60
    }
  },
  {
    "name": "てつのこぶし",
    "description": "パンチ系の技アイスハンマー、アームハンマー、かみなりパンチ、きあいパンチ、グロウパンチ、コメットパンチ、シャドーパンチ、スカイアッパー、ドレインパンチ、ばくれつパンチ、バレットパンチ、ピヨピヨパンチ、プラズマフィスト、ほのおのパンチ、マッハパンチ、メガトンパンチ、れいとうパンチ、れんぞくパンチ、ダブルパンツァー、あんこくきょうだ、すいりゅうれんだ、ぶちかまし、ジェットパンチ、ふんどのこぶしの威力が1.2倍になる。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.2,
    "conditions": {
      "moveFlags": [
        "punch"
      ]
    }
  },
  {
    "name": "てんきや",
    "description": "天気がにほんばれの時はほのおタイプに、『あめ』の時はみずタイプに、『ゆき』の時はこおりタイプになり、姿がそれぞれ変化する。",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "weatherTypeChange": true
    }
  },
  {
    "name": "てんねん",
    "description": "相手の『こうげき』『ぼうぎょ』『とくこう』『とくぼう』ランクおよび『回避率』『命中率』ランクの変化の影響を受けない。(素早さは除く)",
    "type": "both",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "ignoreStatRanks": true
    }
  },
  {
    "name": "でんきえんじん",
    "description": "でんきタイプの技を受けるとダメージや効果はなくなり、『すばやさ』ランクが1段階上がる。",
    "type": "defender",
    "phase": "immune",
    "multiplier": 0,
    "conditions": {
      "immuneType": "でんき"
    }
  },
  {
    "name": "でんきにかえる",
    "description": "攻撃を受けた時にじゅうでん状態(でんき威力アップ状態)になり、一度だけ次回使う自分のでんきタイプの技の威力が2倍になる。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 2,
    "conditions": {
      "moveTypes": [
        "でんき"
      ],
      "requiresToggle": true,
      "toggleKey": "isChargeActive",
      "toggleLabel": "⚡ じゅうでん状態 (でんきにかえる)"
    }
  },
  {
    "name": "とうそうしん",
    "description": "性別が同じ相手に対しては『こうげき』『とくこう』が1.25倍になるが、異なる場合は0.75倍になる。性別のないポケモンの場合は変化なし。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 1,
    "conditions": {
      "requiresOption": true,
      "optionKey": "genderCompare",
      "options": [
        {
          "label": "同性 (1.25倍)",
          "mult": 1.25
        },
        {
          "label": "異性 (0.75倍)",
          "mult": 0.75
        },
        {
          "label": "無性/対象外 (1.0倍)",
          "mult": 1
        }
      ]
    }
  },
  {
    "name": "どしょく",
    "description": "じめんタイプの技を受けると、ダメージを受けずHPが最大HPの1/4回復する。",
    "type": "defender",
    "phase": "immune",
    "multiplier": 0,
    "conditions": {
      "immuneType": "じめん"
    }
  },
  {
    "name": "ドラゴンスキン",
    "description": "自分のノーマルタイプの技がドラゴンタイプになり、さらに威力が1.2倍になる。(ダイマックスすると、ダイドラグーンになるが、威力の補正はない。)",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.2,
    "conditions": {
      "changeNormalTypeTo": "ドラゴン"
    }
  },
  {
    "name": "ノーガード",
    "description": "お互いに技が命中率・回避率に関係なく必ず命中する。技そらをとぶ、とびはねる、フリーフォール、あなをほる、ダイビング、ゴーストダイブ、シャドーダイブを使っている時でも命中する。",
    "type": "both",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "alwaysHit": true
    }
  },
  {
    "name": "ノーてんき",
    "description": "全てのポケモンに対しての天気の影響がなくなる。",
    "type": "both",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "ignoreWeather": true
    }
  },
  {
    "name": "ハードロック",
    "description": "タイプ相性が『こうかは ばつぐん』の技の受けるダメージが3/4になる。例えば、本来2倍弱点の場合は1.5倍のダメージに軽減される。",
    "type": "defender",
    "phase": "final_damage",
    "multiplier": 0.75,
    "conditions": {
      "superEffectiveOnly": true
    }
  },
  {
    "name": "はらぺこスイッチ",
    "description": "ターン終了時、『まんぷくもよう』と『はらぺこもよう』を交互にフォルムチェンジする。技オーラぐるまのタイプが、『まんぷく』の時はでんき、『はらぺこ』の時はあくタイプに変わる。",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "formChangeMoveType": true
    }
  },
  {
    "name": "はりきり",
    "description": "物理技を使用する時、『こうげき』が1.5倍になるが、命中率が0.8倍になる。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 1.5,
    "conditions": {
      "category": "物理",
      "accuracyMultiplier": 0.8
    }
  },
  {
    "name": "ばけのかわ",
    "description": "1回だけ相手の技のダメージや『こんらん』状態による自傷ダメージを無効化し、フォルムチェンジする(能力などは変化しない)。その時、第8世代からは最大HPの1/8のダメージを受ける。ダメージ以外の効果や、状態異常、天気や道具、特性によるダメージなどには影響しない。一度フォルムチェンジすると、場から離れてもバトル中は元に戻らない。",
    "type": "defender",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "requiresToggle": true,
      "toggleKey": "disguiseIntact",
      "toggleLabel": "🎭 ばけのかわ(残存)",
      "blocksFirstDamage": true
    }
  },
  {
    "name": "ひとでなし",
    "description": "相手が『どく』『もうどく』状態の時、自分の攻撃が必ず急所に当たる。",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "defenderStatusIn": [
        "どく",
        "もうどく"
      ],
      "alwaysCritical": true
    }
  },
  {
    "name": "ひらいしん",
    "description": "でんきタイプの技を受けるとダメージが無効化され、自分の『とくこう』ランクが1段階上がる。またダブルバトルの時、自分以外の全てのポケモンのでんきタイプの単体攻撃技の攻撃対象が自分になる。(攻撃対象が複数の技の場合はそのまま)",
    "type": "defender",
    "phase": "immune",
    "multiplier": 0,
    "conditions": {
      "immuneType": "でんき"
    }
  },
  {
    "name": "ファーコート",
    "description": "物理攻撃の受けるダメージが半減する。",
    "type": "defender",
    "phase": "final_damage",
    "multiplier": 0.5,
    "conditions": {
      "category": "物理"
    }
  },
  {
    "name": "フィルター",
    "description": "タイプ相性が『こうかは ばつぐん』の技の受けるダメージが3/4になる。例えば、2倍弱点の場合は1.5倍のダメージになる。",
    "type": "defender",
    "phase": "final_damage",
    "multiplier": 0.75,
    "conditions": {
      "superEffectiveOnly": true
    }
  },
  {
    "name": "フェアリーオーラ",
    "description": "お互いのすべてのポケモンのフェアリータイプの技の威力が4/3倍(1.33倍)になる。",
    "type": "both",
    "phase": "power",
    "multiplier": 1.333,
    "conditions": {
      "moveTypes": [
        "フェアリー"
      ]
    }
  },
  {
    "name": "フェアリースキン",
    "description": "自分のノーマルタイプの技がフェアリータイプになり、さらに威力が1.2倍になる。ダイマックスすると、ダイフェアリーになるが、威力の補正はない。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.2,
    "conditions": {
      "changeNormalTypeTo": "フェアリー"
    }
  },
  {
    "name": "ふかしのこぶし",
    "description": "接触技(直接攻撃)を使うと、相手のまもる、みきり、たたみがえし、トーチカ、キングシールド、ニードルガード、ブロッキング、スレッドトラップ、かえんのまもり、ファストガード、ワイドガードの守りの効果を無視して、本来の1/4のダメージを与える。相手の守りの効果以外は発動される。",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "isContact": true,
      "ignoresProtect": true
    }
  },
  {
    "name": "ふしぎなうろこ",
    "description": "状態異常の時、『ぼうぎょ』が1.5倍になる。",
    "type": "defender",
    "phase": "stat_def",
    "multiplier": 1.5,
    "conditions": {
      "requiresToggle": true,
      "toggleKey": "defStatusAilment",
      "toggleLabel": "💫 防御側状態異常 (ふしぎなうろこ)"
    }
  },
  {
    "name": "ふゆう",
    "description": "じめんタイプの技を受けない。また、技どくびし、まきびし、ねばねばネットや特性ありじごくの効果を受けない。エレキフィールド、サイコフィールド、グラスフィールド、ミストフィールドの効果も受けない。",
    "type": "defender",
    "phase": "immune",
    "multiplier": 0,
    "conditions": {
      "immuneType": "じめん"
    }
  },
  {
    "name": "フリーズスキン",
    "description": "自分のノーマルタイプの技がこおりタイプになり、さらに威力が1.2倍になる。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.2,
    "conditions": {
      "changeNormalTypeTo": "こおり"
    }
  },
  {
    "name": "ぶきよう",
    "description": "持っている道具の効果が発揮されない。",
    "type": "both",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "ignoreItem": true
    }
  },
  {
    "name": "プラス",
    "description": "特性プラスかマイナスのポケモンが戦闘にいると『とくこう』が1.5倍になる。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 1.5,
    "conditions": {
      "category": "特殊",
      "requiresToggle": true,
      "toggleKey": "hasPlusMinusAlly",
      "toggleLabel": "➕/➖ プラス/マイナス味方アリ"
    }
  },
  {
    "name": "へんげんじざい",
    "description": "場に出てから最初に技を出す時、技を出す直前のタイミングで自分のタイプが技と同じタイプになる(タイプは変化したままになる)。変化技にも有効。",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "changeTypeToMoveType": true
    }
  },
  {
    "name": "ヘヴィメタル",
    "description": "自分の『おもさ』が2倍になる。(技ヘビーボンバーなどで有効)",
    "type": "both",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "weightMultiplier": 2
    }
  },
  {
    "name": "ほのおのたてがみ",
    "description": "ほのおタイプの技の威力が1.5倍になる。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.5,
    "conditions": {
      "moveTypes": [
        "ほのお"
      ]
    }
  },
  {
    "name": "ぼうおん",
    "description": "音系の技いにしえのうた、いびき、いやしのすず、いやなおと、うたう、うたかたのアリア、エコーボイス、おしゃべり、おたけび、きんぞくおん、くさぶえ、さわぐ、スケイルノイズ、すてゼリフ、チャームボイス、ちょうおんぱ、とおぼえ、ないしょばなし、なきごえ、バークアウト、ハイパーボイス、ばくおんぱ、ほえる、ほろびのうた、むしのさざめき、りんしょう、ブレイジングソウルビート、オーバードライブ、ぶきみなじゅもん、フレアソング、みわくのボイス、サイコノイズ、ドラゴンエールを受けない。",
    "type": "defender",
    "phase": "immune",
    "multiplier": 0,
    "conditions": {
      "immuneType": "sound"
    }
  },
  {
    "name": "ぼうじん",
    "description": "天気すなあらしによるダメージを受けない。粉系の技いかりのこな、キノコのほうし、しびれごな、どくのこな、ねむりごな、ふんじん、まほうのこな、わたほうし、特性ほうしの効果を受けない。",
    "type": "defender",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "ignorePowderMoves": true
    }
  },
  {
    "name": "ぼうだん",
    "description": "たま・爆弾系の技アイスボール、アシッドボム、ウェザーボール、エナジーボール、エレキボール、オクタンほう、かえんだん、かえんボール、かふんだんご、がんせきほう、きあいだま、くちばしキャノン、ジャイロボール、シャドーボール、タネばくだん、タネマシンガン、タマゴばくだん、たまなげ、でんじほう、どろばくだん、はどうだん、ヘドロばくだん、マグネットボム、ミストボール、ロックブラスト、みずあめボムを無効化する。",
    "type": "defender",
    "phase": "immune",
    "multiplier": 0,
    "conditions": {
      "immuneType": "bullet"
    }
  },
  {
    "name": "ポイズンヒール",
    "description": "『どく』状態の時毎ターン、HPが減らずに最大HPの1/8だけ回復する。『もうどく』状態でも回復量は変わらない。",
    "type": "defender",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "healOnPoison": true
    }
  },
  {
    "name": "マイナス",
    "description": "特性プラスかマイナスのポケモンが戦闘にいると『とくこう』が1.5倍になる。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 1.5,
    "conditions": {
      "category": "特殊",
      "requiresToggle": true,
      "toggleKey": "hasPlusMinusAlly",
      "toggleLabel": "➕/➖ プラス/マイナス味方アリ"
    }
  },
  {
    "name": "マジックガード",
    "description": "直接のダメージ以外を受けない。具体的には、『どく』『もうどく』『やけど』状態や特性さめはだ、てつのトゲ、とびだすなかみ、ヘドロえき、ゆうばく、天気すなあらし、技あくむ、うずしお、からではさむ、サンダープリズン、しおづけ、しめつける、ステルスロック、すなじごく、トラバサミ、のろい、はじけるほのお、ふんじん、ほのおのうず、ほのおのちかい、まきつく、まきびし、マグマストーム、まとわりつく、やどりぎのタネによるダメージ、反動のある技による反動ダメージや失敗時に受けるダメージ、ニードルガード、ふんじんによるダメージ、道具いのちのたま、くっつきバリ、くろいヘドロ、ゴツゴツメットの効果によるダメージを受けない。ただし『こんらん』じばく、だいばくはつ、わるあがきなどには影響しない。",
    "type": "defender",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "ignoreIndirectDamage": true
    }
  },
  {
    "name": "マルチスケイル",
    "description": "自分の残りHPが最大値の時、受けるダメージが半減される。",
    "type": "defender",
    "phase": "final_damage",
    "multiplier": 0.5,
    "conditions": {
      "requiresToggle": true,
      "toggleKey": "isFullHp",
      "toggleLabel": "💚 残りHP100% (マルチスケイル)"
    }
  },
  {
    "name": "むしのしらせ",
    "description": "HPが1/3以下の時、むしタイプの攻撃技を使用した時の『こうげき』『とくこう』が1.5倍になる。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 1.5,
    "conditions": {
      "moveTypes": [
        "むし"
      ],
      "requiresToggle": true,
      "toggleKey": "isPinch",
      "toggleLabel": "🚨 HP1/3以下 (ピンチ技強化)"
    }
  },
  {
    "name": "メガソーラー",
    "description": "自分が技を使った時だけ、実際の天気に関係なく、天気がにほんばれ状態の時と同じ効果になる。(天気が変わるわけではない)",
    "type": "attacker",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "pseudoSunEffect": true
    }
  },
  {
    "name": "メガランチャー",
    "description": "波動系の技あくのはどう、はどうだん、みずのはどう、りゅうのはどう、だいちのはどう、こんげんのはどうの技の威力が1.5倍になり、いやしのはどうは最大HPの3/4回復する。",
    "type": "attacker",
    "phase": "power",
    "multiplier": 1.5,
    "conditions": {
      "moveFlags": [
        "pulse"
      ]
    }
  },
  {
    "name": "もうか",
    "description": "HPが1/3以下の時、ほのおタイプの攻撃技を使用した時の『こうげき』『とくこう』が1.5倍になる。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 1.5,
    "conditions": {
      "moveTypes": [
        "ほのお"
      ],
      "requiresToggle": true,
      "toggleKey": "isPinch",
      "toggleLabel": "🚨 HP1/3以下 (ピンチ技強化)"
    }
  },
  {
    "name": "もふもふ",
    "description": "接触技(直接攻撃)を受けた時、ダメージが半減する。また、ほのおタイプの技を受けた時、ダメージが2倍になる。",
    "type": "defender",
    "phase": "final_damage",
    "multiplier": 1,
    "conditions": {
      "contactMultiplier": 0.5,
      "moveTypeMultiplier": {
        "ほのお": 2
      }
    }
  },
  {
    "name": "もらいび",
    "description": "ほのおタイプの技を受けるとダメージや効果はなくなり、以後自分のほのおタイプの技の威力が1.5倍になる。",
    "type": "defender",
    "phase": "immune",
    "multiplier": 0,
    "conditions": {
      "immuneType": "ほのお"
    }
  },
  {
    "name": "ヨガパワー",
    "description": "攻撃時の自分の『こうげき』が2倍になる。なお、技イカサマの場合も、相手の『こうげき』を自分の能力にコピーした後に2倍にして攻撃する。",
    "type": "attacker",
    "phase": "stat_atk",
    "multiplier": 2,
    "conditions": {
      "category": "物理"
    }
  },
  {
    "name": "ライトメタル",
    "description": "自分の『おもさ』が半分になる。(技けたぐり、くさむすび対策などで有効)",
    "type": "both",
    "phase": "special",
    "multiplier": 1,
    "conditions": {
      "weightMultiplier": 0.5
    }
  }
];

export default abilities;