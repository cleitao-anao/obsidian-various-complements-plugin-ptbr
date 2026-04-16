import emojiRegex from "emoji-regex";
import { uniq } from "./collection-helper";
import diacriticsMap from "./diacritics-map";

const regEmoji = new RegExp(` *(${emojiRegex().source}) *`, "g");

export function equalsAsLiterals(one: string, another: string): boolean {
  return one.replace(/[ \t]/g, "") === another.replace(/[ \t]/g, "");
}

export function allNumbersOrFewSymbols(text: string): boolean {
  return Boolean(text.match(/^[0-9_\-.]+$/));
}

export function allAlphabets(text: string): boolean {
  return Boolean(text.match(/^[a-zA-Z0-9_\-]+$/));
}

export function excludeEmoji(text: string): string {
  return text.replace(regEmoji, "");
}

export function excludeSpace(text: string): string {
  return text.replace(/ /g, "");
}

export function encodeSpace(text: string): string {
  return text.replace(/ /g, "%20");
}

export function removeFromPattern(
  pattern: RegExp,
  removeChars: string,
): RegExp {
  return new RegExp(
    pattern.source.replace(new RegExp(`[${removeChars}]`, "g"), ""),
    pattern.flags,
  );
}

export function normalizeAccentsDiacritics(text: string): string {
  // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
  return text.replace(/[^\u0000-\u007E]/g, (x) => diacriticsMap[x] ?? x);
}

export function synonymAliases(
  value: string,
  option: { emoji: boolean; accentsDiacritics: boolean },
): string[] {
  let synonym = value;

  if (option.emoji) {
    synonym = excludeEmoji(synonym);
  }

  if (option.accentsDiacritics) {
    synonym = normalizeAccentsDiacritics(synonym);
  }

  return synonym === value ? [] : [synonym];
}

export function lowerIncludes(one: string, other: string): boolean {
  return one.toLowerCase().includes(other.toLowerCase());
}

export function lowerIncludesWithoutSpace(one: string, other: string): boolean {
  return lowerIncludes(excludeSpace(one), excludeSpace(other));
}

export function lowerStartsWith(a: string, b: string): boolean {
  return a.toLowerCase().startsWith(b.toLowerCase());
}

export function wrapFuzzy<ARGS extends unknown[]>(
  func: (...args: ARGS) => boolean,
): (...args: ARGS) => FuzzyResult {
  return (...xs) =>
    func(...xs) ? { type: "concrete_match" } : { type: "none" };
}

export function lowerStartsWithoutSpace(one: string, other: string): boolean {
  return lowerStartsWith(excludeSpace(one), excludeSpace(other));
}

export function lowerFuzzy(a: string, b: string): FuzzyResult {
  return microFuzzy(a.toLowerCase(), b.toLowerCase());
}

export function lowerFuzzyStarsWith(a: string, b: string): FuzzyResult {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  return aLower[0] === bLower[0]
    ? microFuzzy(aLower, bLower)
    : { type: "none" };
}

/**
 * Remove diacritics/accents from a string using Unicode NFD normalization.
 * More efficient than diacritics-map for runtime comparison.
 * Example: "café" → "cafe", "São Paulo" → "Sao Paulo"
 */
export function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function lowerStartsWithDiacriticsInsensitive(
  a: string,
  b: string,
): boolean {
  return stripDiacritics(a.toLowerCase()).startsWith(
    stripDiacritics(b.toLowerCase()),
  );
}

export function lowerIncludesDiacriticsInsensitive(
  a: string,
  b: string,
): boolean {
  return stripDiacritics(a.toLowerCase()).includes(
    stripDiacritics(b.toLowerCase()),
  );
}

export function lowerFuzzyDiacriticsInsensitive(
  a: string,
  b: string,
): FuzzyResult {
  return microFuzzy(
    stripDiacritics(a.toLowerCase()),
    stripDiacritics(b.toLowerCase()),
  );
}

export function lowerFuzzyStartsWithDiacriticsInsensitive(
  a: string,
  b: string,
): FuzzyResult {
  const aNorm = stripDiacritics(a.toLowerCase());
  const bNorm = stripDiacritics(b.toLowerCase());
  return aNorm[0] === bNorm[0] ? microFuzzy(aNorm, bNorm) : { type: "none" };
}

/**
 * Compute the Levenshtein (edit) distance between two strings.
 * Uses a single-row DP approach for O(min(m,n)) memory.
 * Used as a spell-correction fallback when normal matching yields no results.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure a is the shorter string for memory optimization
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  const aLen = a.length;
  const bLen = b.length;
  const row = new Array<number>(aLen + 1);

  for (let i = 0; i <= aLen; i++) {
    row[i] = i;
  }

  for (let j = 1; j <= bLen; j++) {
    let prev = j;
    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(
        row[i] + 1, // deletion
        prev + 1, // insertion
        row[i - 1] + cost, // substitution
      );
      row[i - 1] = prev;
      prev = val;
    }
    row[aLen] = prev;
  }

  return row[aLen];
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function applyQueryFirstLetterCase(
  value: string,
  query: string,
): string {
  if (!query) {
    return value;
  }

  const words = value.split(" ");
  let offset = 0;
  const hasUpperExceptSingleLetter = words.some((word) => {
    if (word.length <= 1) {
      offset += word.length + 1;
      return false;
    }

    for (let i = 0; i < word.length; i++) {
      const ch = word.charAt(i);
      if (ch >= "A" && ch <= "Z") {
        if (i > 0 || offset !== 0) {
          return true;
        }
      }
    }

    offset += word.length + 1;
    return false;
  });
  if (hasUpperExceptSingleLetter) {
    return value;
  }

  const queryFirst = query.charAt(0);
  const valueFirst = value.charAt(0);
  if (!queryFirst || !valueFirst) {
    return value;
  }

  const queryUpper = queryFirst.toUpperCase();
  const queryLower = queryFirst.toLowerCase();
  if (queryUpper === queryLower) {
    return value;
  }

  const adjustedFirst =
    queryFirst === queryUpper
      ? valueFirst.toUpperCase()
      : valueFirst.toLowerCase();
  if (adjustedFirst === valueFirst) {
    return value;
  }

  return adjustedFirst + value.slice(1);
}

export function startsSmallLetterOnlyFirst(str: string): boolean {
  return Boolean(str.match(/^[A-Z][^A-Z]+$/));
}

export function isInternalLink(text: string): boolean {
  return Boolean(text.match(/^\[\[.+]]$/));
}

export function smartLineBreakSplit(text: string): string[] {
  return text.split("\n").filter((x) => x);
}

export function* splitRaw(
  text: string,
  regexp: RegExp,
): IterableIterator<string> {
  let previousIndex = 0;
  for (let r of text.matchAll(regexp)) {
    if (previousIndex !== r.index!) {
      yield text.slice(previousIndex, r.index!);
    }
    yield text[r.index!];
    previousIndex = r.index! + 1;
  }

  if (previousIndex !== text.length) {
    yield text.slice(previousIndex, text.length);
  }
}

export function findCommonPrefix(strs: string[]): string | null {
  if (strs.length === 0) {
    return null;
  }

  const min = Math.min(...strs.map((x) => x.length));
  for (let i = 0; i < min; i++) {
    if (uniq(strs.map((x) => x[i].toLowerCase())).length > 1) {
      return strs[0].substring(0, i);
    }
  }

  return strs[0].substring(0, min);
}

export type FuzzyResult =
  | { type: "concrete_match" }
  | { type: "fuzzy_match"; score: number }
  | { type: "none" };

export function microFuzzy(value: string, query: string): FuzzyResult {
  let i = 0;
  let lastMatchIndex = null;
  let isFuzzy = false;
  let scoreSeed = 0;
  let combo = 0;

  for (let j = 0; j < value.length; j++) {
    if (value[j] === query[i]) {
      if (lastMatchIndex != null && j - lastMatchIndex > 1) {
        isFuzzy = true;
      }
      lastMatchIndex = j;
      combo++;
      i++;
    } else {
      if (combo > 0) {
        scoreSeed += 2 ** combo;
        combo = 0;
      }
    }
    if (i === query.length) {
      if (combo > 0) {
        scoreSeed += 2 ** combo;
      }
      return isFuzzy
        ? { type: "fuzzy_match", score: scoreSeed / value.length }
        : { type: "concrete_match" };
    }
  }

  return { type: "none" };
}

export function joinNumberWithSymbol(tokens: string[]): string[] {
  if (tokens.length === 0) {
    return [];
  }

  let stock = tokens.shift()!;
  const ret: string[] = [];
  for (const token of tokens) {
    if (allNumbersOrFewSymbols(token) && allNumbersOrFewSymbols(stock)) {
      stock += token;
    } else {
      if (stock) {
        ret.push(stock);
      }
      stock = token;
    }
  }

  ret.push(stock);
  return ret;
}

/**
 * Check if the text ends while still being inside a code block.
 */
export function isEOTinCodeBlock(text: string): boolean {
  const lines = text.split("\n");

  let inCodeBlock = false;
  let codeBlockDelimiter = "";
  let codeBlockDelimiterLength = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for code block start/end (``` or ~~~)
    const codeBlockMatch = trimmedLine.match(/^(`{3,}|~{3,})/);

    if (codeBlockMatch) {
      const delimiter = codeBlockMatch[1];
      const delimiterChar = delimiter[0]; // ` or ~
      const delimiterLength = delimiter.length;

      if (!inCodeBlock) {
        // Starting a new code block
        inCodeBlock = true;
        codeBlockDelimiter = delimiterChar;
        codeBlockDelimiterLength = delimiterLength;
      } else if (
        delimiterChar === codeBlockDelimiter &&
        delimiterLength >= codeBlockDelimiterLength
      ) {
        // Ending the current code block (must be same char and >= length)
        inCodeBlock = false;
        codeBlockDelimiter = "";
        codeBlockDelimiterLength = 0;
      }
    }
  }

  return inCodeBlock;
}
