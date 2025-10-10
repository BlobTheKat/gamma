export {}
declare global{
	interface Float16Array{}

	function Gamma(canvas?: HTMLCanvasElement, _?: undefined, flags?: number): GammaInstance
	function Gamma(canvas: HTMLCanvasElement | undefined, o: object, flags?: number): asserts o is GammaInstance
	namespace Gamma{
		/**
		 * Options used internally for createImageBitmap(). Do not modify this unless you absolutely know what you are doing
		 */
		const bitmapOpts: ImageBitmapOptions
		/**
		 * Allocate a stencil buffer for IF_SET/IF_UNSET/SET/UNSET functionality. When this flag is disabled, the stencil buffer will not be allocated and will behave as if it is always 0.
		 */
		const STENCIL: number
		/**
		 * Allocate an alpha channel. When this flag is disabled, the default draw target acts like an RGB texture and some blending tricks no longer work.
		 */
		const ALPHA_CHANNEL: number
		/**
		 * Assumes the values drawn are premultiplied, which is standard for the blending model used by Gamma
		 */
		const PREMULTIPLIED_ALPHA: number
		/**
		 * Automatically clear the canvas before each frame, which allows for an optimization to avoid copying the entire canvas contents each frame
		 */
		const AUTO_CLEAR_BUFFER: number
		/**
		 * Use implementation-defined antialiasing for the default draw target. This antialiasing is _usually_ MSAA but may be faked on low end devices or not used at all (e.g retina display where the browser has decided that aliasing is not noticeable enough at default scale to justify the performance cost). This antialiasing is never edge smoothing, which means it should not cause artifacts to appear and "break" your render (e.g gaps between tiled sprites)
		 */
		const MSAA: number
	}
	interface Math{
		/**
		 * `PI2 == PI*2`, also known as tau.
		 * 
		 * This is the ratio of the circumference of a circle to its radius.
		 */
		readonly PI2: number
	}
	/**
	 * Polyfill of `setImmediate`
	 * 
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/setImmediate)
	 */
	function setImmediate(handler: TimerHandler, ...arguments: any[]): number
	/**
	 * Polyfill of `clearImmediate`
	 * 
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/clearImmediate)
	 */
	function clearImmediate(id: number | undefined): void

	/** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
	const E: number
	/** The natural logarithm of 10. */
	const LN10: number
	/** The natural logarithm of 2. */
	const LN2: number
	/** The base-2 logarithm of e. */
	const LOG2E: number
	/** The base-10 logarithm of e. */
	const LOG10E: number
	/** Pi. This is the ratio of the circumference of a circle to its diameter. */
	const PI: number
	/**
	 * `PI2 == PI*2`, also known as tau.
	 * 
	 * This is the ratio of the circumference of a circle to its radius.
	 */
	const PI2: number
	/** The square root of 0.5, or, equivalently, one divided by the square root of 2. */
	const SQRT1_2: number
	/** The square root of 2. */
	const SQRT2: number
	/**
	 * Returns the absolute value of a number (the value without regard to whether it is positive or negative).
	 * For example, the absolute value of -5 is the same as the absolute value of 5.
	 * @param x A numeric expression for which the absolute value is needed.
	 */
	function abs(x: number): number
	/**
	 * Returns the arc cosine (or inverse cosine) of a number.
	 * @param x A numeric expression.
	 */
	function acos(x: number): number
	/**
	 * Returns the arcsine of a number.
	 * @param x A numeric expression.
	 */
	function asin(x: number): number
	/**
	 * Returns the arctangent of a number.
	 * @param x A numeric expression for which the arctangent is needed.
	 */
	function atan(x: number): number
	/**
	 * Returns the angle (in radians) between the X axis and the line going through both the origin and the given point.
	 * @param y A numeric expression representing the cartesian y-coordinate.
	 * @param x A numeric expression representing the cartesian x-coordinate.
	 */
	function atan2(y: number, x: number): number
	/**
	 * Returns the smallest integer greater than or equal to its numeric argument.
	 * @param x A numeric expression.
	 */
	function ceil(x: number): number
	/**
	 * Returns the cosine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function cos(x: number): number
	/**
	 * Returns e (the base of natural logarithms) raised to a power.
	 * @param x A numeric expression representing the power of e.
	 */
	function exp(x: number): number
	/**
	 * Returns the greatest integer less than or equal to its numeric argument.
	 * @param x A numeric expression.
	 */
	function floor(x: number): number
	/**
	 * Returns the natural logarithm (base e) of a number.
	 * @param x A numeric expression.
	 */
	function log(x: number): number
	/**
	 * Returns the larger of a set of supplied numeric expressions.
	 * @param values Numeric expressions to be evaluated.
	 */
	function max(...values: number[]): number
	/**
	 * Returns the smaller of a set of supplied numeric expressions.
	 * @param values Numeric expressions to be evaluated.
	 */
	function min(...values: number[]): number
	/**
	 * Returns the value of a base expression taken to a specified power.
	 * @param x The base value of the expression.
	 * @param y The exponent value of the expression.
	 */
	function pow(x: number, y: number): number
	/** Returns a pseudorandom number between 0 and 1. */
	function random(): number
	/**
	 * Returns a supplied numeric expression rounded to the nearest integer.
	 * @param x The value to be rounded to the nearest integer.
	 */
	function round(x: number): number
	/**
	 * Returns the sine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function sin(x: number): number
	/**
	 * Returns the square root of a number.
	 * @param x A numeric expression.
	 */
	function sqrt(x: number): number
	/**
	 * Returns the tangent of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function tan(x: number): number

	/**
	 * Returns the number of leading zero bits in the 32-bit binary representation of a number.
	 * @param x A numeric expression.
	 */
	function clz32(x: number): number

	/**
	 * Returns the result of 32-bit multiplication of two numbers.
	 * @param x First number
	 * @param y Second number
	 */
	function imul(x: number, y: number): number

	/**
	 * Returns the sign of the x, indicating whether x is positive, negative or zero.
	 * @param x The numeric expression to test
	 */
	function sign(x: number): number

	/**
	 * Returns the base 10 logarithm of a number.
	 * @param x A numeric expression.
	 */
	function log10(x: number): number

	/**
	 * Returns the base 2 logarithm of a number.
	 * @param x A numeric expression.
	 */
	function log2(x: number): number

	/**
	 * Returns the natural logarithm of 1 + x.
	 * @param x A numeric expression.
	 */
	function log1p(x: number): number

	/**
	 * Returns the result of (e^x - 1), which is an implementation-dependent approximation to
	 * subtracting 1 from the exponential function of x (e raised to the power of x, where e
	 * is the base of the natural logarithms).
	 * @param x A numeric expression.
	 */
	function expm1(x: number): number

	/**
	 * Returns the hyperbolic cosine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function cosh(x: number): number

	/**
	 * Returns the hyperbolic sine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function sinh(x: number): number

	/**
	 * Returns the hyperbolic tangent of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function tanh(x: number): number

	/**
	 * Returns the inverse hyperbolic cosine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function acosh(x: number): number

	/**
	 * Returns the inverse hyperbolic sine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function asinh(x: number): number

	/**
	 * Returns the inverse hyperbolic tangent of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function atanh(x: number): number

	/**
	 * Returns the square root of the sum of squares of its arguments.
	 * @param values Values to compute the square root for.
	 *     If no arguments are passed, the result is +0.
	 *     If there is only one argument, the result is the absolute value.
	 *     If any argument is +Infinity or -Infinity, the result is +Infinity.
	 *     If any argument is NaN, the result is NaN.
	 *     If all arguments are either +0 or −0, the result is +0.
	 */
	function hypot(...values: number[]): number

	/**
	 * Returns the integral part of the a numeric expression, x, removing any fractional digits.
	 * If x is already an integer, the result is x.
	 * @param x A numeric expression.
	 */
	function trunc(x: number): number

	/**
	 * Returns the nearest single precision float representation of a number.
	 * @param x A numeric expression.
	 */
	function fround(x: number): number

	/**
	 * Returns an implementation-dependent approximation to the cube root of number.
	 * @param x A numeric expression.
	 */
	function cbrt(x: number): number

	type GammaInstance = typeof GammaInstance
namespace GammaInstance{
	/**
	 * The canvas element passed to Gamma(), or a new canvas element if none was provided
	 */
	const canvas: HTMLCanvasElement
	/**
	 * The backing WebGL2 context for this canvas
	 */
	const gl: WebGL2RenderingContext

	type vec2 = { x: number, y: number }
	/**
	 * Construct a 2-component vector, in the shape {x, y}
	 * @performance This function is very fast and usually inlined, however consider using numbers individually rather than constructing many vectors if performance is absolutely critical
	 */
	function vec2(x?: number, y?: number): vec2
	namespace vec2{
		function add(a: vec2, b: vec2 | number): vec2
		function multiply(a: vec2, b: vec2 | number): vec2
	}
	type vec3 = {x: number, y: number, z: number}
	/**
	 * Construct a 3-component vector, in the shape {x, y, z}
	 * @performance This function is very fast and usually inlined, however consider using numbers individually rather than constructing many vectors if performance is absolutely critical
	 */
	function vec3(x?: number, y?: number, z?: number): vec3
	namespace vec3{
		function add(a: vec3, b: vec3 | number): vec3
		function multiply(a: vec3, b: vec3 | number): vec3
	}
	type vec4 = {x: number, y: number, z: number, w: number}
	/**
	 * Construct a 4-component vector, in the shape {x, y, z, w}
	 * @performance This function is very fast and usually inlined, however consider using numbers individually rather than constructing many vectors if performance is absolutely critical
	 */
	function vec4(x?: number, y?: number, z?: number, w?: number): vec4
	namespace vec4{
		function add(a: vec4, b: vec4 | number): vec4
		function multiply(a: vec4, b: vec4 | number): vec4
	}
	
	enum Formats{
		/** Fixed-point 1-channel format, usually 8 bits, in the range [0,1] */ R,
		/** Fixed-point 2-channel format, usually 8 bits per channel, in the range [0,1] */ RG,
		/** Fixed-point 3-channel format, usually 8 bits per channel, in the range [0,1] */ RGB,
		/** Fixed-point 4-channel format, usually 8 bits per channel, in the range [0,1] */ RGBA,
		/**
		 * Fixed-point 3-channel format, with (R: 5, G: 6, B: 5) bits for respective channels. Values are decoded into the range [0,1]
		 * 
		 * Values are specified using 16 bit integers, with red packed into the highest bits, green in the middle, and blue lowest
		 */
		RGB565,
		/**
		 * Fixed-point 4-channel format, with (R: 5, G: 5, B: 5, A: 1) bits for respective channels. Values are decoded into the range [0,1]
		 * 
		 * Values are specified using 16 bit integers, with red packed into the highest bits, green in the middle, blue lower, and alpha lowest
		 * 
		 * It is recommended to use Uint16Array to avoid having to detect or deal with host endianness
		 */
		RGB5_A1,
		/**
		 * Floating-point 3-channel format, with (R: 11, G: 11, B: 10) bits for respective channels. Values are encoded as an IEEE floating point with:
		 * - No sign bit
		 * - 5 bit exponent with bias=15, just like half-precision floats
		 * - 5 or 6 mantissa bits
		 * 
		 * Exponent is always encoded in bits just above the mantissa (i.e `eeeeemmmmmm`). Red packed into the highest bits, green in the middle, blue lowest
		 * It is recommended to use Uint32Array/Int32Array to avoid having to detect or deal with host endianness
		 */
		R11F_G11F_B10F,
		/**
		 * Fixed-point 4-channel format, with (R: 10, G: 10, B: 10, A: 2) bits for respective channels. Values are decoded into the range [0,1]
		 * 
		 * Values are specified using 32 bit integers, with red packed into the highest bits, green in the middle, blue lower, and alpha lowest
		 * 
		 * It is recommended to use Uint32Array/Int32Array to avoid having to detect or deal with host endianness
		 */
		RGB10_A2,
		/**
		 * Fixed-point 4-channel format, with 4 bits per channels. Values are decoded into the range [0,1]
		 * 
		 * Values are specified using 16 bit integers, with red packed into the highest bits, green in the middle, blue lower, and alpha lowest
		 * 
		 * It is recommended to use Uint16Array to avoid having to detect or deal with host endianness
		 */
		RGBA4,
		/**
		 * Floating-point 3-channel format, with 9 bits per channels, and an additional 5 bit shared exponent
		 * 
		 * Values are specified using 32 bit integers, with red packed into the LOWEST bits (unlike other formats), green in the middle, blue higher, and the exponent highest
		 * 
		 * Colors are decoded for any given channel as `(channel_value / 512) * pow(2, exponent - 15)`. The exponent can then be used to mimic a **HDR**-like effect, efficiently encoding very bright or very dim colors without loss in precision
		 * 
		 * It is recommended to use Uint32Array/Int32Array to avoid having to detect or deal with host endianness
		 */
		RGB9_E5,
		/** Unsigned 1-channel 8-bit format */ R8,
		/** Unsigned 2-channel 8-bit-per-channel format */ RG8,
		/** Unsigned 3-channel 8-bit-per-channel format */ RGB8,
		/** Unsigned 4-channel 8-bit-per-channel format */ RGBA8,

		/** Unsigned 1-channel 16-bit format */ R16,
		/** Unsigned 2-channel 16-bit-per-channel format */ RG16,
		/** Unsigned 3-channel 16-bit-per-channel format */ RGB16,
		/** Unsigned 4-channel 16-bit-per-channel format */ RGBA16,

		/** Unsigned 1-channel 32-bit format */ R32,
		/** Unsigned 2-channel 32-bit-per-channel format */ RG32,
		/** Unsigned 3-channel 32-bit-per-channel format */ RGB32,
		/** Unsigned 4-channel 32-bit-per-channel format */ RGBA32,

		/** Half-float (16 bit) 1-channel format */ R16F,
		/** Half-float (16 bit) 2-channel format */ RG16F,
		/** Half-float (16 bit) 3-channel format */ RGB16F,
		/** Half-float (16 bit) 4-channel format */ RGBA16F,

		/** Float 1-channel format */ R32F,
		/** Float 2-channel format */ RG32F,
		/** Float 3-channel format */ RGB32F,
		/** Float 4-channel format */ RGBA32F,

		/** Half-float 1-channel format. All reads/writes are performed using normal (32 bit) floats */ R16F_32F,
		/** Half-float 2-channel format. All reads/writes are performed using normal (32 bit) floats */ RG16F_32F,
		/** Half-float 3-channel format. All reads/writes are performed using normal (32 bit) floats */ RGB16F_32F,
		/** Half-float 4-channel format. All reads/writes are performed using normal (32 bit) floats */ RGBA16F_32F,
	}

	/**
	 * Create a texture with specified dimensions, format, and mipmaps
	 * @param width Width of texture in pixels. Cannot be changed later
	 * @param height Height of texture in pixels. Cannot be changed later
	 * @param layers Number of layers in texture. Cannot be changed later. Default: 1 
	 * @param options Texture options. See the `Texture.options` property (property can be changed at any time)
	 * @param format Texture format. See `Formats`. Cannot be changed later. Default: `Formats.RGBA`
	 * @param mipmaps Number of mipmaps to allocate. Default: 1 (_"no mipmaps"_)
	 */
	function Texture(width: number, height: number, layers?: number, options?: number, format?: Formats, mipmaps?: number): Texture
	/** An image source from which to populate a Texture object. String values indicate a url that is `fetch()`ed on-demand */
	type ImageSource = string | ImageBitmap | Blob | ImageBitmapSource

	namespace Texture{
		/** Not all implementations support linear filtering (SMOOTH) for xxx32F textures. This boolean indicates if this kind of filtering is supported. If it is not, nearest-neighbor (pixelated) will be used instead for those texture types */
		const FILTER_32F: boolean

		/**
		 * The maximum texture width supported by the underlying hardware
		 * According to OpenGL ES Specs, this value is required to be at least 2048, however virtually all environments will support at least 4096. Support for > 4096 is not very common
		 */
		const MAX_WIDTH: number
		/**
		 * The maximum texture height supported by the underlying hardware
		 * According to OpenGL ES Specs, this value is required to be at least 2048, however virtually all environments will support at least 4096. Support for > 4096 is not very common
		 */
		const MAX_HEIGHT: number
		/**
		 * The maximum number of layers per texture supported by the underlying hardware
		 * According to OpenGL ES Specs, this value is required to be at least 256, and this is what most environments support. For more layers, you should instead use atlases (combining textures vertically/horizontally/both), or use multiple textures
		 */
		const MAX_LAYERS: number

		/** Maximum number of samples per pixels supported by the underlying hardware. Any value you pass to `Texture.MSAA()` higher than this will be clamped to this value */
		const MAX_MSAA: number

		interface MSAA{
			/** Width of MSAA surface in logical pixels */
			width: number
			/** Height of MSAA surface in logical pixels */
			height: number
			/** Number of samples per pixel for this surface */
			msaa: number
			/**
			 * Free the resources of this surface as soon as possible. It is invalid to use the MSAA object for anything beyond this point, the object should be "forgotten"
			 * Under the hood, the MSAA's data will be freed by the GPU once all draw operations using it have finished
			 * 
			 * @performance This method is relatively fast, however, consider reusing MSAA surfaces where possible rather than quickly creating and deleting them, as reconstruction will be expensive and older drivers might not be optimized for rapid texture freeing/allocation
			 */
			delete(): void
		}
		/**
		 * Create a multisampled surface
		 * 
		 * @param width Width of surface, in logical pixels
		 * @param height Height of surface, in logical pixels
		 * @param format Most hardware will only support `Formats.RGBA8`, `Formats.RGB565`, `Formats.RGBA4` and `Formats.RGB5_A1`
		 * @param msaa How many samples per logical pixel to allocate. This is a hint; the actual value may be rounded or clamped. Set to a high value (e.g, 256) to use as many samples as available
		 * 
		 * @performance This method performs the allocation of the MSAA, which will use a lot of video memory. Drawing to a multisampled target will not perform more shader invocation but may slow down rendering due to slower rasterization and greatly increased video memory access
		 */
		function MSAA(width: number, height: number, msaa: number, format: Formats): MSAA
		
		/**
		 * Create an image-backed texture. This texture is lazily loaded from the source(s)
		 * @param src 
		 * @param options Texture options. See the `Texture.options` property (property can be changed at any time)
		 * @param format Texture format. See `Formats`. Cannot be changed later. Default: `Formats.RGBA`
		 * @param mipmaps Number of mipmaps to allocate. Default: 1 (_"no mipmaps"_)
		 */
		function from(src: ImageSource | ImageSource[], options?: number, format?: Formats, mipmaps?: number): Texture
	}
	interface Texture{
		/**
		 * Whether this texture's format is an integer-type format
		 * 
		 * Integer formats will end in 8, 16, or 32 (e.g `Formats.RGBA32`, `Formats.R8`)
		 * 
		 * Non-integer formats will typically end in F for floating-point (e.g `Formats.RG16F`, `Formats.R11F_G11F_B10F`), or nothing in particular for fixed-point (e.g `Formats.RGB`, `Formats.RGB565`)
		 * 
		 * The two texture types CANNOT be used interchangeably when drawing, as shaders declare and use them differently (`vec4` vs `ivec4`)
		 * 
		 * Note that floating-point and fixed-point textures CAN be interchanged freely and are often both referred to as "float" textures for brevity
		 */
		readonly isInteger: boolean
		/** Texture format. See `Formats`. Format is supplied on texture creation and cannot be changed later */
		readonly format: Formats

		/** Texture's width (resolution, pixels). Width is supplied on texture creation and cannot be changed later */
		readonly width: number
		/** Texture's height (resolution, pixels). Height is supplied on texture creation and cannot be changed later */
		readonly height: number
		/** Number of layers. A single texture object can hold multiple layers, thus acting like an array of textures. Most textures will only have 1 layer. Number of layers is supplied on texture creation and cannot be changed later */
		readonly layers: number

		/**
		 * Width, in pixels of a sub-texture, when accounting for its crop
		 */
		readonly subWidth: number
		/**
		 * Height, in pixels of a sub-texture, when accounting for its crop
		 */
		readonly subHeight: number
		/**
		 * Aspect ratio of a sub-texture, i.e subWidth/subHeight
		 * 
		 * Value will be < 1 for vertical textures, > 1 for horizontal textures and == 1 for square textures
		 */
		readonly aspectRatio: number

		/**
		 * Whether the image-backed texture is loaded
		 * Always true for non-image-backed textures
		 */
		readonly loaded: boolean

		/**
		 * Whether the image-backed texture is currently being loaded
		 * Always false for non-image-backed textures
		 */
		readonly waiting: boolean

		/** Used to make image-backed textures `await`able. Will trigger a load. */
		readonly then: ((resolve: (res: Texture) => any, reject: (err: any) => any) => void) | null

		/** `x` parameter used to define a sub-texture. Can be safely modified at any time */
		x: number
		/** `y` parameter used to define a sub-texture. Can be safely modified at any time */
		y: number
		/** `width` parameter used to define a sub-texture. Can be safely modified at any time */
		w: number
		/** `height` parameter used to define a sub-texture. Can be safely modified at any time */
		h: number
		/** `layer` parameter used to define a sub-texture. Can be safely modified at any time */
		l: number

		/**
		 * Texture options bitfield. One or more of the following options OR'd together
		 * 
		 * `UPSCALE_SMOOTH`: Perform linear sampling when the texture is upscaled. This makes the texture look blurry or "smoother", rather than pixelated
		 * 
		 * `DOWNSCALE_SMOOTH`: Perform linear sampling when the texture is downscaled. This is mainly to reduce moiré effects
		 * 
		 * `MIPMAP_SMOOTH`: Perform blending between multiple mipmaps to further reduce moiré effects and reduce visible seams with animations involving scaling. This has no effect on textures without mipmaps
		 * 
		 * `REPEAT`: Coordinates outside [0,1] will repeat (tile) the texture infinitely
		 * `REPEAT_X`, `REPEAT_Y`: Same as `REPEAT` but for the X or Y axis only. These values can be OR'd, i.e `(REPEAT_X | REPEAT_Y) == REPEAT`
		 * 
		 * `REPEAT_MIRRORED`: Coordinates outside [0,1] will repeat (tile) the texture infinitely
		 * `REPEAT_MIRRORED_X`, `REPEAT_MIRRORED_Y`: Same as `REPEAT` but for the X or Y axis only. These values can be OR'd appropriately, e.g `REPEAT_X | REPEAT_MIRRORED_Y`
		 * 
		 * @example
		 * ```js
		 * tex.options = SMOOTH | REPEAT_X | REPEAT_MIRRORED_Y
		 * ```
		 */
		options: number

		/**
		 * Trigger an image-backed texture to be loaded
		 * 
		 * If the image is already loaded or loading (i.e `this.loaded || this.waiting`), this is a no-op
		 * 
		 * Otherwise, `waiting` immediately becomes true, then, once the image has finished loading and the texture object has been populated, `loaded` will become true and `waiting` will become false
		 */
		load(): void

		/**
		 * Returns a sub-texture. The underlying data pointed to by a sub-texture is the same, so that modifications to a texture are seen through all its sub-textures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and sub-textures are of the same class and thus the same methods and properties are available on them
		 * 
		 * Coordinates are usually the range [0,1] however taking coordinates outside is completely valid and will use the texture's wrapping mode to fill the outside
		 * 
		 * @param l Layer. By default sub-textures use the same layer as the texture they are made from, and the original texture object uses layer 0
		 * 
		 * @performance This method is CPU-arithmetic, very fast
		 */
		sub(x: number, y: number, w: number, h: number, l?: number): Texture

		/**
		 * Returns a "super texture" sub-texture. The underlying data pointed to by a sub-texture is the same, so that modifications to a texture are seen through all its sub-textures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and sub-textures are of the same class and thus the same methods and properties are available on them
		 * 
		 * Unlike .sub(), the sub-texture returned is such that its sub-texture defined by the provided values contains the whole of this texture. In other words, `tex.super(a, b, c, d).sub(a, b, c, d)` is the same as `tex`
		 * 
		 * @param l Layer. By default sub-textures use the same layer as the texture they are made from, and the original texture object uses layer 0
		 * 
		 * @performance This method is CPU-arithmetic, very fast. Slightly slower than .sub() due to the use of division
		 */
		super(x: number, y: number, w: number, h: number, l?: number): Texture

		/**
		 * Returns a sub-texture. The underlying data pointed to by a sub-texture is the same, so that modifications to a texture are seen through all its sub-textures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and sub-textures are of the same class and thus the same methods and properties are available on them
		 * 
		 * Unlike .sub(), the provided values are measured in pixels and usually in the range [0,w] / [0,h]
		 * 
		 * @param l Layer. By default sub-textures use the same layer as the texture they are made from, and the original texture object uses layer 0
		 * 
		 * @performance This method is CPU-arithmetic, however for image-backed textures, it will trigger a load if the texture is not yet loaded (in order to obtain the texture's width/height)
		 */
		crop(x: number, y: number, w: number, h: number, l?: number): Texture

		/**
		 * Returns a sub-texture. The underlying data pointed to by a sub-texture is the same, so that modifications to a texture are seen through all its sub-textures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and sub-textures are of the same class and thus the same methods and properties are available on them
		 * 
		 * The sub-texture is not cropped in any way: only the layer is changed
		 * 
		 * @performance This method is CPU-arithmetic, very fast
		 */
		layer(layer: number): Texture

		/**
		 * Copy data from one texture (tex) object to another (this)
		 * @param tex The source to copy data from
		 * @param x Left edge of area to paste, in pixels. Default: 0
		 * @param y Bottom edge of area to paste, in pixels. Default: 0
		 * @param layer First layer of area to paste. Default: 0
		 * @param srcX Left edge of area to copy data from in the source texture, in pixels. Default: 0
		 * @param srcY Bottom edge of area to copy data from in the source texture, in pixels. Default: 0
		 * @param srcLayer First layer of area to copy data from in the source texture. Default: 0
		 * @param srcWidth Width of area to copy in pixels. Defaults to the source's width
		 * @param srcHeight Height of area to copy in pixels. Defaults to the source's height
		 * @param srcLayers Number of layers to copy. Defaults to the source's layer count
		 * @param srcMip Which mipmap to read data from in the source texture. Default: 0
		 * @param dstMip Which mipmap to write data to. Default: 0
		 * @returns `this`, or `null` if this is an image-backed texture that is not loaded yet
		 * 
		 * @performance This method performs a GPU-GPU copy, which is faster than uploading a texture. If the texture was recently used then this will create a light draw boundary (See `Drawable.draw()` for more info)
		 */
		paste(tex: Texture, x?: number, y?: number, layer?: number, dstMip?: number, srcX?: number, srcY?: number, srcLayer?: number, srcWidth?: number, srcHeight?: number, srcLayers?: number, srcMip?: number): this | null

		/**
		 * Copy data from an image-like (img) object to another (this)
		 * @param img The source to copy data from
		 * @param x Left edge of area to paste, in pixels. Default: 0
		 * @param y Bottom edge of area to paste, in pixels. Default: 0
		 * @param layer First layer of area to paste. Default: 0
		 * @param dstMip Which mipmap to write data to. Default: 0
		 * @returns `this`, or `null` if this is an image-backed texture that is not loaded yet
		 * 
		 * @performance This method performs an upload to the GPU, which is primarily bandwidth-bound for typical-size textures. Extra preprocessing may be done for certain source types (e.g <img> elements), which may be CPU-bound. It is recommended to use ImageBitmap sources where possible (with the correct options provided by Gamma.bitmapOpts), as they are GPU-ready by design. It may also cause partial pipeline stalls if following draw operations depend on the texture data but have to wait for the upload to finish, however this is mostly mitigated with modern drivers. If the texture was recently used then this will create a light draw boundary (See `Drawable.draw()` for more info)
		 */
		paste(img: ImageSource, x?: number, y?: number, layer?: number, dstMip?: number): Promise<this> | null

		/**
		 * Copy data from memory to this texture
		 * @param data A `TypedArray` of the correct type and size (see table below)
		 * @param x Left edge of area to paste, in pixels. Default: 0
		 * @param y Bottom edge of area to paste, in pixels. Default: 0
		 * @param layer First layer of area to paste. Default: 0
		 * @param width Width of area to paste in pixels. Defaults to this texture's width
		 * @param height Height of area to paste in pixels. Defaults to this texture's height
		 * @param layers Number of layers to paste. Defaults to this texture's number of layers
		 * @param mip Which mipmap to write data to. Default: 0
		 * @returns `this`, or `null` if this is an image-backed texture that is not loaded yet
		 * 
		 * @performance This method performs an upload to the GPU, which is primarily bandwidth-bound for typical-size textures. It may also cause partial pipeline stalls if following draw operations depend on the texture data but have to wait for the upload to finish, however this is mostly mitigated with modern drivers. If the texture was recently used then this will create a light draw boundary (See `Drawable.draw()` for more info)
		 * 
		 * | For format                        | Pass                               | of length          |
		 * |-----------------------------------|------------------------------------|--------------------|
		 * | R, RG, RGB, RGBA                  | `Uint8Array` / `Uint8ClampedArray` | `w*h*d * channels` |
		 * | R8, RG8, RGB8, RGBA8              | `Uint8Array` / `Uint8ClampedArray` | `w*h*d * channels` |
		 * | R16, RG16, RGB16, RGBA16          | `Uint16Array`                      | `w*h*d * channels` |
		 * | R32, RG32, RGB32, RGBA32          | `Uint32Array`                      | `w*h*d * channels` |
		 * | RGB565, RGB5_A1, RGBA4            | `Uint16Array`                      | `w*h*d`            |
		 * | RGB10_A2, R11F_G11F_B10F, RGB9_E5 | `Uint32Array`                      | `w*h*d`            |
		 * | R16F, RG16F, RGB16F, RGBA16F      | `Uint16Array` / `Float16Array`     | `w*h*d * channels` |
		 * | R32F, RG32F, RGB32F, RGBA32F      | `Float32Array`                     | `w*h*d * channels` |
		 */
		pasteData(data: Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Float16Array | Float32Array, x?: number, y?: number, layer?: number, width?: number, height?: number, layers?: number, mip?: number): this | null

		/**
		 * Copy data from this texture to CPU memory, asynchronously
		 * 
		 * This method is asynchronous due to how GPUs work: The CPU send commands to the GPU, but for performance reasons, the CPU does not wait for the GPU to finish executing those commands before moving on. This means that if we were to read data back immediately, we would have to wait for the GPU to finish all previous commands, which could be very slow. Instead, we issue a command to copy the texture data to a temporary buffer, then later, when that command has finished executing, we copy that temporary buffer to CPU memory and resolve the promise with that data. Despite this, the data is still guaranteed to be from the time readData() was called (i.e any draw operations issued after readData() will not be reflected in the data returned by the promise)
		 * 
		 * Note that reading from the main target (the canvas) is not possible. Instead, draw to a separate Drawable, paste it to the main target, and read from the drawable
		 * 
		 * @param x Left edge of area to copy from, in pixels. Default: 0
		 * @param y Bottom edge of area to copy from, in pixels. Default: 0
		 * @param layer First layer of area to copy from. Default: 0
		 * @param width Width of area to copy from in pixels. Defaults to this texture's width
		 * @param height Height of area to copy from in pixels. Defaults to this texture's height
		 * @param layers Number of layers to copy. Defaults to this texture's number of layers
		 * @param mip Which mipmap to read data from. Default: 0
		 * 
		 * @performance This method performs a download from the GPU, which is notoriously difficult to perform quickly due to the need to synchronize the CPU and GPU. The operation is primarily bandwidth-bound for typical-size textures, however there is a significant amount of overhead performed in additional copies, and the need to synchronize the CPU and GPU (e.g fences). It is recommended to avoid reading back from the GPU if it is not strictly needed, and if necessary, to read back large chunks of data infrequently (e.g once per frame) rather than small chunks frequently
		 * 
		 * @returns
		 * | For format                        | A promise is returned resolving to | of length          |
		 * |-----------------------------------|------------------------------------|--------------------|
		 * | R, RG, RGB, RGBA                  | `Uint8Array` / `Uint8ClampedArray` | `w*h*d * channels` |
		 * | R8, RG8, RGB8, RGBA8              | `Uint8Array` / `Uint8ClampedArray` | `w*h*d * channels` |
		 * | R16, RG16, RGB16, RGBA16          | `Uint16Array`                      | `w*h*d * channels` |
		 * | R32, RG32, RGB32, RGBA32          | `Uint32Array`                      | `w*h*d * channels` |
		 * | RGB565, RGB5_A1, RGBA4            | `Uint16Array`                      | `w*h*d`            |
		 * | RGB10_A2, R11F_G11F_B10F, RGB9_E5 | `Uint32Array`                      | `w*h*d`            |
		 * | R16F, RG16F, RGB16F, RGBA16F      | `Uint16Array` / `Float16Array`     | `w*h*d * channels` |
		 * | R32F, RG32F, RGB32F, RGBA32F      | `Float32Array`                     | `w*h*d * channels` |
		 */
		readData(x?: number, y?: number, l?: number, w?: number, h?: number, d?: number, mip?: number): Promise<ArrayBufferView>
		
		/**
		 * Set the range of mipmaps that can be used by this texture during drawing
		 * @param min Lowest (highest-resolution) mipmap, inclusive, where the original texture is mipmap `0`
		 * @param max Highest (lowest-resolution) mipmap, inclusive. Omit to set no upper bound
		 * 
		 * @performance This method is mostly CPU-only logic, and relatively fast. If the texture was recently used then this will create a light draw boundary (See `Drawable.draw()` for more info)
		 */
		setMipmapRange(min?: number, max?: number): void
		/**
		 * Regenerate all mipmaps from the original texture (mipmap 0)
		 * 
		 * Note that this method has no effect on image-backed textures as their mipmaps (if present) are automatically generated on load, and the texture contents are immutable, so mipmaps never change
		 * 
		 * @performance This method is performed entirely on the GPU, and processes the entire texture, which is relatively slow, especially if only a small portion of the texture has changed. Consider calling this as late as possible, ideally only once you are absolutely sure you need the mipmaps and no further modifications will be done. If the texture was recently used then this will create a light draw boundary (See `Drawable.draw()` for more info)
		 */
		genMipmaps(): void

		/**
		 * Free the resources of this texture as soon as possible. It is invalid to use the texture object for anything beyond this point, the object should be "forgotten" and cannot be reinitialized
		 * Under the hood, the texture's data will be freed by the GPU once all draw operations using it have finished
		 * 
		 * @performance This method is relatively fast, however, consider reusing textures where possible rather than quickly creating and deleting them, as reconstruction may be expensive and older drivers might not be optimized for rapid texture freeing/allocation. If the texture was recently used then this will create a light draw boundary (See `Drawable.draw()` for more info)
		 */
		delete(): void
	}

	/** See `Texture.options` */ const UPSCALE_SMOOTH = 1
	/** See `Texture.options` */ const DOWNSCALE_SMOOTH = 2
	/** See `Texture.options` */ const MIPMAP_SMOOTH = 4
	/** See `Texture.options` */ const SMOOTH = 7
	/** See `Texture.options` */ const REPEAT_X = 8
	/** See `Texture.options` */ const REPEAT_MIRRORED_X = 16
	/** See `Texture.options` */ const REPEAT_Y = 32
	/** See `Texture.options` */ const REPEAT_MIRRORED_Y = 64
	/** See `Texture.options` */ const REPEAT = 40
	/** See `Texture.options` */ const REPEAT_MIRRORED = 80

	/**
	 * Create a drawable context optionally with a stencil buffer
	 * 
	 * Conceptually, a `Drawable` is an object describing where and how to draw, its methods being used to actually draw. The 'target' behind a `Drawable` can be the canvas (as is the case for the main target), or one or more texture layer / multisampled buffer (see `Texture.MSAA`). You can add up to `Drawable.MAX_TARGETS` targets, differentiated by their IDs (0, 1, 2, ...)
	 * 
	 * To actually add targets to a drawable, see `Drawable.setTarget`.
	 * 
	 * @param stencil Whether to also allocate a stencil buffer for IF_SET/IF_UNSET/SET/UNSET functionality. When this parameter is false, the stencil buffer will not be allocated and will behave as if it is always 0. Default: false (for performance reasons. Set to true only when you actually need it)
	 * 
	 * @performance This method itself is mostly CPU-only logic (a bit more expensive if a stencil buffer is allocated). However, using many drawables, especially interlaced, will have severe performance implications. See `Drawable.draw()` for more info
	 */
	function Drawable(stencil?: boolean): Drawable
	namespace Drawable{
		/** Maximum number of targets that can be set with `Drawable.setTarget()`. The targets are differentiated by their IDs (0, 1, 2, ..., up to this value) */
		const MAX_TARGETS: number
	}

	interface Drawable{
		/** The backing target's whole width in pixels */
		readonly width: number
		/** The backing target's whole height in pixels */
		readonly height: number
		/**
		 * Whether this drawable has a stencil buffer, allowing for IF_SET/IF_UNSET/SET/UNSET functionality. This value can be changed for all drawables except the main context
		 * @performance Changing this value may create a heavy draw boundary if it causes a draw target change (See `Drawable.draw()` for more info). Allocating a stencil buffer may be slightly expensive for large targets, removing it is relatively fast. If you assign without changing (e.g `ctx.hasStencil = true` when it was already true), then no work is actually done. This may be preferable to a check-and-assign
		 */
		hasStencil: boolean

		/**
		 * Set a drawable target for this drawable context
		 * 
		 * This method is not valid on the main context. Additionally, all targets added to a single `Drawable` must have the same width and height
		 * @param id The slot ID to set the target on. See `Drawable()` and `Drawable.MAX_TARGETS`
		 * @param target A texture or MSAA to which draw operations should go to, or null to remove the current target at that slot. Note that sub-texture layer/crop are ignored, the drawable always draws to the entire layer
		 * @param layer Draw to a specific layer of the texture (Default: 0)
		 * @param mip Draw to a specific mipmap of the texture (Default: 0)
		 */
		setTarget(id: number, target: Texture, layer?: number, mip?: number): void
		setTarget(id: number, target: Texture.MSAA): void
		setTarget(id: number, target?: null): void

		/**
		 * Clear all currently bound targets (see `Drawable.setTarget`)
		 * 
		 * Additionally, any stencil buffer's memory is freed (beware, manually unsetting every target via `.setTarget(id, null)` will not do this!)
		 */
		clearTargets(): void

		/**
		 * Translate (move) all following draw operations, x+ corresponds to right and y+ corresponds to up
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		translate(x: number, y: number): void
		/**
		 * Scale all following draw operations, x+ corresponds to right and y+ corresponds to up
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		scale(x: number, y: number): void
		/**
		 * Rotate all following draw operations, clockwise (or negative for anticlockwise)
		 * @performance This method is CPU-arithmetic, fast and usually inlined, however it uses `sin()` and `cos()`
		 */
		rotate(by: number): void
		/**
		 * Apply a custom transformation matrix to all following draw operations. The matrix is specified by the values a,b,c,d,e,f corresponding to the 2D affine transformation matrix:
		 * ```
		 * | a c e |
		 * | b d f |
		 * | 0 0 1 |
		 * ```
		 * 
		 * This matrix transforms points `(x, y)` to `(a*x + c*y + e, b*x + d*y + f)`
		 * Note that this method premultiplies the current transformation matrix by the provided one. In other words, the provided transform is applied before the current transform. This is the same convention as OpenGL and Canvas2D, but opposite to CSS and SVG
		 * 
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		transform(a: number, b: number, c: number, d: number, e: number, f: number): void
		/**
		 * Skew all following draw operations by the ratios x and y
		 * 
		 * Note that the parameters are ratios and NOT degrees. Ratios are related to degrees via the `tan()` and `atan()` functions. A skew of 0 degrees has a ratio of 0. 45 degrees has a ratio of 1 and 90 degrees a ratio of Infinity
		 * 
		 * A square drawn at `(0, 0)` with size `(1, 1)` after the transform would be a parallelogram with corners at `(0, 0)`, `(1, y)`, `(x, 1)` and `(x+1, y+1)`
		 * 
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		skew(x: number, y: number): void
		/**
		 * Simultaneously scales uniformly and rotates. Faster than calling scale() and rotate() separately
		 * Essentially moves the basis vector `(1, 0)` to `(x, y)` without squishing or translating, much like a mathematical complex multiplication, `(x + yi) * (r, i)`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		multiply(r: number, i: number): void
		/**
		 * Get the current transformation matrix as an object with properties `a,b,c,d,e,f` corresponding to the 2D affine transformation matrix:
		 * ```
		 * | a c e |
		 * | b d f |
		 * | 0 0 1 |
		 * ```
		 * 
		 * This matrix transforms points `(x, y)` to `(a*x + c*y + e, b*x + d*y + f)`
		 * 
		 * After-transform points `(0, 0)` and `(1,1)` represent the bottom-left and top-right corners of the drawable target respectively
		 * 
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		getTransform(): {a: number, b: number, c: number, d: number, e: number, f: number}
		/**
		 * Reset the transformation matrix to the identity matrix, or to one defined by the transform values a,b,c,d,e,f respectively
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		reset(a: number, b: number, c: number, d: number, e: number, f: number): void
		/**
		 * Simultaneous translates and scales such that the new origin is at `(x, y)` with basis vectors (w,0) and (0,h). A square drawn at `(0, 0)` with size `(1, 1)` after the transform would be drawn at `(x, y)` with size `(w, h)`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		box(x: number, y: number, w: number, h: number): void
		/**
		 * Transform a point `(x, y)` by the current transformation matrix, returning the transformed point as an object `{x, y}`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		to(x: number, y: number): vec2
		to(xy: vec2): vec2
		/**
		 * Inverse-transform a point `(x, y)` by the current transformation matrix, returning the original point as an object `{x, y}`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined, however it involves a division
		 */
		from(x: number, y: number): vec2
		from(xy: vec2): vec2
		/**
		 * Transform a delta `(dx,dy)` by the current transformation matrix, returning the transformed delta as an object `{x, y}`. Unlike `to()`, this does not apply translation, only scale/rotation/skew
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		toDelta(dx: number, dy: number): vec2
		toDelta(dxy: vec2): vec2
		/**
		 * Inverse-transform a delta `(dx,dy)` by the current transformation matrix, returning the original delta as an object `{x, y}`. Unlike `from()`, this does not apply translation, only scale/rotation/skew
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		fromDelta(dx: number, dy: number): vec2
		fromDelta(dxy: vec2): vec2
		/**
		 * The determinant of the current transformation matrix. This is the signed area scaling factor of the transform
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		determinant(): number
		/**
		 * The pixel ratio of the current transformation matrix. This is the geometric mean of the absolute values of the eigenvalues, or, in other words, sqrt(determinant), multiplied by the drawable's width and height. It can be used to determine appropriate mipmap levels for textures, and represents how many pixels one unit in the current transform space corresponds to on average on the draw target
		 * @performance This method is CPU-arithmetic, fast and usually inlined, however it uses a square root
		 */
		pixelRatio(): number
		/**
		 * Create a sub-context, which points to the same target, stencil buffer, etc... as this one, much like `Texture.sub()`, however it keeps its own state such as transform, blend, mask, shader, geometry, making it ideal for passing to other functions that may modify their drawable context arbitrarily without us needing to revert it afterwards
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub(): Drawable
		/**
		 * Reset all sub-context state (transform, shader, blend, mask, geometry) to match another drawable
		 * @param ctx The drawable to copy state from
		 * @performance This method is CPU-logic, very fast and usually inlined
		 */
		resetTo(ctx: Drawable): void

		/**
		 * The shader to be used by all drawing operations. See `Shader()` for more info on custom shaders. Can be also set to `null` to use `Shader.DEFAULT`, however reading the property never returns null
		 * @performance Changing this value will create a medium draw boundary (See `Drawable.draw()` for more info)
		*/
		shader: Shader
		/**
		 * Drawing masks. This is a bitmask with any the following:
		 * - `R` (1): Enable writing to the red channel
		 * - `G` (2): Enable writing to the green channel
		 * - `B` (4): Enable writing to the blue channel
		 * - `A` (8): Enable writing to the alpha channel
		 * - `RGB` (7): Enable writing to all color channels except alpha
		 * - `RGBA` (15): Enable writing to all color channels
		 * - `IF_SET` (16): Only draw if the stencil value is one
		 * - `IF_UNSET` (32): Only draw if the stencil value is zero
		 * - `SET` (128): Set the stencil value to one where drawing would occur. The value is updated even if IF_SET/IF_UNSET prevent drawing. However, a `discard` in the shader will prevent the update
		 * - `UNSET` (64): Set the stencil value to zero where drawing would occur. The value is updated even if IF_SET/IF_UNSET prevent drawing. However, a `discard` in the shader will prevent the update
		 * - `FLIP` (192): Flip the stencil value (0 becomes 1, 1 becomes 0) where drawing would occur. The value is updated even if IF_SET/IF_UNSET prevent drawing. However, a `discard` in the shader will prevent the update
		 * - `NEVER` (48): Never draw (equivalent to `IF_SET | IF_UNSET`). Useful for updating the stencil buffer without drawing anything
		 * 
		 * Note that the stencil operations (IF_SET/IF_UNSET/SET/UNSET/FLIP) only have an effect if the drawable has a stencil buffer (i.e was created with the `stencil` parameter set to true, or had its `hasStencil` property set to true). Otherwise, the stencil value is always treated as 0 and no operations are performed
		 * 
		 * By default, all color channels are enabled and no stencil operations are performed (`R | G | B | A`)
		 * 
		 * If you need continuous stencil values rather than just 0 and 1 (e.g nice antialiased borders), consider making use of the alpha channel with blend modes to achieve similar effects
		 * @performance Changing this value will create a light draw boundary (See `Drawable.draw()` for more info)
		 */
		mask: number
		/**
		 * The blending mode to be used by all drawing operations. See `Blend` for more info on blending modes. Can be also set to `0` to use `Blend.DEFAULT`, however reading the property never returns 0
		 * @performance Changing this value will create a light draw boundary (See `Drawable.draw()` for more info)
		 */
		blend: Blend
		/**
		 * The geometry to be used by all drawing operations. See `Geometry()` for more info on custom sprite geometries. Can be also set to `null` to use `Geometry.DEFAULT`, however reading the property never returns null
		 * @performance Changing this value will create a light-to-medium draw boundary (See `Drawable.draw()` for more info)
		 */
		geometry: Geometry
		/**
		 * Draw a sprite at (0,0) to (1,1)
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * @performance The `draw*()` family of calls is possibly the hardest to grasp performance for. This is due to the fact that many other operations are actually deferred until the next `draw()` call for performance. In addition to this, many `draw()` calls are coalesced to improve performance. This technique is absolutely fundamental to performant rendering. Whenever some other operation or state change forces `draw()` calls to not be coalesced, we call this a _draw boundary_. Examples of operations that create draw boundaries include:
		 * - Swapping shader
		 * - Drawing to a different draw target
		 * - Writing to a texture that was recently used
		 * - Using a lot of distinct textures
		 * - Etc...
		 * Otherwise, coalesced draw calls will ultimately all be drawn with the same `glDrawArraysInstanced()` call (or similar)
		 * 
		 * The type of draw boundary can also affect performance. For example, a 'light' draw boundary caused by changing the blend mode might cost the equivalent of a couple of draw() calls, while one caused by changing draw target (a 'heavy' draw boundary) might cost several dozen or even hundred times more
		 * 
		 * There is also CPU overhead to consider. Javascript can be well-optimized and the implementation for `draw()` is optimized to the brink of my insanity including code-generation (DO NOT LOOK IN THE SOURCE CODE IT IS ABSOLUTELY MINDF*CK GET ME OUT OF HERE PLEASE HELP) however only so much can be done, and a portion is left to you to not make silly decisions that undo any efforts the library may try to make. The function is optimized to receive statically-typed arguments (e.g not passing a vec4 to a vec2, a string to a number, or passing too many arguments). In favorable conditions, `draw` will be inlined and reduced to a dynamic call to a private method of the shader, used to pack the passed values into an internal buffer
		 * 
		 * Benchmarks and citations may be added later if I have not `git commit -m suicide` by then
		 */
		draw(...values: any[]): void
		/**
		 * Draw a sprite at `(x, y)` with size `(w, h)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * @performance See `Drawable.draw()` for more info
		 */
		drawRect(x: number, y: number, w: number, h: number, ...values: any[]): void
		/**
		 * Draw a sprite within a parallelogram defined by a matrix
		 * 
		 * Bottom at `(e, f)` with bottom edge defined by the vector `(a, b)` and left edge defined by `(c, d)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * @performance See `Drawable.draw()` for more info
		 */
		drawMat(a: number, b: number, c: number, d: number, e: number, f: number, ...values: any[]): void
		/**
		 * Draw a sprite at (0,0) to (1,1)
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * This version of draw() expects an array rather than spread parameters
		 * @performance See `Drawable.draw()` for more info
		 */
		drawv(values: any[]): void
		/**
		 * Draw a sprite at `(x, y)` with size `(w, h)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * This version of drawRect() expects an array rather than spread parameters
		 * @performance See `Drawable.draw()` for more info
		 */
		drawRectv(x: number, y: number, w: number, h: number, values: any[]): void
		/**
		 * Draw a sprite within a parallelogram defined by a matrix
		 * 
		 * Bottom at `(e, f)` with bottom edge defined by the vector `(a, b)` and left edge defined by `(c, d)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * This version of drawMat() expects an array rather than spread parameters
		 * @performance See `Drawable.draw()` for more info
		 */
		drawMatv(a: number, b: number, c: number, d: number, e: number, f: number, values: any[]): void
		/**
		 * Draw a sprite at (0,0) to (1,1)
		 * The shader values will be copied from the previous draw call, even if that call did not come from this `Drawable` object
		 * 
		 * This version of draw() is designed for performance in hot loops where the values don't / rarely change
		 * @performance See `Drawable.draw()` for more info
		 */
		dup(): void
		/**
		 * Draw a sprite at `(x, y)` with size `(w, h)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * This version of drawRect() is designed for performance in hot loops where the values don't / rarely change
		 * @performance See `Drawable.draw()` for more info
		 */
		dupRect(x: number, y: number, w: number, h: number): void
		/**
		 * Draw a sprite within a parallelogram defined by a matrix
		 * 
		 * Bottom at `(e, f)` with bottom edge defined by the vector `(a, b)` and left edge defined by `(c, d)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * This version of drawRect() is designed for performance in hot loops where the values don't / rarely change
		 * @performance See `Drawable.draw()` for more info
		 */
		dupMat(a: number, b: number, c: number, d: number, e: number, f: number): void
		/**
		 * Clear the whole draw target to a solid color
		 * 
		 * @performance Will create a light draw boundary (See `Drawable.draw()` for more info)
		 */
		clear(r: number, g : number, b : number, a: number): void
		clear(r: vec4): void
		/**
		 * Clear the whole stencil buffer to 0
		 * 
		 * @performance Will create a light draw boundary (See `Drawable.draw()` for more info). Well-optimized, under the hood, all 8 bits of the stencil buffer are used. "Clearing" the stencil buffer will simply switch to another bit, until all 8 bits have been used up, at which point the buffer is actually cleared, this operation is often times cheaper than attempting to clear only a portion of the stencil buffer with a `draw*()` call, however, benchmark your specific case if you are unsure
		 */
		clearStencil(): void
	}
	/** See `Drawable.mask` */ const R = 1
	/** See `Drawable.mask` */ const G = 2
	/** See `Drawable.mask` */ const B = 4
	/** See `Drawable.mask` */ const A = 8
	/** See `Drawable.mask` */ const RGB = 7
	/** See `Drawable.mask` */ const RGBA = 15
	/** See `Drawable.mask` */ const IF_SET = 16
	/** See `Drawable.mask` */ const IF_UNSET = 32
	/** See `Drawable.mask` */ const NEVER = 48
	/** See `Drawable.mask` */ const UNSET = 64
	/** See `Drawable.mask` */ const SET = 128
	/** See `Drawable.mask` */ const FLIP = 192

	type Blend = number
	/**
	 * Construct a blend mode OpenGL-style
	 * 
	 * All colors are expected to be premultiplied by their alpha channel, by convention
	 * @param sfac The source factor (`sfac`)
	 * @param combine The combine operation
	 * @param dfac The destination factor
	 * 
	 * When blending a drawn color (`src`) with the existing canvas content (`dst`) the following formula is used
	 * 
	 * `new_dst = src*sfac <combine> dst*dfac`
	 * 
	 * `sfac` and `dfac` can be
	 * - `SRC` (`src`)
	 * - `SRC_ALPHA` (`src.a`)
	 * - `ONE_MINUS_SRC` (`(1-src)`)
	 * - `ONE_MINUS_SRC_ALPHA` (`(1-src.a)`)
	 * - `DST` (`dst`)
	 * - `DST_ALPHA` (`dst.a`)
	 * - `ONE_MINUS_DST` (`(1-dst)`)
	 * - `ONE_MINUS_DST_ALPHA` (`(1-dst.a)`)
	 * - `ONE` (`1`)
	 * - `ZERO` (`0`)
	 * 
	 * `combine` can be
	 * - `ADD` (s + d)
	 * - `SUB` (s - d)
	 * - `SUB_REV` (d - s, note the operands swapped)
	 * - `MIN` (min(s,d))
	 * - `MAX` (max(s,d))
	 * 
	 * Any of these values can be mixed to apply different rules for rgb values as for alpha values, for example, `RGB_ADD | A_MAX` will apply `ADD` to rgb channels and `MAX` to the alpha channel, and `RGB_SRC_ALPHA | ZERO` will use `SRC_ALPHA` for rgb and `ZERO` for alpha. Note that there are no `RGB_ZERO` or `A_ZERO` as these are just `ZERO` (even that can be omitted altogether as it is `== 0`)
	 * 
	 * @param alphaToCoverage Use the alpha value in conjunction with MSAA draw targets to simulate higher fidelity blending. Only a portion of the per-pixel samples are written, depending on the source's alpha. Note that when using this you should not provide premultiplied source, nor multiply the destination by `ONE_MINUS_SRC_ALPHA`
	 * @performance This function is pure arithmetic and often even constant-folded
	 */
	function Blend(sfac: number, combine: number, dfac: number, alphaToCoverage: boolean): Blend

	/** See `Blend()` */ const ONE = 17
	/** See `Blend()` */ const ZERO = 0
	/** See `Blend()` */ const RGB_ONE = 1
	/** See `Blend()` */ const A_ONE = 16
	/** See `Blend()` */ const SRC = 34
	/** See `Blend()` */ const RGB_SRC = 2
	/** See `Blend()` */ const ONE_MINUS_SRC = 51
	/** See `Blend()` */ const RGB_ONE_MINUS_SRC = 3
	/** See `Blend()` */ const SRC_ALPHA = 68
	/** See `Blend()` */ const RGB_SRC_ALPHA = 4
	/** See `Blend()` */ const A_SRC = 64
	/** See `Blend()` */ const ONE_MINUS_SRC_ALPHA = 85
	/** See `Blend()` */ const RGB_ONE_MINUS_SRC_ALPHA = 5
	/** See `Blend()` */ const A_ONE_MINUS_SRC = 80
	/** See `Blend()` */ const DST = 136
	/** See `Blend()` */ const RGB_DST = 8
	/** See `Blend()` */ const ONE_MINUS_DST = 153
	/** See `Blend()` */ const RGB_ONE_MINUS_DST = 9
	/** See `Blend()` */ const DST_ALPHA = 102
	/** See `Blend()` */ const RGB_DST_ALPHA = 6
	/** See `Blend()` */ const A_DST = 96
	/** See `Blend()` */ const ONE_MINUS_DST_ALPHA = 119
	/** See `Blend()` */ const RGB_ONE_MINUS_DST_ALPHA = 7
	/** See `Blend()` */ const A_ONE_MINUS_DST = 112
	/** See `Blend()` */ const SRC_ALPHA_SATURATE = 170
	/** See `Blend()` */ const RGB_SRC_ALPHA_SATURATE = 10
	/** See `Blend()` */ const ADD = 17
	/** See `Blend()` */ const RGB_ADD = 1
	/** See `Blend()` */ const A_ADD = 16
	/** See `Blend()` */ const SUB = 85
	/** See `Blend()` */ const RGB_SUB = 5
	/** See `Blend()` */ const A_SUB = 80
	/** See `Blend()` */ const SUB_REV = 102
	/** See `Blend()` */ const RGB_SUB_REV = 6
	/** See `Blend()` */ const A_SUB_REV = 96
	/** See `Blend()` */ const MIN = 34
	/** See `Blend()` */ const RGB_MIN = 2
	/** See `Blend()` */ const A_MIN = 32
	/** See `Blend()` */ const MAX = 51
	/** See `Blend()` */ const RGB_MAX = 3
	/** See `Blend()` */ const A_MAX = 48

	namespace Blend{
		/** All new content completely replaces old content, including the alpha channel */
		const REPLACE: Blend
		/** The default blend mode which composites new on top of old using new's alpha channel */
		const DEFAULT: Blend
		/** Similar to `Blend.DEFAULT` but old is composited on top of new, using old's blend mode. The new content appears to be "behind" the old content. Requires the target to have an alpha channel, unlike `Blend.DEFAULT` */
		const BEHIND: Blend
		/** Additive blending. This appears to make the content lighter, like additive mixing (e.g light). The source's alpha channel is ignored */
		const ADD: Blend
		/* Classic multiply blending, also known as tinting, which also multiplies alpha channel, producing a "intersection" effect, where only areas where both old and new are opaque remain opaque. If this is not what you want, see `Blend.MULTIPLY_MIX` */
		const MULTIPLY: Blend
		/** "Intuitive" multiply blending, also known as tinting. Where the source alpha is zero, the destination remains unchanged, which may be preferable to the more classic `Blend.MULTIPLY` */
		const MULTIPLY_MIX: Blend
		/** Subtract blending. This appears to make the content darker. The source's alpha channel is ignored */
		const SUBTRACT: Blend
		/** Subtract blending. Like `Blend.SUBTRACT` but with source and destination swapped. The destination's alpha channel is preserved */
		const REVERSE_SUBTRACT: Blend
		/* For each channel, the smallest value is kept (this includes the alpha channel). This can be used to make the content darker in only some places, to a set value */
		const MIN: Blend
		/* For each channel, the largest value is kept (this includes the alpha channel). This can be used to make the content lighter in only some places, to a set value */
		const MAX: Blend
		/**
		 * Invert the destination's contents. For each channel, the destination becomes a mix between `dst` and `1-dst` based on `src`
		 * | Source (src) | Destination (dst) |
		 * | ------------ | ----------------- |
		 * | `0.00`       | `dst`             |
		 * | `0.25`       | `0.25 + 0.5*dst`  |
		 * | `0.50`       | `0.5`             |
		 * | `0.75`       | `0.75 - 0.5*dst`  |
		 * | `1.00`       | `1 - dst`         |
		 * 
		 * This includes the alpha channel. It may be wise to set the source alpha to `0` if you want it unchanged, or create your own blending mode
		 */
		const INVERT: Blend
	}

	/**
	 * Construct a geometry
	 * 
	 * By default (the default geometry), a sprite drawn in a box at `(x, y)` and size `(w, h)` will take the shape of a square (i.e from `(x, y)` to `(x+w, y)` to `(x, y+h)` to `(x+w, y+h)`), however, this can be changed with geometries
	 * 
	 * Geometries are created in the same way as meshes using lower level graphics APIs. You provide a list of vertices (points), and a method of connecting them to draw triangles (or lines/points). Quads do not exist, but can be made of 2 triangles
	 * @param type The primitive type, which determines how to connect vertices (points). Can be one of
	 * - `POINTS` Do not connect the vertices, and instead draw them as 1-pixel points
	 * - `LINES` Connect each standalone pair of vertices by a 1-pixel-wide line (i.e vertices are connected like 0-1 2-3 4-5 with gaps between pairs)
	 * - `LINE_STRIP` Connect all adjacent vertices by a 1-pixel-wide line (i.e vertices are connected like 0-1-2-3-4-5 with no gaps between pairs)
	 * * - `LINE_LOOP` Connect all adjacent vertices by a 1-pixel-wide line (i.e vertices are connected like 0-1-2-3-4-5 with no gaps between pairs), and also connect the last vertex to the first, to close the loop
	 * - `TRIANGLES` Connect all triplets of vertices into a triangle (i.e vertices are connected like 0-1-2 3-4-5 6-7-8 with gaps between triplets)
	 * - `TRIANGLE_STRIP` Connect all 3 adjacent vertices into a triangle (i.e triangles are made from 0-1-2, 1-2-3, 2-3-4, 3-4-5, ...). This means every new vertex after the second forms a new triangle along with the previous 2 vertices
	 * - `TRIANGLE_FAN` Connect all 2 adjacent vertices with the first one in the list (i.e triangles are made from 0-1-2, 0-2-3, 0-3-4, 0-4-5, ...) This makes a 'fan'-like shape when the first point is placed in the center and all other points in a circle around it, hence the name
	 * @param vertices An array of vertices (points), in the format `[x, y, uvx, uvy, x, y, uvx, uvy, ...]` (four elements define one point). uvx/uvy are passed to the shader and used to calculate where to sample from textures, or how to shade certain features (a simple geometry will use the same values for x/y as uvx/uvy). Default geometry uses both x/y and uvx/uvy values within (0,0) to (1,1), and so does the `draw*()` family of functions, therefore you should center your geometry around that range in order to make it intuitive to use
	 */
	function Geometry(type: number, vertices: Float32Array | number[]): Geometry
	interface Geometry{
		/** Primitive type, see `Geometry()` */
		type: number
		/** Start vertex index of subgeometry (see `Geometry.sub()`) */
		start: number
		/** Length in vertices of geometry/subgeometry */
		length: number
		/**
		 * Create a subgeometry, i.e a geometry containing only a subset of the points of this geometry, optionally with a different type
		 * @performance This method is CPU-arithmetic, very fast. Using many subgeometries of the same geometry is also faster than using many different geometries. For many related geometries, consider building one large geometry and taking subgeometries of it
		 */
		sub(start: number, length?: number, type?: number): Geometry
	}
	namespace Geometry{
		/** The default geometry, constructing a square from (0,0) to (1,1), with corresponding uv values */
		const DEFAULT: Geometry
	}
	/** See `Geometry()` */ const TRIANGLE_STRIP = 5
	/** See `Geometry()` */ const TRIANGLES = 4
	/** See `Geometry()` */ const TRIANGLE_FAN = 6
	/** See `Geometry()` */ const LINE_LOOP = 2
	/** See `Geometry()` */ const LINE_STRIP = 3
	/** See `Geometry()` */ const LINES = 1
	/** See `Geometry()` */ const POINTS = 0

	/**
	 * Construct a shader using GLSL
	 * 
	 * Virtually anything you need to know about GLSL can be found online (or by asking an LLM). Here, we will just focus on things that are done differently or new
	 * 
	 * @param inputs Shader sprite inputs. These can be any of the following, passed as an array, or a single value, representing an array with one element
	 * - `FLOAT` A number interpreted and passed to the shader as a single-precision float
	 * - `VEC2`/`VEC3`/`VEC4` An object in the shape of `{x, y}`/`{x, y, z}`/`{x, y, z, w}` interpreted and passed to the shader as single-precision floats
	 * - `INT` A number interpreted and passed to the shader as a 32 bit signed integer
	 * - `IVEC2`/`IVEC3`/`IVEC4` An object in the shape of `{x, y}`/`{x, y, z}`/`{x, y, z, w}` interpreted and passed to the shader as 32 bit signed integers
	 * - `UINT` A number interpreted and passed to the shader as a 32 bit unsigned integer
	 * - `UVEC2`/`UVEC3`/`UVEC4` An object in the shape of `{x, y}`/`{x, y, z}`/`{x, y, z, w}` interpreted and passed to the shader as 32 bit unsigned integers
	 * - `TEXTURE` A texture object of a float format. Subtexture crop/layer ignored. Read below for how to use these
	 * - `FTEXTURE` A texture object of a high-precision floating point format (16F / 32F). Subtexture crop/layer ignored. Read below for how to use these
	 * - `UTEXTURE` A texture object of integer format. Subtexture crop/layer ignored. Read below for how to use these
	 * - `COLOR` A texture or flat color of a float format. Texture comes presampled in the shader (sample position is decided on the CPU side by sub-texture crop/layer). Read below for how to use these
	 * - `FCOLOR` A texture or flat color of a high-precision floating point format. Texture comes presampled in the shader (sample position is decided on the CPU side by sub-texture crop/layer). Read below for how to use these
	 * - `UCOLOR` A texture or flat color of an integer format. Texture comes presampled in the shader (sample position is decided on the CPU side by sub-texture crop/layer). Read below for how to use these
	 * @param defaults The default values for the inputs. If not provided, a suitable `0`-like default is used (`TEXTURE`/`FTEXTURE`/`UTEXTURE` cannot have a default value)
	 * @param uniforms Shader uniforms (config). These have the same possible values as `inputs`
	 * @param uDefaults The default values for the uniforms. If not provided, a suitable `0`-like default is used (`TEXTURE`/`FTEXTURE`/`UTEXTURE` cannot have a default value)
	 * @param output The type of output for this shader. Can be
	 * - `UINT` to make this shader only for rendering to integer targets
	 * - `FIXED` (normal value)
	 * - `FLOAT` for high precision targets (16F / 32F). This exists because `FIXED` will try to use the lowest precision available (`lowp`, for performance reasons), which may be insufficient for some use cases
	 * @param intFrac Optionally give a hint as to the bias towards integer or float textures. For example, if your shader uses one float and one int texture, but the int texture tends to stay the same while the float texture changes often, set this to `1` to indicate that you will use more float textures. Out of the 16 available texture slots, 15 will then be allocated for float textures, as opposed to 8 by default (when `intFrac == 0.5`), which will slightly increase performance
	 * 
	 * Note that you cannot use more than 16 different texture parameters in a single shader (across both `inputs` and `uniforms`), and that the number of inputs is also individually limited (don't go crazy and if you do run out, consider combining multiple `FLOAT`s to a `VEC2`/`VEC3`/`VEC4`, etc...)
	 * 
	 * ## Additions to GLSL
	 * 
	 * The following functions have been added to GLSL to interface with the rest of Gamma
	 * ```glsl
	 * #version 300 es
	 * precision mediump float;
	 * precision highp int;
	 * // tex2DArray can be a `TEXTURE` or `FTEXTURE`
	 * // uTex2DArray is `UTEXTURE`
	 * // Both are in fact `int`s
	 * 
	 * // Similar to texture(): Sampling based on the texture's options and GPU hardware
	 * // The uv contains x/y coordinates between 0 and 1 and the layer as the third component
	 * // Unlike GLSL ES's texture(), the texture provided can be dynamic since it is backed by an `int`
	 * lowp vec4 getColor(tex2DArray texture, vec3 uv);
	 * highp vec4 fGetColor(tex2DArray tex, vec3 uv);
	 * uvec4 uGetColor(uTex2DArray tex, vec3 uv);
	 * 
	 * // Similar to texelFetch: takes integer coordinates and does no filtering/wrapping
	 * // Unlike GLSL ES's texelFetch(), the texture provided can be dynamic since it is backed by an `int`
	 * lowp vec4 getPixel(tex2DArray texture, ivec3 pos, int mip);
	 * highp vec4 fGetPixel(tex2DArray texture, ivec3 pos, int mip);
	 * uvec4 uGetPixel(uTex2DArray texture, ivec3 pos, int mip);
	 * 
	 * // Similar to textureSize
	 * // Unlike GLSL ES's textureSize(), the texture provided can be dynamic since it is backed by an `int`
	 * ivec3 getSize(tex2DArray texture, int mip);
	 * ivec3 getSize(uTex2DArray texture, int mip);
	 * 
	 * // The arguments and uniforms specified at the shader's creation
	 * in auto arg0, arg1, arg2, ...;
	 * uniform auto uni0, uni1, uni2, ...;
	 * 
	 * // The color to output (can be lowp vec4, highp vec4 or uvec4, specified by the `output` parameter at the shader's creation)
	 * out auto col;
	 * 
	 * // uv, usually in the range (0,0) to (1,1) but is specified by the current Geometry in use (see `Geometry()`)
	 * in vec2 uv;
	 * // Actual position of fragment relative to sprite, usually in the range (0,0) to (1,1) but is specified by the current Geometry in use (see `Geometry()`)
	 * in vec2 xy;
	 * 
	 * // `COLOR`/`FCOLOR`/`UCOLOR`s are used by calling them, e.g
	 * void main(){
	 * ‍   // Assuming arg0 is a `COLOR`
	 * ‍   col = arg0();
	 * }
	 * 
	 * // All other types are used like normal
	 * // E.g
	 * void main(){
	 * ‍   if(arg0 > 1){
	 * ‍      col = getColor(uni0, vec3(uv, 0));
	 * ‍   }else{
	 * ‍      // something idk this is just an example
	 * ‍      col = vec4(arg1, 1.);
	 * ‍   }
	 * }
	 * ```
	 * 
	 * If you made it this far without your brain exploding, congratulations! Take a break :)
	 */
	function Shader(glsl: string, inputs: number | number[], defaults: number | number[], uniforms: number | number[], uDefaults: number | number[], output: number, intFrac: number): Shader

	/** See `Shader()` */ const FLOAT = 0
	/** See `Shader()` */ const VEC2 = 1
	/** See `Shader()` */ const VEC3 = 2
	/** See `Shader()` */ const VEC4 = 3
	/** See `Shader()` */ const INT = 16
	/** See `Shader()` */ const IVEC2 = 17
	/** See `Shader()` */ const IVEC3 = 18
	/** See `Shader()` */ const IVEC4 = 19
	/** See `Shader()` */ const UINT = 32
	/** See `Shader()` */ const UVEC2 = 33
	/** See `Shader()` */ const UVEC3 = 34
	/** See `Shader()` */ const UVEC4 = 35
	/** See `Shader()` */ const TEXTURE = 20
	/** See `Shader()` */ const UTEXTURE = 24
	/** See `Shader()` */ const FTEXTURE = 28
	/** See `Shader()` */ const COLOR = 4
	/** See `Shader()` */ const UCOLOR = 8
	/** See `Shader()` */ const FCOLOR = 12
	/** See `Shader()` */ const FIXED = 4

	interface Shader{
		/** Set the shader's uniforms, as specified by the shader itself. See `Shader()` */
		uniforms(...values: any[]): void
	}
	namespace Shader{
		/**
		 * The default shader, to draw a texture or solid color, optionally with a tint
		 * 
		 * Values: `(thing: Texture | vec4, tint: vec4 = vec4(1))` (i.e `[COLOR, VEC4]`)
		 * 
		 * Uniforms: none
		 */
		const DEFAULT: Shader
		/**
		 * Shader for drawing to integer-texture targets
		 * 
		 * Values: `(thing: vec4)` (i.e `[UVEC4]`)
		 * 
		 * Uniforms: none
		 * 
		 * Writes to integer targets
		 */
		const UINT: Shader
		/**
		 * Always draws opaque black
		 * 
		 * Values: None
		 * 
		 * Uniforms: none
		 */
		const BLACK: Shader
	}

	/**
	 * Flush all draw commands to the GPU. Must be called after you are done if your are not using `loop()`
	 * @performance Performs a few post-frame cleanups. No need to call mid-frame as there is literally no benefit and only opportunity to hurt performance. Might be useful to work around library bugs (hopefully there are none!)
	 */
	function flush(): void

	/** The main Drawable, representing the <canvas> element. This drawable is limited: it cannot be read from, or have its configuration modified in any way. To do that, draw to a separate drawable and then `paste()` to `ctx` */
	const ctx: Drawable

	/**
	 * Resize the <canvas> element. Will clear any existing content
	 * @performance Often quite slow. Do not use mid-frame. If your goal is to clear the canvas, use `Drawable.clear()`
	 */
	function setSize(width: number, height: number): void

	/**
	 * Create a GPU fence. The promise will resolve once all operations that had been issued at the time of the `wait()` call are done. Useful to make use of the canvas content elsewhere while avoiding blocking
	 */
	function wait(): Promise<void>
	/**
	 * Construct a render loop
	 * @param cb Rendering callback that is called every frame. Draw stuff to the canvas in here
	 */
	function loop(cb: () => any): typeof canvas

	/**
	 * How many `glDraw*()` calls were performed during the last frame
	 * 
	 * Available after calling `loop()`, calculated and reset automatically
	 */
	let frameDrawCalls: number
	/**
	 * How many sprites (`Drawable.draw*()` calls) were performed during the last frame
	 * 
	 * Available after calling `loop()`, calculated and reset automatically
	 */
	let frameSprites: number
	/**
	 * An estimate for much data was uploaded from the CPU to the GPU during the last frame, in bytes
	 * 
	 * Available after calling `loop()`, calculated and reset automatically
	 */
	let frameData: number
	/**
	 * The number of seconds since the page was loaded. Use it as a timer for animations and such
	 * 
	 * Available after calling `loop()`, calculated automatically
	 */
	let t: number
	/**
	 * The time passed since the last frame, in seconds. Use it for animations and such
	 * 
	 * E.g at 60fps, `dt` will typically be close to 1/60, or 0.016
	 * 
	 * Available after calling `loop()`, calculated automatically
	 */
	let dt: number
	/**
	 * How long the last frame took to render on the CPU side, in seconds
	 * 
	 * Available after calling `loop()`, calculated automatically
	 */
	let timeToFrame: number
	/**
	 * Callback for when the underlying `webgl2` context is lost (possibly GPU crash)
	 * 
	 * Available after calling `loop()`
	 */
	let glLost: (() => any) | null
}
}