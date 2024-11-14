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

Gamma.capture = $ => {
	$.screenshot = (t='image/png',q) => new Promise(r => requestAnimationFrame(() => gl.canvas.toBlob(r, t, q)))
}
const a = document.createElement('a')
globalThis.download = (file, name = file.name ?? (file.type[0]=='@' ? 'file' : file.type.split('/',1)[0])) => {
	a.href = URL.createObjectURL(file)
	a.download = name
	a.click()
	URL.revokeObjectURL(a.href)
}
globalThis.fork = (w=0,h=0,x=NaN,y=NaN) => new Promise(r => {
	const n = open(location, '', 'popup,top=0,left=0,width='+ +w+',height='+ +h+(x==x?',top='+ +x:'')+(y==y?',top='+ +y:''))
	n ? n.onload = r.bind(undefined,n) : c()
})}