{Object.defineProperties(Array.prototype, {
	best: {enumerable: false, value(pred, best = -Infinity){
		let el = undefined
		const length = this.length
		for(let i = 0; i < length; i++){
			const a = this[i], score = pred(a, i, this)
			if(score >= best) best = score, el = a
		}
		return el
	}},
	mmap: {enumerable: false, value(fn){
		const len = this.length
		for(let i = 0; i < len; i++)
			this[i] = fn(this[i])
		return this
	}},
	bind: {enumerable: false, value(fn,idx=-1){
		if((idx>>>=0)>=this.length)return this.push(fn);let a;while(idx<this.length)a=this[idx],this[idx++]=fn,fn=a;return this.push(a)
	}},
	fire: {enumerable: false, value(...v){
		for(const r of this) try{r(...v)}catch(e){Promise.reject(e)}
	}},
	mapFire: {enumerable: false, value(...v){
		const res = new Array(this.length)
		for(const r of this) try{res.push(r(...v))}catch(e){Promise.reject(e);res.push(undefined)}
		return res
	}}
})
Uint8Array.fromHex = function(hex){
	const res = new Uint8Array(hex.length>>>1)
	let r = 1, i = 0
	for(let j = 0; j < hex.length; j++){
		const c = hex.charCodeAt(j)
		if(c>47&&c<58) r = r<<4|c-48
		else if(c>64&&c<71) r = r<<4|c-55
		else if(c>96&&c<103) r = r<<4|c-87
		if(r&256) res[i++] = r, r = 1
	}
	return res.slice(0, i)
}
const h = '0123456789abcdef'
Number.prototype.toHex = function(){return h[this>>>28]+h[this>>24&15]+h[this>>20&15]+h[this>>16&15]+h[this>>12&15]+h[this>>8&15]+h[this>>4&15]+h[this&15]}
Number.formatData = bytes => bytes < 512 ? bytes.toFixed(0)+'B' : bytes < 524288 ? (bytes/1024).toFixed(1)+'KiB' : bytes < 536870912 ? (bytes/1048576).toFixed(1)+'MiB' : bytes < 549755813888 ? (bytes/1073741824).toFixed(1)+'GiB' : (bytes/1099511627776).toFixed(1)+'TiB'
Date.safestamp = (d = new Date()) => `${d.getYear()+1900}-${('0'+d.getMonth()).slice(-2)}-${('0'+d.getDate()).slice(-2)}-at-${('0'+d.getHours()).slice(-2)}-${('0'+d.getMinutes()).slice(-2)}-${('0'+d.getSeconds()).slice(-2)}`

Gamma.utils = $ => {
	$.screenshot = (t='image/png',q) => new Promise(r => requestAnimationFrame(() => gl.canvas.toBlob(r, t, q)))
	class _scrollable{
		x = 0; y = 0
		sensitivity = .5
		constructor(c,w,h){this.contents=c;this.width=w;this.height=h}
		scrollBarX = dfs
		scrollBarY = dfs
		get scrollbar(){return this.scrollBarY}
		set scrollbar(a){this.scrollBarX = this.scrollBarY = a}
		consumeInputs(ctx){
			const {x: wx, y: wy} = ctx.fromDelta(scrollDelta), s = this.sensitivity
			scrollDelta.x = scrollDelta.y = 0
			const w = this.contents.width, h = this.contents.height
			this.x = this.width > 0 ? max(0, min(this.x + wx*s, w-this.width)) : min(0, max(this.x + wx*s, -w-this.width))
			this.y = this.height > 0 ? max(0, min(this.y + wy*s, h-this.height)) : min(0, max(this.y + wy*s, -h-this.height))
			wheel.x = wheel.y = 0
			const c = this.contents
			if(!c) return
			ctx = ctx.sub()
			ctx.translate((c.xOffset??0)-this.x, (c.yOffset??0)-this.y)
			c.consumeInputs?.(ctx)
		}
		draw(ctx, ...v){
			const c = this.contents
			if(!c?.draw) return
			const m = ctx.mask
			const ct2 = ctx.sub()
			ct2.mask = 128 // SET
			ct2.drawRect(0, 0, this.width, this.height)
			ct2.mask = m&15|16 // RGBA | IF_SET
			ct2.translate((c.xOffset??0)-this.x, (c.yOffset??0)-this.y)
			this.contents.draw(ct2, ...v)
			ctx.clearStencil()
			if(this.scrollBarX && this.height){
				const ct2 = ctx.sub()
				ct2.translate(0, this.height)
				if(this.height > 0) ct2.scale(1, -1)
				const w = abs(this.width), w1 = w / c.width
				if(w1 < 1) this.scrollBarX(ct2, abs(this.x) * w1, w * w1)
			}
			if(this.scrollBarY && this.width){
				const ct2 = ctx.sub()
				ct2.translate(this.width, 0)
				ct2.multiply(0, 1)
				if(this.width > 0) ct2.scale(1, -1)
				const h = abs(this.height), h1 = h / c.height
				if(h1 < 1) this.scrollBarY(ct2, abs(this.y) * h1, h * h1)
			}
		}
	}
	$.Scrollable = (c, w=1, h=-1) => new _scrollable(c, +w, +h)
	const v4p2 = $.vec4(.2)
	const dfs = $.Scrollable.defaultScrollbar = (ctx, x0, w) => {
		ctx.shader = null
		ctx.drawRect(x0, 0, w, .1, v4p2)
	}
}
const a = document.createElement('a')
globalThis.download = (file, name = file.name ?? (file.type[0]=='@' ? 'file' : file.type.split('/',1)[0])) => {
	a.href = URL.createObjectURL(file)
	a.download = name
	a.click()
	URL.revokeObjectURL(a.href)
}
/*globalThis.fork = (w=0,h=0,x=NaN,y=NaN) => new Promise(r => {
	const n = open(location, '', 'popup,top=0,left=0,width='+ +w+',height='+ +h+(x==x?',top='+ +x:'')+(y==y?',top='+ +y:''))
	n ? n.onload = r.bind(undefined,n) : c()
})*/}