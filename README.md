# Code Block Exporter

WEB ページ上のコードブロックを簡単にコピーやダウンロードができる Chrome 拡張機能です．
コードのコピー，Markdown ブロック形式でのコピーおよび選択した拡張子でのファイルダウンロードをできるだけ手間なく行えるようにします．

## 特徴

- コードブロックをワンクリックでコピー／ダウンロード
- 拡張子を選ぶだけでコードを簡単にダウンロード
- ChatGPT，Gemini，Note，Qiita，Zenn などの定番サイトに対応
- Markdown ブロック形式でそのままコピー可能
- 周辺情報からコードブロック内の言語を自動で提案

## インストール

### Chrome Web Store からインストール

[Code Block Exporter - Chrome ウェブストア](https://chromewebstore.google.com/detail/ilciggfacnmflkangceajohffplefncc?utm_source=item-share-cb)

### 手動インストール

必要条件

- [Node.js](https://nodejs.org/) (v18.x 以上を推奨)
- [npm](https://www.npmjs.com/) または [yarn](https://yarnpkg.com/)

手順

1. このリポジトリをクローン

   ```bash
   git clone https://github.com/yhotta240/code-block-exporter-extension
   cd code-block-exporter-extension
   ```

2. 依存関係をインストール

   ```bash
   npm install
   ```

3. ビルド

   ```bash
   npm run build
   ```

4. Chrome に読み込む
   - Chrome で `chrome://extensions/` を開く
   - 「デベロッパーモード」をオンにする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `dist/` ディレクトリを選択

## ライセンス

MIT License

## 作者

- yhotta240 (https://github.com/yhotta240)
