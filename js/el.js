const el = (declarator, namespace) => {
	if (declarator instanceof Node && declarator.nodeType === 1) return declarator;
	else if (typeof declarator === "string") {
		const rgx = {
			tag: "\\w+",
			id: "\\#[a-zA-Z-][a-zA-Z0-9-]*",
			cls: "\\.[a-zA-Z-][a-zA-Z0-9-]*",
			atr: "\\[[^=\\]]+(=?[^\\]]*)\\]"
		};
		rgx.full = new RegExp(`(^(${rgx.tag})?)((${rgx.id})?)((${rgx.cls})*)((${rgx.atr})*)$`);
		const match = declarator.match(rgx.full);
		if (!match) return null;
		const pieces = {
			tag: match[1]?.match(new RegExp(rgx.tag, "g"))?.pop() ?? "div",
			id: match[3]?.match(new RegExp(rgx.id, "g"))?.map(it => it.substr(1)).pop(),
			cls: match[5]?.match(new RegExp(rgx.cls, "g"))?.map(it => it.substr(1)),
			atr: match[7]?.match(new RegExp(rgx.atr, "g"))?.map(it => {
				const split = it.substr(1, it.length - 2).split("=");
				return [split.shift(), split.join("=")];
			})
		};
		const tag = typeof namespace === "string"
			? document.createElementNS(namespace, pieces.tag)
			: document.createElement(pieces.tag);
		if (pieces.id) tag.id = pieces.id;
		if (pieces.cls) tag.classList.add(...pieces.cls);
		if (pieces.atr) pieces.atr.forEach(arr => tag.setAttribute(arr[0], arr[1] ?? ""));
		return tag;
	}
	else if (declarator instanceof Object) {
		const entries = Object.entries(declarator);
		if (entries.length < 1) return null;
		const node = el(entries[0][0], namespace);
		if (!node) return null;
		if (entries[0][1] instanceof Array) {
			entries[0][1].forEach(it => {
				const child = el(it, namespace);
				if (child) node.appendChild(child);
			});
			return node;
		}
		else if (typeof entries[0][1] === "string") {
			const txt = document.createTextNode(entries[0][1]);
			node.appendChild(txt);
			return node;
		}
	}
	return null;
};