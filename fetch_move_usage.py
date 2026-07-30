import json
import time
import requests
from bs4 import BeautifulSoup

# --- 設定 ---
POKEMONS_JSON_PATH = "./src/pokemons.json"       # ポケモン一覧データのパス
OUTPUT_JSON_PATH = "./src/data/moveUsage.json"   # 出力先パス

# ゲームウィズのポケモン図鑑一覧ページ
LIST_URL = "https://gamewith.jp/pokemon-champions/article/show/546414"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def get_pokemon_page_links():
    """
    一覧ページから各ポケモンの詳細ページURLを取得する
    """
    print("🔍 GameWithの図鑑一覧ページから各ポケモンのリンクを収集しています...")
    try:
        res = requests.get(LIST_URL, headers=headers, timeout=10)
        if res.status_code != 200:
            print(f"❌ 一覧ページの取得に失敗しました (HTTP {res.status_code})")
            return {}

        soup = BeautifulSoup(res.text, "html.parser")
        pokemon_links = {}

        # ページ内のテーブルやリンクからポケモン名と詳細ページURL（article/show/XXXXX）を抽出
        for a in soup.find_all("a", href=True):
            href = a["href"]
            name = a.get_text(strip=True)
            if "/pokemon-champions/article/show/" in href and name:
                full_url = href if href.startswith("http") else f"https://gamewith.jp{href}"
                pokemon_links[name] = full_url

        print(f"✅ {len(pokemon_links)} 件のポケモンページリンクを発見しました。\n")
        return pokemon_links

    except Exception as e:
        print(f"❌ リンク収集エラー: {e}")
        return {}

def fetch_moves_from_detail_page(url):
    """
    ポケモンの詳細ページから覚える技一覧を抽出する
    """
    try:
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code != 200:
            return []

        soup = BeautifulSoup(res.text, "html.parser")
        moves = []

        # テーブル内の技リンク・技名要素を取得
        for table in soup.find_all("table"):
            for a in table.find_all("a"):
                move_name = a.get_text(strip=True)
                # 一般的なノイズを除外（タイプ名やステータス項目など）
                if move_name and len(move_name) >= 2 and move_name not in ["物理", "特殊", "変化", "詳細"] and move_name not in moves:
                    moves.append(move_name)

        return moves

    except Exception:
        return []

def main():
    # 1. 自作の pokemons.json から対象ポケモン一覧を読み込み
    try:
        with open(POKEMONS_JSON_PATH, "r", encoding="utf-8") as f:
            pokemons = json.load(f)
    except Exception as e:
        print(f"❌ {POKEMONS_JSON_PATH} の読み込みに失敗しました: {e}")
        return

    # 2. 一覧ページからポケモンごとの詳細URLマップを取得
    pokemon_links = get_pokemon_page_links()
    result_data = {}

    print(f"🚀 計 {len(pokemons)} 匹の技データ取得を開始します...\n")

    # 3. 各ポケモンの詳細ページを順番にアクセスして技を取得
    for idx, pkm in enumerate(pokemons):
        pkm_name = pkm["name"]
        print(f"[{idx + 1}/{len(pokemons)}] {pkm_name} のページを解析中...")

        moves = []
        # URLマップにポケモンが存在する場合、詳細ページから取得
        if pkm_name in pokemon_links:
            detail_url = pokemon_links[pkm_name]
            moves = fetch_moves_from_detail_page(detail_url)
            time.sleep(1.2)  # サーバー負荷軽減の待機時間
        else:
            print(f"  ⚠️ 一覧ページに `{pkm_name}` のリンクが見つかりませんでした")

        result_data[pkm_name] = {
            "popular": [],
            "other": moves
        }

        print(f"  └ 覚える技: {len(moves)} 件 取得")

    # 4. JSONファイルとして出力
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 完了！ `{OUTPUT_JSON_PATH}` に保存されました。")

if __name__ == "__main__":
    main()