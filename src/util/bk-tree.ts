import { levenshteinDistance } from "./strings";

/**
 * BK-Tree (Burkhard-Keller Tree) for efficient fuzzy string searching.
 *
 * Instead of comparing the query against every word in the dictionary (O(n)),
 * the BK-Tree prunes branches that cannot possibly contain matches,
 * reducing search time to roughly O(n^(1/k)) where k is the max distance.
 *
 * The tree is built once (at indexing time) and queried many times.
 */

interface BKNode<T> {
  item: T;
  children: Map<number, BKNode<T>>;
}

export class BKTree<T> {
  private root: BKNode<T> | null = null;
  private _size = 0;

  constructor(private extractor: (item: T) => string) {}

  get size(): number {
    return this._size;
  }

  /**
   * Build a BK-Tree from an iterable of items.
   */
  static fromItems<T>(
    items: Iterable<T>,
    extractor: (item: T) => string,
  ): BKTree<T> {
    const tree = new BKTree<T>(extractor);
    for (const item of items) {
      tree.add(item);
    }
    return tree;
  }

  /**
   * Insert an item into the tree.
   */
  add(item: T): void {
    const word = this.extractor(item);
    if (this.root === null) {
      this.root = { item, children: new Map() };
      this._size = 1;
      return;
    }

    let current = this.root;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentWord = this.extractor(current.item);
      const dist = levenshteinDistance(currentWord, word);
      if (dist === 0) {
        // Duplicate word — skip
        return;
      }

      const child = current.children.get(dist);
      if (child) {
        current = child;
      } else {
        current.children.set(dist, { item, children: new Map() });
        this._size++;
        return;
      }
    }
  }

  /**
   * Search for all words within `maxDistance` edits of the query.
   * Returns an array of { word, distance } sorted by distance ascending.
   *
   * By the triangle inequality of Levenshtein distance:
   *   |d(query, child) - d(query, node)| <= d(node, child)
   * so we only need to check children whose edge label `d` satisfies:
   *   d(query, node) - maxDistance <= d <= d(query, node) + maxDistance
   */
  search(query: string, maxDistance: number): { item: T; distance: number }[] {
    if (this.root === null) {
      return [];
    }

    const results: { item: T; distance: number }[] = [];
    const stack: BKNode<T>[] = [this.root];

    while (stack.length > 0) {
      const node = stack.pop()!;
      const nodeWord = this.extractor(node.item);
      const dist = levenshteinDistance(nodeWord, query);

      if (dist <= maxDistance && dist > 0) {
        results.push({ item: node.item, distance: dist });
      }

      // Triangle inequality pruning
      const lo = dist - maxDistance;
      const hi = dist + maxDistance;

      for (const [edgeDist, child] of node.children) {
        if (edgeDist >= lo && edgeDist <= hi) {
          stack.push(child);
        }
      }
    }

    return results.sort((a, b) => a.distance - b.distance);
  }
}
