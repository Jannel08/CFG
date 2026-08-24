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

const LEVELS = [
  {
    id: 1,
    title: "Level 1: Binary Strings (0^n)",
    valid: ["0", "00", "000", "0000"],
    invalid: ["1", "01", "10", "a"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->0S|0", "S->0S|ε", "S->0|0S", "S->00S|0", "S->0",
      "E->0E|0", "E->0E|ε", "E->0|0E", "E->00E|0", "E->0",
      "T->0T|0", "T->0T|ε", "T->0|0T", "T->00T|0", "T->0"
    ]
  },
  {
    id: 2,
    title: "Level 2: Alternating Bits (01)^n",
    valid: ["01", "0101", "010101"],
    invalid: ["0", "1", "10", "0011"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->01S|01", "S->01S|ε", "S->01|01S", "S->0101S|01", "S->01",
      "E->01E|01", "E->01E|ε", "E->01|01E", "E->0101E|01", "E->01",
      "T->01T|01", "T->01T|ε", "T->01|01T", "T->0101T|01", "T->01"
    ]
  },
  {
    id: 3,
    title: "Level 3: Simple Pairs (a^n b^n)",
    valid: ["ab", "aabb", "aaabbb"],
    invalid: ["a", "b", "aba", "aab"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->aSb|ab", "S->aSb|ε", "S->ab|aSb", "S->ab", "S->aaSbb|aabb",
      "E->aEb|ab", "E->aEb|ε", "E->ab|aEb", "E->ab", "E->aaEbb|aabb",
      "T->aTb|ab", "T->aTb|ε", "T->ab|aTb", "T->ab", "T->aaTbb|aabb"
    ]
  },
  {
    id: 4,
    title: "Level 4: Triple Repeat (c^n)",
    valid: ["c", "cc", "ccc", "cccc"],
    invalid: ["a", "b", "d", "0"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->cS|c", "S->cS|ε", "S->c|cS", "S->ccS|c", "S->c",
      "E->cE|c", "E->cE|ε", "E->c|cE", "E->ccE|c", "E->c",
      "T->cT|c", "T->cT|ε", "T->c|cT", "T->ccT|c", "T->c"
    ]
  },
  {
    id: 5,
    title: "Level 5: Simple Parentheses ()^n",
    valid: ["()", "()()", "()()()"],
    invalid: ["(", ")", "(()", ")("],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: PAREN_CATEGORIES,
    expectedPatterns: [
      "S->()S|()", "S->()S|ε", "S->()|()S", "S->()()S|()", "S->()",
      "E->()E|()", "E->()E|ε", "E->()|()E", "E->()()E|()", "E->()",
      "T->()T|()", "T->()T|ε", "T->()|()T", "T->()()T|()", "T->()"
    ]
  },
  {
    id: 6,
    title: "Level 6: Sandwiched Character (c d^n c)",
    valid: ["cdc", "cddc", "cdddc"],
    invalid: ["cc", "cd", "dc", "dd"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->cSc|d", "S->cS|cdc", "S->cdc", "S->cddc", "S->cSc|ε",
      "E->cEc|d", "E->cE|cdc", "E->cdc", "E->cddc", "E->cEc|ε",
      "T->cTc|d", "T->cT|cdc", "T->cdc", "T->cddc", "T->cTc|ε"
    ]
  },
  {
    id: 7,
    title: "Level 7: Doubled Digits (00)^n",
    valid: ["00", "0000", "000000"],
    invalid: ["0", "000", "00000", "11"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->00S|00", "S->00S|ε", "S->00|00S", "S->00", "S->0000S|00",
      "E->00E|00", "E->00E|ε", "E->00|00E", "E->00", "E->0000E|00",
      "T->00T|00", "T->00T|ε", "T->00|00T", "T->00", "T->0000T|00"
    ]
  },
  {
    id: 8,
    title: "Level 8: Enclosed Pair (a^n c b^n)",
    valid: ["acb", "aacbb", "aaacbbb"],
    invalid: ["ab", "c", "abc", "ac"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->aSb|c", "S->c|aSb", "S->acb", "S->aacbb", "S->aaSbb|c",
      "E->aEb|c", "E->c|aEb", "E->acb", "E->aacbb", "E->aaEbb|c",
      "T->aTb|c", "T->c|aTb", "T->acb", "T->aacbb", "T->aaTbb|c"
    ]
  },
  {
    id: 9,
    title: "Level 9: Binary Ones (1^n)",
    valid: ["1", "11", "111", "1111"],
    invalid: ["0", "01", "10", "a"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->1S|1", "S->1S|ε", "S->1|1S", "S->11S|1", "S->1",
      "E->1E|1", "E->1E|ε", "E->1|1E", "E->11E|1", "E->1",
      "T->1T|1", "T->1T|ε", "T->1|1T", "T->11T|1", "T->1"
    ]
  },
  {
    id: 10,
    title: "Level 10: Nested Parentheses ((...))",
    valid: ["()", "(())", "((()))"],
    invalid: ["(", ")", "()()", ")("],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: PAREN_CATEGORIES,
    expectedPatterns: [
      "S->(S)|()", "S->(S)|ε", "S->()|(S)", "S->()", "S->((S))|()",
      "E->(E)|()", "E->(E)|ε", "E->()|(E)", "E->()", "E->((E))|()",
      "T->(T)|()", "T->(T)|ε", "T->()|(T)", "T->()", "T->((T))|()"
    ]
  },
  {
    id: 11,
    title: "Level 11: Alphabet sequence (abcd)",
    valid: ["abcd"],
    invalid: ["abc", "bcd", "dcba"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->abcd", "S->abS|cd", "S->aS|bcd", "S->abcS|d", "S->abcd|ε",
      "E->abcd", "E->abE|cd", "E->aE|bcd", "E->abcE|d", "E->abcd|ε",
      "T->abcd", "T->abT|cd", "T->aT|bcd", "T->abcT|d", "T->abcd|ε"
    ]
  },
  {
    id: 12,
    title: "Level 12: Mixed Binary Pair (0^n 1^n)",
    valid: ["01", "0011", "000111"],
    invalid: ["0", "1", "10", "010"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->0S1|01", "S->0S1|ε", "S->01|0S1", "S->01", "S->00S11|01",
      "E->0E1|01", "E->0E1|ε", "E->01|0E1", "E->01", "E->00E11|01",
      "T->0T1|01", "T->0T1|ε", "T->01|0T1", "T->01", "T->00T11|01"
    ]
  },
  {
    id: 13,
    title: "Level 13: Character Pair (c d)",
    valid: ["cd"],
    invalid: ["c", "d", "dc", "cc"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->cd", "S->cS|d", "S->cd|ε", "S->c|d", "S->cdd",
      "E->cd", "E->cE|d", "E->cd|ε", "E->cd|ε", "E->cdd",
      "T->cd", "T->cT|d", "T->cd|ε", "T->c|d", "T->cdd"
    ]
  },
  {
    id: 14,
    title: "Level 14: Alternating Digits (10)^n",
    valid: ["10", "1010", "101010"],
    invalid: ["1", "0", "01", "1100"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->10S|10", "S->10S|ε", "S->10|10S", "S->1010S|10", "S->10",
      "E->10E|10", "E->10E|ε", "E->10|10E", "E->1010E|10", "E->10",
      "T->10T|10", "T->10T|ε", "T->10|10T", "T->1010T|10", "T->10"
    ]
  },
  {
    id: 15,
    title: "Level 15: Triple Character (c^n d^n)",
    valid: ["cd", "ccdd", "cccddd"],
    invalid: ["c", "d", "cdc", "cdd"],
    timeLimit: 30,
    maxSlotsPerRow: 15,
    rows: 1,
    blockCategories: DEFAULT_CATEGORIES,
    expectedPatterns: [
      "S->cSd|cd", "S->cSd|ε", "S->cd|cSd", "S->cd", "S->ccSdd|cd",
      "E->cEd|cd", "E->cEd|ε", "E->cd|cEd", "E->cd", "E->ccEdd|cd",
      "T->cTd|cd", "T->cTd|ε", "T->cd|cTd", "T->cd", "T->ccTdd|cd"
    ]
  }
];

// Universal dynamic parse tree builder for any grammar rule
const buildDynamicParseTree = (lhs, rhs, depth = 3) => {
  const parts = rhs.split('|').map(p => p.trim());
  
  // Find recursive production (e.g., "0S1") and base terminal (e.g., "01" or "ε")
  const recursiveProd = parts.find(p => p.includes(lhs)) || parts[0];
  const baseTerminal = parts.find(p => !p.includes(lhs)) || "";

  function expand(currentDepth) {
    // Reached max depth: apply the base case production (substitute S with ε or terminal)
    if (currentDepth >= depth) {
      if (baseTerminal === "ε" || baseTerminal === "") {
        return [{ name: "ε" }];
      }
      return baseTerminal.split('').map(char => ({ name: char }));
    }

    // Expand the recursive production rule
    return recursiveProd.split('').map(char => {
      if (char === lhs) {
        return {
          name: lhs,
          children: expand(currentDepth + 1)
        };
      }
      return { name: char };
    });
  }

  return {
    name: lhs,
    children: expand(1)
  };
};

// Generates step-by-step derivation text from the AST tree
function generateDerivationSteps(node) {
  if (!node) return "";

  const steps = [];

  function buildStepString(currNode, targetDepth, currentDepth = 0) {
    if (!currNode.children || currNode.children.length === 0) {
      return currNode.name === "ε" ? "" : currNode.name;
    }

    if (currentDepth === targetDepth) {
      return currNode.name;
    }

    return currNode.children
      .map(child => buildStepString(child, targetDepth, currentDepth + (currNode.name ? 1 : 0)))
      .join('');
  }

  function getMaxDepth(currNode) {
    if (!currNode.children || currNode.children.length === 0) return 0;
    return 1 + Math.max(...currNode.children.map(getMaxDepth));
  }

  const maxDepth = getMaxDepth(node);

  // Skip step 0 (plain "S") and build steps starting directly from the first expansion
  for (let d = 1; d <= maxDepth; d++) {
    const stepStr = buildStepString(node, d);
    if (stepStr !== steps[steps.length - 1]) {
      steps.push(stepStr);
    }
  }

  // Map each step to "S ⇒ stepStr" separated by line breaks (<br>)
  return steps.map(step => `S ⇒ ${step}`).join('<br>');
}

const GrammarValidator = {
  validate(userInput, level) {
    return this.validateUserGrammar(userInput, level);
  },

  validateUserGrammar(userInput, level) {
    if (!userInput || userInput.trim() === "") {
      return {
        success: false,
        message: "No production rules provided in slots.",
        tree: null,
        derivation: ""
      };
    }

    const submitted = userInput.replace(/\s+/g, "").trim();

    // Parse LHS and RHS even if the rule isn't in 'expectedPatterns'
    let generatedTree = null;
    if (submitted.includes("->")) {
      const [lhs, rhs] = submitted.split("->");
      if (lhs && rhs) {
        generatedTree = buildDynamicParseTree(lhs, rhs);
      }
    } else {
      // Fallback if user forgot '->' (e.g. typed "0S|0")
      generatedTree = buildDynamicParseTree("S", submitted);
    }

    const derivationText = generatedTree ? generateDerivationSteps(generatedTree) : "";

    // Check correctness against level rules
    const expectedPatterns = (level.expectedPatterns || []).map(p => p.replace(/\s+/g, "").trim());
    
    const isCorrect = expectedPatterns.some(pattern => {
      if (submitted === pattern) return true;
      
      if (submitted.includes("->") && pattern.includes("->")) {
        const [uLhs, uRhs] = submitted.split("->");
        const [pLhs, pRhs] = pattern.split("->");
        if (uLhs !== pLhs) return false;

        const uParts = uRhs.split("|").sort().join("|");
        const pParts = pRhs.split("|").sort().join("|");
        return uParts === pParts;
      }
      return false;
    });

    if (isCorrect) {
      return {
        success: true,
        message: `Correct! "${userInput}" is a valid production rule for this level.`,
        tree: generatedTree,
        derivation: derivationText
      };
    }

    return {
      success: false,
      message: `Incorrect grammar. "${userInput}" is not one of the accepted rules.`,
      tree: generatedTree,
      derivation: derivationText
    };
  }
};

// Make accessible globally
window.GrammarValidator = GrammarValidator;

class TreeRenderer {
  static render(ast, container) {
    if (!container) {
      console.error("Tree container element not found!");
      return;
    }
    
    container.innerHTML = "";

    if (!ast) {
      container.innerHTML = "<p style='color:var(--magenta)'>No tree data available.</p>";
      return;
    }

    const treeRoot = document.createElement('div');
    treeRoot.className = 'tree';
    
    const rootUl = document.createElement('ul');
    rootUl.appendChild(this.createTreeDom(ast));
    treeRoot.appendChild(rootUl);

    container.appendChild(treeRoot);
  }

  static createTreeDom(node) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = node.name;
    span.style.border = '1px solid var(--cyan, #00ffff)';
    span.style.color = 'var(--cyan, #00ffff)';
    span.style.padding = '4px 12px';
    span.style.borderRadius = '3px';
    span.style.background = '#0d1117';
    span.style.fontWeight = 'bold';
    span.style.display = 'inline-block';
    
    li.appendChild(span);

    if (node.children && node.children.length > 0) {
      const ul = document.createElement('ul');
      node.children.forEach(child => {
        ul.appendChild(this.createTreeDom(child));
      });
      li.appendChild(ul);
    }

    return li;
  }
}
