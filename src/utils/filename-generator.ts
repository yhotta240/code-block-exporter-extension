/**
 * ダウンロード時のファイル名を生成するユーティリティ
 */

/**
 * デフォルトのファイル名を生成する
 * @param pageTitle ページのタイトル (省略可)
 * @returns ファイル名のベース部分 (拡張子なし)
 */
export function generateBaseFileName(pageTitle?: string): string {
  // 1. 日時スタンプを生成 (YYYYMMDD_HHMMSS)
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "_",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");

  // 2. ページタイトルがある場合はサニタイズして利用
  if (pageTitle) {
    const sanitizedTitle = pageTitle
      .trim()
      .replace(/[\/\\?%*:|"<>]/g, "_") // OSで禁止されている文字を置換
      .replace(/\s+/g, "_") // スペースをアンダースコアに
      .substring(0, 50); // 長すぎる場合はカット

    if (sanitizedTitle) {
      return `${sanitizedTitle}_${timestamp}`;
    }
  }

  // 3. デフォルト名
  return `code_${timestamp}`;
}
