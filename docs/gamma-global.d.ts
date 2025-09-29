/// <reference path="./gamma.d.ts" />
export {}
declare global{
	/**
	 * The canvas element passed to Gamma(), or a new canvas element if none was provided
	 */
	const canvas: HTMLCanvasElement
	/**
	 * The backing WebGL2 context for this canvas
	 */
	const gl: WebGL2RenderingContext
	
	enum Formats{
		/** Fixed-point 1-channel format, usually 8 bits, in the range [0,1] */ R,
		/** Fixed-point 2-channel format, usually 8 bits per channel, in the range [0,1] */ RG,
		/** Fixed-point 3-channel format, usually 8 bits per channel, in the range [0,1] */ RGB,
		/** Fixed-point 4-channel format, usually 8 bits per channel, in the range [0,1] */ RGBA,
		/**
		 * Fixed-point 3-channel format, with (R: 5, G: 6, B: 5) bits for respective channels. Values are decoded into the range [0,1].
		 * 
		 * Values are specified using 16 bit integers, with red packed into the highest bits, green in the middle, and blue lowest.
		 */
		RGB565,
		/**
		 * Fixed-point 4-channel format, with (R: 5, G: 5, B: 5, A: 1) bits for respective channels. Values are decoded into the range [0,1].
		 * 
		 * Values are specified using 16 bit integers, with red packed into the highest bits, green in the middle, blue lower, and alpha lowest.
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
		 * Exponent is always encoded in bits just above the mantissa (i.e `eeeeemmmmmm`). Red packed into the highest bits, green in the middle, blue lowest.
		 * It is recommended to use Uint32Array/Int32Array to avoid having to detect or deal with host endianness
		 */
		R11F_G11F_B10F,
		/**
		 * Fixed-point 4-channel format, with (R: 10, G: 10, B: 10, A: 2) bits for respective channels. Values are decoded into the range [0,1].
		 * 
		 * Values are specified using 32 bit integers, with red packed into the highest bits, green in the middle, blue lower, and alpha lowest.
		 * 
		 * It is recommended to use Uint32Array/Int32Array to avoid having to detect or deal with host endianness
		 */
		RGB10_A2,
		/**
		 * Fixed-point 4-channel format, with 4 bits per channels. Values are decoded into the range [0,1].
		 * 
		 * Values are specified using 16 bit integers, with red packed into the highest bits, green in the middle, blue lower, and alpha lowest.
		 * 
		 * It is recommended to use Uint16Array to avoid having to detect or deal with host endianness
		 */
		RGBA4,
		/**
		 * Floating-point 3-channel format, with 9 bits per channels, and an additional 5 bit shared exponent
		 * 
		 * Values are specified using 32 bit integers, with red packed into the LOWEST bits (unlike other formats), green in the middle, blue higher, and the exponent highest.
		 * 
		 * Colors are decoded for any given channel as `(channnel_value / 512) * pow(2, exponent - 15)`. The exponent can then be used to mimic a **HDR**-like effect, efficiently encoding very bright or very dim colors without loss in precision
		 * 
		 * It is recommended to use Uint32Array/Int32Array to avoid having to detect or deal with host endianness
		 */
		RGB9_E5,
		/** Unsigned 1-channel 8-bit format */ R8, /** Unsigned 2-channel 8-bit-per-channel format */ RG8, /** Unsigned 3-channel 8-bit-per-channel format */ RGB8, /** Unsigned 4-channel 8-bit-per-channel format */ RGBA8,
		/** Unsigned 1-channel 16-bit format */ R16, /** Unsigned 2-channel 16-bit-per-channel format */ RG16, /** Unsigned 3-channel 16-bit-per-channel format */ RGB16, /** Unsigned 4-channel 32-bit-per-channel format */ RGBA32,
		/** Unsigned 1-channel 32-bit format */ R32, /** Unsigned 2-channel 32-bit-per-channel format */ RG32, /** Unsigned 3-channel 32-bit-per-channel format */ RGB32, /** Unsigned 4-channel 32-bit-per-channel format */ RGBA32,
		/** Half-float 1-channel format */ R16F, /** Half-float 2-channel format */ RG16F,
		/** Half-float 3-channel format */ RGB16F, /** Half-float 4-channel format */ RGBA16F,
		/** Float 1-channel format */ R32F, /** Float 2-channel format */ RG32F,
		/** Float 3-channel format */ RGB32F, /** Float 4-channel format */ RGBA32F,
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
	/**
	 * Create an image-backed texture. This texture is lazily loaded from the source(s)
	 * @param src 
	 * @param options Texture options. See the `Texture.options` property (property can be changed at any time)
	 * @param format Texture format. See `Formats`. Cannot be changed later. Default: `Formats.RGBA`
	 * @param mipmaps Number of mipmaps to allocate. Default: 1 (_"no mipmaps"_)
	 */
	function Img(src: ImageSource | ImageSource[], options?: number, format?: Formats, mipmaps?: number): Texture

	interface Texture{
		/** Not all implementations support linear filtering (SMOOTH) for xxx32F textures. This boolean indicates if this kind of filtering is supported. If it is not, nearest-neighbor (pixelated) will be used instead for those texture types */
		static readonly FILTER_32F: boolean

		/**
		 * The maximum texture width supported by the underlying hardware
		 * According to OpenGL ES Specs, this value is required to be at least 2048, however virtually all environments will support at least 4096. Support for > 4096 is not very common.
		 */
		static readonly MAX_WIDTH: number
		/**
		 * The maximum texture height supported by the underlying hardware
		 * According to OpenGL ES Specs, this value is required to be at least 2048, however virtually all environments will support at least 4096. Support for > 4096 is not very common.
		 */
		static readonly MAX_HEIGHT: number
		/**
		 * The maximum number of layers per texture supported by the underlying hardware
		 * According to OpenGL ES Specs, this value is required to be at least 256, and this is what most environments support. For more layers, you should instead use atlases (combining textures vertically/horizontally/both), or use multiple textures.
		 */
		static readonly MAX_LAYERS: number

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
		 * Width, in pixels of a subtexture, when accounting for its crop
		 */
		readonly subWidth: number
		/**
		 * Height, in pixels of a subtexture, when accounting for its crop
		 */
		readonly subHeight: number
		/**
		 * Aspect ratio of a subtexture, i.e subWidth/subHeight.
		 * 
		 * Value will be < 1 for vertical textures, > 1 for horizontal textures and == 1 for square textures
		 */
		readonly aspectRatio: number

		/**
		 * Whether the image-backed texture is loaded.
		 * Always true for non-image-backed textures
		 */
		readonly loaded: boolean

		/**
		 * Whether the image-backed texture is currently being loaded.
		 * Always false for non-image-backed textures
		 */
		readonly waiting: boolean

		/** Used to make image-backed textures `await`able. Will trigger a load. */
		readonly then: ((resolve: (res: Texture) => any, reject: (err: any) => any) => void) | null

		/** `x` parameter used to define a subtexture. Can be safely modified at any time */
		x: number
		/** `y` parameter used to define a subtexture. Can be safely modified at any time */
		y: number
		/** `width` parameter used to define a subtexture. Can be safely modified at any time */
		w: number
		/** `height` parameter used to define a subtexture. Can be safely modified at any time */
		h: number
		/** `layer` parameter used to define a subtexture. Can be safely modified at any time */
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
		 * Trigger an image-backed texture to be loaded.
		 * 
		 * If the image is already loaded or loading (i.e `this.loaded || this.waiting`), this is a no-op.
		 * 
		 * Otherwise, `waiting` immediately becomes true, then, once the image has finished loading and the texture object has been populated, `loaded` will become true and `waiting` will become false
		 */
		load(): void

		/**
		 * Returns a subtexture. The underlying data pointed to by a subtexture is the same, so that modifications to a texture are seen through all its subtextures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and subtextures are of the same class and thus the same methods and properties are available on them
		 * 
		 * Coordinates are usually the range [0,1] however taking coordinates outside is completely valid and will use the texture's wrapping mode to fill the outside
		 * 
		 * @param l Layer. By default subtextures use the same layer as the texture they are made from, and the original texture object uses layer 0
		 */
		sub(x: number, y: number, w: number, h: number, l?: number): Texture

		/**
		 * Returns a "super texture" subtexture. The underlying data pointed to by a subtexture is the same, so that modifications to a texture are seen through all its subtextures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and subtextures are of the same class and thus the same methods and properties are available on them
		 * 
		 * Unlike .sub(), the subtexture returned is such that its subtexture defined by the provided values contains the whole of this texture. In other words, `tex.super(a, b, c, d).sub(a, b, c, d)` is the same as `tex`
		 * 
		 * @param l Layer. By default subtextures use the same layer as the texture they are made from, and the original texture object uses layer 0
		 */
		super(x: number, y: number, w: number, h: number, l?: number): Texture

		/**
		 * Returns a subtexture. The underlying data pointed to by a subtexture is the same, so that modifications to a texture are seen through all its subtextures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and subtextures are of the same class and thus the same methods and properties are available on them
		 * 
		 * Unlike .sub(), the provided values are measured in pixels and usually in the range [0,w] / [0,h]
		 * 
		 * @param l Layer. By default subtextures use the same layer as the texture they are made from, and the original texture object uses layer 0
		 */
		crop(x: number, y: number, w: number, h: number, l?: number): Texture

		/**
		 * Returns a subtexture. The underlying data pointed to by a subtexture is the same, so that modifications to a texture are seen through all its subtextures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and subtextures are of the same class and thus the same methods and properties are available on them
		 * 
		 * The subtexture is not cropped in any way: only the layer is changed
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
		 * @param srcLayers Nnumber of layers to copy. Defaults to the source's layer count
		 * @param srcMip Which mipmap to read data from in the source texture. Default: 0
		 * @param dstMip Which mipmap to write data to. Default: 0
		 */
		paste(tex: Texture, x?: number, y?: number, layer?: number, dstMip?: number, srcX?: number, srcY?: number, srcLayer?: number, srcWidth?: number, srcHeight?: number, srcLayers?: number, srcMip?: number): this

		/**
		 * Copy data from an image-like (img) object to another (this)
		 * @param img The source to copy data from
		 * @param x Left edge of area to paste, in pixels. Default: 0
		 * @param y Bottom edge of area to paste, in pixels. Default: 0
		 * @param layer First layer of area to paste. Default: 0
		 * @param dstMip Which mipmap to write data to. Default: 0
		 */
		paste(img: ImageSource, x?: number, y?: number, layer?: number, dstMip?: number): Promise<this>

		/**
		 * Copy data from a drawable object (other than the main canvas target) to this
		 * @param ctx The source to copy data from
		 * @param x Left edge of area to paste, in pixels. Default: 0
		 * @param y Bottom edge of area to paste, in pixels. Default: 0
		 * @param layer First layer of area to paste. Default: 0
		 * @param srcX Left edge of area to copy data from in the source texture, in pixels. Default: 0
		 * @param srcY Bottom edge of area to copy data from in the source texture, in pixels. Default: 0
		 * @param srcWidth Width of area to copy in pixels. Defaults to the source's width
		 * @param srcHeight Height of area to copy in pixels. Defaults to the source's height
		 * @param dstMip Which mipmap to write data to. Default: 0
		 */
		paste(ctx: Drawable, x?: number, y?: number, layer?: number, dstMip?: number, srcX?: number, srcY?: number, srcWidth?: number, srcHeight?: number): this

		/**
		 * Copy data from memory to this texture
		 * @param data A `TypedArray` of the correct type and size (see table below)
		 * @param x Left edge of area to paste, in pixels. Default: 0
		 * @param y Bottom edge of area to paste, in pixels. Default: 0
		 * @param layer First layer of area to paste. Default: 0
		 * @param width Width of area to paste in pixels. Defaults to this texture's width
		 * @param height Height of area to paste in pixels. Defaults to this texture's height
		 * @param layers Nnumber of layers to paste. Defaults to this texture's number of layers
		 * @param mip Which mipmap to write data to. Default: 0
		 * 
		 * | For format                        | Use                                | of length          |
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
		pasteData(data: Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Float16Array | Float32Array, x?: number, y?: number, layer?: number, width?: number, height?: number, layers?: number, mip?: number)

		/**
		 * Copy data from this texture to memory
		 * @param x Left edge of area to copy from, in pixels. Default: 0
		 * @param y Bottom edge of area to copy from, in pixels. Default: 0
		 * @param layer First layer of area to copy from. Default: 0
		 * @param width Width of area to copy from in pixels. Defaults to this texture's width
		 * @param height Height of area to copy from in pixels. Defaults to this texture's height
		 * @param layers Number of layers to copy. Defaults to this texture's number of layers
		 * @param mip Which mipmap to read data from. Default: 0
		 * @param data A `TypedArray` of the correct type and size (see table below). If none is passed, one is created and returned
		 * 
		 * | For format                        | Use                                | of length          |
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
		readData<T = ArrayBufferView>(x?: number, y?: number, l?: number, w?: number, h?: number, d?: number, data?: T, mip?: number): T
		readData<T = ArrayBufferView>(x?: number, y?: number, l?: number, w?: number, h?: number, d?: number, mip: number, data?: T): T
		
		/**
		 * Set the range of mipmaps that can be used by this texture during drawing
		 * @param min Lowest (highest-resolution) mipmap, inclusive, where the original texture is mipmap `0`
		 * @param max Highest (lowest-resolution) mipmap, inclusive. Omit to set no upper bound
		 */
		setMipmapRange(min?: number, max?: number)
		/**
		 * Regenerate all mipmaps from the original texture (mipmap 0)
		 * 
		 * Note that this method has no effect on image-backed textures as their mipmaps (if present) are automatically generated on load, and the texture contents are immutable, so mipmaps never change
		 */
		genMipmaps(): void

		/**
		 * Free the resources of this texture as soon as possible. It is invalid to use the texture object for anything beyond this point, the object should be "forgotten" and cannot be reinitialized.
		 * Under the hood, the texture's data will be freed by the GPU once all draw operations using it have finished
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
	 * Create a drawable context for a single layer of a texture
	 * @param tex The texture that draw operations will write to
	 * @param layer Which layer to draw stuff to
	 * @param mip If the texture has mipmaps, they cannot all be modified simultaneously for performance reasons. To draw to all mipmaps, draw to mipmap 0 and then call tex.genMipmaps() once done to generate all other mipmaps from mipmap 0
	 * @param stencil Whether to also allocate a stencil buffer for IF_SET/IF_UNSET/SET/UNSET functionality. When this parameter is false, the stencil buffer will not be allocated and will behave as if it is always 0. Default: false (for performance reasons. Set to true only when you actually need it)
	 */
	function Drawable(tex: Texture, layer?: number, mip?: number, stencil?: boolean): Drawable
	/**
	 * Create a multisampled drawable context
	 * @param width Width of draw target, in logical pixels
	 * @param height Height of draw target, in logical pixels
	 * @param format Most hardware will only support RGBA8, RGB565, RGBA4 and RGB5_A1
	 * @param msaa How many samples per logical pixel to allocate. This is a hint and the actual value may be rounded or clamped. Set to a high value like 64 to use as many as available.
	 * @param stencil Whether to also allocate a stencil buffer for IF_SET/IF_UNSET/SET/UNSET functionality. When this parameter is false, the stencil buffer will not be allocated and will behave as if it is always 0. Default: false (for performance reasons. Set to true only when you actually need it)
	 */
	function DrawableMSAA(width: number, height: number, format: Formats, msaa: number, stencil?: boolean): Drawable

	// .mask
	const R = 1, G = 2, B = 4, A = 8, RGB = 7, RGBA = 15
	const IF_SET = 16, IF_UNSET = 32, NO_DRAW = 48,
	const UNSET = 64, SET = 128, FLIP = 192


	// Blend
	const ONE = 17, ZERO = 0, RGB_ONE = 1, A_ONE = 16,
	SRC = 34, RGB_SRC = 2,
	ONE_MINUS_SRC = 51,
	RGB_ONE_MINUS_SRC = 3,
	SRC_ALPHA = 68,
	RGB_SRC_ALPHA = 4,
	A_SRC = 64,
	ONE_MINUS_SRC_ALPHA = 85,
	RGB_ONE_MINUS_SRC_ALPHA = 5,
	A_ONE_MINUS_SRC = 80,
	DST = 136, RGB_DST = 8,
	ONE_MINUS_DST = 153,
	RGB_ONE_MINUS_DST = 9,
	DST_ALPHA = 102,
	RGB_DST_ALPHA = 6,
	A_DST = 96,
	ONE_MINUS_DST_ALPHA = 119,
	RGB_ONE_MINUS_DST_ALPHA = 7,
	A_ONE_MINUS_DST = 112,
	SRC_ALPHA_SATURATE = 170,
	RGB_SRC_ALPHA_SATURATE = 10,
	ADD = 17, RGB_ADD = 1, A_ADD = 16,
	SUB = 85,
	RGB_SUB = 5,
	A_SUB = 80,
	SUB_REV = 102,
	RGB_SUB_REV = 6,
	A_SUB_REV = 96,
	MIN = 34, RGB_MIN = 2, A_MIN = 32,
	MAX = 51, RGB_MAX = 3, A_MAX = 48
	// Shader params
	const FLOAT = 0, VEC2 = 1, VEC3 = 2, VEC4 = 3,
	INT = 16, IVEC2 = 17, IVEC3 = 18, IVEC4 = 19,
	UINT = 32, UVEC2 = 33, UVEC3 = 34, UVEC4 = 35,
	TEXTURE = 20, UTEXTURE = 24, FTEXTURE = 28, COLOR = 4, UCOLOR = 8, FCOLOR = 12,
	FIXED = 4
	// Geometry types
	const TRIANGLE_STRIP = 5, TRIANGLES = 4, TRIANGLE_FAN = 6, LINE_LOOP = 2, LINE_STRIP = 3, LINES = 1, POINTS = 0

	function vec2(x?: number, y?: number): {x: number, y: number}
	function vec3(x?: number, y?: number, z?: number): {x: number, y: number, z: number}
	function vec4(x?: number, y?: number, z?: number, w?: number): {x: number, y: number, z: number, w: number}

class can{
	t;#a;#b;#c;#d;#e;#f;#m;#shader;s
	get width(){return this.t.w}
	get height(){return this.t.h}
	get texture(){return this.t.img}
	set texture(i){
		const t = this.t
		if(!t.img||!i) return
		if(ca==t) i&&draw(), ca=null
		t.img = i
	}
	get hasStencil(){return !this.t.img||!!this.t.stencilBuf}
	set hasStencil(s){
		let t = this.t, b = t.stencilBuf
		if(!t.img) return
		if(s){
			if(b) return
			if(ca==t) i&&draw(), ca=null
			gl.bindRenderbuffer(gl.RENDERBUFFER, t.stencilBuf = b = gl.createRenderbuffer())
			gl.renderbufferStorage(gl.RENDERBUFFER, 36168, t.w, t.h)
		}else{
			if(!b) return
			if(ca==t) i&&draw(), ca=null
			t.stencilBuf = null
			gl.deleteRenderbuffer(b)
		}
	}
	get textureLayer(){return this.t.layer}
	get textureMipmap(){return this.t.mip}
	set textureLayer(l=0){
		if(ca==t) i&&draw(), ca=null
		this.t.layer = l
	}
	set textureMipmap(m=0){
		if(ca==t) i&&draw(), ca=null
		this.t.mip = m
	}
	constructor(t,a=1,b=0,c=0,d=1,e=0,f=0,m=290787599,s=$.Shader.DEFAULT,sp=defaultShape){this.t=t;this.#a=a;this.#b=b;this.#c=c;this.#d=d;this.#e=e;this.#f=f;this.#m=m;this.#shader=s;this.s=sp}
	translate(x=0,y=0){ this.#e+=x*this.#a+y*this.#c;this.#f+=x*this.#b+y*this.#d }
	scale(x=1,y=x){ this.#a*=x; this.#b*=x; this.#c*=y; this.#d*=y }
	rotate(r=0){
		const cs = cos(r), sn = sin(r), a=this.#a,b=this.#b,c=this.#c,d=this.#d
		this.#a=a*cs-c*sn; this.#b=b*cs-d*sn
		this.#c=a*sn+c*cs; this.#d=b*sn+d*cs
	}
	transform(a,b,c,d,e,f){
		const A=this.#a,B=this.#b,C=this.#c,D=this.#d,E=this.#e,F=this.#f
		this.#a = A*a+C*b; this.#b = B*a+D*b
		this.#c = A*c+C*d; this.#d = B*c+D*d
		this.#e = A*e+C*f+E; this.#f = B*e+D*f+F
	}
	skew(x=0, y=0){
		const ta=this.#a,tb=this.#b
		this.#a+=this.#c*y; this.#b+=this.#d*y
		this.#c+=ta*x; this.#d+=tb*x
	}
	multiply(x=1, y=0){
		const ta=this.#a,tb=this.#b
		this.#a=ta*x-this.#c*y;this.#b=tb*x-this.#d*y
		this.#c=ta*y+this.#c*x;this.#d=tb*y+this.#d*x
	}
	getTransform(){ return {a: this.#a, b: this.#b, c: this.#c, d: this.#d, e: this.#e, f: this.#f} }
	new(a=1,b=0,c=0,d=1,e=0,f=0){return new can(this.t,a,b,c,d,e,f,this.#m,this.#shader,this.s)}
	reset(a=1,b=0,c=0,d=1,e=0,f=0){this.#a=a;this.#b=b;this.#c=c;this.#d=d;this.#e=e;this.#f=f;this.#m=290787599;this.#shader=$.Shader.DEFAULT;this.s=defaultShape}
	box(x=0,y=0,w=1,h=w){ this.#e+=x*this.#a+y*this.#c; this.#f+=x*this.#b+y*this.#d; this.#a*=w; this.#b*=w; this.#c*=h; this.#d*=h }
	to(x=0, y=0){ if(typeof x=='object'){y=x.y;x=x.x} return new _vec2(this.#a*x+this.#c*y+this.#e,this.#b*x+this.#d*y+this.#f)}
	from(x=0, y=0){
		if(typeof x=='object'){y=x.y;x=x.x}
		const a=this.#a,b=this.#b,c=this.#c,d=this.#d, det = a*d-b*c
		return new _vec2(
			(x*d - y*c + c*this.#f - d*this.#e)/det,
			(y*a - x*b + b*this.#e - a*this.#f)/det
		)
	}
	toDelta(dx=0, dy=0){ if(typeof dx=='object'){dy=dx.y;dx=dx.x} return new _vec2(this.#a*dx+this.#c*dy,this.#b*dx+this.#d*dy)}
	fromDelta(dx=0, dy=0){
		if(typeof dx=='object'){dy=dx.y;dx=dx.x}
		const a=this.#a,b=this.#b,c=this.#c,d=this.#d, det = a*d-b*c
		return new _vec2((dx*d-dy*c)/det, (dy*a-dx*b)/det)
	}
	determinant(){return this.#a*this.#d-this.#b*this.#c}
	pixelRatio(){return sqrt((this.#a*this.#d-this.#b*this.#c)*this.t.w*this.t.h)}
	sub(){ return new can(this.t,this.#a,this.#b,this.#c,this.#d,this.#e,this.#f,this.#m,this.#shader,this.s) }
	resetTo(m){ this.#a=m.#a;this.#b=m.#b;this.#c=m.#c;this.#d=m.#d;this.#e=m.#e;this.#f=m.#f;this.#m=m.#m;this.#shader=m.#shader;this.s=m.s }
	set shader(sh){ this.#shader=typeof sh=='function'?sh:$.Shader.DEFAULT }
	get shader(){return this.#shader}
	set mask(m){this.#m=this.#m&-256|m&255}
	get mask(){return this.#m&255}
	set blend(b){this.#m=this.#m&255|(b||1135889)<<8}
	get blend(){return this.#m>>8}
	get geometry(){return this.s}
	set geometry(a){this.s=a||defaultShape}
	draw(...values){
		setv(this.t,this.#m); const i = this.#shader(values)
		arr[i  ] = this.#a; arr[i+1] = this.#c; arr[i+2] = this.#e
		arr[i+3] = this.#b; arr[i+4] = this.#d; arr[i+5] = this.#f
	}
	drawRect(x=0, y=0, w=1, h=1, ...values){
		setv(this.t,this.#m); const i = this.#shader(values)
		arr[i  ] = this.#a*w; arr[i+1] = this.#c*h; arr[i+2] = this.#e+x*this.#a+y*this.#c
		arr[i+3] = this.#b*w; arr[i+4] = this.#d*h; arr[i+5] = this.#f+x*this.#b+y*this.#d
	}
	drawMat(a=1, b=0, c=0, d=1, e=0, f=0, ...values){
		setv(this.t,this.#m); const i = this.#shader(values)
		const ta=this.#a,tb=this.#b,tc=this.#c,td=this.#d,te=this.#e,tf=this.#f
		arr[i  ] = ta*a+tc*b; arr[i+1] = ta*c+tc*d; arr[i+2] = ta*e+tc*f+te
		arr[i+3] = tb*a+td*b; arr[i+4] = tb*c+td*d; arr[i+5] = tb*e+td*f+tf
	}
	drawv(values){
		setv(this.t,this.#m); const i = this.#shader(values)
		arr[i  ] = this.#a; arr[i+1] = this.#c; arr[i+2] = this.#e
		arr[i+3] = this.#b; arr[i+4] = this.#d; arr[i+5] = this.#f
	}
	drawRectv(x=0, y=0, w=1, h=1, values){
		setv(this.t,this.#m); const i = this.#shader(values)
		arr[i  ] = this.#a*w; arr[i+1] = this.#c*h; arr[i+2] = this.#e+x*this.#a+y*this.#c
		arr[i+3] = this.#b*w; arr[i+4] = this.#d*h; arr[i+5] = this.#f+x*this.#b+y*this.#d
	}
	drawMatv(a=1, b=0, c=0, d=1, e=0, f=0, values){
		setv(this.t,this.#m); const i = this.#shader(values)
		const ta=this.#a,tb=this.#b,tc=this.#c,td=this.#d,te=this.#e,tf=this.#f
		arr[i  ] = ta*a+tc*b; arr[i+1] = ta*c+tc*d; arr[i+2] = ta*e+tc*f+te
		arr[i+3] = tb*a+td*b; arr[i+4] = tb*c+td*d; arr[i+5] = tb*e+td*f+tf
	}
	dup(){
		if(!i) return
		const s = sh.count
		if(i+s>arr.length) grow()
		for(let j=i-s;j<i;j++)iarr[j+s]=iarr[j]
		arr[i  ] = this.#a; arr[i+1] = this.#c; arr[i+2] = this.#e
		arr[i+3] = this.#b; arr[i+4] = this.#d; arr[i+5] = this.#f
		i += s
	}
	dupRect(x=0, y=0, w=1, h=1, i){
		if(!i) return
		const s = sh.count
		if(i+s>arr.length) grow()
		for(let j=i-s;j<i;j++)iarr[j+s]=iarr[j]
		arr[i  ] = this.#a*w; arr[i+1] = this.#c*h; arr[i+2] = this.#e+x*this.#a+y*this.#c
		arr[i+3] = this.#b*w; arr[i+4] = this.#d*h; arr[i+5] = this.#f+x*this.#b+y*this.#d
		i += s
	}
	dupMat(a=1, b=0, c=0, d=1, e=0, f=0, i){
		if(!i) return
		const s = sh.count
		if(i+s>arr.length) grow()
		for(let j=i-s;j<i;j++)iarr[j+s]=iarr[j]
		const ta=this.#a,tb=this.#b,tc=this.#c,td=this.#d,te=this.#e,tf=this.#f
		arr[i  ] = ta*a+tc*b; arr[i+1] = ta*c+tc*d; arr[i+2] = ta*e+tc*f+te
		arr[i+3] = tb*a+td*b; arr[i+4] = tb*c+td*d; arr[i+5] = tb*e+td*f+tf
		i += s
	}
	clear(r = 0, g = r, b = r, a = g){
		if(typeof r=='object')a=r.w??0,b=r.z??0,g=r.y,r=r.x
		i&&draw()
		setv(this.t, this.#m)
		gl.clearColor(r, g, b, a)
		const q = this.t.stencil=this.t.stencil+1&7
		gl.clear(q?16384:(gl.stencilMask(255), 17408))
		gl.disable(2960); pmask &= -241
	}
	clearStencil(){
		i&&draw()
		setv(this.t, this.#m)
		const q = this.t.stencil=this.t.stencil+1&7
		if(!q) gl.stencilMask(255), gl.clear(1024)
		gl.disable(2960); pmask &= -241
	}
}
$.Blend = T = (src = 17, combine = 17, dst = 0, dither=false) => src|dst<<8|combine<<16|dither<<23
Object.assign(T, {
	REPLACE: 1114129,
	DEFAULT: 1135889,
	ADD: 1118481,
	MULTIPLY: 1122816,
	SUBTRACT: 5574929,
	REVERSE_SUBTRACT: 6689041,
	MIN: 2232593, MAX: 3346705,
	BEHIND: 1118583,
	INVERT: 1127321
})
T = $.Geometry = (type, points) => {
	if(points.length&3) throw 'points.length is not a multiple of 4'
	if(!(points instanceof Float32Array)){
		T = new Float32Array(points.length)
		T.set(points, 0); points = T
	}
	const b = gl.createBuffer()
	gl.bindBuffer(34962, b)
	gl.bufferData(34962, points, 35044)
	b.type = type
	gl.bindBuffer(34962, buf)
	return {type, b, start: 0, length: points.length>>2, sub}
}
T.DEFAULT = T($.TRIANGLE_STRIP, [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1])
T = $.Shader = (src, inputs, defaults, uniforms, uDefaults, output=4, frat=0.5) => {
	inputs = typeof inputs=='number' ? [inputs] : inputs || []
	uniforms = typeof uniforms=='number' ? [uniforms] : uniforms || []
	defaults = defaults != null ? Array.isArray(defaults) ? defaults : [defaults] : []
	uDefaults = uDefaults != null ? Array.isArray(uDefaults) ? uDefaults : [uDefaults] : []
	s.uniforms
	return s
}
T.DEFAULT = sh = T(`void main(){color=arg0()*arg1;}`, [$.COLOR, $.VEC4], [void 0, $.vec4.one])
T.UINT = T(`void main(){color=arg0();}`, $.UCOLOR, void 0, void 0, void 0, $.UINT)
T.NONE = T(`void main(){color=vec4(0,0,0,1);}`)
$.flush = () => i&&draw()
const ctx = $.ctx = new can(ca={tex:gl.canvas,img:null,layer:0,stencil:0,mip:0,stencilBuf:null,w:0,h:0})
$.setSize = (w = 0, h = 0) => {
	ctx.t.w = gl.canvas.width = w
	ctx.t.h = gl.canvas.height = h
	if(ca==ctx.t) gl.viewport(0, 0, w, h)
}
$.wait = () => new Promise()
$.loop = render => {
	if('t' in $) return $
	$.frameDrawCalls = 0
	$.frameSprites = 0
	$.frameData = 0
	$.t = performance.now()*.001; $.dt = 0
	$.timeToFrame = 0
	$.glLost ??= null
	requestAnimationFrame(function f(){
		requestAnimationFrame(f)
		if(gl.isContextLost?.()) return $.glLost?.(), $.glLost = fencetail = fencehead = null
		i&&draw()
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
		ca = ctx.t; gl.viewport(0, 0, ca.w, ca.h)
		dt = max(.001, min(-($.t-($.t=performance.now()*.001)), .5))
		$.frameDrawCalls = fdc; $.frameSprites = fs; $.frameData = fd*4+fdc*24; fdc = fs = fd = 0
		ctx.reset(); try{ render() }catch(e){ Promise.reject(e) } i&&draw()
		timeToFrame = performance.now()*.001 - $.t
	})
	return gl.canvas
}
}