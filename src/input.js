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
{
document.addEventListener('pointerlockchange', () => {
	const ictx = document.pointerLockElement?._ictx
	if(ictx){
		if(ptrlockPointer = ictx.cursor) ictx.setPointer(0, null)
		ptrlockIctx = ictx
	}else if(ptrlockIctx){
		if(ptrlockPointer) ptrlockIctx.setPointer(0, ptrlockPointer), ptrlockPointer = null
		ptrlockIctx = null
	}
})
const vib = function(leftWeak = 1, leftStrong = 1, rightWeak = 1, rightStrong = 1, duration = 1){
	this.playEffect?.('dual-rumble', {
		duration: duration*1000,
		strongMagnitude: (leftStrong + rightStrong) * .5,
		weakMagnitude: (leftWeak + rightWeak) * .5
	}) ?? this.pulse?.((leftWeak + leftStrong + rightWeak + rightStrong) * .25, duration*1000)
}
function pollGamepads(){
	gp = false
	const gps = new Set()
	let ictx = document.activeElement?._ictx
	if(!(ictx instanceof Ictx)) ictx = null
	else for(const gi of ictx._pointers) if(gi<0) gps.add(~gi)
	const garr = navigator.getGamepads()
	let standard = []
	for(const g of garr) if(g?.mapping == 'standard') standard.push(g)
	const hasStandard = standard.length
	for(const g of standard.length ? standard : garr){
		if(!g) continue
		const gamepad = new GamepadState()
		const h = g.vibrationActuator ?? g.hapticActuators?.[0]
		gamepad.vibrate = h ? vib.bind(h) : null
		for(let i = 0; i < g.buttons.length; i++)
			if(g.buttons[i].pressed) gamepad.set(i)
		for(let i = 0; i < g.axes.length; i+=2)
			gamepad._axes.push({x: g.axes[i], y: hasStandard ? -g.axes[i+1] : g.axes[i+1]})
		if(ictx) ictx.setGamepad(g.index, gamepad), gps.delete(g.index)
		gp = true
	}
	if(ictx) for(const gi of gps) ictx.setGamepad(gi, 0)
	if(gp) requestAnimationFrame(pollGamepads)
}
// Specs say gamepadconnected SHOULD be fired for gamepads that existed on page load. SHOULD != MUST
let gp = true; requestAnimationFrame(pollGamepads)
window.addEventListener('gamepadconnected', () => { if(!gp) requestAnimationFrame(pollGamepads), gp = true })
const overrides = {__proto__: null,
	ContextMenu: 93, Help: 26, Semicolon: 186, Quote: 222, BracketLeft: 219, BracketRight: 221,
	Backquote: 192, Backslash: 220, Minus: 189, EQUAL: 187, IntlRo: 193, IntlYen: 255, MetaLeft: 91,
	MetaRight: 91, PrintScreen: 44, ScrollLock: 145, Pause: 19, F13: 124, F14: 125, F15: 126, F16: 127,
	F17: 128, F18: 129, F19: 130, F20: 131, F21: 132, F22: 133, F23: 134, F24: 135, NumLock: 144,
	Clear: 10, NumpadComma: 110, NumpadDecimal: 110, Numpad0: 96, Numpad1: 97, Numpad2: 98, Numpad3: 99,
	Numpad4: 100, Numpad5: 101, Numpad6: 102, Numpad7: 103, Numpad8: 104, Numpad9: 105
}
const MOUSE = Object.freeze({ LEFT: 0, RIGHT: 2, MIDDLE: 1, BACK: 3, FORWARD: 4 })
const KEY = Object.freeze({
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
const GAMEPAD = Object.freeze({ A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15, MENU: 16, LEFT_STICK: 0, RIGHT_STICK: 1, SELECT: 8, START: 9 })

class PointerState{
	static DEFAULT = 0
	static HIDDEN = 1
	constructor(other = null){
		if(other){
			this.x = +other.x, this.y = +other.y
			this.tiltX = +other.tiltX, this.tiltY = +other.tiltY
			this.pressure = +other.pressure, this.twist = +other.twist
			this.buttons = other.buttons|0
			this.setHint = other.setHint
		}else{
			this.x = 0, this.y = 0
			this.tiltX = 0, this.tiltY = 0
			this.pressure = 0, this.twist = 0
			this.buttons = 0
			this.setHint = null
		}
	}
	update(other){
		this.x = +other.x, this.y = +other.y; this.buttons = other.buttons|0
		this.tiltX = +other.tiltX; this.tiltY = +other.tiltY; this.pressure = +other.pressure; this.twist = +other.twist
		this.setHint = other.setHint
	}
	has(btn){ return !!(this.buttons >> btn & 1) }
	anyIn(from=0, to){ return !!(this.buttons >> from & (typeof to == 'number' ? ~(-1 << (to-from)) : -1)) }
	allIn(from=0, to=0){ return (this.buttons >> from | (-1 << (to-from))) === -1 }
	firstUnset(){ const b = ~this.buttons; return 31 - clz32(b&-b) }
	firstSet(){ const b = this.buttons; return 31 - clz32(b&-b) }
	lastSet(){ return 31 - clz32(this.buttons) }
	[Symbol.iterator](){
		const v = {value: -1, done: false}
		return {[Symbol.iterator](){return this},next:()=>{
			if(v.done) return v
			const a = this.buttons&(-1<<v.value+1), x = 31-clz32(a&-a)
			if(x>=0) return v.value=x,v
			return v.value=-1,v.done=true,v
		}}
	}
	iter(cb, from=0){
		for(;;){
			const a = this.buttons&(-1<<from), x = 31-clz32(a&-a)
			if(x<0) break; from = x+1; cb(x)
		}
	}
	get pressed(){ return !!(this.buttons&1) }
}
const cursors = ['','none','context-menu','help','pointer','progress','wait','cell','crosshair','text','vertical-text','alias','copy','move','no-drop','not-allowed','grab','grabbing','e-resize','n-resize','ne-resize','nw-resize','s-resize','se-resize','sw-resize','w-resize','ew-resize','ns-resize','nesw-resize','nwse-resize','col-resize','row-resize','all-scroll','zoom-in','zoom-out']
for(let i=2;i<cursors.length;i++) PointerState[cursors[i].toUpperCase().replace('-','_')] = i
class GamepadState extends BitField{
	_subscribed = []
	constructor(other = null){
		super(other)
		if(other) this._axes = other._axes.slice(), this.vibrate = other.vibrate
		else this._axes = [], this.vibrate = null
	}
	update(other){
		const m = min(this.length, other.length)
		for(let i = 0; i < m; i++){
			let a = other[i], d = a ^ this[i]; this[i] = a
			while(d){
				const p = 31 - clz32(d&-d)
				for(const ictx of this._subscribed) ictx._fireGamepadButtonUpdate(i<<5|p, !!(a>>p&1))
				d &= -2<<p
			}
		}
		if(m < other.length){ // some buttons down
			for(let i = m; i < other.length; i++){
				let a = other[i]; this.push(a)
				while(a){
					const p = 31 - clz32(a&-a)
					for(const ictx of this._subscribed) ictx._fireGamepadButtonUpdate(i<<5|p, true)
					a &= -2<<p
				}
			}
		}else if(m < this.length){ // some buttons up
			for(let i = m; i < this.length; i++){
				let a = this[i]
				while(a){
					const p = 31 - clz32(a&-a)
					for(const ictx of this._subscribed) ictx._fireGamepadButtonUpdate(i<<5|p, false)
					a &= -2<<p
				}
			}
			this.length = m
		}
		const a1 = other._axes, a2 = this._axes, m2 = min(a1.length, a2.length)
		for(let i = 0; i < m2; i++){
			const n = a1[i], o = a2[i]
			if(n.x===o.x&&n.y===o.y) continue
			o.x = n.x; o.y = n.y
			for(const ictx of this._subscribed) ictx._fireGamepadAxisUpdate(i,n.x,n.y)
		}
		if(m2 < a1.length){ // more axes
			for(let i = m2; i < a1.length; i++){
				const n = a1[i]; a2.push(n)
				if(n.x!==0||n.y!==0)
					for(const ictx of this._subscribed) ictx._fireGamepadAxisUpdate(i,n.x,n.y)
			}
		}else if(m2 < a2.length){
			for(let i = m2; i < a2.length; i++){
				const o = a2[i]
				if(o.x!==0||o.y!==0)
					for(const ictx of this._subscribed) ictx._fireGamepadAxisUpdate(i,0,0)
			}
			a2.length = m2
		}
		this.vibrate = other.vibrate
	}
	axis(i){ return this._axes[i&65535] ?? null }
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
// onKeyDown/onKeyUp/onKeyUpdate are all derived directly from setKey(), so they will always match.
// Same for onNewPointer/onDelPointer/onPointerUpdate from setPointer() and onNewGamepad/onDelGamepad/onGamepadUpdate from setGamepad().

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
	firstPointer = null // This value is always the oldest pointer on this context, or null if no pointer are over this context
	gamepad = null // Primary gamepad. This value is always the oldest gamepad on this context, or null if no gamepads are connected on this context
	_pointers = new Map()
	pointer(id){ return (id|=0) >= 0 ? this._pointers.get(id) ?? null : null }
	iterPointers(cb){ for(const {0:k,1:v} of this._pointers) if(k>=0) cb(k, v) }
	gamepad(id){ return (id=~id) < 0 ? this._pointers.get(id) ?? null : null }
	iterGamepads(cb){ for(const {0:k,1:v} of this._pointers) if(k<0) cb(~k, v) }
	#wcbs = []; #mcbs = []; _rpcbs = []; #rgcbs = []; _rkcbs = []
	_npcbs = []; _ngcbs = []; _dpcbs = []; _dgcbs = []
	_kcbs = new Map()
	// Clears listeners
	reset(){
		this._kcbs.clear(); this._rkcbs.length = 0
		this.#wcbs.length = 0
		this.#mcbs.length = 0
		this._npcbs.length = this._dpcbs.length = this._rpcbs.length = 0
		this._ngcbs.length = this._dgcbs.length = this.#rgcbs.length = 0
	}
	// Clears inputs & removes listeners
	clear(){
		this.reset(); this.clear()
		this.wheel.x = this.wheel.y = 0
		this.mouse.x = this.mouse.y = 0
		this._pointers.clear()
	}
	onWheel(fn){ this.#wcbs.push(fn) }
	onMouse(fn){ this.#mcbs.push(fn) }
	onPointerUpdate(fn){ this._rpcbs.push(typeof fn == 'function' ? fn : fn.setPointer.bind(fn)) }
	onGamepadUpdate(fn){ this.#rgcbs.push(typeof fn == 'function' ? fn : fn.setGamepad.bind(fn)) }
	onNewPointer(fn){ this._npcbs.push(fn) }
	onDelPointer(fn){ this._dpcbs.push(fn) }
	onNewGamepad(fn){ this._ngcbs.push(fn) }
	onDelGamepad(fn){ this._dgcbs.push(fn) }
	onKey(key, fn){
		if(Array.isArray(key)){for(const k of key) this.onKey(k,fn);return}
		const a = this._kcbs.get(key&=0xffff)
		if(a) a.push(fn)
		else this._kcbs.set(key, [fn])
	}
	onGamepadButton(key, fn){
		if(Array.isArray(key)){for(const k of key) this.onGamepadButton(k,fn);return}
		const a = this._kcbs.get(key=~(key&0xffff))
		if(a) a.push(fn)
		else this._kcbs.set(key, [fn])
	}
	onGamepadAxis(axis, fn){
		if(Array.isArray(axis)){for(const k of axis) this.onGamepadButton(k,fn);return}
		const a = this._kcbs.get(axis=~(axis&0xffff|0x10000))
		if(a) a.push(fn)
		else this._kcbs.set(axis, [fn])
	}
	onKeyPress(key, fn, onRelease = false){ let prev = false; this.onKey(key, (down,k) => (((prev == onRelease) & ((prev = down) === !onRelease)) && fn(k), onRelease)) }
	onGamepadButtonPress(key, fn, onRelease = false){ let prev = false; this.onGamepadButton(key, (down,k) => (((prev == onRelease) & ((prev = down) === !onRelease)) && fn(k), onRelease)) }
	onKeyUpdate(fn){ this._rkcbs.push(typeof fn == 'function' ? fn : fn.setKey.bind(fn)) }
	setKey(key, isDown = false, refire = false){
		key &= 0xffff
		let self = this
		while(self){
			if(!(isDown ? self.put(key) : self.pop(key))){
				if(!refire){ self = self.next; continue }
			}else{
				const specCbs = self._kcbs.get(key)
				if(specCbs){
					let i = specCbs.length
					while(i--) try{ const v = specCbs[i](isDown, key, self); if(typeof v == 'boolean') isDown = v }catch(e){Promise.reject(e)}
				}
			}
			let i = self._rkcbs.length
			while(i--) try{ const v = self._rkcbs[i](key, isDown, self); if(typeof v == 'boolean') isDown = v }catch(e){Promise.reject(e)}
			self = self.next
		}
		return isDown
	}
	refireKey(key){ this.setKey(key, this.has(key), true) }
	_fireGamepadButtonUpdate(key = 0, isDown = false){
		const specCbs = this._kcbs.get(~key)
		if(!specCbs) return
		let i = specCbs.length
		while(i--) try{ const v = specCbs[i](isDown, key, this); if(typeof v == 'boolean') isDown = v }catch(e){Promise.reject(e)}
	}
	_fireGamepadAxisUpdate(axis = 0, x = 0, y = 0){
		const specCbs = this._kcbs.get(~(axis|0x10000))
		if(!specCbs) return
		let i = specCbs.length
		while(i--) try{ const v = specCbs[i](x, y, this); if(typeof v == 'object') v ? (x = +v.x, y = +v.y) : (x=y=0) }catch(e){Promise.reject(e)}
	}
	setPointer(id, pointer = null, refire = false){
		if((id|=0) < 0) return
		let self = this
		while(self){
			let p = self._pointers.get(id) ?? null
			if(!p){
				if(pointer){
					p = new PointerState(pointer)
					if(!id) self.cursor = p
					self.firstPointer ??= p
					self._pointers.set(id, p)
					let i = self._npcbs.length
					while(i--) try{ const p2 = self._npcbs[i](id, pointer, null, self); if(typeof p2 == 'object') pointer = p2 }catch(e){Promise.reject(e)}
				}else if(!refire){ self = self.next; continue }
			}else if(!pointer){
				self._pointers.delete(id)
				if(!id) self.cursor = null
				if(p == this.firstPointer){
					this.firstPointer = null
					for(const {0:k,1:v} of this._pointers) if(k>=0){ this.firstPointer = v; break }
				}
				let i = self._dpcbs.length
				while(i--) try{ const p2 = self._dpcbs[i](id, pointer, p, self); if(typeof p2 == 'object') pointer = p2 }catch(e){Promise.reject(e)}
			}else p.update(pointer)
			let i = self._rpcbs.length
			while(i--) try{ const p2 = self._rpcbs[i](id, pointer, self); if(typeof p2 == 'object') pointer = p2 }catch(e){Promise.reject(e)}
			self = self.next
		}
		return pointer
	}
	#setMainGamepad(g){
		this.gamepad = g
		g.iter(i => this._fireGamepadButtonUpdate(i, true))
		const a = g._axes
		for(let i = 0; i < a.length; i++){
			const n = a[i]
			if(n.x!==0&&n.y!==0) this._fireGamepadAxisUpdate(i, n.x, n.y)
		}
		g._subscribed.push(this)
	}
	refirePointer(id){ const p = this._pointers.get(id); this.setPointer(id, p ? new PointerState(p) : null, true) }
	refirePointers(){ for(const {0:k,1:v} of this._pointers) if(k >= 0) this.setPointer(k, new PointerState(v), true) }
	setGamepad(id, gamepad = null, refire = false){
		if((id=~id) >= 0) return
		let self = this
		while(self){
			let g = self._pointers.get(id) ?? null
			if(!g){
				if(gamepad){
					g = new GamepadState(gamepad)
					if(!this.gamepad) this.#setMainGamepad(g)
					self._pointers.set(id, g)
					let i = self._ngcbs.length
					while(i--) try{ const p2 = self._ngcbs[i](id, gamepad, null, self); if(typeof p2 == 'object') gamepad = p2 }catch(e){Promise.reject(e)}
				}else if(!refire){ self = self.next; continue }
			}else if(!gamepad){
				self._pointers.delete(id)
				if(g == this.gamepad){
					this.gamepad = null
					const arr = g._subscribed
					let i = arr.indexOf(this)
					if(i >= 0){ // safeguard
						while(i<arr.length) arr[i] = arr[++i]
						arr.pop()
					}
					g.iter(i => this._fireGamepadButtonUpdate(i, false))
					const a = g._axes
					for(let i = 0; i < a.length; i++){
						const n = a[i]
						if(n.x!==0&&n.y!==0) this._fireGamepadAxisUpdate(i, 0, 0)
					}
					for(const {0:k,1:v} of this._pointers) if(k<0){ this.#setMainGamepad(v); break }
				}
				let i = self._dgcbs.length
				while(i--) try{ const p2 = self._dgcbs[i](id, gamepad, g, self); if(typeof p2 == 'object') gamepad = p2 }catch(e){Promise.reject(e)}
			}else g.update(gamepad)
			let i = this.#rgcbs.length
			while(i--) try{ const p2 = this.#rgcbs[i](id, gamepad, self); if(typeof p2 == 'object') gamepad = p2 }catch(e){Promise.reject(e)}
			self = self.next
		}
		return gamepad
	}
	refireGamepad(id){ const p = this._pointers.get(~id); this.setGamepad(id, p ? new GamepadState(p) : null, true) }
	refireGamepads(){ for(const {0:k,1:v} of this._pointers) if(k < 0) this.setGamepad(~k, new GamepadState(v), true) }
	fireWheel(dx=0, dy=0){
		if(typeof dx == 'object') dy = +dx.y, dx = +dx.x
		let self = this
		while(self){
			this.wheel.x += dx; this.wheel.y += dy
			let i = this.#wcbs.length
			while(i--) try{ const p = this.#wcbs[i](dx, dy, self); if(typeof p == 'object') p ? (dx = +p.x, dy = +p.y) : (dx=dy=0) }catch(e){Promise.reject(e)}
			self = self.next
		}
		return {x: dx, y: dy}
	}
	fireMouse(dx=0, dy=0){
		if(typeof dx == 'object') dy = +dx.y, dx = +dx.x
		let self = this
		while(self){
			this.mouse.x += dx; this.mouse.y += dy
			let i = this.#mcbs.length
			while(i--) try{ const p = this.#mcbs[i](dx, dy, self); if(typeof p == 'object') p ? (dx = +p.x, dy = +p.y) : (dx=dy=0) }catch(e){Promise.reject(e)}
			self = self.next
		}
		return {x: dx, y: dy}
	}
	clearDeltas(){ this.mouse.x = this.mouse.y = this.wheel.x = this.wheel.y = 0 }
}
let ptrlockPointer = null, ptrlockIctx = null
const pointers = []
Gamma.input = ($, can = $.canvas) => {
	if(can._ictx) return
	$.MOUSE = MOUSE
	$.KEY = KEY
	$.GAMEPAD = GAMEPAD
	$.PointerState = PointerState; $.GamepadState = GamepadState
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
	const ictx = $.ictx = can._ictx = new Ictx()
	$.InputContext = () => new Ictx()
	can.style.outline = 'none'
	can.style.touchAction = 'none'
	can.style.setProperty('-webkit-tap-highlight-color', 'transparent')
	can.tabIndex = 0
	let ignoreBlur = false
	// for BitField.get(0-7) mouse buttons
	can.addEventListener('mousedown', e => {
		if(document.activeElement?._ictx != ictx) can.focus()
		e.preventDefault()
		ictx.setKey(e.button, true)
	})
	can.addEventListener('mouseup', e => {
		e.preventDefault()
		ictx.setKey(e.button, false)
	})
	can.addEventListener('contextmenu', e => e.preventDefault())
	can.addEventListener('wheel', e => {
		e.preventDefault()
		ictx.fireWheel(e.wheelDeltaX, e.wheelDeltaY)
	}, {passive: false})
	let prevx = NaN, prevy = NaN
	can.addEventListener('mousemove', e => {
		e.preventDefault()
		let dx = 0, dy = 0
		try{
			if(document.pointerLockElement == can){
				dx = e.movementX
				dy = e.movementY
				if(oldSafari){
					const {width,height} = can.getBoundingClientRect()
					dx *= devicePixelRatio*can.offsetWidth/width
					dy *= devicePixelRatio*can.offsetHeight/height
				}else if(!ptrlockOpts){
					dx *= devicePixelRatio
					dy *= devicePixelRatio
				}
			}else if(prevx == prevx){ // !isnan(prevx)
				dx = e.offsetX-prevx, dy = e.offsetY-prevy
			}else return
		}finally{ prevx = e.offsetX, prevy = e.offsetY }
		ictx.fireMouse(dx, -dy)
	})
	let cur = 0, prevCur = 0
	$.onFlush(() => {
		if(cur !== prevCur) can.style.cursor = typeof cur=='number'?cursors[cur]:`url(${CSS.escape(cur)})`, prevCur = cur
	})
	let toCaptureEl = null, toCaptureKey = 0
	const allowRepeats = new BitField()
	const onkeydown = e => {
		const code = overrides[e.code] ?? e.keyCode
		if(e.repeat){ return allowRepeats.has(code) }
		toCaptureEl = null
		let ret = ictx.setKey(code, true)
		if(toCaptureEl && toCaptureKey == code){
			if(document.activeElement != toCaptureEl) ignoreBlur = true, toCaptureEl.focus(), ignoreBlur = false
			ret = true
		}else if(document.activeElement != can) ret = false
		ret ? allowRepeats.set(code) : allowRepeats.unset(code)
		return ret
	}
	const onkeyup = e => {
		const code = overrides[e.code] ?? e.keyCode
		toCaptureEl = null
		let ret = ictx.setKey(code, false)
		if(toCaptureEl && toCaptureKey == ~code){
			if(document.activeElement != toCaptureEl) ignoreBlur = true, toCaptureEl.focus(), ignoreBlur = false
			ret = true
		}else if(document.activeElement != can) ret = false
		allowRepeats.unset(code)
		return ret
	}
	const onblur = _ => {
		if(ignoreBlur) return
		ictx.iter(n => ictx.setKey(n, false))
		for(const k of ictx._pointers.keys()) if(k<0) ictx.setGamepad(~k, null)
	}
	const _addFocusableAlternate = c => {
		c._ictx = ictx
		c.addEventListener('keydown', onkeydown)
		c.addEventListener('keyup', onkeyup)
		c.addEventListener('blur', onblur)
	}
	_addFocusableAlternate(can)
	// Seamlessly switch the focused element
	// Also sets up listeners and additional properties on the element if necessary
	// If this is called from within a key event, on, for example, a text input, the text input will receive the pending event and act on it appropriately
	$.captureKeyEvent = (domEl, key=0, isDown=false) => {
		if((key|=0) < 0) return
		if(!domEl._ictx) _addFocusableAlternate(domEl)
		toCaptureEl = domEl; toCaptureKey = key^-!isDown
	}
	$.setFocused = (domEl = null) => {
		if(!domEl) domEl = can
		else if(!domEl._ictx) _addFocusableAlternate(domEl)
		ignoreBlur = true; domEl.focus(); ignoreBlur = false
	}
	const setCursor = t => {cur=t}
	const pointerupdate = e => {
		if(e.pointerId==-1) return
		const ptr = new PointerState()
		ptr.x = e.offsetX/can.offsetWidth
		ptr.y = 1-e.offsetY/can.offsetHeight
		ptr.buttons = e.buttons, ptr.pressure = e.pressure
		// deg to rad
		ptr.tiltX = e.tiltX*.017453292519943295
		ptr.tiltY = e.tiltY*.017453292519943295
		ptr.twist = e.twist*.017453292519943295
		let id = 0
		if(e.pointerType == 'mouse'){
			ptr.setHint = setCursor
			if(document.pointerLockElement == can){ ptrlockPointer = ptr; return }
		}else{
			id = pointers.indexOf(e.pointerId)+1
			if(!id) id = pointers.push(e.pointerId)
		}
		can._ictx.setPointer(id, ptr)
	}
	can.addEventListener('pointerover', pointerupdate)
	can.addEventListener('pointerdown', pointerupdate)
	can.addEventListener('pointermove', pointerupdate)
	can.addEventListener('pointerup', pointerupdate)
	can.addEventListener('pointerleave', e => {
		if(e.pointerId==-1) return
		let id = 0
		if(e.pointerType != 'mouse'){
			id = pointers.indexOf(e.pointerId)+1
			if(!id) return
			if(id == pointers.length){
				let i = pointers.length-1
				do{ pointers.pop() }while(i&&!pointers[--i])
			}else pointers[id-1] = null
		}else if(document.pointerLockElement == can){ ptrlockPointer = null; return }
		ictx.setPointer(id, null)
	})
	can.addEventListener('touchend', e => e.preventDefault())
}}