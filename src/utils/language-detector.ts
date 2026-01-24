/**
 * HTML要素からプログラミング言語を判定するためのユーティリティ
 */

const COMMON_LANGS = [
  "js",
  "javascript",
  "ts",
  "typescript",
  "python",
  "py",
  "html",
  "css",
  "json",
  "bash",
  "sh",
  "rust",
  "go",
  "java",
  "cpp",
  "c",
  "ruby",
  "php",
  "sql",
  "yaml",
  "yml",
  "xml",
  "markdown",
  "md",
  "dockerfile",
  "yaml",
];

/**
 * 特定の要素から言語情報を抽出する（属性・クラス）
 */
function extractFromElement(el: HTMLElement): string {
  // 1. data-language, data-lang 属性を確認
  const dataLang = el.getAttribute("data-language") || el.getAttribute("data-lang");
  if (dataLang) return dataLang;

  // 2. lang 属性を確認
  const langAttr = el.getAttribute("lang");
  if (langAttr) return langAttr;

  // 3. クラス名を確認 (language-xxx, lang-xxx 形式を優先)
  const classList = Array.from(el.classList);
  for (const className of classList) {
    const match = className.match(/^(?:language|lang)-(.+)$/i);
    if (match) return match[1];
  }

  // 4. クラス名単体で言語名に一致するものがないか確認
  for (const className of classList) {
    const lowClass = className.toLowerCase();
    if (COMMON_LANGS.includes(lowClass)) return lowClass;
  }

  return "";
}

/**
 * 要素のテキスト内容から言語名を推測する
 */
function inferFromText(el: HTMLElement): string {
  const text = el.textContent?.trim().toLowerCase() || "";
  // 非常に短いテキスト（ヘッダー等の言語表記）から探す
  if (text.length > 0 && text.length < 20) {
    for (const lang of COMMON_LANGS) {
      if (text === lang || text === `language: ${lang}` || text === `lang: ${lang}`) {
        return lang;
      }
    }
  }
  return "";
}

/**
 * 文章要素（h3, p等）かどうかを判定する
 */
function isContentElement(el: Element): boolean {
  const tagName = el.tagName.toLowerCase();
  return /^(h[1-6]|p|article|section|nav|aside|li)$/.test(tagName);
}

/**
 * 同一階層に文章要素があるかチェックする
 */
function hasContentSiblings(el: HTMLElement): boolean {
  const parent = el.parentElement;
  if (!parent) return false;

  return Array.from(parent.children).some((child) => child !== el && isContentElement(child));
}

/**
 * コードブロックの要素から言語を推定する
 * @param element 対象の要素 (codeタグ等)
 * @returns 推定された言語名，不明な場合は空文字列
 */
export function detectLanguage(element: HTMLElement): string {
  // 層 1: code 要素自身
  let lang = extractFromElement(element);
  if (lang) return lang;

  // 層 2: 親要素 (pre 等)
  const parent = element.parentElement;
  if (parent) {
    lang = extractFromElement(parent);
    if (lang) return lang;

    // 層 3: 親要素の兄弟要素 (直前・直後の要素に言語名が書いてあることが多い)
    let prev = parent.previousElementSibling;
    if (prev instanceof HTMLElement) {
      lang = extractFromElement(prev) || inferFromText(prev);
      if (lang) return lang;
    }
    let next = parent.nextElementSibling;
    if (next instanceof HTMLElement) {
      lang = extractFromElement(next) || inferFromText(next);
      if (lang) return lang;
    }

    // 層 4: さらに1つ上の親要素 (ラッパー div 等)
    const grandParent = parent.parentElement;
    if (grandParent) {
      lang = extractFromElement(grandParent);
      if (lang) return lang;

      // ラッパー内の特定の属性を持つ要素を探す (GitHub等の対応)
      const langLabel = grandParent.querySelector("[data-language], .code-lang");
      if (langLabel instanceof HTMLElement) {
        lang = extractFromElement(langLabel) || inferFromText(langLabel);
        if (lang) return lang;
      }

      // 層 5: さらにもう一個上の階層 (曾祖父)
      // ただし同じ階層に h3 や p タグ等がある場合は「文書構造の境界」とみなし探索停止
      if (!hasContentSiblings(grandParent)) {
        const greatGrandParent = grandParent.parentElement;
        if (greatGrandParent) {
          lang = extractFromElement(greatGrandParent);
          if (lang) return lang;
        }
      }
    }
  }

  return "";
}
