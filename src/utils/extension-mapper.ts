/**
 * 言語名から拡張子へのマッピングを定義する
 */
export const LANGUAGE_EXTENSION_MAP: Record<string, string> = {
  text: ".txt",
  plain: ".txt",
  javascript: ".js",
  js: ".js",
  typescript: ".ts",
  ts: ".ts",
  python: ".py",
  py: ".py",
  html: ".html",
  css: ".css",
  json: ".json",
  bash: ".sh",
  sh: ".sh",
  shell: ".sh",
  rust: ".rs",
  go: ".go",
  java: ".java",
  cpp: ".cpp",
  c: ".c",
  ruby: ".rb",
  php: ".php",
  markdown: ".md",
  md: ".md",
  yaml: ".yml",
  yml: ".yml",
  sql: ".sql",
  xml: ".xml",
};

/**
 * 言語名に対応する拡張子を取得する．見つからない場合は".txt"を返す．
 * @param language 言語名
 * @returns 拡張子（ドット付き）
 */
export function getExtension(language: string): string {
  const lowerLang = language.toLowerCase();

  // マップにあればそれを返す
  if (LANGUAGE_EXTENSION_MAP[lowerLang]) {
    return LANGUAGE_EXTENSION_MAP[lowerLang];
  }

  // マップにないが，ユーザーが直接拡張子（例: py）を入力した場合，
  // ドットを付けて返す
  if (language.length > 0) {
    return `.${language}`;
  }

  return ".txt";
}
