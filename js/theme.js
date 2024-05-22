class Theme {
	#hue;
	#sat;
	#lum;
	
	/**
	 * 
	 * @param {Number} hue
	 * @param {Number} sat
	 * @param {Number} lum
	 * @returns {Theme}
	 */
	constructor(hue, sat, lum) {
		this.#hue = hue;
		this.#sat = sat;
		this.#lum = lum;
	}

	get style() {
		return `--hue: ${this.#hue}; --sat: ${this.#sat}; --lum: ${this.#lum};`;
	}
}