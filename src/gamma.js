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
let pmask = 285217039, sh = null, shfCount = 0, shfMask = 0
let curfb = null, boundUsed = 0, shuniBind = 0, shpType = gl.TRIANGLE_STRIP, shpStart = 0, shpLen = 4, shp = null
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
	TEXTURE: 20, UTEXTURE: 24, FTEXTURE: 28,
	COLOR: 4, UCOLOR: 8, FCOLOR: 12,
	FIXED: 4,
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
class img{
	get isInteger(){ return this.t.f.length>3 }
	get format(){ return this.t.f }
	get width(){ return this.t.w }
	get height(){ return this.t.h }
	get layers(){ return this.t.d }
	get mipmaps(){ return this.t.m }
	get subWidth(){ return this.t.w*this.w }
	get subHeight(){ return this.t.h*this.h }
	get aspectRatio(){ return this.t.w*this.w / (this.t.h*this.h) }
	constructor(t,x=0,y=0,w=1,h=1,l=0){
		this.t = t; this.x = x; this.y = y
		this.w = w; this.h = h; this.l = l
	}
	get loaded(){ return !this.t.src }
	get waiting(){ return !this.t._tex }
	get then(){ return this.t.src ? this.#then : null }
	load(){ if(!this.t._tex) img.load(this.t) }
	sub(x=0, y=0, w=1, h=1, l=this.l){
		return new img(this.t, this.x+x*this.w, this.y+y*this.h, this.w*w, this.h*h, l)
	}
	super(x=0, y=0, w=1, h=1, l=this.l){
		const tw = this.w/w, th = this.h/h
		return new img(this.t, this.x-x*tw, this.y-y*th, tw, th, l)
	}
	crop(x=0, y=0, w=0, h=0, l=this.l){
		const {t,x:ox,y:oy,h:oh} = this
		if(!t.src) return new img(t, ox+x/t.w, oy+oh-(y+h)/t.h, w/t.w, h/t.h, l)
		const i = new img(t, 0, 0, 0, 0, l)
		if(!t._tex) img.load(t)
		t.src.push(i => {
			i.x = ox+x/t.w
			i.y = oy+oh-(y+h)/t.h
			i.w = w/t.w; i.h = h/t.h
		}, undefined, i)
		return i
	}
	layer(l = this.l){ return new img(this.t, this.x, this.y, this.w, this.h, l) }
	#then(r, j){
		if(typeof r != 'function') r = Function.prototype
		if(!this.t.src) return void r(this)
		if(!this.t._tex) img.load(this.t)
		this.t.src.push(r, j, this)
	}
	static load(t){
		let src = t.src, loaded = 0
		t.src = []
		let w = 0, h = 0
		t._tex = gl.createTexture()
		const reject = () => {
			loaded = -1
			img.setOptions(t)
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
			img.setOptions(t)
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
		if(!(tex instanceof img)) return resolveData(tex, i => {
			img.fakeBind(t)
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
		img.fakeBind(t)
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
		img.fakeBind(t)
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
		if(!t._tex) img.load(t)
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
		img.fakeBind(t)
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
		img.setOptions(t)
		if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
	}
	setMipmapRange(s=0, e=65535){
		const {t} = this
		if(t.src) return
		img.fakeBind(t)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_LOD, s)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAX_LOD, e)
		if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
	}
	genMipmaps(){
		const {t} = this
		if(t.m<2) return
		img.fakeBind(t)
		gl.generateMipmap(gl.TEXTURE_2D_ARRAY)
		if(t.i < 0) gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
	}
}
$.Drawable = (stencil = false) => new drw({ _tex: gl.createFramebuffer(), _stencil: 0, _stenBuf: stencil ? gl.createRenderbuffer() : null, w: 0, h: 0, u: 0 })
$.Drawable.MAX_TARGETS = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)
let arr = new Float32Array(1024), iarr = new Int32Array(arr.buffer), i = 0
$.Texture = (w = 0, h = 0, d = 0, o = 0, f = Formats.RGBA, mips = 0) => {
	const t = { _tex: gl.createTexture(), i: -1, o, f, src: null, w, h, d: +d||1, m: mips = mips || 1 }
	const tx = new img(t)
	img.setOptions(t)
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
$.Texture.from = (src, o = 0, fmt = Formats.RGBA, mips = 0) => new img({
	_tex: null, i: -1, o, f:fmt, src: src ? Array.isArray(src) ? src : [src] : [],
	w: 0, h: 0, d: src ? Array.isArray(src) ? src.length : 1 : 0, m: mips||1
})

const grow = ArrayBuffer.prototype.transfer ?
	by=>{const j=i;if((i=j+by)>arr.length){arr=new Float32Array(arr.buffer.transfer(i*8)),iarr=new Int32Array(arr.buffer)}return j}
	: by=>{const j=i;if((i=j+by)>arr.length){const oa=arr;(arr=new Float32Array(i*2)).set(oa,0);iarr=new Int32Array(arr.buffer)}return j}
class drw0{
	t;s;_mask=0
	get width(){ return this.t.w }
	get height(){ return this.t.h }
	set mask(m){this._mask=this._mask&-256|m&255}
	get mask(){return this._mask&255}
	set blend(b){this._mask=this._mask&255|(b||1135889)<<8}
	get blend(){return this._mask>>8}
	get geometry(){return this._shp}
	set geometry(a){this._shp=a||defaultShape}
	constructor(t,m=290787599,sp=defaultShape){this.t=t;this._mask=m;this._shp=sp}
	setTarget(id=0, tex=null, l=0, mip=0){
		const {t} = this
		if(!t._tex) return
		i&&draw()
		if(curfb != t._tex) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._tex), curt=null
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
	}
	clearTargets(){
		const {t} = this
		if(!t._tex) return
		i&&draw()
		let u = t.u
		t.u = t.w = t.h = 0
		if(t._stenBuf){
			gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, null)
			gl.deleteRenderbuffer(t._stenBuf)
			t._stenBuf = gl.createRenderbuffer()
		}
		if(!u) return
		if(curfb != t._tex) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._tex), curt=null
		while(u){
			const id = 31-clz32(u)
			u &= ~(1<<id)
			gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + id, gl.RENDERBUFFER, null)
		}
	}
	get hasStencil(){ return this.t._tex ? !!this.t._stenBuf : !!(flags&1) }
	set hasStencil(s){
		let {t} = this, b = t._stenBuf
		if(!t._tex || !s==!b) return
		i&&draw()
		t._stenBuf = b = !b ? gl.createRenderbuffer() : (gl.deleteRenderbuffer(b), null)
		if(t.w){
			if(curfb != t._tex) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._tex), curt=null
			if(b){
				gl.bindRenderbuffer(gl.RENDERBUFFER, b)
				gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, t.w, t.h)
				gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, b)
			}else{
				gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, null)
			}
		}
	}
	clear(r = 0, g = r, b = r, a = g){
		if(typeof r=='object')a=r.w??0,b=r.z??0,g=r.y,r=r.x
		i&&draw()
		setv(this.t, this._mask)
		gl.clearColor(r, g, b, a)
		const q = this.t._stencil=this.t._stencil+1&7
		gl.clear(q?16384:(gl.stencilMask(255), 17408))
		fdc++
		gl.disable(2960); pmask &= -241
	}
	clearStencil(){
		i&&draw()
		setv(this.t, this._mask)
		const q = this.t._stencil=this.t._stencil+1&7
		if(!q) gl.stencilMask(255), gl.clear(1024)
		gl.disable(2960); pmask &= -241
	}
}
class drw extends drw0{
	#a; #b; #c; #d; #e; #f; #sh
	set shader(sh){ this.#sh=typeof sh=='function'?sh:$.Shader.DEFAULT }
	get shader(){return this.#sh}
	constructor(t,m=290787599,sp=defaultShape,s=$.Shader.DEFAULT,a=1,b=0,c=0,d=1,e=0,f=0){super(t,m,sp);this.#sh=s;this.#a=a;this.#b=b;this.#c=c;this.#d=d;this.#e=e;this.#f=f}
	translate(x=0,y=0){ this.#e+=x*this.#a+y*this.#c;this.#f+=x*this.#b+y*this.#d }
	scale(x=1,y=x){ this.#a*=x; this.#b*=x; this.#c*=y; this.#d*=y }
	rotate(r=0){
		const cs = cos(r), sn = sin(r), a=this.#a,b=this.#b,c=this.#c,d=this.#d
		this.#a=a*cs-c*sn; this.#b=b*cs-d*sn
		this.#c=a*sn+c*cs; this.#d=b*sn+d*cs
	}
	transform(a,b,c,d,e,f){
		if(typeof a=='object')({a,b,c,d,e,f}=a)
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
	reset(a=1,b=0,c=0,d=1,e=0,f=0){if(typeof a=='object')({a,b,c,d,e,f}=a);this.#a=a;this.#b=b;this.#c=c;this.#d=d;this.#e=e;this.#f=f;this._mask=290787599;this.#sh=$.Shader.DEFAULT;this._shp=defaultShape}
	box(x=0,y=0,w=1,h=w){ this.#e+=x*this.#a+y*this.#c; this.#f+=x*this.#b+y*this.#d; this.#a*=w; this.#b*=w; this.#c*=h; this.#d*=h }
	to(x=0, y=0){ if(typeof x=='object')({x,y}=x); return {x:this.#a*x+this.#c*y+this.#e,y:this.#b*x+this.#d*y+this.#f}}
	from(x=0, y=0){
		if(typeof x=='object')({x,y}=x)
		const a=this.#a,b=this.#b,c=this.#c,d=this.#d, det = a*d-b*c
		return {
			x: (x*d - y*c + c*this.#f - d*this.#e)/det,
			y: (y*a - x*b + b*this.#e - a*this.#f)/det
		}
	}
	toDelta(dx=0, dy=0){ if(typeof dx=='object')({x:dx,y:dy}=dx); return {x: this.#a*dx+this.#c*dy, y: this.#b*dx+this.#d*dy}}
	fromDelta(dx=0, dy=0){
		if(typeof dx=='object')({x:dx,y:dy}=dx)
		const a=this.#a,b=this.#b,c=this.#c,d=this.#d, det = a*d-b*c
		return {x: (dx*d-dy*c)/det, y: (dy*a-dx*b)/det}
	}
	determinant(){return this.#a*this.#d-this.#b*this.#c}
	pixelRatio(){return sqrt(abs(this.#a*this.#d-this.#b*this.#c)*this.t.w*this.t.h)}
	sub(){ return new drw(this.t,this._mask,this._shp,this.#sh,this.#a,this.#b,this.#c,this.#d,this.#e,this.#f) }
	resetTo(m){ this.#a=m.#a;this.#b=m.#b;this.#c=m.#c;this.#d=m.#d;this.#e=m.#e;this.#f=m.#f;this._mask=m._mask;this.#sh=m.#sh;this._shp=m._shp }
	draw(...values){
		const i = this.#sh(values)
		arr[i  ] = this.#a; arr[i+1] = this.#c; arr[i+2] = this.#e
		arr[i+3] = this.#b; arr[i+4] = this.#d; arr[i+5] = this.#f
	}
	drawRect(x=0, y=0, w=1, h=1, ...values){
		const i = this.#sh(values)
		arr[i  ] = this.#a*w; arr[i+1] = this.#c*h; arr[i+2] = this.#e+x*this.#a+y*this.#c
		arr[i+3] = this.#b*w; arr[i+4] = this.#d*h; arr[i+5] = this.#f+x*this.#b+y*this.#d
	}
	drawMat(a=1, b=0, c=0, d=1, e=0, f=0, ...values){
		const i = this.#sh(values)
		const ta=this.#a,tb=this.#b,tc=this.#c,td=this.#d,te=this.#e,tf=this.#f
		arr[i  ] = ta*a+tc*b; arr[i+1] = ta*c+tc*d; arr[i+2] = ta*e+tc*f+te
		arr[i+3] = tb*a+td*b; arr[i+4] = tb*c+td*d; arr[i+5] = tb*e+td*f+tf
	}
	drawv(values){
		const i = this.#sh(values)
		arr[i  ] = this.#a; arr[i+1] = this.#c; arr[i+2] = this.#e
		arr[i+3] = this.#b; arr[i+4] = this.#d; arr[i+5] = this.#f
	}
	drawRectv(x=0, y=0, w=1, h=1, values){
		const i = this.#sh(values)
		arr[i  ] = this.#a*w; arr[i+1] = this.#c*h; arr[i+2] = this.#e+x*this.#a+y*this.#c
		arr[i+3] = this.#b*w; arr[i+4] = this.#d*h; arr[i+5] = this.#f+x*this.#b+y*this.#d
	}
	drawMatv(a=1, b=0, c=0, d=1, e=0, f=0, values){
		const i = this.#sh(values)
		const ta=this.#a,tb=this.#b,tc=this.#c,td=this.#d,te=this.#e,tf=this.#f
		arr[i  ] = ta*a+tc*b; arr[i+1] = ta*c+tc*d; arr[i+2] = ta*e+tc*f+te
		arr[i+3] = tb*a+td*b; arr[i+4] = tb*c+td*d; arr[i+5] = tb*e+td*f+tf
	}
	dup(){
		if(!i) return
		const s = sh.count, j = grow(s)
		for(let k=j-s;k<j;k++)iarr[k+s]=iarr[k]
		arr[j  ] = this.#a; arr[j+1] = this.#c; arr[j+2] = this.#e
		arr[j+3] = this.#b; arr[j+4] = this.#d; arr[j+5] = this.#f
	}
	dupRect(x=0, y=0, w=1, h=1){
		if(!i) return
		const s = sh.count, j = grow(s)
		for(let k=j-s;k<j;k++)iarr[k+s]=iarr[k]
		arr[j  ] = this.#a*w; arr[j+1] = this.#c*h; arr[j+2] = this.#e+x*this.#a+y*this.#c
		arr[j+3] = this.#b*w; arr[j+4] = this.#d*h; arr[j+5] = this.#f+x*this.#b+y*this.#d
	}
	dupMat(a=1, b=0, c=0, d=1, e=0, f=0){
		if(!i) return
		const s = sh.count, j = grow(s)
		for(let k=j-s;k<j;k++)iarr[k+s]=iarr[k]
		const ta=this.#a,tb=this.#b,tc=this.#c,td=this.#d,te=this.#e,tf=this.#f
		arr[j  ] = ta*a+tc*b; arr[j+1] = ta*c+tc*d; arr[j+2] = ta*e+tc*f+te
		arr[j+3] = tb*a+td*b; arr[j+4] = tb*c+td*d; arr[j+5] = tb*e+td*f+tf
	}
}

Object.assign($.Blend = (src = 17, combine = 17, dst = 0, a2c = false) => src|dst<<8|combine<<16|a2c<<23, {
	REPLACE: 1114129,
	DEFAULT: 1135889,
	ADD: 1118465,
	MULTIPLY: 1122816,
	SUBTRACT: 5574913,
	REVERSE_SUBTRACT: 7737601,
	MIN: 2232593, MAX: 3346705,
	BEHIND: 1118583,
	INVERT: 1127321
})
function setv(t,m){
	const s = t._stencil
	let d = pmask^m
	if(curt!=t){
		i&&draw()
		if(curt&&curt._stencil!=t._stencil) d|=240
		if(curfb != t._tex) gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, curfb = t._tex)
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
}
function draw(b = shuniBind){
	gl.bufferData(gl.ARRAY_BUFFER, iarr.subarray(0, i), 35040)
	fd += i; i /= sh.count; fdc++; fs += i
	gl.drawArraysInstanced(shpType, shpStart, shpLen, i)
	i = 0; boundUsed = b
	if(pendingFences.length){ fencetail ??= pendingFences[0]; for(const f of pendingFences){
		f.sync = gl.fenceSync(37143,0)
		fencehead = fencehead ? fencehead.next = f : f
	} pendingFences.length = 0 }
}
$.Geometry = (type, points) => {
	if(points.length&3) throw 'points.length is not a multiple of 4'
	if(!(points instanceof Float32Array)){
		const farr = new Float32Array(points.length)
		farr.set(points, 0); points = farr
	}
	const b = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, b)
	gl.bufferData(gl.ARRAY_BUFFER, points, 35044)
	b.type = type
	gl.bindBuffer(gl.ARRAY_BUFFER, buf)
	return {type, b, start: 0, length: points.length>>2, sub}
}
function sub(s=0,l=this.length-s, type=this.type){
	return {type, b: this.b, start: this.start+s, length: l, sub}
}
const defaultShape = $.Geometry.DEFAULT = $.Geometry($.TRIANGLE_STRIP, [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1])
const switcher = (f,s,e) => {
	let m = 'switch(u){'
	while(s<e) m += `case ${s}:${f(s++)}`
	return m+'}'
}
const names = ['float','vec2','vec3','vec4','int','ivec2','ivec3','ivec4','uint','uvec2','uvec3','uvec4']
const maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS)<<2
function switchShader(s, fc, fm){ sh = s; shfCount = fc; shfMask = fm }
function setShp(s){ i&&draw(); shp = s; shpType = s.type; shpStart = s.start; shpLen = s.length }
// Code generation bullshit GO!
$.Shader = (src, {params, defaults, uniforms, uniformDefaults, outputs=4, intFrac=0.5}={}) => {
	params = typeof params=='number' ? [params] : params || []
	uniforms = typeof uniforms=='number' ? [uniforms] : uniforms || []
	defaults = defaults !== undefined ? Array.isArray(defaults) ? [...defaults] : [defaults] : []
	uniformDefaults = uniformDefaults !== undefined ? Array.isArray(uniformDefaults) ? [...uniformDefaults] : [uniformDefaults] : []
	outputs = typeof outputs=='number' ? [outputs] : outputs || []
	if(outputs.length > Drawable.MAX_TARGETS) throw `Too many shader outputs (Drawable.MAX_TARGETS == ${Drawable.MAX_TARGETS})`
	const fnParams = [], fnBody = [''], shaderHead = ['#version 300 es\nprecision highp float;precision highp int;layout(location=0)in vec4 _pos;centroid out vec2 uv,xy;layout(location=1)in mat2x3 m;',''], shaderBody = ['void main(){gl_PointSize=1.0;uv=_pos.zw;gl_Position=vec4((xy=vec3(_pos.xy,1.)*m)*2.-1.,0.,1.);'], shaderHead2 = ['#version 300 es\nprecision highp float;precision highp int;centroid in vec2 uv,xy;\n#define color color0\n'+outputs.map((o,i) => `layout(location=${i})out ${!o?'':o==16||o==32?'u':'lowp '}vec4 color${i};`).join(';'),'']
	let count = 6, used = 0, fCount = 0, iCount = 0
	const texCheck = []
	let attrs = 0
	const addAttr = (sz) => {
		const id = ''+attrs>>2
		const oStart = attrs&3, oEnd = ((attrs += sz)&3)||4
		if(oEnd <= oStart){
			const id1 = ''+attrs>>2
			shaderHead.push(`layout(location=${(attrs>>2)+3})in uvec4 a${id1};flat out uvec4 GL_a${id1};`)
			shaderHead2.push(`flat in uvec4 GL_a${id1};`)
			shaderBody.push(`GL_a${id1}=a${id1};`)
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
		let c = (t&3)+1, n = names[t&3|t>>4<<2]
		const isCol = t==4||t==8||t==12
		defaults[id] ??= t==4?v4z:c==1?0:c==2?v2z:c==3?v3z:v4z
		fnParams.push(id+':a'+count+'=defaults['+id+']')
		const A = t>15||t==8?'iarr[j+':'arr[j+'
		if(t==20||t==24||t==28){
			n='int',used|=(1<<(t>>2)-3),fCount++
			texCheck.push(`a${count}=(img.auto(a${count+(t==24?'.t,-1':'.t,0')})+1||(i&&draw(b^boundUsed),img.auto(a${count+(t==24?'.t,-1':'.t,0')})+1))-1`)
		}
		if(t==12||t==28) used |= 2
		if(t==8||t==24) iCount++, fCount--
		if(isCol){
			texCheck.push(`let a${count+1}=-1;if(a${count}.t){if((a${count+1}=img.auto(a${count}.t,${-(t==8)}))==-1){i&&draw(b^boundUsed);a${count+1}=img.auto(a${count}.t,${-(t==8)})}a${count+1}|=a${count}.l<<8}`)
			fCount++
			const v = addAttr(1), v2 = addAttr(2), v3 = addAttr(2)
			shaderHead2.push(`${t==4?'lowp ':t==8?'u':'highp '}vec4 arg${id}(vec2 uv){int v=int(${v});if(v<0)return vec4(uintBitsToFloat(${v2}),uintBitsToFloat(${v3}));return ${t==4?'g':t==8?'uG':'fG'}etColor(v&255,vec3(uv*uintBitsToFloat(${v3})+uintBitsToFloat(${v2}),v>>8));}`)
			used |= (1<<(t>>2)+1)
			fnBody.push(`iarr[j+${count}]=a${count+1};if(a${count+1}>=0)arr[j+${count+1}]=a${count}.x,arr[j+${count+2}]=a${count}.y,arr[j+${count+3}]=a${count}.w,arr[j+${count+4}]=a${count}.h;else ${A}${count+1}]=a${count}.x,${A}${count+2}]=a${count}.y,${A}${count+3}]=a${count}.z,${A}${count+4}]=a${count}.w`)
			c = 5
		}else{
			const v = addAttr(c)
			shaderHead2.push(`\n#define arg${id} ${t<16?'uintBitsToFloat':t<32?names[t&3|4]:''}(${v})\n`)
			if(c==1) fnBody.push(A+count+']=a'+count)
			else for(let c1=0;c1<c;c1++) fnBody.push(A+(count+c1)+']=a'+count+'.'+'xyzw'[c1])
		}
		count += c
		id++
	}
	id = 0; let uniCount = 0
	const fn2Params = [], fn2Body = [''], fn3Body = []
	const uniNames = []
	let states = []
	for(const t of uniforms){
		let c = (t&3)+1, n = names[t&3|t>>4<<2]
		uniformDefaults[id] ??= t==4?v4z:c==1?0:c==2?v2z:c==3?v3z:v4z
		fn2Params.push('a'+uniCount+'=uniformDefaults['+id+']')
		if(t==12||t==28) used|=2
		if(t==8||t==24) iCount++,fCount--
		if(t==20||t==24||t==28){
			used|=(1<<(t>>2)-3),fCount++
			fn3Body.push(`gl.uniform1i(uniLocs[${uniNames.length}],s${states.length}?img.auto(s${states.length}${t==24?',-1':',0'}):${t==24?maxTex:0})`)
			uniNames.push('uni'+id)
			shaderHead2.push('uniform int uni'+id+';')
			fn2Body.push(`s${states.length}=a${uniCount}.t`)
			states.push(`s${states.length}=null`)
		}else if(t==4||t==8||t==12){
			const v = 'GL_u'+id, v2 = 'GL_U'+id
			fn3Body.push(`gl.uniform1i(uniLocs[${uniNames.length}],(s${states.length}?img.auto(s${states.length}${t==8?',-1':',0'}):${t==8?maxTex:0})|s${states.length+1})`)
			fCount++
			shaderHead2.push(t==8?`uniform uint ${v};uniform uvec4 ${v2}; ${t==4?'lowp ':t==8?'u':''}vec4 uni${id}(vec2 uv){if(${v}<0)return ${v2};return ${t==4?'g':t==8?'uG':'fG'}etColor(${v}&255,vec3(uv*uintBitsToFloat(${v2}.zw)+uintBitsToFloat(${v2}.xy),${v}>>8));}`:`uniform uint ${v};uniform vec4 ${v2}; ${t==4?'lowp ':t==8?'u':''}vec4 uni${id}(vec2 uv){if(${v}<0)return ${v2};return ${t==4?'g':t==8?'uG':'fG'}etColor(${v}&255,vec3(uv*${v2}.zw+${v2}.xy,${v}>>8));}`)
			used|=(1<<(t>>2)+1)
			fn2Body.push(`s${states.length}=a${uniCount}.t;s${states.length+1}=a${uniCount}.l<<8;gl.uniform4f(uniLocs[${uniNames.length-1}],a${uniCount}.x,a${uniCount}.y,a${uniCount}.w,a${uniCount}.h)`)
			uniNames.push(v, v2)
			states.push(`s${states.length}=null,s${states.length+1}=0`)
		}else{
			shaderHead2.push('uniform '+n+' uni'+id+';')
			let args = `gl.uniform${c+(t<16?'f':t<32?'i':'ui')}(uniLocs[${uniNames.length}]`
			uniNames.push('uni'+id)
			if(c==1) args += ',a'+uniCount
			else for(let c1=-1;++c1<c;) args += ',a'+uniCount+'.'+'xyzw'[c1]
			fn2Body.push(args+')')
		}
		uniCount += c
		id++
	}
	if(fCount+iCount>16) throw 'Shaders cannot use more than 16 textures/colors'
	fCount = fCount?iCount?fCount+round(intFrac * (maxTex-fCount-iCount)):maxTex:0
	iCount = iCount && maxTex - fCount
	let T = null
	shaderHead2[1] =
		(used&20?'uniform '+(used&2?'highp':'lowp')+' sampler2DArray GL_f['+fCount+'];':'')
		+(used&8?'uniform highp usampler2DArray GL_i['+iCount+'];':'')
		+(used&4?`lowp vec4 getColor(int u,vec3 p){${T=switcher(i=>'return texture(GL_f['+i+'],p);',0,fCount)}}`:'')
		+(used&16?`highp vec4 fGetColor(int u,vec3 p){${T||switcher(i=>'return texture(GL_f['+i+'],p);',0,fCount)}}`:'')
		+(used&8?`uvec4 uGetColor(int u,vec3 p){${switcher(i=>'return texture(GL_i['+(i-maxTex)+'],p);',maxTex,2*maxTex-fCount)}}`:'')
	shaderHead2[1] +=
		(used&4?`lowp vec4 getPixel(int u,ivec3 p,int l){${T=switcher(i=>'return texelFetch(GL_f['+i+'],p,l);',0,fCount)}}`:'')
		+(used&16?`highp vec4 fGetPixel(int u,ivec3 p,int l){${T||switcher(i=>'return texelFetch(GL_f['+i+'],p,l);',0,fCount)}}`:'')
		+(used&8?`uvec4 uGetPixel(int u,ivec3 p,int l){${switcher(i=>'return texelFetch(GL_i['+(i-maxTex)+'],p,l);',maxTex,2*maxTex-fCount)}}`:'')
		+(used&28?`ivec3 getSize(int u,int l){${switcher(i=>'return textureSize(GL_'+(i<fCount?'f['+i:'i['+(i-fCount))+'],l);',0,maxTex)}}`:'')
	const fMask = 32-fCount&&(-1>>>fCount)
	fn2Body[0] = `i&&draw(0);if(sh!=s){gl.useProgram(p);gl.bindVertexArray(vao);switchShader(s,${fCount},${fMask})}`
	fnBody[0] = `setv(this.t,this._mask);if(sh!=s){i&&draw(0);switchShader(s,${fCount},${fMask});gl.useProgram(p);gl.bindVertexArray(vao);B()};if(shp!=this._shp)setShp(this._shp);if(geo!=this._shp.b){gl.bindBuffer(34962,geo=this._shp.b);gl.vertexAttribPointer(0,4,gl.FLOAT,0,0,0);gl.bindBuffer(34962,buf)};let b=boundUsed^shuniBind;`+texCheck.join(';')+`;const j=grow(${count})`
	fnBody.push('return j')
	const s = eval(`let geo=defaultShape.b${states.length?','+states.join(','):''};const B=function(){${fn3Body.join(';')};shuniBind=boundUsed},s=function({${fnParams}}){${fnBody.join(';')}};s.uniforms=(function(${fn2Params}){${fn2Body.join(';')};B()});s`), p = gl.createProgram()
	const v=gl.createShader(35633), f=gl.createShader(35632)
	shaderBody.push('}')
	if(attrs) shaderHead[0]+='layout(location=3)in uvec4 a0;flat out uvec4 GL_a0;', shaderBody[0]+='GL_a0=a0;', shaderHead2[0]+='flat in uvec4 GL_a0;'
	gl.shaderSource(v, shaderHead.join('')+shaderBody.join(''))
	gl.compileShader(v)
	gl.shaderSource(f, shaderHead2.join('')+'\n'+src)
	gl.compileShader(f)
	gl.attachShader(p, v)
	gl.attachShader(p, f)
	if(T=gl.getShaderInfoLog(f)) console.warn('GLSL Error:\n'+T)
	else gl.linkProgram(p)
	gl.useProgram(p)
	const uniLocs = uniNames.map(n => gl.getUniformLocation(p, n))
	for(let i = 0; i < maxTex; i++)
		gl.uniform1i(gl.getUniformLocation(p, i<fCount?'GL_f['+i+']':'GL_i['+(i-fCount)+']'), i>=fCount?maxTex+i-fCount:i)
	s.count = count
	const vao = gl.createVertexArray()
	gl.bindVertexArray(vao)
	gl.bindBuffer(gl.ARRAY_BUFFER, defaultShape.b)
	gl.enableVertexAttribArray(0)
	gl.vertexAttribPointer(0, 4, gl.FLOAT, 0, 0, 0)
	gl.bindBuffer(gl.ARRAY_BUFFER, buf)
	if(count+6 > maxAttribs) throw 'Exceeded maximum number of shader parameters'
	count <<= 2
	for(let loc = 0; loc < 2; loc++){
		gl.enableVertexAttribArray(loc+1)
		gl.vertexAttribPointer(loc+1, 3, gl.FLOAT, false, count, loc * 12)
		gl.vertexAttribDivisor(loc+1, 1)
	}
	for(let i1 = 0; i1 < attrs; i1 += 4){
		const loc = (i1>>2)+3
		gl.enableVertexAttribArray(loc)
		gl.vertexAttribIPointer(loc, min(4, attrs-i1), gl.UNSIGNED_INT, count, i1+6<<2)
		gl.vertexAttribDivisor(loc, 1)
	}
	sh = s
	return s
}
let fdc = 0, fs = 0, fd = 0
$.Shader.MAX_PARAMS = maxAttribs-12
$.Shader.UINT = $.Shader(`void main(){color=arg0;}`, {params:$.UVEC4, outputs:$.UINT})
$.Shader.BLACK = $.Shader(`void main(){color=vec4(0,0,0,1);}`)
$.Shader.DEFAULT = $.Shader(`void main(){color=arg0(uv)*arg1;}`, {params:[$.COLOR, $.VEC4], defaults:[void 0, $.vec4.one]})
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
	arr = new Float32Array(1024), iarr = new Int32Array(arr.buffer)
}
const ctx = $.ctx = new drw(curt = {_tex: null, _stencil: 0, _stenBuf: null, w: 0, h: 0, u: 0})
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
	$.timeToFrame = 0
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
			$.timeToFrame = performance.now()*.001 - $.t
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