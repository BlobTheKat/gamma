/// <reference path="./gamma.d.ts" />
export {}
declare global{
	namespace GammaInstance{ type font = typeof GammaInstance.font; }
	namespace Gamma{
		function font(): GammaInstance.font
		function font(o: object): asserts o is GammaInstance.font
	}
	namespace GammaInstance.font{
	namespace Shader{
		/** MSDF Shader, default shader used by `RichText` and expected by `Font.draw()` */
		const MSDF: Shader
		/**
		 * A specialized Shader constructor with the exact same signature, except the following differences within the shader source code:
		 * - A new function `float field();` returns the current raw SDF value in [0,1]
		 *    - Always returns 1 for line passes
		 * - A new parameter `scale` encodes the scale and offset used to transform raw SDF values into alpha values, as specified by the text pass.
		 *    - Default behavior would look something like `clamp( (field()-.5 + scale.x) * scale.y + .5, 0., 1.)`
		 * - Other parameters (the "values" of the text/line pass) are accessed via `value0`, `value1`, ... instead of `param0`, `param1`, ...
		 *    - The first value is `value0`, which is the color by convention
		 * @param glsl The shader's source code. See `Shader()`
		 * @param options.params Shader arguments. See `Shader()`
		 * @param options.defaults Argument default values. See `Shader()`
		 * @param options.uniforms Shader uniforms. See `Shader()`
		 * @param options.uniformDefaults Uniform default values. See `Shader()`
		 * @param options.outputs Shader output type. See `Shader()`
		 * @param options.intFrac Integer texture share. See `Shader()`
		 */
		function sdf(glsl: string, options?: { params?: number | number[], defaults?: number | number[], uniforms?: number | number[], uniformDefaults?: number | number[], output?: number, intFrac?: number }): Shader & { sdf: true }
	}
	/**
	 * Create a BreakToken. Group many `BreakToken`s into an array (a "token class") to fully specify how a piece of text should be tokenized, which defines how and where text can be broken by the `RichText.break()` function. 
	 * @param regex A regular expression defining what this token matches, e.g /\w+/y to match a word. Should have the `y` flag and no `g` flag (Otherwise, they will be added/removed for you, which will come at a small but potentially unnecessary cost)
	 * 
	 * If a string is passed, the pattern will match any amount of those characters. For example, `"0123456789"` will match any number of digits
	 * 
	 * @param type The token type, which is one of
	 *    - `BreakToken.NORMAL` If token takes up 50% or more of the current line, break it up into two. Otherwise, put it all on the next line.
	 *    - `BreakToken.NEVER_BREAK` Token cannot be broken up. Always put it on the next line
	 *    - `BreakToken.ALWAYS_BREAK` Token should always be broken into two or more wherever appropriate.
	 *    - `BreakToken.OVERFLOW` Token should overflow the line and never create a new line
	 *    - `BreakToken.VANISH` Token is not rendered at all when it surpasses the end of a line
	 *    - `BreakToken.TRUNCATE` Like VANISH, but only the characters that surpass the end of a line are not rendered
	 *    - `BreakToken.SQUISH` Token is squished (scaled X) to prevent overflowing.
	 *    - `BreakToken.SQUISH_BREAK` Token is squished by up to 50%, beyond which it will be broken into 2 instead. Provided as a more sane alternative to SQUISH
	 * 
	 * Additionally, the type can be OR'd with any number of the following flags. These always have an effect, even when the token doesn't overflow a line
	 *    - `BreakToken.WRAP_AFTER` Always create a new line after this token. Useful to make the newline character `\n` actually work.
	 *    - `BreakToken.WRAP_BEFORE` Always create a new line before this token. Can be used as an alternative to WRAP_AFTER in specific cases, or combined to make this token always stand on its own line
	 *    - `BreakToken.INVISIBLE` This token is never rendered
	 * @param separator A separator to be inserted when the token is broken (if it can be broken). For example, a `-` is often inserted to indicate a word was split across to the next line
	 * @param next Next token class. If this token is matched, the next part of the string will use a different set of BreakTokens to tokenize. You can create multiple arrays of `BreakToken`s that point to each other in this fashion to create far more complex context-sensitive tokenization. Leave unspecified to not make use of this feature (the next part of the string to be tokenized will use the exact same token class as this one)
	 */
	type BreakToken = {}
	function BreakToken(pattern: RegExp | string, type: number, separator: string, next?: BreakToken[]): BreakToken

	namespace BreakToken{
		/** See `BreakToken()` */ const NORMAL = 0
		/** See `BreakToken()` */ const NEVER_BREAK = 1
		/** See `BreakToken()` */ const ALWAYS_BREAK = 2
		/** See `BreakToken()` */ const OVERFLOW = 3
		/** See `BreakToken()` */ const VANISH = 4
		/** See `BreakToken()` */ const TRUNCATE = 5
		/** See `BreakToken()` */ const SQUISH = 6
		/** See `BreakToken()` */ const SQUISH_BREAK = 7
		/** See `BreakToken()` */ const WRAP_AFTER = 8
		/** See `BreakToken()` */ const WRAP_BEFORE = 16
		/** See `BreakToken()` */ const INVISIBLE = 32
	}

	//const defaultSet = [BreakToken(/\r\n?|\n/y, BreakToken.WRAP_AFTER | BreakToken.INVISIBLE, ''), BreakToken(/[$£"+]?[\w'-]+[,.!?:;"^%€*]?/yi, BreakToken.NORMAL, '-'), BreakToken(/[ \t]+/y, BreakToken.VANISH)]

	/**
	 * Create a `RichText` object, which offers many functions for working with text of many styles, for example, measuring width, line-breaking, curved text, multipass (such as text shadows), text with other custom components inside, measuring where a point (such as a mouse click) lands, etc...
	 * 
	 * Make sure to take a good look at the methods and properties available on the object to know what's possible.
	 * @param font The font to use. If not specified, the default font is `null`, which means text won't be displayed
	 */
	function RichText(font?: Font | null): RichText

	interface RichText{
		/** Return a sub-RichText, which, much like sub-contexts and sub-textures, points to the same ultimate rich text but holds separate parameters used for adding new segments. This can be used to pass a handle to the RichText to another function without worrying about it modifying the parameters of the current object */
		sub(): RichText
		/** Reset all parameters, optionally setting a font to reset to (otherwise will reset to null) */
		reset(font?: Font | null): void
		/** The font to be used when adding new text segments. Default: as passed to the constructor, or null (must be set or else no text is displayed) */
		font: Font | null
		/** The shader to be used when adding new text segments. See `Shader.sdf()`. Default: `Shader.MSDF` */
		shader: Shader
		/**
		 * Text scaling for new text segments. By default, text is **1 unit** in height, so this value defaults to `1`
		 * 
		 * Exactly what "height" means is usually defined by the font. Depending on what you are trying to achieve, you may want to specify a custom size for each font as they may appear to be have an undesirable size for the use case.
		 * 
		 * "**1 unit**" represents 1 unit in the coordinate space that you eventually draw the text in
		 */
		scale: number
		/**
		 * Text y-offset for new text segments, which is scaled according to `scale` (i.e, to achieve a "superscript" or "subscript" effect, the y-offset should have the same value irrespective of what the text's current scale is, and the resulting y offset will be appropriately scaled.
		 * 
		 * To achieve an offset that is the same literal size irrespective of scale, you should divide the y-offset by the current scale)
		 */
		yOffset: number
		/**
		 * Text stretch for new text segments. The default value of `1` means text is rendered at its default aspect ratio (no stretch). Higher values stretch the text horizontally (without changing the height).
		 */
		stretch: number
		/** Text skew X factor for new text segments. Skew is measured as a ratio, not in degrees. This is consistent with `Drawable.skew()` */
		skew: number
		/** Shorthand for `stretch * scale`, the effective width modifier after all scaling. Can also be assigned to calculate the correct `stretch` for the current `scale` */
		letterWidth: number
		/** Extra spacing, in units, between letters (for new text segments), which is added on top of the font's default spacing. Can be negative to bring letters closer together */
		letterSpacing: number
		/**
		 * Text curve used for new text segments. To achieve an "upwards" curve resembling an arc of radius _`r`_, use a curve value of _`1 / r`_. For a "downwards" curve, use _`-1 / r`_. A value of 0 means completely straight text (no curving).
		 * 
		 * All characters are rendered so that their start and end lie on the curve (respecting the font's baseline). This means small parts of some characters may lie on the wrong side of the curve. This is for the most part unavoidable without warping individual characters, which is beyond the scope of this feature.
		 * 
		 * Note that if a curve is too tight and a character cannot fit on it, the character will not follow the curve. Make sure to set a curve that is gentle enough for all characters to fit inside it (no characters should have an x advance greater than or equal to _`2*r`_)
		 */
		curve: number
		/**
		 * Whether to count the next text segments as part of the "original" text, for the purposes of `.length`, `.indexAt()`, and string positions passed to `.trim()`, `.slice()`, etc...
		 * 
		 * Default: `true`
		 * 
		 * Any text added while this value is `false` is essentially render-only and will behave as if it had a length of 0 for the purposes of the aforementioned methods.
		 * 
		 * To achieve the opposite effect (i.e text that is counted but not rendered), set this value to `true` and the `font` property to `null`
		 */
		index: boolean

		/**
		 * Scale the entire current RichText contents by a factor
		 * @param scaleAdv Whether to also scale "advance" segments (see `RichText.advance()`). Default: `true`
		 * @param scaleYOffsets Whether to also scale y-offsets appropriately (see `RichText.yOffset`). Default: `true`
		 */
		scaleBy(factor: number, scaleAdv?: boolean, scaleYOffsets?: boolean): void
		/**
		 * Offset the entire current RichText contents by a number of units
		 * @param scaleIrrespective Whether to change the offset in absolute units, and not affected by the scale at any point of the text. Default: `false`
		 */
		offsetBy(units: number, scaleIrrespective?: boolean): void
		/**
		 * Stretch the entire current RichText contents by a factor
		 * @param scaleAdv Whether to also stretch "advance" segments (see `RichText.advance()`). Default: `true`
		 * @param scaleSkew Whether to also stretch any skewing (see `RichText.skew`). Unless otherwise specified, stretching text does not in any way change their skew factor as skewing is applied after stretching. Default: `false`
		 */
		stretchBy(factor: number, scaleAdv?: boolean, scaleSkew?: boolean): void
		/** Skew the entire current RichText contents by a ratio */
		skewBy(ratio: number): void
		/** Add or take away a specific amount of letter-spacing for the entire current RichText contents */
		spaceBy(units: number): void
		/** Curve the entire current RichText contents by an amount (the value is effectively added to any `curve` value used while building the contents) */
		curveBy(amount: number): void

		/**
		 * Add a text pass to be used by new text segments. Text passes can be used to make effects like shadows or glow effects
		 * @param order The z-order of this text pass. Higher value = in front, lower values = behind. The order for the default text pass is `0`. You can also specify the order of an existing text/line pass to replace it in one step.
		 * @param x x-offset for this text pass. Default: 0
		 * @param y y-offset for this text pass. Default: 0
		 * @param values The "values" to be passed to the shader. The default shader expects one optional value: the color (a `vec4`). If not specified, white is used.
		 * @param offset The SDF offset for making bold or thin text. This offset is specified relative to the font height (i.e a value of 0.01 will make text appear approximately 0.01 units thicker at normal font size)
		 * @param spread The SDF spread for making blurred. This offset is specified relative to the font height (i.e a value of 0.02 will make text blur across approximately 0.02 units at normal font size). The offset is specified at precisely the middle of this gradient. Pass -1 to use a blur specifically chosen to mimic antialiasing.
		 */
		addTextPass(order: number, values: any[], x?: number, y?: number, offset?: number, spread?: number): void
		/**
		 * Add a line pass to be used by new text segments. Line passes can be used to make effects like underline, strikethrough, or highlighting
		 * @param order The z-order of this text pass. Higher value = in front, lower values = behind. The order for the default text pass is `0`. You can also specify the order of an existing text/line pass to replace it in one step.
		 * @param y0 The bottom edge of this line pass. Default: 0
		 * @param h The height of this line pass. Default: 1
		 * @param values The "values" to be passed to the shader. The default shader expects one optional value: the color (a `vec4`). If not specified, white is used.
		 */
		addLinePass(order: number, values: any[], y0?: number, h?: number): void
		/** Remove the text/line pass at a given z-order for new text segments. See `RichText.addTextPass()`/`RichText.addLinePass` for more info */
		delPass(order: number): void

		/** Insert a text pass for all current `RichText` content. See `RichText.addTextPass()` for more info */
		insertTextPass(order: number, values: any[], x?: number, y?: number, offset?: number, spread?: number): void
		/** Insert a line pass for all current `RichText` content. See `RichText.addLinePass()` for more info */
		insertLinePass(order: number, values: any[], y0?: number, h?: number): void
		/** Remove the text/line pass at a given z-order for all current `RichText` content. See `RichText.delPass()` and `RichText.addTextPass()`/`RichText.addLinePass` for more info */
		removePass(order: number): void

		/**
		 * Inserts a new gap, essentially advancing a number of units forward, leaving a gap in between. This will also break font kerning at the location of this gap
		 */
		advance(gap: number): void

		/**
		 * Returns a RichText with identical contents to this one. Unlike `RichText.sub()` text added to or modified in this RichText will not be reflected in the copy.
		 */
		copy(): RichText

		/**
		 * Returns a RichText with the contents of this one starting from and optionally ending at the indices specified.
		 * 
		 * See `RichText.index` for how indices and lengths are counted.
		 */
		slice(start: number, end?: number): RichText
		/**
		 * Trim this RichText, removing all contents after the index specified.
		 * 
		 * See `RichText.index` for how indices and lengths are counted.
		 */
		trim(i: number): void
		/**
		 * Concatenate another RichText onto this one, modifying `this`
		 */
		concat(other: RichText): void
		/**
		 * The length of the current RichText, counted in UTF-16 character codes, just like plain JS strings
		 * 
		 * See `RichText.index` for how indices and lengths are counted.
		 */
		length: number

		/**
		 * The rendered width of the current RichText in units.
		 * 
		 * This value is cached: after it has been calculated once, it will not be calculated again until `this` is modified in any way.
		 */
		readonly width: number

		add(text: string): void
		addCb(render: (ctx: Drawable, font: Font) => void, w?: number): void

		/**
		 * Find at which index in the original string a point (given by an offset in units) lies on. See `RichText.index` for more on how indices and lengths are counted.
		 * 
		 * @param threshold The threshold, between 0 and 1, beyond which a position within a character will be counted as the next character. If the index will be used as an insertion position, e.g when building an interactive text editor, and converting mouse click position to a cursor position, a value of `0.5` is most natural, as it will select the insert position immediately after or before the character depending on where within the character the click occured. A value of 1 will always return the index of the character the point lies on (i.e the insertion point immediately before the character).
		 */
		indexAt(x: number, threshold?: number): number
		/**
		 * Draw the `RichText` to a drawable context. The context's shader is set for you and by the time the function returns, the context has been transformed to be at the end of the rendered text, with no scaling or skew. If you do not want the context to be modified make sure to pass a sub-context using `Drawable.sub()`
		 */
		draw(ctx: Drawable): void

		/**
		 * 
		 * @param widths The maximum line width(s), used to determine when to break.
		 * - If a number is passed, this is treated as the constant maximum line width
		 * - If an array of numbers is passed, they are treated as the maximum line widths for each line. Any lines beyond the length of this array will use the last element of the array
		 * - If a function is passed, it will be called once for every line to calculate the maximum width. The first argument is the line number (starting from 0), and the second is a mutable `MeasurementOffsets` object which can be modified per-line (see more below)
		 * @param tokenClass Token class controlling tokenization and breaking rules. See `BreakToken()`. If not specified, a reasonable default class is used.
		 * @param offsets An object which defines "offsets" that are applied to the text, modifying how width is calculated. This can be used to break the text "as-if" it had a different scale, letter spacing, or curve (the three relevant metrics defining text measurement). This is provided in case you intend to break the text first and apply some per-line styling modifications later, so as not to break everything.
		 */
		break(widths: number | number[] | ((lineNumber: number, offsets: MeasurementOffsets) => number), tokenClass?: BreakToken[], offsets?: MeasurementOffsets): RichText[]
		/**
		 * Returns the original text, free of any styling annotation, represented by this `RichText`.
		 * 
		 * See `RichText.index` for more on how the "original text" is counted.
		 */
		toString(): string
	}
	/** See `RichText.break()` */
	type MeasurementOffsets = {scale: number, letterSpacing: number, curve: number}
	type GlyphDescriptor = {x: number, y: number, w: number, h: number, width: number, tex: Texture}

	class Font{
		/**
		 * The range factor (aka normalized distance range) for this font. Represents the range of the signed distance field relative the the font's height. Also used internally to calculate proper offset/spread values (see `RichText.addTextPass()`)
		 * 
		 * This value represents the total range permitted by `offset`/`spread` values. For example, a rangeFactor of 0.2 means you can use values that stay inside [-0.1, 0.1], however, you may want to leave a bit of padding as the SDF quality often degrades close to the limits
		 */
		rangeFactor: number
		/** Font ascend, i.e how much out of a font height of 1 is above the baseline. Descent would then be equal to `1-ascent`. For a normal font, a typical value would look something like 0.75 */
		ascend: number

		/** Mark the font as Ready, resolving any Promises made from this font (e.g via `await`) */
		done(): void
		/** Mark the font as Broken, rejecting any Promises made from this font (e.g via `await`) */
		error(err?: any): void

		/**
		 * Add a character to this font
		 * @param char The character code point. Pass `-1` to modify the default glyph (the one used for unknown codepoints, conventionally a square outline or a boxed question mark)
		 * @param width Number of units to advance from the starting point after the glyph is drawn (usually equal to its width plus a little bit of letter spacing)
		 * @param tex The MSDF texture to use for this glyph. Consider combining a whole font into a single atlas and using sub-textures of that atlas for performance. Can be null to specify an invisible character such as a space or tab.
		 * @param x Left edge of where to draw this glyph relative to the starting point
		 * @param y Bottom edge of where to draw this glyph relative to the starting point
		 * @param w Width of the drawn glyph
		 * @param h Height of the drawn glyph
		 * 
		 * @returns The internal object used to describe the glyph, or null if the glyph was removed (`width == 0 && tex == null && char != -1`)
		 */
		setChar(char: number, width: number, tex: Texture, x: number, y: number, w: number, h: number): GlyphDescriptor
		setChar(char: number, width?: number, tex?: null): GlyphDescriptor | null
		setChar(char: number, glyph: GlyphDescriptor): GlyphDescriptor

		/**
		 * Get an existing characters's GlyphDescriptor
		 * @param char The character code point. Pass `-1` to get the default glyph (the one used for unknown codepoints, conventionally a square outline or a boxed question mark)
		 * @returns The GlyphDescriptor, or null if the character was not defined for this font. Note that the default (-1) glyph is always defined.
		 */
		getChar(char: number): GlyphDescriptor | null

		/** Get the advance value of a specific character. See `Font.setChar()`. If the character is not defined, the value of the default character is used instead */
		getWidth(char: string | number): number

		/**
		 * Add a kerning adjustment for a pair of characters
		 * @example
		 * ```js
		 * // All of the following are identical and valid
		 * font.setKerning('A', 'V', -.025)
		 * font.setKerning(0x41, 0x56, -.025)
		 * font.setKerning('AV', -.025)
		 * ```
		 */
		setKerning(a: number, b: number, adjustment: number): void
		setKerning(a: string, b: string, adjustment: number): void
		setKerning(pair: string, adjustment: number): void

		/**
		 * Get a kerning adjustment for a pair of characters
		 * @example
		 * ```js
		 * // All of the following are identical and valid
		 * console.assert(font.getKerning('A', 'V') < 0, "A and V should have some kerning!")
		 * console.assert(font.getKerning(0x41, 0x56) < 0, "A and V should have some kerning!")
		 * console.assert(font.getKerning('AV') < 0, "A and V should have some kerning!")
		 * ```
		 */
		getKerning(a: number, b: number): number
		getKerning(a: string, b: string): number
		getKerning(pair: string): number

		/**
		 * Load an MSDF font spat out by [Chlumsky's MSDF atlas generator](https://github.com/Chlumsky/msdf-atlas-gen)
		 * 
		 * The font is automatically loaded and resolved, so you can immediately `await` it without doing anything else
		 * @param src The path/url to load the `.json` file from
		 * @param atlas The atlas' path/url, relative to the `.json` file. Default: `./atlas.png`
		 * 
		 * A chlumsky font can be generated a little something like
		 * ```sh
		 * msdf-atlas-gen -font my_font.ttf -json my_font/index.json -imageout my_font/atlas.png -size 64 -pxrange 8
		 * ```
		 * where `msdf-atlas-gen` can usually be installed from your package manager, or by compiling and installing the project at the above github repository.
		 * `pxrange` (The pixel range) affects the `rangeFactor` value. Higher = more blur / font weights possible
		 */
		chlumsky(src: string, atlas?: string): Font
		/**
		 * Load an MSDF font in the popular BMFont format (specifically JSON, such as spat out by [this tool](https://msdf-bmfont.donmccurdy.com/))
		 * 
		 * The font is automatically loaded and resolved, so you can immediately `await` it without doing anything else
		 * 
		 * > **Important Note**: Unfortunately, due to multiple design limitations of BMFont, fonts loaded from this format may not always have very accurate metrics, the quality of the generated MSDF may not be as good, or fonts may fail to load altogether. In more or less every case, the **Chlumsky** format is preferred. See `Font.chlumsky()`
		 * @param src The path/url to load the `.json` file from
		 * @param baselineOffset An offset added to correct the font's baseline value. Please, _please_, consider using the Chlumsky format.
		 */
		bmfont(src: string, baselineOffset?: number): Font
		/**
		 * Draw some text using this font. Unlike with `RichText`, you must set the shader yourself before calling (e.g `ctx.shader = Shader.MSDF`)
		 * 
		 * By the time the function returns, the context has been transformed to be at the end of the rendered text. If you do not want the context to be modified make sure to pass a sub-context using `Drawable.sub()`
		 * @param values The "values" to be passed to the shader. The default shader expects one optional value: the color (a `vec4`). If not specified, white is used.
		 * @param offset SDF offset. See `RichText.addTextPass()`
		 * @param spr SDF spread. See `RichText.addTextPass()`
		 * @param letterSpacing Additional spacing to apply between each pair of characters
		 * @param lastChar The previous character to the left (if any), used to apply kerning that crosses multiple blocks of text. Omit or pass `-1` if this is the first block of text or you do not wish for kerning to carry over
		 * @returns The last character drawn. If you are drawing more text and need kerning to apply across multiple `draw()`n blocks, pass this value to the next call to `.draw()`, as the `lastChar` argument
		 */
		draw(ctx: Drawable, text: string, values?: any[], offset?: number, spread?: number, letterSpacing?: number, lastChar?: number): number

		/**
		 * Measure the width of some text using this font.
		 * 
		 * @param letterSpacing Additional spacing to apply between each pair of characters when measuring
		 * @param lastChar The previous character to the left (if any), used to apply kerning that crosses multiple blocks of text. Omit or pass `-1` if this is the first block of text or you do not wish for kerning to carry over
		 */
		measure(text: string, letterSpacing?: number, lastChar?: number): number
	}
	/** Construct a new, empty font. See its methods for how to build your own font or import one. */
	function Font(): Font & Promise<Font>

	namespace Font{
		/**
		 * Load an MSDF font spat out by [Chlumsky's MSDF atlas generator](https://github.com/Chlumsky/msdf-atlas-gen)
		 * 
		 * The font is automatically loaded and resolved, so you can immediately `await` it without doing anything else
		 * @param src The path/url to load the `.json` file from
		 * @param atlas The atlas' path/url, relative to the `.json` file. Default: `./atlas.png`
		 * 
		 * A chlumsky font can be generated a little something like
		 * ```sh
		 * msdf-atlas-gen -font my_font.ttf -json my_font/index.json -imageout my_font/atlas.png -size 64 -pxrange 8
		 * ```
		 * `pxrange` (The pixel range) affects the `rangeFactor` value. Higher = more blur / font weights possible
		 */
		function chlumsky(src: string, atlas?: string): Font & Promise<Font>

		/**
		 * Load an MSDF font in the popular BMFont format (specifically JSON, such as spat out by [this tool](https://msdf-bmfont.donmccurdy.com/))
		 * 
		 * The font is automatically loaded and resolved, so you can immediately `await` it without doing anything else
		 * 
		 * > **Important Note**: Unfortunately, due to multiple design limitations of BMFont, fonts loaded from this format may not always have very accurate metrics, the quality of the generated MSDF may not be as good, or fonts may fail to load altogether. In more or less every case, the **Chlumsky** format is preferred. See `Font.chlumsky()`
		 * @param src The path/url to load the `.json` file from
		 * @param baselineOffset An offset added to correct the font's baseline value. Please, _please_, consider using the Chlumsky format.
		 */
		function bmfont(src: string, baselineOffset?: number): Font & Promise<Font>
	}
}
}