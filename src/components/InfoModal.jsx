import React from 'react';

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* 背景クリックで閉じる */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* モーダルコンテンツ */}
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl relative z-10 space-y-4 text-gray-700">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          アプリ情報
        </h2>

        {/* 1. アプリ名・バージョン */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            App Name / Version
          </h3>
          <p className="text-base font-bold text-gray-800 mt-0.5">
            ポケモンダメージ計算ツール <span className="text-sm font-normal text-blue-600 ml-1">v1.0.0</span>
          </p>
        </div>

        {/* 2. 作成者名・SNSリンク */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Created By
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm font-medium">
            <span>あなたの名前</span>
            <span className="text-gray-300">|</span>
            <a
              href="https://x.com/your_account"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center gap-1"
            >
              @your_account
            </a>
          </div>
        </div>

        {/* 3. 権利表記・免責事項 */}
        <div className="pt-2 border-t text-xs text-gray-500 space-y-1 leading-relaxed">
          <p className="font-semibold text-gray-600">【免責事項・権利表記】</p>
          <p>
            当ウェブサイトは個人が運営する非公式のファンツールであり、任天堂株式会社・株式会社クリーチャーズ・株式会社ゲームフリーク・株式会社ポケモンとは一切関係ありません。
          </p>
          <p>
            ポケットモンスター・ポケモン・Pokémonは任天堂・クリーチャーズ・ゲームフリークの登録商標です。
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition mt-2"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}