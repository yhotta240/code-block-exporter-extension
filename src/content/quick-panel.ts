import { detectLanguage } from "../utils/language-detector";
import { getExtension } from "../utils/extension-mapper";
import { extractCode } from "./code-extractor";
import { Settings } from "../utils/settings";
import { generateBaseFileName } from "utils/filename-generator";

export function buildTrigger(): HTMLDivElement {
  const trigger = document.createElement("div");
  trigger.className = "code-exporter-quick-trigger code-exporter-quick-trigger-injected";
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("class", "code-exporter-quick-icon");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z");
  icon.appendChild(path);
  trigger.appendChild(icon);
  return trigger;
}

export function buildToolHeader(codeElement: HTMLElement): HTMLDivElement {
  const contentHeader = document.createElement("div");
  contentHeader.className = "code-exporter-quick-tool-header";
  const manifest = chrome.runtime.getManifest();
  contentHeader.textContent = manifest.short_name || manifest.name;

  const utils = document.createElement("div");
  utils.className = "code-exporter-quick-util";

  // markdown コピーボタン
  const copyMarkdownButton = document.createElement("button");
  copyMarkdownButton.className = "code-exporter-copy-markdown-btn";
  copyMarkdownButton.title = "Markdown形式でコピー";
  copyMarkdownButton.setAttribute("aria-label", "Markdownでコピー");
  copyMarkdownButton.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 5v14h18V5H3zm16 12H5V7h14v10zM8.5 9.5L7 11l1.5 1.5L10 11 8.5 9.5zM15.5 9.5 14 11l1.5 1.5L18 11l-2.5-1.5z"/>
    </svg>`;
  const copyMarkdownHandler = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const code = extractCode(codeElement);
    const language = detectLanguage(codeElement);
    const ext = getExtension(language).slice(1);
    const markdown = `\`\`\`${ext}\n${code}\n\`\`\``;
    navigator.clipboard.writeText(markdown).then(() => {
      showTemporarySuccess(copyMarkdownButton);
    });
  };

  // 通常コピーコピーボタン
  const copyButton = document.createElement("button");
  copyButton.className = "code-exporter-copy-btn";
  copyButton.title = "クリップボードにコピー";
  copyButton.setAttribute("aria-label", "コピー");
  copyButton.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>`;
  const copyHandler = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const code = extractCode(codeElement);
    navigator.clipboard.writeText(code).then(() => {
      showTemporarySuccess(copyButton);
    });
  };

  function showTemporarySuccess(btn: HTMLButtonElement) {
    const orig = btn.innerHTML;
    btn.classList.add("code-exporter-copy-success");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
      </svg>`;
    setTimeout(() => {
      btn.classList.remove("code-exporter-copy-success");
      btn.innerHTML = orig;
    }, 1500);
  }

  copyMarkdownButton.addEventListener("click", copyMarkdownHandler);
  copyButton.addEventListener("click", copyHandler);

  utils.appendChild(copyMarkdownButton);
  utils.appendChild(copyButton);
  contentHeader.appendChild(utils);
  return contentHeader;
}

export function buildFilenameControls(defaultBaseName: string) {
  const inputContainer = document.createElement("div");
  inputContainer.className = "code-exporter-filename-container";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "code-exporter-filename-input";
  input.value = defaultBaseName;
  input.placeholder = "ファイル名を入力...";
  input.addEventListener("click", (e) => e.stopPropagation());
  input.addEventListener("keydown", (e) => e.stopPropagation());

  const clearButton = document.createElement("button");
  clearButton.className = "code-exporter-clear-filename-btn";
  clearButton.title = "クリア";
  clearButton.innerHTML = "&times;";
  clearButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    input.value = "";
    input.focus();
  });

  inputContainer.appendChild(input);
  inputContainer.appendChild(clearButton);
  return { inputContainer, input, clearButton };
}

export function buildExtList(settings: Settings, executeDownload: (ext: string) => void, autoExt: string) {
  const extList = document.createElement("div");
  extList.className = "code-exporter-ext-list";

  const staticControls = document.createElement("div");
  staticControls.className = "code-exporter-static-controls";

  const customExtInput = document.createElement("input");
  customExtInput.type = "text";
  customExtInput.className = "code-exporter-custom-ext-input";
  customExtInput.placeholder = ".ext";
  customExtInput.addEventListener("click", (e) => e.stopPropagation());
  customExtInput.addEventListener("keydown", (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter" && customExtInput.value.trim()) executeDownload(customExtInput.value.trim());
  });
  staticControls.appendChild(customExtInput);

  // 自動判別ボタン
  if (autoExt && autoExt !== ".txt") {
    const autoBtn = document.createElement("button");
    autoBtn.textContent = autoExt;
    autoBtn.className = "code-exporter-auto-ext-btn";
    autoBtn.title = `自動判別: ${autoExt}`;
    autoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      executeDownload(autoExt);
    });
    staticControls.appendChild(autoBtn);
  }

  const extDivider = document.createElement("div");
  extDivider.className = "code-exporter-divider";
  staticControls.appendChild(extDivider);
  extList.appendChild(staticControls);

  const extGrid = document.createElement("div");
  extGrid.className = "code-exporter-ext-grid";
  if (settings.quickExtensions.length > 5) extGrid.classList.add("collapsed");

  settings.quickExtensions.forEach((ext) => {
    const btn = document.createElement("button");
    btn.textContent = ext;
    btn.className = "code-exporter-ext-btn";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      executeDownload(ext);
    });
    extGrid.appendChild(btn);
  });
  extList.appendChild(extGrid);

  if (settings.quickExtensions.length > 5) {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "code-exporter-ext-toggle-btn";
    toggleBtn.title = "もっと表示 / 折りたたむ";
    const toggleIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    toggleIcon.setAttribute("viewBox", "0 0 24 24");
    toggleIcon.setAttribute("class", "code-exporter-toggle-icon");
    const togglePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    togglePath.setAttribute("d", "M7 10l5 5 5-5z");
    toggleIcon.appendChild(togglePath);
    toggleBtn.appendChild(toggleIcon);
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      extGrid.classList.toggle("collapsed");
    });
    extList.appendChild(toggleBtn);
  }

  return extList;
}

export function attachPanelBehavior(trigger: HTMLDivElement, panel: HTMLDivElement) {
  const positionPanel = () => {
    const rect = trigger.getBoundingClientRect();
    panel.style.position = "fixed";
    panel.style.top = `${rect.top}px`;
    panel.style.left = "auto";
    panel.style.right = `${window.innerWidth - rect.right - rect.width}px`;
  };

  let hideTimeout: any;
  trigger.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
    positionPanel();
    // @ts-ignore
    panel.showPopover();
  });

  trigger.addEventListener("mouseleave", (e: MouseEvent) => {
    hideTimeout = setTimeout(() => {
      // @ts-ignore
      panel.hidePopover();
    }, 100);
  });

  panel.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
  panel.addEventListener("mouseleave", () => { /* @ts-ignore */ (panel as any).hidePopover(); });
}

/**
 * クイックダウンロードパネルを注入する
 */
export function injectQuickPanel(codeElement: HTMLElement, settings: Settings): void {
  const trigger = buildTrigger();
  // ポップオーバーパネル（トップレイヤーに表示される）
  const panel = document.createElement("div");
  panel.className = "code-exporter-quick-panel code-exporter-injected";
  // @ts-ignore
  panel.popover = "manual";

  const content = document.createElement("div");
  content.className = "code-exporter-quick-content";

  // ヘッダ（コピー等）
  const header = buildToolHeader(codeElement);
  content.appendChild(header);

  // ファイル名入力
  const defaultBaseName = generateBaseFileName(document.title);
  const { inputContainer, input } = buildFilenameControls(defaultBaseName);
  content.appendChild(inputContainer);

  // 拡張子リスト（executeDownload をここで定義して渡す）
  const executeDownload = (ext: string) => {
    let baseName = (input as HTMLInputElement).value.trim() || defaultBaseName;
    const formattedExt = ext.startsWith(".") ? ext : `.${ext}`;
    if (baseName.endsWith(formattedExt)) baseName = baseName.slice(0, -formattedExt.length);
    const fileName = `${baseName}${formattedExt}`;
    const code = extractCode(codeElement);
    handleDownload(code, fileName);
    // @ts-ignore
    panel.hidePopover();
  };

  // 自動判別拡張子の取得
  const lang = detectLanguage(codeElement);
  const autoExt = getExtension(lang);

  const extList = buildExtList(settings, executeDownload, autoExt);
  content.appendChild(extList);

  panel.appendChild(content);
  // トップレイヤーに追加
  document.body.appendChild(panel);

  // 表示・挙動をアタッチ
  setupPlacement(codeElement, trigger);
  attachPanelBehavior(trigger, panel);
}

/**
 * 要素の配置設定
 */
function setupPlacement(codeElement: HTMLElement, element: HTMLElement): void {
  const parent = codeElement.parentElement;

  if (parent && parent.tagName.toLowerCase() === "pre") {
    const grandParent = parent.parentElement;
    const hasContentSiblings = grandParent && Array.from(grandParent.children).some((child) => child !== parent && /^(P|H[1-6])$/i.test(child.tagName));

    if (grandParent && !hasContentSiblings) {
      grandParent.classList.add("code-exporter-wrapper");
      grandParent.appendChild(element);
    } else {
      parent.classList.add("code-exporter-wrapper");
      parent.appendChild(element);
    }
  } else {
    codeElement.classList.add("code-exporter-wrapper");
    codeElement.insertAdjacentElement("beforebegin", element);
  }
}

/**
 * ダウンロード処理
 */
function handleDownload(code: string, fileName: string): void {
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}