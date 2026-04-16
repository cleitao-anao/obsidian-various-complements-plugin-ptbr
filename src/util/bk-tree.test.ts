import { describe, expect, test } from "@jest/globals";
import { BKTree } from "./bk-tree";

describe("BKTree", () => {
  test("empty tree returns empty results", () => {
    const tree = new BKTree<string>((x) => x);
    expect(tree.search("hello", 2)).toStrictEqual([]);
    expect(tree.size).toBe(0);
  });

  test("fromItems builds tree correctly", () => {
    const tree = BKTree.fromItems(["hello", "help", "world"], (x) => x);
    expect(tree.size).toBe(3);
  });

  test("deduplicate words on insert", () => {
    const tree = BKTree.fromItems(["hello", "hello", "hello"], (x) => x);
    expect(tree.size).toBe(1);
  });

  test("finds exact-distance-1 matches", () => {
    const tree = BKTree.fromItems(["hello", "help", "world", "code"], (x) => x);
    const results = tree.search("helo", 1);
    const words = results.map((r) => r.item);
    expect(words).toContain("hello");
    // "help" is also distance 1 from "helo"
    expect(words).toContain("help");
    expect(words).not.toContain("world");
    expect(words).not.toContain("code");
  });

  test("finds distance-2 matches", () => {
    const tree = BKTree.fromItems(["hello", "world", "code"], (x) => x);
    const results = tree.search("wrld", 2);
    const words = results.map((r) => r.item);
    expect(words).toContain("world");
    expect(words).not.toContain("hello");
  });

  test("excludes exact matches (distance 0)", () => {
    const tree = BKTree.fromItems(["hello", "help"], (x) => x);
    const results = tree.search("hello", 2);
    const words = results.map((r) => r.item);
    expect(words).not.toContain("hello");
    expect(words).toContain("help");
  });

  test("results are sorted by distance", () => {
    const tree = BKTree.fromItems(["hello", "help", "heal", "heap"], (x) => x);
    const results = tree.search("helloo", 3);
    // "hello" is distance 1 (deletion), others are further
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item).toBe("hello");
    expect(results[0].distance).toBe(1);
    // All should be sorted ascending
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distance).toBeGreaterThanOrEqual(
        results[i - 1].distance,
      );
    }
  });

  test("returns correct distances", () => {
    const tree = BKTree.fromItems(["hello"], (x) => x);
    const results = tree.search("helo", 2);
    expect(results).toStrictEqual([{ item: "hello", distance: 1 }]);
  });

  test("handles large vocabulary", () => {
    const words = [];
    for (let i = 0; i < 1000; i++) {
      words.push(`word${i}`);
    }
    const tree = BKTree.fromItems(words, (x) => x);
    expect(tree.size).toBe(1000);
    const results = tree.search("word5", 1);
    // Should find "word5" as exact (excluded), plus "word50"-"word59" etc are distance > 1
    // Exact match "word5" is excluded
    expect(results.every((r) => r.item !== "word5")).toBe(true);
  });

  test("works with accented characters", () => {
    const tree = BKTree.fromItems(["café", "cafe", "capa"], (x) => x);
    const results = tree.search("cafe", 2);
    // "cafe" is exact (excluded), "café" is distance 1
    expect(results.map((r) => r.item)).toContain("café");
    expect(results.map((r) => r.item)).not.toContain("cafe");
  });

  test("single word tree", () => {
    const tree = BKTree.fromItems(["hello"], (x) => x);
    expect(tree.search("hello", 1)).toStrictEqual([]);
    expect(tree.search("helo", 1)).toStrictEqual([
      { item: "hello", distance: 1 },
    ]);
    expect(tree.search("xyz", 1)).toStrictEqual([]);
  });
});
