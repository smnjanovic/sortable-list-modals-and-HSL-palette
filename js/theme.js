/**
 * This class determines the hue, saturation and luminance
 */
class Theme {
	#hue;
	#sat;
	#lum;
	
	/**
	 * @public
	 * @class
	 * of a monochromatic color scheme. It's only efficient in collaboration
	 * with stylesheet 'palette.css'.
	 * @param {Number} hue Hue
	 * @param {Number} sat Saturation
	 * @param {Number} lum Luminance
	 */
	constructor(hue, sat, lum) {
		this.#hue = hue;
		this.#sat = sat;
		this.#lum = lum;
	}

	/**
	 * Provides css declarator rules that influence the visual
	 * design of the selected elements and elements nested within.
	 * @type String
	 */
	get style() {
		return `--hue: ${this.#hue}; --sat: ${this.#sat}; --lum: ${this.#lum};`;
	}
}