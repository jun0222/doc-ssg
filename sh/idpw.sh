#!/bin/bash

output_file="./input/idpw.md"
mkdir -p "$(dirname "$output_file")"
temp_file=$(mktemp)

DATE=$(date "+%Y-%m-%d")
TIME=$(date "+%H:%M")

# タイトル入力
read -p "何のアカウントですか？: " title

# 一時ファイルに整形して書き出し
{
  echo "## $title ($DATE $TIME)"
  echo ""
  echo "- ID: "
  echo "- Password: "
  echo ""
  echo "---"
  echo ""
} > "$temp_file"

# 既存メモの先頭に追記
if [ -f "$output_file" ]; then
  cat "$output_file" >> "$temp_file"
fi

mv "$temp_file" "$output_file"

echo "✅ メモが \"$output_file\" に保存されました（先頭に追加）"
