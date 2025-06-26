# 開発ドキュメント SSG ツール

このツールは、開発ドキュメント SSG して、ブラウザでの検索、タブ 1 つで閲覧できる HTML に変換するためのツールです。

## build ~ ローカル git commit コマンド

```bash
sh ./save.sh
```

## build コマンド

```bash
node ./main.js
```

## 新規 input md 作成 コマンド

```bash
node ./newInput.js
```

## 画像の配置方法

input/1.md を参考に画像リンクをつけて、input ディレクトリに配置

## 依存ライブラリのインストール

main.js を実行する前に、依存ライブラリを global にインストールしてください。

## 本ツール用のディレクトリ作成コマンド

※ git clone や zip で取得した場合は不要

```bash
mkdir -p ./input
mkdir -p ./dist
touch ./main.js
touch ./newInput.js
```

- ローカル git commit も自動化。
- メモ自体の内容も cli で勝手に整形する？
