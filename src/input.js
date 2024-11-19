// Smi Contiguous Array
globalThis.BitField ??= class BitField extends Array{
	constructor(n){
		super()
		if(Array.isArray(n)) for(let i=0;i<n.length;i++) this.push(n[i])
		else if(n instanceof Uint8Array){
			for(let i=0;i<n.length;i+=4)
				this.push(n[i]|n[i|1]<<8|n[i|2]<<16|n[i|3]<<24)
		}else if(n) for(const i of n) this.set(i)
	}
	static parse(a){
		if(!Array.isArray(a)) return new BitField 
		return Object.setPrototypeOf(a, BitField.prototype)
	}
	/** See npm:nanobuf */
	static decode(buf, b = new BitField){
		b.length = 0
		let l = buf.v32()
		while(l--) b.push(buf.i32())
	}
	/** See npm:nanobuf */
	static encode(buf, b){
		const l = b.length
		buf.v32(l)
		for(let i=0;i<l;i++) buf.i32(this[i])
	}
	static of(...n){
		const b = new BitField
		for(const i of n) b.set(i)
		return b
	}
	set(pos){
		const i = pos >>> 5
		while(i >= this.length) this.push(0)
		this[i] |= 1 << (pos & 31)
	}
	unset(pos){
		let i = this.length
		const j = pos >>> 5
		if(j >= i) return
		this[j] &= ~(1 << (pos & 31))
		while(i && !this[--i]) super.pop()
	}
	toggle(pos){
		let i = this.length
		const j = pos >>> 5
		while(j >= i) this.push(0), i++
		this[j] ^= 1 << (pos & 31)
		while(i && !this[--i]) super.pop()
	}
	has(pos){
		const i = pos >>> 5
		if(i >= this.length) return false
		return !!(this[i] & (1 << (pos & 31)))
	}
	pop(pos){
		let i = pos >>> 5
		if(i >= this.length) return false
		let a = this[i]; a ^= (this[i] = a&~(1 << (pos & 31)))
		if(i == this.length - 1) while(i >= 0 && !this[i--]) super.pop()
		return !!a
	}
	put(pos){
		let i = pos >>> 5
		while(i >= this.length) this.push(0)
		return !!(this[i] ^ (this[i] |= 1 << (pos & 31)))
	}
	xor(other){
		let l = this.length
		if(l == other.length){
			while(l && this[--l] == other[l]) super.pop()
		}else{
			let l2 = l; l--
			while(l2 < other.length) this.push(other[l2++])
		}
		for(let i = l; i >= 0; i--) this[i] ^= other[i]
	}
	and(other){
		let l = this.length
		if(this.length > other.length) l = this.length = other.length
		while(l && !(this[--l] & other[l])) super.pop()
		while(l > 0) this[--l] &= other[l]
	}
	or(other){
		let l = this.length - 1, l2 = l
		while(++l2 < other.length) this.push(other[l2])
		for(let i = l; i >= 0; i--) this[i] |= other[i]
	}
	firstUnset(){
		let i = -1
		while(++i < this.length){
			const a = ~this[i]
			if(a) return i<<5|31-clz32(a&-a)
		}
		return i<<5
	}
	firstSet(){
		let i = -1
		while(++i < this.length)
			if(this[i]) return i<<5|31-clz32(this[i]&-this[i])
		return -1
	}
	lastSet(){
		let i = this.length
		while(--i >= 0)
			if(this[i]) return i<<5|31-clz32(this[i])
		return -1
	}
	popFirst(){
		let i = -1
		while(++i < this.length)
			if(this[i]){
				let s = 31-clz32(this[i]&-this[i])
				this[i] &= ~(1 << s)
				s = i<<5|s
				i = this.length
				while(i && !this[--i]) super.pop()
				return s
			}
		return -1
	}
	putFirst(){
		let i = -1
		while(++i < this.length){
			const a = ~this[i]
			if(!a) continue
			const j = 31-clz32(a&-a)
			this[i] |= 1<<j
			return i<<5|j
		}
		return this.push(1), i<<5
	}
	popLast(){
		let i = this.length
		while(--i >= 0)
			if(this[i]){
				let s = 31-Math.clz32(this[i])
				this[i] &= ~(1 << s)
				s = i<<5|s
				i = this.length
				while(i && !this[--i]) super.pop()
				return s
			}
		return -1
	}
	clear(){ this.length = 0 }
	[Symbol.iterator](){
		const v = {value: 0, done: false}
		let i = 0, a=-1
		return {[Symbol.iterator](){return this},next:()=>{
			for(;i<this.length;i++,a=-1){
				const b = this[i]&a, x=31-clz32(b&-b)
				if(x<0) continue; a=-2<<x
				return v.value=i<<5|x,v
			}
			return i=Infinity,v.done=true,v
		}}
	}
	iter(cb){
		for(let i=0;i<this.length;i++){
			let a = -1
			for(;;){
				const b = this[i]&a, x=31-clz32(b&-b);
				if(x<0) break; a=-2<<x
				cb(i<<5|x)
			}
		}
	}
	[Symbol.for('nodejs.util.inspect.custom')](){
		let t = '', c = 0
		for(let i=0;i<this.length;i++){
			let a = -1
			for(;;){
				const b = this[i]&a, x=31-clz32(b&-b);
				if(x<0) break; a=-2<<x
				t+=' '+(i<<5|x); c++
			}
		}
		return `BitField(${c}) {\x1b[33m${t} \x1b[m}`
	}
	toUint8Array(){
		let l = this.length-1, x = this[l], i=0
		const u = new Uint8Array(l = (l<<2)+(39-clz32(x)>>3))
		for(;i<l;i+=4){
			const y = this[i>>2]
			u[i] = y; u[i|1] = y>>8; u[i|2] = u>>16; u[i|3] = u>>24
		}; i -= 4
		while(i<l) u[i++] = x, x>>=8
		return u
	}
}
if(!('remove'in[]))Object.defineProperty(Array.prototype,'remove',{value(a){
	let i = this.indexOf(a)
	if(i>-1){while(i<b.length)b[i]=b[++i];b.pop()}
	return i
},enumerable:false,configurable:true})
{let _keys=null,_dcbs=null
const overrides = {__proto__: null,
	ContextMenu: 93, Help: 26, Semicolon: 186, Quote: 222, BracketLeft: 219, BracketRight: 221,
	Backquote: 192, Backslash: 220, Minus: 189, EQUAL: 187, IntlRo: 193, IntlYen: 255, MetaLeft: 91,
	MetaRight: 91, PrintScreen: 44, ScrollLock: 145, Pause: 19, F13: 124, F14: 125, F15: 126, F16: 127,
	F17: 128, F18: 129, F19: 130, F20: 131, F21: 132, F22: 133, F23: 134, F24: 135, NumLock: 144,
	Clear: 10, NumpadComma: 110, NumpadDecimal: 110, Numpad0: 96, Numpad1: 97, Numpad2: 98, Numpad3: 99,
	Numpad4: 100, Numpad5: 101, Numpad6: 102, Numpad7: 103, Numpad8: 104, Numpad9: 105
}
Gamma.input = ($, T = $.canvas) => {
	const keys = $.keys = new BitField()
	$.MOUSE = Object.freeze({ LEFT: 0, RIGHT: 2, MIDDLE: 1, BACK: 3, FORWARD: 4 })
	$.KEY = Object.freeze({
		A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77,
		N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
		NUM_0: 48, NUM_1: 49, NUM_2: 50, NUM_3: 51, NUM_4: 52, NUM_5: 53, NUM_6: 54, NUM_7: 55,
		NUM_8: 56, NUM_9: 57, SPACE: 32, BACKTICK: 192, TAB: 9, BACK: 8, ENTER: 13,
		SHIFT: 16, CTRL: 17, ALT: 18, ESC: 27, META: 91, METARIGHT: 93, CAPSLOCK: 20, UP: 38,
		RIGHT: 39, DOWN: 40, LEFT: 37, MOD: navigator.platform.startsWith('Mac') ? 91 : 17, F1: 112,
		F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122,
		F12: 123, MINUS: 189, EQUAL: 187, BR_LEFT: 219, BR_RIGHT: 221, SEMICOLON: 186, APOS: 222,
		BACKSLASH: 220, COMMA: 188, DOT: 190, SLASH: 191, PAUSE: 19, PAD_ENTER: 12, CLEAR: 10, HOME: 36, END: 35,
		PAGE_UP: 33, PAGE_DOWN: 34, INS: 45, DEL: 46, CTX_MENU: 93, PAD_0: 96, PAD_1: 97, PAD_2: 98,
		PAD_3: 99, PAD_4: 100, PAD_5: 101, PAD_6: 102, PAD_7: 103, PAD_8: 104, PAD_9: 105,
		PAD_DIV: 111, PAD_MULT: 106, PAD_SUB: 109, PAD_ADD: 107, PAD_DOT: 110, NUM_LOCK: 144,
		SCROLL_LOCK: 145, HELP: 26, RO: 193, YEN: 255, SYSRQ: 44, PRINT_SCREEN: 44
	})
	$.REPEAT = 256
	$.GAMEPAD = Object.freeze({ A: 256, B: 257, X: 258, Y: 259, LB: 260, RB: 261, LT: 262, RT: 263, UP: 268, DOWN: 269, LEFT: 270, RIGHT: 271, MENU: 300 })
	$.cursor = $.vec2(.5)
	$.cursorDelta = $.vec2()
	$.mouse = $.vec2(.5)
	$.wheel = $.vec2()
	$.scrollDelta = $.vec2()
	const dcbs = new Map
	;($.onKey = (key, fn) => {
		if(Array.isArray(key)){for(const k of key) $.onKey(k,fn);return}
		const a = dcbs.get(key&=0xffff)
		if(a) a.push(fn)
		else dcbs.set(key, [fn])
	}).remove = (key, fn) => {
		if(Array.isArray(key)){for(const k of key) $.onKey.remove(k,fn);return}
		const a = dcbs.get(key&=0xffff)
		if(a && !(a.remove(fn),a.length)) dcbs.delete(key)
	}
	;($.onKeyRelease = (key, fn) => {
		if(Array.isArray(key)){for(const k of key) $.onKeyRelease(k,fn);return}
		const a = dcbs.get(key=~(key&0xffff))
		if(a) a.push(fn)
		else dcbs.set(key, [fn])
	}).remove = (key, fn) => {
		if(Array.isArray(key)){for(const k of key) $.onKeyRelease.remove(k,fn);return}
		const a = dcbs.get(key=~(key&0xffff))
		if(a && !(a.remove(fn),a.length)) dcbs.delete(key)
	}
	const wcb = [], mcb = []
	;($.onWheel = fn => void wcb.push(fn)).remove = fn => void wcb.remove(fn)
	;($.onMouse = fn => void mcb.push(fn)).remove = fn => void mcb.remove(fn)
	T.style.cursor = 'default'
	Object.defineProperty($, 'cursorType', {get(){return T.style.cursor},set(a){T.style.cursor=a||'default'}})
	T.addEventListener('mouseover', _ => {
		if(_keys) return
		_keys = keys; _dcbs = dcbs
	})
	T.addEventListener('mouseout', _ => {
		if(_keys != keys) return
		const k = new BitField(keys); keys.clear()
		k.iter(n => {
			const a = dcbs.get(~n)
			if(a) for(const f of a)try{f(n)}catch(e){Promise.reject(e)}
		})
		keys.clear()
		_keys = _dcbs = null
	})
	T.addEventListener('mousedown', e => {
		e.preventDefault()
		const n = e.button
		keys.set(n)
		const a = dcbs.get(n)
		if(a) for(const f of a)try{f(n)}catch(e){Promise.reject(e)}
	})
	T.addEventListener('mouseup', e => {
		e.preventDefault()
		const n = e.button
		if(!keys.pop(n)) return
		const a = dcbs.get(~n)
		if(a) for(const f of a)try{f(n)}catch(e){Promise.reject(e)}
	})
	T.addEventListener('contextmenu', e => e.preventDefault())
	T.addEventListener('wheel', e => {
		e.preventDefault()
		wheel.x += e.wheelDeltaX; wheel.y += e.wheelDeltaY
		scrollDelta.x += e.wheelDeltaX / innerWidth
		scrollDelta.y += e.wheelDeltaY / innerHeight
		for(const f of wcb) f(e.wheelDeltaX, e.wheelDeltaY)
	}, {passive: false})
	T.addEventListener('mousemove', e => {
		e.preventDefault()
		mouse.x += e.movementX; mouse.y += e.movementY
		cursor.x = e.offsetX/e.target.offsetWidth; cursor.y = 1-e.offsetY/e.target.offsetHeight
		for(const f of wcb) f(e.movementX, e.movementY)
	})
}
const doc = document
doc.addEventListener('keydown', e => {
	if(!_keys) return
	if(doc.activeElement == doc.body || !doc.activeElement) e.preventDefault()
	if(e.repeat) return
	const n = overrides[e.code] ?? e.keyCode
	_keys.set(n)
	const a = _dcbs.get(n)
	if(a) for(const f of a)try{f(n)}catch(e){Promise.reject(e)}
})
doc.addEventListener('keyup', e => {
	if(!_keys) return
	if(doc.activeElement == doc.body || !doc.activeElement) e.preventDefault()
	const n = overrides[e.code] ?? e.keyCode
	if(!_keys.pop(n)) return
	const a = _dcbs.get(~n)
	if(a) for(const f of a)try{f(n)}catch(e){Promise.reject(e)}
})}