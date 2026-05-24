function peekTextures(){
	const b = gl.getParameter(gl.ACTIVE_TEXTURE)
	for(let i = 0; i < 32; i++){
		gl.activeTexture(gl.TEXTURE0+i)
		const t = gl.getParameter(gl.TEXTURE_BINDING_2D_ARRAY)
		if(t) console.info('%d: %o', i, t)
	}
	gl.activeTexture(b)
}

const proto = WebGL2RenderingContext.prototype
const gE = proto.getError
const enums = new Map()
for(const k of Object.getOwnPropertyNames(proto)){
	const d = Object.getOwnPropertyDescriptor(proto, k)
	const v = d.value
	if(typeof v == 'function'){
		d.value = function(...a){
			const r = v.call(this, ...a)
			const e = gE.call(this)
			if(e){ console.warn('%s(): %s', k, enums.get(e)??e); debugger }
			return r
		}
		Object.defineProperty(proto, k, d)
	}else if(typeof v == 'number') enums.set(v, k)
}