import React from 'react';

/**
 * 16パターンのダメージ配列と相手HPから確定数・撃破確率を計算
 */
function calculateKOInfo(rolls, maxHp, minDmg, maxDmg) {
  if (maxHp <= 0 || (minDmg === 0 && maxDmg === 0)) {
    return { text: '-' };
  }

  // rolls 配列が未指定・不正な場合のフォールバック（16段階を簡易補間生成）
  let effectiveRolls = rolls;
  if (!effectiveRolls || effectiveRolls.length !== 16) {
    if (minDmg > 0 && maxDmg > 0) {
      effectiveRolls = Array.from({ length: 16 }, (_, i) => {
        return Math.floor(minDmg + ((maxDmg - minDmg) * i) / 15);
      });
    } else {
      return { text: '-' };
    }
  }

  // --- 1発撃破の判定 (16パターン中) ---
  const ko1Hits = effectiveRolls.filter(d => d >= maxHp).length;
  if (ko1Hits === 16) return { text: '確定 1 発' };
  if (ko1Hits > 0) {
    const pct = ((ko1Hits / 16) * 100).toFixed(1);
    return { text: `乱数 1 発 (${pct}%)` };
  }

  // --- 2発撃破の判定 (256パターン中) ---
  let ko2Hits = 0;
  for (const r1 of effectiveRolls) {
    for (const r2 of effectiveRolls) {
      if (r1 + r2 >= maxHp) ko2Hits++;
    }
  }
  if (ko2Hits === 256) return { text: '確定 2 発' };
  if (ko2Hits > 0) {
    const pct = ((ko2Hits / 256) * 100).toFixed(1);
    return { text: `乱数 2 発 (${pct}%)` };
  }

  // --- 3発撃破の判定 (4096パターン中) ---
  let ko3Hits = 0;
  for (const r1 of effectiveRolls) {
    for (const r2 of effectiveRolls) {
      for (const r3 of effectiveRolls) {
        if (r1 + r2 + r3 >= maxHp) ko3Hits++;
      }
    }
  }
  if (ko3Hits === 4096) return { text: '確定 3 発' };
  if (ko3Hits > 0) {
    const pct = ((ko3Hits / 4096) * 100).toFixed(1);
    return { text: `乱数 3 発 (${pct}%)` };
  }

  // --- 4発以上の判定 ---
  const actualMinDmg = effectiveRolls[0];
  const actualMaxDmg = effectiveRolls[effectiveRolls.length - 1];

  // 最低ダメージでかかる最大発数
  const maxHitsNeeded = Math.ceil(maxHp / actualMinDmg);
  // 最高ダメージでかかる最小発数
  const minHitsNeeded = Math.ceil(maxHp / actualMaxDmg);

  if (minHitsNeeded === maxHitsNeeded) {
    return { text: `確定 ${minHitsNeeded} 発` };
  } else {
    return { text: `乱数 ${minHitsNeeded} 発 (確定 ${maxHitsNeeded} 発)` };
  }
}

export default function StickyDamageBar({ attacker, defender, damageResult }) {
  const maxHp = defender?.hpStat || 100;
  const minDmg = damageResult?.minDamage || 0;
  const maxDmg = damageResult?.maxDamage || 0;

  // 16段階ダメージ配列のプロパティ名のブレに対応
  const rolls = damageResult?.rolls || damageResult?.damageRolls || [];

  // 確定数・撃破確率の判定
  const koInfo = calculateKOInfo(rolls, maxHp, minDmg, maxDmg);

  // ダメージ割合 (%)
  const minPct = maxHp > 0 ? ((minDmg / maxHp) * 100).toFixed(1) : '0.0';
  const maxPct = maxHp > 0 ? ((maxDmg / maxHp) * 100).toFixed(1) : '0.0';

  // 残りHP計算
  const minRemHp = Math.max(0, maxHp - maxDmg); // 最低残りHP（最大ダメージ時）
  const maxRemHp = Math.max(0, maxHp - minDmg); // 最大残りHP（最小ダメージ時）

  // 残りHPバー描画用の幅 (%)
  const minRemPct = Math.max(0, (minRemHp / maxHp) * 100); // 確定残りHP領域
  const maxRemPct = Math.max(0, (maxRemHp / maxHp) * 100); // 乱数残りHP領域

  // 残りHP割合に応じたバーカラー（緑 > 黄 > 赤）
  const getBarColor = (pct) => {
    if (pct > 50) return '#4caf50'; // 緑
    if (pct > 20) return '#ffeb3b'; // 黄
    return '#f44336';             // 赤
  };

  const mainColor = getBarColor((maxRemHp / maxHp) * 100);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1b1d22',
      borderTop: '1px solid #333',
      padding: '12px 16px',
      zIndex: 1000,
      boxShadow: '0 -4px 12px rgba(0,0,0,0.5)',
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* バー上部：ダメージ数値 & 割合(%) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
          <div>
            <span style={{ color: '#aaa', fontSize: '0.85rem', marginRight: '6px' }}>ダメージ:</span>
            <span style={{ color: '#ff6b6b' }}>{minDmg} ～ {maxDmg}</span>
          </div>
          <div>
            <span style={{ color: '#ffd54f' }}>{minPct}% ～ {maxPct}%</span>
          </div>
        </div>

        {/* 📊 残りHPバー */}
        <div style={{
          position: 'relative',
          height: '14px',
          backgroundColor: '#333', // 削れたHP部分
          borderRadius: '7px',
          overflow: 'hidden'
        }}>
          {/* 乱数域（うっすら半透明表示） */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${maxRemPct}%`,
            backgroundColor: mainColor,
            opacity: 0.4,
            transition: 'width 0.2s ease'
          }} />

          {/* 確定残りHP（濃い表示） */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${minRemPct}%`,
            backgroundColor: mainColor,
            transition: 'width 0.2s ease'
          }} />
        </div>

        {/* バー下部：残りHP数値 & 確定数表示 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
          <div>
            <span style={{ color: '#aaa', fontSize: '0.85rem', marginRight: '6px' }}>残りHP:</span>
            <span style={{ fontWeight: 'bold', color: '#4fc3f7' }}>
              {minRemHp} ～ {maxRemHp}
            </span>
            <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '4px' }}>/ {maxHp}</span>
          </div>

          {/* 確定数・乱数テキスト（右下） */}
          <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>
            {koInfo.text}
          </div>
        </div>

      </div>
    </div>
  );
}