class Action {
	#alias;
	#commit;
	get alias() { return this.#alias; }
	get commit() { return this.#commit; }
	
	/**
	 * 
	 * @param {String} label - Action description.
	 * @param {Function} action - Action method with an optional number and type of arguments
	 * @returns {Action}
	 */
	constructor(label, action) {
		this.#alias = label;
		this.#commit = action;
	}
}