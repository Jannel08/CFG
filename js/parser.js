/**
 * Dynamic Context-Free Grammar (CFG) Engine
 * Evaluates whether a user's grammar generates target valid strings
 * and rejects invalid strings while generating parse trees.
 */
class ContextFreeGrammar {
  constructor(rulesString) {
    this.rules = new Map(); // Non-Terminal -> Array of Production Arrays
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

      // Split production into individual symbols
      this.rules.get(lhs).push(rhs.split(''));
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

const GrammarValidator = {
  validateUserGrammar(userInput, level) {

    if (!userInput || userInput.trim() === "") {
      return {
        success: false,
        message: "No production rules provided in slots."
      };
    }

    // Remove spaces so:
    // S -> aSb
    // S->aSb
    // are treated as the same grammar.
    const submitted = userInput
      .replace(/\s+/g, "")
      .trim();

    // Get the grammars accepted for this level
    const expectedPatterns = (level.expectedPatterns || []).map(pattern =>
      pattern.replace(/\s+/g, "").trim()
    );

    // Check if the submitted grammar matches ANY expected pattern
    const isCorrect = expectedPatterns.includes(submitted);

    if (isCorrect) {

      // Generate a tree for the submitted grammar
      let generatedTree = level.demoTree;

      // Level-specific simple trees
      if (submitted === "S->ab") {
        generatedTree = {
          name: "S",
          children: [
            { name: "a" },
            { name: "b" }
          ]
        };
      }

      else if (submitted === "S->aSb") {
        generatedTree = {
          name: "S",
          children: [
            { name: "a" },
            {
              name: "S",
              children: [
                { name: "a" },
                { name: "b" }
              ]
            },
            { name: "b" }
          ]
        };
      }

      return {
        success: true,
        message: `Correct! "${userInput}" is an accepted grammar.`,
        tree: generatedTree
      };
    }

    // Not found in expectedPatterns
    return {
      success: false,
      message: `Incorrect grammar. "${userInput}" is not one of the accepted patterns.`
    };
  }
};