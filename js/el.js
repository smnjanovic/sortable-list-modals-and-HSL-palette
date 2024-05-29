/**
 * This element builder creates elements with their attributes based on css
 * creator string with as same rules as in css selector, but only focusing
 * on tag names, ids, classes and other exact attribute values, for Example:
 * 'p#unique.category1.category2[title=hidden description][style]'
 * creates a P element with id called 'unique', classes 'category1' and
 * 'category2', an attribute named 'title' with value 'hidden description' and
 * an empty attribute named style. 
 */
class El {
	#creator;
	#children;
	#ns;
	#map;
	#key;
	#rgx;

	/**
	 * Create a new storage of valid inputs necessary to build XML/HTML content.
	 * @param {String} creator - valid CSS creator (selector solely focusing on tags or attributes) used to create then setup Elements
	 * @param {Object} children - list of child elements of certain 
	 * @param {String} namespace
	 * @param {Map|undefined|null} elementMap
	 * @param {String} key
	 * @returns {El}
	 */
	constructor(creator, children, namespace, elementMap, key) {
		const not = (it, cls) => (it ?? null) !== null && !(it instanceof cls);
		const notStr = it => not(it, String) && typeof it !== "string";
		if (notStr(creator) || (creator ?? null) === null)
			throw new Error("Argument 1 must be a valid css creator! It is "
					+ "documented in this class' description.");
		if (not(children, Array) || (children && children.some(it => !this.#verifyChild(it))))
			throw new Error('Argument 2 should be an array one of the following: '
				+ 'null, undefined, a type of string or an instance of String, '
				+ 'Text, Element or ElementBuilder! Invalid record at '
				+ `${children?.indexOf(it => !this.#verifyChild(it))}.`);
		if (notStr(namespace))
			throw new Error("Argument 3 must be a link to a namespace, if defined!");
		if (not(elementMap, Map))
			throw new Error("Argument 4 should be an instanceof Map, if not null.");
		if (notStr(key))
			throw new Error("Argument 5, if not null, must be an instance "
					+ "of String representing a key under which this element"
					+ "will become accessible.");
		if (elementMap && !key)
			throw new Error("Argument 5 must be defined if the argument 4 is!");
		this.#creator = creator;
		this.#ns = namespace ?? null;
		this.#map = elementMap ?? null;
		this.#key = key ?? null;
		this.#children = children ?? [];
		this.#rgx = {
			tag: "\\w+",
			id: "\\#[a-zA-Z-][a-zA-Z0-9-]*",
			cls: "\\.[a-zA-Z-][a-zA-Z0-9-]*",
			atr: "\\[[^=\\]]+(=?[^\\]]*)\\]"
		};
		this.#rgx.full = new RegExp([
			`^((${this.#rgx.tag})?)`,
			`((${this.#rgx.id})?)`,
			`((${this.#rgx.cls})*)`,
			`((${this.#rgx.atr})*)$`
		].join(""));
		if (!this.#creator.match(this.#rgx.full))
			throw new Error(`Argument 1 contains an invalid css creator! ( '${this.#creator}' )`);
	}

	#not(it, cls) {
		return (it ?? null) !== null && !(it instanceof cls);
	}

	#notStr(it) {
		return this.#not(it, String) && typeof it !== "string";
	}

	#verifyChild(child) {
		return (child ?? null) === null || typeof child === "string" || child instanceof String
			|| child instanceof Text || child instanceof Element || child instanceof El;
	}

	#fromString() {
		const match = this.#creator.match(this.#rgx.full);
		const pieces = {
			tag: match[1]?.match(new RegExp(this.#rgx.tag, "g"))?.pop() ?? "div",
			id: match[3]?.match(new RegExp(this.#rgx.id, "g"))?.map(it => it.substr(1)).pop(),
			cls: match[5]?.match(new RegExp(this.#rgx.cls, "g"))?.map(it => it.substr(1)),
			atr: match[7]?.match(new RegExp(this.#rgx.atr, "g"))?.map(it => {
				const split = it.substr(1, it.length - 2).split("=");
				return [split.shift(), split.join("=")];
			})
		};
		const tag = typeof this.#ns === "string"
			? document.createElementNS(this.#ns, pieces.tag)
			: document.createElement(pieces.tag);
		if (pieces.id) tag.id = pieces.id;
		if (pieces.cls) tag.classList.add(...pieces.cls);
		if (pieces.atr) pieces.atr.forEach(arr => tag.setAttribute(arr[0], arr[1] ?? ""));
		return tag;
	}

	/**
	 * Builds DOM tree and inserts it into a parent Element at a certain position
	 * if such parent was defined.
	 * @param {Element} parent
	 * @param {Element} before
	 * @returns {Element}
	 */
	build(parent, before) {
		const element = this.#fromString(this.#creator, this.#ns);
		if (this.#not(parent, Element)) throw new Error("Argument 1 must be an instance of Element, if defined!");
		if (this.#not(before, Element)) throw new Error("Argument 2 must be an instance of Element, if defined!");
		parent?.insertBefore(element, before);
		this.#children.forEach(ch => {
			if (typeof ch === "string" || ch instanceof String)
				element.appendChild(document.createTextNode(`${ch}`));
			else if (ch instanceof Text || ch instanceof Element)
				element.appendChild(ch);
			else if (ch instanceof El)
				element.appendChild(ch.build());
		});
		if (this.#map !== null) this.#map.set(this.#key, element);
		return element;
	}
}