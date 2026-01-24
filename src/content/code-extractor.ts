/**
 * コードブロックからテキストを抽出するユーティリティ
 */

/**
 * 指定された要素からコードのテキスト内容を取得する
 * @param element 対象の要素 (codeタグ等)
 * @returns 抽出されたテキスト
 */
export function extractCode(element: HTMLElement): string {
  // 基本的には textContent を使用するが，
  // 注入したボタンのテキストなどが含まれないように注意が必要な場合がある

  // クローンを作成して，不要な要素（後で追加されるボタン等）を削除してから抽出する方法
  const clone = element.cloneNode(true) as HTMLElement;

  // 自身の拡張機能が追加した要素を除去 (クラス名等で判定)
  const injectedElements = clone.querySelectorAll(".code-exporter-injected");
  injectedElements.forEach(el => el.remove());

  return clone.textContent || "";
}
