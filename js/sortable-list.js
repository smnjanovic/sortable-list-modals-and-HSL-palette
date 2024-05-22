/* global Action */

class SortableList {
	static #ID = 0;
	static #SVG = 'http://www.w3.org/2000/svg';
	static get DRAG_INDEX() { return 'DRAG_INDEX'; };
	static get DRAG_LIST() { return 'DRAG_LIST'; };
	#id = ++SortableList.#ID;;
	#name;
	#format;
	#html;
	#list = [];
	#optionsList = [];
	#optionsItem = [];
	#disposableList = true;
	#disposableItems = true;
	#dragged = -1;

	get id() { return `sl-${this.#id}`; }
	get length() { return this.#list.length; };

	get itemRemovalTitle_() { return "Odstránenie položky"; };
	get itemRemovalMessage_() { return "Akcia je nevratná. Chcete pokračovať?"; };
	get itemRemovalYes_() { return "Vymazať"; };
	get itemRemovalNo_() { return "Späť"; };
	get itemRemovalDenied_() { return "Odstránenie tejto položky nie je povolené!"; };

	get listRemovalTitle_() { return "Vyprázdnenie zoznamu položiek!"; };
	get listRemovalMessage_() { return "Akcia je nevratná. Chcete pokračovať?"; };
	get listRemovalYes_() { return "Áno"; };
	get listRemovalNo_() { return "Nie"; };
	
	get listDisposalTitle_() { return "Vyprázdnenie zoznamu položiek!"; };
	get listDisposalMessage_() { return "Tento zoznam bude odstránený z obsahu stránky!"; };
	get listDisposalYes_() { return "Áno"; };
	get listDisposalNo_() { return "Nie"; };
	get listDisposalDenied_() { return "Odstránenie zoznamu nie je povolené!"; };

	/**
	 * 
	 * @param {String} name
	 * @returns {SortableList}
	 */
	constructor(name) {
		this.#name = name;
		this.#html = this.buildContainer_();
	}

	/**
	 * sets new data
	 * @param {Object} items
	 * @returns {undefined}
	 */
	setData(...items) {
		if (items.every(it => this.validateItem_(it))) {
			this.#list = [...items];
			while (this.#body.firstElementChild) this.#body.removeChild(this.#body.firstElementChild);
			for (let item of items) this.#body.appendChild(this.buildItem_(item));
			this.onDatasetChanged_([...items]);
		}
		else throw new Error("Some items are invalid!");
	}

	setDisposableList(disposable) {
		this.#disposableList = disposable;
		this.#html.dataset.disposableList = disposable;
	}

	setDisposableItems(disposable) {
		this.#disposableItems = disposable;
		this.#html.dataset.disposableItems = disposable;
	}

	/**
	 * 
	 * @param {Action} options
	 * @returns {undefined}
	 */
	setListOptions(...options) {
		if (options.every(it => it instanceof Action)) {
			this.#optionsList = [...options];
			this.#html.dataset.optionsList = this.#optionsList.length > 0;
		} else throw new Error("Some arguments are invalid! An instance of Action is required!");
	}

	/**
	 * 
	 * @param {Action} options
	 * @returns {undefined}
	 */
	setItemOptions(...options) {
		if (options.every(it => it instanceof Action)) {
			this.#optionsItem = [...options];
			this.#html.dataset.optionsItem = this.#optionsItem.length > 0;
		} else throw new Error("Some arguments are invalid! An instance of Action is required!");
	}

	/**
	 * inserts sortable list into a html element
	 * @param {Element} parent
	 * @param {Element} before
	 * @returns {undefined}
	 */
	setAsChild(parent, before) {
		parent.insertBefore(this.#html, before);
	}

	/**
	 * 
	 * @param {Number} pos
	 * @param {Object} item
	 * @returns {undefined}
	 */
	updateItem(pos, item) {
		if (0 <= pos && pos < this.length) {
			this.onUpdate_(pos, item);
			this.onDatasetChanged_([...this.#list]);
		} else throw new Error("Inserting failed! Index out of bounds!");
	}

	buildContainer_() {
		const container = el({
			[`#${this.id}.sortable-list`] : [{
				'.sortable-header' : [{
					".sortable-list-title": [{ h3: this.#name }]
				}, {
					".sortable-list-actions": [{
						'.sortable-list-options': [el({
							"svg[viewBox=0 0 24 48][width=12][height=24]" : [{
								"g[fill=inherit][stroke=none]": [11, 24, 37].map(it => `ellipse[rx=5][ry=4][cx=12][cy=${it}]`)
							}]
						}, SortableList.#SVG)]
					}, {
						'.sortable-list-remove': [el({
							"svg[viewBox=0 0 48 48][width=24][height=24]" : [{
								"g[fill=none][stroke=inherit][stroke-width=6][stroke-linecap=round]": [
									"path[d=M12,12 l24,24 m0,-24 l-24,24]"
								]
							}]
						}, SortableList.#SVG)]
					}]
				}]
			}, {
				'.sortable-body': []
			}, {
				'.sortable-footer' : [{
					'.sortable-add': [el({
						"svg[viewBox=0 0 48 48][width=32][height=32]" : [{
							"g[fill=none][stroke=inherit][stroke-width=6][stroke-linecap=round]": [
								"path[d=M12,24 h24 m-12,-12 v24]"
							]
						}]
					}, SortableList.#SVG)]
				}, {
					'.sortable-clear': [el({
						"svg[viewBox=0 0 48 48][width=32][height=32]" : [{
							"g[stroke=none][fill=inherit]": [
								"path[d=M39.5,9 A1 1 45 0 1 42,12.5 L31,21 L35,26 "
									+ "C36.25,28 36.25,28 33,32 L18,13.5 "
									+ "C22.75,11 22.75,11 24,12 L28.5,17.5 Z]",
								"path[d=M17.5,15 L5,20 L24,43 L31,32 Z]"
							]
						}]
					}, SortableList.#SVG)]
				}]
			}]
		});
		container.dataset.disposableList = this.#disposableList;
		container.dataset.disposableItems = this.#disposableItems;
		container.dataset.optionsList = this.#optionsList.length > 0;
		container.dataset.optionsItem = this.#optionsItem.length > 0;

		const options = container.querySelector(".sortable-list-options");
		const disposal = container.querySelector(".sortable-list-remove");
		const newItem = container.querySelector(".sortable-add");
		const cleanup = container.querySelector(".sortable-clear");

		options.addEventListener("click", e => this.#showOptions(e.x, e.y, -1, ...this.#optionsList));

		disposal.addEventListener("click", () => {
			const modal = this.#disposableList
				? new ModalConfirm(
					this.listDisposalTitle_, this.listDisposalMessage_,
					it => { if (it) container.parentNode?.removeChild(container); },
					this.listDisposalYes_, this.listDisposalNo_
				) : new ModalAlert(this.listDisposalTitle_, this.listDisposalDenied_);
			modal.show();
		});

		newItem.addEventListener("click", () => this.onCreateInsertModal_(newItem => {
			const pos = this.getInsertDefaultPosition_();
			if (0 <= pos && pos <= this.length) {
				this.onInsert_(pos, newItem);
				this.onDatasetChanged_([...this.#list]);
			} else throw new Error("Inserting failed! Index out of bounds!");
		}).show());

		cleanup.addEventListener("click", () => new ModalConfirm(
				this.listRemovalTitle_, this.listRemovalMessage_, it => {
					if (it) {
						this.onClear_();
						this.onDatasetChanged_([...this.#list]);
					}
				}, this.listRemovalYes_, this.listRemovalNo_).show());

		return container;
	}

	/**
	 * 
	 * @param {Any} item
	 * @returns {Node}
	 */
	buildItem_(item) {
		const node = el({
			'.sortable-item': [{
				'.sortable-item-dragzone': [el({
					"svg[viewBox=0 0 48 48][width=42][height=42]" : [{
						"g[fill=none][stroke=inherit][stroke-width=5][stroke-linecap=round]": [
							"path[d=M12,11 h24 m0,13 h-24 m0,13 h24]"
						]
					}]
				}, SortableList.#SVG)]
			}, {
				'.sortable-item-label': this.format_(item)
			}, {
				'.sortable-item-options': [el({
					"svg[viewBox=0 0 24 48][width=12][height=24]" : [{
						"g[fill=inherit][stroke=none]": [11, 24, 37].map(it => `ellipse[rx=5][ry=4][cx=12][cy=${it}]`)
					}]
				}, SortableList.#SVG)]
			}, {
				'.sortable-item-remove': [el({
					"svg[viewBox=0 0 48 48][width=24][height=24]" : [{
						"g[fill=none][stroke=inherit][stroke-width=6][stroke-linecap=round]": [
							"path[d=M12,12 l24,24 m0,-24 l-24,24]"
						]
					}]
				}, SortableList.#SVG)]
			}]
		});
		const dragzone = node.querySelector(".sortable-item-dragzone");
		dragzone.addEventListener("mouseenter", () => node.setAttribute("draggable", "true"));
		dragzone.addEventListener("mouseleave", () => node.setAttribute("draggable", "false"));
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
		const btnDel = node.querySelector(".sortable-item-remove");
		btnDel.addEventListener("click", () => {
			const index = this.#list.indexOf(node);
			const modal = this.#disposableItems
				? new ModalConfirm(
					this.itemRemovalTitle_, this.itemRemovalMessage_, it => {
						if (it) {
							const pos = this.#list.indexOf(item);
							if (0 <= pos && pos < this.length) {
								this.onDelete_(pos);
								this.onDatasetChanged_([...this.#list]);
							} else throw new Error("Deleting failed! Index out of bounds!");
						}
					},
					this.itemRemovalYes_, this.itemRemovalNo_
				) : new ModalAlert(this.itemRemovalTitle_, this.itemRemovalDenied_);
			modal.show();
		});
		const btnOpt = node.querySelector(".sortable-item-options");
		/* moznosti + skrytie nepotrebnych tlacitok (mozno pomocou dat elementu) */
		btnOpt.addEventListener("click", e => this.#showOptions(e.x, e.y, this.#list.indexOf(item), ...this.#optionsItem));
		return node;
	}

	get #body() { return this.#html.querySelector(".sortable-body"); }

	#withDragDrop(dropped, fn) {
		const drag = this.#dragged;
		const drop = this.#list.indexOf(dropped);
		if (drag | drop > -1 && drag !== drop) fn(drag, drop);
	}

	/**
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Object} index
	 * @param {Action} options
	 * @returns {undefined}
	 */
	#showOptions(x, y, index, ...options) {
		const dispose = () => {
			list.parentNode?.removeChild(list);
			document.body.removeEventListener("mousedown", dispose);
		};
		const list = el({ "ul#option-list": [...options, new Action("Zrušiť", () => dispose())].map(it => {
			const item = el({[`li${it.alias === "Zrušiť" ? ".small-screen" : ""}`]: it.alias});
			item.addEventListener("mousedown", e => e.stopPropagation());
			item.addEventListener("click", () => {
				it.commit(index);
				dispose();
			});
			return item;
		})});
		document.body.appendChild(list);
		document.body.addEventListener("mousedown", dispose);
		const left = Math.max(0, Math.min(x + list.clientWidth, window.innerWidth - 20) - list.clientWidth);
		const top = Math.max(0, Math.min(y + list.clientHeight, window.innerHeight - 20) - list.clientHeight);
		list.style.left = `${left}px`;
		list.style.top = `${top}px`;
	}

	/**
	 * Overí sa, či je vkladaný objekt platný!
	 * @param {Object} item
	 * @returns {Boolean}
	 */
	validateItem_(item) {
		return item === item;
	}

	/**
	 * Verifies item and transforms it into text
	 * @param {Object} item
	 * @returns {String}
	 */
	format_(item) {
		if (!this.validateItem_(item)) throw new Error("Cannot format an invalid sortable item!");
		return `${item}`;
	}

	onLoadList_(list) {
		this.#list = list;
		while (this.#body.firstElementChild) this.#body.removeChild(this.#body.firstElementChild);
		for (let item of list) this.#body.appendChild(this.buildItem_(item));
	}

	/**
	 * New items are inserted at the end of the list by default.
	 * @returns {Number} Default position where to insert the new item.
	 */
	getInsertDefaultPosition_() {
		return this.length;
	}

	/**
	 * Create a new modal box in which you'll generate a new item. Method
	 * insertFn picks up the created value and attempts to insert as new item.
	 * @param {Function} insertFn - expects a newly created item as the one and only argument
	 * @returns {Modal}
	 */
	onCreateInsertModal_(insertFn) {
		return new ModalPrompt("Pridať", "Nazvite položku!", insertFn, null, "Názov položky");
	}

	/**
	 * Vloženie nového prvku
	 * @param {Number} pos
	 * @param {Object} item
	 * @returns {undefined}
	 */
	onInsert_(pos, item) {
		this.#list.splice(pos, 0, item);
		this.#body.insertBefore(this.buildItem_(item), this.#body.children[pos]);
	}

	onUpdate_(pos, item) {
		this.#list.splice(pos, 1, item);
		this.#body.insertBefore(this.buildItem_(item), this.#body.children[pos]);
	}

	onMove_(oldPos, newPos) {
		this.#list.splice(newPos, 0, ...this.#list.splice(oldPos, 1));
		const dragged = this.#body.children[oldPos];
		const dropped = this.#body.children[newPos + (newPos > oldPos)];
		this.#body.insertBefore(dragged, dropped);
	}

	onDelete_(pos) {
		this.#list.splice(pos, 1);
		this.#body.removeChild(this.#body.children[pos]);
	}

	onClear_() {
		this.#list.length = 0;
		while (this.#body.firstElementChild)
			this.#body.removeChild(this.#body.firstElementChild);
	}

	/**
	 * 
	 * @param {Array} items
	 * @returns {undefined}
	 */
	onDatasetChanged_(items) {
		(()=>{})(items); //does nothing, but editor doesn't show any warnings neither. You may remove this line if it bothers you.
	}
}