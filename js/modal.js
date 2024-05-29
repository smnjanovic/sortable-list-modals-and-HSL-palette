/**
 * Instance of this class creates and displays modal dialog box intended
 * for generating a result based on user's input. It contains a set of actions,
 * each bound to button that decide how to handle the received output.
 */
class Modal {
	/**
	 * Function gets triggered after modal was closed A.K.A action was chosen.
	 * @private
	 * @type Function
	 */
	#response;
	/**
	 * Element conceals the entire webpage and displays a modal dialog box.
	 * @private
	 * @type Element
	 */
	#modalBG;

	/**
	 * This element contains a form if necessary, otherwise it's empty.
	 * @protected
	 * @type Element.
	 */
	get content_() {
		return this.#modalBG.querySelector(".modal-form");
	};

	/**
	 * This element contains a list of mistakes and violations in the form
	 * @protected
	 * @type Element
	 */
	get errorContainer_() {
		return this.#modalBG.querySelector("ul.modal-errors");
	}

	/**
	 * @public
	 * @class
	 * @param {Theme} theme color - chosen color scheme, may be null or undefined
	 * @param {String} title - Short modal description
	 * @param {String} message - Longer modal description
	 * @param {Function} response - function gets triggered when action
	 * is chosen, result retrieved and passed to this method as an argument
	 * @param {Action} actions - set of actions that retrieve result
	 * and execute an algorithm based on the output
	 */
	constructor(theme, title, message, response, ...actions) {
		this.#response = response;
		const map = new Map();
		this.#modalBG = new El(`div.modal-bg[style=${theme?.style??''}]`, [
			new El('.modal-container', [
				new El('.modal-content', [
					new El('fieldset', [
						new El('legend', [ new El('h3.modal-title', [title]) ]),
						new El('p.modal-message', [message]),
						new El('.modal-form'),
						new El('ul.modal-errors')
					])
				]),
				new El('.modal-actions', actions.map((it, i) => {
					return new El('button[type=button]', [it.alias], null, map, `${i}`);
				}))
			])
		]).build();
		//this.#modalBG.style.backdropFilter = "blur(4px) saturate(50%) brightness(45%)";
		map.forEach((val, key) => val.addEventListener("click", () => actions[key - 0].commit(this)));
	}
	
	/**
	 * Creates an additional form necessary to acquire enough data
	 * to generate a valid output. Not necessarilly needed in every case.
	 * @protected
	 * @returns {Element|null} modal form
	 */
	buildContent_() {
		return null;
	}

	/**
	 * Check form inputs for mistakes or violations and list down the errors into an arrays.
	 * @protected
	 * @returns {Array} Array of error messages
	 */
	validateOutput_() {
		return [];
	}

	/**
	 * Check form inputs for mistakes or violations and visualize the errors into a list.
	 * @protected
	 */
	updateErrors_() {
		while (this.errorContainer_.firstElementChild)
			this.errorContainer_.removeChild(this.errorContainer_.firstElementChild);
		for (let error of this.validateOutput_())
			new El('li', [error]).build(this.errorContainer_);
	}

	/**
	 * Retrieves output from modal dialog inputs, if there are any.
	 * @protected
	 * @returns {Object} modal output
	 */
	getOutput_() {
		return undefined;
	}

	/**
	 * Visualize the modal dialog in the HTML document
	 * @public
	 */
	show() {
		const node = this.buildContent_();
		if (node instanceof Node) this.content_.appendChild(node);
		document.body.appendChild(this.#modalBG);
	}

	/**
	 * Hide the modal dialog from the HTML document
	 * @public
	 */
	dismiss() {
		while (this.content_.firstElementChild)
			this.content_.removeChild(this.content_.firstElementChild);
		const parent = this.#modalBG.parentNode;
		if (parent) parent.removeChild(this.#modalBG);
	}

	/**
	 * Respond to the computed result if there are no errors or violations in the form
	 * @public
	 * @param {type} result
	 */
	respond(result) {
		this.updateErrors_();
		if (this.errorContainer_.childElementCount === 0 && this.#response) {
			this.#response(result);
			this.dismiss();
		}
	}
}

/**
 * Modal dialog serves to causion the user about important matters.
 * It consists of a single action that returns no output.
 * @augments Modal
 */
class ModalAlert extends Modal {
	/**
	 * @public
	 * @class
	 * @param {String} title - short description of the modal
	 * @param {String} message - detailed message of the modal
	 */
	constructor(title, message) {
		super(new Theme(60, 100, 75), title, message, null, new Action("OK", it => it.dismiss()));
	}
}

/**
 * Modal dialog serves to offer user 2 options, commonly used as the last
 * turning point caution before performing irreversible action offering to
 * continue or stop or requesting confirmation from the user or any request
 * requiring only 1 out of 2 possible answers rated in Boolean values
 * returned as an output.
 * @augments Modal
 */
class ModalConfirm extends Modal {
	/**
	 * @public
	 * @class
	 * @param {String} title - short description of the modal
	 * @param {String} message - detailed message of the modal
	 * @param {Function} response - action performed based on 1 of 2
	 * results passed as an argument.
	 * @param {String} positive - positive response description
	 * @param {String} negative - negative response description
	 */
	constructor(title, message, response, positive = "Potvrdiť", negative = "Zrušiť") {
		super(new Theme(205, 90, 65), title, message, response,
				new Action(positive, it => it.respond(true)),
				new Action(negative, it => it.respond(false)));
	}
}

/**
 * Modal dialog requests the user to provide valid text input to process further.
 * Based on action chosen, response receives value typed  as string or undefined
 * as an argument.
 * @augments Modal
 */
class ModalPrompt extends Modal {
	/**
	 * Validate output composed of user's input in the modal dialog.
	 * @private
	 * @type Function|null
	 */
	#validate;
	/**
	 * Provides placeholder for input hinting what kind of information is expected
	 * @type String
	 */
	#hint;

	/**
	 * @public
	 * @class
	 * @param {String} title - short description of the modal
	 * @param {String} message - detailed message of the modal
	 * @param {Function} response - action performed based provided input.
	 * This response's expected argument is either String or undefined,
	 * based on Action chosen.
	 * @param {Function} validate - Validates string input passed as an argument.
	 * @param {String} hint - Placeholder hinting what kind of information is required.
	 */
	constructor(title, message, response, validate, hint = "") {
		super(new Theme(135, 100, 75), title, message, response,
				new Action("Potvrdiť", it => it.respond(it.getOutput_())),
				new Action("Zrušiť", it => it.dismiss()));
		this.#validate = validate ?? null;
		this.#hint = `${hint ?? ""}`;
	}

	buildContent_() {
		const input =  new El(`input.modal-prompt[type=text][placeholder=${this.#hint}]`).build();
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