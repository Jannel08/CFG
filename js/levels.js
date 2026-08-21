// Reusable category configurations including Epsilon (ε)
const DEFAULT_CATEGORIES = [
  { subtitle: "Non-Terminals", items: ["S", "E", "T"] },
  { subtitle: "Operator", items: ["->", "|"] },
  { subtitle: "Terminals", items: ["a", "b", "c", "d", "ε"] },
  { subtitle: "Digits", items: ["0", "1"] }
];

const PAREN_CATEGORIES = [
  { subtitle: "Non-Terminals", items: ["S", "E", "T"] },
  { subtitle: "Operator", items: ["->", "|"] },
  { subtitle: "Terminals", items: ["(", ")", "a", "b", "ε"] },
  { subtitle: "Digits", items: ["0", "1"] }
];

// Helper to auto-generate repetitive non-terminal rule combinations
const generatePatterns = (rules) => {
  const nonTerminals = ["S", "E", "T"];
  return nonTerminals.flatMap(nt => rules.map(rule => `${nt}->${rule}`));
};

const LEVELS = [
  {
    id: 1,
    title: "Level 1: Simple Pairs (a^n b^n)",
    valid: ["ab", "aabb", "aaabbb", "aaaabbbb", "aaaaabbbbb"],
    invalid: ["a", "b", "aba", "aab", "abb"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns([
      "aSb", "aSb|ab", "aSb|ε", "ab", "aabb", "aaabbb", "aaaabbbb", "aaaaabbbbb",
      "aEb", "aEb|ab", "aEb|ε", "aTb", "aTb|ab", "aTb|ε",
      "aaSbb", "aaSbb|aabb", "aaSbb|ε",
      "aaaSbbb", "aaaSbbb|aaabbb", "aaaSbbb|ε",
      "aaaaSbbbb", "aaaaSbbbb|aaaabbbb", "aaaaSbbbb|ε"
    ]),
    demoTree: {
      name: "S",
      children: [
        { name: "a" },
        { name: "S", children: [{ name: "a" }, { name: "b" }] },
        { name: "b" }
      ]
    }
  },

  {
    id: 2,
    title: "Level 2: Simple A's",
    valid: ["a", "aa", "aaa", "aaaa", "aaaaa"],
    invalid: ["b", "ab", "ba", "aab", "aba"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns([
      "a", "aS", "aS|a", "aS|ε", "aa", "aaS", "aaa", "aaaa", "aaaaa", "aE", "aT"
    ]),
    demoTree: {
      name: "S",
      children: [{ name: "a" }, { name: "S", children: [{ name: "a" }] }]
    }
  },

  {
    id: 3,
    title: "Level 3: Simple B's",
    valid: ["b", "bb", "bbb", "bbbb", "bbbbb"],
    invalid: ["a", "ab", "ba", "abb", "bab"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns([
      "b", "bS", "bS|b", "bS|ε", "bb", "bbS", "bbb", "bbbb", "bbbbb", "bE", "bT"
    ]),
    demoTree: {
      name: "S",
      children: [{ name: "b" }, { name: "S", children: [{ name: "b" }] }]
    }
  },

  {
    id: 4,
    title: "Level 4: Alternating (ab)^n",
    valid: ["ab", "abab", "ababab", "abababab", "ababababab"],
    invalid: ["a", "b", "aa", "bb", "aba"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns([
      "ab", "abS", "abS|ab", "abS|ε", "abab", "ababab", "abababab", "ababababab", "abE", "abT"
    ]),
    demoTree: {
      name: "S",
      children: [{ name: "a" }, { name: "b" }, { name: "S", children: [{ name: "a" }, { name: "b" }] }]
    }
  },

  {
    id: 5,
    title: "Level 5: Simple Parentheses ()^n",
    valid: ["()", "()()", "()()()", "()()()()", "()()()()()"],
    invalid: ["(", ")", "(()", ")(", "((("],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: PAREN_CATEGORIES,
    expectedPatterns: generatePatterns([
      "()", "()S", "()S|()", "()S|ε", "()()", "()()()", "()()()()", "()()()()()", "()E", "()T"
    ]),
    demoTree: {
      name: "S",
      children: [{ name: "(" }, { name: ")" }]
    }
  },

  {
    id: 6,
    title: "Level 6: Two A's (aa)^n",
    valid: ["aa", "aaaa", "aaaaaa", "aaaaaaaa", "aaaaaaaaaa"],
    invalid: ["a", "aaa", "aaaaa", "aaaaaaa", "ab"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns([
      "aa", "aaS", "aaS|aa", "aaS|ε", "aaaa", "aaaaaa", "aaaaaaaa", "aaaaaaaaaa", "aaE", "aaT"
    ]),
    demoTree: {
      name: "S",
      children: [{ name: "a" }, { name: "a" }]
    }
  },

  {
    id: 7,
    title: "Level 7: Two B's (bb)^n",
    valid: ["bb", "bbbb", "bbbbbb", "bbbbbbbb", "bbbbbbbbbb"],
    invalid: ["b", "bbb", "bbbbb", "bbbbbbb", "ba"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns([
      "bb", "bbS", "bbS|bb", "bbS|ε", "bbbb", "bbbbbb", "bbbbbbbb", "bbbbbbbbbb", "bbE", "bbT"
    ]),
    demoTree: {
      name: "S",
      children: [{ name: "b" }, { name: "b" }]
    }
  },

  {
    id: 8,
    title: "Level 8: Starts With A",
    valid: ["a", "aa", "aaa", "aaaa", "aaaaa"],
    invalid: ["b", "ab", "ba", "abb", "bab"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns([
      "a", "aS", "aS|a", "aS|ε", "aa", "aaa", "aaaa", "aaaaa", "aE", "aT"
    ]),
    demoTree: {
      name: "S",
      children: [{ name: "a" }]
    }
  },

  {
    id: 9,
    title: "Level 9: Ends With B",
    valid: ["b", "bb", "bbb", "bbbb", "bbbbb"],
    invalid: ["a", "ab", "ba", "aba", "aab"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns([
      "b", "bS", "bS|b", "bS|ε", "bb", "bbb", "bbbb", "bbbbb", "bE", "bT"
    ]),
    demoTree: {
      name: "S",
      children: [{ name: "b" }]
    }
  },

  {
    id: 10,
    title: "Level 10: One A One B",
    valid: ["ab"],
    invalid: ["a", "b", "ba", "aa", "bb"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns(["ab"]),
    demoTree: {
      name: "S",
      children: [{ name: "a" }, { name: "b" }]
    }
  },

  {
    id: 11,
    title: "Level 11: One B One A",
    valid: ["ba"],
    invalid: ["ab", "a", "b", "bb", "aa"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns(["ba"]),
    demoTree: {
      name: "S",
      children: [{ name: "b" }, { name: "a" }]
    }
  },

  {
    id: 12,
    title: "Level 12: Three A's (aaa)^n",
    valid: ["aaa", "aaaaaa", "aaaaaaaaa", "aaaaaaaaaaaa", "aaaaaaaaaaaaaaa"],
    invalid: ["a", "aa", "aaaa", "aaaaa", "aaaaaaa"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns([
      "aaa", "aaaS", "aaaS|aaa", "aaaS|ε", "aaaaaa", "aaaaaaaaa", "aaaaaaaaaaaa", "aaaaaaaaaaaaaaa", "aaaE", "aaaT"
    ]),
    demoTree: {
      name: "S",
      children: [{ name: "a" }, { name: "a" }, { name: "a" }]
    }
  },

  {
    id: 13,
    title: "Level 13: Three B's (bbb)^n",
    valid: ["bbb", "bbbbbb", "bbbbbbbbb", "bbbbbbbbbbbb", "bbbbbbbbbbbbbbb"],
    invalid: ["b", "bb", "bbbb", "bbbbb", "bbbbbbb"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns([
      "bbb", "bbbS", "bbbS|bbb", "bbbS|ε", "bbbbbb", "bbbbbbbbb", "bbbbbbbbbbbb", "bbbbbbbbbbbbbbb", "bbbE", "bbbT"
    ]),
    demoTree: {
      name: "S",
      children: [{ name: "b" }, { name: "b" }, { name: "b" }]
    }
  },

  {
    id: 14,
    title: "Level 14: A B A",
    valid: ["aba"],
    invalid: ["ab", "aab", "abb", "bab", "aaa"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns(["aba"]),
    demoTree: {
      name: "S",
      children: [{ name: "a" }, { name: "b" }, { name: "a" }]
    }
  },

  {
    id: 15,
    title: "Level 15: A B B",
    valid: ["abb"],
    invalid: ["ab", "aab", "aba", "bbb", "aaa"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: generatePatterns(["abb"]),
    demoTree: {
      name: "S",
      children: [{ name: "a" }, { name: "b" }, { name: "b" }]
    }
  }
];