import { getSettings, isEnabled, Settings } from "../utils/settings";
import "./styles.css";
import { injectQuickPanel, toggleTriggerVisibility, updateExtList } from "./quick-panel";

let currentSettings: Settings | null = null;
let enabled = false;
let observer: MutationObserver | null = null;

/**
 * ページ内のコードブロックを探してボタンを注入する
 */
async function init(): Promise<void> {
  currentSettings = await getSettings();
  enabled = await isEnabled();

  scanAndSetupBlocks();
  observeDynamicChanges();

  chrome.storage.onChanged.addListener(handleStorageChange);
}

/**
 * 全てのコードブロックをスキャンしてパネルをセットアップする
 */
function scanAndSetupBlocks(): void {
  if (!currentSettings) return;
  const blocks = getCodeBlocks();

  // block が code または pre タグの場合，親要素に position: relative を設定する
  blocks.forEach((b) => {
    const tagName = b.tagName.toLowerCase();
    const parentTag = b.parentElement?.tagName.toLowerCase();
    if (tagName === "code" || tagName === "pre" || parentTag === "pre") {
      ensureRelativePositioning(b.parentElement as HTMLElement)
    }
  });

  blocks.forEach((b) => setupCodeBlockPanel(b as HTMLElement));
}

/**
 * コードブロックにクイックパネルをセットアップする
 */
function setupCodeBlockPanel(block: HTMLElement): void {
  if (!currentSettings) return;
  if (block instanceof HTMLElement && !block.classList.contains("code-exporter-quick-processed")) {
    injectQuickPanel(block, currentSettings);
    toggleTriggerVisibility(enabled);
    block.classList.add("code-exporter-quick-processed");
  }
}

/**
 * クイックパネルの状態を更新する
 */
function updateQuickPanel(newEnabled: boolean, newSettings: Settings): void {
  enabled = newEnabled;
  currentSettings = newSettings;
  toggleTriggerVisibility(enabled);
  updateExtList(newSettings);
}

/**
 * 動的な変更を監視してコードブロックにパネルを注入する
 */
function observeDynamicChanges(): void {
  if (observer) return;
  observer = new MutationObserver(() => {
    scanAndSetupBlocks();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * ストレージ変更イベントのハンドラ
 */
async function handleStorageChange(
  changes: { [key: string]: chrome.storage.StorageChange }
): Promise<void> {
  if (!changes.enabled && !changes.settings) return;
  const newEnabled = changes.enabled?.newValue ?? (await isEnabled());
  const newSettings = (changes.settings?.newValue as Settings) ?? (await getSettings());
  updateQuickPanel(newEnabled, newSettings);
  scanAndSetupBlocks();
}

/**
 * ページ内のコードブロックを取得する
 */
function getCodeBlocks(): Element[] {
  // pre または code 要素を全て取得
  const all = Array.from(document.querySelectorAll("pre, code"));
  // フィルタリングして有効なコードブロックのみを返す( trueであれば有効なコードブロック )
  return all.filter((el) => {
    // pre 要素の場合，その直下の子要素 (el.children) に code 要素が含まれていたら除外する
    if (el.tagName.toLowerCase() === "pre") {
      // code 要素が含まれていたら除外する
      const child = Array.from(el.children).find((c) => c.tagName.toLowerCase() === "code");
      // span 要素が含まれていたら除外しない
      const spanChild = Array.from(el.children).find((c) => c.tagName.toLowerCase() === "span");

      return child === undefined && spanChild !== undefined;
    }

    if (el.tagName.toLowerCase() === "code") {
      const parent = el.parentElement;
      if (parent) {
        // code 要素の同階層に他の code タグが2つ以上あったら除外する
        const siblingCodes = Array.from(parent.children).filter((c) => c.tagName.toLowerCase() === "code");
        // parent が文章要素 (p, h1-h6, strong, td) の場合も除外する
        const isParagraphOrHeading = /^(P|H[1-6]|STRONG|TD)$/i.test(parent.tagName);
        // parent のtextContent が 自身のtextContent と等しい場合も除外する (コード以外のテキストが含まれていない)
        const isTextContentEqual = parent.textContent?.trim() === el.textContent?.trim();

        return siblingCodes.length <= 1 && !isParagraphOrHeading && isTextContentEqual;
      }
    }

    return false;
  });
}

/**
 * 要素に position: relative スタイルを適用する
 */
function ensureRelativePositioning(element: HTMLElement): void {
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.position === "static") {
    element.style.position = "relative";
  }
}

// 実行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
