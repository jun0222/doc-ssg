#!/bin/bash


node ./main.js
echo "=== inputのmdファイルからHTMLファイルを生成しました。 ==="
git add .
echo "=== 変更をローカルgitにステージングしました。 ==="
git commit -m "autocommit"
echo "=== 変更をローカルgitにコミットしました。 ==="