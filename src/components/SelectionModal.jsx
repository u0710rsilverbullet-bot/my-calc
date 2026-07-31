import React, { useState, useMemo, useEffect, useRef } from 'react';
import moveUsageData from '../data/moveUsage.json'; 
import { getBasePokemonName } from '../utils/megaUtils';

// ★ ひらがなをカタカナに変換するヘルパー関数
const hiraganaToKatakana = (str) => {
  return str ? str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  ) : "";
};

export default function SelectionModal({ isOpen, onClose, type, pokemonName, itemList = [], onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  // モーダルが開くたびに検索文字のリセット・フォーカス・履歴取得を行う
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');

      const storageKey = type === 'pokemon' ? 'pokemon_search_history' : 'move_search_history';
      const savedHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setHistory(savedHistory);

      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, type]);

  // アイテム選択時処理
  const handleItemSelect = (item) => {
    const itemName = typeof item === 'string' ? item : item?.name;
    if (!itemName) return;

    const newHistory = [itemName, ...history.filter((h) => h !== itemName)].slice(0, 6);
    setHistory(newHistory);

    const storageKey = type === 'pokemon' ? 'pokemon_search_history' : 'move_search_history';
    localStorage.setItem(storageKey, JSON.stringify(newHistory));

    onSelect(itemName);
    onClose();
  };

  // 履歴削除
  const handleClearHistory = (e) => {
    e.stopPropagation();
    const storageKey = type === 'pokemon' ? 'pokemon_search_history' : 'move_search_history';
    localStorage.removeItem(storageKey);
    setHistory([]);
  };

  // 履歴個別削除
  const handleRemoveHistoryItem = (e, itemToRemove) => {
    e.stopPropagation();
    const newHistory = history.filter((h) => h !== itemToRemove);
    setHistory(newHistory);

    const storageKey = type === 'pokemon' ? 'pokemon_search_history' : 'move_search_history';
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  };

  // そのポケモンが覚える技を取得
  const { popularMoves, otherMoves, allLearnableSet } = useMemo(() => {
    if (type !== 'move' || !pokemonName || !moveUsageData) {
      return { popularMoves: [], otherMoves: [], allLearnableSet: new Set() };
    }

    const baseName = getBasePokemonName(pokemonName);
    const pkmData = moveUsageData[baseName] || moveUsageData[pokemonName];

    if (!pkmData) {
      return { popularMoves: [], otherMoves: [], allLearnableSet: new Set() };
    }

    const popular = Array.isArray(pkmData.popular) ? pkmData.popular : [];
    const other = Array.isArray(pkmData.other) ? pkmData.other : [];

    if (Array.isArray(pkmData)) {
      return { popularMoves: pkmData, otherMoves: [], allLearnableSet: new Set(pkmData) };
    }

    const allSet = new Set([...popular, ...other]);
    return { popularMoves: popular, otherMoves: other, allLearnableSet: allSet };
  }, [type, pokemonName]);

  // 表示リストのフィルタリング
  const { popularList, learnableList, nonLearnableList } = useMemo(() => {
    const safeList = Array.isArray(itemList) ? itemList : [];
    const term = searchTerm.trim();

    if (term) {
      const query = hiraganaToKatakana(term);

      const filtered = safeList.filter(item => {
        const name = typeof item === 'string' ? item : item?.name;
        if (!name) return false;
        const targetName = hiraganaToKatakana(name);
        return targetName.includes(query);
      });
      return { popularList: [], learnableList: filtered, nonLearnableList: [] };
    }

    if (type === 'move' && allLearnableSet.size > 0) {
      const popSet = new Set(popularMoves);
      const othSet = new Set(otherMoves);

      const pop = safeList.filter(item => {
        const name = typeof item === 'string' ? item : item?.name;
        return popSet.has(name);
      });

      const learnable = safeList.filter(item => {
        const name = typeof item === 'string' ? item : item?.name;
        return othSet.has(name) && !popSet.has(name);
      });

      const nonLearnable = safeList.filter(item => {
        const name = typeof item === 'string' ? item : item?.name;
        return !allLearnableSet.has(name);
      });

      return { popularList: pop, learnableList: learnable, nonLearnableList: nonLearnable };
    }

    return { popularList: [], learnableList: safeList, nonLearnableList: [] };
  }, [itemList, searchTerm, type, popularMoves, otherMoves, allLearnableSet]);

  if (!isOpen) return null;

  // 🌟 1行アイテム描画関数（高さを確実に固定・拡大）
  const renderListItem = (item, highlightLevel = 'normal') => {
    const itemName = typeof item === 'string' ? item : item?.name;
    const itemType = item?.type;
    const icon = item?.icon || item?.iconUrl;
    const stats = item?.stats || item?.baseStats;

    let bg = 'transparent';
    let textColor = '#fff';

    if (highlightLevel === 'gold') {
      bg = 'rgba(255, 213, 79, 0.08)';
      textColor = '#ffd54f';
    } else if (highlightLevel === 'silver') {
      bg = 'rgba(129, 212, 250, 0.08)';
      textColor = '#81d4fa';
    }

    return (
      <button
        key={itemName}
        onClick={() => handleItemSelect(item)}
        style={{
          width: '100%',
          height: 'auto',              // 高さを可変に
          minHeight: '64px',           // 確実に2行分入る十分な最小高さを確保
          padding: '12px 16px',        // 上下の余白をしっかり取る
          border: 'none',
          borderBottom: '1px solid #2a2a2a',
          backgroundColor: bg,
          color: textColor,
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxSizing: 'border-box',
          overflow: 'visible'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bg}
      >
        {/* 左側：アイコン + （名前 ＆ タイプの2行表示） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          {icon && (
            <img 
              src={icon} 
              alt={itemName} 
              style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }} 
            />
          )}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justify: 'center', 
            gap: '4px',
            minWidth: 0,
            overflow: 'visible'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '1rem', 
              lineHeight: '1.3',
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {itemName}
            </div>
            {itemType && (
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#aaa', 
                lineHeight: '1.2',
                display: 'block'
              }}>
                {itemType}
              </div>
            )}
          </div>
        </div>

        {/* 右側：種族値（ポケモンの場合） */}
        {type === 'pokemon' && stats && (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '2px 12px', 
    fontSize: '0.75rem', 
    color: '#ccc',
    textAlign: 'right',
    fontFamily: 'monospace',
    flexShrink: 0
  }}>
    <div>H<span style={{ color: '#fff', marginLeft: '4px' }}>{stats.hp ?? stats.h}</span></div>
    <div>A<span style={{ color: '#fff', marginLeft: '4px' }}>{stats.atk ?? stats.a}</span></div>
    <div>B<span style={{ color: '#fff', marginLeft: '4px' }}>{stats.def ?? stats.b}</span></div>
    <div>C<span style={{ color: '#fff', marginLeft: '4px' }}>{stats.spAtk ?? stats.c ?? stats.spa}</span></div>
    <div>D<span style={{ color: '#fff', marginLeft: '4px' }}>{stats.spDef ?? stats.d}</span></div>
    <div>S<span style={{ color: '#fff', marginLeft: '4px' }}>{stats.spd ?? stats.s ?? stats.spe}</span></div>
  </div>
)}
      </button>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      boxSizing: 'border-box'
    }}>
      {/* ヘッダー */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        backgroundColor: '#1e1e1e'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
          {type === 'pokemon' ? 'ポケモンを選択' : `技を選択 (${pokemonName || ''})`}
        </h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
          ✕
        </button>
      </div>

      {/* 検索バー */}
      <div style={{ padding: '12px 16px', backgroundColor: '#181818' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder={type === 'pokemon' ? 'ポケモン名で検索...' : '技名で検索...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={(e) => e.target.select()}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #444',
            backgroundColor: '#2a2a2a',
            color: '#fff',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* リスト表示領域 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 16px 0' }}>

        {/* 履歴表示エリア */}
        {searchTerm === '' && history.length > 0 && (
          <div style={{
            margin: '16px',
            padding: '12px',
            backgroundColor: '#222',
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <div style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: 'bold' }}>🕒 履歴</span>
              <button
                onClick={handleClearHistory}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                履歴を全削除
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {history.map((itemName) => (
                <div
                  key={itemName}
                  onClick={() => handleItemSelect(itemName)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px 6px 12px',
                    borderRadius: '16px',
                    border: '1px solid #555',
                    backgroundColor: '#333',
                    color: '#fff',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  <span>{itemName}</span>
                  <span
                    onClick={(e) => handleRemoveHistoryItem(e, itemName)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justify: 'center',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#aaa',
                      fontSize: '0.75rem',
                      lineHeight: 1,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff5252';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.color = '#aaa';
                    }}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* ① よく使われる技 (popular) */}
        {popularList.length > 0 && (
          <div>
            <div style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#ffd54f', fontWeight: 'bold', backgroundColor: '#1a1a1a' }}>
              ★ {pokemonName} のよく使われる技 ({popularList.length})
            </div>
            <div>
              {popularList.map(item => renderListItem(item, 'gold'))}
            </div>
          </div>
        )}

        {/* ② ポケモン一覧 または 覚える技 */}
        {learnableList.length > 0 && (
          <div>
            <div style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#81d4fa', fontWeight: 'bold', backgroundColor: '#1a1a1a' }}>
              {type === 'pokemon'
                ? `ポケモン一覧 (${learnableList.length})` 
                : (popularList.length > 0 ? `覚えるその他の技 (${learnableList.length})` : `${pokemonName} の覚える攻撃技 (${learnableList.length})`)}
            </div>
            <div>
              {learnableList.map(item => renderListItem(item, popularList.length > 0 ? 'silver' : 'normal'))}
            </div>
          </div>
        )}

        {/* ③ それ以外のすべての技（覚えない技） */}
        {nonLearnableList.length > 0 && (
          <div style={{ opacity: 0.6 }}>
            <div style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#666', fontWeight: 'bold', backgroundColor: '#1a1a1a' }}>
              すべての技 ({nonLearnableList.length})
            </div>
            <div>
              {nonLearnableList.map(item => renderListItem(item, 'normal'))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}