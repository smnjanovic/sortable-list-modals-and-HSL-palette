/* global Action */

/**
 * This is a general class that contains and manages an interactive list
 * of certain type of data, that can be added, removed, edited, sorted
 * or wiped out. What happens after these events occur may be
 * determined in its subclass.
 */
class SortableList {
	/**
	 * last ID
	 * @static
	 * @private
	 * @type Number
	 */
	static #ID = 0;
	/**
	 * A link to SVG namespace
	 * @static
	 * @private
	 * @type String
	 */
	static #SVG = 'http://www.w3.org/2000/svg';
	/**
	 * A unique id of this list container
	 * @private
	 * @type Number
	 */
	#id = ++SortableList.#ID;;
	/**
	 * A unique id of this list's container
	 * @private
	 * @type Number
	 */
	#name;
	/**
	 * DOM Element containing user interface to manage the list.
	 * @private
	 * @type Element
	 */
	#html;
	/**
	 * Parent element of the item elements.
	 * @private
	 * @type Element
	 */
	#body;
	/**
	 * Heading element containing title.
	 * @private
	 * @type Element
	 */
	#title;
	/**
	 * An actual list of data
	 * @private
	 * @type Array
	 */
	#list = [];
	/**
	 * List of possible actions related to the whole list
	 * @private
	 * @see {Action}
	 * @type Array
	 */
	#optionsList = [];
	/**
	 * List of possible actions related to a single list item
	 * @private
	 * @see {Action}
	 * @type Array
	 */
	#optionsItem = [];
	/**
	 * True, if list is allowed to be removed from HTML document by a user.
	 * @private
	 * @type Boolean
	 */
	#listDisposable = true;
	/**
	 * Old index of currently dragged item
	 * @private
	 * @type Number
	 */
	#dragged = -1;

	/**
	 * Provide a unique id of this instance's element id.
	 * @public
	 * @type String
	 */
	get id() { return `sl-${this.#id}`; }
	/**
	 * List length
	 * @public
	 * @type Number
	 */
	get length() { return this.#list.length; };
	/**
	 * Description of list options
	 * @protected
	 * @type String
	 */
	get listOptionsHint_() { return "Možnosti zoznamu"; }
	/**
	 * Description of list disposal
	 * @protected
	 * @type String
	 */
	get listDisposalHint_() { return "Skryť zoznam"; }
	/**
	 * Description of item options
	 * @protected
	 * @type String
	 */
	get itemOptionsHint_() { return "Možnosti položky"; }
	/**
	 * Description of item removal
	 * @protected
	 * @type String
	 */
	get itemRemovalHint_() { return "Odstrániť položku"; }
	/**
	 * Description of item inserting
	 * @protected
	 * @type String
	 */
	get itemInsertionHint_() { return "Pridať položku"; }
	/**
	 * Description of item dragging
	 * @protected
	 * @type String
	 */
	get itemMoveHint_() { return "Presunúť položku"; }
	/**
	 * Description of list clearing
	 * @protected
	 * @type String
	 */
	get listClearingHint_() { return "Vyprázdniť"; }
	/**
	 * Modal title related to permanent list item removal
	 * @protected
	 * @type String
	 */
	get itemRemovalTitle_() { return "Odstrániť položku"; };
	/**
	 * Modal message related to permanent list item removal
	 * @protected
	 * @type String
	 */
	get itemRemovalMessage_() { return "Akcia je nevratná. Chcete pokračovať?"; };
	/**
	 * Modal confirm button text related to permanent list item removal
	 * @protected
	 * @type String
	 */
	get itemRemovalYes_() { return "Áno"; };
	/**
	 * Modal cancel button text related to permanent list item removal
	 * @protected
	 * @type String
	 */
	get itemRemovalNo_() { return "Nie"; };
	/**
	 * Modal title related to permanent list wipe out
	 * @protected
	 * @type String
	 */
	get listRemovalTitle_() { return "Vyprázdniť zoznam položiek!"; };
	/**
	 * Modal message related to permanent list wipe out
	 * @protected
	 * @type String
	 */
	get listRemovalMessage_() { return "Akcia je nevratná. Chcete pokračovať?"; };
	/**
	 * Modal confirm button text related to permanent list wipe out
	 * @protected
	 * @type String
	 */
	get listRemovalYes_() { return "Áno"; };
	/**
	 * Modal cancel button text related to permanent list wipe out
	 * @protected
	 * @type String
	 */
	get listRemovalNo_() { return "Nie"; };
	/**	 * Modal title related to permanent list disposal
	 * @protected
	 * @type String
	 */
	get listDisposalTitle_() { return "Zatvoriť!"; };
	/**
	 * Modal warning related to unauthorized list disposal
	 * @protected
	 * @type String
	 */
	get listDisposalDenied_() { return "Odstránenie zoznamu nie je povolené!"; };

	/**
	 * @public
	 * @class Create a sortable list container.
	 * @param {String} name - Name of the list.
	 */
	constructor(name) {
		this.#name = name;
	}

	#stringOrThrow(input) {
		if (input && ['function', 'object'].some(it => typeof input === it))
			throw new Error("Invalid type!");
		return `${input ?? ''}`;
	}

	/**
	 * Renames the list
	 * @param {String} title
	 */
	rename(title) {
		this.#title.innerText = title;
	}

	/**
	 * Replace the old list with a new one.
	 * @public
	 * @param {Object} items - A new list of arguments forming a new list
	 * replacing the old one. Each item must be a valid due to 
	 * {SortableList.validateItem_} method.
	 * @throws Error if there is at least one invalid item among arguments.
	 */
	setData(...items) {
		if (!this.#html) this.#html = this.buildContainer_();
		if (items.every(it => this.validateItem_(it))) {
			this.#list = [...items];
			while (this.#body.firstElementChild) this.#body.removeChild(this.#body.firstElementChild);
			for (let item of items) this.#body.appendChild(this.buildItem_(item));
			this.onDatasetChanged_([...items]);
		}
		else throw new Error("Some items are invalid!");
	}

	/**
	 * Determine whether the list is is allowed to be removed from the document.
	 * Data will not be lost as long as this instance exists.
	 * @public
	 * @param {Boolean} disposable - True, if the list is allowed to be removed.
	 */
	setDisposableList(disposable) {
		this.#listDisposable = disposable;
		if (this.#html) this.#html.dataset.disposable = disposable;
	}

	/**
	 * Replace current set of Actions related to the entire list.
	 * @public
	 * @param {Action} actions
	 */
	setListOptions(...actions) {
		if (actions.every(it => it instanceof Action)) {
			this.#optionsList = [...actions];
			if (this.#html) this.#html.dataset.optionsList = this.#optionsList.length > 0;
		} else throw new Error("Some arguments are invalid! An instance of Action is required!");
	}

	/**
	 * Replace current set of Actions related to a single list item.
	 * @public
	 * @param {Action} actions
	 */
	setItemOptions(...actions) {
		if (actions.every(it => it instanceof Action)) {
			this.#optionsItem = [...actions];
			if (this.#html) this.#html.dataset.optionsItem = this.#optionsItem.length > 0;
		} else throw new Error("Some arguments are invalid! An instance of Action is required!");
	}

	/**
	 * Insert sortable list into a html document
	 * @public
	 * @param {Element} parent
	 * @param {Element} before
	 */
	setAsChild(parent, before) {
		if (!this.#html) this.#html = this.buildContainer_();
		parent.insertBefore(this.#html, before);
	}

	/**
	 * It replaces old item at the specific position.
	 * @public
	 * @param {Number} pos
	 * @param {Object} item - replacement item
	 */
	updateItem(pos, item) {
		if (0 <= pos && pos < this.length) {
			if (!this.#html) this.#html = this.buildContainer_();
			this.onUpdate_(pos, item);
			this.onDatasetChanged_([...this.#list]);
		} else throw new Error("Inserting failed! Index out of bounds!");
	}

	/**
	 * Create HTML element containing the entire interactive list
	 * @protected
	 * @returns {Element}
	 */
	buildContainer_() {
		const map = new Map();
		const OPT = 'OPT';
		const DEL = 'DEL';
		const ADD = 'ADD';
		const CLR = 'CLR';
		const BODY = 'BODY';
		const TITLE = 'TITLE';
		const container = new El(`#${this.id}.sortable-list`, [
			new El('.sortable-header', [
				new El('.sortable-list-title', [
					new El('h3', [this.#name], null, map, TITLE)
				]),
				new El('.sortable-list-actions', [
					new El(`.sortable-list-options[title=${this.listOptionsHint_}]`, [
						new El('svg[viewBox=0 0 24 48][width=12][height=24]', [
							new El('g[fill=inherit][stroke=none]', [
								new El(`ellipse[rx=5][ry=4][cx=12][cy=11]`, null, SortableList.#SVG),
								new El(`ellipse[rx=5][ry=4][cx=12][cy=24]`, null, SortableList.#SVG),
								new El(`ellipse[rx=5][ry=4][cx=12][cy=37]`, null, SortableList.#SVG)
							], SortableList.#SVG)
						], SortableList.#SVG)
					], null, map, OPT),
					new El(`.sortable-list-remove[title=${this.listDisposalHint_}]`, [
						new El('svg[viewBox=0 0 48 48][width=24][height=24]', [
							new El('g[fill=none][stroke=inherit][stroke-width=6][stroke-linecap=round]', [
								new El('path[d=M12,12 l24,24 m0,-24 l-24,24]', null, SortableList.#SVG)
							], SortableList.#SVG)
						], SortableList.#SVG)
					], null, map, DEL)
				])
			]),
			new El('.sortable-body', null, null, map, BODY),
			new El('.sortable-footer', [
				new El(`.sortable-add[title=${this.itemInsertionHint_}]`, [
					new El('svg[viewBox=0 0 48 48][width=32][height=32]', [
						new El('g[fill=none][stroke=inherit][stroke-width=6][stroke-linecap=round]', [
							new El('path[d=M12,24 h24 m-12,-12 v24]', null, SortableList.#SVG)
						], SortableList.#SVG)
					], SortableList.#SVG)
				], null, map, ADD),
				new El(`.sortable-clear[title=${this.listClearingHint_}]`, [
					new El('svg[viewBox=0 0 48 48][width=32][height=32]', [
						new El('g[stroke=none][fill=inherit]', [
							new El('path[d=M39.5,9 A1 1 45 0 1 42,12.5 L31,21 '
									+ 'L35,26 C36.25,28 36.25,28 33,32 L18,13.5 '
									+ 'C22.75,11 22.75,11 24,12 L28.5,17.5 Z]',
									null, SortableList.#SVG),
							new El('path[d=M17.5,15 L5,20 L24,43 L31,32 Z]', null, SortableList.#SVG)
						], SortableList.#SVG)
					], SortableList.#SVG)
				], null, map, CLR)
			])
		]).build();
		container.dataset.disposable = this.#listDisposable;
		container.dataset.optionsList = this.#optionsList.length > 0;
		container.dataset.optionsItem = this.#optionsItem.length > 0;

		this.#body = map.get(BODY);
		this.#title = map.get(TITLE);
		map.get(OPT).addEventListener("click", e => new ContextMenu(...this.#optionsList).show(this.format_(this.#title?.innerText ?? ''), e.x, e.y));
		map.get(DEL).addEventListener("click", () => {
			if (this.#listDisposable) container.parentNode?.removeChild(container);
			else new ModalAlert(this.listDisposalTitle_, this.listDisposalDenied_).show();
		});
		map.get(ADD).addEventListener("click", () => this.onCreateInsertModal_(newItem => {
			const pos = this.getInsertDefaultPosition_();
			if (0 <= pos && pos <= this.length) {
				this.onInsert_(pos, newItem);
				this.onDatasetChanged_([...this.#list]);
			} else throw new Error("Inserting failed! Index out of bounds!");
		}).show());
		map.get(CLR).addEventListener("click", () => new ModalConfirm(
			this.listRemovalTitle_, this.listRemovalMessage_, it => {
				if (it) {
					this.onClear_();
					this.onDatasetChanged_([...this.#list]);
				}
			}, this.listRemovalYes_, this.listRemovalNo_).show());

		return container;
	}

	/**
	 * Create HTML element containing data of a specific item
	 * @protected
	 * @param {Object} item
	 * @returns {Node}
	 */
	buildItem_(item) {
		const DRG = 'DRG';
		const OPT = 'OPT';
		const DEL = 'DEL';
		const map = new Map();
		const node = new El('.sortable-item', [
			new El('.sortable-item-dragzone', [
				new El('svg[viewBox=0 0 48 48][width=42][height=42]', [
					new El('g[fill=none][stroke=inherit][stroke-width=5][stroke-linecap=round]', [
						new El('path[d=M12,11 h24 m0,13 h-24 m0,13 h24]', null, SortableList.#SVG)
					], SortableList.#SVG)
				], SortableList.#SVG)
			], null, map, DRG),
			new El('.sortable-item-label', [ this.format_(item) ]),
			new El('.sortable-item-options', [
				new El('svg[viewBox=0 0 24 48][width=12][height=24]', [
					new El('g[fill=inherit][stroke=none]', [
						new El('ellipse[rx=5][ry=4][cx=12][cy=11]', null, SortableList.#SVG),
						new El('ellipse[rx=5][ry=4][cx=12][cy=24]', null, SortableList.#SVG),
						new El('ellipse[rx=5][ry=4][cx=12][cy=37]', null, SortableList.#SVG)
					], SortableList.#SVG)
				], SortableList.#SVG)
			], null, map, OPT),
			new El('.sortable-item-remove', [
				new El('svg[viewBox=0 0 48 48][width=24][height=24]', [
					new El('g[fill=none][stroke=inherit][stroke-width=6][stroke-linecap=round]', [
						new El('path[d=M12,12 l24,24 m0,-24 l-24,24]', null, SortableList.#SVG)
					], SortableList.#SVG)
				], SortableList.#SVG)
			], null, map, DEL)
		]).build();
		
		map.get(DRG).addEventListener("mouseenter", () => node.setAttribute("draggable", "true"));
		map.get(DRG).addEventListener("mouseleave", () => node.setAttribute("draggable", "false"));
		map.get(OPT).addEventListener("click", e => new ContextMenu(...this.#optionsList).show(this.format_(item), e.x, e.y, item));
		map.get(DEL).addEventListener("click", () => new ModalConfirm(
			this.itemRemovalTitle_, this.itemRemovalMessage_, it => {
				if (it) {
					const pos = this.#list.indexOf(item);
					if (0 <= pos && pos < this.length) {
						this.onDelete_(pos);
						this.onDatasetChanged_([...this.#list]);
					} else throw new Error("Deleting failed! Index out of bounds!");
				}
			}, this.itemRemovalYes_, this.itemRemovalNo_).show());

		node.addEventListener("dragstart", () => {
			this.#dragged = this.#list.indexOf(item);
			node.style.opacity = "0.4";
		});
		node.addEventListener("dragend", () => {
			node.style.opacity = null;
			node.setAttribute("draggable", "false");
		});
		node.addEventListener("dragover", e => {
			e.preventDefault();
			this.#withDragDrop(item, (drag, drop) => node.style.backgroundImage = 
					`linear-gradient(${180 * (drag > drop)}deg, var(--contrast) 5px, transparent 6px)`);
		});
		node.addEventListener("dragleave", () => node.style.backgroundImage = null);
		node.addEventListener("drop", e => {
			e.preventDefault();
			node.style.backgroundImage = null;
			this.#withDragDrop(item, (drag, drop) => {
				if (drag < 0 || drag >= this.length) throw new Error("Moving failed! Old index out of bounds!");
				if (drop < 0 || drop >= this.length) throw new Error("Moving failed! New index out of bounds!");
				this.onMove_(drag, drop);
				this.onDatasetChanged_([...this.#list]);
			});
			this.#dragged = -1;
		});
		return node;
	}

	/**
	 * Trigger a callback only when dragging an item over another exiting
	 * item of the same list.
	 * @private
	 * @param {type} dropped - item of dragged item element
	 * @param {type} fn - execute when moving an item to a different position
	 * is possible. Function gets called with indexes of a dragged item and
	 * a dropzone item in such order.
	 */
	#withDragDrop(dropped, fn) {
		const drag = this.#dragged;
		const drop = this.#list.indexOf(dropped);
		if (drag | drop > -1 && drag !== drop) fn(drag, drop);
	}

	/**
	 * Verify a validity of an item!
	 * @protected
	 * @param {Object} item
	 * @returns {Boolean}
	 */
	validateItem_(item) {
		return item === item;
	}

	/**
	 * Transform a valid item into string
	 * @protected
	 * @param {Object} item
	 * @returns {String}
	 */
	format_(item) {
		if (this.validateItem_(item)) return `${item}`;
		throw new Error("Cannot format an invalid sortable item!");
	}

	/**
	 * New items are inserted at the end of the list by default.
	 * @protected
	 * @returns {Number} Default position where to insert the new item.
	 */
	getInsertDefaultPosition_() {
		return this.length;
	}

	/**
	 * Create a new modal box requesting data to generate a new item.
	 * @protected
	 * @param {Function} insertFn - Pick up the modal generated value as
	 * an argument and add it to the list.
	 * @returns {Modal}
	 */
	onCreateInsertModal_(insertFn) {
		return new ModalPrompt("Pridať", "Nazvite položku!", insertFn, null, "Názov položky");
	}

	/**
	 * Trigger when inserting a verified item to the list.
	 * Always call super when overriding this method!
	 * @protected
	 * @param {Number} pos
	 * @param {Object} item
	 */
	onInsert_(pos, item) {
		this.#list.splice(pos, 0, item);
		this.#body.insertBefore(this.buildItem_(item), this.#body.children[pos]);
	}

	/**
	 * Trigger when an item is replaced by another valid item.
	 * Always call super when overriding this method!
	 * @protected
	 * @param {Number} pos
	 * @param {Object} item
	 * @returns {undefined}
	 */
	onUpdate_(pos, item) {
		this.#list.splice(pos, 1, item);
		this.#body.removeChild(this.#body.children[pos]);
		this.#body.insertBefore(this.buildItem_(item), this.#body.children[pos]);
	}

	/**
	 * Trigger when rearranging the order of items of the list.
	 * Always call super when overriding this method!
	 * @protected
	 * @param {type} oldPos
	 * @param {type} newPos
	 * @returns {undefined}
	 */
	onMove_(oldPos, newPos) {
		this.#list.splice(newPos, 0, ...this.#list.splice(oldPos, 1));
		const dragged = this.#body.children[oldPos];
		const dropped = this.#body.children[newPos + (newPos > oldPos)];
		this.#body.insertBefore(dragged, dropped);
	}

	/**
	 * Trigger when deleting an item from list. 
	 * Always call super when overriding this method!
	 * @protected
	 * @param {type} pos
	 * @returns {undefined}
	 */
	onDelete_(pos) {
		this.#list.splice(pos, 1);
		this.#body.removeChild(this.#body.children[pos]);
	}

	/**
	 * Trigger when emptying the list.
	 * Always call super when overriding this method!
	 * @protected
	 * @returns {undefined}
	 */
	onClear_() {
		this.#list.length = 0;
		while (this.#body.firstElementChild)
			this.#body.removeChild(this.#body.firstElementChild);
	}

	/**
	 * Always trigger after data set is modified or changed.
	 * @protected
	 * @param {Array} items
	 */
	onDatasetChanged_(items) {
		//does nothing, but prevents editor from showing warnings I can't
		//turn off! Oh well, it doesn't hinder the performace anyway.
		(()=>{})(items);
	}
}