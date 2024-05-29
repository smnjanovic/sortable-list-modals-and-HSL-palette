/* global Action */

/**
 * Instance of this class is used for creating and showing a context menu
 * providing user with a choice of action.
 */
class ContextMenu {
	static #CLOSE = 'CLOSE';
	static #ITEM = 'ITEM';
	#element; #actions; #x; #y;

	/**
	 * @class Create new context menu
	 * @public
	 * @param {Action} actions - fill menu with a set of possible actions
	 */
	constructor(...actions) {
		this.setActions(...actions);
	}

	/**
	 * Replace old set of actions with a new one
	 * @public
	 * @param {Action} actions
	 */
	setActions(...actions) {
		if (actions.some(it => !(it instanceof Action)))
			throw new Error("All arguments must be instances of Action!");
		this.#actions = actions;
	}

	/**
	 * Context menu pops up with a title and certain position passing a certain
	 * set of arguments into triggered action functions.
	 * @param {String} title
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Action} params
	 */
	show(title, x, y, ...params) {
		this.#x = x;
		this.#y = y;
		const map = new Map();
		const CLOSE = 'CLOSE';
		const TITLE = 'TITLE';
		const BODY = 'ITEM';
		const resize = () => this.#resize();
		const dispose = () => {
			document.body.removeEventListener('mousedown', dispose);
			window.removeEventListener('resize', resize);
			this.#dispose();
		};

		this.#element = new El("#context-menu", [
			new El(".close[title=Skryť]", null, null, map, CLOSE),
			new El(".title", [ title ], null, map, TITLE),
			new El("ul.actions", this.#actions.map((a, i) => new El('li.action',
					[ a.alias ], null, map, `${ContextMenu.#ITEM}-${i}`)))
		]).build(document.body);

		document.body.addEventListener('mousedown', dispose);
		this.#element.addEventListener('mousedown', e => e.stopPropagation());
		map.get(CLOSE).addEventListener('click', () => this.#dispose());
		map.get(TITLE).setAttribute("title", title);
		for (let index in this.#actions) {
			const item = map.get(`${ContextMenu.#ITEM}-${index}`);
			item.addEventListener('click', () => {
				this.#actions[index].commit(...params);
				dispose();
			});
			item.setAttribute("title", this.#actions[index].alias);
		}
		this.#resize();
		window.addEventListener('resize', resize);
	}

	#dispose() {
		if (this.#element) {
			this.#element.parentNode?.removeChild(this.#element);
			this.#element = null;
			this.#x = null;
			this.#y = null;
		}
	}

	#resize() {
		if (this.#element) {
			const style = this.#element.style;
			style.left = style.top = style.right = style.bottom = null;
			const l = 20;
			const t = 20;
			const r = window.innerWidth - 20;
			const b = window.innerHeight - 20;
			const w = this.#element.clientWidth;
			const h = this.#element.clientHeight;
			const x = this.#x > r ? r : this.#x;
			const y = this.#y + h > b ? b - h : this.#y;
			const fitsLeft = x - w > l;
			const fitsRight = x + w < r;
			const fitsTop = y - h > t;
			const fitsBottom = y + h < b;
			

			// fits corner
			if ((fitsLeft || fitsRight) && (fitsTop || fitsBottom)) {
				style.left = `${fitsLeft ? x - w : x}px`;
				style.top = `${y}px`;
				style.right = style.bottom = null;
			}
			// fits screen
			else if (r - l > w && b - t > h) {
				style.left = `${Math.max(l, x - w)}px`;
				style.top = `${Math.min(y, b - h)}px`;
				style.right = style.bottom = null;
			}
			// too big
			else {
				style.left = style.top = style.right = style.bottom = 0;
			}
		}
	}
}