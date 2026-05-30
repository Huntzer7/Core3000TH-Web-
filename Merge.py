import json
import glob

merged = []

for file in sorted(glob.glob("vocabulary/**/*.json", recursive=True)):
    print("Reading:", file)

    with open(file, "r", encoding="utf-8") as f:
        data = json.load(f)

        if isinstance(data, list):
            merged.extend(data)
        else:
            print(f"Skipped {file} (not a JSON array)")

with open("words.json", "w", encoding="utf-8") as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

print(f"\nDone! Total words: {len(merged)}")
