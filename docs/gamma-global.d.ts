// © 2025 Matthew Reiner. https://github.com/BlobTheKat/gamma
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

	type vec2 = { x: number, y: number }
	/**
	 * Construct a 2-component vector, in the shape {x, y}
	 * @performance This function is very fast and usually inlined, however consider using numbers individually rather than constructing many vectors if performance is absolutely critical
	 */
	function vec2(x?: number, y?: number): vec2
	namespace vec2{
		const zero: vec2
		const one: vec2
		function add(a: vec2, b: vec2 | number): vec2
		function subtract(a: vec2 | number, b: vec2): vec4
		function multiply(a: vec2, b: vec2 | number): vec2
		function magnitude(a: vec2): number
		function normalize(a: vec2): vec2
	}
	type vec3 = {x: number, y: number, z: number}
	/**
	 * Construct a 3-component vector, in the shape {x, y, z}
	 * @performance This function is very fast and usually inlined, however consider using numbers individually rather than constructing many vectors if performance is absolutely critical
	 */
	function vec3(x?: number, y?: number, z?: number): vec3
	namespace vec3{
		const zero: vec3
		const one: vec3
		function add(a: vec3, b: vec3 | number): vec3
		function subtract(a: vec3 | number, b: vec3): vec3
		function multiply(a: vec3, b: vec3 | number): vec3
		function magnitude(a: vec3): number
		function normalize(a: vec3): vec3
	}
	type vec4 = {x: number, y: number, z: number, w: number}
	/**
	 * Construct a 4-component vector, in the shape {x, y, z, w}
	 * @performance This function is very fast and usually inlined, however consider using numbers individually rather than constructing many vectors if performance is absolutely critical
	 */
	function vec4(x?: number, y?: number, z?: number, w?: number): vec4
	namespace vec4{
		const zero: vec4
		const one: vec4
		function add(a: vec4, b: vec4 | number): vec4
		function subtract(a: vec4 | number, b: vec4): vec4
		function multiply(a: vec4, b: vec4 | number): vec4
		function magnitude(a: vec4): number
		function normalize(a: vec4): vec4
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

		/**
		 * Depth texture, can be used by targets' `-1` slot to perform depth testing, or can be used much like a float texture, but with `dGetValue()`/`dGetPixel()`
		 */
		DEPTH32F,
		/**
		 * Stencil texture, can be used by targets' `-1` slot to perform stencil testing. Cannot be used by shaders, cannot perform CPU/GPU read/write operations such `readData()` or `pasteData()`
		 */
		STENCIL,
		/**
		 * Depth/stencil texture, can be used by targets' `-1` slot to perform depth and stencil testing together, or can be used identically to a depth texture.
		 */
		DEPTH32F_STENCIL,
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

		/** Anisotropy value supported by the hardware. If anisotropic filtering is not supported, the value will be `0` */
		const ANISOTROPY: number

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

		/** Maximum number of samples per pixels supported by the underlying hardware. Any value you pass to `Texture.Surface()` higher than this will be clamped to this value */
		const MAX_MSAA: number

		interface Surface{
			/** Width of the surface in logical pixels */
			readonly width: number
			/** Height of the surface in logical pixels */
			readonly height: number
			/** Number of samples per pixel for this surface */
			readonly msaa: number
			/** Surface format. See `Formats` */
			readonly format: Formats
			/**
			 * Copy data from this surface to CPU memory, asynchronously
			 * 
			 * This method is asynchronous due to how GPUs work: The CPU send commands to the GPU, but for performance reasons, the CPU does not wait for the GPU to finish executing those commands before moving on. This means that if we were to read data back immediately, we would have to wait for the GPU to finish all previous commands, which could be very slow. Instead, we issue a command to copy the surface data to a temporary buffer, then later, when that command has finished executing, we copy that temporary buffer to CPU memory and resolve the promise with that data. Despite this, the data is still guaranteed to be from the time readData() was called (i.e any draw operations issued after readData() will not be reflected in the data returned by the promise)
			 * 
			 * Note that reading from the main target (the canvas) is not possible. Instead, draw to a separate Drawable, paste it to the main target, and read from the drawable
			 * 
			 * @param x Left edge of area to copy from, in pixels. Default: 0
			 * @param y Bottom edge of area to copy from, in pixels. Default: 0
			 * @param width Width of area to copy from in pixels. Defaults to this surface's width
			 * @param height Height of area to copy from in pixels. Defaults to this surface's height
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
			 * | DEPTH32F, DEPTH32F_STENCIL        | `Float32Array`                     | `w*h*d`            |
			 * | STENCIL                           | Invalid                            | Invalid            |
			 */
			readData(x?: number, y?: number, w?: number, h?: number): Promise<ArrayBufferView>
			/**
			 * Free the resources of this surface as soon as possible. It is invalid to use the surface object for anything beyond this point, the object should be "forgotten"
			 * Under the hood, the surface's data will be freed by the GPU once all draw operations using it have finished
			 * 
			 * @performance This method is relatively fast, however, consider reusing surfaces where possible rather than quickly creating and deleting them, as reconstruction will be expensive and older drivers might not be optimized for rapid texture freeing/allocation
			 */
			delete(): void
		}
		/**
		 * Create a (possibly multisampled) surface
		 * 
		 * @param width Width of surface, in logical pixels
		 * @param height Height of surface, in logical pixels
		 * @param format Most hardware will only support `Formats.RGBA8`, `Formats.RGB565`, `Formats.RGBA4`, `Formats.RGB5_A1`, `Formats.DEPTH32F`, `Formats.DEPTH32F_STENCIL`, and `Formats.STENCIL`
		 * @param msaa How many samples per logical pixel to allocate. This is a hint; the actual value may be rounded or clamped. Set to a high value (e.g, 256) to use as many samples as available
		 * 
		 * @performance This method performs the allocation of the target, which may use a lot of video memory, dependent on the MSAA value requested. Drawing to a multisampled target will not perform more shader invocation but may slow down rendering due to slower rasterization and greatly increased video memory access
		 */
		function Surface(width: number, height: number, msaa: number, format: Formats): Surface
		
		/**
		 * Create an image-backed texture. This texture is lazily loaded from the source(s)
		 * @param src 
		 * @param options Texture options. See the `Texture.options` property (property can be changed at any time)
		 * @param format Texture format. See `Formats`. Cannot be changed later. Default: `Formats.RGBA`
		 * @param mipmaps Number of mipmaps to allocate. Default: 1 (_"no mipmaps"_)
		 */
		function from(src: ImageSource | ImageSource[], options?: number, format?: Formats, mipmaps?: number): Texture & Promise<Texture>
	}
	class Texture{

		/** An opaque object that will compare === for a `Texture` and its sub-`Texture`s, which are backed by the same underlying texture data */
		readonly identity: opaque

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
		/** MSAA value. Since WebGL2 does not support MSAA textures, this value is always 0 */
		readonly msaa: number

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
		 * Whether the image-backed texture is loaded. Reading this property will cause the texture to be loaded in the background if it isn't already
		 * Always true for non-image-backed textures
		 */
		get usable(): boolean

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
		 * - `UPSCALE_SMOOTH`: Perform linear sampling when the texture is upscaled. This makes the texture look blurry or "smoother", rather than pixelated
		 * 
		 * - `DOWNSCALE_SMOOTH`: Perform linear sampling when the texture is downscaled. This is mainly to reduce moiré effects
		 * 
		 * - `MIPMAP_SMOOTH`: Perform blending between multiple mipmaps to further reduce moiré effects and reduce visible seams with animations involving scaling. This has no effect on textures without mipmaps
		 * 
		 * - `REPEAT`: Coordinates outside [0,1] will repeat (tile) the texture infinitely
		 * - `REPEAT_X`, `REPEAT_Y`: Same as `REPEAT` but for the X or Y axis only. These values can be OR'd, i.e `(REPEAT_X | REPEAT_Y) == REPEAT`
		 * 
		 * - `REPEAT_MIRRORED`: Coordinates outside [0,1] will repeat (tile) the texture infinitely
		 * - `REPEAT_MIRRORED_X`, `REPEAT_MIRRORED_Y`: Same as `REPEAT` but for the X or Y axis only. These values can be OR'd appropriately, e.g `REPEAT_X | REPEAT_MIRRORED_Y`
		 * 
		 * - `ANISOTROPY`: Enables anisotropic filtering, which performs more samples, especially utilizing mipmaps, to create a sample that is mathematically much closer to ideal sampling, one that blends the entire portion of the texture that a rendered pixel covers. This gives much nicer visuals especially for stretched faces, without the hard transitions or blurs of using mipmaps alone. This flag enables anisotropic filtering whenever it is available in hardware or an sufficiently fast method is available in software (this is decided by the browser). If it is not available, this flag does nothing. Depending on the hardware/driver, anisotropy may also implicitly enable DOWNSCALE_SMOOTH and/or UPSCALE_SMOOTH
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
		sub(x: number, y: number, w: number, h: number, l?: number): typeof this

		/**
		 * Returns a "super texture" sub-texture. The underlying data pointed to by a sub-texture is the same, so that modifications to a texture are seen through all its sub-textures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and sub-textures are of the same class and thus the same methods and properties are available on them
		 * 
		 * Unlike .sub(), the sub-texture returned is such that its sub-texture defined by the provided values contains the whole of this texture. In other words, `tex.super(a, b, c, d).sub(a, b, c, d)` is the same as `tex`
		 * 
		 * @param l Layer. By default sub-textures use the same layer as the texture they are made from, and the original texture object uses layer 0
		 * 
		 * @performance This method is CPU-arithmetic, very fast. Slightly slower than .sub() due to the use of division
		 */
		super(x: number, y: number, w: number, h: number, l?: number): typeof this

		/**
		 * Returns a sub-texture. The underlying data pointed to by a sub-texture is the same, so that modifications to a texture are seen through all its sub-textures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and sub-textures are of the same class and thus the same methods and properties are available on them
		 * 
		 * Unlike .sub(), the provided values are measured in pixels and usually in the range [0,w] / [0,h]
		 * 
		 * @param l Layer. By default sub-textures use the same layer as the texture they are made from, and the original texture object uses layer 0
		 * 
		 * @performance This method is CPU-arithmetic, however for image-backed textures, it will trigger a load if the texture is not yet loaded (in order to obtain the texture's width/height)
		 */
		crop(x: number, y: number, w: number, h: number, l?: number): this extends Promise<Texture> ? typeof this : Texture

		/**
		 * Returns a sub-texture. The underlying data pointed to by a sub-texture is the same, so that modifications to a texture are seen through all its sub-textures. A `Texture` object is then just a view into its backing data. This is analogous to `TypedArray`s, `DataView` or `Buffer` being views into an `ArrayBuffer`. Note that all textures and sub-textures are of the same class and thus the same methods and properties are available on them
		 * 
		 * The sub-texture is not cropped in any way: only the layer is changed
		 * 
		 * @performance This method is CPU-arithmetic, very fast
		 */
		layer(layer: number): typeof this

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
		 * @performance This method performs a GPU-GPU copy, which is faster than uploading a texture. If the texture was recently used then this will create a light draw boundary (See `Drawable2D.draw()` for more info)
		 */
		paste(tex: Texture, x?: number, y?: number, layer?: number, dstMip?: number, srcX?: number, srcY?: number, srcLayer?: number, srcWidth?: number, srcHeight?: number, srcLayers?: number, srcMip?: number): this extends Promise<Texture> ? this|null : this

		/**
		 * Copy data from an image-like (img) object to another (this)
		 * @param img The source to copy data from
		 * @param x Left edge of area to paste, in pixels. Default: 0
		 * @param y Bottom edge of area to paste, in pixels. Default: 0
		 * @param layer First layer of area to paste. Default: 0
		 * @param dstMip Which mipmap to write data to. Default: 0
		 * @returns `this`, or `null` if this is an image-backed texture that is not loaded yet
		 * 
		 * @performance This method performs an upload to the GPU, which is primarily bandwidth-bound for typical-size textures. Extra preprocessing may be done for certain source types (e.g <img> elements), which may be CPU-bound. It is recommended to use ImageBitmap sources where possible (with the correct options provided by Gamma.bitmapOpts), as they are GPU-ready by design. It may also cause partial pipeline stalls if following draw operations depend on the texture data but have to wait for the upload to finish, however this is mostly mitigated with modern drivers. If the texture was recently used then this will create a light draw boundary (See `Drawable2D.draw()` for more info)
		 */
		paste(img: ImageSource, x?: number, y?: number, layer?: number, dstMip?: number): this extends Promise<Texture> ? this|null : this

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
		 * @performance This method performs an upload to the GPU, which is primarily bandwidth-bound for typical-size textures. It may also cause partial pipeline stalls if following draw operations depend on the texture data but have to wait for the upload to finish, however this is mostly mitigated with modern drivers. If the texture was recently used then this will create a light draw boundary (See `Drawable2D.draw()` for more info)
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
		pasteData(data: Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Float16Array | Float32Array, x?: number, y?: number, layer?: number, width?: number, height?: number, layers?: number, mip?: number): this extends Promise<Texture> ? this|null : this

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
		 * | DEPTH32F, DEPTH32F_STENCIL        | `Float32Array`                     | `w*h*d`            |
		 * | STENCIL                           | Invalid                            | Invalid            |
		 */
		readData(x?: number, y?: number, l?: number, w?: number, h?: number, d?: number, mip?: number): this extends Promise<Texture> ? Promise<ArrayBufferView>|null : Promise<ArrayBufferView>
		
		/**
		 * Set the range of mipmaps that can be used by this texture during drawing
		 * @param min Lowest (highest-resolution) mipmap, inclusive, where the original texture is mipmap `0`
		 * @param max Highest (lowest-resolution) mipmap, inclusive. Omit to set no upper bound
		 * 
		 * @performance This method is mostly CPU-only logic, and relatively fast. If the texture was recently used then this will create a light draw boundary (See `Drawable2D.draw()` for more info)
		 */
		setMipmapRange(min?: number, max?: number): void
		/**
		 * Regenerate all mipmaps from the original texture (mipmap 0)
		 * 
		 * Note that this method has no effect on image-backed textures as their mipmaps (if present) are automatically generated on load, and the texture contents are immutable, so mipmaps never change
		 * 
		 * @performance This method is performed entirely on the GPU, and processes the entire texture, which is relatively slow, especially if only a small portion of the texture has changed. Consider calling this as late as possible, ideally only once you are absolutely sure you need the mipmaps and no further modifications will be done. If the texture was recently used then this will create a light draw boundary (See `Drawable2D.draw()` for more info)
		 */
		genMipmaps(): void

		/**
		 * Free the resources of this texture as soon as possible. It is invalid to use the texture object for anything beyond this point, the object should be "forgotten" and cannot be reinitialized
		 * Under the hood, the texture's data will be freed by the GPU once all draw operations using it have finished
		 * 
		 * @performance This method is relatively fast, however, consider reusing textures where possible rather than quickly creating and deleting them, as reconstruction may be expensive and older drivers might not be optimized for rapid texture freeing/allocation. If the texture was recently used then this will create a light draw boundary (See `Drawable2D.draw()` for more info)
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
	/** See `Texture.options` */ const ANISOTROPY = 128

	/**
	 * Create a drawable context optionally with a stencil buffer
	 * 
	 * Conceptually, a `Drawable` is an object describing where and how to draw, its methods being used to actually draw. The 'target' behind a `Drawable` can be the canvas (as is the case for the main target), or one or more texture layer / multisampled buffer (see `Texture.Surface`). You can add up to `Drawable.MAX_TARGETS` targets, differentiated by their IDs (0, 1, 2, ...)
	 * 
	 * To actually add targets to a drawable, see `Drawable.setTarget()`.
	 * 
	 * @performance This method itself is mostly CPU-only logic (a bit more expensive if a stencil buffer is allocated). However, using many drawables, especially interlaced, will have severe performance implications. See `Drawable2D.draw()` for more info
	 */
	function Drawable(): Drawable2D
	namespace Drawable{
		/** Maximum number of targets that can be set with `Drawable.setTarget()`. The targets are differentiated by their IDs (0, 1, 2, ..., up to this value) */
		const MAX_TARGETS: number
		/** Whether the hardware supports adding an xxx32F texture as a draw target */
		const DRAW_32F: boolean
	}

	interface Transformable2D{
		/** Create a new transformable which is a copy of this one */
		sub(): this
		/**
		 * Create a new transformable which is a copy of this one with 3 output components, usually for perspective projection.
		 * 
		 * The additional output component by default cannot be used without an input Z component. Use this if you want to guarantee `.perspective == true` and the existence of `.g`, `.h` and `.i` values
		 * 
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		subPersp(): Transformable2D & Transformable2Dto3D
		/**
		 * Create a new transformable which is a copy of this one with an additional input component, usually for orthographic projection.
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub3d(): Transformable3D & (this extends Transformable2Dto3D ? Transformable3Dto3D : Transformable3Dto2D)
		/**
		 * Create a subtransformable which is a copy of this one with 3 input and output components, usually for perspective projection.
		 * 
		 * Perspective transformation means that the Z component acts as a "scaling" factor for the X and Y components. By default, content drawn at (x,y,z) will appear at (x, y)/z. This can be changed with the `zBase` and `zScale` parameters. Content will then be drawn at (x, y)/(z*zScale + zBase). For example, `.sub3dPersp(0, 1)`, the default, gives a typical perspective transform while `.sub3dPersp(1, 0)` gives an orthographic transform (constant scaling). See `Drawable2D.sub3dPersp()`
		 * 
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub3dPersp(zBase?: number, zScale?: number): Transformable3D & Transformable3Dto3D
		/**
		 * Transform a point `(x, y)` by the current transformation matrix to screen space, returning the transformed point as an object `{x, y}`. The third output component is treated as the scaling factor `w` that makes perspective transformations. If it is greater than 0, the first 2 values are divided by `w`, otherwise, `{x: NaN, y: NaN}` is returned
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		project(x: number, y: number): vec2
		project(xy: vec2): vec2
		/**
		 * Un-transform a point in screen space `(x, y)` by the current transformation matrix, returning the original point as an object `{x, y}`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		uproject(x: number, y: number): vec2
		uproject(xy: vec2): vec2
		/**
		 * Translate (move) all following draw operations, x+ normally corresponds to right and y+ normally corresponds to up
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		translate(x: number, y: number): void
		/**
		 * Scale all following draw operations
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		scale(x: number, y: number): void
		/**
		 * Scale all following draw operations
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		scale(by: number): void
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
		transform(a: number, b: number, c: number, d: number, e?: number, f?: number): void
		/**
		 * Rotate all following draw operations, clockwise (or negative for anticlockwise)
		 * @performance This method is CPU-arithmetic, fast and usually inlined, however it uses `sin()` and `cos()`
		 */
		rotate(by: number): void
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
		 * Simultaneous translates and scales such that the new origin is at `(x, y)` with basis vectors (w,0) and (0,h). A square drawn at `(0, 0)` with size `(1, 1)` after the transform would be drawn at `(x, y)` with size `(w, h)`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		box(x: number, y: number, w: number, h: number): void
	}
	interface Transformable2Dto2D{
		/**
		 * Transform a point `(x, y)` by the current transformation matrix, returning the transformed point as an object `{x, y}`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		point(x: number, y: number): vec2
		point(xy: vec2): vec2
		/**
		 * Inverse-transform a point `(x, y)` by the current transformation matrix, returning the original point as an object `{x, y}`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined, however it involves a division
		 */
		pointFrom(x: number, y: number): vec2
		pointFrom(xy: vec2): vec2
		/**
		 * Transform a metric `(dx, dy)` by the current transformation matrix, returning the transformed metric as an object `{x, y}`. Unlike points, metrics do not observe the matrix's translation component
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		metric(x: number, y: number): vec2
		metric(xy: vec2): vec2
		/**
		 * Inverse-transform a metric `(dx, dy)` by the current transformation matrix, returning the original metric as an object `{x, y}`. Unlike points, metrics do not observe the matrix's translation component
		 * @performance This method is CPU-arithmetic, very fast and usually inlined, however it involves a division
		 */
		metricFrom(x: number, y: number): vec2
		metricFrom(xy: vec2): vec2
		/**
		 * Reset the 2D transform to a matrix defined by the 6 values, or the default matrix (where (0,0) is the bottom-left and (1,1) is the top right)
		 * 
		 * The matrix is column-major, for right-multiplication
		 * ```txt
		 * in x y 1
		 *  [ a c e ] -> out x
		 *  [ b d f ] -> out y
		 * ```
		 */
		reset(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number): void
	}
	interface Transformable2Dto3D{
		/**
		 * Transform a point `(x, y)` by the current transformation matrix, returning the transformed point as an object `{x, y, z}`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		point(x: number, y: number): vec3
		point(xy: vec2): vec3
		/** Inverse-transforms are not available on Transformable2Dto3D */
		pointFrom(x: number, y: number): never
		pointFrom(xy: vec2): never
		/**
		 * Transform a metric `(dx, dy)` by the current transformation matrix, returning the transformed metric as an object `{x, y, z}`. Unlike points, metrics do not observe the matrix's translation component
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		metric(x: number, y: number): vec3
		metric(xy: vec2): vec3
		/** Inverse-transforms are not available on Transformable2Dto3D */
		metricFrom(x: number, y: number): never
		metricFrom(xy: vec2): never
		/**
		 * Reset the 2D transform to a matrix defined by the 9 values, or the default matrix (where (0,0) is the bottom-left and (1,1) is the top right)
		 * 
		 * The matrix is column-major, for right-multiplication
		 * ```txt
		 * in x y 1
		 *  [ a d g ] -> out x
		 *  [ b e h ] -> out y
		 *  [ c f i ] -> out w
		 * ```
		 */
		reset(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number): void
	}

	interface Transformable3D{
		/** Create a new transformable which is a copy of this one */
		sub(): this
		/**
		 * Create a new transformable which is a copy of this one with one fewer input component. The 2D transformable will have its X and Y axes correspond to this transformable's X and Y axes respectively
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub2dXY(): Transformable2D & (this extends Transformable3Dto3D ? Transformable2Dto3D : Transformable2Dto2D)
		/**
		 * Create a new transformable which is a copy of this one with one fewer input component. The 2D transformable will have its X and Y axes correspond to this transformable's X and Z axes respectively
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub2dXZ(): Transformable2D & (this extends Transformable3Dto3D ? Transformable2Dto3D : Transformable2Dto2D)
		/**
		 * Create a new transformable which is a copy of this one with one fewer input component. The 2D transformable will have its X and Y axes correspond to this transformable's Z and Y axes respectively
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub2dZY(): Transformable2D & (this extends Transformable3Dto3D ? Transformable2Dto3D : Transformable2Dto2D)
		/**
		 * Create a new transformable which is a copy of this one with 3 output components. This is useful for turning an orthographic projection into a perspective one, but is otherwise not particularly intuitive to use.
		 * 
		 * Perspective transformation means that the Z component acts as a "scaling" factor for the X and Y components. By default, content drawn at (x,y,z) will appear at (x, y)/z. This can be changed with the `zBase` and `zScale` parameters. Content will then be drawn at (x, y)/(z*zScale + zBase). For example, `.sub3dPersp(0, 1)`, the default, gives a typical perspective transform while `.sub3dPersp(1, 0)` gives an orthographic transform (constant scaling). See `Drawable3D.subPersp()`
		 * 
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		subPersp(zBase?: number, zScale?: number): Transformable3D & Transformable3Dto3D
		/**
		 * Transform a point `(x, y, z)` by the current transformation matrix to screen space, returning the transformed point as an object `{x, y}`. The third output component is treated as the scaling factor `w` that makes perspective transformations. If it is greater than 0, the first 2 values are divided by `w`, otherwise, `{x: NaN, y: NaN}` is returned
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		project(x: number, y: number, z: number): vec2
		project(xyz: vec3): vec2
		/**
		 * Translate (move) all following draw operations. Conventionally, y+ represents up, and, in scenes or objects with a definable "forward" direction, z+ represents that direction, since it is the default "forward" direction in a 3D transformation
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		translate(x: number, y: number, z: number): void
		/**
		 * Scale all following draw operations
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		scale(x: number, y: number, z: number): void
		/**
		 * Scale all following draw operations
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		scale(by: number): void
		/**
		 * Apply a custom transformation matrix to all following draw operations. The matrix is specified by the values a,b,c,d,e,f,g,h,i,j,k,l corresponding to the 3D affine transformation matrix:
		 * ```
		 * | a d g j |
		 * | b e h k |
		 * | c f i l |
		 * | 0 0 0 1 |
		 * ```
		 * 
		 * This matrix transforms points `(x, y, z)` to `(a*x + d*y + g*z + j, b*x + e*y + h*z + k, c*x + f*y + i*z + l)`
		 * Note that this method premultiplies the current transformation matrix by the provided one. In other words, the provided transform is applied before the current transform. This is the same convention as OpenGL and Canvas2D, but opposite to CSS and SVG
		 * 
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		transform(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j?: number, k?: number, l?: number): void
		/**
		 * Rotate all following draw operations, clockwise (or negative for anticlockwise) when seen from Z-, about the Z axis (i.e, the X and Y basis vectors are changed but all Z remain unchanged). For example, a vector facing up, after a PI/2 (90deg) rotation, will be facing right ("newX = oldY", hence XY)
		 * @performance This method is CPU-arithmetic, fast and usually inlined, however it uses `sin()` and `cos()`
		 */
		rotateXY(by: number): void
		/**
		 * Rotate all following draw operations, clockwise (or negative for anticlockwise) when seen from Y+, about the Y axis (i.e, the X and Z basis vectors are changed but all Y remain unchanged). For example, a vector facing forward, after a PI/2 (90deg) rotation, will be facing right ("newX = oldZ", hence XZ)
		 * @performance This method is CPU-arithmetic, fast and usually inlined, however it uses `sin()` and `cos()`
		 */
		rotateXZ(by: number): void
		/**
		 * Rotate all following draw operations, clockwise (or negative for anticlockwise) when seen from X-, about the Z axis (i.e, the Z and Y basis vectors are changed but all X remain unchanged). For example, a vector facing up, after a PI/2 (90deg) rotation, will be facing forwards ("newZ = oldY", hence ZY)
		 * @performance This method is CPU-arithmetic, fast and usually inlined, however it uses `sin()` and `cos()`
		 */
		rotateZY(by: number): void
		/**
		 * Skew the X basis vector for all following draw operations by the ratios z and y
		 * 
		 * Note that the parameters are ratios and NOT degrees. Ratios are related to degrees via the `tan()` and `atan()` functions. A skew of 0 degrees has a ratio of 0. 45 degrees has a ratio of 1 and 90 degrees a ratio of Infinity
		 * 
		 * A cube drawn at `(0, 0, 0)` with a corner at `(1, 0, 0)` after the transform would have the same corner at `(1, y, z)`
		 * 
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		skewX(z: number, y: number): void
		/**
		 * Skew the Y basis vector for all following draw operations by the ratios x and z
		 * 
		 * Note that the parameters are ratios and NOT degrees. Ratios are related to degrees via the `tan()` and `atan()` functions. A skew of 0 degrees has a ratio of 0. 45 degrees has a ratio of 1 and 90 degrees a ratio of Infinity
		 * 
		 * A cube drawn at `(0, 0, 0)` with a corner at `(0, 1, 0)` after the transform would have the same corner at `(x, 1, z)`
		 * 
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		skewY(x: number, z: number): void
		/**
		 * Skew the Z basis vector for all following draw operations by the ratios x and y
		 * 
		 * Note that the parameters are ratios and NOT degrees. Ratios are related to degrees via the `tan()` and `atan()` functions. A skew of 0 degrees has a ratio of 0. 45 degrees has a ratio of 1 and 90 degrees a ratio of Infinity
		 * 
		 * A cube drawn at `(0, 0, 0)` with a corner at `(0, 0, 1)` after the transform would have the same corner at `(x, y, 1)`
		 * 
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		skewZ(x: number, y: number): void
		/**
		 * Skew all basis vectors simultaneously. This is similar in concept to performing the three operations
		 * - `skewX(xz, xy)`
		 * - `skewY(yx, yz)`
		 * - `skewZ(zx, zy)`
		 * 
		 * The main difference is that all three are performed "simultaneously" (in the sense that the skew of the first operation does not affect how the second or third skew is applied, and therefore the resulting transformation is order-independent)
		 * 
		 * Note that the parameters are ratios and NOT degrees. Ratios are related to degrees via the `tan()` and `atan()` functions. A skew of 0 degrees has a ratio of 0. 45 degrees has a ratio of 1 and 90 degrees a ratio of Infinity
		 * 
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		skew(xz: number, xy: number, yx: number, yz: number, zx: number, zy: number): void
		/**
		 * Simultaneously scales uniformly and rotates. Faster than calling scale() and rotateXY() separately
		 * Essentially moves the basis vector `(1, 0, 0)` to `(r, i, 0)` and the basis vector (0, 1, 0) to (-i, r, 0) without squishing or translating, or touching any Z, much like a mathematical complex multiplication, `(x + yi) * (r, i)`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		multiplyXY(r: number, i: number): void
		/**
		 * Simultaneously scales uniformly and rotates. Faster than calling scale() and rotateXZ() separately
		 * Essentially moves the basis vector `(1, 0, 0)` to `(r, 0, i)` and the basis vector (0, 0, 1) to (-i, 0, r) without squishing or translating, or touching any Y, much like a mathematical complex multiplication, `(x + zi) * (r, i)`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		multiplyXZ(r: number, i: number): void
		/**
		 * Simultaneously scales uniformly and rotates. Faster than calling scale() and rotateZY() separately
		 * Essentially moves the basis vector `(0, 0, 1)` to `(0, i, r)` and the basis vector (0, 1, 0) to (0, r, -i) without squishing or translating, or touching any X, much like a mathematical complex multiplication, `(z + yi) * (r, i)`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		multiplyZY(r: number, i: number): void
		/**
		 * Simultaneous translates and scales such that the new origin is at `(x, y, z)` with basis vectors (w,0,0), (0,h,0) and (0, 0, d). A square drawn at `(0, 0, 0)` with size `(1, 1, 1)` after the transform would be drawn at `(x, y, z)` with size `(w, h, d)`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		box(x: number, y: number, z: number, w: number, h: number, d: number): void
	}
	interface Transformable3Dto2D{
		/**
		 * Transform a point `(x, y, z)` by the current transformation matrix, returning the transformed point as an object `{x, y}`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		point(x: number, y: number, z: number): vec2
		point(xyz: vec3): vec2
		/** Inverse-transforms are not available on Transformable3Dto2D */
		pointFrom(x: number, y: number): never
		pointFrom(xy: vec2): never
		/**
		 * Transform a metric `(dx, dy, dz)` by the current transformation matrix, returning the transformed metric as an object `{x, y}`. Unlike points, metrics do not observe the matrix's translation component
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		metric(x: number, y: number, z: number): vec2
		metric(xyz: vec3): vec2
		/** Inverse-transforms are not available on Transformable3Dto2D */
		metricFrom(x: number, y: number): never
		metricFrom(xy: vec2): never
		/**
		 * Reset the 3D transform to a matrix defined by the 8 values, or the default matrix (where (0,0,z) is the bottom-left and (1,1,z) is the top right for any z)
		 * 
		 * 
		 * The matrix is column-major, for right-multiplication
		 * ```txt
		 * in x y z 1
		 *  [ a c e g ] -> out x
		 *  [ b d f h ] -> out y
		 */
		reset(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number): void

		/**
		 * Returns the point which transforms to a w (perspective value) of 0 in screen space, essentially the "camera" position in a 3D perspective transformation
		 * 
		 * Since this is a non-perspective transformations, this method doesn't make sense, and the returned value is always `vec3(NaN, NaN, NaN)`
		 */
		perspectiveOrigin(): vec3
		/**
		 * Returns a normalized metric which, when transformed, connects the perspective origin to a point in sreen space
		 * 
		 * Since this is a non-perspective transformations, this method doesn't make sense, and the returned value is always `vec3(NaN, NaN, NaN)`
		 */
		perspectiveRay(x: number, y: number, origin?: vec3): vec3
		perspectiveRay(xy: vec2, origin?: vec3): vec3
	}
	interface Transformable3Dto3D{
		/**
		 * Transform a point `(x, y, z)` by the current transformation matrix, returning the transformed point as an object `{x, y, z}`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		point(x: number, y: number, z: number): vec3
		point(xyz: vec3): vec3
		/**
		 * Inverse-transform a point `(x, y, z)` by the current transformation matrix, returning the original point as an object `{x, y, z}`
		 * @performance This method is CPU-arithmetic, very fast and usually inlined, however it involves a division
		 */
		pointFrom(x: number, y: number, z: number): never
		pointFrom(xyz: vec3): never
		/**
		 * Transform a metric `(dx, dy, dz)` by the current transformation matrix, returning the transformed metric as an object `{x, y, z}`. Unlike points, metrics do not observe the matrix's translation component
		 * @performance This method is CPU-arithmetic, very fast and usually inlined
		 */
		metric(x: number, y: number, z: number): vec3
		metric(xyz: vec3): vec3
		/**
		 * Inverse-transform a metric `(dx, dy, dz)` by the current transformation matrix, returning the original metric as an object `{x, y, z}`. Unlike points, metrics do not observe the matrix's translation component
		 * @performance This method is CPU-arithmetic, very fast and usually inlined, however it involves a division
		 */
		metricFrom(x: number, y: number, z: number): never
		metricFrom(xyz: vec3): never
		/**
		 * Reset the 3D transform to a matrix defined by the 12 values, or the default matrix (where (0,0,1) is the bottom-left and (1,1,1) is the top right, and the vanishing point, which is in the Z+ direction, is at the bottom left)
		 * 
		 * The matrix is column-major, for right-multiplication
		 * ```txt
		 * in x y z 1
		 *  [ a d g j ] -> out x
		 *  [ b e h k ] -> out y
		 *  [ c f i l ] -> out w
		 */
		reset(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number, j?: number, k?: number, l?: number): void
		/**
		 * Returns the point which transforms to a w (perspective value) of 0 in screen space, essentially the "camera" position in a 3D transformation
		 * @performance This performs a matrix inversion. For what it does, it is usually much faster to keep track of the camera's position manually and perform any additional math than to calculate it via this method every time it's needed
		 */
		perspectiveOrigin(): vec3
		/**
		 * Returns a normalized metric which, when transformed, connects the perspective origin to a point in sreen space
		 * 
		 * This can be used to cast a ray from a visual point on the screen to a vector in the world. If `origin` is passed, it is modified to contain the perspective origin (see `.perspectiveOrigin()`), which is cheaper to calculate at the same time as the ray than separately with a call to `perspectiveOrigin()`. The returned vector is always normalized, i.e `vec3.magnitude(ray) == 1`
		 * 
		 * @performance This performs a matrix inversion. Depending on your use case, it may be faster to keep track of the camera's position & orientation manually and perform any additional math than to calculate it via this method every time it's needed
		 */
		perspectiveRay(x: number, y: number, origin?: vec3): vec3
		perspectiveRay(xy: vec2, origin?: vec3): vec3
	}

	interface Drawable{
		/** An opaque object that will compare === for a `Drawable` and its sub-`Drawable`s, which always point to the same draw targets */
		readonly identity: opaque
		/** The backing target's whole width in pixels */
		readonly width: number
		/** The backing target's whole height in pixels */
		readonly height: number
		/**
		 * Set a drawable target for this drawable context
		 * 
		 * This method is not valid on the main context. Additionally, all targets added to a single `Drawable` must have the same width and height
		 * @param id The slot ID to set the target on. See `Drawable()` and `Drawable.MAX_TARGETS`. Slot ID `-1` is a special slot reserved for depth/stencil buffers (See `Formats.DEPTH32F`, `Formats.STENCIL`, `Formats.DEPTH32F_STENCIL`)
		 * @param target A texture or Texture.Surface to which draw operations should go to, or null to remove the current target at that slot. Note that sub-texture layer/crop are ignored, the drawable always draws to the entire layer
		 * @param layer Draw to a specific layer of the texture (Default: 0)
		 * @param mip Draw to a specific mipmap of the texture (Default: 0)
		 */
		setTarget(id: number, target: Texture, layer?: number, mip?: number): void
		setTarget(id: number, target: Texture.Surface): void
		setTarget(id: number, target?: null): void
		/**
		 * Clear all currently bound targets (see `Drawable.setTarget()`)
		 * 
		 * Additionally, any stencil buffer's memory is freed (beware, manually unsetting every target via `.setTarget(id, null)` will not do this!)
		 */
		clearTargets(): void

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
		 * @performance Changing this value will create a light draw boundary (See `Drawable2D.draw()` for more info)
		 */
		mask: number
		/**
		 * The blending mode to be used by all drawing operations. See `Blend` for more info on blending modes. Can be also set to `0` to use `Blend.DEFAULT`, however reading the property never returns 0
		 * @performance Changing this value will create a light draw boundary (See `Drawable2D.draw()` for more info)
		 */
		blend: Blend
		/**
		 * Clear the whole draw target to a solid color. This method is affected by `.mask & RGBA`, and `.mask & DEPTH`
		 * 
		 * @param depth The depth value to clear to. Default: `Infinity`
		 * @param stencil Whether to also clear the stencil buffer to zero. Default: `true`
		 * 
		 * @performance Will create a light draw boundary (See `Drawable2D.draw()` for more info)
		 */
		clear(r: number, g: number, b: number, a: number, depth?: number, stencil?: boolean): void
		clear(rgba: vec4, depth?: number, stencil?: boolean): void
		/**
		 * Clear the whole stencil buffer to 0
		 * 
		 * @performance Will create a light draw boundary (See `Drawable2D.draw()` for more info). Well-optimized, under the hood, all 8 bits of the stencil buffer are used. "Clearing" the stencil buffer will simply switch to another bit, until all 8 bits have been used up, at which point the buffer is actually cleared, this operation is often times cheaper than attempting to clear only a portion of the stencil buffer with a `draw*()` call, however, benchmark your specific case if you are unsure
		 */
		clearStencil(): void
	}
	interface _Drawable2D extends Drawable, Transformable2D{
		/**
		 * Create a sub-context, which points to the same target, stencil buffer, etc... as this one, much like `Texture.sub()`, however it keeps its own state such as transform, blend, mask, shader, geometry, making it ideal for passing to other functions that may modify their drawable context arbitrarily without us needing to revert it afterwards
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub(): this
		/**
		 * Create a subcontext with additional perspective projection.
		 * 
		 * Perspective transformations act on the Z component, and, as Transformable2D does not have a Z component, the projection is unchanged. Use this if you want to guarantee `.perspective == true` and the existence of `.g`, `.h` and `.i` values
		 * 
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		subPersp(): Drawable2DPerspective
		/**
		 * Create a subcontext with a third dimension, which is capable of drawing 3D geometries using the family of 3D transformations. The 3D content is projected onto the current 2D plane using an orthographic projection. For a perspective projection, see `.sub3dPersp()`
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub3d(): this extends Transformable2Dto3D ? Drawable3DPerspective : Drawable3D
		/**
		 * Create a subcontext with a third dimension, which is capable of drawing 3D geometries using the family of 3D transformations. The 3D content is projected onto the current 2D plane using a perspective projection defined by the two values.
		 * 
		 * Perspective transformation means that the Z component acts as a "scaling" factor for the X and Y components. By default, content drawn at (x,y,z) will appear at (x, y)/z. This can be changed with the `zBase` and `zScale` parameters. Content will then be drawn at (x, y)/(z*zScale + zBase). For example, `.sub3dPersp(0, 1)`, the default, gives a typical perspective transform while `.sub3dPersp(1, 0)` gives an orthographic transform (constant scaling)
		 * 
		 * Note that after you have applied any rotations, the "Z" direction controlling the scaling factor will also change, such that the vanishing point always appears where you expect it to.
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub3dPersp(zBase?: number, zScale?: number): Drawable3DPerspective

		/**
		 * The shader to be used by all drawing operations. See `Shader()` for more info on custom shaders. Can be also set to `null` to use `Shader.DEFAULT`, however reading the property never returns null
		 * @performance Changing this value will create a medium draw boundary (See `Drawable2D.draw()` for more info)
		*/
		shader: Shader2D
		/**
		 * The geometry to be used by all drawing operations. See `Geometry2D()` for more info on custom sprite geometries. Can be also set to `null` to use `Geometry2D.SQUARE`, however reading the property never returns null
		 * @performance Changing this value will create a light-to-medium draw boundary (See `Drawable2D.draw()` for more info)
		 */
		geometry: Geometry2D

		/**
		 * The pixel ratio of the current transformation matrix. This is the geometric mean of the absolute values of the eigenvalues, or, in other words, sqrt(determinant), multiplied by the drawable's width and height. It can be used to determine appropriate mipmap levels for textures, and represents how many pixels one unit in the current transform space corresponds to on average on the draw target
		 * @performance This method is CPU-arithmetic, fast and usually inlined, however it uses a square root
		 */
		pixelRatio(): number

		/**
		 * Draw a sprite at `(0,0)` to `(1,1)`
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
		 * @performance See `Drawable2D.draw()` for more info
		 */
		drawRect(x: number, y: number, w: number, h: number, ...values: any[]): void
		/**
		 * Draw a sprite within a parallelogram defined by a matrix
		 * 
		 * Bottom at `(e, f)` with bottom edge defined by the vector `(a, b)` and left edge defined by `(c, d)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * @performance See `Drawable2D.draw()` for more info
		 */
		drawMat(a: number, b: number, c: number, d: number, e: number, f: number, ...values: any[]): void
		/**
		 * Draw a sprite at `(0,0)` to `(1,1)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * This version of draw() expects an array rather than spread parameters
		 * @performance See `Drawable2D.draw()` for more info
		 */
		drawv(values: any[]): void
		/**
		 * Draw a sprite at `(x, y)` with size `(w, h)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * This version of drawRect() expects an array rather than spread parameters
		 * @performance See `Drawable2D.draw()` for more info
		 */
		drawRectv(x: number, y: number, w: number, h: number, values: any[]): void
		/**
		 * Draw a sprite within a parallelogram defined by a matrix
		 * 
		 * Bottom at `(e, f)` with bottom edge defined by the vector `(a, b)` and left edge defined by `(c, d)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * This version of drawMat() expects an array rather than spread parameters
		 * @performance See `Drawable2D.draw()` for more info
		 */
		drawMatv(a: number, b: number, c: number, d: number, e: number, f: number, values: any[]): void
	}
	interface Drawable2D extends _Drawable2D, Transformable2Dto2D{
		a: number, b: number, c: number, d: number, e: number, f: number
		/** Whether this drawable context has a perspective component. False here. See `.sub3dPersp()` */
		readonly perspective: false

		/**
		 * Reset all sub-context state (transform, shader, blend, mask, geometry) to match another drawable
		 * @param ctx The drawable to copy state from. Resetting to a Drawable2DPerspective or any kind of Drawable3D is invalid
		 * @performance This method is CPU-logic, very fast and usually inlined
		 */
		resetTo(ctx: Drawable2D): void
		/**
		 * Reset the 2D transform to a matrix defined by the 6 values, or the default matrix (where (0,0) is the bottom-left and (1,1) is the top right)
		 * 
		 * Also resets mask, blend, shader, geometry, etc...
		 * 
		 * The matrix is column-major, for right-multiplication
		 * ```txt
		 * in x y 1
		 *  [ a c e ] -> out x
		 *  [ b d f ] -> out y
		 * ```
		 */
		reset(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number): void
	}
	interface Drawable2DPerspective extends _Drawable2D, Transformable2Dto3D{
		a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number
		/** Whether this drawable context has a perspective component. True here */
		readonly perspective: true
		/**
		 * Reset all sub-context state (transform, shader, blend, mask, geometry) to match another drawable
		 * @param ctx The drawable to copy state from. Resetting to a Drawable2D (lacking perspective) or any kind of Drawable3D is invalid
		 * @performance This method is CPU-logic, very fast and usually inlined
		 */
		resetTo(ctx: Drawable2DPerspective): void
		/**
		 * Reset the 2D transform to a matrix defined by the 9 values, or the default matrix (where (0,0) is the bottom-left and (1,1) is the top right)
		 * 
		 * Also resets mask, blend, shader, geometry, etc...
		 * 
		 * The matrix is column-major, for right-multiplication
		 * ```txt
		 * in x y 1
		 *  [ a d g ] -> out x
		 *  [ b e h ] -> out y
		 *  [ c f i ] -> out w
		 * ```
		 */
		reset(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number): void
	}
	interface _Drawable3D extends Drawable, Transformable3D{
		/**
		 * The shader to be used by all drawing operations. See `Shader()` for more info on custom shaders. Can be also set to `null` to use `Shader.DEFAULT`, however reading the property never returns null
		 * @performance Changing this value will create a medium draw boundary (See `Drawable2D.draw()` for more info)
		*/
		shader: Shader3D
		/**
		 * The geometry to be used by all drawing operations. See `Geometry2D()` for more info on custom sprite geometries. Can be also set to `null` to use `Geometry2D.SQUARE`, however reading the property never returns null
		 * @performance Changing this value will create a light-to-medium draw boundary (See `Drawable2D.draw()` for more info)
		 */
		geometry: Geometry3D
		/**
		 * Create a sub-context, which points to the same target, stencil buffer, etc... as this one, much like `Texture.sub()`, however it keeps its own state such as transform, blend, mask, shader, geometry, making it ideal for passing to other functions that may modify their drawable context arbitrarily without us needing to revert it afterwards
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub(): this
		/**
		 * Create a subcontext with one fewer dimension, which is capable of drawing 2D geometries using the (simpler) family of 2D transformations. The 2D context will have its X and Y axes correspond to this context's X and Y axes respectively
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub2dXY(): this extends Transformable3Dto3D ? Drawable2DPerspective : Drawable2D
		/**
		 * Create a subcontext with one fewer dimension, which is capable of drawing 2D geometries using the (simpler) family of 2D transformations. The 2D context will have its X and Y axes correspond to this context's X and Z axes respectively
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub2dXZ(): this extends Transformable3Dto3D ? Drawable2DPerspective : Drawable2D
		/**
		 * Create a subcontext with one fewer dimension, which is capable of drawing 2D geometries using the (simpler) family of 2D transformations. The 2D context will have its X and Y axes correspond to this context's Z and Y axes respectively
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		sub2dZY(): this extends Transformable3Dto3D ? Drawable2DPerspective : Drawable2D
		/**
		 * Create a subcontext with additional perspective projection. This is useful for turning an orthographic projection into a perspective one, but is otherwise not particularly intuitive to use.
		 * 
		 * Perspective transformation means that the Z component acts as a "scaling" factor for the X and Y components. By default, content drawn at (x,y,z) will appear at (x, y)/z. This can be changed with the `zBase` and `zScale` parameters. Content will then be drawn at (x, y)/(z*zScale + zBase). For example, `.sub3dPersp(0, 1)`, the default, gives a typical perspective transform while `.sub3dPersp(1, 0)` gives an orthographic transform (constant scaling)
		 * 
		 * Note that after you have applied any rotations, the "Z" direction controlling the scaling factor will also change, such that the vanishing point always appears where you expect it to.
		 * @performance This method is CPU-logic, fast and usually inlined
		 **/
		subPersp(zBase?: number, zScale?: number): Drawable3DPerspective

		/**
		 * Draw a sprite at `(0,0,0)` to `(1,1,1)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.DEFAULT`)
		 * 
		 * @performance See `Drawable2D.draw()` for more info
		 */
		draw(...values: any[]): void
		/**
		 * Draw a sprite at `(x, y, z)` with size `(w, h, d)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.COLOR_3D_XZ`)
		 * 
		 * @performance See `Drawable2D.draw()` for more info
		 */
		drawCube(x: number, y: number, z: number, w: number, h: number, d: number, ...values: any[]): void
		/**
		 * Draw a sprite within a parallelepiped (3D parallelogram) defined by a matrix
		 * 
		 * Bottom at `(j, k, l)` with X edge defined by the vector `(a, b, c)`, Y edge defined by `(d, e, f)` and Z edge defined by vector `(g, h, i)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.COLOR_3D_XZ`)
		 * 
		 * @performance See `Drawable2D.draw()` for more info
		 */
		drawMat(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, ...values: any[]): void
		/**
		 * Draw a sprite at `(0,0,0)` to `(1,1,1)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.COLOR_3D_XZ`)
		 * 
		 * This version of draw() expects an array rather than spread parameters
		 * @performance See `Drawable2D.draw()` for more info
		 */
		drawv(values: any[]): void
		/**
		 *Draw a sprite at `(x, y, z)` with size `(w, h, d)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.COLOR_3D_XZ`)
		 * 
		 * This version of drawRect() expects an array rather than spread parameters
		 * @performance See `Drawable2D.draw()` for more info
		 */
		drawCubev(x: number, y: number, w: number, h: number, values: any[]): void
		/**
		 * Draw a sprite within a parallelogram defined by a matrix
		 * 
		 * Bottom at `(e, f)` with bottom edge defined by the vector `(a, b)` and left edge defined by `(c, d)`
		 * @param values Values, as required by the shader currently in use (See `Drawable.shader`, `Shader()` and `Shader.COLOR_3D_XZ`)
		 * 
		 * This version of drawMat() expects an array rather than spread parameters
		 * @performance See `Drawable2D.draw()` for more info
		 */
		drawMatv(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, values: any[]): void
	}
	interface Drawable3D extends _Drawable3D, Transformable3Dto2D{
		a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number
		/** Whether this drawable context has a perspective component. False here. See `.subPersp()` */
		readonly perspective: false
		/**
		 * Reset all sub-context state (transform, shader, blend, mask, geometry) to match another drawable.
		 * @param ctx The drawable to copy state from. Resetting to a Drawable3DPerspective or any kind of Drawable2D is invalid
		 * @performance This method is CPU-logic, very fast and usually inlined
		 */
		resetTo(ctx: Drawable3D): void
		/**
		 * Reset the 3D transform to a matrix defined by the 8 values, or the default matrix (where (0,0,z) is the bottom-left and (1,1,z) is the top right for any z)
		 * 
		 * Also resets mask, blend, shader, geometry, etc...
		 * 
		 * The matrix is column-major, for right-multiplication
		 * ```txt
		 * in x y z 1
		 *  [ a c e g ] -> out x
		 *  [ b d f h ] -> out y
		 */
		reset(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number): void
	}
	interface Drawable3DPerspective extends _Drawable3D, Transformable3Dto3D{
		a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number
		/** Whether this drawable context has a perspective component. True here */
		readonly perspective: true
		/**
		 * Reset all sub-context state (transform, shader, blend, mask, geometry) to match another drawable.
		 * @param ctx The drawable to copy state from. Resetting to a Drawable3D (lacking perspective) or any kind of Drawable2D is invalid
		 * @performance This method is CPU-logic, very fast and usually inlined
		 */
		resetTo(ctx: Drawable3DPerspective): void
		/**
		 * Reset the 3D transform to a matrix defined by the 12 values, or the default matrix (where (0,0,1) is the bottom-left and (1,1,1) is the top right, and the vanishing point, which is in the Z+ direction, is at the bottom left)
		 * 
		 * Also resets mask, blend, shader, geometry, etc...
		 * 
		 * The matrix is column-major, for right-multiplication
		 * ```txt
		 * in x y z 1
		 *  [ a d g j ] -> out x
		 *  [ b e h k ] -> out y
		 *  [ c f i l ] -> out w
		 */
		reset(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number, j?: number, k?: number, l?: number): void
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
	 * Construct a GPU blend mode
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
	 * Any of these values can be mixed to apply different rules for rgb values as for alpha values, for example, `RGB_ADD | A_MAX` will apply `ADD` to rgb channels and `MAX` to the alpha channel, and `RGB_SRC_ALPHA | ZERO` will use `SRC_ALPHA` for rgb and `ZERO` for alpha. Note that there are no `RGB_ZERO` or `A_ZERO` as these are just `ZERO` (even that can be omitted altogether as `ZERO === 0`)
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
	 * @param vertexParameters Additional per-vertex parameters (See `Geometry2D.Vertex()`)
	 * @param type The primitive type, which determines how to connect vertices (points). Can be one of
	 * - `POINTS` Do not connect the vertices, and instead draw them as 1-pixel points
	 * - `LINES` Connect each standalone pair of vertices by a 1-pixel-wide line (i.e vertices are connected like 0-1 2-3 4-5 with gaps between pairs)
	 * - `LINE_STRIP` Connect all adjacent vertices by a 1-pixel-wide line (i.e vertices are connected like 0-1-2-3-4-5 with no gaps between pairs)
	 * * - `LINE_LOOP` Connect all adjacent vertices by a 1-pixel-wide line (i.e vertices are connected like 0-1-2-3-4-5 with no gaps between pairs), and also connect the last vertex to the first, to close the loop
	 * - `TRIANGLES` Connect all triplets of vertices into a triangle (i.e vertices are connected like 0-1-2 3-4-5 6-7-8 with gaps between triplets)
	 * - `TRIANGLE_STRIP` Connect all 3 adjacent vertices into a triangle (i.e triangles are made from 0-1-2, 1-2-3, 2-3-4, 3-4-5, ...). This means every new vertex after the second forms a new triangle along with the previous 2 vertices
	 * - `TRIANGLE_FAN` Connect all 2 adjacent vertices with the first one in the list (i.e triangles are made from 0-1-2, 0-2-3, 0-3-4, 0-4-5, ...) This makes a 'fan'-like shape when the first point is placed in the center and all other points in a circle around it, hence the name
	 * 
	 * Can also be OR'd with
	 * - `CW_ONLY` Only render triangles whose vertices appear to go clockwise. This means the triangle is only visible from one side. For the specific case of TRIANGLE_STRIP, since the spin of each triangle alternates in normal geometry, this rule is essentially flipped for each triangle: the first triangle must be winding clockwise to be rendered, the second counterclockwise, the third clockwise, and so on...
	 * - `CCW_ONLY` Ditto but the faces must appear to be going counterclockwise instead of clockwise. The same alternating behavior occurs for TRIANGLE_STRIP
	 */
	function Geometry2D(type: number): Geometry2D & Transformable2D & Transformable2Dto2D
	function Geometry2D(vertexParameters: Geometry2D.Vertex, type: number): Geometry2D & Transformable2D & Transformable2Dto2D
	interface Geometry{
		/** Primitive type, see `Geometry2D()`/`Geometry3D()` */
		type: number
		/** Start vertex index of subgeometry (see `Geometry2D.sub()`/`Geometry3D.sub()`) */
		start: number
		/** Length in vertices of geometry/subgeometry */
		length: number
		/** End in vertices of geometry/subgeometry (see `Geometry2D.sub()`/`Geometry3D.sub()`) */
		end: number
		/** Size of the entire geometry in vertices */
		readonly size: number

		/** Duplicate the last vertex, copying the exact position and values. The current transform is ignored for this operation. */
		dup(): void
		/**
		 * Upload all points added so far to the GPU, clearing any previously uploaded geometry. This method must be called prior to using the geometry
		 * This method also clears all points on the CPU, so that you can use the same object to start constructing a new shape, without having to hold on to or manually clear the memory used by the last geometry
		 * @param order Set the order of vertices, an array of vertex indices. Useful to create multiple orderings of a geometry without duplicating the entire geometry, or to reuse a lot of vertices without excessive memory usage. Omit this parameter to use the default order. When specifying a custom order, the `start` and `length` properties of any subgeometry apply to the array of indices and not the pool of vertices. This array may also include -1 (or the respective maximum unsigned integer) to indicate a "primitive restart", which breaks apart triangle strips, fans, line strips and loops without needing to draw multiple separate geometries. It essentially prevents any unwanted primitives (triangles/lines) from being formed across that boundary.
		 */
		upload(order?: number[] | Uint32Array | Int32Array | Uint16Array | Int16Array | Uint8Array | Int8Array): void

		/**
		 * Export all the current vertex data (that has not yet been uploaded to the GPU) to a portable Uint8Array, containing data for each vertex concatenated, using float32 and int32 format, big endian.
		 */
		export(): Uint8Array
		/**
		 * Import vertex data from a portable Uint8Array/ArrayBuffer and append it to the current Geometry. The data should contain data for each vertex concatenated, using float32 and int32 format, big endian.
		 */
		import(arr: Uint8Array | ArrayBuffer): void
	}
	interface Geometry2D extends Geometry{
		/**
		 * Create a subgeometry, i.e a geometry containing only a subset of the points of this geometry, optionally with a different type
		 * @performance This method is CPU-arithmetic, very fast. Using many subgeometries of the same geometry is also faster than using many different geometries. For many related geometries, consider building one large geometry and taking subgeometries of it
		 */
		sub(start?: number, length?: number, type?: number): this
		/**
		 * Create a subgeometry for easily managing multiple separate transformations, much like `Drawable.sub()`
		 */
		sub(): this
		/**
		 * Create a 3D subgeometry for easily managing multiple separate transformations, much like `Drawable2D.sub3d()`. Note that any vertices added via 3D subgeometries of a Geometry2D is always flattened down to 2D using an orthographic projection
		 */
		sub3d(): this extends Transformable3D ? never : Geometry2D & Transformable3D & Transformable3Dto2D

		/**
		 * Create a 2D subgeometry for easily managing multiple separate transformations, much like `Drawable3D.sub2dXY()`. Note that any vertices added via 3D subgeometries of a Geometry2D is always flattened down to 2D using an orthographic projection
		 */
		sub2dXY(): this extends Transformable2D ? never : Geometry2D & Transformable2D & Transformable2Dto2D
		/**
		 * Create a 2D subgeometry for easily managing multiple separate transformations, much like `Drawable3D.sub2dXZ()`. Note that any vertices added via 3D subgeometries of a Geometry2D is always flattened down to 2D using an orthographic projection
		 */
		sub2dXZ(): this extends Transformable2D ? never : Geometry2D & Transformable2D & Transformable2Dto2D
		/**
		 * Create a 2D subgeometry for easily managing multiple separate transformations, much like `Drawable3D.sub2dZY()`. Note that any vertices added via 3D subgeometries of a Geometry2D is always flattened down to 2D using an orthographic projection
		 */
		sub2dZY(): this extends Transformable2D ? never : Geometry2D & Transformable2D & Transformable2Dto2D

		/** Add a point to the geometry at (x,y) with the current transform, and additional vertex values (see `Geometry2D.Vertex()`) */
		addPoint(x: number, y: number, ...values: any[]): void
		/** Add a point to the geometry at (0,0) with the current transform, and additional vertex values (see `Geometry2D.Vertex()`) */
		add(...values: any[]): void
		/** Add a point to the geometry at (x,y) with the current transform, and additional vertex values (see `Geometry2D.Vertex()`) */
		addPointv(x: number, y: number, values: any[]): void
		/** Add a point to the geometry at (0,0) with the current transform, and additional vertex values (see `Geometry2D.Vertex()`) */
		addv(values: any[]): void
	}
	namespace Geometry2D{
		/**
		 * Define a vertex type with additional per-vertex parameters that can be accessed from within the shader. The types accepted are
		 * - FLOAT/VEC2/VEC3/VEC4
		 * - INT/IVEC2/IVEC3/IVEC4
		 * - UINT/UVEC2/UVEC3/UVEC4
		 * 
		 * Texture types are not allowed here.
		 * 
		 * You can also combine any of the floating point types with `FLAT` (e.g `VEC2 | FLAT`) to disable interpolation. Interpolation is always disabled for integer types.
		 * - When interpolation is enabled, pixels within a triangle/line will read values as a mix of the values at the triangle's 3 vertices (or 2 vertices for a line)
		 * - When interpolation is disabled, pixels within a triangle/line will read the value supplied to the last vertex of the triangle/line (based on the order which they are supplied)
		 * - When rendering points, interpolation has no effect
		 */
		function Vertex(values: number[]): Geometry2D.Vertex
		interface Vertex{
			/** Boolean indicating that this is a 2D Vertex format */
			readonly three: false
		}
		namespace Vertex{
			/** Default vertex format with no additional properties */
			const DEFAULT: Vertex
		}
		/** The default geometry, with no additional per-vertex parameters, constructing a square from (0,0) to (1,1) */
		const SQUARE: Geometry2D
	}
	/**
	 * Construct a 3D geometry
	 * 
	 * The default 3D geometry is the cube, which draws in a box (x,y,z)-(x+w,y+h,z+d), much like Geometry2D.SQUARE
	 * 
	 * Geometries are created in the same way as meshes using lower level graphics APIs. You provide a list of vertices (points), and a method of connecting them to draw triangles (or lines/points). Quads do not exist, but can be made of 2 triangles
	 * @param vertexParameters Additional per-vertex parameters (See `Geometry2D.Vertex()`)
	 * @param type The primitive type, which determines how to connect vertices (points). Can be one of
	 * - `POINTS` Do not connect the vertices, and instead draw them as 1-pixel points
	 * - `LINES` Connect each standalone pair of vertices by a 1-pixel-wide line (i.e vertices are connected like 0-1 2-3 4-5 with gaps between pairs)
	 * - `LINE_STRIP` Connect all adjacent vertices by a 1-pixel-wide line (i.e vertices are connected like 0-1-2-3-4-5 with no gaps between pairs)
	 * * - `LINE_LOOP` Connect all adjacent vertices by a 1-pixel-wide line (i.e vertices are connected like 0-1-2-3-4-5 with no gaps between pairs), and also connect the last vertex to the first, to close the loop
	 * - `TRIANGLES` Connect all triplets of vertices into a triangle (i.e vertices are connected like 0-1-2 3-4-5 6-7-8 with gaps between triplets)
	 * - `TRIANGLE_STRIP` Connect all 3 adjacent vertices into a triangle (i.e triangles are made from 0-1-2, 1-2-3, 2-3-4, 3-4-5, ...). This means every new vertex after the second forms a new triangle along with the previous 2 vertices
	 * - `TRIANGLE_FAN` Connect all 2 adjacent vertices with the first one in the list (i.e triangles are made from 0-1-2, 0-2-3, 0-3-4, 0-4-5, ...) This makes a 'fan'-like shape when the first point is placed in the center and all other points in a circle around it, hence the name
	 * 
	 * Can also be OR'd with
	 * - `CW_ONLY` Only render triangles whose vertices appear to go clockwise. This means the triangle is only visible from one side. For the specific case of TRIANGLE_STRIP, since the spin of each triangle alternates in normal geometry, this rule is essentially flipped for each triangle: the first triangle must be winding clockwise to be rendered, the second counterclockwise, the third clockwise, and so on...
	 * - `CCW_ONLY` Ditto but the faces must appear to be going counterclockwise instead of clockwise. The same alternating behavior occurs for TRIANGLE_STRIP
	 */
	function Geometry3D(type: number): Geometry3D & Transformable3D & Transformable3Dto3D
	function Geometry3D(vertexParameters: Geometry3D.Vertex, type: number): Geometry3D & Transformable3D & Transformable3Dto3D
	interface Geometry3D extends Geometry{
		/**
		 * Create a subgeometry, i.e a geometry containing only a subset of the points of this geometry, optionally with a different type
		 * @performance This method is CPU-arithmetic, very fast. Using many subgeometries of the same geometry is also faster than using many different geometries. For many related geometries, consider building one large geometry and taking subgeometries of it
		 */
		sub(start?: number, length?: number, type?: number): this
		/**
		 * Create a subgeometry for easily managing multiple separate transformations, much like `Drawable.sub()`
		 */
		sub(): this
		/**
		 * Create a 3D subgeometry for easily managing multiple separate transformations, much like `Drawable2D.sub3d()`
		 */
		sub3d(): this extends Transformable3D ? never : Geometry3D & Transformable3D & Transformable3Dto3D

		/**
		 * Create a 2D subgeometry for easily managing multiple separate transformations, much like `Drawable3D.sub2dXY()`
		 */
		sub2dXY(): this extends Transformable2D ? never : Geometry3D & Transformable2D & Transformable2Dto3D
		/**
		 * Create a 2D subgeometry for easily managing multiple separate transformations, much like `Drawable3D.sub2dXZ()`
		 */
		sub2dXZ(): this extends Transformable2D ? never : Geometry3D & Transformable2D & Transformable2Dto3D
		/**
		 * Create a 2D subgeometry for easily managing multiple separate transformations, much like `Drawable3D.sub2dZY()`
		 */
		sub2dZY(): this extends Transformable2D ? never : Geometry3D & Transformable2D & Transformable2Dto3D

		/** Add a point to the geometry at (x,y,z) with the current transform, and additional vertex values (see `Geometry2D.Vertex()`) */
		addPoint(x: number, y: number, z: number, ...values: any[]): void
		/** Add a point to the geometry at (0,0,0) with the current transform, and additional vertex values (see `Geometry2D.Vertex()`) */
		add(...values: any[]): void
		/** Add a point to the geometry at (x,y,z) with the current transform, and additional vertex values (see `Geometry2D.Vertex()`) */
		addPointv(x: number, y: number, z: number, values: any[]): void
		/** Add a point to the geometry at (0,0,0) with the current transform, and additional vertex values (see `Geometry2D.Vertex()`) */
		addv(values: any[]): void
	}
	namespace Geometry3D{
		/**
		 * Define a vertex type with additional per-vertex parameters that can be accessed from within the shader. The types accepted are
		 * - FLOAT/VEC2/VEC3/VEC4
		 * - INT/IVEC2/IVEC3/IVEC4
		 * - UINT/UVEC2/UVEC3/UVEC4
		 * 
		 * Texture types are not allowed here.
		 * 
		 * You can also combine any of the floating point types with `FLAT` (e.g `VEC2 | FLAT`) to disable interpolation. Interpolation is always disabled for integer types.
		 * - When interpolation is enabled, pixels within a triangle/line will read values as a mix of the values at the triangle's 3 vertices (or 2 vertices for a line)
		 * - When interpolation is disabled, pixels within a triangle/line will read the value supplied to the last vertex of the triangle/line (based on the order which they are supplied)
		 * - When rendering points, interpolation has no effect
		 */
		function Vertex(values: number[]): Geometry3D.Vertex
		interface Vertex{
			/** Boolean indicating that this is a 3D Vertex format */
			readonly three: true
		}
		namespace Vertex{
			/** Default vertex format with no additional properties */
			const DEFAULT: Vertex
			/** Vertex format with one additional property for supplying normals (VEC3) */
			const WITH_NORMALS: Vertex
		}
		/** The default geometry, with no additional per-vertex parameters, a cube from (0,0,0) to (1,1,1), with the faces only visible from the outside */
		const CUBE: Geometry3D
		/** Much like the default geometry, with no additional per-vertex parameters, a cube from (0,0,0) to (1,1,1), but the faces are inverted and only visible from the inside */
		const INSIDE_CUBE: Geometry3D
		/** No additional per-vertex parameters, a flat square from (0,0,0) to (1,0,1), with the face only visible from the mesh's top */
		const XZ_FACE: Geometry3D
	}
	/** See `Geometry()` */ const TRIANGLE_STRIP = 5
	/** See `Geometry()` */ const TRIANGLES = 4
	/** See `Geometry()` */ const TRIANGLE_FAN = 6
	/** See `Geometry()` */ const LINE_LOOP = 2
	/** See `Geometry()` */ const LINE_STRIP = 3
	/** See `Geometry()` */ const LINES = 1
	/** See `Geometry()` */ const POINTS = 0
	/** See `Geometry()` */ const CW_ONLY = 16
	/** See `Geometry()` */ const CCW_ONLY = 32


	/**
	 * Construct a shader using GLSL
	 * 
	 * Virtually anything you need to know about GLSL can be found online (or by asking an LLM). Here, we will just focus on things that are done differently or new
	 * 
	 * @param options.params Shader sprite parameters. These can be any of the following, passed as an array, or a single value, representing an array with one element
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
	 * @param options.defaults The default values for the parameters. If not provided, a suitable `0`-like default is used (`TEXTURE`/`FTEXTURE`/`UTEXTURE` cannot have a default value)
	 * @param options.uniforms Shader uniforms (config). These have the same possible values as `params`
	 * @param options.uniformDefaults The default values for the uniforms. If not provided, a suitable `0`-like default is used (`TEXTURE`/`FTEXTURE`/`UTEXTURE` cannot have a default value)
	 * @param options.outputs The type of output for this shader. Can be
	 * - `UINT` to make this shader only for rendering to integer targets
	 * - `LOWP` (normal value)
	 * - `FLOAT` for high precision targets (16F / 32F). This exists because `LOWP` will try to use the lowest precision available (`lowp`, for performance reasons), which may be insufficient for some use cases
	 * Multiple outputs supported for drawing to multiple textures at once. See `Drawable.setTarget`
	 * @param options.vertex The vertex format to be used by this shader. See `Geometry2D.Vertex` and `Geometry3D.Vertex`. A shader can only be used with geometries of compatible vertex type (i.e mixing 2D geometries with shaders meant for 3D geometries, or mixing a simple 3D geometry with a shader that expects 3D geometries with additional per-vertex data, are both invalid)
	 * @param options.intFrac Optionally give a hint as to the bias towards integer or float textures. For example, if your shader uses one float and one int texture, but the int texture tends to stay the same while the float texture changes often, set this to `1` to indicate that you will use more float textures. Out of the 16 available texture slots, 15 will then be allocated for float textures, as opposed to 8 by default (when `intFrac == 0.5`), which will slightly increase performance
	 * 
	 * Note that you cannot use more than 16 different texture parameters in a single shader (across both `params` and `uniforms`), and that the number of params is also individually limited (don't go crazy and if you do run out, consider combining multiple `FLOAT`s to a `VEC2`/`VEC3`/`VEC4`, etc...)
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
	 * in auto param0, param1, param2, ...;
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
	 * ‍   // Assuming param0 is a `COLOR`
	 * ‍   col = param0(uv);
	 * }
	 * 
	 * // All other types are used like normal
	 * // E.g
	 * void main(){
	 * ‍   if(param0 > 1){
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
	function Shader(glsl: string, options?: { params?: number | number[], defaults?: number | number[], uniforms?: number | number[], uniformDefaults?: number | number[], outputs?: number, intFrac?: number, vertex?: Geometry2D.Vertex }): Shader2D
	function Shader(glsl: string, options: { params?: number | number[], defaults?: number | number[], uniforms?: number | number[], uniformDefaults?: number | number[], outputs?: number, intFrac?: number, vertex: Geometry3D.Vertex }): Shader3D

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
	/** See `Geometry2D.Vertex() / Geometry3D.Vertex()` */ const FLAT = 64
	/** See `Shader()` */ const TEXTURE = 20
	/** See `Shader()` */ const UTEXTURE = 24
	/** See `Shader()` */ const FTEXTURE = 28
	/** See `Shader()` */ const COLOR = 4
	/** See `Shader()` */ const UCOLOR = 8
	/** See `Shader()` */ const FCOLOR = 12
	/** See `Shader()` */ const LOWP = 4

	interface Shader2D{
		/** Set the shader's uniforms, as specified by the shader itself. See `Shader()` */
		uniforms(...values: any[]): void
	}
	interface Shader3D{
		/** Set the shader's uniforms, as specified by the shader itself. See `Shader()` */
		uniforms(...values: any[]): void
	}
	namespace Shader{
		/**
		 * The default shader, to draw a texture or solid color, optionally with a tint
		 * 
		 * Values: `(thing: Texture | vec4, tint = vec4(1))` (i.e `[COLOR, VEC4]`)
		 * 
		 * Uniforms: none
		 */
		const DEFAULT: Shader2D
		/**
		 * Simple shader to draw a solid color
		 * 
		 * Values: `(color: vec4)` (i.e `[VEC4]`)
		 * 
		 * Uniforms: none
		 */
		const SIMPLE: Shader2D
		/**
		 * Shader for drawing to integer-texture targets
		 * 
		 * Values: `(thing: vec4)` (i.e `[UVEC4]`)
		 * 
		 * Uniforms: none
		 * 
		 * Writes to integer targets
		 */
		const UINT: Shader2D
		/**
		 * Always draws opaque black
		 * 
		 * Values: None
		 * 
		 * Uniforms: none
		 */
		const BLACK: Shader2D

		/**
		 * The default shader for 3D drawable contexts, to draw a texture or solid color, applied based on the geometry's X/Z positions
		 * 
		 * Values: `(thing: Texture | vec4)` (i.e `[COLOR]`)
		 * 
		 * Uniforms: none
		 */
		const COLOR_3D_XZ: Shader3D

		/**
		 * Shader for drawing a texture or solid color, applied based on the geometry's X/Z positions, with additional tint based on a face's direction to simulate some fake lighting
		 * 
		 * The tint is meant to greatly help humans in edge-detection, and makes a geometry look much less "flat" or unnatural than the default shader. The tint factor is calculated from the dot product of the normal and the "light" vector supplied. If this dot product is positive, the face becomes darker
		 * 
		 * Values: `(thing: Texture | vec4, light = vec3(-.15, -.3, 0))` (i.e `[COLOR, VEC3]`)
		 * 
		 * Uniforms: none
		 */
		const SHADED_3D: Shader3D
	}

	/**
	 * Flush all draw commands to the GPU. Must be called after you are done if your are not using `loop()`
	 * @performance Performs a few post-frame cleanups. No need to call mid-frame as there is literally no benefit and only opportunity to hurt performance. Might be useful to work around library bugs (hopefully there are none!)
	 */
	function flush(): void

	/** The main Drawable, representing the <canvas> element. This drawable is limited: it cannot be read from, or have its configuration modified in any way. To do that, draw to a separate drawable and then `paste()` to `ctx` */
	const ctx: Drawable2D

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
	 * How many sprites (`Drawable2D.draw*()` calls) were performed during the last frame
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
	let frameCpu: number
	/**
	 * Callback for when the underlying `webgl2` context is lost (possibly GPU crash)
	 * 
	 * Available after calling `loop()`
	 */
	let glLost: (() => any) | null
}