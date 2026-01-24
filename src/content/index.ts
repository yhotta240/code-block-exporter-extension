import { getSettings, Settings } from "../utils/settings";
import "./styles.css";
import { injectQuickPanel } from "./quick-panel";

let currentSettings: Settings | null = null;

/**
 * ページ内のコードブロックを探してボタンを注入する
 */
async function init(): Promise<void> {
  // 設定を読み込む
  currentSettings = await getSettings();

  // 初回スキャン
  refreshButtons();

  // 動的な変更を監視 (GitHubなどSPA的なサイト対応)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          const blocks = node.querySelectorAll("pre code");
          blocks.forEach((block) => {
            if (block instanceof HTMLElement && currentSettings) {
              injectQuickPanel(block, currentSettings);
            }
          });

          if (node.tagName.toLowerCase() === "code" && node.parentElement?.tagName.toLowerCase() === "pre") {
            if (currentSettings) injectQuickPanel(node, currentSettings);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 設定変更の監視
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "SETTINGS_UPDATED") {
      currentSettings = message.payload;
      refreshButtons();
    }
  });
}

/**
 * 全てのコードブロックのボタンを現在の設定で更新する
 */
function refreshButtons(): void {
  if (!currentSettings) return;
  const codeBlocks = document.querySelectorAll("pre code");
  codeBlocks.forEach((block) => {
    if (block instanceof HTMLElement && currentSettings) {
      injectQuickPanel(block, currentSettings);
    }
  });
}

// 実行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
