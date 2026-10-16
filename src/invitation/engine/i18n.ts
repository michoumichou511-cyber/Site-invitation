import type { Lang } from "./config";

export type Dict = Record<string, string>;
export type Dicts = Record<Lang, Dict>;
type Vars = Record<string, string | number>;

/**
 * Mini-formateur ICU ({nom} et {n, plural, one {…} other {…}}) pour garder
 * le JavaScript des invitations léger. Les textes viennent de messages/*.json.
 */
export function format(template: string, vars: Vars = {}, lang: Lang = "fr"): string {
  let out = "";
  let i = 0;
  while (i < template.length) {
    const open = template.indexOf("{", i);
    if (open === -1) return out + template.slice(i);
    out += template.slice(i, open);
    const close = matchingBrace(template, open);
    out += formatArg(template.slice(open + 1, close), vars, lang);
    i = close + 1;
  }
  return out;
}

function matchingBrace(s: string, open: number) {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}" && --depth === 0) return i;
  }
  return s.length - 1;
}

function formatArg(arg: string, vars: Vars, lang: Lang): string {
  const [name, kind] = arg.split(",").map((p) => p.trim());
  const value = vars[name];
  if (kind !== "plural") return value === undefined ? `{${name}}` : String(value);
  const n = Number(value);
  const body = arg.slice(arg.indexOf("plural") + "plural".length + 1);
  const options = new Map<string, string>();
  const re = /(=\d+|zero|one|two|few|many|other)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const start = m.index + m[0].length - 1;
    const end = matchingBrace(body, start);
    options.set(m[1], body.slice(start + 1, end));
    re.lastIndex = end + 1;
  }
  const chosen =
    options.get(`=${n}`) ??
    options.get(new Intl.PluralRules(lang).select(n)) ??
    options.get("other") ??
    "";
  return format(chosen.replace(/#/g, String(n)), vars, lang);
}

export function translator(dicts: Dicts, lang: Lang) {
  return (key: string, vars?: Vars) => format(dicts[lang][key] ?? key, vars, lang);
}

export type T = ReturnType<typeof translator>;
