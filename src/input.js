// Integer Contiguous Array
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
	set(pos=0){
		const i = pos >>> 5
		while(i >= this.length) this.push(0)
		this[i] |= 1 << (pos & 31)
	}
	unset(pos=0){
		let i = this.length
		const j = pos >>> 5
		if(j >= i) return
		this[j] &= ~(1 << (pos & 31))
		while(i && !this[--i]) super.pop()
	}
	setRange(from=0, to=0){
		if(from > to) return
		let i = from >>> 5, j = to >>> 5, l = to+31 >>> 5
		while(l >= this.length) this.push(0)
		if(i == j){
			this[i] |= -1<<(from&31) & ~(-1<<(to&31))
			return
		}
		this[i] |= -1<<(from&31)
		while(++i < j) this[i] = -1
		if(l = to&31) this[j] |= ~(-1<<l)
	}
	unsetRange(from=0, to){
		if(to === undefined){
			let i = from+31 >>> 5
			while(i > 0 && !this[i-1]) i--;
			this.length = i
			if(i && (from&31)) this[i-1] &= ~(-1<<(from&31))
			return
		}
		if(from > to) return
		let i = from >>> 5, j = to >>> 5
		if(i >= this.length) return
		if(i == j){
			this[i] &= ~(-1<<(from&31)) | (-1<<(to&31))
			return
		}
		let end = this.length
		if(j < end) this[j] &= -1<<(to&31), end = j
		this[i] &= ~(-1<<(from&31))
		while(++i < end) this[i] = 0
		if(end == this.length) while(end && !this[--end]) super.pop()
	}
	anyIn(from=0, to){
		let i = from >>> 5
		if(i >= this.length) return false
		if(to === undefined){
			if(from&31){
				if(this[i] & -1<<(from&31)) return true
				i++
			}
			while(i < this.length)
				if(this[i++]) return true
			return false
		}
		let j = to >>> 5
		if(i == j){
			return !!(this[i] & (-1<<(from&31) & ~(-1<<(to&31))))
		}else if(from&31){
			if(this[i] & -1<<(from&31)) return true
			i++
		}
		let end = this.length
		if(j < end){
			if(this[j] & ~(-1<<(to&31))) return true
			else end = j
		}
		while(++i < end) if(this[i]) return true
		return false
	}
	allIn(from=0, to=0){
		let i = from >>> 5
		if(i >= this.length) return false
		let j = to >>> 5
		if(i == j){
			return (this[i]|~(-1<<(from&31))|-1<<(to&31))===-1
		}else if(from&31){
			if(~this[i]&(-1<<(from&31))) return false
			i++
		}
		let end = this.length
		if(j < end){
			if(~(this[j]|(-1<<(to&31)))) return false
			else end = j
		}
		while(i < end) if(~this[i++]) return false
		return true
	}
	toggle(pos=0){
		let i = this.length
		const j = pos >>> 5
		while(j >= i) this.push(0), i++
		this[j] ^= 1 << (pos & 31)
		while(i && !this[--i]) super.pop()
	}
	has(pos=0){
		const i = pos >>> 5
		if(i >= this.length) return false
		return !!(this[i] & (1 << (pos & 31)))
	}
	pop(pos=0){
		let i = pos >>> 5
		if(i >= this.length) return false
		let a = this[i]; a ^= (this[i] = a&~(1 << (pos & 31)))
		if(i == this.length - 1) while(i >= 0 && !this[i--]) super.pop()
		return !!a
	}
	put(pos=0){
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
	iter(cb,from=0){
		let a = -1<<(from&31)
		for(let i=from>>>5;i<this.length;i++){
			for(;;){
				const b = this[i]&a, x=31-clz32(b&-b);
				if(x<0) break; a=-2<<x
				cb(i<<5|x)
			}
			a = -1
		}
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

if(!('remove' in Array.prototype)) Object.defineProperty(Array.prototype, 'remove', { value(a){
	let i = this.indexOf(a)
	if(i >= 0){
		while(i<this.length) this[i] = this[++i]
		this.pop()
	}
	return i
}, enumerable: false, configurable: true })
let lastCan = null, lastInst = null
function pollGamepads(){
	gp = false
	for(const g of navigator.getGamepads()){
		console.log(g.index)
	}
	if(gp) requestAnimationFrame(pollGamepads)
}
let gp = true; requestAnimationFrame(pollGamepads)
window.addEventListener('gamepadconnected', () => { if(!gp) requestAnimationFrame(pollGamepads), gp = true })
{
const overrides = {__proto__: null,
	ContextMenu: 93, Help: 26, Semicolon: 186, Quote: 222, BracketLeft: 219, BracketRight: 221,
	Backquote: 192, Backslash: 220, Minus: 189, EQUAL: 187, IntlRo: 193, IntlYen: 255, MetaLeft: 91,
	MetaRight: 91, PrintScreen: 44, ScrollLock: 145, Pause: 19, F13: 124, F14: 125, F15: 126, F16: 127,
	F17: 128, F18: 129, F19: 130, F20: 131, F21: 132, F22: 133, F23: 134, F24: 135, NumLock: 144,
	Clear: 10, NumpadComma: 110, NumpadDecimal: 110, Numpad0: 96, Numpad1: 97, Numpad2: 98, Numpad3: 99,
	Numpad4: 100, Numpad5: 101, Numpad6: 102, Numpad7: 103, Numpad8: 104, Numpad9: 105
}
Gamma.input = ($, can = $.canvas) => {
	$.MOUSE = Object.freeze({ LEFT: 0, RIGHT: 2, MIDDLE: 1, BACK: 3, FORWARD: 4 })
	$.KEY = Object.freeze({
		A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77,
		N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, can: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
		NUM_0: 48, NUM_1: 49, NUM_2: 50, NUM_3: 51, NUM_4: 52, NUM_5: 53, NUM_6: 54, NUM_7: 55,
		NUM_8: 56, NUM_9: 57, SPACE: 32, BACKTICK: 192, TAB: 9, BACK: 8, ENTER: 13,
		SHIFT: 16, CTRL: 17, ALT: 18, ESC: 27, META: 91, METARIGHT: 93, CAPSLOCK: 20, UP: 38,
		RIGHT: 39, DOWN: 40, LEFT: 37, MOD: navigator.platform.startsWith('Mac') ? 91 : 17, F1: 112,
		F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122,
		F12: 123, MINUS: 189, EQUAL: 187, BR_LEFT: 219, BR_RIGHT: 221, SEMICOLON: 186, APOS: 222,
		BACKSLASH: 220, COMMA: 188, DOT: 190, SLASH: 191, PAUSE: 19, PAD_ENTER: 12, CLEAR: 10, HOME: 36, END: 35,
		PAGE_UP: 33, PAGE_DOWN: 34, INS: 45, DEL: 46, CTX_MENU: 93, NUMPAD_0: 96, NUMPAD_1: 97, NUMPAD_2: 98,
		PAD_3: 99, NUMPAD_4: 100, NUMPAD_5: 101, NUMPAD_6: 102, NUMPAD_7: 103, NUMPAD_8: 104, NUMPAD_9: 105,
		PAD_DIV: 111, PAD_MULT: 106, PAD_SUB: 109, PAD_ADD: 107, PAD_DOT: 110, NUM_LOCK: 144,
		SCROLL_LOCK: 145, HELP: 26, RO: 193, YEN: 255, SYSRQ: 44, PRINT_SCREEN: 44
	})
	$.GAMEPAD = Object.freeze({ A: 256, B: 257, X: 258, Y: 259, LB: 260, RB: 261, LT: 262, RT: 263, UP: 268, DOWN: 269, LEFT: 270, RIGHT: 271, MENU: 300 })
	const oldSafari = typeof ApplePaySession != 'undefined' && !('letterSpacing' in CanvasRenderingContext2D.prototype), ptrlockOpts = !navigator.platform.startsWith('Linux') && typeof netscape == 'undefined' && !oldSafari ? {unadjustedMovement:true} : undefined
	Object.defineProperty($, 'pointerLock', {
		get: () => document.pointerLockElement == can,
		set: v => {
			if(!v){
				if(document.pointerLockElement === can) document.exitPointerLock()
			}else if(document.pointerLockElement !== can) can.requestPointerLock(ptrlockOpts)?.catch(_=>null)
		}
	})
	Object.defineProperty($, 'fullscreen', {
		get: () => document.fullscreenElement == can,
		set: v => {
			if(!v){
				if(document.fullscreenElement === can) document.exitFullscreen()
			}else if(document.fullscreenElement !== can) can.requestFullscreen()?.catch(_=>null)
		}
	})
	$.Inputs = {
		MOUSE_BUTTONS: 1,
		MOUSE_WHEEL: 2,
		MOUSE_POINTER: 4,
		OTHER_POINTERS: 8,
		KEYBOARD: 16,
		GAMEPADS: 32,
		MOUSE: 7,
		ALL_POINTERS: 12,
		ALL: -1
	}
	class PointerState{
		constructor(other = null){
			if(other){
				this.x = +other.x, this.y = +other.y
				this.tiltX = +other.tiltX, this.tiltY = +other.tiltY
				this.pressure = +other.pressure, this.twist = +other.twist
				this.buttons = other.buttons|0
			}else{
				this.x = 0, this.y = 0
				this.tiltX = 0, this.tiltY = 0
				this.pressure = 0, this.twist = 0
				this.buttons = 0
			}
		}
		update(other){
			this.x = +other.x, this.y = +other.y; this.buttons = other.buttons|0
			this.tiltX = +other.tiltX; this.tiltY = +other.tiltY; this.pressure = +other.pressure; this.twist = +other.twist
		}
		has(btn){ return !!(this.buttons >> btn & 1) }
		anyIn(from=0, to){ return !!(this.buttons >> from & (typeof to == 'number' ? ~(-1 << (to-from)) : -1)) }
		allIn(from=0, to=0){ return (this.buttons >> from | (-1 << (to-from))) === -1 }
		firstUnset(){ const b = ~this.buttons; return 31 - clz32(b&-b) }
		firstSet(){ const b = this.buttons; return 31 - clz32(b&-b) }
		lastSet(){ return 31 - clz32(this.buttons) }
		iter(cb, from=0){
			for(;;){
				const a = this.buttons&(-1<<from), x = 31-clz32(a&-a)
				if(x<0) break; from = x+1; cb(x)
			}
		}
	}
	class Gamepad extends BitField{
		_axes = []
		axis(i){ return this._axes[i&65535] ??= {x: 0, y: 0} }
	}
	// An input context combines:
	// Logical keys (`BitField`), 0-7: mouse buttons, 8+: keyboard keys
	// Mouse wheel and movement deltas via `.wheel` and `.mouse`
	// Pointer positions (0: main mouse, 1..n: other pointers, `.pointer(n)`)
	// Gamepads (0: primary gamepad, 1..n: other gamepads, `.gamepad(n)`)
	// It offers interface for listening for raw input events (e.g a key was pressed, a new pointer appeared),
	// 	refined input event (e.g a specific key was pressed, a pointer appeared in a region) and methods to clear such listeners
	// It offers interface to fire events, such as when propagating events between contexts, or, for the main context, fired directly from DOM events
	// It offers interface to check on-demand the current state of inputs (e.g is a key pressed, position of a pointer), useful in render/update loops

	// Mouse events and pointer 0 events are both derived separately. While they will typically match, there is no intrinsic reason they must.
	// E.g a pointer event could be synthesized from touch input, a context may wish to remap mouse buttons before propagating, etc...
	// onKeyDown/onKeyUp/onKeyUpdate are all derived directly from fireKeyUpdate(), so they will always match.
	// Same for onNewPointer/onDelPointer/onPointerUpdate from firePointerUpdate() and onNewGamepad/onDelGamepad/onGamepadUpdate from fireGamepadUpdate().

	// An input context acts like a filter. An incoming event is immediately updated to the context's state, then listeners are called. Listeners
	// can modify the event (e.g cancel a key press) and the modified event is then propagated to the next listeners, then to the next context in the chain.
	// Chaining contexts is useful for handling many layers of input processing, e.g global shortcuts, per-scene inputs, etc...
	// As well as keeping track of more intermediate input states, e.g if it's needed later by the rendering or update loop.
	// However, most of the time, you will be forwarding directly with .fireXXX() calls as they offer more control over propagating to abitrary contexts.

	// Pointers contain: .x, .y (normalized position),
	// 	.pressure (0..1, for touch/pen input), .tiltX, .tiltY, .twist (for pen input)
	// 	.buttons (bitwise integer of buttons pressed, also accessible via a BitField interface)
	// Gamepads are BitFields for pressed buttons along with:
	// 	.axis(i) returning {x,y} objects for each stick/axis

	class Ictx extends BitField{
		next = null // for chaining contexts
		wheel = {x: 0, y: 0} // accumulated wheel delta
		mouse = {x: 0, y: 0} // accumulated mouse delta
		cursor = null // "normalized" cursor position. For the main canvas this is usually in [0,1]. This value is always == .pointer(0)
		gamepad = null // Primary gamepad. This value is always == .gamepad(0)
		_pointers = new Map()
		pointer(id){ return (id|=0) >= 0 ? this._pointers.get(id) ?? null : null }
		gamepad(id){ return (id=~id) < 0 ? this._pointers.get(id) ?? null : null }
		_wcbs = []; _mcbs = []; _rpcbs = []; _rgcbs = []; _rkcbs = []
		_npcbs = []; _ngcbs = []; _dpcbs = []; _dgcbs = []
		_kcbs = new Map()
		// Clears listeners
		reset(flags = -1){
			const k = flags & 17
			if(k){
				if(k == 17) this._kcbs.clear()
				else for(const key of this._kcbs.keys())
					if((key>7)^(flags>>3&1)) this._kcbs.delete(key)
			}
			if(flags & 2) this._wcbs.length = 0
			if(flags & 4) this._mcbs.length = 0
			if(flags & 8) this._npcbs.length = this._dpcbs.length = 0
			if(flags & 32) this._ngcbs.length = this._dgcbs.length = 0
		}
		// Clears inputs without calling or removing listeners
		resetInputs(flags = -1){
			const k = flags & 17
			if(k == 17) this.clear()
			else if(k){
				if(flags & 1) this.unsetRange(0, 7)
				if(flags & 16) this.unsetRange(8)
			}
			if(flags&2) this.wheel.x = this.wheel.y = 0
			if(flags&4) this.mouse.x = this.mouse.y = 0
			let k2 = flags & 40
			if(k2==40) this._pointers.clear()
			else if(k2){
				k2 = -(k2==32)
				for(const id of this._pointers.keys())
					if((id>>31)==k2) this._pointers.delete(id)
			}
		}
		onMouseWheel(fn){ this._wcbs.push(fn) }
		onMouseMove(fn){ this._mcbs.push(fn) }
		onPointerUpdate(fn){ this._rpcbs.push(fn) }
		onGamepadUpdate(fn){ this._rgcbs.push(fn) }
		onNewPointer(fn){ this._npcbs.push(fn) }
		onDelPointer(fn){ this._dpcbs.push(fn) }
		onNewGamepad(fn){ this._ngcbs.push(fn) }
		onDelGamepad(fn){ this._dgcbs.push(fn) }
		onKeyDown(key, fn){
			if(Array.isArray(key)){for(const k of key) this.onKeyDown(k,fn);return}
			const a = this._kcbs.get(key&=0xffff)
			if(a) a.push(fn)
			else this._kcbs.set(key, [fn])
		}
		onKeyUp(key, fn){
			if(Array.isArray(key)){for(const k of key) this.onKeyUp(k,fn);return}
			const a = this._kcbs.get(key=~(key&0xffff))
			if(a) a.push(fn)
			else this._kcbs.set(key, [fn])
		}
		onKey(key, down, up){
			if(down) this.onKeyDown(key, down)
			if(up) this.onKeyUp(key, up)
		}
		onKeyUpdate(fn){ this._rkcbs.push(fn) }

		fireKeyUpdate(key, isDown = false, refire = false){
			let self = this
			while(self){
				if(!refire && !(isDown ? self.put(key) : self.pop(key))){ self = self.next; continue }
				const specCbs = self._kcbs.get((isDown ? key&0xffff : ~(key&0xffff)))
				if(specCbs) for(const f of specCbs) try{ const v = f(isDown, key); if(typeof v == 'boolean' && isDown !== v){ isDown = v; break } }catch(e){Promise.reject(e)}
				for(const f of self._rkcbs) try{ const v = f(key, isDown); if(typeof v == 'boolean') isDown = v }catch(e){Promise.reject(e)}
				self = self.next
			}
		}
		refireKey(key){
			let self = this, isDown = this.has(key)
			while(self){
				const specCbs = self._kcbs.get((isDown ? key&0xffff : ~(key&0xffff)))
				if(specCbs) for(const f of specCbs) try{ const v = f(isDown, key); if(typeof v == 'boolean' && isDown !== v){ isDown = v; break } }catch(e){Promise.reject(e)}
				for(const f of self._rkcbs) try{ const v = f(key, isDown); if(typeof v == 'boolean') isDown = v }catch(e){Promise.reject(e)}
				self = self.next
			}
		}
		firePointerUpdate(id, pointer = null, refire = false){
			if((id|=0) < 0) return
			let self = this
			while(self){
				let p = self._pointers.get(id) ?? null
				if(!p){
					if(pointer){
						p = new PointerState(pointer)
						self._pointers.set(id, p)
						for(const f of self._npcbs) try{ const p2 = f(id, pointer, null); if(typeof p2 == 'object') pointer = p2 }catch(e){Promise.reject(e)}
					}else if(!refire){ self = self.next; continue }
				}else if(!pointer){
					self._pointers.delete(id)
					for(const f of self._dpcbs) try{ const p2 = f(id, pointer, p); if(typeof p2 == 'object') pointer = p2 }catch(e){Promise.reject(e)}
				}else p.update(pointer)
				for(const f of self._rpcbs) try{ const p2 = f(id, pointer); if(typeof p2 == 'object') pointer = p2 }catch(e){Promise.reject(e)}
				self = self.next
			}
		}
		refirePointer(id){ this.firePointerUpdate(id, this._pointers.get(id) ?? null, true) }
		fireWheelUpdate(dx=0, dy=0){
			if(typeof dx == 'object') dy = +dx.y, dx = +dx.x
			let self = this
			while(self){
				this.wheel.x += dx; this.wheel.y += dy
				for(const f of this._wcbs) try{ const p = f(dx, dy); if(typeof p == 'object') dx = +p.x, dy = +p.y }catch(e){Promise.reject(e)}
				self = self.next
			}
		}
		fireMouseUpdate(dx=0, dy=0){
			if(typeof dx == 'object') dy = +dx.y, dx = +dx.x
			let self = this
			while(self){
				this.mouse.x += dx; this.mouse.y += dy
				for(const f of this._mcbs) try{ const p = f(dx, dy); if(typeof p == 'object') dx = +p.x, dy = +p.y }catch(e){Promise.reject(e)}
				self = self.next
			}
		}
		clearDeltas(){ this.mouse.x = this.mouse.y = this.wheel.x = this.wheel.y = 0 }
	}
	const ictx = $.ictx = new Ictx()
	$.InputContext = () => new Ictx()
	can.style.cursor = 'default'
	can.tabIndex = 0
	$.cursorIcon = ''
	let prevCur = ''
	can.addEventListener('blur', _ => {
		ictx.iter(n => ictx.fireKeyUpdate(n, false))
	})
	// for BitField.get(0-7) mouse buttons
	can.addEventListener('mousedown', e => {
		if(document.activeElement != can) can.focus()
		e.preventDefault()
		ictx.fireKeyUpdate(e.button, true)
	})
	can.addEventListener('mouseup', e => {
		e.preventDefault()
		ictx.fireKeyUpdate(e.button, false)
	})
	can.addEventListener('contextmenu', e => e.preventDefault())
	can.addEventListener('wheel', e => {
		e.preventDefault()
		ictx.fireWheelDelta(e.wheelDeltaX, e.wheelDeltaY)
	}, {passive: false})
	let prevx = NaN, prevy = NaN
	can.addEventListener('mousemove', e => {
		e.preventDefault()
		//ictx.cursor.x = e.offsetX/can.offsetWidth; ictx.cursor.y = 1-e.offsetY/can.offsetHeight
		let dx = 0, dy = 0
		try{
			if(document.pointerLockElement == can){
				dx = e.movementX*devicePixelRatio
				dy = e.movementY*devicePixelRatio
				if(oldSafari){
					const {width,height} = can.getBoundingClientRect()
					dx *= can.offsetWidth/width, dy *= can.offsetHeight/height
				}
			}else if(prevx == prevx){ // !isnan(prevx)
				dx = e.offsetX-prevx, dy = e.offsetY-prevy
			}else return
		}finally{ prevx = e.offsetX, prevy = e.offsetY }
		ictx.fireMouseUpdate(dx, -dy)
	})
	$.onFlush(() => {
		const c = $.cursorIcon+''
		if(c !== prevCur) can.style.cursor = c?c[0]=='#'?c.slice(1):`url(${CSS.escape(c)})`:'', prevCur = c
	})
	can.addEventListener('keydown', e => {
		if(e.repeat) return
		ictx.fireKeyUpdate(overrides[e.code] ?? e.keyCode, true)
	})
	can.addEventListener('keyup', e => {
		ictx.fireKeyUpdate(overrides[e.code] ?? e.keyCode, false)
	})
}}