TreeUtil = (function() {
	return {
		// assumes: tree nodes have children array defined, with fn(n) to be called for each node
		walkTree: function(tree, fn) {
			if (tree) {
				fn(tree);
				if (tree.children) {
					for (var c in tree.children) {
						walkTree(c, fn);
					}
				}
			}
		}
	};
})();