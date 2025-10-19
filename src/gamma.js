// © 2025 Matthew Reiner. https://github.com/BlobTheKat/gamma
{
const $ = globalThis
Math.PI2 ??= Math.PI*2
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
let pmask = 285217039, sh = null, shfCount = 0, shfMask = 0, shCount = 0
let curfb = null, boundUsed = 0, shuniBind = 0, shpType = 5, shpStart = 0, shpLen = 4, shp = null
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
	FLAT: 64, CW_ONLY: 16, CCW_ONLY: 32,
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
$.vec2.multiply = (a,b) => typeof b=='number'?{x:a.x*b,y:a.y*b}:{x:a.x*b.x,y:a.y*b.y}
$.vec3 = (x=0,y=x,z=x) => ({x,y,z})
$.vec3.one = $.vec3(1); const v3z = $.vec3.zero = $.vec3(0)
$.vec3.add = (a,b) => typeof b=='number'?{x:a.x+b,y:a.y+b,z:a.z+b}:{x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}
$.vec3.multiply = (a,b) => typeof b=='number'?{x:a.x*b,y:a.y*b,z:a.z*b}:{x:a.x*b.x,y:a.y*b.y,z:a.z*b.z}
$.vec4 = (x=0,y=x,z=x,w=x) => ({x,y,z,w})
$.vec4.one = $.vec4(1); const v4z = $.vec4.zero = $.vec4(0)
$.vec4.add = (a,b) => typeof b=='number'?{x:a.x+b,y:a.y+b,z:a.z+b,w:a.w+b}:{x:a.x+b.x,y:a.y+b.y,z:a.z+b.z,w:a.w+b.w}
$.vec4.multiply = (a,b) => typeof b=='number'?{x:a.x*b,y:a.y*b,z:a.z*b,w:a.w*b}:{x:a.x*b.x,y:a.y*b.y,z:a.z*b.z,w:a.w*b.w}

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
	get waiting(){ return !this.t._tex }
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
			gl.texStorage3D(gl.TEXTURE_2D_ARRAY, t.m, t.f[0], t.w = w = 1, t.h = h = 1, t.d)
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
			gl.texStorage3D(gl.TEXTURE_2D_ARRAY, t.m, t.f[0], t.w = w, t.h = h, t.d)
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
			if(curfb != drawfb) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = drawfb), curt=null
			gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, t._tex, dstMip, l)
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
		const {t} = this
		if(t.m<2) return
		Tex.fakeBind(t)
		gl.generateMipmap(gl.TEXTURE_2D_ARRAY)
		if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
	}
}
$.Drawable = (stencil = false) => new Drw2D({ _fb: gl.createFramebuffer(), _stencil: 0, _stenBuf: stencil ? gl.createRenderbuffer() : null, w: 0, h: 0, u: 0 })
$.Drawable.MAX_TARGETS = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)
let arr = new Float32Array(1024), iarr = new Int32Array(arr.buffer), i = 0
$.Texture = (w = 0, h = 0, d = 0, o = 0, f = Formats.RGBA, mips = 0) => {
	const t = { _tex: gl.createTexture(), i: -1, o, f, src: null, w, h, d: +d||1, m: mips = mips || 1 }
	const tx = new Tex(t)
	Tex.setOptions(t)
	if(w && h) gl.texStorage3D(gl.TEXTURE_2D_ARRAY, mips, t.f[0], w, h, t.d)
	else gl.texStorage3D(gl.TEXTURE_2D_ARRAY, mips, t.f[0], t.w = 1, t.h = 1, t.d)
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

class t2D{
	constructor(a=1,b=0,c=0,d=1,e=0,f=0){this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f}
	translate(x=0,y=0){ this.e+=x*this.a+y*this.c;this.f+=x*this.b+y*this.d }
	scale(x=1,y=x){ this.a*=x; this.b*=x; this.c*=y; this.d*=y }
	rotate(r=0){
		const cs = cos(r), sn = sin(r), a=this.a,b=this.b,c=this.c,d=this.d
		this.a=a*cs-c*sn; this.b=b*cs-d*sn
		this.c=a*sn+c*cs; this.d=b*sn+d*cs
	}
	transform(a,b,c,d,e,f){
		if(typeof a=='object')({a,b,c,d,e,f}=a)
		const A=this.a,B=this.b,C=this.c,D=this.d,E=this.e,F=this.f
		this.a = A*a+C*b; this.b = B*a+D*b
		this.c = A*c+C*d; this.d = B*c+D*d
		this.e = A*e+C*f+E; this.f = B*e+D*f+F
	}
	skew(x=0, y=0){
		const ta=this.a,tb=this.b
		this.a+=this.c*y; this.b+=this.d*y
		this.c+=ta*x; this.d+=tb*x
	}
	multiply(x=1, y=0){
		const ta=this.a,tb=this.b
		this.a=ta*x-this.c*y;this.b=tb*x-this.d*y
		this.c=ta*y+this.c*x;this.d=tb*y+this.d*x
	}
	getTransform(){ return {a: this.a, b: this.b, c: this.c, d: this.d, e: this.e, f: this.f} }
	reset(a=1,b=0,c=0,d=1,e=0,f=0){if(typeof a=='object')({a,b,c,d,e,f}=a);this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this._mask=290787599;this._sh=$.Shader.DEFAULT;this._shp=defaultGeo}
	box(x=0,y=0,w=1,h=w){ this.e+=x*this.a+y*this.c; this.f+=x*this.b+y*this.d; this.a*=w; this.b*=w; this.c*=h; this.d*=h }
	to(x=0, y=0){ if(typeof x=='object')({x,y}=x); return {x:this.a*x+this.c*y+this.e,y:this.b*x+this.d*y+this.f}}
	from(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		const a=this.a,b=this.b,c=this.c,d=this.d, det = a*d-b*c
		return {
			x: (x*d - y*c + c*this.f - d*this.e)/det,
			y: (y*a - x*b + b*this.e - a*this.f)/det
		}
	}
	toDelta(dx=0, dy=0){ if(typeof dx=='object')({x:dx,y:dy}=dx); return {x: this.a*dx+this.c*dy, y: this.b*dx+this.d*dy}}
	fromDelta(dx=0, dy=0){
		if(typeof dx=='object')({x:dx,y:dy}=dx)
		const a=this.a,b=this.b,c=this.c,d=this.d, det = a*d-b*c
		return {x: (dx*d-dy*c)/det, y: (dy*a-dx*b)/det}
	}
	determinant(){return this.a*this.d-this.b*this.c}
}

const grow = ArrayBuffer.prototype.transfer ?
	by=>{const j=i;if((i=j+by)>arr.length){arr=new Float32Array(arr.buffer.transfer(i*8)),iarr=new Int32Array(arr.buffer)}return j}
	: by=>{const j=i;if((i=j+by)>arr.length){const oa=arr;(arr=new Float32Array(i*2)).set(oa,0);iarr=new Int32Array(arr.buffer)}return j}
class Drw2D extends t2D{
	constructor(t,m=290787599,sp=defaultGeo,s=$.Shader.DEFAULT,a,b,c,d,e,f){ super(a,b,c,d,e,f); this.t = t; this._mask = m; this._shp = sp; this._sh = s }
	pixelRatio(){return sqrt(abs(this.a*this.d-this.b*this.c)*this.t.w*this.t.h)}
	sub(){ return new Drw2D(this.t,this._mask,this._shp,this._sh,this.a,this.b,this.c,this.d,this.e,this.f) }
	resetTo(m){ this.a=m.a;this.b=m.b;this.c=m.c;this.d=m.d;this.e=m.e;this.f=m.f;this._mask=m._mask;this._sh=m._sh;this._shp=m._shp }
	draw(...values){
		const i = this._sh(6,values)
		arr[i  ] = this.a; arr[i+1] = this.c; arr[i+2] = this.e
		arr[i+3] = this.b; arr[i+4] = this.d; arr[i+5] = this.f
	}
	drawRect(x=0, y=0, w=1, h=1, ...values){
		const i = this._sh(6,values)
		arr[i  ] = this.a*w; arr[i+1] = this.c*h; arr[i+2] = this.e+x*this.a+y*this.c
		arr[i+3] = this.b*w; arr[i+4] = this.d*h; arr[i+5] = this.f+x*this.b+y*this.d
	}
	drawMat(a=1, b=0, c=0, d=1, e=0, f=0, ...values){
		const i = this._sh(6,values)
		const ta=this.a,tb=this.b,tc=this.c,td=this.d,te=this.e,tf=this.f
		arr[i  ] = ta*a+tc*b; arr[i+1] = ta*c+tc*d; arr[i+2] = ta*e+tc*f+te
		arr[i+3] = tb*a+td*b; arr[i+4] = tb*c+td*d; arr[i+5] = tb*e+td*f+tf
	}
	drawv(values){
		const i = this._sh(6,values)
		arr[i  ] = this.a; arr[i+1] = this.c; arr[i+2] = this.e
		arr[i+3] = this.b; arr[i+4] = this.d; arr[i+5] = this.f
	}
	drawRectv(x=0, y=0, w=1, h=1, values){
		const i = this._sh(6,values)
		arr[i  ] = this.a*w; arr[i+1] = this.c*h; arr[i+2] = this.e+x*this.a+y*this.c
		arr[i+3] = this.b*w; arr[i+4] = this.d*h; arr[i+5] = this.f+x*this.b+y*this.d
	}
	drawMatv(a=1, b=0, c=0, d=1, e=0, f=0, values){
		const i = this._sh(6,values)
		const ta=this.a,tb=this.b,tc=this.c,td=this.d,te=this.e,tf=this.f
		arr[i  ] = ta*a+tc*b; arr[i+1] = ta*c+tc*d; arr[i+2] = ta*e+tc*f+te
		arr[i+3] = tb*a+td*b; arr[i+4] = tb*c+td*d; arr[i+5] = tb*e+td*f+tf
	}
}
const x = Object.getOwnPropertyDescriptors({
	set shader(sh){ this._sh=typeof sh=='function'?sh:$.Shader.DEFAULT },
	get shader(){ return this._sh },
	get width(){ return this.t.w },
	get height(){ return this.t.h },
	get identity(){ return this.t },
	set mask(m){ this._mask=this._mask&-256|m&255; if(lastd == this) lastd = null },
	get mask(){ return this._mask&255 },
	set blend(b){ this._mask=this._mask&255|(b||1135889)<<8; if(lastd == this) lastd = null },
	get blend(){ return this._mask>>8 },
	get geometry(){ return this._shp },
	set geometry(a){ this._shp = a||defaultGeo; if(lastd == this) lastd = null },
	_setv(){
		if(lastd == this) return false
		const {t, _mask: m} = this, s = t._stencil
		let d = pmask^m
		if(curt!=t){
			i&&draw()
			if(curt&&curt._stencil!=t._stencil) d|=240
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
		if(curfb != t._fb) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._fb), curt=null
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
		if(curfb != t._fb) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._fb), curt=null
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
			if(curfb != t._fb) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._fb), curt=null
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
	}
})
Object.defineProperties(Drw2D.prototype, x)

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
	gl.drawArraysInstanced(shpType, shpStart, shpLen, i)
	i = 0; boundUsed = b
	if(pendingFences.length){ fencetail ??= pendingFences[0]; for(const f of pendingFences){
		f.sync = gl.fenceSync(37143,0)
		fencehead = fencehead ? fencehead.next = f : f
	} pendingFences.length = 0 }
}

const switcher = (f,s,e) => {
	let m = 'switch(u){'
	while(s<e) m += `case ${s}:${f(s++)}`
	return m+'}'
}
const names = ['float','vec2','vec3','vec4','int','ivec2','ivec3','ivec4','uint','uvec2','uvec3','uvec4']
const maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
function switchShader(s, fc, fm, c){ sh = s; shfCount = fc; shfMask = fm; shCount = c }
function setShp(s){ i&&draw(); shp = s; shpType = s.type; shpStart = s.start; shpLen = min(s.length, s.t._size-s.start) }
const f4arr = new Float32Array(4), i4arr = new Int32Array(f4arr.buffer)
// TODO: vao on Shader
// Maybe vao on geometry
// Shader.supports({})
// Code generation bullshit GO!
const vfgen = (three, vparams, _defaults = []) => {
	vparams = typeof vparams=='number' ? [vparams] : vparams || []
	let id = 0
	const fShaderHead = [], vShaderHead = [], vShaderBody = []
	const vFnParams = [], vFnBody = ['']
	let vattrs = 2+three, flatvarys = 0, lerpvarys = 2+three, _vcount = 2+three
	for(const t of vparams){
		const sz = (t&3)+1, n = names[t&3|(t>>4&15)<<2], flat = t>15
		if((t&15)>=12)
			throw 'Vertex parameter cannot be a texture'
		_defaults[id] ??= sz==1?0:sz==2?v2z:sz==3?v3z:v4z
		vFnParams.push(`${id}:a${id}=_defaults[${id}]`)
		const A = t>13?'iarr[i+':'arr[i+'
		if(sz==1) vFnBody.push(A+_vcount+']=a'+id)
		else for(let j=0;j<sz;j++) fnBody.push(A+(_vcount+j)+']=a'+id+'.'+'xyzw'[j])
		const vid = ''+(vattrs>>2)
		const oStart = vattrs&3, oEnd = ((vattrs += sz)&3)||4
		let vvarys = flat ? flatvarys : lerpvarys
		const vStart = vvarys&3, vEnd = ((vvarys += sz)&3)||4
		if(flat) flatvarys = vvarys; else lerpvarys = vvarys
		let nm = ''
		if(oEnd <= oStart){
			const id1 = ''+(vattrs>>2)
			vShaderHead.push(`layout(location=${maxAttribs-1-(vattrs>>2)})in uvec4 o${id1};`)
			nm = `uvec${sz}(o${vid}.`
			for(let i = oStart; i < 4; i++) nm += 'xyzw'[i]
			nm += `,o${id1}.`
			for(let i = 0; i < oEnd; i++) nm += 'xyzw'[i]
			nm += ')'
		}else{
			if(oEnd==4&&oStart==0) nm = 'v' + vid
			else{
				nm = `o${vid}.`
				for(let i = oStart; i < oEnd; i++) nm += 'xyzw'[i]
			}
		}
		if(t<16) nm = `uintBitsToFloat(${nm})`
		else if(t<32) nm = `${n}(${nm})`
		const start = `GL_${flat?'V':'v'}${vid}.`
		if(vEnd <= vStart){
			const name1 = (flat?'GL_V':'GL_v')+(vvarys>>2)
			vShaderHead.push(`${flat?'flat out u':'centroid out '}vec4 ${name1};`)
			fShaderHead.push(`${flat?'flat in u':'centroid in '}vec4 ${name1};\n#define vparam${vid} ${flat?'u':''}vec4(${start+'xyzw'.slice(vStart)},${start+'xyzw'.slice(0, vEnd)})\n`)
			vShaderBody.push(`${n} t${id}=${nm};${start+'xyzw'.slice(vStart,vEnd)}=t${id}.${'xyzw'.slice(0, 4-vStart)};${name1}.${'xyzw'.slice(0, vEnd)}=t${id}.${'xyzw'.slice(4-vStart,sz)};`)
		}else{
			fShaderHead.push(`\n#define vparam${vid} ${start + 'xyzw'.slice(vStart, vEnd)}\n`)
			vShaderBody.push(`${start+'xyzw'.slice(vStart,vEnd)}=${nm};`)
		}
		_vcount += sz
		id++
	}
	vFnBody[0] = `let{i,arr,iarr}=this;if((this.i=i+${_vcount})>arr.length){${ArrayBuffer.prototype.transfer ? `arr=this.arr=new Float32Array(arr.buffer.transfer(i+${_vcount}<<3))` : `const oa=arr;arr=this.arr=new Float32Array(i+${_vcount}<<1);arr.set(oa,0)`};iarr=this.iarr=new Int32Array(arr.buffer)}`
	vFnBody.push('return i')
	if(flatvarys) vShaderBody.push(`flat out uvec4 GL_V0;`), fShaderHead.push(`flat in uvec4 GL_V0;`)
	const _pack = eval(`(function({${vFnParams}}){${vFnBody.join(';')}})`)
	return {three, _pack, _vcount, fsh: fShaderHead.join(''), vsh: vShaderHead.join(''), vshb: vShaderBody.join('')}
}
class Geo2D extends t2D{
	get size(){ return this.t._size }
	constructor(t,s=0,l=0,tp=5,a=1,b=0,c=0,d=1,e=0,f=0){ super(a,b,c,d,e,f); this.t = t; this.start = s; this.length = l; this.type = tp; this.B = this.t.b }
	get end(){ return this.start + this.length }
	set end(a){ a >>>= 0; if(a >= this.start) this.length = a - this.start; else this.length = this.start - a, this.start = a }
	sub(type = this.type, start = this.t._size, length = 0){ return new Geo2D(this.t, start, length, type, this.a, this.b, this.c, this.d, this.e, this.f) }
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
	upload(){
		const {t} = this
		gl.bindBuffer(gl.ARRAY_BUFFER, t.b)
		gl.bufferData(gl.ARRAY_BUFFER, t.iarr.subarray(0, t.i), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, buf)
	}
}
$.Geometry2D = (v = null, type=5) => {
	if(typeof v == 'number') type = v, v = null
	const {_pack, _vcount} = v ?? $.Geometry2D.DEFAULT_VERTEX
	const arr = new Float32Array(16)
	return new Geo2D({arr, iarr: new Int32Array(arr.buffer), i: 0, b: gl.createBuffer(), _pack, _vcount, _size: 0, L: null, v: null},0,Infinity,type)
}
$.Geometry3D = (v = null, type=5) => {
	if(typeof v == 'number') type = v, v = null
	const {_pack, _vcount} = v ?? $.Geometry3D.DEFAULT_VERTEX
	const arr = new Float32Array(16)
	return new Geo3D({arr, iarr: new Int32Array(arr.buffer), i: 0, b: gl.createBuffer(), _pack, _vcount, _size: 0, L: null, v: null},0,Infinity,type)
}

$.Geometry2D.Vertex = vfgen.bind(null, false)
$.Geometry3D.Vertex = vfgen.bind(null, true)
$.Geometry3D.DEFAULT_VERTEX = vfgen(true, [])
const defaultGeo = $.Geometry2D.SQUARE = $.Geometry2D($.Geometry2D.DEFAULT_VERTEX = vfgen(false, []))
defaultGeo.type = 5
defaultGeo.addPoint(0, 0)
defaultGeo.addPoint(0, 1)
defaultGeo.addPoint(1, 0)
defaultGeo.addPoint(1, 1)
defaultGeo.upload()

$.Shader = (src, {params, defaults: _defaults, uniforms, uniformDefaults: _uDefaults, outputs=4, vertex = $.Geometry2D.DEFAULT_VERTEX, intFrac=0.5}={}) => {
	params = typeof params=='number' ? [params] : params || []
	uniforms = typeof uniforms=='number' ? [uniforms] : uniforms || []
	_defaults = _defaults !== undefined ? Array.isArray(_defaults) ? [..._defaults] : [_defaults] : []
	_uDefaults = _uDefaults !== undefined ? Array.isArray(_uDefaults) ? [..._uDefaults] : [_uDefaults] : []
	outputs = typeof outputs=='number' ? [outputs] : outputs || []
	if(outputs.length > Drawable.MAX_TARGETS) throw `Too many shader outputs (Drawable.MAX_TARGETS == ${Drawable.MAX_TARGETS})`
	const matWidth = 3+vertex.three
	const fnParams = [], fnBody = [''], vShaderHead = [`#version 300 es\nprecision highp float;precision highp int;layout(location=0)in mat3x${matWidth} m;layout(location=${maxAttribs-1})in uvec4 o0;out vec4 GL_v0;`], vShaderBody = [`void main(){gl_PointSize=1.;gl_Position.z=0.;gl_Position.xyw=vec${matWidth}(GL_v0.xy${vertex.three?'z':''}=uintBitsToFloat(o0.xy${vertex.three?'z':''}),1.)*m;gl_Position.xy=gl_Position.xy*2.-1.;`], fShaderHead = ['#version 300 es\nprecision highp float;precision highp int;in vec4 GL_v0;\n#define color color0\n#define pos GL_v0.xyz\n'+outputs.map((o,i) => `layout(location=${i})out ${!o?'':o==16||o==32?'u':'lowp '}vec4 color${i};`).join(';'),'']
	let used = 0, fCount = 0, iCount = 0, attrs = 0
	const texCheck = []
	const addAttr = (sz=0) => {
		const id = ''+(attrs>>2)
		const oStart = attrs&3, oEnd = ((attrs += sz)&3)||4
		if(oEnd <= oStart){
			const id1 = ''+(attrs>>2)
			vShaderHead.push(`layout(location=${(attrs>>2)+3})in uvec4 a${id1};flat out uvec4 GL_a${id1};`)
			fShaderHead.push(`flat in uvec4 GL_a${id1};`)
			vShaderBody.push(`GL_a${id1}=a${id1};`)
			let nm = `uvec${sz}(GL_a${id}.`
			for(let i = oStart; i < 4; i++) nm += 'xyzw'[i]
			nm += `,GL_a${id1}.`
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
			fShaderHead.push(`uniform int uni${id};`)
			uniFnBody.push(`s${states.length}=a${id}.t`)
			states.push(`,s${states.length}=null`)
		}else if(t>=12&&t<16){
			const v = 'GL_u'+id, v2 = 'GL_U'+id
			bindUniTexBody.push(`gl.uniform1i(uniLocs[${uniNames.length}],(s${states.length}?Tex.auto(s${states.length},${-(t>13)}):-1)|s${states.length+1})`)
			fShaderHead.push(t>13?`uniform int ${v};uniform uvec4 ${v2}; ${t==14?'i':'u'}vec4 uni${id}(vec2 uv){if(${v}<0)return ${t==14?`ivec4(${v2})`:v2};return ${t==14?'i':'u'}GetColor(${v}&255,vec3(uv*uintBitsToFloat(${v2}.zw)+uintBitsToFloat(${v2}.xy),${v}>>8));}`:`uniform int ${v};uniform vec4 ${v2}; ${t==12?'lowp ':''}vec4 uni${id}(vec2 uv){if(${v}<0)return ${v2};return fGetColor(${v}&255,vec3(uv*${v2}.zw+${v2}.xy,${v}>>8));}`)
			uniFnBody.push(`if(s${states.length}=a${id}.t){s${states.length+1}=a${id}.l<<8;${t>13?`f4arr[0]=a${id}.x,f4arr[1]=a${id}.y,f4arr[2]=a${id}.w,f4arr[3]=a${id}.h;gl.uniform4ui`:'gl.uniform4f'}(uniLocs[${uniNames.length-1}],${t>13?`i4arr[0],i4arr[1],i4arr[2],i4arr[3]`:`a${id}.x,a${id}.y,a${id}.w,a${id}.h`})}else gl.uniform4${t>13?'ui':'f'}(uniLocs[${uniNames.length-1}],a${id}.x,a${id}.y,a${id}.z,a${id}.w)`)
			uniNames.push(v, v2)
			states.push(`,s${states.length}=null,s${states.length+1}=0`)
		}else{
			fShaderHead.push(`uniform ${names[t&3|t>>4<<2]} uni${id};`)
			let args = `gl.uniform${c+(t<16?'f':t<32?'i':'ui')}(uniLocs[${uniNames.length}]`
			uniNames.push('uni'+id)
			if(c==1) args += ',a'+id
			else for(let j=0;j<c;j++) args += ',a'+id+'.'+'xyzw'[j]
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
	let T = null, head = ''
	// any tex
	if(used&15) head += `uniform ${used&2?'highp':'lowp'} sampler2DArray GL_f[${fCount}];\
ivec3 getSize(int u,int l){${switcher(i=>`return textureSize(GL_${i<fCount?'f['+i:'i['+(i-fCount)}],l);`,0,maxTex)}}`
	// any int tex
	if(used&12) head += `uniform highp usampler2DArray GL_i[${iCount}];\
uvec4 uGetColor(int u,vec3 p){${switcher(i=>`return texture(GL_i[${i-maxTex}],p);`,maxTex,2*maxTex-fCount)}}\
uvec4 uGetPixel(int u,ivec3 p,int l){${switcher(i=>`return texelFetch(GL_i[${i-maxTex}],p,l);`,maxTex,2*maxTex-fCount)}}\
\n#define iGetColor(a,b) ivec4(uGetColor(a,b))\n#define iGetPixel(a,b,c) ivec4(uGetPixel(a,b,c))\n`
	// Any float texture
	if(used&3) head += `vec4 fGetColor(int u,vec3 p){${switcher(i=>`return texture(GL_f[${i}],p);`,0,fCount)}}lowp vec4 GL_lp(vec4 x){return x;}\
vec4 fGetPixel(int u,ivec3 p,int l){${T||switcher(i=>`return texelFetch(GL_f[${i}],p,l);`,0,fCount)}}\
\n#define getColor(a,b)GL_lp(fGetColor(a,b))\n#define getPixel(a,b,c)GL_lp(fGetPixel(a,b,c))\n`
	fShaderHead[1] = head
	const fMask = 32-fCount&&(-1>>>fCount)
	uniFnBody[0] = `i&&draw(0);if(sh!=s){gl.useProgram(program);switchShader(s,${fCount},${fMask},${matWidth > 3 ? attrs+12 : `lv==shVao3?${attrs+9}:${attrs+6}`})}`
	fnBody[0] = `sz+=${attrs};if(this._setv()){const sd=sh!=s;if(sd||sz!=shCount){i&&draw(0);switchShader(s,${fCount},${fMask},sz);if(sd){gl.useProgram(program);B()};${matWidth>3?'}if(s!=this._shp.t.L){/*TODO*/}':`gl.bindVertexArray(lv=sz>${8+attrs}?shVao3:shVao)}else if(lv!=(lv=sz>${8+attrs}?shVao3:shVao)){gl.bindVertexArray(lv)};if(lv.geo!=this._shp.B){gl.bindBuffer(34962,lv.geo=this._shp.B);`}${
		vlowest==maxAttribs-1?`gl.vertexAttribIPointer(${vlowest},${vertex._vcount&3},gl.UNSIGNED_INT,${vertex._vcount<<2},0)`:`for(let i=${maxAttribs-1},j=0;i>=${vlowest};i--,j+=16){gl.vertexAttribIPointer(i,i==${vlowest}?${vertex._vcount&3}:4,gl.UNSIGNED_INT,${vertex._vcount<<2},j)`
	};gl.bindBuffer(34962,buf)}if(shp!=this._shp)setShp(this._shp);}let b=boundUsed^shuniBind;`+texCheck.join(';')+`;const k=grow(sz),j=k+sz-${attrs}`
	fnBody.push('return k')
	const setVao = (proj, off=0) => {
		const base = matWidth*(2+proj)
		const stride = (attrs + base) << 2
		for(let loc = 1+proj; loc >= 0; loc--){
			gl.enableVertexAttribArray(loc)
			gl.vertexAttribPointer(loc, matWidth, gl.FLOAT, false, stride, off + loc * (matWidth<<2))
			gl.vertexAttribDivisor(loc, 1)
		}
		if(!proj){
			if(matWidth == 3) gl.vertexAttrib3f(2, 0, 0, 1)
			else gl.vertexAttrib4f(2, 0, 0, 0, 1)
		}
		for(let i = 0; i < attrs; i += 4){
			const loc = (i>>2)+3
			gl.enableVertexAttribArray(loc)
			gl.vertexAttribIPointer(loc, min(4, attrs-i), gl.UNSIGNED_INT, stride, off + ((i + base) << 2))
			gl.vertexAttribDivisor(loc, 1)
		}
		for(let i = maxAttribs-1; i >= vlowest; i--)
			gl.enableVertexAttribArray(i)
		return stride>>2
	}
	let shVao = null, shVao3 = null
	if(matWidth<4){
		gl.bindVertexArray(shVao = gl.createVertexArray())
		shVao.geo = null
		setVao(false)
		gl.bindVertexArray(shVao3 = gl.createVertexArray())
		shVao3.geo = null
		setVao(true)
	}
	const s = eval(`let ${matWidth<4?`lv=shVao3`:'_'}${states.length?states.join(''):''};const B=function(){${bindUniTexBody.join(';')};shuniBind=boundUsed},s=function(sz,{${fnParams}}){${fnBody.join(';')}};s.uniforms=(function(${uniFnParams}){${uniFnBody.join(';')};B()});s`), program = gl.createProgram()
	const v=gl.createShader(35633), f=gl.createShader(35632)
	vShaderBody.push('}')
	if(attrs) vShaderHead[0]+='layout(location=3)in uvec4 a0;flat out uvec4 GL_a0;', vShaderBody[0]+='GL_a0=a0;', fShaderHead[0]+='flat in uvec4 GL_a0;'
	gl.shaderSource(v, vShaderHead.join('')+vShaderBody.join(''))
	gl.compileShader(v)
	gl.shaderSource(f, fShaderHead.join('')+'\n'+src)
	gl.compileShader(f)
	gl.attachShader(program, v)
	gl.attachShader(program, f)
	if(T=gl.getShaderInfoLog(f)) console.warn('GLSL Error:\n'+T)
	else gl.linkProgram(program)
	gl.useProgram(program)
	const uniLocs = uniNames.map(n => gl.getUniformLocation(program, n))
	for(let i = 0; i < maxTex; i++)
		gl.uniform1i(gl.getUniformLocation(program, i<fCount?'GL_f['+i+']':'GL_i['+(i-fCount)+']'), i>=fCount?maxTex+i-fCount:i)
	s.vertex = vertex
	s.three = vertex.three
	const c = s._count = attrs + matWidth*2
	s._countp = shCount = c + matWidth
	return sh = s
}
let fdc = 0, fs = 0, fd = 0
$.Shader.UINT = $.Shader(`void main(){color=param0;}`, {params:$.UVEC4, outputs:$.UINT})
$.Shader.BLACK = $.Shader(`void main(){color=vec4(0,0,0,1);}`)
$.Shader.DEFAULT = $.Shader(`void main(){color=param0(pos.xy)*param1;}`, {params:[$.COLOR, $.VEC4], defaults:[void 0, $.vec4.one]})
let lastClr = 0
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
}
const ctx = $.ctx = new Drw2D(curt = {_fb: null, _stencil: 0, _stenBuf: null, w: 0, h: 0, u: 0})
$.setSize = (w = 0, h = 0) => {
	gl.canvas.width = w; gl.canvas.height = h
	ctx.t.w = gl.drawingBufferWidth, ctx.t.h = gl.drawingBufferHeight
	if(curt==ctx.t) curt = null
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
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = curt = null)
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