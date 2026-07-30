/**
 * 16通りのダメージ配列と相手HPから確定数・乱数撃破確率を計算する
 * @param {number[]} rolls - 16通りのダメージ値の配列 [min, ..., max]
 * @param {number} targetHp - 防御側の最大HP
 * @param {number} residualDamage - ターン開始/終了時の固定ダメージ（ステロ、砂嵐、毒、命の玉反動等）
 * @returns {object} 計算結果
 */
export function calculateKOChance(rolls, targetHp, residualDamage = 0) {
  if (!rolls || rolls.length !== 16 || targetHp <= 0) {
    return { text: '-', koPercent: 0, koPatternCount: 0 };
  }

  // 残り実質HP（ステロ等で事前に削れている場合を考慮）
  const effectiveHp = targetHp - residualDamage;

  // 1発で倒せるパターン数 (16段階中)
  const ko1Hits = rolls.filter(d => d >= effectiveHp).length;
  if (ko1Hits === 16) {
    return { text: '確定1発', koPercent: 100, koPatternCount: 16, type: 'sure-1' };
  }
  if (ko1Hits > 0) {
    const percent = ((ko1Hits / 16) * 100).toFixed(1);
    return { 
      text: `乱数1発 (${percent}% / 16個中${ko1Hits}個)`, 
      koPercent: Number(percent), 
      koPatternCount: ko1Hits, 
      type: 'rand-1' 
    };
  }

  // 2発で倒せるパターン数 (16 × 16 = 256パターン)
  let ko2Hits = 0;
  for (let r1 of rolls) {
    for (let r2 of rolls) {
      if (r1 + r2 >= effectiveHp) ko2Hits++;
    }
  }
  if (ko2Hits === 256) {
    return { text: '確定2発', koPercent: 100, koPatternCount: 256, type: 'sure-2' };
  }
  if (ko2Hits > 0) {
    const percent = ((ko2Hits / 256) * 100).toFixed(1);
    return { 
      text: `乱数2発 (${percent}%)`, 
      koPercent: Number(percent), 
      koPatternCount: ko2Hits, 
      type: 'rand-2' 
    };
  }

  // 3発で倒せるパターン数 (16^3 = 4096パターン)
  let ko3Hits = 0;
  for (let r1 of rolls) {
    for (let r2 of rolls) {
      for (let r3 of rolls) {
        if (r1 + r2 + r3 >= effectiveHp) ko3Hits++;
      }
    }
  }
  if (ko3Hits === 4096) {
    return { text: '確定3発', koPercent: 100, type: 'sure-3' };
  }
  if (ko3Hits > 0) {
    const percent = ((ko3Hits / 4096) * 100).toFixed(1);
    return { text: `乱数3発 (${percent}%)`, koPercent: Number(percent), type: 'rand-3' };
  }

  // 4発以上
  const minDamage = rolls[0];
  const maxHits = Math.ceil(effectiveHp / minDamage);
  return { text: `確定${maxHits}発以上`, koPercent: 0, type: 'sure-multi' };
}