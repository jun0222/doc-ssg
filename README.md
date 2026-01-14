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

## 画像の配置方法

docs/1.md を参考に画像リンクをつけて、input ディレクトリに配置

## 依存ライブラリのインストール

./node/main.js を実行する前に、依存ライブラリを global にインストールしてください。

## 本ツールのアップデート

このツールに更新があった場合、既存ユーザーは `./node/main.js` を置き換えてください

```bash
# 例: 新しいリポジトリを clone した後
cp -r /path/to/old/docs/* ./docs/
node ./node/main.js
```

※ `docs/` 以外のファイル（node/, index.html など）は新しいリポジトリのものを使用してください。

## 素早くメモを編集するためのエイリアス設定

zshrc にエイリアスを追加すると、どこからでも素早くドキュメントを編集できます：

```bash
# ~/.zshrc に以下を追加
echo 'alias devmemo="vi /path/to/doc-ssg/docs/memo.md"' >> ~/.zshrc
echo 'alias devpwd="vi /path/to/doc-ssg/docs/id-password.md"' >> ~/.zshrc
echo 'alias devmtg="vi /path/to/doc-ssg/docs/mtg.md"' >> ~/.zshrc

# 変更を反映
source ~/.zshrc
```

※ `/path/to/doc-ssg/` は実際のパスに置き換えてください（`pwd` で確認可能）

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
