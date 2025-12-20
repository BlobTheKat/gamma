// © 2025 Matthew Reiner. https://github.com/BlobTheKat/gamma
{
const $ = globalThis
Math.PI2 ??= Math.PI*2
Math.HALF_SQRT3 ??= .8660254037844386
Math.clamp ??= (v, m, M) => v<m?m:v>M?M:v
const { clz32, cos, sin, min, round } = Math
if(!('setImmediate' in $)){
	let base = 0, cur = 0, queue = [], m = new MessageChannel();
	m.port1.onmessage = () => {
		const fn = queue[cur]
		queue[cur++] = null
		if(cur > 3 && cur > (queue.length>>1)){
			queue.splice(0,cur)
			base += cur
			cur = 0
		}
		fn?.()
	}
	m = m.port2
	$.setImmediate = (fn, ...args) => {
		m.postMessage(0)
		queue.push(args.length ? fn.bind(undefined,...args) : fn)
		return queue.length-1+base
	}
	$.clearImmediate = i => {
		i -= base
		if(i!==i>>>0) return
		if(i >= queue.length) return
		queue[i]=null
	}
}
if(!('sin' in $)){
	const props = Object.getOwnPropertyDescriptors(Math)
	delete props[Symbol.toStringTag]
	Object.defineProperties($, props)
}
const imageBitmapOpts = {imageOrientation: 'flipY', premultiplyAlpha: 'premultiply'}
const resolveData = (val, cb, err) => typeof val == 'string' ?
	fetch(val).then(a => a.blob()).then(val => createImageBitmap(val, imageBitmapOpts)).then(cb, err)
	: val instanceof Blob ?
		createImageBitmap(val, imageBitmapOpts).then(cb, err)
		: cb(val)

$.Gamma = (can = document.createElement('canvas'), $ = {}, flags = 15) => {
/** @type WebGL2RenderingContext */
$.flags = flags
const gl = $.gl = ($.canvas = can).getContext('webgl2', {preserveDrawingBuffer: !(flags&8), antialias: flags&16, depth: false, premultipliedAlpha: flags&4, stencil: flags&1, alpha: flags&2})
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
gl.stencilMask(1)
gl.clearStencil(0)
gl.disable(gl.DEPTH_TEST)
gl.enable(gl.BLEND)
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
gl.pixelStorei(gl.PACK_ALIGNMENT, 1)

const unpackBuffer = gl.createBuffer()
gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, unpackBuffer)

// Texture-function-related global state
let premultAlpha = true, lastPbo = null, lastPboSize = -1, pboUsed = false
// Drawing-related global state
let pmask = 285217039, sh = null, sv = null, shfCount = 0, shfMask = 0, shCount = 0
let curfb = null, boundUsed = 0, shuniBind = 0, shpType = 5, shpStart = 0, shpLen = 4, shp = null, shpElT = 0
gl.bindFramebuffer(gl.READ_FRAMEBUFFER, gl.createFramebuffer())
const drawfb = gl.createFramebuffer(), buf = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buf)
const maxTex = min(32, gl.getParameter(34930)), bound = []
for(let i = maxTex<<1; i --> 0;) bound.push(null)

Object.assign($, {
	UPSCALE_SMOOTH: 1, DOWNSCALE_SMOOTH: 2,
	MIPMAP_SMOOTH: 4, SMOOTH: 7,
	REPEAT_X: 8, REPEAT_MIRRORED_X: 16,
	REPEAT_Y: 32, REPEAT_MIRRORED_Y: 64,
	REPEAT: 40, REPEAT_MIRRORED: 80,
	R: 1, G: 2, B: 4, A: 8,
	RGB: 7, RGBA: 15,
	IF_SET: 16, IF_UNSET: 32, NEVER: 48,
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
	TEXTURE: 28, FTEXTURE: 29, ITEXTURE: 30, UTEXTURE: 31,
	COLOR: 12, FCOLOR: 13, ICOLOR: 14, UCOLOR: 15,
	FLAT: 64, CW_ONLY: 16, CCW_ONLY: 32, ANISOTROPY: 128,
	TRIANGLE_STRIP: 5, TRIANGLES: 4, TRIANGLE_FAN: 6,
	LINE_LOOP: 2, LINE_STRIP: 3, LINES: 1, POINTS: 0
})
$.Formats={
	R: [33321,gl.RED,gl.UNSIGNED_BYTE],
	RG: [33323,gl.RG,gl.UNSIGNED_BYTE],
	RGB: [32849,gl.RGB,gl.UNSIGNED_BYTE],
	RGBA: [32856,gl.RGBA,gl.UNSIGNED_BYTE],
	/*LUM: [gl.LUMINANCE,gl.LUMINANCE,gl.UNSIGNED_BYTE],
	LUMA: [gl.LUMINANCE_ALPHA,gl.LUMINANCE_ALPHA,gl.UNSIGNED_BYTE],
	A: [gl.ALPHA,gl.ALPHA,gl.UNSIGNED_BYTE],*/
	RGB565: [36194,gl.RGB,33635],
	R11F_G11F_B10F: [35898,gl.RGB,gl.UNSIGNED_INT_10F_11F_11F_REV],
	RGB5_A1: [32855,gl.RGBA,32820],
	RGB10_A2: [32857,gl.RGBA,gl.UNSIGNED_INT_2_10_10_10_REV],
	RGBA4: [32854,gl.RGBA,32819],
	RGB9_E5: [35901,gl.RGB,gl.UNSIGNED_INT_5_9_9_9_REV],
	R8: [33330,36244,gl.UNSIGNED_BYTE,1<<31],
	RG8: [33336,33320,gl.UNSIGNED_BYTE,1<<31],
	RGB8: [36221,36248,gl.UNSIGNED_BYTE,1<<31],
	RGBA8: [36220,36249,gl.UNSIGNED_BYTE,1<<31],
	R16: [33332,36244,5123,1<<31],
	RG16: [33338,33320,5123,1<<31],
	RGB16: [36215,36248,5123,1<<31],
	RGBA16: [36214,36249,5123,1<<31],
	R32: [33334,36244,gl.UNSIGNED_INT,1<<31],
	RG32: [33340,33320,gl.UNSIGNED_INT,1<<31],
	RGB32: [36209,36248,gl.UNSIGNED_INT,1<<31],
	RGBA32: [36208,36249,gl.UNSIGNED_INT,1<<31],
	R16F: [33325,gl.RED,gl.HALF_FLOAT],
	RG16F: [33327,gl.RG,gl.HALF_FLOAT],
	RGB16F: [34843,gl.RGB,gl.HALF_FLOAT],
	RGBA16F: [34842,gl.RGBA,gl.HALF_FLOAT],
	R16F_32F: [33325,gl.RED,gl.FLOAT],
	RG16F_32F: [33327,gl.RG,gl.FLOAT],
	RGB16F_32F: [34843,gl.RGB,gl.FLOAT],
	RGBA16F_32F: [34842,gl.RGBA,gl.FLOAT],
	R32F: [33326,gl.RED,gl.FLOAT],
	RG32F: [33328,gl.RG,gl.FLOAT],
	RGB32F: [34837,gl.RGB,gl.FLOAT],
	RGBA32F: [34836,gl.RGBA,gl.FLOAT]
}
$.vec2 = (x=0,y=x) => ({x,y})
$.vec2.one = $.vec2(1); const v2z = $.vec2.zero = $.vec2(0)
$.vec2.add = (a,b) => typeof b=='number'?{x:a.x+b,y:a.y+b}:{x:a.x+b.x,y:a.y+b.y}
$.vec2.subtract = (a,b) => typeof a=='number'?{x:a-b.x,y:a-b.y}:{x:a.x-b.x,y:a.y-b.y}
$.vec2.multiply = (a,b) => typeof b=='number'?{x:a.x*b,y:a.y*b}:{x:a.x*b.x,y:a.y*b.y}
$.vec2.magnitude = a => sqrt(a.x*a.x+a.y*a.y)
$.vec2.normalize = a => { const d = 1/sqrt(a.x*a.x+a.y*a.y); return {x:a.x*d, y: a.y*d} }
$.vec3 = (x=0,y=x,z=x) => ({x,y,z})
$.vec3.one = $.vec3(1); const v3z = $.vec3.zero = $.vec3(0)
$.vec3.add = (a,b) => typeof b=='number'?{x:a.x+b,y:a.y+b,z:a.z+b}:{x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}
$.vec3.subtract = (a,b) => typeof a=='number'?{x:a-b.x,y:a-b.y,z:a-b.z}:{x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}
$.vec3.multiply = (a,b) => typeof b=='number'?{x:a.x*b,y:a.y*b,z:a.z*b}:{x:a.x*b.x,y:a.y*b.y,z:a.z*b.z}
$.vec3.magnitude = a => sqrt(a.x*a.x+a.y*a.y+a.z*a.z)
$.vec3.normalize = a => { const d = 1/sqrt(a.x*a.x+a.y*a.y+a.z*a.z); return {x:a.x*d, y: a.y*d, z: a.z*d} }
$.vec4 = (x=0,y=x,z=x,w=x) => ({x,y,z,w})
$.vec4.one = $.vec4(1); const v4z = $.vec4.zero = $.vec4(0)
$.vec4.add = (a,b) => typeof b=='number'?{x:a.x+b,y:a.y+b,z:a.z+b,w:a.w+b}:{x:a.x+b.x,y:a.y+b.y,z:a.z+b.z,w:a.w+b.w}
$.vec4.subtract = (a,b) => typeof a=='number'?{x:a-b.x,y:a-b.y,z:a-b.z,w:a-b.w}:{x:a.x-b.x,y:a.y-b.y,z:a.z-b.z,w:a.w-b.w}
$.vec4.multiply = (a,b) => typeof b=='number'?{x:a.x*b,y:a.y*b,z:a.z*b,w:a.w*b}:{x:a.x*b.x,y:a.y*b.y,z:a.z*b.z,w:a.w*b.w}
$.vec4.magnitude = a => sqrt(a.x*a.x+a.y*a.y+a.z*a.z+a.w*a.w)
$.vec4.normalize = a => { const d = 1/sqrt(a.x*a.x+a.y*a.y+a.z*a.z+a.w*a.w); return {x:a.x*d, y: a.y*d, z: a.z*d, w: a.w*d} }

const maxAniso = gl.getExtension('EXT_texture_filter_anisotropic')?gl.getParameter(34047):0
class Tex{
	get isInteger(){ return this.t.f.length>3 }
	get format(){ return this.t.f }
	get width(){ return this.t.w }
	get height(){ return this.t.h }
	get layers(){ return this.t.d }
	get mipmaps(){ return this.t.m }
	get subWidth(){ return this.t.w*this.w }
	get subHeight(){ return this.t.h*this.h }
	get identity(){ return this.t }
	get aspectRatio(){ return this.t.w*this.w / (this.t.h*this.h) }
	constructor(t,x=0,y=0,w=1,h=1,l=0){
		this.t = t; this.x = x; this.y = y
		this.w = w; this.h = h; this.l = l
	}
	get loaded(){ return !this.t.src }
	get usable(){ return this.t.src ? (this.t._tex || Tex.load(this.t), false) : true }
	get then(){ return this.t.src ? this.#then : null }
	load(){ if(!this.t._tex) Tex.load(this.t) }
	sub(x=0, y=0, w=1, h=1, l=this.l){
		return new Tex(this.t, this.x+x*this.w, this.y+y*this.h, this.w*w, this.h*h, l)
	}
	super(x=0, y=0, w=1, h=1, l=this.l){
		const tw = this.w/w, th = this.h/h
		return new Tex(this.t, this.x-x*tw, this.y-y*th, tw, th, l)
	}
	crop(x=0, y=0, w=0, h=0, l=this.l){
		const {t,x:ox,y:oy,h:oh} = this
		if(!t.src) return new Tex(t, ox+x/t.w, oy+oh-(y+h)/t.h, w/t.w, h/t.h, l)
		const i = new Tex(t, 0, 0, 0, 0, l)
		if(!t._tex) Tex.load(t)
		t.src.push(i => {
			i.x = ox+x/t.w
			i.y = oy+oh-(y+h)/t.h
			i.w = w/t.w; i.h = h/t.h
		}, undefined, i)
		return i
	}
	layer(l = this.l){ return new Tex(this.t, this.x, this.y, this.w, this.h, l) }
	#then(r, j){
		if(typeof r != 'function') r = Function.prototype
		if(!this.t.src) return void r(this)
		if(!this.t._tex) Tex.load(this.t)
		this.t.src.push(r, j, this)
	}
	static load(t){
		let src = t.src, loaded = 0
		t.src = []
		let w = 0, h = 0
		t._tex = gl.createTexture()
		const reject = () => {
			loaded = -1
			Tex.setOptions(t)
			gl.texStorage3D(gl.TEXTURE_2D_ARRAY, t.m = 1, t.f[0], t.w = w = 1, t.h = h = 1, t.d)
			if(!premultAlpha){
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)
				premultAlpha = true
			}
			if(t.m>1) gl.generateMipmap(gl.TEXTURE_2D_ARRAY)
			if(t.i<0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
			const cbs = t.src; t.src = null
			for(let i = 1; i < cbs.length; i+=3) cbs[i]?.(cbs[i+1])
		}
		for(let i = 0; i < src.length; i++) resolveData(src[i], data => {
			if(!loaded) w = data.width, h = data.height
			else if(w != data.width || h != data.height)
				return reject('Failed to load image: all layers must be the same size')
			src[i] = data
			if(++loaded < src.length) return
			Tex.setOptions(t)
			gl.texStorage3D(gl.TEXTURE_2D_ARRAY, t.m = min(t.m, floor(log2(max(w, h)))+1), t.f[0], t.w = w, t.h = h, t.d)
			if(!premultAlpha){
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)
				premultAlpha = true
			}
			gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)
			for(let l = 0; l < loaded; l++)
				gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, l, w, h, 1, t.f[1], t.f[2], src[l])
			gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, unpackBuffer)
			if(t.m>1) gl.generateMipmap(gl.TEXTURE_2D_ARRAY)
			if(t.i<0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
			const cbs = t.src; t.src = null
			for(let i = 0; i < cbs.length; i += 3) cbs[i](cbs[i+2])
		}, reject)
	}
	paste(tex, x=0, y=0, l=0, dstMip=0, srcX=0, srcY=0, srcL=0, srcW=0, srcH=0, srcD=0, srcMip=0){
		const {t} = this
		if(t.src) return null
		if(tex.msaa){
			i&&draw()
			srcH = srcW || tex.height; srcW = srcL || tex.width
			gl.framebufferRenderbuffer(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, tex._tex)
			if(curfb != drawfb) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = drawfb), curt=lastd=null
			gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, t._tex, dstMip, l)
			if(~pmask&15) gl.colorMask(1, 1, 1, 1), pmask |= 15, lastd = null
			gl.blitFramebuffer(srcX, srcY, srcX+srcW, srcY+srcH, x, y, x+srcW, y+srcH, gl.COLOR_BUFFER_BIT, gl.NEAREST)
			return this
		}
		if(!(tex instanceof Tex)) return resolveData(tex, i => {
			Tex.fakeBind(t)
			if(!premultAlpha){
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)
				premultAlpha = true
			}
			gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)
			gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, dstMip, x, y, l, i.width, i.height, 1, t.f[1], t.f[2], i)
			gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, unpackBuffer)
			if(t.i<0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
			return this
		})
		const {t: t2} = tex
		if(t2.src){
			console.warn('Source texture is not loaded')
			return this
		}
		if(t._tex == t2._tex){
			console.warn('Cannot copy from texture to itself')
			return this
		}
		Tex.fakeBind(t)
		srcW = srcW || t2.w; srcH = srcH || t2.h; srcD = srcD || t2.d
		while(srcD--){
			gl.framebufferTextureLayer(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, t2._tex, srcMip, srcL++)
			gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, dstMip, x, y, l++, srcX, srcY, srcW, srcH)
		}
		if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
		return this
	}
	pasteData(data, x=0, y=0, l=0, w=0, h=0, d=0, mip=0){
		const {t} = this
		if(t.src) return null
		w = w || t.w; h = h || t.h; d = d || t.d
		Tex.fakeBind(t)
		if(premultAlpha){
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0)
			premultAlpha = false
		}
		gl.bufferData(gl.PIXEL_UNPACK_BUFFER, data, gl.STREAM_COPY)
		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, mip, x, y, l, w, h, d, t.f[1], t.f[2], 0)
		fd += data.byteLength*.25
		if(t.i<0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
		return this
	}
	readData(x=0, y=0, l=0, w=0, h=0, d=0, mip=0){
		const {t} = this
		if(t.src) return null
		w = w || t.w; h = h || t.h; d = d || t.d
		i&&draw()
		let a = t.f[0], sz = a==33323||a==33338||a==33340||a==33327||a==33328||a==33336 ? 2
			: a==33321||a==33330||a==33332||a==33334||a==33325||a==33326? 1 : 4, fmt = sz <= 2 ? sz == 1 ? gl.RED : gl.RG : sz == 3 ? gl.RGB : gl.RGBA
		a = t.f[2] == gl.UNSIGNED_BYTE ? 1 : t.f[2] == gl.FLOAT ? 4 : t.f[2] == gl.UNSIGNED_INT || t.f[2] == gl.UNSIGNED_INT_10F_11F_11F_REV || t.f[2] == gl.UNSIGNED_INT_2_10_10_10_REV || t.f[2] == gl.UNSIGNED_INT_5_9_9_9_REV ? 4 : 2
		sz *= w*h
		let pack, size = sz*d*a
		if(lastPboSize == size) pack = lastPbo, lastPboSize = -1, pboUsed = true
		else{
			gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pack = gl.createBuffer())
			gl.bufferData(gl.PIXEL_PACK_BUFFER, size, gl.STREAM_READ)
			if(size > lastPboSize) lastPboSize = size, lastPbo = pack, pboUsed = true
		}
		while(d--){
			gl.framebufferTextureLayer(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, t._tex, mip, l)
			gl.readPixels(x, y, w, h, fmt, t.f[2], sz*a*(l++))
		}
		if(pack != lastPbo) gl.bindBuffer(gl.PIXEL_PACK_BUFFER, lastPbo)
		return new Promise(r0 => {
			const r = () => {
				const arr = a==1 ? new Uint8Array(sz*d)
				: a==4 ? t.f[2] == gl.FLOAT ? new Float32Array(sz*d) : new Uint32Array(sz*d) : new Uint16Array(sz*d)
				if(pack != lastPbo) gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pack)
				gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, arr)
				r0(arr)
				if(pack != lastPbo){
					if(size > lastPboSize) lastPboSize = size, lastPbo = pack
					else gl.bindBuffer(gl.PIXEL_PACK_BUFFER, lastPbo)
				}
				pboUsed = true
			}
			r.sync = gl.fenceSync(37143, 0)
			fencetail ??= r
			fencehead = fencehead ? fencehead.next = r : r
			if(!intv) intv = setInterval(intvCb, 0)
		})
	}
	delete(){
		if(!this.t._tex) return
		gl.deleteTexture(this.t._tex)
		this.t._tex = null
		if(this.t.i >= 0) bound[this.t.i] = null, this.t.i = -1
		this.t.d = this.t.w = this.t.h = 0
	}
	static auto(t,i=0){
		if((t.f[3]>>31) != i) return -2
		if(t.i >= 0){
			const sl = -2147483648 >>> t.i-(maxTex-shfCount&i)
			if(!(sl&(i^shfMask))) return boundUsed |= sl, t.i
			bound[t.i] = null, t.i = -1
		}
		if(!t._tex) Tex.load(t)
		const j = clz32(~(boundUsed|i^shfMask))
		if(j >= maxTex) return -1
		boundUsed |= -2147483648>>>j
		i = i ? maxTex+j-shfCount : j
		const o = bound[i]; if(o) o.i = -1
		gl.activeTexture(gl.TEXTURE0 + i)
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, (bound[i]=t)._tex)
		return t.i = i
	}
	static fakeBind(t){
		if(t.i >= 0){
			i&&draw()
			gl.activeTexture(gl.TEXTURE0+t.i)
		}else{
			const j = maxTex-1+(shfCount==maxTex&&maxTex)
			if(bound[j]) bound[j].t.i = -1
			gl.activeTexture(gl.TEXTURE0+j)
			gl.bindTexture(gl.TEXTURE_2D_ARRAY, t._tex)
		}
	}
	get options(){ return this.t.o }
	static setOptions(t){
		Tex.fakeBind(t)
		const {o} = t
		if(maxAniso) gl.texParameterf(gl.TEXTURE_2D_ARRAY, 34046, o&128?maxAniso:1)
		if(t.f[3]>>31)
			gl.texParameterf(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, 9728),
			gl.texParameterf(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, 9728)
		else
			gl.texParameterf(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, 9728+(o&1)),
			gl.texParameterf(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, t.m>1?9984+(o>>1&3):9728+(o>>1&1))
		gl.texParameterf(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, o&8?10497:o&16?33648:33071)
		gl.texParameterf(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, o&32?10497:o&64?33648:33071)
	}
	set options(o){
		const {t} = this
		t.o = o
		if(t.src) return
		Tex.setOptions(t)
		if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
	}
	setMipmapRange(s=0, e=65535){
		const {t} = this
		if(t.src) return
		Tex.fakeBind(t)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_LOD, s)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAX_LOD, e)
		if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
	}
	genMipmaps(){
		i&&draw()
		const {t} = this
		if(t.m<2) return
		Tex.fakeBind(t)
		gl.generateMipmap(gl.TEXTURE_2D_ARRAY)
		if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
	}
}
$.Drawable = (stencil = false) => new Drw2D({ _fb: gl.createFramebuffer(), _stencil: 0, _stenBuf: stencil ? gl.createRenderbuffer() : null, w: 0, h: 0, u: 0 })
$.Drawable.MAX_TARGETS = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)
$.Drawable.DRAW_32F = !!gl.getExtension('EXT_color_buffer_float')
let arr = new Float32Array(1024), iarr = new Int32Array(arr.buffer), i = 0
$.Texture = (w = 0, h = 0, d = 1, o = 0, f = Formats.RGBA, mips = 0) => {
	mips = min((mips>>>0)||1, floor(log2(max(w, h)))+1)
	w >>>= 0; h >>>= 0
	const t = { _tex: gl.createTexture(), i: -1, o, f, src: null, w, h, d: d = (d>>>0)||1, m: mips }
	const tx = new Tex(t)
	Tex.setOptions(t)
	if(w && h) gl.texStorage3D(gl.TEXTURE_2D_ARRAY, mips, t.f[0], w, h, d)
	else gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, t.f[0], t.w = 1, t.h = 1, d)
	gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
	return tx
}
$.Texture.MAX_WIDTH = $.Texture.MAX_HEIGHT = gl.getParameter(gl.MAX_TEXTURE_SIZE)
$.Texture.MAX_LAYERS = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS)
$.Texture.FILTER_32F = !!gl.getExtension('OES_texture_float_linear')
const maxSamples = $.Texture.MAX_MSAA = gl.getParameter(gl.MAX_SAMPLES)
$.Texture.MSAA = (w=0, h=0, msaa=65536, f=Formats.RGBA)=>{
	msaa = min(msaa, maxSamples)
	const rb = gl.createRenderbuffer()
	gl.bindRenderbuffer(gl.RENDERBUFFER, rb)
	gl.renderbufferStorageMultisample(gl.RENDERBUFFER, msaa, f[0], w, h)
	return {_tex: rb, width: w, height: h, msaa: gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES), delete(){ gl.deleteRenderbuffer(this._tex) }}
}
$.Texture.from = (src, o = 0, fmt = Formats.RGBA, mips = 0) => new Tex({
	_tex: null, i: -1, o, f:fmt, src: src ? Array.isArray(src) ? src : [src] : [],
	w: 0, h: 0, d: src ? Array.isArray(src) ? src.length : 1 : 0, m: mips||1
})

// Linear algebra time!
// Some info:
// All matrices are "column-major"
// All multiplication is right-multiplication
// We only use the minimum matrix and operations for a given use case, hence why there are so many classes and methods
// t2D & t2t3D implement the Transformable2D interface. t3t2D & t3D implement the Transformable3D interface
// The interface represents the "input" vector type. The last component is always 1 and is used to make the transformations support translation
// The output vector type is irrelevant to the interface and only matters for how the content is eventually rendered (specifically, 2 outputs means 2D and 3 outputs means 2D + perspective)



// Highly optimized algorithm to find the minimum boundary of a loop line in 2D space within the bounds of the [0,0,1,1] rect
let larr = []
function _loopBoundary2(){
	if(!larr.length) return null
	let x0 = 1, x1 = 0, y0 = 1, y1 = 0
	let prevx = larr[0], prevy = larr[1], prevInB = abs(prevy-.5)<=.5
	for(let i = larr.length; i;){
		i -= 2
		const x = larr[i], y = larr[i+1]
		if(!prevInB){
			let f = ((prevy>=y)-y)/(prevy-y)
			if(abs(f-.5)<=.5){ f = x+f*(prevx-x); if(f<x0)x0=f; if(f>x1)x1=f }
		}
		prevInB = abs(y-.5)<=.5
		if(prevInB){ if(x<x0)x0=x; if(x>x1)x1=x }
		else{
			let f = ((y>=prevy)-prevy)/(y-prevy)
			if(abs(f-.5)<=.5){ f = prevx+f*(x-prevx); if(f<x0)x0=f; if(f>x1)x1=f }
		}
		prevx = x; prevy = y
	}
	prevInB = abs(prevx-.5)<=.5
	for(let i = larr.length; i;){
		i -= 2
		const x = larr[i], y = larr[i+1]
		if(!prevInB){
			let f = ((prevx>=x)-x)/(prevx-x)
			if(abs(f-.5)<=.5){ f = y+f*(prevy-y); if(f<y0)y0=f; if(f>y1)y1=f }
		}
		prevInB = abs(x-.5)<=.5
		if(prevInB){ if(y<y0)y0=y; if(y>y1)y1=y }
		else{
			let f = ((x>=prevx)-prevx)/(x-prevx)
			if(abs(f-.5)<=.5){ f = prevy+f*(y-prevy); if(f<y0)y0=f; if(f>y1)y1=f }
		}
		prevx = x; prevy = y
	}
	larr.length = 0
	return x1>x0&&y1>y0 ? {x0, y0, x1, y1} : null
}
function _loopBoundary3(){
	if(!larr.length) return null
	let x0 = 1, x1 = 0, y0 = 1, y1 = 0
	let prevx = larr[0], prevy = larr[1], prevz = larr[2]
	prevx*=prevz; prevy*=prevz
	let prevInB = abs(prevy-.5)<=.5
	let n0 = 1, n1 = 0
	for(let i = larr.length; i;){
		i -= 3
		let x = larr[i], y = larr[i+1], z = larr[i+2]
		x*=z; y*=z
		let inB = abs(y-.5)<=.5
		a: if(z*prevz>=0){
			if(!prevInB){
				// reverse cut
				let f = ((prevy>=y)-y)/(prevy-y)
				if(abs(f-.5)<=.5){
					f = x+f*(prevx-x)
					if(z>=0){ if(f<x0)x0=f; if(f>x1)x1=f }
					else{ if(f<n0)n0=f; if(f>n1)n1=f }
				}
			}
			let f
			if(inB) f = x
			else{
				f = ((y>=prevy)-prevy)/(y-prevy)
				if(abs(f-.5)<=.5) f = prevx+f*(x-prevx)
				else break a
			}
			if(z>=0){ if(f<x0)x0=f; if(f>x1)x1=f }
			else{ if(f<n0)n0=f; if(f>n1)n1=f }
		}else{
			if(!inB){
				// reverse cut
				let f = ((prevy>=y)-prevy)/(prevy-y)
				if(f>=0){
					f = prevx+f*(prevx-x)
					if(prevz>=0){ if(f<x0)x0=f; if(f>x1)x1=f }
					else{ if(f<n0)n0=f; if(f>n1)n1=f }
				}
			}
			if(inB){
				if(z>=0){ if(x<x0)x0=x; if(x>x1)x1=x }
				else{ if(x<n0)n0=x; if(x>n1)n1=x }
			}
			if(!prevInB){
				let f = ((y>=prevy)-y)/(y-prevy)
				if(f>=0){
					f = x+f*(x-prevx)
					if(z>=0){ if(f<x0)x0=f; if(f>x1)x1=f }
					else{ if(f<n0)n0=f; if(f>n1)n1=f }
				}
			}
		}
		prevx = x; prevy = y; prevz = z; prevInB = inB
	}
	a: if(n1>=n0){
		if(n1<x0){ x1=1; break a }
		if(n0>x1){ x0=0; break a }
		x1 = 1; x0 = 0
	}
	n0 = 1, n1 = 0
	prevInB = prevz>0&&abs(prevx-.5)<=.5
	for(let i = larr.length; i;){
		i -= 3
		let x = larr[i], y = larr[i+1], z = larr[i+2]
		x*=z; y*=z
		let inB = abs(x-.5)<=.5
		a: if(z*prevz>=0){
			if(!prevInB){
				// reverse cut
				let f = ((prevx>=x)-x)/(prevx-x)
				if(abs(f-.5)<=.5){
					f = y+f*(prevy-y)
					if(z>=0){ if(f<y0)y0=f; if(f>y1)y1=f }
					else{ if(f<n0)n0=f; if(f>n1)n1=f }
				}
			}
			let f
			if(inB) f = y
			else{
				f = ((x>=prevx)-prevx)/(x-prevx)
				if(abs(f-.5)<=.5) f = prevy+f*(y-prevy)
				else break a
			}
			if(z>=0){ if(f<y0)y0=f; if(f>y1)y1=f }
			else{ if(f<n0)n0=f; if(f>n1)n1=f }
		}else{
			if(!inB){
				// reverse cut
				let f = ((prevx>=x)-prevx)/(prevx-x)
				if(f>=0){
					f = prevy+f*(prevy-y)
					if(prevz>=0){ if(f<y0)y0=f; if(f>y1)y1=f }
					else{ if(f<n0)n0=f; if(f>n1)n1=f }
				}
			}
			if(inB){
				if(z>=0){ if(y<y0)y0=y; if(y>y1)y1=y }
				else{ if(y<n0)n0=y; if(y>n1)n1=y }
			}
			if(!prevInB){
				let f = ((x>=prevx)-x)/(x-prevx)
				if(f>=0){
					f = y+f*(y-prevy)
					if(z>=0){ if(f<y0)y0=f; if(f>y1)y1=f }
					else{ if(f<n0)n0=f; if(f>n1)n1=f }
				}
			}
			
		}
		prevx = x; prevy = y; prevz = z; prevInB = inB
	}
	a: if(n1>=n0){
		if(n1<y0){ y1=1; break a }
		if(n0>y1){ y0=0; break a }
		y1 = 1; y0 = 0
	}
	larr.length = 0
	return x1>x0&&y1>y0 ? {x0: x0<0?0:x0, y0: y0<0?0:y0, x1: x1>1?1:x1, y1: y1>1?1:y1} : null
}

// 3x2 matrix, maps R² -> R²
// x y 1
// v v v
// a c e > x
// b d f > y
class t2D{
	constructor(a=1,b=0,c=0,d=1,e=0,f=0){ this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f }
	sub(){ return new t2D(this.a,this.b,this.c,this.d,this.e,this.f) }
	subPersp(){ return new t2t3D(this.a,this.b,this.c,this.d,this.e,this.f,0,0,1) }
	sub3d(){ return new t3t2D(this.a,this.b,this.c,this.d,0,0,this.e,this.f) }
	sub3dPersp(z0=0,zsc=1){ return new t3D(this.a,this.b,0,this.c,this.d,0,this.e*zsc,this.f*zsc,zsc,this.e*z0,this.f*z0,z0) }
	reset(a=1,b=0,c=0,d=1,e=0,f=0){ if(typeof a=='object')({a,b,c,d,e,f}=a);this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f }
	project(x=0, y=0){ if(typeof x=='object')({x,y}=x); return {x:this.a*x+this.c*y+this.e,y:this.b*x+this.d*y+this.f} }
	unproject(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		const {a,b,c,d} = this, i_det = 1/(a*d-b*c)
		x -= this.e; y -= this.f
		return {
			x: (x*d - y*c)*i_det,
			y: (y*a - x*b)*i_det
		}
	}
	translate(x=0,y=0){ this.e+=x*this.a+y*this.c;this.f+=x*this.b+y*this.d }
	scale(x=1,y=x){ this.a*=x; this.b*=x; this.c*=y; this.d*=y }
	rotate(r=0){
		const cs = cos(r), sn = sin(r), {a,b,c,d} = this
		this.a=a*cs-c*sn; this.b=b*cs-d*sn
		this.c=a*sn+c*cs; this.d=b*sn+d*cs
	}
	transform(a,b,c,d,e=0,f=0){
		if(typeof a=='object')({a,b,c,d,e,f}=a)
		const A=this.a,B=this.b,C=this.c,D=this.d
		this.a = A*a+C*b; this.b = B*a+D*b
		this.c = A*c+C*d; this.d = B*c+D*d
		this.e += A*e+C*f; this.f += B*e+D*f
	}
	skew(x=0, y=0){
		const {a,b,c,d} = this
		this.a=a+c*y; this.b=b+d*y
		this.c=c+a*x; this.d=d+b*x
	}
	multiply(x=1, y=0){
		const {a,b,c,d} = this
		this.a=a*x-c*y;this.b=b*x-d*y
		this.c=c*x+a*y;this.d=d*x+b*y
	}
	box(x=0,y=0,w=1,h=w){ this.e+=x*this.a+y*this.c; this.f+=x*this.b+y*this.d; this.a*=w; this.b*=w; this.c*=h; this.d*=h }
	point(x=0, y=0){ if(typeof x=='object')({x,y}=x); return {x:this.a*x+this.c*y+this.e,y:this.b*x+this.d*y+this.f}}
	metric(x=0, y=0){ if(typeof x=='object')({x,y}=x); return {x:this.a*x+this.c*y,y:this.b*x+this.d*y}}
	pointFrom(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		const {a,b,c,d} = this, i_det = 1/(a*d-b*c)
		x -= this.e; y -= this.f
		return { x: (x*d - y*c)*i_det, y: (y*a - x*b)*i_det }
	}
	metricFrom(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		const {a,b,c,d} = this, i_det = 1/(a*d-b*c)
		return { x: (x*d - y*c)*i_det, y: (y*a - x*b)*i_det }
	}
	loopBoundary(loop = null){
		const {a,b,c,d,e,f} = this
		if(!loop){
			const ea = e+a, fb = f+b
			larr.push(e, f, ea, fb, ea+c, fb+d, e+c, f+d)
		}else for(const {x,y} of loop) larr.push(a*x+c*y+e, b*x+d*y+f)
		return _loopBoundary2()
	}
}

// 3x3 matrix, maps R² -> R³
// x y 1
// v v v
// a d g > x
// b e h > y
// c f i > z
class t2t3D{
	constructor(a=1,b=0,c=0,d=0,e=1,f=0,g=0,h=0,i=0){ this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this.g=g;this.h=h;this.i=i }
	sub(){ return new t2t3D(this.a,this.b,this.c,this.d,this.e,this.f,this.g,this.h,this.i) }
	subPersp(){ return this.sub() }
	sub3d(){ return new t3D(this.a,this.b,this.c,this.d,this.e,this.f,0,0,0,this.g,this.h,this.i) }
	sub3dPersp(z0=0,zsc=1){ return new t3D(this.a,this.b,this.c,this.d,this.e,this.f,this.g*zsc,this.h*zsc,this.i*zsc,this.g*z0,this.h*z0,this.i*z0) }
	reset(a=1,b=0,c=0,d=0,e=1,f=0,g=0,h=0,i=1){ if(typeof a=='object')({a,b,c,d,e,f,g,h,i}=a);this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this.g=g;this.h=h;this.i=i }
	project(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		let p = this.c*x+this.f*y+this.i
		if(p<=0) return {x:NaN,y:NaN}
		p = 1/p
		return {x:(this.a*x+this.d*y+this.g)*p,y:(this.b*x+this.e*y+this.h)*p}
	}
	unproject(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		const {a,b,c,d,e,f,g,h,i} = this
	// Definitely not plagiarized from ChatGPT
		const m = e*i-f*h, n = c*h-b*i, o = b*f-c*e
		const det = 1/(a*m + d*n + g*o)
		const x0 = (m*x + (f*g-d*i)*y + (d*h-e*g)) * det
		const y0 = (n*x + (a*i-c*g)*y + (b*g-a*h)) * det
		let z0 = (o*x + (c*d-a*f)*y + (a*e-b*d)) * det
		if(z0 <= 0) return {x:NaN,y:NaN}
		z0 = 1/z0
		return {x:x0*z0, y: y0*z0}
	}
	translate(x=0,y=0){ this.g+=x*this.a+y*this.d;this.h+=x*this.b+y*this.e;this.i+=x*this.c+y*this.f }
	scale(x=1,y=x){ this.a*=x; this.b*=x; this.c*=x; this.d*=y; this.e*=y; this.f*=y }
	rotate(r=0){
		const cs = cos(r), sn = sin(r), {a,b,c,d,e,f} = this
		this.a=a*cs-d*sn; this.b=b*cs-e*sn; this.c=c*cs-f*sn
		this.d=a*sn+d*cs; this.e=b*sn+e*cs; this.f=c*sn+f*cs
	}
	transform(a,b,c,d,e=0,f=0){
		if(typeof a=='object')({a,b,c,d,e,f}=a)
		const A=this.a,B=this.b,C=this.c,D=this.d,E=this.e,F=this.f
		this.a = A*a+D*b; this.b = B*a+E*b; this.c = C*a+F*b
		this.d = A*c+D*d; this.e = B*c+E*d; this.f = C*c+F*d
		this.g += A*e+D*f; this.h += B*e+E*f; this.i += C*e+F*f
	}
	skew(x=0, y=0){
		const {a,b,c,d,e,f} = this
		this.a=a+d*y; this.b=b+e*y; this.c=c+f*y
		this.d=d+a*x; this.e=e+b*x; this.f=f+c*x
	}
	multiply(x=1, y=0){
		const {a,b,c,d,e,f} = this
		this.a=a*x-d*y;this.b=b*x-e*y;this.c=c*x-f*y
		this.d=a*y+d*x;this.d=b*y+e*x;this.f=c*y+f*x
	}
	box(x=0,y=0,w=1,h=w){
		this.g+=x*this.a+y*this.d
		this.h+=x*this.b+y*this.e
		this.i+=x*this.c+y*this.f
		this.a*=w; this.b*=w; this.c*=w
		this.d*=h; this.e*=h; this.f*=h
	}
	point(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		return {x: this.a*x+this.d*y+this.g, y: this.b*x+this.e*y+this.h, z: this.c*x+this.f*y+this.i}
	}
	metric(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		return {x: this.a*x+this.d*y, y: this.b*x+this.e*y, z: this.c*x+this.f*y}
	}
	loopBoundary(loop = null){
		const {a,b,c,d,e,f,g,h,i} = this
		if(!loop){
			const ga = g+a, hb = h+b, ic = i+c
			larr.push(g, h, 1/i, ga, hb, 1/ic, ga+d, hb+e, 1/(ic+f), g+d, h+e, 1/(i+f))
		}else for(const {x,y} of loop) larr.push(a*x+d*y+g, b*x+e*y+h, 1/(c*x+f*y+i))
		return _loopBoundary3()
	}
}

// 4x2 matrix, maps R³ -> R²
// x y z 1
// v v v v
// a c e g > x
// b d f h > y
class t3t2D{
	constructor(a=1,b=0,c=0,d=1,e=0,f=0,g=0,h=0){ this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this.g=g;this.h=h }
	sub(){ return new t3t2D(this.a,this.b,this.c,this.d,this.e,this.f,this.g,this.h) }
	subPersp(z0=0,zsc=1){ return new t3D(this.a,this.b,0,this.c,this.d,0,this.g*zsc+this.e,this.h*zsc+this.f,zsc,this.g*z0,this.h*z0,z0) }
	sub2dXY(){ return new t2D(this.a,this.b,this.c,this.d,this.g,this.h) }
	sub2dZY(){ return new t2D(this.e,this.f,this.c,this.d,this.g,this.h) }
	sub2dXZ(){ return new t2D(this.a,this.b,this.e,this.f,this.g,this.h) }
	resetTo(m){ this.a=m.a;this.b=m.b;this.c=m.c;this.d=m.d;this.e=m.e;this.f=m.f;this.g=m.g;this.h=m.h }
	reset(a=1,b=0,c=0,d=1,e=0,f=0,g=0,h=0){ if(typeof a=='object')({a,b,c,d,e,f,g,h}=a);this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this.g=g;this.h=h }
	project(x=0, y=0, z=0){
		if(typeof x=='object')({x,y,z=0}=x)
		let p = this.c*x+this.f*y+this.i*z+this.l
		if(p <= 0) return {x:NaN,y:NaN}
		p = 1/p
		return { x: (this.a*x+this.d*y+this.g*z+this.j)*p, y: (this.b*x+this.e*y+this.h*z+this.k)*p }
	}
	unproject(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		const {a,b,c,d,e,f,g,h,i} = this
		x -= this.j; y -= this.k
		const z = 1-this.l
		const m = e*i-f*h, n = c*h-b*i, o = b*f-c*e, i_det = 1./(a*m + d*n + g*o)
		return {
			x: (m * x + (g*f - i*d) * y + (d*h - e*g) * z) * i_det,
			y: (n * x + (a*i - c*g) * y + (g*b - h*a) * z) * i_det,
			z: (o * x + (d*c - f*a) * y + (a*e - b*d) * z) * i_det,
		}
	}
	perspectiveOrigin(){ return { x: NaN, y: NaN, z: NaN } }
	perspectiveRay(_x=0, _y=0, _o=null){ return { x: NaN, y: NaN, z: NaN } }
	translate(x=0,y=0,z=0){
		this.g+=x*this.a+y*this.c+z*this.e
		this.h+=x*this.b+y*this.d+z*this.f
	}
	scale(x=1,y=x,z=x){
		this.a*=x; this.b*=x
		this.c*=y; this.d*=y
		this.e*=z; this.f*=z
	}
	rotateXZ(by){
		let sy = sin(by), cy = cos(by)
		const {a,b,e,f} = this
		this.a = cy*a-sy*e; this.e = cy*e+sy*a
		this.b = cy*b-sy*f; this.f = cy*f+sy*b
	}
	rotateXY(by){
		let sy = sin(by), cy = cos(by)
		const {a,b,c,d} = this
		this.a = cy*a-sy*c; this.c = cy*c+sy*a
		this.b = cy*b-sy*d; this.d = cy*d+sy*b
	}
	rotateZY(by){
		let sy = sin(by), cy = cos(by)
		const {c,d,e,f} = this
		this.e = cy*e-sy*c; this.c = cy*c+sy*e
		this.f = cy*f-sy*d; this.d = cy*d+sy*f
	}
	multiplyXZ(x=1,y=0){
		const {a,b,e,f} = this
		this.a = x*a-y*e; this.e = x*e+y*a
		this.b = x*b-y*f; this.f = x*f+y*b
	}
	multiplyXY(x=1,y=0){
		const {a,b,c,d} = this
		this.a = x*a-y*c; this.c = x*c+y*a
		this.b = x*b-y*d; this.d = x*d+y*b
	}
	multiplyZY(x=1,y=0){
		const {c,d,e,f} = this
		this.e = x*e-y*c; this.c = x*c+y*e
		this.f = x*f-y*d; this.d = x*d+y*f
	}
	skewX(xz=0,xy=0){ this.a += xy*this.c+xz*this.e; this.b += xy*this.d+xz*this.f }
	skewY(yx=0,yz=0){ this.c += yx*this.a+yz*this.e; this.d += yx*this.b+yz*this.f }
	skewZ(zx=0,zy=0){ this.e += zx*this.a+zy*this.c; this.f += zx*this.b+zy*this.d }
	skew(xz=0,xy=0,yx=0,yz=0,zx=0,zy=0){
		const {a,b,c,d,e,f} = this
		this.a = a+xy*c+xz*e; this.b = b+xy*d+xz*f
		this.c = c+yx*a+yz*e; this.d = d+yx*b+yz*f
		this.e = e+zx*a+zy*c; this.f = f+zx*b+zy*d
	}
	transform(a,b,c,d,e,f,g,h,i,j=0,k=0,l=0){
		if(typeof a=='object')({a,b,c,d,e,f,g,h,i,j,k,l}=a)
		const A=this.a,B=this.b,C=this.c,D=this.d,E=this.e,F=this.f
		this.a = A*a+C*b+E*c; this.b = B*a+D*b+F*c
		this.c = A*d+C*e+E*f; this.d = B*d+D*e+F*f
		this.e = A*g+C*h+E*i; this.f = B*g+D*h+F*i
		this.g += A*j+C*k+E*l; this.h += B*j+D*k+F*l
	}
	box(x=0,y=0,z=0,w=1,h=w,d=w){
		this.g+=x*this.a+y*this.c+z*this.e
		this.h+=x*this.b+y*this.d+z*this.f
		this.a*=w; this.b*=w
		this.c*=h; this.d*=h
		this.e*=d; this.f*=d
	}
	point(x=0, y=0, z=0){
		if(typeof x=='object')({x,y,z}=x)
		return {
			x: this.a*x+this.c*y+this.e*z+this.g,
			y: this.b*x+this.d*y+this.f*z+this.h,
		}
	}
	metric(x=0, y=0, z=0){
		if(typeof x=='object')({x,y,z}=x)
		return {
			x: this.a*x+this.c*y+this.e*z,
			y: this.b*x+this.d*y+this.f*z,
		}
	}
	loopBoundary(loop = null){
		const {a,b,c,d,e,f,g,h} = this
		for(const {x,y,z} of loop) larr.push(a*x+c*y+e*z+g, b*x+d*y+f*z+h)
		return _loopBoundary2()
	}
}

// 4x3 matrix, maps R³ -> R³
// x y z 1
// v v v v
// a d g j > x
// b e h k > y
// c f i l > z
class t3D{
	constructor(a=1,b=0,c=0,d=0,e=1,f=0,g=0,h=0,i=1,j=0,k=0,l=0){ this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this.g=g;this.h=h;this.i=i;this.j=j;this.k=k;this.l=l }
	sub(){ return new t3D(this.a,this.b,this.c,this.d,this.e,this.f,this.g,this.h,this.i,this.j,this.k,this.l) }
	subPersp(z0=0,zsc=1){ return new t3D(this.a,this.b,this.c,this.d,this.e,this.f,this.j*zsc+this.g,this.k*zsc+this.h,this.l*zsc+this.i,this.j*z0,this.k*z0,this.l*z0)}
	sub2dXY(){ return new t2t3D(this.a,this.b,this.c,this.d,this.e,this.f,this.j,this.k,this.l) }
	sub2dZY(){ return new t2t3D(this.g,this.h,this.i,this.d,this.e,this.f,this.j,this.k,this.l) }
	sub2dXZ(){ return new t2t3D(this.a,this.b,this.c,this.g,this.h,this.i,this.j,this.k,this.l) }
	resetTo(m){ this.a=m.a;this.b=m.b;this.c=m.c;this.d=m.d;this.e=m.e;this.f=m.f;this.g=m.g;this.h=m.h;this.i=m.i;this.j=m.j;this.k=m.k;this.l=m.l }
	reset(a=1,b=0,c=0,d=0,e=1,f=0,g=0,h=0,i=1,j=0,k=0,l=0){ if(typeof a=='object')({a,b,c,d,e,f,g,h,i,j,k,l}=a);this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this.g=g;this.h=h;this.i=i;this.j=j;this.k=k;this.l=l }
	project(x=0, y=0, z=0){
		if(typeof x=='object')({x,y,z=0}=x)
		let p = this.c*x+this.f*y+this.i*z+this.l
		if(p <= 0) return {x:NaN,y:NaN}
		p = 1/p
		return { x: (this.a*x+this.d*y+this.g*z+this.j)*p, y: (this.b*x+this.e*y+this.h*z+this.k)*p }
	}
	unproject(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		const {a,b,c,d,e,f,g,h,i} = this
		x -= this.j; y -= this.k
		const z = 1-this.l
		const m = e*i-f*h, n = c*h-b*i, o = b*f-c*e, i_det = 1./(a*m + d*n + g*o)
		return {
			x: (m * x + (g*f - i*d) * y + (d*h - e*g) * z) * i_det,
			y: (n * x + (a*i - c*g) * y + (g*b - h*a) * z) * i_det,
			z: (o * x + (d*c - f*a) * y + (a*e - b*d) * z) * i_det,
		}
	}
	perspectiveOrigin(){
		const {a,b,c,d,e,f,g,h,i,j,k,l} = this
		const m = e*i-f*h, n = c*h-b*i, o = b*f-c*e, i_det = -1./(a*m + d*n + g*o);
		return {
			x: (m*j + (g*f - i*d)*k + (d*h - e*g)*l) * i_det,
			y: (n*j + (a*i - c*g)*k + (g*b - h*a)*l) * i_det,
			z: (o*j + (d*c - f*a)*k + (a*e - b*d)*l) * i_det,
		}
	}
	perspectiveRay(x=0, y=0, origin = null){
		if(typeof x=='object')({x,y}=x)
		const {a,b,c,d,e,f,g,h,i,j,k,l} = this
		const m = e*i-f*h, n = c*h-b*i, o = b*f-c*e, i_det = 1./(a*m + d*n + g*o)
		const p = g*f - i*d, q = a*i - c*g, r = d*c - f*a
		const s = d*h - e*g, t = g*b - h*a, u = a*e - b*d
		if(origin){
			origin.x = -(m*j + p*k + s*l) * i_det
			origin.y = -(n*j + q*k + t*l) * i_det
			origin.z = -(o*j + r*k + u*l) * i_det
		}
		const z = 1-this.l
		const dx = (m*x + p*y + s*z) * i_det
		const dy = (m*x + p*y + s*z) * i_det
		const dz = (m*x + p*y + s*z) * i_det
		const i_dst = 1/sqrt(dx*dx+dy*dy+dz*dz)
		return {x: dx*i_dst, y: dy*i_dst, z: dz*i_dst}
	}
	translate(x=0,y=0,z=0){
		this.j+=x*this.a+y*this.d+z*this.g
		this.k+=x*this.b+y*this.e+z*this.h
		this.l+=x*this.c+y*this.f+z*this.i
	}
	scale(x=1,y=x,z=x){
		this.a*=x; this.b*=x; this.c*=x
		this.d*=y; this.e*=y; this.f*=y
		this.g*=z; this.h*=z; this.i*=z
	}
	rotateXZ(by){
		let sy = sin(by), cy = cos(by)
		const {a,b,c,g,h,i} = this
		this.a = cy*a-sy*g; this.g = cy*g+sy*a
		this.b = cy*b-sy*h; this.h = cy*h+sy*b
		this.c = cy*c-sy*i; this.i = cy*i+sy*c
	}
	rotateXY(by){
		let sy = sin(by), cy = cos(by)
		const {a,b,c,d,e,f} = this
		this.a = cy*a-sy*d; this.d = cy*d+sy*a
		this.b = cy*b-sy*e; this.e = cy*e+sy*b
		this.c = cy*c-sy*f; this.f = cy*f+sy*c
	}
	rotateZY(by){
		let sy = sin(by), cy = cos(by)
		const {d,e,f,g,h,i} = this
		this.g = cy*g-sy*d; this.d = cy*d+sy*g
		this.h = cy*h-sy*e; this.e = cy*e+sy*h
		this.i = cy*i-sy*f; this.f = cy*f+sy*i
	}
	multiplyXZ(x=1, y=0){
		const {a,b,c,g,h,i} = this
		this.a = x*a-y*g; this.g = x*g+y*a
		this.b = x*b-y*h; this.h = x*h+y*b
		this.c = x*c-y*i; this.i = x*i+y*c
	}
	multiplyXY(x=1, y=0){
		const {a,b,c,d,e,f} = this
		this.a = x*a-y*d; this.d = x*d+y*a
		this.b = x*b-y*e; this.e = x*e+y*b
		this.c = x*c-y*f; this.f = x*f+y*c
	}
	multiplyZY(x=1, y=0){
		const {d,e,f,g,h,i} = this
		this.g = x*g-y*d; this.d = x*d+y*g
		this.h = x*h-y*e; this.e = x*e+y*h
		this.i = x*i-y*f; this.f = x*f+y*i
	}
	skewX(xz=0,xy=0){ this.a += xy*this.d+xz*this.g; this.b += xy*this.e+xz*this.h; this.c += xy*this.f+xz*this.i }
	skewY(yx=0,yz=0){ this.d += yx*this.a+yz*this.g; this.e += yx*this.b+yz*this.h; this.f += yx*this.c+yz*this.i }
	skewZ(zx=0,zy=0){ this.g += zx*this.a+zy*this.d; this.h += zx*this.b+zy*this.e; this.i += zx*this.c+zy*this.f }
	skew(xz=0,xy=0,yx=0,yz=0,zx=0,zy=0){
		const {a,b,c,d,e,f,g,h,i} = this
		this.a = a+xy*d+xz*g; this.b = b+xy*e+xz*h; this.c = c+xy*f+xz*i
		this.d = d+yx*a+yz*g; this.e = e+yx*b+yz*h; this.f = f+yx*c+yz*i
		this.g = g+zx*a+zy*d; this.h = h+zx*b+zy*e; this.i = i+zx*c+zy*f
	}
	transform(a,b,c,d,e,f,g,h,i,j=0,k=0,l=0){
		if(typeof a=='object')({a,b,c,d,e,f,g,h,i,j,k,l}=a)
		const A=this.a,B=this.b,C=this.c,D=this.d,E=this.e,F=this.f,G=this.g,H=this.h,I=this.i
		this.a = A*a+D*b+G*c; this.b = B*a+E*b+H*c; this.c = C*a+F*b+I*c
		this.d = A*d+D*e+G*f; this.e = B*d+E*e+H*f; this.f = C*d+F*e+I*f
		this.g = A*g+D*h+G*i; this.h = B*g+E*h+H*i; this.i = C*g+F*h+I*i
		this.j += A*j+D*k+G*l; this.k += B*j+E*k+H*l; this.l += C*j+F*k+I*l
	}
	box(x=0,y=0,z=0,w=1,h=w,d=w){
		this.j+=x*this.a+y*this.d+z*this.g
		this.k+=x*this.b+y*this.e+z*this.h
		this.l+=x*this.c+y*this.f+z*this.i
		this.a*=w; this.b*=w; this.c*=w
		this.d*=h; this.e*=h; this.f*=h
		this.g*=d; this.h*=d; this.i*=d
	}
	point(x=0, y=0, z=0){
		if(typeof x=='object')({x,y,z}=x)
		return {
			x: this.a*x+this.d*y+this.g*z+this.j,
			y: this.b*x+this.e*y+this.h*z+this.k,
			z: this.c*x+this.f*y+this.i*z+this.l
		}
	}
	metric(x=0, y=0, z=0){
		if(typeof x=='object')({x,y,z}=x)
		return {
			x: this.a*x+this.d*y+this.g*z,
			y: this.b*x+this.e*y+this.h*z,
			z: this.c*x+this.f*y+this.i*z
		}
	}
	pointFrom(x=0, y=0, z=0){
		if(typeof x=='object')({x,y,z}=x)
		const {a,b,c,d,e,f,g,h,i} = this
		x -= this.j; y -= this.k; z -= this.l
		const m = e*i-f*h, n = c*h-b*i, o = b*f-c*e
		const det = 1/(a*m + d*n + g*o)
		return {
			x: (m*x + (f*g-d*i)*y + (d*h-e*g)*z) * det,
			y: (n*x + (a*i-c*g)*y + (b*g-a*h)*z) * det,
			z: (o*x + (c*d-a*f)*y + (a*e-b*d)*z) * det
		}
	}
	metricFrom(x=0, y=0, z=0){
		if(typeof x=='object')({x,y,z}=x)
		const {a,b,c,d,e,f,g,h,i} = this
		const m = e*i-f*h, n = c*h-b*i, o = b*f-c*e
		const det = 1/(a*m + d*n + g*o)
		return {
			x: (m*x + (f*g-d*i)*y + (d*h-e*g)*z) * det,
			y: (n*x + (a*i-c*g)*y + (b*g-a*h)*z) * det,
			z: (o*x + (c*d-a*f)*y + (a*e-b*d)*z) * det
		}
	}
	loopBoundary(loop = null){
		const {a,b,c,d,e,f,g,h,i,j,k,l} = this
		for(const {x,y,z} of loop) larr.push(a*x+d*y+g*z+j, b*x+e*y+h*z+k, 1/(c*x+f*y+i*z+l))
		return _loopBoundary3()
	}
}
$.Transform2D = t2D, $.Transform2D.Perspective = t2t3D
$.Transform3D = t3t2D, $.Transform3D.Perspective = t3D
const grow = ArrayBuffer.prototype.transfer ?
	by=>{const j=i;if((i=j+by)>iarr.length){iarr=new Int32Array(iarr.buffer.transfer(i*8)),arr=new Float32Array(iarr.buffer)}return j}
	: by=>{const j=i;if((i=j+by)>iarr.length){const oa=iarr;(iarr=new Int32Array(i*2)).set(oa,0);arr=new Float32Array(iarr.buffer)}return j}
class Drw2D extends t2D{
	set shader(sh){ this._sh=typeof sh=='function'&&sh.three===false?sh:$.Shader.DEFAULT; if(lastd == this) lastd = null }
	get shader(){ return this._sh }
	get geometry(){ return this._shp }
	set geometry(a){ this._shp = a||geo2; if(lastd == this) lastd = null }
	constructor(t,m=290787599,sp=geo2,s=$.Shader.DEFAULT,a=1,b=0,c=0,d=1,e=0,f=0){ super(a,b,c,d,e,f); this.t = t; this._mask = m; this._shp = sp; this._sh = s }
	getTransform(){ return new t2D(this.a,this.b,this.c,this.d,this.e,this.f) }
	sub(){ return new Drw2D(this.t,this._mask,this._shp,this._sh,this.a,this.b,this.c,this.d,this.e,this.f) }
	subPersp(){ return new Drw2t3D(this.t,this._mask,this._shp,this._sh,this.a,this.b,this.c,this.d,this.e,this.f,0,0,1) }
	sub3d(){ return new Drw3t2D(this.t,this._mask,$.Geometry3D.CUBE,$.Shader.COLOR_3D_XZ,this.a,this.b,this.c,this.d,0,0,this.e,this.f) }
	sub3dPersp(z0=0,zsc=1){ return new Drw3D(this.t,this._mask,$.Geometry3D.CUBE,$.Shader.COLOR_3D_XZ,this.a,this.b,0,this.c,this.d,0,this.e*zsc,this.f*zsc,zsc,this.e*z0,this.f*z0,z0) }
	resetTo(m){ this.a=m.a;this.b=m.b;this.c=m.c;this.d=m.d;this.e=m.e;this.f=m.f;this._mask=m._mask;this._sh=m._sh;this._shp=m._shp }
	reset(a=1,b=0,c=0,d=1,e=0,f=0){ if(typeof a=='object')({a,b,c,d,e,f}=a);this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this._mask=290787599;this._sh=$.Shader.DEFAULT;this._shp=geo2 }
	pixelRatio(){ return sqrt(abs(this.a*this.d-this.b*this.c)*this.t.w*this.t.h) }
	draw(...values){
		const i = this._sh(6,values)
		arr[i  ] = this.e; arr[i+1] = this.a; arr[i+2] = this.c
		arr[i+3] = this.f; arr[i+4] = this.b; arr[i+5] = this.d
	}
	drawRect(x=0, y=0, w=1, h=1, ...values){
		const i = this._sh(6,values)
		arr[i  ] = this.e+x*this.a+y*this.c; arr[i+1] = this.a*w; arr[i+2] = this.c*h
		arr[i+3] = this.f+x*this.b+y*this.d; arr[i+4] = this.b*w; arr[i+5] = this.d*h
	}
	drawMat(a=1, b=0, c=0, d=1, e=0, f=0, ...values){
		const i = this._sh(6,values)
		const ta=this.a,tb=this.b,tc=this.c,td=this.d,te=this.e,tf=this.f
		arr[i  ] = ta*e+tc*f+te; arr[i+1] = ta*a+tc*b; arr[i+2] = ta*c+tc*d
		arr[i+3] = tb*e+td*f+tf; arr[i+4] = tb*a+td*b; arr[i+5] = tb*c+td*d
	}
	drawv(values){
		const i = this._sh(6,values)
		arr[i  ] = this.e; arr[i+1] = this.a; arr[i+2] = this.c
		arr[i+3] = this.f; arr[i+4] = this.b; arr[i+5] = this.d
	}
	drawRectv(x=0, y=0, w=1, h=1, values){
		const i = this._sh(6,values)
		arr[i  ] = this.e+x*this.a+y*this.c; arr[i+1] = this.a*w; arr[i+2] = this.c*h
		arr[i+3] = this.f+x*this.b+y*this.d; arr[i+4] = this.b*w; arr[i+5] = this.d*h
	}
	drawMatv(a=1, b=0, c=0, d=1, e=0, f=0, values){
		const i = this._sh(6,values)
		const ta=this.a,tb=this.b,tc=this.c,td=this.d,te=this.e,tf=this.f
		arr[i  ] = ta*e+tc*f+te; arr[i+1] = ta*a+tc*b; arr[i+2] = ta*c+tc*d
		arr[i+3] = tb*e+td*f+tf; arr[i+4] = tb*a+td*b; arr[i+5] = tb*c+td*d
	}
}
class Drw2t3D extends t2t3D{
	set shader(sh){ this._sh=typeof sh=='function'&&sh.three===false?sh:$.Shader.DEFAULT; if(lastd == this) lastd = null }
	get shader(){ return this._sh }
	get geometry(){ return this._shp }
	set geometry(a){ this._shp = a||geo2; if(lastd == this) lastd = null }
	constructor(t,m=290787599,sp=geo2,s=$.Shader.DEFAULT,a=1,b=0,c=0,d=0,e=1,f=0,g=0,h=0,i=0){ super(a,b,c,d,e,f,g,h,i); this.t = t; this._mask = m; this._shp = sp; this._sh = s }
	getTransform(){ return new t2t3D(this.a,this.b,this.c,this.d,this.e,this.f,this.g,this.h,this.i) }
	sub(){ return new Drw2t3D(this.t,this._mask,this._shp,this._sh,this.a,this.b,this.c,this.d,this.e,this.f,this.g,this.h,this.i) }
	subPersp(){ return this.sub() }
	sub3d(){ return new Drw3D(this.t,this._mask,$.Geometry3D.CUBE,$.Shader.COLOR_3D_XZ,this.a,this.b,this.c,this.d,this.e,this.f,0,0,0,this.g,this.h,this.i) }
	sub3dPersp(z0=0,zsc=1){ return new Drw3D(this.t,this._mask,$.Geometry3D.CUBE,$.Shader.COLOR_3D_XZ,this.a,this.b,this.c,this.d,this.e,this.f,this.g*zsc,this.h*zsc,this.i*zsc,this.g*z0,this.h*z0,this.i*z0) }
	resetTo(m){ this.a=m.a;this.b=m.b;this.c=m.c;this.d=m.d;this.e=m.e;this.f=m.f;this.g=m.g;this.h=m.h;this.i=m.i;this._mask=m._mask;this._sh=m._sh;this._shp=m._shp }
	reset(a=1,b=0,c=0,d=0,e=1,f=0,g=0,h=0,i=1){ if(typeof a=='object')({a,b,c,d,e,f,g,h,i}=a);this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this.g=g;this.h=h;this.i=i;this._mask=290787599;this._sh=$.Shader.DEFAULT;this._shp=geo2 }
	pixelRatio(){
		const {i} = this
		const v = (this.a*i-this.g*this.c) * (this.e*i-this.h*this.f)
		- (this.d*i-this.g*this.f) * (this.b*i-this.h*this.c)
		return sqrt(abs(v)*this.t.w*this.t.h)/(i*i)
	}
	draw(...values){
		const i = this._sh(9,values)
		arr[i  ] = this.g; arr[i+1] = this.a; arr[i+2] = this.d
		arr[i+3] = this.h; arr[i+4] = this.b; arr[i+5] = this.e
		arr[i+6] = this.i; arr[i+7] = this.c; arr[i+8] = this.f
	}
	drawRect(x=0, y=0, w=1, h=1, ...values){
		const i = this._sh(9,values)
		arr[i  ] = this.g+x*this.a+y*this.d; arr[i+1] = this.a*w; arr[i+2] = this.d*h
		arr[i+3] = this.h+x*this.b+y*this.e; arr[i+4] = this.b*w; arr[i+5] = this.e*h
		arr[i+6] = this.i+x*this.c+y*this.f; arr[i+7] = this.c*w; arr[i+8] = this.f*h
	}
	drawMat(a=1, b=0, c=0, d=1, e=0, f=0, ...values){
		const i = this._sh(9,values)
		const ta=this.a,tb=this.b,tc=this.c,td=this.d,te=this.e,tf=this.f,tg=this.g,th=this.h,ti=this.i
		arr[i  ] = ta*e+td*f+tg; arr[i+1] = ta*a+td*b; arr[i+2] = ta*c+td*d
		arr[i+3] = tb*e+te*f+th; arr[i+4] = tb*a+te*b; arr[i+5] = tb*c+te*d
		arr[i+6] = tc*e+tf*f+ti; arr[i+7] = tc*a+tf*b; arr[i+8] = tc*c+tf*d
	}
	drawv(values){
		const i = this._sh(9,values)
		arr[i  ] = this.g; arr[i+1] = this.a; arr[i+2] = this.d
		arr[i+3] = this.h; arr[i+4] = this.b; arr[i+5] = this.e
		arr[i+6] = this.i; arr[i+7] = this.c; arr[i+8] = this.f
	}
	drawRectv(x=0, y=0, w=1, h=1, values){
		const i = this._sh(9,values)
		arr[i  ] = this.g+x*this.a+y*this.d; arr[i+1] = this.a*w; arr[i+2] = this.d*h
		arr[i+3] = this.h+x*this.b+y*this.e; arr[i+4] = this.b*w; arr[i+5] = this.e*h
		arr[i+6] = this.i+x*this.c+y*this.f; arr[i+7] = this.c*w; arr[i+8] = this.f*h
	}
	drawMatv(a=1, b=0, c=0, d=1, e=0, f=0, values){
		const i = this._sh(9,values)
		const ta=this.a,tb=this.b,tc=this.c,td=this.d,te=this.e,tf=this.f,tg=this.g,th=this.h,ti=this.i
		arr[i  ] = ta*e+td*f+tg; arr[i+1] = ta*a+td*b; arr[i+2] = ta*c+td*d
		arr[i+3] = tb*e+te*f+th; arr[i+4] = tb*a+te*b; arr[i+5] = tb*c+te*d
		arr[i+6] = tc*e+tf*f+ti; arr[i+7] = tc*a+tf*b; arr[i+8] = tc*c+tf*d
	}
}
class Drw3t2D extends t3t2D{
	set shader(sh){ this._sh=typeof sh=='function'&&sh.three===true?sh:$.Shader.COLOR_3D_XZ; if(lastd == this) lastd = null }
	get shader(){ return this._sh }
	get geometry(){ return this._shp }
	set geometry(a){ this._shp = a||geo3; if(lastd == this) lastd = null }
	constructor(t,m=290787599,sp=geo3,s=$.Shader.COLOR_3D_XZ,a=1,b=0,c=0,d=1,e=0,f=0,g=0,h=0){ super(a,b,c,d,e,f,g,h); this.t = t; this._mask = m; this._shp = sp; this._sh = s }
	getTransform(){ return new t3t2D(this.a,this.b,this.c,this.d,this.e,this.f,this.g,this.h) }
	sub(){ return new Drw3t2D(this.t,this._mask,this._shp,this._sh,this.a,this.b,this.c,this.d,this.e,this.f,this.g,this.h) }
	subPersp(z0=0,zsc=1){ return new Drw3D(this.t,this._mask,$.Geometry3D.CUBE,$.Shader.COLOR_3D_XZ,this.a,this.b,0,this.c,this.d,0,this.g*zsc+this.e,this.h*zsc+this.f,zsc,this.g*z0,this.h*z0,z0) }
	sub2dXY(){ return new Drw2D(this.t,this._mask,geo2,$.Shader.DEFAULT,this.a,this.b,this.c,this.d,this.g,this.h) }
	sub2dZY(){ return new Drw2D(this.t,this._mask,geo2,$.Shader.DEFAULT,this.e,this.f,this.c,this.d,this.g,this.h) }
	sub2dXZ(){ return new Drw2D(this.t,this._mask,geo2,$.Shader.DEFAULT,this.a,this.b,this.e,this.f,this.g,this.h) }
	resetTo(m){ this.a=m.a;this.b=m.b;this.c=m.c;this.d=m.d;this.e=m.e;this.f=m.f;this.g=m.g;this.h=m.h;this._mask=m._mask;this._sh=m._sh;this._shp=m._shp }
	reset(a=1,b=0,c=0,d=1,e=0,f=0,g=0,h=0){ if(typeof a=='object')({a,b,c,d,e,f,g,h}=a);this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this.g=g;this.h=h;this._mask=290787599;this._sh=$.Shader.COLOR_3D_XZ;this._shp=geo3 }
	draw(...values){
		const v = this._sh(8,values)
		arr[v  ] = this.g; arr[v+1] = this.a; arr[v+2] = this.c; arr[v+3] = this.e
		arr[v+4] = this.h; arr[v+5] = this.b; arr[v+6] = this.d; arr[v+7] = this.f
	}
	drawCube(x=0, y=0, z=0, xs=1, ys=1, zs=1, ...values){
		const v = this._sh(8,values)
		const {a,b,c,d,e,f} = this
		arr[v  ] = this.g+x*a+y*c+z*e; arr[v+1] = a*xs; arr[v+2] = c*ys; arr[v+3] = e*zs
		arr[v+4] = this.h+x*b+y*d+z*f; arr[v+5] = b*xs; arr[v+6] = d*ys; arr[v+7] = f*zs
	}
	drawMat(a=1, b=0, c=0, d=0, e=1, f=0, g=0, h=0, i=1, j=0, k=0, l=0, ...values){
		const v = this._sh(8,values)
		const A=this.a,B=this.b,C=this.c,D=this.d,E=this.e,F=this.f
		arr[v  ] = this.g+A*j+C*k+E*l; arr[v+1] = A*a+C*b+E*c; arr[v+2] = A*d+C*e+E*f; arr[v+3] = A*g+C*h+E*i
		arr[v+4] = this.h+B*j+D*k+F*l; arr[v+5] = B*a+D*b+F*c; arr[v+6] = B*d+D*e+F*f; arr[v+7] = B*g+D*h+F*i
	}
	drawv(values){
		const v = this._sh(8,values)
		arr[v  ] = this.g; arr[v+1] = this.a; arr[v+2] = this.c; arr[v+3] = this.e
		arr[v+4] = this.h; arr[v+5] = this.b; arr[v+6] = this.d; arr[v+7] = this.f
	}
	drawCubev(x=0, y=0, z=0, xs=1, ys=1, zs=1, values){
		const v = this._sh(8,values)
		const {a,b,c,d,e,f} = this
		arr[v  ] = this.g+x*a+y*c+z*e; arr[v+1] = a*xs; arr[v+2] = c*ys; arr[v+3] = e*zs
		arr[v+4] = this.h+x*b+y*d+z*f; arr[v+5] = b*xs; arr[v+6] = d*ys; arr[v+7] = f*zs
	}
	drawMatv(a=1, b=0, c=0, d=0, e=1, f=0, g=0, h=0, i=1, j=0, k=0, l=0, values){
		const v = this._sh(8,values)
		const A=this.a,B=this.b,C=this.c,D=this.d,E=this.e,F=this.f
		arr[v  ] = this.g+A*j+C*k+E*l; arr[v+1] = A*a+C*b+E*c; arr[v+2] = A*d+C*e+E*f; arr[v+3] = A*g+C*h+E*i
		arr[v+4] = this.h+B*j+D*k+F*l; arr[v+5] = B*a+D*b+F*c; arr[v+6] = B*d+D*e+F*f; arr[v+7] = B*g+D*h+F*i
	}
}
class Drw3D extends t3D{
	set shader(sh){ this._sh=typeof sh=='function'&&sh.three===true?sh:$.Shader.COLOR_3D_XZ; if(lastd == this) lastd = null }
	get shader(){ return this._sh }
	get geometry(){ return this._shp }
	set geometry(a){ this._shp = a||geo3; if(lastd == this) lastd = null }
	constructor(t,m=290787599,sp=geo3,s=$.Shader.COLOR_3D_XZ,a=1,b=0,c=0,d=0,e=1,f=0,g=0,h=0,i=1,j=0,k=0,l=0){ super(a,b,c,d,e,f,g,h,i,j,k,l); this.t = t; this._mask = m; this._shp = sp; this._sh = s }
	getTransform(){ return new t3D(this.a,this.b,this.c,this.d,this.e,this.f,this.g,this.h,this.i,this.j,this.k,this.l) }
	sub(){ return new Drw3D(this.t,this._mask,this._shp,this._sh,this.a,this.b,this.c,this.d,this.e,this.f,this.g,this.h,this.i,this.j,this.k,this.l) }
	subPersp(z0=0,zsc=1){ return new Drw3D(this.t,this._mask,$.Geometry3D.CUBE,$.Shader.COLOR_3D_XZ,this.a,this.b,this.c,this.d,this.e,this.f,this.j*zsc+this.g,this.k*zsc+this.h,this.l*zsc+this.i,this.j*z0,this.k*z0,this.l*z0) }
	sub2dXY(){ return new Drw2t3D(this.t,this._mask,geo2,$.Shader.DEFAULT,this.a,this.b,this.c,this.d,this.e,this.f,this.j,this.k,this.l) }
	sub2dZY(){ return new Drw2t3D(this.t,this._mask,geo2,$.Shader.DEFAULT,this.g,this.h,this.i,this.d,this.e,this.f,this.j,this.k,this.l) }
	sub2dXZ(){ return new Drw2t3D(this.t,this._mask,geo2,$.Shader.DEFAULT,this.a,this.b,this.c,this.g,this.h,this.i,this.j,this.k,this.l) }
	resetTo(m){ this.a=m.a;this.b=m.b;this.c=m.c;this.d=m.d;this.e=m.e;this.f=m.f;this.g=m.g;this.h=m.h;this.i=m.i;this.j=m.j;this.k=m.k;this.l=m.l;this._mask=m._mask;this._sh=m._sh;this._shp=m._shp }
	reset(a=1,b=0,c=0,d=0,e=1,f=0,g=0,h=0,i=1,j=0,k=0,l=0){ if(typeof a=='object')({a,b,c,d,e,f,g,h,i,j,k,l}=a);this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this.g=g;this.h=h;this.i=i;this.j=j;this.k=k;this.l=l;this._mask=290787599;this._sh=$.Shader.COLOR_3D_XZ;this._shp=geo3 }
	draw(...values){
		const v = this._sh(12,values)
		arr[v  ] = this.j; arr[v+1] = this.a; arr[v+2] = this.d; arr[v+3] = this.g
		arr[v+4] = this.k; arr[v+5] = this.b; arr[v+6] = this.e; arr[v+7] = this.h
		arr[v+8] = this.l; arr[v+9] = this.c; arr[v+10] = this.f; arr[v+11] = this.i
	}
	drawCube(x=0, y=0, z=0, xs=1, ys=1, zs=1, ...values){
		const v = this._sh(12,values)
		const {a,b,c,d,e,f,g,h,i} = this
		arr[v  ] = this.j+x*a+y*d+z*g; arr[v+1] = a*xs; arr[v+2] = d*ys; arr[v+3] = g*zs
		arr[v+4] = this.k+x*b+y*e+z*h; arr[v+5] = b*xs; arr[v+6] = e*ys; arr[v+7] = h*zs
		arr[v+8] = this.l+x*c+y*f+z*i; arr[v+9] = c*xs; arr[v+10] = f*ys; arr[v+11] = i*zs
	}
	drawMat(a=1, b=0, c=0, d=0, e=1, f=0, g=0, h=0, i=1, j=0, k=0, l=0, ...values){
		const v = this._sh(12,values)
		const A=this.a,B=this.b,C=this.c,D=this.d,E=this.e,F=this.f,G=this.g,H=this.h,I=this.i
		arr[v  ] = this.j+A*j+D*k+G*l; arr[v+1] = A*a+D*b+G*c; arr[v+2] = A*d+D*e+G*f; arr[v+3] = A*g+D*h+G*i
		arr[v+4] = this.k+B*j+E*k+H*l; arr[v+5] = B*a+E*b+H*c; arr[v+6] = B*d+E*e+H*f; arr[v+7] = B*g+E*h+H*i
		arr[v+8] = this.l+C*j+F*k+I*l; arr[v+9] = C*a+F*b+I*c; arr[v+10] = C*d+F*e+I*f; arr[v+11] = C*g+F*h+I*i
	}
	drawv(values){
		const v = this._sh(12,values)
		arr[v  ] = this.j; arr[v+1] = this.a; arr[v+2] = this.d; arr[v+3] = this.g
		arr[v+4] = this.k; arr[v+5] = this.b; arr[v+6] = this.e; arr[v+7] = this.h
		arr[v+8] = this.l; arr[v+9] = this.c; arr[v+10] = this.f; arr[v+11] = this.i
	}
	drawCubev(x=0, y=0, z=0, xs=1, ys=1, zs=1, values){
		const v = this._sh(12,values)
		const {a,b,c,d,e,f,g,h,i} = this
		arr[v  ] = this.j+x*a+y*d+z*g; arr[v+1] = a*xs; arr[v+2] = d*ys; arr[v+3] = g*zs
		arr[v+4] = this.k+x*b+y*e+z*h; arr[v+5] = b*xs; arr[v+6] = e*ys; arr[v+7] = h*zs
		arr[v+8] = this.l+x*c+y*f+z*i; arr[v+9] = c*xs; arr[v+10] = f*ys; arr[v+11] = i*zs
	}
	drawMatv(a=1, b=0, c=0, d=0, e=1, f=0, g=0, h=0, i=1, j=0, k=0, l=0, values){
		const v = this._sh(12,values)
		const A=this.a,B=this.b,C=this.c,D=this.d,E=this.e,F=this.f,G=this.g,H=this.h,I=this.i
		arr[v  ] = this.j+A*j+D*k+G*l; arr[v+1] = A*a+D*b+G*c; arr[v+2] = A*d+D*e+G*f; arr[v+3] = A*g+D*h+G*i
		arr[v+4] = this.k+B*j+E*k+H*l; arr[v+5] = B*a+E*b+H*c; arr[v+6] = B*d+E*e+H*f; arr[v+7] = B*g+E*h+H*i
		arr[v+8] = this.l+C*j+F*k+I*l; arr[v+9] = C*a+F*b+I*c; arr[v+10] = C*d+F*e+I*f; arr[v+11] = C*g+F*h+I*i
	}
}
const x = Object.getOwnPropertyDescriptors({
	get width(){ return this.t.w },
	get height(){ return this.t.h },
	get identity(){ return this.t },
	set mask(m){ this._mask=this._mask&-256|m&255; if(lastd == this) lastd = null },
	get mask(){ return this._mask&255 },
	set blend(b){ this._mask=this._mask&255|(b||1135889)<<8; if(lastd == this) lastd = null },
	get blend(){ return this._mask>>8 },
	_setv(){
		if(lastd == this) return false
		const {t, _mask: m} = this, s = t._stencil
		let d = pmask^m
		if(curt!=t){
			i&&draw()
			if(!curt||curt._stencil!=t._stencil) d|=240
			if(curfb != t._fb) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._fb)
			gl.viewport(0,0,t.w,t.h)
			curt = t
		}
		if(d){
			i&&draw()
			if(d&15) gl.colorMask(m&1,m&2,m&4,m&8)
			if(d&240){
				if(m&240){
					if(!(pmask&240)) gl.enable(gl.STENCIL_TEST)
					gl.stencilMask(1<<s)
					gl.stencilFunc(m&32?m&16?gl.NEVER:gl.NOTEQUAL:m&16?gl.EQUAL:gl.ALWAYS,255,1<<s)
					const op = m&128?m&64?gl.INVERT:gl.REPLACE:m&64?gl.ZERO:gl.KEEP
					gl.stencilOp(op, op, op)
				}else if(pmask&240) gl.disable(gl.STENCIL_TEST)
			}
			if(d&1996488704) gl.blendEquationSeparate((m>>24&7)+32773,(m>>28&7)+32773)
			if(d&16776960) gl.blendFuncSeparate((m>>8&15)+766*!!(m&3584), (m>>16&15)+766*!!(m&917504), (m>>12&15)+766*!!(m&57344), (m>>20&15)+766*!!(m&14680064))
			if(d&-2147483648) m&-2147483648 ? gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE) : gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE)
			pmask = m
		}
		lastd = this
		return true
	},
	setTarget(id=0, tex=null, l=0, mip=0){
		const {t} = this
		if(!t._fb) return
		i&&draw()
		if(lastd == this) lastd = null
		if(curfb != t._fb) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._fb), curt=lastd=null
		if(!tex){
			if(!t.u) return
			gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + id, gl.RENDERBUFFER, null)
			if(!(t.u &= ~(1<<id))){
				t.w = t.h = 0
				gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, null)
			}
			return
		}
		if(!(t.u &= ~(1<<id))) t.w = t.h = 0
		if(!t.w){
			t.w = tex.width
			t.h = tex.height
			if(t._stenBuf){
				gl.bindRenderbuffer(gl.RENDERBUFFER, t._stenBuf)
				gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, t.w, t.h)
				gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, t._stenBuf)
			}
		}else if(t.w!=tex.width||t.h!=tex.height) return
		t.u |= 1<<id
		if(tex.msaa)
			gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + id, gl.RENDERBUFFER, tex._tex)
		else
			gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + id, tex.t._tex, l, mip)
	},
	clearTargets(){
		const {t} = this
		if(!t._fb) return
		i&&draw()
		if(lastd == this) lastd = null
		let u = t.u
		t.u = t.w = t.h = 0
		if(t._stenBuf){
			gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, null)
			gl.deleteRenderbuffer(t._stenBuf)
			t._stenBuf = gl.createRenderbuffer()
		}
		if(!u) return
		if(curfb != t._fb) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._fb), curt=lastd=null
		while(u){
			const id = 31-clz32(u)
			u &= ~(1<<id)
			gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + id, gl.RENDERBUFFER, null)
		}
	},
	get hasStencil(){ return this.t._fb ? !!this.t._stenBuf : !!(flags&1) },
	set hasStencil(s){
		let {t} = this, b = t._stenBuf
		if(!t._fb || !s==!b) return
		i&&draw()
		if(lastd == this) lastd = null
		t._stenBuf = b = !b ? gl.createRenderbuffer() : (gl.deleteRenderbuffer(b), null)
		if(t.w){
			if(curfb != t._fb) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._fb), curt=lastd=null
			if(b){
				gl.bindRenderbuffer(gl.RENDERBUFFER, b)
				gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, t.w, t.h)
				gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, b)
			}else{
				gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, null)
			}
		}
	},
	clear(r = 0, g = r, b = r, a = g){
		if(typeof r=='object')a=r.w??0,b=r.z??0,g=r.y,r=r.x
		i&&draw()
		if(this._setv()) lastd = null
		gl.clearColor(r, g, b, a)
		const q = this.t._stencil=this.t._stencil+1&7
		gl.clear(q?16384:(gl.stencilMask(255), 17408))
		fdc++
		gl.disable(2960); pmask &= -241
	},
	clearStencil(){
		i&&draw()
		if(this._setv()) lastd = null
		const q = this.t._stencil = this.t._stencil+1&7
		if(!q) gl.stencilMask(255), gl.clear(1024)
		gl.disable(2960); pmask &= -241
	},
	delete(){
		i&&draw()
		const {t} = this
		if(!t._fb) return
		gl.deleteFramebuffer(t._fb)
		if(curfb==t._fb) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = null), lastd = null
		if(t._stenBuf) gl.deleteRenderbuffer(t._stenBuf)
	},
	perspective: false
})
Object.defineProperties(Drw2D.prototype, x)
Object.defineProperties(Drw3D.prototype, x)
Object.defineProperties(Drw2t3D.prototype, x)
Drw3D.prototype.perspective = Drw2t3D.prototype.perspective = true
Object.defineProperties(Drw3t2D.prototype, x)

Object.assign($.Blend = (src = 17, combine = 17, dst = 0, a2c = false) => src|dst<<8|combine<<16|a2c<<23, {
	REPLACE: 1114129,
	DEFAULT: 1135889,
	ADD: 1118465,
	MULTIPLY: 1122816,
	MULTIPLY_MIX: 1136008,
	SUBTRACT: 5574913,
	REVERSE_SUBTRACT: 7737601,
	MIN: 2232593, MAX: 3346705,
	BEHIND: 1118583,
	INVERT: 1127321
})
let lastd = null
function draw(b = shuniBind){
	gl.bufferData(gl.ARRAY_BUFFER, iarr.subarray(0, i), 35040)
	fd += i; i /= shCount; fdc++; fs += i
	shpElT ?
	  gl.drawElementsInstanced(shpType&7, shpLen, shpElT, shpStart, i)
	: gl.drawArraysInstanced(shpType&7, shpStart, shpLen, i)
	i = 0; boundUsed = b
	if(pendingFences.length){ fencetail ??= pendingFences[0]; for(const f of pendingFences){
		f.sync = gl.fenceSync(37143,0)
		fencehead = fencehead ? fencehead.next = f : f
	} pendingFences.length = 0 }
}

/*
const switcher = (f,s,e) => {
	let m = 'switch(u){'
	while(s<e) m += `case ${s}:${f(s++)}`
	return m+'}'
}
/*/
const switcher = (f,s,e) => {
	if(e<=s+1) return f(s)
	const m = s+(e-s>>1)
	return `if(u<${m}){${switcher(f,s,m)}}else{${switcher(f,m,e)}}`
} //*/
const names = ['float','vec2','vec3','vec4','int','ivec2','ivec3','ivec4','uint','uvec2','uvec3','uvec4']
const maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
function switchShader(s, fc, fm, c){ sh = s; shfCount = fc; shfMask = fm; shCount = c }
function switchVao(v){ gl.bindVertexArray(sv = v) }
const f4arr = new Float32Array(4), i4arr = new Int32Array(f4arr.buffer)
// TODO: Shader.supports({})
// Code generation bullshit GO!
const vfgen = (three, vparams, _defaults = []) => {
	vparams = typeof vparams=='number' ? [vparams] : vparams || []
	let id = 0
	const fShaderHead = [], vShaderHead = [], vShaderBody = []
	const vFnParams = [], vFnBody = ['']
	let vattrs = 2+three, flatvarys = 0, lerpvarys = 2+three, _vcount = 2+three
	for(const t of vparams){
		if((t&15)>=12)
			throw 'Vertex parameter cannot be a texture'
		const sz = (t&3)+1, n = names[t&3|(t>>4&15)<<2], flat = t>15
		_defaults[id] ??= sz==1?0:sz==2?v2z:sz==3?v3z:v4z
		vFnParams.push(`${id}:a${id}=_defaults[${id}]`)
		const A = (t&63)>13?'iarr[i+':'arr[i+'
		if(sz==1) vFnBody.push(A+_vcount+']=a'+id)
		else for(let j=0;j<sz;j++) vFnBody.push(A+(_vcount+j)+']=a'+id+'.'+'xyzw'[j])
		const vid = ''+(vattrs>>2)
		const oStart = vattrs&3, oEnd = ((vattrs += sz)&3)||4
		let vvarys = flat ? flatvarys : lerpvarys
		const vStart = vvarys&3, vEnd = ((vvarys += sz)&3)||4
		if(flat) flatvarys = vvarys; else lerpvarys = vvarys
		let nm = ''
		if(oEnd <= (oStart||4)){
			const pos = (vattrs>>2)-(sz==4+oStart)
			vShaderHead.push(`layout(location=${maxAttribs-1-pos})in uvec4 o${pos};`)
		}
		if(oEnd <= oStart){
			nm = `uvec${sz}(o${vid}.${'xyzw'.slice(oStart,4)},o${vattrs>>2}.${'xyzw'.slice(0, oEnd)})`
		}else{
			if(oEnd==4&&oStart==0) nm = 'v' + vid
			else nm = `o${vid}.` + 'xyzw'.slice(oStart, oEnd)
		}
		if(!flat) nm = `uintBitsToFloat(${nm})`
		const start = `GL_${flat?'V':'v'}${vid}.`
		if(vEnd <= (vStart||4))
			vShaderHead.push(`${flat?'flat out u':'out '}vec4 ${(flat?'GL_V':'GL_v')+((vvarys>>2)-(sz==4+vStart))};`)
		if(vEnd <= vStart){
			const name1 = (flat?'GL_V':'GL_v')+(vvarys>>2)
			const v = `${flat?'u':''}vec${sz}(${start+'xyzw'.slice(vStart)},${name1+'.'+'xyzw'.slice(0, vEnd)})`
			fShaderHead.push(`${flat?'flat in u':'in '}vec4 ${name1};\n#define vparam${vid} ${t>=64&&t<80?`uintBitsToFloat(${v})`:v}\n`)
			vShaderBody.push(`${n} t${id}=${nm};${start+'xyzw'.slice(vStart)}=t${id}.${'xyzw'.slice(0, 4-vStart)};${name1}.${'xyzw'.slice(0, vEnd)}=t${id}.${'xyzw'.slice(4-vStart,sz)};`)
		}else{
			const v = start + 'xyzw'.slice(vStart, vEnd)
			fShaderHead.push(`\n#define vparam${vid} ${t>=64&&t<80?`uintBitsToFloat(${v})`:v}\n`)
			vShaderBody.push(`${start+'xyzw'.slice(vStart,vEnd)}=${nm};`)
		}
		_vcount += sz
		id++
	}
	vFnBody[0] = `let{i,arr,iarr}=this;if((this.i=i+${_vcount})>arr.length){${ArrayBuffer.prototype.transfer ? `iarr=this.iarr=new Int32Array(iarr.buffer.transfer(i+${_vcount}<<3))` : `const oa=iarr;iarr=this.iarr=new Int32Array(i+${_vcount}<<1);iarr.set(oa,0)`};arr=this.arr=new Float32Array(iarr.buffer)}`
	vFnBody.push('return i')
	if(flatvarys) vShaderHead.push(`flat out uvec4 GL_V0;`), fShaderHead.push(`flat in uvec4 GL_V0;`)
	const _pack = eval(`(function({${vFnParams}}){${vFnBody.join(';')}})`)
	return {three, _pack, _vcount, fsh: fShaderHead.join(''), vsh: vShaderHead.join(''), vshb: vShaderBody.join('')}
}
class Geo2D extends t2D{
	constructor(t,s=0,L=0,tp=5,a=1,b=0,c=0,d=1,e=0,f=0){ super(a,b,c,d,e,f); this.t = t; this._s = s; this._l = L; this._t = tp }
	sub(start = this.t._size, length = 0, type = this._t){ return new Geo2D(this.t, start>>>0, length>>>0, type&63, this.a, this.b, this.c, this.d, this.e, this.f) }
	sub3d(start = this.t._size, length = 0, type = this._t){ return new Geo3t2D(this.t, start>>>0, length>>>0, type&63, this.a, this.b, this.c, this.d, 0, 0, this.e, this.f) }
	addPoint(x, y, ...v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = x*this.a+y*this.c+this.e; arr[i+1] = x*this.b+y*this.d+this.f
		return t._size++
	}
	add(...v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = this.e; arr[i+1] = this.f
		return t._size++
	}
	addPointv(x, y, v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = x*this.a+y*this.c+this.e; arr[i+1] = x*this.b+y*this.d+this.f
		return t._size++
	}
	addv(v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = this.e; arr[i+1] = this.f
		return t._size++
	}
}
class Geo2t3D extends t2t3D{
	constructor(t,s=0,L=0,tp=5,a=1,b=0,c=0,d=0,e=1,f=0,g=0,h=0,i=1){ super(a,b,c,d,e,f,g,h,i); this.t = t; this._s = s; this._l = L; this._t = tp }
	sub(start = this.t._size, length = 0, type = this._t){ return new Geo2t3D(this.t, start>>>0, length>>>0, type&63, this.a, this.b, this.c, this.d, this.e, this.f, this.g, this.h, this.i) }
	sub3d(start = this.t._size, length = 0, type = this._t){ return new Geo3D(this.t, start>>>0, length>>>0, type&63, this.a, this.b, this.c, this.d, this.e, this.f, 0, 0, 0, this.g, this.h, this.i) }
	addPoint(x, y, ...v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = x*this.a+y*this.d+this.g; arr[i+1] = x*this.b+y*this.e+this.h; arr[i+2] = x*this.c+y*this.f+this.i
		return t._size++
	}
	add(...v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = this.g; arr[i+1] = this.h; arr[i+2] = this.i
		return t._size++
	}
	addPointv(x, y, v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = x*this.a+y*this.d+this.g; arr[i+1] = x*this.b+y*this.e+this.h; arr[i+2] = x*this.c+y*this.f+this.i
		return t._size++
	}
	addv(v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = this.g; arr[i+1] = this.h; arr[i+2] = this.i
		return t._size++
	}
}
class Geo3t2D extends t3t2D{
	constructor(t,s=0,L=0,tp=5,a=1,b=0,c=0,d=1,e=0,f=0,g=0,h=0){ super(a,b,c,d,e,f,g,h); this.t = t; this._s = s; this._l = L; this._t = tp }
	sub(start = this.t._size, length = 0, type = this._t){ return new Geo3t2D(this.t, start>>>0, length>>>0, type&63, this.a, this.b, this.c, this.d, this.e, this.f, this.g, this.h) }
	sub2dXY(start = this.t._size, length = 0, type = this._t){ return new Geo2D(this.t, start>>>0, length>>>0, type&63, this.a, this.b, this.c, this.d, this.g, this.h) }
	sub2dXZ(start = this.t._size, length = 0, type = this._t){ return new Geo2D(this.t, start>>>0, length>>>0, type&63, this.a, this.b, this.e, this.f, this.g, this.h) }
	sub2dZY(start = this.t._size, length = 0, type = this._t){ return new Geo2D(this.t, start>>>0, length>>>0, type&63, this.e, this.f, this.c, this.d, this.g, this.h) }
	addPoint(x, y, z, ...v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = x*this.a+y*this.c+z*this.e+this.g
		arr[i+1] = x*this.b+y*this.d+z*this.f+this.h
		return t._size++
	}
	add(...v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = this.g; arr[i+1] = this.h
		return t._size++
	}
	addPointv(x, y, z, v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = x*this.a+y*this.c+z*this.e+this.g
		arr[i+1] = x*this.b+y*this.d+z*this.f+this.h
		return t._size++
	}
	addv(v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = this.g; arr[i+1] = this.h
		return t._size++
	}
}
class Geo3D extends t3D{
	constructor(t,s=0,L=0,tp=5,a=1,b=0,c=0,d=0,e=1,f=0,g=0,h=0,i=1,j=0,k=0,l=0){ super(a,b,c,d,e,f,g,h,i,j,k,l); this.t = t; this._s = s; this._l = L; this._t = tp }
	sub(start = this.t._size, length = 0, type = this._t){ return new Geo3D(this.t, start>>>0, length>>>0, type&63, this.a, this.b, this.c, this.d, this.e, this.f, this.g, this.h, this.i, this.j, this.k, this.l) }
	sub2dXY(start = this.t._size, length = 0, type = this._t){ return new Geo2t3D(this.t, start>>>0, length>>>0, type&63, this.a, this.b, this.c, this.d, this.e, this.f, this.j, this.k, this.l) }
	sub2dXZ(start = this.t._size, length = 0, type = this._t){ return new Geo2t3D(this.t, start>>>0, length>>>0, type&63, this.a, this.b, this.c, this.g, this.h, this.i, this.j, this.k, this.l) }
	sub2dZY(start = this.t._size, length = 0, type = this._t){ return new Geo2t3D(this.t, start>>>0, length>>>0, type&63, this.g, this.h, this.i, this.d, this.e, this.f, this.j, this.k, this.l) }
	addPoint(x, y, z, ...v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = x*this.a+y*this.d+z*this.g+this.j
		arr[i+1] = x*this.b+y*this.e+z*this.h+this.k
		arr[i+2] = x*this.c+y*this.f+z*this.i+this.l
		return t._size++
	}
	add(...v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = this.j; arr[i+1] = this.k; arr[i+2] = this.l
		return t._size++
	}
	addPointv(x, y, z, v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = x*this.a+y*this.d+z*this.g+this.j
		arr[i+1] = x*this.b+y*this.e+z*this.h+this.k
		arr[i+2] = x*this.c+y*this.f+z*this.i+this.l
		return t._size++
	}
	addv(v){
		const {t} = this, i = t._pack(v), {arr} = t
		arr[i] = this.j; arr[i+1] = this.k; arr[i+2] = this.l
		return t._size++
	}
}
gl.vertexAttrib4f(2, 1, 0, 0, 0)
function setupGenericVao3(t){
	gl.bindBuffer(gl.ARRAY_BUFFER, t.b)
	const vlowest = maxAttribs-(t._vcount+3>>2)
	for(let i = maxAttribs-1,j=0; i >= vlowest; i--,j+=16){
		gl.enableVertexAttribArray(i)
		gl.vertexAttribIPointer(i,i==vlowest?t._vcount&3:4,gl.UNSIGNED_INT,t._vcount<<2,j)
	}
	gl.enableVertexAttribArray(0)
	gl.enableVertexAttribArray(1)
	gl.vertexAttribDivisor(0, 1)
	gl.vertexAttribDivisor(1, 1)
	gl.vertexAttribDivisor(2, 1)
	gl.bindBuffer(gl.ARRAY_BUFFER,buf)
}
const y = Object.getOwnPropertyDescriptors({
	get size(){ return this.t._size },
	get uploadCount(){ return this.t._usize },
	get vertex(){ return this.t.vtx },
	_setShp(){
		const {t} = this
		i&&draw(); shp = this
		const ot4 = shpType>>4, t4 = (shpType = this._t)>>4
		if(ot4 != t4){
			if(!t4) gl.disable(gl.CULL_FACE)
			else{
				if(!ot4) gl.enable(gl.CULL_FACE)
				gl.frontFace(gl.CW + (t4>>1))
			}
		}
		shpStart = this._s; shpLen = this._l
		shpElT = t._elT
	},
	get end(){ return this._s + this._l },
	set end(a){ a >>>= 0; if(a >= this._s) this._l = a - this._s; else this._l = this._s - a, this._s = a; if(shp == this) this._setShp() },
	get start(){ return this._s },
	set start(a){ this._s = a>>>0; if(shp == this) i&&draw(), shpStart = this._s },
	get length(){ return this._l },
	set length(a){ this._l = a>>>0; if(shp == this) i&&draw(), shpLen = this._l },
	get type(){ return this._t },
	set type(a){ this._t = a&63; if(shp == this) this._setShp() },
	get identity(){ return this.t },
	upload(order = null){
		const {t} = this
		if(shp&&t==shp.t) i&&draw()
		if(!order){
			if(t.v){
				gl.bindVertexArray(t.v)
				if(!t.Ls){
					t.Ls = 1
					setupGenericVao3(t)
				}
				if(t._elB) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
				gl.bindVertexArray(sv)
			}
			t._elT = 0
			if(t._elB){
				t._elB.delete()
				t._elB = null
			}
		}else{
			let typ = 0
			if(Array.isArray(order)){
				let max = 0
				for(const n of order) if(n>max) max=n
				const buf = max>254 ? max>65534 ? new Uint32Array(order.length) : new Uint16Array(order.length) : new Uint8Array(order.length)
				buf.set(order, 0)
				order = buf
			}
			typ = gl.UNSIGNED_BYTE + (0x40200>>(order.BYTES_PER_ELEMENT<<2)&15)
			t._elT = typ
			gl.bindVertexArray(t.v)
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, t._elB ??= gl.createBuffer())
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, order, gl.STATIC_DRAW)
			if(!t.v) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
			else if(!t.Ls){
				t.Ls = 1
				setupGenericVao3(t)
			}
			gl.bindVertexArray(sv)
		}
		if(shp&&shp.t==t) shpElT = t._elT
		gl.bindBuffer(gl.ARRAY_BUFFER, t.b)
		gl.bufferData(gl.ARRAY_BUFFER, t.iarr.subarray(0, t.i), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, buf)
		t.arr = empty
		t.iarr = iempty
		t.i = 0
		t._usize = this._l = order ? order.length : t._size
		t._size = 0
		if(shp&&t==shp.t) this._setShp()
	},
	export(){
		const {t:{iarr, i: len}} = this, res = new Uint8Array(len*4)
		for(let i = 0; i < len; i++){
			const i2 = i*4, num = iarr[i]
			res[i2] = num>>24; res[i2+1] = num>>16
			res[i2+2] = num>>8; res[i2+3] = num
		}
		return res
	},
	import(f){
		if(f instanceof ArrayBuffer) f = new Uint8Array(f)
		const {t} = this
		let {i, iarr} = t, l = i + (f.length*.25>>>0)
		if(iarr.length < l){
			if(ArrayBuffer.prototype.transfer){
				iarr = t.iarr = new Int32Array(iarr.buffer.transfer(l*4))
			}else{
				const oa = t.iarr
				iarr = t.iarr = new Int32Array(l)
				t.iarr.set(oa, 0)
			}
			t.arr = new Float32Array(t.iarr.buffer)
		}
		let j = 0
		while(i < l)
			iarr[i++] = f[j++]<<24|f[j++]<<16|f[j++]<<8|f[j++]
		t.i = l
	},
	dup(){
		const {t} = this
		if(!t.i) return -1
		let i = t.i, oi = i-t._vcount
		let {iarr} = t, end = t.i = i+t._vcount
		if(iarr.length < end){
			if(ArrayBuffer.prototype.transfer){
				iarr = t.iarr = new Int32Array(iarr.buffer.transfer(end*8))
			}else{
				const oa = t.iarr
				iarr = t.iarr = new Int32Array(end*2)
				t.iarr.set(oa, 0)
			}
			t.arr = new Float32Array(t.iarr.buffer)
		}
		while(i<end) iarr[i++] = iarr[oi++]
		return t._size++
	}
})
const empty = new Float32Array(), iempty = new Int32Array(empty.buffer)
Object.defineProperties(Geo2D.prototype, y)
Object.defineProperties(Geo2t3D.prototype, y)
Object.defineProperties(Geo3t2D.prototype, y)
Object.defineProperties(Geo3D.prototype, y)
$.Geometry2D = (v = null, type=5) => {
	if(typeof v == 'number') type = v, v = null
	const {_pack, _vcount, three} = v ?? $.Geometry2D.Vertex.DEFAULT
	if(three) return null
	const arr = new Float32Array(16)
	return new Geo2D({arr, iarr: new Int32Array(arr.buffer), i: 0, vtx: v, b: gl.createBuffer(), _pack, _vcount, _size: 0, _usize: 0, v: null, _elB: null, _elT: 0},0,0,type)
}
$.Geometry3D = (v = null, type=5) => {
	if(typeof v == 'number') type = v, v = null
	const {_pack, _vcount, three} = v ?? $.Geometry3D.Vertex.DEFAULT
	if(!three) return null
	const arr = new Float32Array(16)
	return new Geo3D({arr, iarr: new Int32Array(arr.buffer), i: 0, vtx: v, b: gl.createBuffer(), _pack, _vcount, _size: 0, _usize: 0, v: gl.createVertexArray(), L: null, Ls: 0, _elB: null, _elT: 0},0,0,type)
}

$.Geometry2D.Vertex = vfgen.bind(null, false)
$.Geometry3D.Vertex = vfgen.bind(null, true)
const geo2 = $.Geometry2D.SQUARE = $.Geometry2D($.Geometry2D.Vertex.DEFAULT = vfgen(false, []), 5)
const geo3 = $.Geometry3D.CUBE = $.Geometry3D($.Geometry3D.Vertex.DEFAULT = vfgen(true, []), 21)
$.Geometry3D.Vertex.WITH_NORMALS = vfgen(true, [$.VEC3])
for(let i=0;i<4;i++) geo2.addPoint(i&1,i>>1&1), geo3.addPoint(0,i&1,i>>1&1), geo3.addPoint(1,i&1,i>>1&1)
geo2.upload()
geo3.upload(new Uint8Array([4, 6, 0, 2, 3, 6, 7, 4, 5, 0, 1, 3, 5, 7]))
$.Geometry3D.INSIDE_CUBE = geo3.sub(0, 14, 37)
$.Geometry3D.XZ_FACE = geo3.sub(7, 4, 21)
$.Shader = (src, {params, defaults: _defaults, uniforms, uniformDefaults: _uDefaults, outputs=4, vertex = $.Geometry2D.Vertex.DEFAULT, intFrac=0.5}={}) => {
	params = typeof params=='number' ? [params] : params || []
	uniforms = typeof uniforms=='number' ? [uniforms] : uniforms || []
	_defaults = _defaults !== undefined ? Array.isArray(_defaults) ? [..._defaults] : [_defaults] : []
	_uDefaults = _uDefaults !== undefined ? Array.isArray(_uDefaults) ? [..._uDefaults] : [_uDefaults] : []
	outputs = typeof outputs=='number' ? [outputs] : outputs || []
	if(outputs.length > Drawable.MAX_TARGETS) throw `Too many shader outputs (Drawable.MAX_TARGETS == ${Drawable.MAX_TARGETS})`
	const matWidth = 3+vertex.three
	const fnParams = [], fnBody = [''], vShaderHead = [`#version 300 es\nprecision highp float;precision highp int;layout(location=0)in mat3x${matWidth} m;layout(location=${maxAttribs-1})in uvec4 o0;out vec4 GL_v0;`], vShaderBody = [`void main(){gl_Position.xyw=vec${matWidth}(1.,GL_v0.xy${vertex.three?'z':''}=uintBitsToFloat(o0.xy${vertex.three?'z':''}))*m;gl_Position.xy=gl_Position.xy*2.-gl_Position.w;gl_Position.z=0.;gl_PointSize=1.;`], fShaderHead = [`#version 300 es\nprecision highp float;precision highp int;in vec4 GL_v0;\n#define color color0\n#define i_depth gl_FragCoord.w\n#define pos GL_v0.xy${matWidth>3?'z':''}\n`+outputs.map((o,i) => `layout(location=${i})out ${!o?'':o==16||o==32?'u':'lowp '}vec4 color${i};`).join(';'),'']
	let used = 0, fCount = 0, iCount = 0, attrs = 0
	const texCheck = []
	const addAttr = (sz=0) => {
		const id = ''+(attrs>>2)
		const oStart = attrs&3, oEnd = ((attrs += sz)&3)||4
		if(oEnd <= (oStart||4)){
			const id = ((attrs>>2) - (sz==4+oStart)), id1 = ''+id
			vShaderHead.push(`layout(location=${id+3})in uvec4 a${id1};flat out uvec4 GL_a${id1};`)
			fShaderHead.push(`flat in uvec4 GL_a${id1};`)
			vShaderBody.push(`GL_a${id1}=a${id1};`)
		}
		if(oEnd <= oStart){
			let nm = `uvec${sz}(GL_a${id}.`
			for(let i = oStart; i < 4; i++) nm += 'xyzw'[i]
			nm += `,GL_a${attrs>>2}.`
			for(let i = 0; i < oEnd; i++) nm += 'xyzw'[i]
			return nm+')'
		}
		if(oEnd==4&&oStart==0) return 'GL_a' + id
		let nm = `GL_a${id}.`
		for(let i = oStart; i < oEnd; i++) nm += 'xyzw'[i]
		return nm
	}
	let id = 0
	for(const t of params){
		let sz = (t&3)+1
		if((t&15)>=12){
			used |= 1<<sz-1
			if((t&15)>13) iCount++
			else fCount++
		}
		_defaults[id] ??= sz==1?0:sz==2?v2z:sz==3?v3z:t>=28&&t<32?null:v4z
		fnParams.push(`${id}:a${id}=_defaults[${id}]`)
		const A = t>13?'iarr[j+':'arr[j+'
		const count = attrs
		if(t>=12&&t<16){
			texCheck.push(`let t${id}=-1;if(a${id}.t){if((t${id}=Tex.auto(a${id}.t,${-(t==8)}))==-1){i&&draw(b^boundUsed);t${id}=Tex.auto(a${id}.t,${-(t==8)})}t${id}|=a${id}.l<<8}`)
			const v = addAttr(1), v2 = addAttr(2), v3 = addAttr(2)
			fShaderHead.push(`${t==4?'lowp ':t==8?'u':'highp '}vec4 param${id}(vec2 uv){int v=int(${v});if(v<0)return vec4(uintBitsToFloat(${v2}),uintBitsToFloat(${v3}));return ${t==4?'g':t==8?'uG':'fG'}etColor(v&255,vec3(uv*uintBitsToFloat(${v3})+uintBitsToFloat(${v2}),v>>8));}`)
			fnBody.push(`iarr[j+${count}]=t${id};if(t${id}>=0)arr[j+${count+1}]=a${id}.x,arr[j+${count+2}]=a${id}.y,arr[j+${count+3}]=a${id}.w,arr[j+${count+4}]=a${id}.h;else ${A}${count+1}]=a${id}.x,${A}${count+2}]=a${id}.y,${A}${count+3}]=a${id}.z,${A}${count+4}]=a${id}.w`)
			sz = 5
		}else{
			if(t>=28&&t<32){
				texCheck.push(`let q${id}=Tex.auto(a${id}.t,${-(t>29)});if(q${id}<0)i&&draw(b^boundUsed),q${id}=Tex.auto(a${id}.t,${-(t>29)})`)
				sz = 1
			}
			const v = addAttr(sz)
			fShaderHead.push(`\n#define param${id} ${t<16?'uintBitsToFloat':t<32?names[t&3|4]:''}(${v})\n`)
			if(sz==1) fnBody.push(A+count+']=a'+id)
			else for(let j=0;j<sz;j++) fnBody.push(A+(count+j)+']=a'+id+'.'+'xyzw'[j])
		}
		id++
	}
	fShaderHead.push(vertex.fsh)
	vShaderHead.push(vertex.vsh)
	vShaderBody.push(vertex.vshb)
	id = 0
	const uniFnParams = [], uniFnBody = [''], bindUniTexBody = []
	const uniNames = [], states = []
	for(const t of uniforms){
		const sz = (t&3)+1
		if((t&15)>=12){
			used |= 1<<sz-1
			if((t&15)>13) iCount++
			else fCount++
			n = 'int'
		}
		_uDefaults[id] ??= sz==1?0:sz==2?v2z:sz==3?v3z:t>=28&&t<32?null:v4z
		uniFnParams.push(`a${id}=_uDefaults[${id}]`)
		if(t>=28&&t<32){
			bindUniTexBody.push(`gl.uniform1i(uniLocs[${uniNames.length}],s${states.length}?Tex.auto(s${states.length},${-(t>29)}):-1)`)
			uniNames.push('uni'+id)
			fShaderHead.push(`uniform ${t>29?'u':''}sampler2DArray uni${id};`)
			uniFnBody.push(`s${states.length}=a${id}.t`)
			states.push(`,s${states.length}=null`)
		}else if(t>=12&&t<16){
			const v = 'GL_u'+id, v2 = 'GL_U'+id, v3 = 'GL_L'+id
			bindUniTexBody.push(`if(s${states.length})gl.uniform1i(uniLocs[${uniNames.length}],Tex.auto(s${states.length},${-(t>13)}))`)
			fShaderHead.push(t>13?`uniform usampler2DArray ${v};uniform float ${v3};uniform uvec4 ${v2}; ${t==14?'i':'u'}vec4 uni${id}(vec2 uv){if(${v3}<0.)return ${t==14?`ivec4(${v2})`:v2};return ${t==14?'i':'u'}GetColor(${v},vec3(uv*uintBitsToFloat(${v2}.zw)+uintBitsToFloat(${v2}.xy),${v3}));}`:`uniform sampler2DArray ${v};uniform float ${v3};uniform vec4 ${v2}; ${t==12?'lowp ':''}vec4 uni${id}(vec2 uv){if(${v3}<0.)return ${v2};return texture(${v},vec3(uv*${v2}.zw+${v2}.xy,${v3}));}`)
			uniFnBody.push(`if(s${states.length}=a${id}.t){gl.uniform1f(uniLocs[${uniNames.length+2}],a${id}.l);${t>13?`f4arr[0]=a${id}.x,f4arr[1]=a${id}.y,f4arr[2]=a${id}.w,f4arr[3]=a${id}.h;gl.uniform4ui`:'gl.uniform4f'}(uniLocs[${uniNames.length+1}],${t>13?`i4arr[0],i4arr[1],i4arr[2],i4arr[3]`:`a${id}.x,a${id}.y,a${id}.w,a${id}.h`})}else gl.uniform1f(uniLocs[${uniNames.length+2}],-1),gl.uniform4${t>13?'ui':'f'}(uniLocs[${uniNames.length+1}],a${id}.x,a${id}.y,a${id}.z,a${id}.w)`)
			uniNames.push(v, v2, v3)
			states.push(`,s${states.length}=null`)
		}else{
			fShaderHead.push(`uniform ${names[t&3|t>>4<<2]} uni${id};`)
			let args = `gl.uniform${sz+(t<16?'f':t<32?'i':'ui')}(uniLocs[${uniNames.length}]`
			uniNames.push('uni'+id)
			if(sz==1) args += ',a'+id
			else for(let j=0;j<sz;j++) args += ',a'+id+'.'+'xyzw'[j]
			uniFnBody.push(args+')')
		}
		id++
	}
	if((12 + (attrs+3&-4) + (vertex._vcount+3&-4)) > (maxAttribs<<2)) throw 'Too many shader parameters'
	if(fCount+iCount>16) throw 'Shaders cannot use more than 16 textures/colors'
	Object.freeze(_defaults)
	Object.freeze(_uDefaults)
	const vlowest = maxAttribs-(vertex._vcount+3>>2)
	fCount = fCount?iCount?fCount+round(intFrac * (maxTex-fCount-iCount)):maxTex:0
	iCount = iCount && maxTex - fCount
	let T = null, head = `precision highp usampler2DArray; precision ${used&2?'highp':'lowp'} sampler2DArray;`
	// any tex
	if(used&15) head += `uniform sampler2DArray GL_f[${fCount}];\
ivec3 textureSize(int u,int l){${switcher(i=>`return textureSize(GL_${i<fCount?'f['+i:'i['+(i-fCount)}],l);`,0,maxTex)}}\n#define getSize textureSize\n`
	// any int tex
	if(used&12) head += `uniform usampler2DArray GL_i[${iCount}];\
uvec4 uGetColor(int u,vec3 p){${switcher(i=>`return texture(GL_i[${i-maxTex}],p);`,maxTex,2*maxTex-fCount)}}\
uvec4 uGetPixel(int u,ivec3 p,int l){${switcher(i=>`return texelFetch(GL_i[${i-maxTex}],p,l);`,maxTex,2*maxTex-fCount)}}\
uvec4 uGetColor(usampler2DArray u,vec3 p){return texture(u,p);}\
uvec4 uGetPixel(usampler2DArray u,ivec3 p,int l){return texelFetch(u,p,l);}
#define iGetColor(a,b) ivec4(uGetColor(a,b))\n#define iGetPixel(a,b,c) ivec4(uGetPixel(a,b,c))\n`
	// Any float texture
	if(used&3) head += `vec4 fGetColor(int u,vec3 p){${switcher(i=>`return texture(GL_f[${i}],p);`,0,fCount)}}lowp vec4 GL_lp(vec4 x){return x;}\
vec4 fGetColor(sampler2DArray t,vec3 p){return texture(t,p);}\
vec4 fGetPixel(sampler2DArray t,ivec3 p,int l){return texelFetch(t,p,l);}\
vec4 fGetPixel(int u,ivec3 p,int l){${T||switcher(i=>`return texelFetch(GL_f[${i}],p,l);`,0,fCount)}}
#define getColor(a,b)GL_lp(fGetColor(a,b))\n#define getPixel(a,b,c)GL_lp(fGetPixel(a,b,c))\n`
	fShaderHead[1] = head
	const fMask = 32-fCount&&(-1>>>fCount|0)
	uniFnBody[0] = `i&&draw(0);if(sh!=s){gl.useProgram(program);switchShader(s,${fCount},${fMask},${matWidth>3 ? attrs+matWidth*(matWidth-1)+')' : `lv==shVao3?${attrs+9}:${attrs+6});switchVao(lv)`}}`
	const bind = vlowest==maxAttribs-1?`gl.vertexAttribIPointer(${vlowest},${vertex._vcount&3},gl.UNSIGNED_INT,${vertex._vcount<<2},0)`:`for(let i=${maxAttribs-1},j=0;i>=${vlowest};i--,j+=16){gl.vertexAttribIPointer(i,i==${vlowest}?${vertex._vcount&3}:4,gl.UNSIGNED_INT,${vertex._vcount<<2},j)`
	fnBody[0] = `sz+=${attrs};if(this._setv()){const sd=sh!=s,{_shp}=this,_st=_shp.t;if(sd||sz!=shCount){i&&draw(sd?0:shuniBind);switchShader(s,${fCount},${fMask},sz);if(sd)gl.useProgram(program),B();${matWidth>3 ? `}if(sv!=_st.v)i&&draw(),switchVao(_st.v);if(s!=_st.L||sz!=_st.Ls){i&&draw();if(!_st.Ls)setupGenericVao3(_st);setVao(sz>${8+attrs},0,false);_st.L=s;_st.Ls=sz` : `switchVao(lv=sz>${8+attrs}?shVao3:shVao)}if(lv.geo!=_st.b){i&&draw();gl.bindBuffer(gl.ARRAY_BUFFER,lv.geo=_st.b);${bind};gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,_st._elB)`}}if(shp!=_shp)_shp._setShp();}let b=boundUsed^shuniBind;`+texCheck.join(';')+`;const k=grow(sz),j=k+sz-${attrs}`
	fnBody.push('return k')
	const setVao = (persp=false, off=0,nw=true) => {
		const base = matWidth*(2+persp)
		const stride = (attrs + base) << 2
		gl.vertexAttribPointer(0, matWidth, gl.FLOAT, false, stride, off)
		gl.vertexAttribPointer(1, matWidth, gl.FLOAT, false, stride, off + (matWidth<<2))
		if(persp){
			gl.enableVertexAttribArray(2)
			gl.vertexAttribPointer(2, matWidth, gl.FLOAT, false, stride, off + (matWidth<<3))
		}else gl.disableVertexAttribArray(2)
		for(let i = 0; i < attrs; i += 4){
			const loc = (i>>2)+3
			gl.enableVertexAttribArray(loc)
			gl.vertexAttribIPointer(loc, min(4, attrs-i), gl.UNSIGNED_INT, stride, off + ((i + base) << 2))
			gl.vertexAttribDivisor(loc, 1)
		}
		if(nw){
			gl.enableVertexAttribArray(0)
			gl.enableVertexAttribArray(1)
			gl.vertexAttribDivisor(0, 1)
			gl.vertexAttribDivisor(1, 1)
			gl.vertexAttribDivisor(2, 1)
			for(let i = maxAttribs-1; i >= vlowest; i--)
				gl.enableVertexAttribArray(i)
		}
		return stride>>2
	}
	let shVao = null, shVao3 = null
	if(matWidth<4){
		gl.bindVertexArray(shVao = gl.createVertexArray())
		shVao.geo = null
		setVao(false)
		gl.bindVertexArray(sv = shVao3 = gl.createVertexArray())
		shVao3.geo = null
		setVao(true)
	}
	const s = eval(`let ${matWidth<4?`lv=shVao3`:'__'}${states.length?states.join(''):''};const B=function(){${bindUniTexBody.join(';')};shuniBind=boundUsed},s=function(sz,{${fnParams}}){${fnBody.join(';')}};s.uniforms=(function(${uniFnParams}){${uniFnBody.join(';')};B()});s`), program = gl.createProgram()
	const v=gl.createShader(35633), f=gl.createShader(35632)
	vShaderBody.push('}')
	gl.shaderSource(v, vShaderHead.join('')+vShaderBody.join(''))
	gl.compileShader(v)
	gl.shaderSource(f, fShaderHead.join('')+'\n'+src)
	gl.compileShader(f)
	gl.attachShader(program, v)
	gl.attachShader(program, f)
	if(T=gl.getShaderInfoLog(f)) throw 'GLSL Error:\n'+T
	gl.linkProgram(program)
	if(T=gl.getShaderInfoLog(v)) throw 'GLSL Error:\n'+vShaderHead.join('')+vShaderBody.join('')
	gl.useProgram(program)
	const uniLocs = uniNames.map(n => gl.getUniformLocation(program, n))
	for(let i = 0; i < maxTex; i++)
		gl.uniform1i(gl.getUniformLocation(program, i<fCount?'GL_f['+i+']':'GL_i['+(i-fCount)+']'), i>=fCount?maxTex+i-fCount:i)
	s.vertex = vertex
	s.three = vertex.three
	return sh = s
}
let fdc = 0, fs = 0, fd = 0
$.Shader.UINT = $.Shader(`void main(){color=param0;}`, {params:$.UVEC4, outputs:$.UINT})
$.Shader.BLACK = $.Shader(`void main(){color=vec4(0,0,0,1);}`)
$.Shader.SIMPLE = $.Shader(`void main(){color=param0;}`, {params:[$.VEC4]})
$.Shader.DEFAULT = $.Shader(`void main(){color=param0(pos)*param1;}`, {params:[$.COLOR, $.VEC4], defaults:[void 0, $.vec4.one]})
$.Shader.COLOR_3D_XZ = $.Shader(`void main(){color=param0(pos.xz);}`, {params:[$.COLOR],vertex:Geometry3D.Vertex.DEFAULT})
$.Shader.SHADED_3D = $.Shader(`void main(){color=param0(pos.xy);color.rgb*=1.+dot(normalize(cross(dFdx(pos),dFdy(pos))),param1);}`, {params:[$.COLOR,$.VEC3], defaults:[void 0,vec3(-.15,-.3,0)],vertex:Geometry3D.Vertex.DEFAULT})
let lastClr = 0
const onfl = []
$.onFlush = f => onfl.push(f)
$.flush = () => {
	i&&draw()
	if(pboUsed) pboUsed = false
	else if(lastPbo){
		gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null)
		gl.deleteBuffer(lastPbo)
		lastPbo = null; lastPboSize = -1
	}
	for(let i = 0; i < maxTex<<1; i++){
		const t = bound[i]; if(!t) continue
		gl.activeTexture(gl.TEXTURE0 + i)
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, bound[i] = null)
		t.i = -1
	}
	let now = performance.now()
	if(now-lastClr>1000){
		lastClr = now
		arr = new Float32Array(arr.length>>>1), iarr = new Int32Array(arr.buffer)
	}
	for(const f of onfl) try{f()}catch(e){Promise.reject(e)}
}
const ctx = $.ctx = new Drw2D(curt = {_fb: null, _stencil: 0, _stenBuf: null, w: 0, h: 0, u: 0})
$.setSize = (w = 0, h = 0) => {
	gl.canvas.width = w; gl.canvas.height = h
	ctx.t.w = gl.drawingBufferWidth, ctx.t.h = gl.drawingBufferHeight
	if(curt == ctx.t) curt = lastd = null
	ctx.t._stencil = 0
}
const intvCb = () => {
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
	if(!intv) intv = setInterval(intvCb, 0)
})
let intv = 0
$.loop = render => {
	if('t' in $) return $
	$.frameDrawCalls = 0
	$.frameSprites = 0
	$.frameData = 0
	$.t = performance.now()*.001; $.dt = 0
	$.frameCpu = 0
	$.glLost ??= null
	requestAnimationFrame(function f(){
		requestAnimationFrame(f)
		if(gl.isContextLost()) return $.glLost?.(), $.glLost = fencetail = fencehead = null
		i&&draw()
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = curt = lastd = null)
		ctx.t._stencil = 0
		dt = max(.001, min(-($.t-($.t=performance.now()*.001)), .5))
		ctx.reset()
		try{ render() }finally{
			$.flush()
			$.frameCpu = performance.now()*.001 - $.t
			if(!fdc) $.ctx.clear()
			$.frameDrawCalls = fdc; $.frameSprites = fs; $.frameData = fd*4+fdc*24; fdc = fs = fd = 0
		}
	})
	return $
}
return $}
Object.assign($.Gamma, {
	bitmapOpts: imageBitmapOpts,
	STENCIL: 1, ALPHA_CHANNEL: 2, PREMULTIPLIED_ALPHA: 4, AUTO_CLEAR_BUFFER: 8, MSAA: 16
})}