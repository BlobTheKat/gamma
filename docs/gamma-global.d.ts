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

	interface Texture{
		/** Not all implementations support linear filtering (SMOOTH) for xxx32F textures. This boolean indicates if this kind of filtering is supported. If it is not, nearest-neighbor (pixelated) will be used instead */
		readonly static FILTER_32F: boolean
		/**
		 * Whether this texture's format is an integer-type format
		 * 
		 * Integer formats will end in 8, 16, or 32 (e.g `Formats.RGBA32`, `Formats.R8`)
		 * 
		 * Non-integer formats will typically end in F for floating-point (e.g `Formats.RG16F`, `Formats.R11F_G11F_B10F`), or nothing in particular for fixed-point (e.g `Formats.RGB`, `Formats.RGB565`)
		 * 
		 * The two texture types often cannot be used interchangeably, as shaders declare and use them discriminately
		 * 
		 * Note that floating-point and fixed-point textures can be interchanged freely and are often both referred to as "float" textures for brevity
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
		readonly subWidth: number
		readonly subHeight: number
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
		/**
		 * Trigger an image-backed texture to be loaded.
		 * 
		 * If the image is already loaded or loading (i.e `this.loaded || this.waiting`), this is a no-op.
		 * 
		 * Otherwise, `waiting` immediately becomes true, then, once the image has finished loading and the texture object has been populated, `loaded` will become true and `waiting` will become false
		 */
		load(): void
		sub(x=0, y=0, w=1, h=1, l=this.l)
		sup(x=0,y=0,w=1,h=1)
		crop(x=0, y=0, w=1, h=1, l=this.l)
		layer(l = this.l)
		paste(tex, x=0, y=0, l=0, srcX=0, srcY=0, srcL=0, srcW=0, srcH=0, srcD=0, srcMip=0, dstMip=0)
		pasteData(data, x=0, y=0, l=0, w=0, h=0, d=0, mip=0)
		readData(x=0, y=0, l=0, w=0, h=0, d=0, arr=null,mip=0)
		delete()
		get options(){ return this.t.o }
		set options(o){
			const {t} = this
			t.o = o
			if(t.src) return
			img.setOptions(t)
			if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
		}
		setMipmapRange(s=0, e=65535){
			const {t} = this
			if(t.src) return
			img.fakeBind(t)
			gl.texParameteri(gl.TEXTURE_2D_ARRAY, 33082, s)
			gl.texParameteri(gl.TEXTURE_2D_ARRAY, 33083, e)
			if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
		}
		genMipmaps(){
			const {t} = this
			if(!t.m) return
			img.fakeBind(t)
			gl.generateMipmap(gl.TEXTURE_2D_ARRAY)
			if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
		}
	}
$.Drawable = (img, layer = img.l, mip = 0, stencil = false)=>{
	const {t} = img
	if(t.src) return null
	let stencilBuf = null
	if(stencil){
		gl.bindRenderbuffer(gl.RENDERBUFFER, stencilBuf = gl.createRenderbuffer())
		gl.renderbufferStorage(gl.RENDERBUFFER, 36168, t.w, t.h)
	}
	return new can({ tex: t.tex, img, layer: layer, stencil: 0, mip, stencilBuf, w: t.w, h: t.h })
}
let arr = new Float32Array(16), iarr = new Int32Array(arr.buffer), i = 0
$.Texture = (w = 0, h = 0, d = 0, o = 0, f = Formats.RGBA, mips = 0) => {
	const t = { tex: gl.createTexture(), i: -1, a: -1, o, f, src: null, w, h, d: +d||1, m: mips }
	const tx = new img(t)
	img.setOptions(t)
	if(w && h) gl.texStorage3D(gl.TEXTURE_2D_ARRAY, (t.m = mips) || 1, t.f[0], t.w = w, t.h = h, t.d = +d || 1)
	else gl.texStorage3D(gl.TEXTURE_2D_ARRAY, (t.m = mips) || 1, t.f[0], t.w = 1, t.h = 1, t.d = 1)
	gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
	return tx
}
$.Texture.MAX_WIDTH = $.Texture.MAX_HEIGHT = gl.getParameter(gl.MAX_TEXTURE_SIZE)
$.Texture.MAX_LAYERS = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS)
$.Img = (src, o = 0, fmt = Formats.RGBA, mips = 0) => new img({
	tex: null, i: -1, a: -1, o, f:fmt, src: src ? Array.isArray(src) ? src : [src] : [],
	w: 0, h: 0, d: src ? Array.isArray(src) ? src.length : 1 : 0, m: mips
})
Object.assign($, {
	UPSCALE_SMOOTH: 1, DOWNSCALE_SMOOTH: 2, MIPMAP_SMOOTH: 4, SMOOTH: 7, REPEAT_X: 8, REPEAT_MIRRORED_X: 16, REPEAT_Y: 32, REPEAT_MIRRORED_Y: 64, REPEAT: 40, REPEAT_MIRRORED: 80,
	R: 1, G: 2, B: 4, A: 8,
	RGB: 7, RGBA: 15,
	IF_SET: 16, IF_UNSET: 32, NO_DRAW: 48,
	UNSET: 64, SET: 128, FLIP: 192,
	ONE: 17, ZERO: 0, RGB_ONE: 1, A_ONE: 16,
	SRC: 34, RGB_SRC: 2,
	ONE_MINUS_SRC: 51,
	RGB_ONE_MINUS_SRC: 3,
	SRC_ALPHA: 68,
	RGB_SRC_ALPHA: 4,
	A_SRC: 64,
	ONE_MINUS_SRC_ALPHA: 85,
	RGB_ONE_MINUS_SRC_ALPHA: 5,
	A_ONE_MINUS_SRC: 80,
	DST: 136, RGB_DST: 8,
	ONE_MINUS_DST: 153,
	RGB_ONE_MINUS_DST: 9,
	DST_ALPHA: 102,
	RGB_DST_ALPHA: 6,
	A_DST: 96,
	ONE_MINUS_DST_ALPHA: 119,
	RGB_ONE_MINUS_DST_ALPHA: 7,
	A_ONE_MINUS_DST: 112,
	SRC_ALPHA_SATURATE: 170,
	RGB_SRC_ALPHA_SATURATE: 10,
	ADD: 17, RGB_ADD: 1, A_ADD: 16,
	SUB: 85,
	RGB_SUB: 5,
	A_SUB: 80,
	SUB_REV: 102,
	RGB_SUB_REV: 6,
	A_SUB_REV: 96,
	MIN: 34, RGB_MIN: 2, A_MIN: 32,
	MAX: 51, RGB_MAX: 3, A_MAX: 48,
	FLOAT: 0, VEC2: 1, VEC3: 2, VEC4: 3,
	INT: 16, IVEC2: 17, IVEC3: 18, IVEC4: 19,
	UINT: 32, UVEC2: 33, UVEC3: 34, UVEC4: 35,
	TEXTURE: 20, UTEXTURE: 24, FTEXTURE: 28, COLOR: 4, UCOLOR: 8, FCOLOR: 12,
	FIXED: 4, _: undefined,
	TRIANGLE_STRIP: 5, TRIANGLES: 4, TRIANGLE_FAN: 6, LINE_LOOP: 2, LINE_STRIP: 3, LINES: 1, POINTS: 0
})
const _vec2 = class vec2{
	constructor(x,y){this.x=x;this.y=y}
	copy(){return new _vec2(this.x,this.y)}
	plus(v=0){return typeof v=='number'?new _vec2(this.x+v,this.y+v):new _vec2(this.x+v.x,this.y+v.y)}
	minus(v=0){return typeof v=='number'?new _vec2(this.x-v,this.y-v):new _vec2(this.x-v.x,this.y-v.y)}
	neg(){return new _vec2(-this.x,-this.y)}
	recip(){return new _vec2(1/this.x,1/this.y)}
	times(v=1){return typeof v=='number'?new _vec2(this.x*v,this.y*v):new _vec2(this.x*v.x,this.y*v.y)}
	div(v=1){return typeof v=='number'?new _vec2(this.x/v,this.y/v):new _vec2(this.x/v.x,this.y/v.y)}
	pow(v=1){return typeof v=='number'?new _vec2(this.x**v,this.y**v):new _vec2(this.x**v.x,this.y**v.y)}
	set(v=0){if(typeof v=='number')this.x=this.y=v;else this.x=v.x,this.y=v.y}
	map(fn){return new _vec2(fn(this.x),fn(this.y))}
	eq(v){return typeof v=='number'?this.x==v&&this.y==v:this.x==v.x&&this.y==v.y}
	length(){return hypot(this.x,this.y)}
	get yx(){return _vec2(this.y,this.x)}
}, _vec3 = class vec3{
	constructor(x,y,z){this.x=x;this.y=y;this.z=z}
	copy(){return new _vec3(this.x,this.y,this.z)}
	plus(v=0){return typeof v=='number'?new _vec3(this.x+v,this.y+v,this.z+v):new _vec3(this.x+v.x,this.y+v.y,this.z+v.z)}
	minus(v=0){return typeof v=='number'?new _vec3(this.x-v,this.y-v,this.z-v):new _vec3(this.x-v.x,this.y-v.y,this.z-v.z)}
	neg(){return new _vec3(-this.x,-this.y,-this.z)}
	recip(){return new _vec3(1/this.x,1/this.y,1/this.z)}
	times(v=1){return typeof v=='number'?new _vec3(this.x*v,this.y*v,this.z*v):new _vec3(this.x*v.x,this.y*v.y,this.z*v.z)}
	div(v=1){return typeof v=='number'?new _vec3(this.x/v,this.y/v,this.z/v):new _vec3(this.x/v.x,this.y/v.y,this.z/v.z)}
	pow(v=1){return typeof v=='number'?new _vec3(this.x**v,this.y**v,this.z**v):new _vec3(this.x**v.x,this.y**v.y,this.z**v.z)}
	set(v=0){if(typeof v=='number')this.x=this.y=this.z=v;else this.x=v.x,this.y=v.y,this.z=v.z}
	map(fn){return new _vec3(fn(this.x),fn(this.y),fn(this.z))}
	eq(v){return typeof v=='number'?this.x==v&&this.y==v&&this.z==v:this.x==v.x&&this.y==v.y&&this.z==v.z}
	length(){return hypot(this.x,this.y,this.z)}
	get xy(){return new _vec2(this.x,this.y)}
	get yz(){return new _vec2(this.y,this.z)}
	get zyx(){return new _vec3(this.z,this.y,this.x)}
}, _vec4 = class vec4{
	constructor(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w}
	copy(){return new _vec4(this.x,this.y,this.z,this.w)}
	plus(v=0){return typeof v=='number'?new _vec4(this.x+v,this.y+v,this.z+v,this.w+v):new _vec4(this.x+v.x,this.y+v.y,this.z+v.z,this.w+v.w)}
	minus(v=0){return typeof v=='number'?new _vec4(this.x-v,this.y-v,this.z-v,this.w-v):new _vec4(this.x-v.x,this.y-v.y,this.z-v.z,this.w-v.w)}
	neg(){return new _vec4(-this.x,-this.y,-this.z,-this.w)}
	recip(){return new _vec4(1/this.x,1/this.y,1/this.z,1/this.w)}
	times(v=1){return typeof v=='number'?new _vec4(this.x*v,this.y*v,this.z*v,this.w*v):new _vec4(this.x*v.x,this.y*v.y,this.z*v.z,this.w*v.w)}
	div(v=1){return typeof v=='number'?new _vec4(this.x/v,this.y/v,this.z/v,this.w/v):new _vec4(this.x/v.x,this.y/v.y,this.z/v.z,this.w/v.w)}
	pow(v=1){return typeof v=='number'?new _vec4(this.x**v,this.y**v,this.z**v,this.w**v):new _vec4(this.x**v.x,this.y**v.y,this.z**v.z,this.w**v.w)}
	set(v=0){if(typeof v=='number')this.x=this.y=this.z=this.w=v;else this.x=v.x,this.y=v.y,this.z=v.z,this.w=v.w}
	map(fn){return new _vec4(fn(this.x),fn(this.y),fn(this.z),fn(this.w))}
	eq(v){return typeof v=='number'?this.x==v&&this.y==v&&this.z==v&&this.w==v:this.x==v.x&&this.y==v.y&&this.z==v.z&&this.w==v.w}
	length(){return hypot(this.x,this.y,this.z,this.w)}
	get xy(){return new _vec2(this.x,this.y)}
	get yz(){return new _vec2(this.y,this.z)}
	get zw(){return new _vec2(this.z,this.w)}
	get xyz(){return new _vec3(this.x,this.y,this.z)}
	get yzw(){return new _vec3(this.y,this.z,this.w)}
	get wzyx(){return new _vec4(this.w,this.z,this.y,this.x)}
}
$.vec2 = (x=0,y=x) => new _vec2(x,y)
$.vec2.one = $.vec2(1); const v2z = $.vec2.zero = $.vec2(0)
$.vec3 = (x=0,y=x,z=x) => new _vec3(x,y,z)
$.vec3.one = $.vec3(1); const v3z = $.vec3.zero = $.vec3(0)
$.vec4 = (x=0,y=x,z=x,w=x) => new _vec4(x,y,z,w)
$.vec4.one = $.vec4(1); const v4z = $.vec4.zero = $.vec4(0)
const grow = new Function(ArrayBuffer.prototype.transfer?'arr=new Float32Array(arr.buffer.transfer(i*8)),iarr=new Int32Array(arr.buffer)':'const oa=arr;(arr=new Float32Array(i*2)).set(oa,0);iarr=new Int32Array(arr.buffer)')
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
let pmask=285217039

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
function setv(t,m){
	const s = t.stencil
	let d = pmask^m
	if(ca!=t){
		i&&draw()
		gl.FRAMEBUFFER
		if(!t.img) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,null),gl.viewport(0,0,t.w,t.h)
		else{
			if(ca==ctx.t) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,fb)
			if(t.tex!=fbTex||t.layer!=fbLayer||t.mip!=fbMip) gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER,36064,fbTex=t.tex,fbMip=t.mip,fbLayer=t.layer)
			if(t.stencilBuf!=fbSte) gl.bindRenderbuffer(gl.RENDERBUFFER,fbSte=t.stencilBuf),gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER,36128,gl.RENDERBUFFER,fbSte)
			const t2 = t.img.t; gl.viewport(0,0,t2.w>>fbMip,t2.h>>fbMip)
			if(t2.i>=0){
				gl.activeTexture(33984 + t2.i); gl.bindTexture(gl.TEXTURE_2D_ARRAY, bound[t2.i] = null); t2.i = -1
			}
			if(!ca||ca.stencil!=s) d|=240
		}
		ca=t
	}
	if(d){
		i&&draw()
		if(d&15) gl.colorMask(m&1,m&2,m&4,m&8)
		if(d&240){
			if(m&240){
				if(!(pmask&240)) gl.enable(2960) // STENCIL_TEST
				gl.stencilMask(1<<s)
				gl.stencilFunc(m&32?m&16?gl.NEVER:gl.NOTEQUAL:m&16?gl.EQUAL:gl.ALWAYS,255,1<<s)
				const op = m&128?m&64?gl.INVERT:gl.REPLACE:m&64?gl.ZERO:gl.KEEP
				gl.stencilOp(op, op, op)
			}else if(pmask&240) gl.disable(2960) // STENCIL_TEST
		}
		if(d&1996488704) gl.blendEquationSeparate((m>>24&7)+32773,(m>>28&7)+32773)
		if(d&16776960) gl.blendFuncSeparate((m>>8&15)+766*!!(m&3584), (m>>16&15)+766*!!(m&917504), (m>>12&15)+766*!!(m&57344), (m>>20&15)+766*!!(m&14680064))
		if(d&-2147483648) m&-2147483648 ? gl.enable(3024) : gl.disable(3024) // DITHER
		pmask = m
	}
}
function draw(b=shuniBind){
	gl.bufferData(34962, iarr.subarray(0, i), 35040)
	const {type,start:s,length:l}=shp
	fd += i; i /= sh.count; fdc++; fs += i
	gl.drawArraysInstanced(type, s, l, i)
	i = 0; boundUsed = b
	if(pendingFences.length){ fencetail ??= pendingFences[0]; for(const f of pendingFences){
		f.sync = gl.fenceSync(37143,0)
		fencehead = fencehead ? fencehead.next = f : f
	} pendingFences.length = 0 }
}
let sh=null,ca=null,fbTex=null,fbSte=null,fbLayer=0,fbMip=0,shfCount=0,shfMask=0
const fb = gl.createFramebuffer()
gl.bindFramebuffer(gl.READ_FRAMEBUFFER, gl.createFramebuffer())
const buf = gl.createBuffer()
gl.bindBuffer(34962, buf)
const maxTex = min(32, gl.getParameter(34930))
const bound = []; for(let i=maxTex<<1;i>0;i--) bound.push(null)
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
function sub(s=0,l=this.length-s, type=this.type){
	return {type, b: this.b, start: this.start+s, length: l, sub}
}
let boundUsed = 0, shp = T.DEFAULT = T($.TRIANGLE_STRIP, [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1]), shuniBind = 0
const defaultShape = shp
let g
const treeIf = (s=0, e=maxTex,o=0) => {
	if(e<=s+1) return g(s)
	const m = s+(1<<31-clz32(e-s-1))
	return `if(u<${m+o}){${treeIf(s,m,o)}}else{${treeIf(m,e,o)}}`
}
const names = ['float','vec2','vec3','vec4','int','ivec2','ivec3','ivec4','uint','uvec2','uvec3','uvec4']
T = $.Shader = (src, inputs, defaults, uniforms, uDefaults, output=4, frat=0.5) => {
	const fnParams = ['(function({'], fnBody = ['',''], shaderHead = ['#version 300 es\nprecision mediump float;precision highp int;layout(location=0)in vec4 _pos;out vec2 uv,xy;layout(location=1)in mat2x3 m;',''], shaderBody = ['void main(){gl_PointSize=1.0;uv=_pos.zw;gl_Position=vec4((xy=vec3(_pos.xy,1.)*m)*2.-1.,0.,1.);'], shaderHead2 = ['#version 300 es\nprecision mediump float;precision highp int;in vec2 uv,xy;uniform vec2 viewport;out '+(output==0?'highp vec4 color;':output==16||output==32?'uvec4 color;':'lowp vec4 color;'),'']
	let j = 6, o = 0, fCount = 0, iCount = 0
	const types = [3,3]
	const texCheck = []
	
	let id = 0
	inputs = typeof inputs=='number' ? [inputs] : inputs || []
	uniforms = typeof uniforms=='number' ? [uniforms] : uniforms || []
	defaults = defaults != null ? Array.isArray(defaults) ? defaults : [defaults] : []
	uDefaults = uDefaults != null ? Array.isArray(uDefaults) ? uDefaults : [uDefaults] : []
	for(const t of inputs){
		let c = (t&3)+1, n = names[t&3|t>>4<<2]
		const isCol = t==4||t==8||t==12
		defaults[id] ??= t==4?v4z:c==1?0:c==2?v2z:c==3?v3z:v4z
		fnParams.push(id+':a'+j+'=defaults['+id+'],')
		const A = t>15?(o|=1,'iarr[j+'):'arr[j+'
		if(t==20||t==24||t==28){
			n='int',o|=(1<<(t>>2)-3),fCount++
			texCheck.push(`a${j}=(img.auto(a${j+(t==24?'.t,-1':'.t,0')})+1||(i&&draw(b^boundUsed),img.auto(a${j+(t==24?'.t,-1':'.t,0')})+1))-1`)
		}
		if(t==12||t==28) o|=2
		if(t==8||t==24) iCount++,fCount--
		if(isCol){
			texCheck.push(`let a${j+1}=${t==4?`-1;if(a${j}.t&&(a${j+1}=img.auto(a${j}.t,0))==-1)`:`img.auto(a${j+(t==8?'.t,-1':'.t,0')});if(a${j+1}==-1)`}{i&&draw(b^boundUsed);a${j+1}=img.auto(a${j+(t==8?'.t,-1':'.t,0')})}`)
			fCount++
			const n = `arg${id}raw`
			shaderHead.push(`layout(location=${types.length+1})in int i${j};layout(location=${types.length+2})in vec4 i${j+1};centroid out vec4 ${n};`)
			shaderBody.push(t!=4?`${n}=vec4(i${j+1}.xy+uv*i${j+1}.zw,i${j}>>8,i${j}&255);`:`if(i${j}==-1){${n}=i${j+1};${n}.w=max(-15856.,${n}.w);}else{${n}=vec4(i${j+1}.xy+uv*i${j+1}.zw,i${j}>>8,(i${j}&255)==0?-15872:((i${j}&255)<<4)-16384);}`)
			shaderHead2.push(`centroid in vec4 ${n};${t==4?'lowp ':t==8?'u':'highp '}vec4 arg${id}(){`+(t==4?`if(${n}.w>-15872.)return ${n};return getColor(int(${n}.w)>>4&31,${n}.xyz);}`:t==8?`return uGetColor(int(${n}.w),${n}.xyz);}`:`return fGetColor(int(${n}.w),${n}.xyz);}`))
			o|=(1<<(t>>2)+1)
			types.push(17,4)
			fnBody.push('iarr[j+'+j+']=a'+(j+1)+'|a'+j+'.l<<8')
			for(c=0;++c<3;) fnBody.push(A+(j+c)+']=a'+j+'.'+' xy'[c])
			fnBody.push(`if(a${j+1}>=0)${A+(j+3)}]=a${j}.w,${A+(j+4)}]=a${j}.h;else ${A+(j+3)}]=a${j}.z,${A+(j+4)}]=a${j}.w`)
			c=5
		}else{
			shaderHead.push('layout(location='+(types.length+1)+')in '+n+' i'+j+';flat out '+n+' arg'+id+';')
			shaderBody.push('arg'+id+'=i'+j+';')
			shaderHead2.push('flat in '+n+' arg'+id+';')
			types.push(c|t&48)
			if(c==1) fnBody.push(A+j+']=a'+j)
			else for(let c1=-1;++c1<c;) fnBody.push(A+(j+c1)+']=a'+j+'.'+'xyzw'[c1])
		}
		j += c
		id++
	}
	id = 0; let j2 = 0, j3 = 0
	const fn2Params = [], fn2Body = ['fd+=j2;i&&draw(0);if(sh!=s){shfCount=fCount;shfMask=fMask;gl.useProgram((sh=s).program);gl.bindVertexArray(s.vao)}'], fn3Body = []
	const uniTex = [], uniLocs = []
	for(const t of uniforms){
		let c = (t&3)+1, n = names[t&3|t>>4<<2]
		uDefaults[id] ??= t==4?v4z:c==1?0:c==2?v2z:c==3?v3z:v4z
		fn2Params.push('a'+j2+'=uDefaults['+id+']')
		if(t==12||t==28) o|=2
		if(t==8||t==24) iCount++,fCount--
		if(t==20||t==24||t==28){
			o|=(1<<(t>>2)-3),fCount++
			fn3Body.push(`gl.uniform1i(uniLocs[${j3}],uniTex[${uniTex.length}]?img.auto(uniTex[${uniTex.length}]${t==24?',-1':',0'}):${t==24?maxTex:0})`)
			shaderHead2.push('uniform int uni'+id+';')
			fn2Body.push(`uniTex[${uniTex.length}]=a${j2}.t`)
			uniTex.push(null)
		}else if(t==4||t==8||t==12){
			fn3Body.push(`gl.uniform1i(uniLocs[${j3++}],(uniTex[${uniTex.length}]?img.auto(uniTex[${uniTex.length}]${t==8?',-1':',0'}):${t==8?maxTex:0})|uniTex[${uniTex.length+1}])`)
			uniTex.push(null,0)
			fCount++
			const n = `uni${id}raw`
			shaderHead.push(`uniform int u${j2};uniform vec4 u${j2+1};centroid out vec4 ${n};`)
			shaderBody.push(t!=4?`${n}=vec4(u${j2+1}.xy+uv*u${j2+1}.zw,u${j2}>>8,u${j2}&255);`:`if(u${j2}==-1){${n}=u${j2+1};${n}.w=max(-15856.,${n}.w);}else{${n}=vec4(u${j2+1}.xy+uv*u${j2+1}.zw,u${j2}>>8,(u${j2}&255)==0?-15872:((u${j2}&255)<<4)-16384);}`)
			shaderHead2.push(`centroid in vec4 ${n};${t==4?'lowp ':t==8?'u':'highp '}vec4 uni${id}(){`+(t==4?`if(${n}.w>-15872.)return ${n};return getColor(int(${n}.w)>>4&31,${n}.xyz);}`:t==8?`return uGetColor(int(${n}.w),${n}.xyz);}`:`return fGetColor(int(${n}.w),${n}.xyz);}`))
			o|=(1<<(t>>2)+1)
			fn2Body.push(`uniTex[${uniTex.length-2}]=a${j2}.t;uniTex[${uniTex.length-1}]=a${j2}.l<<8;gl.uniform4f(uniLocs[${j3}],a${j2}.x,a${j2}.y,a${j2}.w,a${j2}.h)`)
		}else{
			shaderHead2.push('uniform '+n+' uni'+id+';')
			let args = `gl.uniform${c+(t<16?'f':t<32?'i':'ui')}(uniLocs[${j3}]`
			if(c==1) args += ',a'+j2
			else for(let c1=-1;++c1<c;) args += ',a'+j2+'.'+'xyzw'[c1]
			fn2Body.push(args+')')
		}
		j2 += c
		id++; j3++
	}
	if(fCount+iCount>16) throw 'Shaders cannot use more than 16 textures/colors'
	fCount = fCount?iCount?fCount+round(frat * (maxTex-fCount-iCount)):maxTex:0
	iCount = iCount && maxTex - fCount
	g=i=>'return texture(GL_f['+i+'],p);'; let T=null
	shaderHead2[1] =
		(o&20?'uniform '+(o&2?'highp':'lowp')+' sampler2DArray GL_f['+fCount+'];':'')
		+(o&8?'uniform highp usampler2DArray GL_i['+iCount+'];':'')
		+(o&4?`lowp vec4 getColor(int u,vec3 p){${T=treeIf(0,fCount)}}`:'')
		+(o&16?`highp vec4 fGetColor(int u,vec3 p){${T||treeIf(0,fCount)}}`:'')
		+(o&8?`uvec4 uGetColor(int u,vec3 p){${g=i=>'return texture(GL_i['+i+'],p);',treeIf(0,maxTex-fCount,maxTex)}}`:'')
	shaderHead2[1] +=
		(o&4?`lowp vec4 getPixel(int u,ivec3 p,int l){${g=i=>'return texelFetch(GL_f['+i+'],p,l);',T=treeIf(0,fCount)}}`:'')
		+(o&16?`highp vec4 fGetPixel(int u,ivec3 p,int l){${T||treeIf(0,fCount)}}`:'')
		+(o&8?`uvec4 uGetPixel(int u,ivec3 p,int l){${g=i=>'return texelFetch(GL_i['+i+'],p,l);',treeIf(0,maxTex-fCount,maxTex)}}`:'')
		+(o&28?`ivec3 getSize(int u,int l){${g=i=>'return textureSize(GL_'+(i<fCount?'f['+i:'i['+(i-fCount))+'],l);',T=treeIf(0,maxTex)}}`:'')
	fnBody[0] = '}){if(sh!=s){i&&draw(0);shfCount=fCount;shfMask=fMask;gl.useProgram((sh=s).program);gl.bindVertexArray(s.vao);bindUniTex()}if(shp!=this.s){i&&draw();shp=this.s}if(s.geometry!=this.s.b){gl.bindBuffer(34962,s.geometry=this.s.b);gl.vertexAttribPointer(0,4,gl.FLOAT,0,0,0);gl.bindBuffer(34962,buf)}const b=boundUsed^shuniBind;'+texCheck.join(';')+';const j=i;if((i=j+'+j+')>arr.length)'+(ArrayBuffer.prototype.transfer?'arr=new Float32Array(arr.buffer.transfer(i*8)),iarr=new Int32Array(arr.buffer)':'{const oa=arr;(arr=new Float32Array(i*2)).set(oa,0);iarr=new Int32Array(arr.buffer)}')
	fnBody.push('return j})')
	const s = eval(fnParams.join('')+fnBody.join(';')), p = s.program = gl.createProgram()
	s.uniforms = eval(`(function(${fn2Params}){${fn2Body.join(';')};bindUniTex()})`)
	const bindUniTex = eval(`(function(){${fn3Body.join(';')};shuniBind=boundUsed})`)
	const fMask = 32-fCount&&(-1>>>fCount)
	s.outInt = (output==16||output==32)<<31
	const v=gl.createShader(35633), f=gl.createShader(35632)
	shaderBody.push('}')
	gl.shaderSource(v, shaderHead.join('')+shaderBody.join(''))
	gl.compileShader(v)
	gl.shaderSource(f, shaderHead2.join('')+'\n'+src)
	gl.compileShader(f)
	gl.attachShader(p, v)
	gl.attachShader(p, f)
	if(T=gl.getShaderInfoLog(f)) console.warn('GLSL Error:\n'+T)
	gl.linkProgram(p)
	gl.useProgram(p)
	while(j3--) uniLocs.push(gl.getUniformLocation(p, 'uni'+uniLocs.length))
	for(let i = 0; i < maxTex; i++)
		gl.uniform1i(gl.getUniformLocation(p, i<fCount?'GL_f['+i+']':'GL_i['+(i-fCount)+']'), i>=fCount?maxTex+i-fCount:i)
	s.count = j
	gl.bindVertexArray(s.vao = gl.createVertexArray())
	let i1 = 1, i2 = 0
	gl.bindBuffer(34962, s.geometry = defaultShape.b)
	gl.enableVertexAttribArray(0)
	gl.vertexAttribPointer(0, 4, gl.FLOAT, 0, 0, 0)
	gl.bindBuffer(34962, buf)
	for(const t of types){
		gl.enableVertexAttribArray(i1)
		if(t>>4) gl.vertexAttribIPointer(i1, t&15, (t>31)+5124, j<<2, i2)
		else gl.vertexAttribPointer(i1, t&15, gl.FLOAT, 0, j<<2, i2)
		gl.vertexAttribDivisor(i1++, 1)
		i2 += (t&15)<<2
	}
	if(sh) gl.useProgram(sh.program), gl.bindVertexArray(sh.vao)
	return s
}
let fdc = 0, fs = 0, fd = 0
T.DEFAULT = sh = T(`void main(){color=arg0()*arg1;}`, [$.COLOR, $.VEC4], [void 0, $.vec4.one])
T.UINT = T(`void main(){color=arg0();}`, $.UCOLOR, void 0, void 0, void 0, $.UINT)
T.NONE = T(`void main(){color=vec4(0,0,0,1);}`)
gl.useProgram(sh.program)
gl.bindVertexArray(sh.vao)
$.flush = () => i&&draw()
const ctx = $.ctx = new can(ca={tex:gl.canvas,img:null,layer:0,stencil:0,mip:0,stencilBuf:null,w:0,h:0})
$.setSize = (w = 0, h = 0) => {
	ctx.t.w = gl.canvas.width = w
	ctx.t.h = gl.canvas.height = h
	if(ca==ctx.t) gl.viewport(0, 0, w, h)
}
let fencetail = null, fencehead = null
const pendingFences = []
$.wait = () => new Promise(r => {
	if(i) r.sync = null, pendingFences.push(r)
	else{
		r.sync = gl.fenceSync(37143, 0)
		fencetail ??= r
		fencehead = fencehead ? fencehead.next = r : r
	}
	if(!intv) intv = setInterval(() => {
		while(fencetail && gl.getSyncParameter(fencetail.sync, 37140) == 37145){
			gl.deleteSync(fencetail.sync)
			fencetail()
			fencetail = fencetail.next
		}
		if(!fencetail){
			fencehead = null
			clearInterval(intv)
			intv = 0
		}
	}, 0)
})
let intv = 0
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