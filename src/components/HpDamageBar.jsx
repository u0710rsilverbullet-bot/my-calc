import React from 'react';

export default function HpDamageBar({ maxHp, minDamage, maxDamage }) {
  if (!maxHp || maxHp <= 0) return null;

  // 残りHPの実数値を計算 (0未満にはならないように調整)
  const minRemainingHp = Math.max(0, maxHp - maxDamage); // 最大ダメージを受けた後の最小残りHP
  const maxRemainingHp = Math.max(0, maxHp - minDamage); // 最小ダメージを受けた後の最大残りHP

  // 残りHPの割合 (%)
  const minRemainingPct = (minRemainingHp / maxHp) * 100;
  const maxRemainingPct = (maxRemainingHp / maxHp) * 100;

  // 残りHPの割合に応じた「色」を取得する関数
  const getHpColor = (pct) => {
    if (pct > 50) return '#22c55e'; // 緑 (50%超)
    if (pct > 20) return '#eab308'; // 黄 (20%超 50%以下)
    return '#ef4444';               // 赤 (20%以下)
  };

  // 最小ダメージ時の残りHP（＝多い方のHP）の色をメインカラーにする
  const barColor = getHpColor(maxRemainingPct);

  // ダメージ割合 (%)
  const minDmgPct = ((minDamage / maxHp) * 100).toFixed(1);
  const maxDmgPct = ((maxDamage / maxHp) * 100).toFixed(1);

  // 確定数計算
  const isConfirmedKo = minDamage >= maxHp;
  const isRandomKo = !isConfirmedKo && maxDamage >= maxHp;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      
      {/* 1. HPゲージバー */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '14px',
        backgroundColor: '#1f2937', // バーの背景（削れた部分）
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)'
      }}>
        {/* 最大残りHP（確定で残る部分） */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${minRemainingPct}%`,
          backgroundColor: barColor,
          transition: 'all 0.3s ease-in-out'
        }} />

        {/* 乱数領域（最大ダメージ〜最小ダメージの間の振れ幅部分：少し薄く表示） */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: `${minRemainingPct}%`,
          width: `${maxRemainingPct - minRemainingPct}%`,
          height: '100%',
          backgroundColor: barColor,
          opacity: 0.5, // 乱数幅が分かるように半透明化
          transition: 'all 0.3s ease-in-out'
        }} />
      </div>

      {/* 2. 下部テキスト（確定数・ダメージ量・割合） */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#e2e8f0'
      }}>
        {/* 確定数 */}
        <div>
          {isConfirmedKo && <span style={{ color: '#ef4444' }}>確定 1発</span>}
          {isRandomKo && <span style={{ color: '#eab308' }}>乱数 1発</span>}
          {!isConfirmedKo && !isRandomKo && (
            <span style={{ color: '#94a3b8' }}>
              確定 {Math.ceil(maxHp / minDamage)}発
              {Math.ceil(maxHp / minDamage) !== Math.ceil(maxHp / maxDamage) &&
                ` (乱数 ${Math.ceil(maxHp / maxDamage)}発)`}
            </span>
          )}
        </div>

        {/* ダメージ数値と% */}
        <div style={{ color: '#f59e0b' }}>
          {minDamage} ～ {maxDamage}
          <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '6px' }}>
            ({minDmgPct}% ～ {maxDmgPct}%)
          </span>
        </div>
      </div>

    </div>
  );
}