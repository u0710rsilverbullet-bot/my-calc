import json
import os

# パス設定
CSV_PATH = "覚える技.csv"                  # CSVファイルのパス
POKEMONS_JSON_PATH = "./src/pokemons.json" # 全ポケモン一覧のパス
OUTPUT_JSON_PATH = "./src/data/moveUsage.json"

def convert_csv_to_json():
    if not os.path.exists(CSV_PATH):
        print(f"❌ エラー: `{CSV_PATH}` が見つかりません。")
        return

    # pokemons.json から全ポケモン名のリスト（セット）を作成
    pokemon_names = set()
    if os.path.exists(POKEMONS_JSON_PATH):
        with open(POKEMONS_JSON_PATH, "r", encoding="utf-8") as f:
            pokemons_data = json.load(f)
            # pokemons.json の各要素から name を取得
            for p in pokemons_data:
                if isinstance(p, dict) and "name" in p:
                    pokemon_names.add(p["name"])
                elif isinstance(p, str):
                    pokemon_names.add(p)
    else:
        print(f"⚠️ `{POKEMONS_JSON_PATH}` が見つかりません。")

    result_data = {}
    current_pokemon = None

    with open(CSV_PATH, encoding="utf-8") as f:
        for line in f:
            line_clean = line.strip().replace("\ufeff", "")
            if not line_clean:
                continue

            # 読み込んだ行が「ポケモン名」に登録されている場合
            if line_clean in pokemon_names:
                current_pokemon = line_clean
                if current_pokemon not in result_data:
                    result_data[current_pokemon] = {"popular": [], "other": []}
            # ポケモン名ではなく、現在選択中のポケモンがいる場合は「技名」として追加
            elif current_pokemon:
                # 重複防止のため、まだ追加されていない技のみ登録
                if line_clean not in result_data[current_pokemon]["other"]:
                    result_data[current_pokemon]["other"].append(line_clean)

    # 出力フォルダが存在しない場合は作成
    os.makedirs(os.path.dirname(OUTPUT_JSON_PATH), exist_ok=True)

    # JSONファイルへ保存
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)

    print(f"✅ 成功！ `{OUTPUT_JSON_PATH}` を正常に生成・更新しました。")
    print(f"📊 変換されたポケモン数: {len(result_data)} 匹")

if __name__ == "__main__":
    convert_csv_to_json()