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
  const [history, setHistory] = useState([]); // 🌟 履歴保持用ステート
  const inputRef = useRef(null);

  // 🌟 モーダルが開くたびに検索文字のリセット・フォーカス・履歴取得を行う
  useEffect(() => {
    if (isOpen) {
      setSearchTerm(''); // 検索文字列の初期化

      // 履歴データの取得
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

  // 🌟 アイテム（ポケモンまたは技）を選択したときの処理（履歴への追加含む）
  const handleItemSelect = (item) => {
    const itemName = typeof item === 'string' ? item : item?.name;
    if (!itemName) return;

    // 重複を除外して先頭に追加（最大6件保持）
    const newHistory = [itemName, ...history.filter((h) => h !== itemName)].slice(0, 6);
    setHistory(newHistory);

    const storageKey = type === 'pokemon' ? 'pokemon_search_history' : 'move_search_history';
    localStorage.setItem(storageKey, JSON.stringify(newHistory));

    onSelect(itemName);
    onClose();
  };

  // 🌟 履歴削除機能
  const handleClearHistory = (e) => {
    e.stopPropagation();
    const storageKey = type === 'pokemon' ? 'pokemon_search_history' : 'move_search_history';
    localStorage.removeItem(storageKey);
    setHistory([]);
  };

  // 🌟 履歴の個別削除機能（★追加）
  const handleRemoveHistoryItem = (e, itemToRemove) => {
    e.stopPropagation(); // 選択処理の発火を防止
    const newHistory = history.filter((h) => h !== itemToRemove);
    setHistory(newHistory);

    const storageKey = type === 'pokemon' ? 'pokemon_search_history' : 'move_search_history';
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  };

  // 1. そのポケモンが覚える技（popular + other）を取得
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

  // 2. 表示するリストの整理
  const { popularList, learnableList, nonLearnableList } = useMemo(() => {
    const safeList = Array.isArray(itemList) ? itemList : [];
    const term = searchTerm.trim();

    // 検索バーに入力がある場合は全体からフィルタリング
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

    // 技の選択時で、ポケモンデータが存在する場合
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

  // ボタン描画用のコンポーネント
  const renderItemButton = (item, highlightLevel = 'normal') => {
    const itemName = typeof item === 'string' ? item : item?.name;
    const itemType = item?.type;

    let border = '1px solid #333';
    let bg = '#252525';
    let textColor = '#fff';

    if (highlightLevel === 'gold') {
      border = '1px solid #ffd54f';
      bg = '#2b2613';
      textColor = '#ffd54f';
    } else if (highlightLevel === 'silver') {
      border = '1px solid #4a6fa5';
      bg = '#1a2332';
      textColor = '#81d4fa';
    }

    return (
      <button
        key={itemName}
        onClick={() => handleItemSelect(item)} // 🌟 履歴保存を通る関数に変更
        style={{
          padding: '10px',
          borderRadius: '6px',
          border,
          backgroundColor: bg,
          color: textColor,
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{itemName}</span>
        {itemType && (
          <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{itemType}</span>
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* 🌟 履歴表示エリア（検索欄が空で履歴がある場合のみ表示） */}
        {searchTerm === '' && history.length > 0 && (
          <div style={{
            marginBottom: '20px',
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
                  {/* 個別削除「✕」ボタン */}
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
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: '#ffd54f', marginBottom: '8px', fontWeight: 'bold' }}>
              ★ {pokemonName} のよく使われる技 ({popularList.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
              {popularList.map(item => renderItemButton(item, 'gold'))}
            </div>
          </div>
        )}

        {/* ② 覚える技 (other / learnable) */}
        {learnableList.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: '#81d4fa', marginBottom: '8px', fontWeight: 'bold' }}>
              {type === 'pokemon'
                ? `ポケモン一覧 (${learnableList.length})` 
                : (popularList.length > 0 ? `覚えるその他の技 (${learnableList.length})` : `${pokemonName} の覚える攻撃技 (${learnableList.length})`)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
              {learnableList.map(item => renderItemButton(item, popularList.length > 0 ? 'silver' : 'normal'))}
            </div>
          </div>
        )}

        {/* ③ それ以外のすべての技（覚えない技） */}
        {nonLearnableList.length > 0 && (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>
              すべての技 ({nonLearnableList.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', opacity: 0.6 }}>
              {nonLearnableList.map(item => renderItemButton(item, 'normal'))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}