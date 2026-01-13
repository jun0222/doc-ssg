# 開発ドキュメント SSG ツール

このツールは、開発ドキュメント SSG して、ブラウザでの検索、タブ 1 つで閲覧できる HTML に変換するためのツールです。

## 取得後

サンプルのファイル(.docs/1.md, .docs/2.md, .docs/202408100238.md, .docs/202506270508.md)など、不要ファイルは削除してください。

## build ~ ローカル git commit コマンド

```bash
sh _save.sh
```

## build コマンド

```bash
node ./node/main.js
```

## id, パスワードの新セクション追加

```bash
sh _id-password.sh
```

## 会議メモの新セクション追加

```bash
sh _mtg.sh
```

## 作業メモの新セクション追加

```bash
sh _memo.sh
```

## 画像の配置方法

docs/1.md を参考に画像リンクをつけて、input ディレクトリに配置

## 依存ライブラリのインストール

./node/main.js を実行する前に、依存ライブラリを global にインストールしてください。

## 本ツールのアップデート

このツールに更新があった場合、既存ユーザーは以下の手順で移行できます：

1. 新しいリポジトリを取得（clone または zip）
2. 古い環境の `docs/` ディレクトリを新しい環境の `docs/` にコピー
3. `node ./node/main.js` でビルド

```bash
# 例: 新しいリポジトリを clone した後
cp -r /path/to/old/docs/* ./docs/
node ./node/main.js
```

※ `docs/` 以外のファイル（node/, index.html など）は新しいリポジトリのものを使用してください。

<details>
<summary>あまり使わないかも</summary>

## 新規 timestamp input md 作成 コマンド(あまり使わないかも)

```bash
node ./node/newInput.js
```

## 本ツール用のディレクトリ作成コマンド

※ git clone や zip で取得した場合は不要

```bash
mkdir -p ./input
touch ./node/main.js
touch ./node/newInput.js
```

</details>
