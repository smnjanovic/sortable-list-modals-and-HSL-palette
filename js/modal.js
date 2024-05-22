class Modal {
	#response;
	#modalBG;

	/**
	 * 
	 * @type Node Vlastný html obsah v dialógovom okne
	 */
	get content_() {
		return this.#modalBG.querySelector(".modal-form");
	};

	/**
	 * 
	 * @type Node Zoznam chýb vstupu
	 */
	get errorContainer_() {
		return this.#modalBG.querySelector("ul.modal-errors");
	}

	/**
	 * @param {Theme} theme color
	 * @param {String} title
	 * @param {String} message
	 * @param {Function} response
	 * @param {Action} actions if valid string, dismiss button is present
	 * @returns {Modal}
	 */
	constructor(theme, title, message, response, ...actions) {
		this.#response = response;

		this.#modalBG = el({
			[`div.modal-bg[style=${theme.style}]`]: [{
				".modal-container": [{
					".modal-content": [{
						fieldset: [
							{ legend: [{ "h3.modal-title": title }] },
							{ "p.modal-message": `${message}` },
							".modal-form", "ul.modal-errors"
						]
					}]
				}, {
					".modal-actions": actions.map(it => ({ "button[type=button]": it.alias }))
				}]
			}]
		});
		this.#modalBG.querySelectorAll(".modal-actions>button").forEach((btn, index) => {
			btn.addEventListener("click", () => actions[index].commit(this));
		});
		this.#modalBG.style.backdropFilter = "blur(4px) saturate(50%) brightness(45%)";
	}
	
	/**
	 * 
	 * @returns {Node} modal form
	 */
	buildContent_() {
		return null;
	}

	/**
	 * 
	 * @returns {Array} Array of error messages
	 */
	validateOutput_() {
		return [];
	}

	updateErrors_() {
		while (this.errorContainer_.firstElementChild)
			this.errorContainer_.removeChild(this.errorContainer_.firstElementChild);
		for (let error of this.validateOutput_())
			this.errorContainer_.appendChild(el({ li: error }));
	}

	/**
	 * 
	 * @returns {Object} modal output
	 */
	getOutput_() {
		return undefined;
	}



	show() {
		const node = this.buildContent_();
		if (node instanceof Node) this.content_.appendChild(node);
		document.body.appendChild(this.#modalBG);
	}

	dismiss() {
		while (this.content_.firstElementChild)
			this.content_.removeChild(this.content_.firstElementChild);
		const parent = this.#modalBG.parentNode;
		if (parent) parent.removeChild(this.#modalBG);
	}

	respond(result) {
		this.updateErrors_();
		if (this.errorContainer_.childElementCount === 0 && this.#response) {
			this.#response(result);
			this.dismiss();
		}
	}
}

class ModalAlert extends Modal {
	/**
	 * 
	 * @param {String} title Titulok
	 * @param {String} message Správa
	 * @returns {ModalAlert}
	 */
	constructor(title, message) {
		super(new Theme(60, 100, 75), title, message, null, new Action("OK", it => it.dismiss()));
	}
}

class ModalConfirm extends Modal {
	constructor(title, message, response, positive = "Potvrdiť", negative = "Zrušiť") {
		super(new Theme(205, 90, 65), title, message, response,
				new Action(positive, it => it.respond(true)),
				new Action(negative, it => it.respond(false)));
	}
}

class ModalPrompt extends Modal {
	#validate;
	#hint;

	/**
	 * 
	 * @param {String} title
	 * @param {String} message
	 * @param {Function} response
	 * @param {Function} validate
	 * @param {String} hint
	 * @returns {ModalPrompt}
	 */
	constructor(title, message, response, validate, hint = "") {
		super(new Theme(135, 100, 75), title, message, response,
				new Action("Potvrdiť", it => it.respond(it.getOutput_())),
				new Action("Zrušiť", it => it.dismiss()));
		this.#validate = validate;
		this.#hint = `${hint}`;
	}

	buildContent_() {
		const input =  el(`input.modal-prompt[type=text][placeholder=${this.#hint}]`);
		input.addEventListener("input", () => this.updateErrors_());
		return input;
	}

	getOutput_() {
		return this.content_.firstElementChild.value;
	}

	validateOutput_() {
		return this.#validate ? this.#validate(this.getOutput_()) : [];
	}
}