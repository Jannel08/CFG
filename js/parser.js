/**
 * Dynamic Context-Free Grammar (CFG) Engine
 * Evaluates whether a user's grammar generates target valid strings
 * and rejects invalid strings while generating parse trees.
 */
class ContextFreeGrammar {
  constructor(rulesString) {
    this.rules = new Map(); 
    this.startSymbol = 'S';
    this.parseRules(rulesString);
  }

  parseRules(rulesString) {
    const lines = rulesString.split('\n');
    lines.forEach(line => {
      const cleanLine = line.replace(/\s+/g, '');
      if (!cleanLine.includes('->')) return;

      const [lhs, rhs] = cleanLine.split('->');
      if (!lhs || !rhs) return;

      if (!this.rules.has(lhs)) {
        this.rules.set(lhs, []);
      }

      // 1. Split alternatives separated by '|' (e.g., "0S|0" -> ["0S", "0"])
      const alternatives = rhs.split('|');
      alternatives.forEach(alt => {
        if (alt.length > 0) {
          // 2. Split production into individual symbol characters
          this.rules.get(lhs).push(alt.split(''));
        }
      });
    });
  }

  /**
   * Evaluates string derivation and returns the constructed AST parse tree.
   */
  derives(targetString, maxDepth = 15, maxQueueSize = 3000) {
    const initialNode = { name: this.startSymbol, children: [] };
    const queue = [{ symbols: [this.startSymbol], tree: initialNode, depth: 0 }];
    const visited = new Set();
    let processed = 0;

    while (queue.length > 0 && processed < maxQueueSize) {
      processed++;
      const { symbols, tree, depth } = queue.shift();

      // Ignore epsilon ('ε') when building the string to evaluate against the target
      const filteredSymbols = symbols.filter(sym => sym !== 'ε');
      const currentStr = filteredSymbols.join('');

      // Terminal check: verify all non-epsilon symbols are terminals
      const isAllTerminals = symbols.every(sym => sym === 'ε' || !this.rules.has(sym));

      if (isAllTerminals && currentStr === targetString) {
        return { success: true, tree };
      }

      // Prune search paths that exceed target length or search depth
      if (depth > maxDepth || currentStr.length > targetString.length + 4) {
        continue;
      }

      const stateKey = `${symbols.join('')}_${depth}`;
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);

      // Find leftmost non-terminal
      const ntIndex = symbols.findIndex(sym => this.rules.has(sym));
      if (ntIndex !== -1) {
        const nt = symbols[ntIndex];
        const productions = this.rules.get(nt) || [];

        for (const prod of productions) {
          // Clone tree to maintain derivation structure
          const treeClone = JSON.parse(JSON.stringify(tree));
          const targetASTNode = this.findLeftmostUnexpandedNode(treeClone, nt);

          const childASTNodes = prod.map(sym => ({ name: sym, children: [] }));
          if (targetASTNode) {
            targetASTNode.children = childASTNodes;
          }

          const nextSymbols = [
            ...symbols.slice(0, ntIndex),
            ...prod,
            ...symbols.slice(ntIndex + 1)
          ];

          queue.push({
            symbols: nextSymbols,
            tree: treeClone,
            depth: depth + 1
          });
        }
      }
    }

    return { success: false, tree: null };
  }

  findLeftmostUnexpandedNode(node, targetSymbol) {
    if (node.name === targetSymbol && (!node.children || node.children.length === 0)) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = this.findLeftmostUnexpandedNode(child, targetSymbol);
        if (found) return found;
      }
    }
    return null;
  }
}

class TreeRenderer {
  static render(ast, container) {
    if (!container) {
      console.error("Tree container element not found!");
      return;
    }
    
    // Clear old tree content
    container.innerHTML = "";

    if (!ast) {
      container.innerHTML = "<p style='color:var(--magenta)'>No tree data available.</p>";
      return;
    }

    const treeRoot = document.createElement('div');
    treeRoot.className = 'tree';
    
    // Wrap inside a root <ul> if your CSS requires tree lists
    const rootUl = document.createElement('ul');
    rootUl.appendChild(this.createTreeDom(ast));
    treeRoot.appendChild(rootUl);

    container.appendChild(treeRoot);
  }

  static createTreeDom(node) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'node';
    span.textContent = typeof node === 'string' ? node : node.name;
    li.appendChild(span);

    // Keep all child nodes (including epsilon 'ε')
    const children = node.children || [];

    if (children.length > 0) {
      const ul = document.createElement('ul');
      children.forEach(child => {
        ul.appendChild(this.createTreeDom(child));
      });
      li.appendChild(ul);
    }

    return li;
  }
}

const GrammarValidator = {
  validate(userInput, level) {
    return this.validateUserGrammar(userInput, level);
  },

  validateUserGrammar(userInput, level) {
    if (!userInput || userInput.trim() === "") {
      return {
        success: false,
        message: "No production rules provided in slots."
      };
    }

    const submitted = userInput.replace(/\s+/g, "").trim();
    
    // Normalize string order for OR (|) rules
    const normalizePattern = (str) => {
      if (!str.includes('->')) return str;
      const [lhs, rhs] = str.split('->');
      const sortedRhs = rhs.split('|').sort().join('|');
      return `${lhs}->${sortedRhs}`;
    };

    const normalizedSubmitted = normalizePattern(submitted);
    const expectedPatterns = (level.expectedPatterns || []).map(p => normalizePattern(p.replace(/\s+/g, "").trim()));
    const isPatternMatched = expectedPatterns.includes(normalizedSubmitted);

    // 1. Instantiate dynamic CFG Engine
    const cfg = new ContextFreeGrammar(userInput);
    let sampleTree = null;

    const validStrings = level.valid || [];
    const invalidStrings = level.invalid || [];

    // 2. ALWAYS attempt to build a parse tree dynamically first
    let acceptsAllValid = true;
    for (const str of validStrings) {
      const res = cfg.derives(str);
      if (!res.success) {
        acceptsAllValid = false;
      } else if (!sampleTree && res.tree) {
        sampleTree = res.tree; // Capture actual generated parse tree
      }
    }

    let rejectsAllInvalid = true;
    for (const str of invalidStrings) {
      const res = cfg.derives(str);
      if (res.success) {
        rejectsAllInvalid = false;
        break;
      }
    }

    // 3. Final Verdict: Check pattern match OR functional string derivations
    if (isPatternMatched || (acceptsAllValid && rejectsAllInvalid && validStrings.length > 0)) {
      return {
        success: true,
        message: `Correct! "${userInput}" is a valid production rule for this level.`,
        // ALWAYS prioritize sampleTree (dynamically generated tree) over fallback demoTree
        tree: sampleTree || level.demoTree || null
      };
    }

    return {
      success: false,
      message: `Incorrect grammar. Your production rules do not generate the target language.`
    };
  }
};

// Export to global scope
window.GrammarValidator = GrammarValidator;
window.TreeRenderer = TreeRenderer;
