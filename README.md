# 開発ドキュメント SSG ツール

このツールは、開発ドキュメント SSG して、ブラウザでの検索、タブ 1 つで閲覧できる HTML に変換するためのツールです。

## build ~ ローカル git commit コマンド

```bash
sh .sh/save.sh
```

## build コマンド

```bash
node ./main.js
```

## id, パスワードの新セクション追加

```bash
sh .sh/idpw.sh
```

## 会議メモの新セクション追加

```bash
sh .sh/mtg.sh
```

## 作業メモの新セクション追加

```bash
sh .sh/memo.sh
```

## 画像の配置方法

input/1.md を参考に画像リンクをつけて、input ディレクトリに配置

## 依存ライブラリのインストール

main.js を実行する前に、依存ライブラリを global にインストールしてください。

<details>
<summary>あまり使わないかも</summary>

## 新規 timestamp input md 作成 コマンド(あまり使わないかも)

```bash
node ./newInput.js
```

## 本ツール用のディレクトリ作成コマンド

※ git clone や zip で取得した場合は不要

```bash
mkdir -p ./input
mkdir -p ./dist
touch ./main.js
touch ./newInput.js
```

</details>
