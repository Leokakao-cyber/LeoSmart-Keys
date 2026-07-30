// Lightweight Trie for prefix-based word suggestions.
// Supports modular loading of vocabulary packs (base pack + expansion packs
// + user dictionary) without re-parsing a giant flat list up-front.

export interface TrieNode {
  children: Map<string, TrieNode>;
  end: boolean;
  freq: number; // usage frequency for ranking suggestions
  word?: string;
}

const createNode = (): TrieNode => ({
  children: new Map(),
  end: false,
  freq: 0,
});

export class Trie {
  root: TrieNode = createNode();
  size = 0;
  private loadedPacks = new Set<string>();

  insert(word: string, freq = 1) {
    const w = word.toLowerCase().trim();
    if (!w) return;
    let node = this.root;
    for (const ch of w) {
      let next = node.children.get(ch);
      if (!next) {
        next = createNode();
        node.children.set(ch, next);
      }
      node = next;
    }
    if (!node.end) this.size++;
    node.end = true;
    node.word = w;
    node.freq += freq;
  }

  has(word: string): boolean {
    let node = this.root;
    for (const ch of word.toLowerCase()) {
      const next = node.children.get(ch);
      if (!next) return false;
      node = next;
    }
    return node.end;
  }

  // Return top-N words matching a prefix, ranked by frequency then length.
  suggest(prefix: string, limit = 3): string[] {
    const p = prefix.toLowerCase();
    let node = this.root;
    for (const ch of p) {
      const next = node.children.get(ch);
      if (!next) return [];
      node = next;
    }
    const results: { word: string; freq: number }[] = [];
    const stack: TrieNode[] = [node];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.end && n.word) results.push({ word: n.word, freq: n.freq });
      for (const child of n.children.values()) stack.push(child);
    }
    results.sort((a, b) => b.freq - a.freq || a.word.length - b.word.length);
    return results.slice(0, limit).map((r) => r.word);
  }

  // Bump usage weight when a user actually picks / types a word.
  bump(word: string, by = 1) {
    const w = word.toLowerCase().trim();
    if (!w) return;
    let node = this.root;
    for (const ch of w) {
      const next = node.children.get(ch);
      if (!next) return;
      node = next;
    }
    if (node.end) node.freq += by;
  }

  // Modular pack loader — call once per pack id.
  loadPack(id: string, words: Array<string | [string, number]>) {
    if (this.loadedPacks.has(id)) return;
    for (const w of words) {
      if (Array.isArray(w)) this.insert(w[0], w[1]);
      else this.insert(w);
    }
    this.loadedPacks.add(id);
  }

  hasPack(id: string) {
    return this.loadedPacks.has(id);
  }
}