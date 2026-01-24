# Code Block Exporter

Web ページ上のコードブロックを，サクッとコピー・ダウンロードできる Chrome 拡張機能です．
コードを保存したり，使い回したりする作業を，できるだけ手間なく行えるようにします．

## 特徴

- コードブロックをワンクリックでコピー／ダウンロード
- GitHub，Stack Overflow，Qiita，Zenn などの定番技術サイトに対応
- 拡張子を選んでエクスポート可能
- コードブロックの情報をもとに拡張子を自動判定

## インストール

### Chrome Web Store からインストール

準備中…

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
