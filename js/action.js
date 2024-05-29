/**
 * This class stores a method and its descriptive name (alias).
 * Meant to be used as an input for creating functional buttons.
 */
class Action {
	#alias;
	#commit;

	/**
	 * Access the method description.
	 * @type String
	 */
	get alias() { return this.#alias; }

	/**
	 * Access the method.
	 * @type Function
	 */
	get commit() { return this.#commit; }
	
	/**
	 * @class Create a method with an alias.
	 * @param {String} alias - Action description.
	 * @param {Function} method - Action method.
	 */
	constructor(alias, method) {
		this.#alias = alias;
		this.#commit = method;
	}
}