#!/bin/bash


git add .
echo "=== HTMLビルド前、念の為変更をローカルgitにステージングしました。 ==="
git commit -m "execute save.sh"
echo "=== HTMLビルド前、念の為変更をローカルgitにコミットしました。 ==="
node ./main.js
echo "=== inputのmdファイルからHTMLファイルを生成しました。 ==="
git add .
echo "=== 変更をローカルgitにステージングしました。 ==="
git commit -m "execute save.sh"
echo "=== 変更をローカルgitにコミットしました。 ==="