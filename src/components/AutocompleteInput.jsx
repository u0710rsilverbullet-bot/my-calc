import React, { useState, useEffect, useRef } from "react";
import moveUsageData from "../data/moveUsage.json"; // 覚える技データをインポート

export default function AutocompleteInput({
  label,
  value,
  onChange,
  options = [],          // moves.json の全技リスト（フォールバック用）
  pokemonName = "",      // 現在選択中の攻撃ポケモン名
  placeholder = "選択または入力...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  // 外側クリックでドロップダウンを閉じる処理
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ポケモンに応じた技リストの分類取得
  const getCategorizedMoves = () => {
    const usage = moveUsageData[pokemonName];

    // moveUsage.json に登録がある場合
    if (usage) {
      const popular = usage.popular || [];
      const other = usage.other || [];

      // 検索フィルター適用
      const filteredPopular = popular.filter((m) =>
        m.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const filteredOther = other.filter((m) =>
        m.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        popularMoves: filteredPopular,
        otherMoves: filteredOther,
        isCustom: true,
      };
    }

    // 登録がない場合は従来の全技リストを表示
    const filteredAll = options.filter((m) =>
      (typeof m === "string" ? m : m.name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    return {
      popularMoves: [],
      otherMoves: filteredAll,
      isCustom: false,
    };
  };

  const { popularMoves, otherMoves, isCustom } = getCategorizedMoves();

  const handleSelect = (moveName) => {
    const cleanName = typeof moveName === "string" ? moveName : moveName.name;
    onChange(cleanName);
    setSearchTerm(cleanName);
    setIsOpen(false);
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef} style={{ position: "relative" }}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        type="text"
        className="w-full p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        placeholder={placeholder}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && (
        <ul
          className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1 text-sm"
          style={{ listStyle: "none", padding: 0, margin: "4px 0 0 0" }}
        >
          {/* 使用率上位の技 */}
          {popularMoves.length > 0 && (
            <>
              <li className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 border-b border-t border-blue-100">
                🔥 よく使われる技
              </li>
              {popularMoves.map((move, idx) => (
                <li
                  key={`popular-${idx}`}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer font-medium"
                  onClick={() => handleSelect(move)}
                >
                  {typeof move === "string" ? move : move.name}
                </li>
              ))}
            </>
          )}

          {/* その他の覚える技（または全技） */}
          {otherMoves.length > 0 && (
            <>
              {isCustom && (
                <li className="px-3 py-1 text-xs font-bold text-gray-500 bg-gray-50 border-b border-t border-gray-100">
                  💡 その他の覚える技
                </li>
              )}
              {otherMoves.map((move, idx) => (
                <li
                  key={`other-${idx}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                  onClick={() => handleSelect(move)}
                >
                  {typeof move === "string" ? move : move.name}
                </li>
              ))}
            </>
          )}

          {popularMoves.length === 0 && otherMoves.length === 0 && (
            <li className="px-3 py-2 text-gray-400 italic">該当する技が見つかりません</li>
          )}
        </ul>
      )}
    </div>
  );
}