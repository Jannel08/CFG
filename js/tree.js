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
    span.className = 'node';
    span.textContent = typeof node === 'string' ? node : node.name;
    li.appendChild(span);

    const validChildren = (node.children || []).filter(child => {
      const childName = typeof child === 'string' ? child : child.name;
      return childName !== 'ε';
    });

    if (validChildren.length > 0) {
      const ul = document.createElement('ul');
      validChildren.forEach(child => {
        ul.appendChild(this.createTreeDom(child));
      });
      li.appendChild(ul);
    }

    return li;
  }
}
