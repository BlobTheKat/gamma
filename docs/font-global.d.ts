/// <reference path="./font.d.ts" />
/// <reference path="./gamma-global.d.ts" />
export {}
declare global{
	/** See `RichText.addTextPass()`, `Font.draw()` */
	const TEXT_AA: number
	namespace Shader{
		/** MSDF Shader, default shader used by `RichText` and expected by `Font.draw()` */
		const MSDF: Shader
		/**
		 * A specialized Shader constructor with the exact same signature, except the following differences within the shader source code:
		 * - A new function `float field();` returns the current raw SDF value in [0,1]
		 *    - Always returns 1 for line passes
		 * - A new parameter `scale` encodes the scale and offset used to transform raw SDF values into alpha values, as specified by the text pass.
		 *    - Default behavior would look something like `clamp( (field()-.5 + scale.x) * scale.y + .5, 0., 1.)`
		 * - Other parameters (the "values" of the text/line pass) are accessed via `value0`, `value1`, ... instead of `arg0`, `arg1`, ...
		 *    - The first value is `value0`, which is the color by convention
		 * @param glsl The shader's source code. See `Shader()`
		 * @param inputs Shader arguments. See `Shader()`
		 * @param defaults Argument default values. See `Shader()`
		 * @param uniforms Shader uniforms. See `Shader()`
		 * @param uDefaults Uniform default values. See `Shader()`
		 * @param output Shader output type. See `Shader()`
		 * @param intFrac Integer texture share. See `Shader()`
		 */
		function font(glsl: string, inputs: number | number[], defaults: number | number[], uniforms: number | number[], uDefaults: number | number[], output: number, intFrac: number): Shader
	}
	/**
	 * Create a BreakToken. Group many `BreakToken`s into an array (a "token class") to fully specify how a piece of text should be tokenized, which defines how and where text can be broken by the `RichText.break()` function. 
	 * @param regex A regular expression defining what this token matches, e.g /\w+/y to match a word. Should have the `y` flag and no `g` flag (Otherwise, they will be added/removed for you, which will come at a small but potentially unnecessary cost)
	 * 
	 * If a string is passed, the pattern will match any amount of those characters. For example, `"0123456789"` will match any number of digits
	 * 
	 * @param type The token type, which is one of
	 *    - `BreakToken.NORMAL` If token takes up 50% or more of the current line, break it up into two. Otherwise, put it all on the next line.
	 *    - `BreakToken.NEVER_BREAK` Token cannot be broken up. Always put it on the next line
	 *    - `BreakToken.ALWAYS_BREAK` Token should always be broken into two or more wherever appropriate.
	 *    - `BreakToken.OVERFLOW` Token should overflow the line and never create a new line
	 *    - `BreakToken.VANISH` Token is not rendered at all when it surpasses the end of a line
	 *    - `BreakToken.TRUNCATE` Like VANISH, but only the characters that surpass the end of a line are not rendered
	 *    - `BreakToken.SQUISH` Token is squished (scaled X) to prevent overflowing.
	 *    - `BreakToken.SQUISH_BREAK` Token is squished by up to 50%, beyond which it will be broken into 2 instead. Provided as a more sane alternative to SQUISH
	 * 
	 * Additionally, the type can be OR'd with any number of the following flags. These always have an effect, even when the token doesn't overflow a line
	 *    - `BreakToken.WRAP_AFTER` Always create a new line after this token. Useful to make the newline character `\n` actually work.
	 *    - `BreakToken.WRAP_BEFORE` Always create a new line before this token. Can be used as an alternative to WRAP_AFTER in specific cases, or combined to make this token always stand on its own line
	 *    - `BreakToken.INVISIBLE` This token is never rendered
	 * @param separator A separator to be inserted when the token is broken (if it can be broken). For example, a `-` is often inserted to indicate a word was split across to the next line
	 * @param next Next token class. If this token is matched, the next part of the string will use a different set of BreakTokens to tokenize. You can create multiple arrays of `BreakToken`s that point to each other in this fashion to create far more complex context-sensitive tokenization. Leave unspecified to not make use of this feature (the next part of the string to be tokenized will use the exact same token class as this one)
	 */
	type BreakToken = {}
	function BreakToken(pattern: RegExp | string, type: number, separator: string, next?: BreakToken[]): BreakToken

	namespace BreakToken{
		/** See `BreakToken()` */ const NORMAL = 0,
		/** See `BreakToken()` */ const NEVER_BREAK = 1,
		/** See `BreakToken()` */ const ALWAYS_BREAK = 2,
		/** See `BreakToken()` */ const OVERFLOW = 3,
		/** See `BreakToken()` */ const VANISH = 4,
		/** See `BreakToken()` */ const TRUNCATE = 5,
		/** See `BreakToken()` */ const SQUISH = 6,
		/** See `BreakToken()` */ const SQUISH_BREAK = 7,
		/** See `BreakToken()` */ const WRAP_AFTER = 8,
		/** See `BreakToken()` */ const WRAP_BEFORE = 16,
		/** See `BreakToken()` */ const INVISIBLE = 32
	}

	//const defaultSet = [BreakToken(/\r\n?|\n/y, BreakToken.WRAP_AFTER | BreakToken.INVISIBLE, ''), BreakToken(/[$£"+]?[\w'-]+[,.!?:;"^%€*]?/yi, BreakToken.NORMAL, '-'), BreakToken(/[ \t]+/y, BreakToken.VANISH)]

	/**
	 * Create a `RichText` object, which offers many functions for working with text of many styles, for example, measuring width, line-breaking, curved text, multipass (such as text shadows), text with other custom components inside, measuring where a point (such as a mouse click) lands, etc...
	 * 
	 * Make sure to take a good look at the methods and properties available on the object to know what's possible.
	 * @param font The font to use. If not specified, the default font is `null`, which means text won't be displayed
	 */
	function RichText(font?: Font?): RichText

	interface RichText{
		sub(): RichText
		reset(font?: Font?): void
		font: Font?;
		shader: Shader
		scale: number
		yOffset: number
		stretch: number
		skew: number
		/** Shorthand for `stretch * scale`, the effective width modifier after all scaling. Can also be assigned to calculate the correct `stretch` for the current `scale` */
		letterWidth: number
		letterSpacing: number
		curve: number
		scaleBy(a = 1, adv = true, yo = true){
			if(a==1) return
			const q = this.#q, len = q.length
			let idx = 0, o = 0
			while(idx < len){
				const s = q[idx++]
				if(typeof s == 'number'){
					if(s == SC || (s == YO && yo)){
						if(!o) o = 1
						q[idx] *= a
					}else if(s == ADV && adv) q[idx] *= a
					idx++
				}else if(typeof s == 'string' || typeof s == 'function') if(!o) o = 2
			}
			if(o != 1) q.unshift(SC, a)
			q.#_sc *= a; if(yo) q.#_yo *= a
			q.#w=NaN; q.#l = null
		}
		offsetBy(a = 0){
			if(!a) return
			const q = this.#q, len = q.length
			let idx = 0, o = 0
			while(idx < len){
				const s = q[idx++]
				if(typeof s == 'number'){
					if(s == YO){
						if(!o) o = 1
						q[idx] += a
					}
					idx++
				}else if(typeof s == 'string' || typeof s == 'function') if(!o) o = 2
			}
			if(o != 1) q.unshift(YO, a)
			q.#_yo += a; q.#l = null
		}
		stretchBy(a = 1, adv = true, sk = false){
			if(a==1) return
			const q = this.#q, len = q.length
			let idx = 0, o = 0
			while(idx < len){
				const s = q[idx++]
				if(typeof s == 'number'){
					if(s == ST || (s == SK && sk)){
						if(!o) o = 1
						q[idx] *= a
					}else if(s == ADV && adv) q[idx] *= a
					idx++
				}else if(typeof s == 'string' || typeof s == 'function') if(!o) o = 2
			}
			if(o != 1) sk ? q.unshift(SK, a, ST, a) : q.unshift(ST, a)
			q.#_st *= a; if(sk) q.#_sk *= a
			q.#w=NaN; q.#l = null
		}
		skewBy(a = 0){
			if(!a) return
			const q = this.#q, len = q.length
			let idx = 0, o = 0
			while(idx < len){
				const s = q[idx++]
				if(typeof s == 'number'){
					if(s == SK){
						if(!o) o = 1
						q[idx] += a
					}
					idx++
				}else if(typeof s == 'string' || typeof s == 'function') if(!o) o = 2
			}
			if(o != 1) q.unshift(SK, a)
			q.#_sk += a; q.#l = null
		}
		spaceBy(a = 0){
			if(!a) return
			const q = this.#q, len = q.length
			let idx = 0, o = 0
			while(idx < len){
				const s = q[idx++]
				if(typeof s == 'number'){
					if(s == LSB){
						if(!o) o = 1
						q[idx] += a
					}
					idx++
				}else if(typeof s == 'string' || typeof s == 'function') if(!o) o = 2
			}
			if(o != 1) q.unshift(LSB, a)
			q.#_lsb += a
			q.#w=NaN; q.#l = null
		}
		curveBy(a = 0){
			if(!a) return
			const q = this.#q, len = q.length
			let idx = 0, o = 0
			while(idx < len){
				const s = q[idx++]
				if(typeof s == 'number'){
					if(s == ARC){
						if(!o) o = 1
						q[idx] += a
					}else if(s == ADV && !o) o = 2
					idx++
				}else if(typeof s == 'string' || typeof s == 'function') if(!o) o = 2
			}
			if(o != 1) q.unshift(ARC, a)
			q.#_arc += a
			q.#w=NaN; q.#l = null
		}
		addTextPass(ord, x, y, a, off=0, spr=NaN){
			const o = {off, spr: 1/spr, 0: null, 1: V}
			if(a) for(let i=0;i<a.length;i++) o[i+2] = a[i]
			const v = this.#v, v2 = this.#v = []
			let i = 0
			for(; i < v.length; i += 4) if(v[i] < ord){
				v2.push(v[i],v[i+1],v[i+2],v[i+3])
			}else{ if(v[i]==ord) i+=4; break }
			v2.push(ord, +x, +y, o)
			while(i < v.length) v2.push(v[i], v[i+1], v[i+2], v[i+3]), i += 4
			this.#q.#l = null
		}
		addLinePass(ord, y0, h, a){
			const o = {0: vec4one, 1: vec2l}
			for(let i=0;i<a.length;i++) o[i+2] = a[i]
			const v = this.#v, v2 = this.#v = []
			let i = 0
			for(; i < v.length; i += 4) if(v[i] < ord){
				v2.push(v[i],v[i+1],v[i+2],v[i+3])
			}else{ if(v[i]==ord) i+=4; break }
			v2.push(ord, o, +y0, +h)
			while(i < v.length) v2.push(v[i], v[i+1], v[i+2], v[i+3]), i += 4
			this.#q.#l = null
		}
		setValues(ord, a){
			const v = this.#v = this.#v.slice()
			for(let i = 0; i < v.length; i += 4) if(v[i] == ord){
				let a2 = v[i+=3]
				if(typeof a2=='number') a2 = v[i-=2]
				v[i] = a2 = Object.assign({}, a2)
				for(let i=a.length-1;i>=0;i--){
					const a1 = a[i]
					if(a1 !== undefined) a2[i+2] = a1
				}
				break
			}else if(v[i] > ord) break
			this.#q.#l = null
		}
		delPass(ord){
			const v = this.#v, v2 = this.#v = []
			let i = 0
			for(; i < v.length; i += 4) if(v[i] < ord){
				v2.push(v[i],v[i+1],v[i+2],v[i+3])
			}else{ if(v[i]==ord) i+=4; break }
			while(i < v.length) v2.push(v[i], v[i+1], v[i+2], v[i+3]), i += 4
			this.#q.#l = null
		}

		insertTextPass(ord, x, y, a, off=0, spr=NaN){
			const o = {off, spr: 1/spr, 0:null,1: V}
			if(a) for(let i=0;i<a.length;i++) o[i+2] = a[i]
			const q = this.#q, len = q.length
			let idx = 0, p = 0
			while(idx < len){
				let s = q[idx++]
				if(typeof s == 'number' && s>0) idx++
				else if(typeof s == 'string' || typeof s == 'function'){ if(!p) p = 2 }
				else if(Array.isArray(s)){
					if(!p) p = 1
					const s2 = q[idx-1] = []
					let i = 0
					for(; i < s.length; i += 4) if(s[i] < ord){
						s2.push(s[i],s[i+1],s[i+2],s[i+3])
					}else{ if(s[i]==ord) i+=4; break }
					s2.push(ord, +x, +y, o)
					while(i < s.length) s2.push(s[i], s[i+1], s[i+2], s[i+3]), i += 4
				}
			}
			if(p != 1) q.unshift(ord>0?[0,0,0,O,ord,x,y,o]:ord<0?[ord,x,y,o,0,0,0,O]:[ord,x,y,o])
			q.#l = null
		}
		insertLinePass(ord, y0, h, a){
			const o = {0: vec4one, 1: vec2l}
			for(let i=0;i<a.length;i++) o[i+2] = a[i]
			const q = this.#q, len = q.length
			let idx = 0, p = 0
			while(idx < len){
				let s = q[idx++]
				if(typeof s == 'number' && s>0) idx++
				else if(typeof s == 'string' || typeof s == 'function'){ if(!p) p = 2 }
				else if(Array.isArray(s)){
					if(!p) p = 1
					const s2 = q[idx-1] = []
					let i = 0
					for(; i < s.length; i += 4) if(s[i] < ord){
						s2.push(s[i],s[i+1],s[i+2],s[i+3])
					}else{ if(s[i]==ord) i+=4; break }
					s2.push(ord, o, y0, h)
					while(i < s.length) s2.push(s[i], s[i+1], s[i+2], s[i+3]), i += 4
				}
			}
			if(p != 1) q.unshift(ord>0?[0,0,0,O,ord,o,y0,h]:ord<0?[ord,o,y0,h,0,0,0,O]:[ord,o,y0,h])
			q.#l = null
		}
		adjustValues(ord, a){
			const q = this.#q, len = q.length
			let idx = 0, p = 0
			while(idx < len){
				const s = q[idx++]
				if(typeof s == 'number' && s>0) idx++
				else if(typeof s == 'string' || typeof s == 'function'){ if(!p) p = 2 }
				else if(Array.isArray(s)){
					const v = q[idx-1] = s.slice()
					if(s == q.#_v) q.#_v = v
					let i = 0
					for(; i < v.length; i += 4) if(v[i] == ord){
						let a2 = v[i+=3]
						if(typeof a2=='number') a2 = v[i-=2]
						v[i] = a2 = Object.assign({}, a2)
						for(let i=a.length-1;i>=0;i--){
							const a1 = a[i]
							if(a1 !== undefined) a2[i+2] = a1
						}
						break
					}
				}
			}
			q.#l = null
		}
		removePass(ord){
			const q = this.#q, len = q.length
			let idx = 0
			w: while(idx < len){
				let s = q[idx++]
				if(typeof s == 'number' && s>0) idx++
				else if(Array.isArray(s)){
					let i = 0
					for(; i < s.length; i += 4) if(s[i] > ord) continue w
					else if(s[i]==ord){
						i += 4
						while(i < s.length)
							s[i-4]=s[i],s[i-3]=s[i+1],s[i-2]=s[i+2],s[i-1]=s[i+3], i += 4
						s.length -= 4
						break
					}
				}
			}
		}
		get index(){ return this.#m }
		set index(a){ this.#m = !!a; this.#q.#l==this&&(this.#q.#l=null) }
		advance(gap = 0){
			const q = this.#q
			if(q.#l!=this) this.#setv(q)
			q.push(ADV, +gap); q.#w=NaN
		}
		#setv(q){
			if(this.#f!=q.#_f)q.push(q.#_f=this.#f)
			if(this.#sh!=q.#_sh)q.push(SH,q.#_sh=this.#sh)
			if(this.#sc!=q.#_sc)q.push(SC,q.#_sc=this.#sc)
			if(this.#yo!=q.#_yo)q.push(YO,q.#_yo=this.#yo)
			if(this.#st!=q.#_st)q.push(ST,q.#_st=this.#st)
			if(this.#sk!=q.#_sk)q.push(SK,q.#_sk=this.#sk)
			if(this.#lsb!=q.#_lsb)q.push(LSB,q.#_lsb=this.#lsb)
			if(this.#arc!=q.#_arc)q.push(ARC,q.#_arc=this.#arc)
			if(this.#v!=q.#_v)q.push(this.#v),q.#_v=this.#v
			if(this.#m!=q.#_m)q.push(this.#m),q.#_m=this.#m
			q.#l=this
		}
		copy(){
			const q = this.#q, q2 = q.slice()
			const s = q2.#l = this.sub(); s.#q = q2
			q2.#_f = q.#_f
			q2.#_sh = q.#_sh
			q2.#_sc = q.#_sc
			q2.#_yo = q.#_yo
			q2.#_st = q.#_st
			q2.#_sk = q.#_sk
			q2.#_lsb = q.#_lsb
			q2.#_arc = q.#_arc
			q2.#_v = q.#_v
			q2.#_m = q.#_m
			q2.#len = q.#len
			q2.#w = q.#w
			return s
		}
		slice(i=0, j=Infinity){
			const q = this.#q, q2 = new itxtstream()
			if(i<0) (i+=q.#len)<0&&(i=0)
			if(j<0) (j+=q.#len)<0&&(j=0)
			const st = new txtstream(q2)
			let idx = 0
			if(j<=0){
				while(idx < q.length){
					const s = q[idx++]
					if(typeof s=='number'){
						const v = q[idx++]
						switch(s){
							case ADV: idx -= 2; break
							case SH: st.#sh = v; break
							case SC: st.#sc = v; break
							case YO: st.#yo = v; break
							case ST: st.#st = v; break
							case SK: st.#sk = v; break
							case LSB: st.#lsb = v; break
							case ARC: st.#arc = v; break
						}
					}else if(typeof s == 'string' || typeof s == 'function') break
					else if(!Array.isArray(s)) st.#f = s
					else if(typeof s == 'boolean') st.#m = s
					else st.#v = s
				}
				st.#setv(q2)
				return st
			}
			j = j>=i ? j-i : 0
			let str = ''
			while(i > 0 && idx < q.length){
				const s = q[idx++]
				if(typeof s=='number'){
					const v = q[idx++]
					switch(s){
						case SH: st.#sh = v; break
						case SC: st.#sc = v; break
						case YO: st.#yo = v; break
						case ST: st.#st = v; break
						case SK: st.#sk = v; break
						case LSB: st.#lsb = v; break
						case ARC: st.#arc = v; break
					}
				}else if(typeof s == 'string'){
					if(!q2.#_m) continue
					i -= s.length
					if(i<0){
						str = s.slice(i,(j+=i)+s.length)
						break
					}
				}else if(Array.isArray(s)) st.#v = s
				else if(typeof s == 'object') st.#f = s
				else if(typeof s == 'boolean') st.#m = s
			}
			st.#setv(q2)
			if(str) q2.push(str), q2.#len += str.length
			while(j > 0 && idx < q.length){
				const s = q[idx++]
				q2.push(s)
				if(typeof s=='number'){
					const v = q[idx++]
					q2.push(v)
					switch(s){
						case SH: st.#sh = v; break
						case SC: st.#sc = v; break
						case YO: st.#yo = v; break
						case ST: st.#st = v; break
						case SK: st.#sk = v; break
						case LSB: st.#lsb = v; break
						case ARC: st.#arc = v; break
					}
				}else if(typeof s == 'string'){
					if(!q2.#_m) continue
					j -= s.length; q2.#len += s.length
					if(j < 0) q2[q2.length-1] = s.slice(0, j), q2.#len += s.length+j
					else q2.#len += s.length
				}else if(Array.isArray(s)) st.#v = s
				else if(typeof s == 'object') st.#f = s
				else if(typeof s == 'boolean') st.#m = s
			}
			return st
		}
		trim(i=Infinity){
			const q = this.#q
			if(i<0) (i+=q.#len)<0&&(i=0)
			if(i>q.#len) return
			let idx = 0
			q.#_f = null; q.#_sh = msdfShader; q.#_sc = 1; q.#_st = 1; q.#_yo = 0
			q.#_sk = 0; q.#_lsb = 0; q.#_m = true; q.#_arc = 0; q.#_v = DEFAULT_PASSES
			if(!(q.#len = i < 0 ? 0 : i)){
				while(idx < q.length){
					const s = q[idx++]
					if(typeof s=='number'){
						const v = q[idx++]
						switch(s){
							case ADV: idx -= 2; break
							case SH: q.#_sh = v; break
							case SC: q.#_sc = v; break
							case YO: q.#_yo = v; break
							case ST: q.#_st = v; break
							case SK: q.#_sk = v; break
							case LSB: q.#_lsb = v; break
							case ARC: q.#_arc = v; break
						}
					}else if(typeof s == 'string' || typeof s == 'function'){ idx--; break }
					else if(Array.isArray(s)) q.#_v = s
					else if(typeof s == 'boolean') q.#_m = s
					else q.#_f = s
				}
			}else while(i > 0 && idx < q.length){
				const s = q[idx++]
				if(typeof s=='number'){
					const v = q[idx++]
					switch(s){
						case SH: q.#_sh = v; break
						case SC: q.#_sc = v; break
						case YO: q.#_yo = v; break
						case ST: q.#_st = v; break
						case SK: q.#_sk = v; break
						case LSB: q.#_lsb = v; break
						case ARC: q.#_arc = v; break
					}
				}else if(typeof s == 'string'){
					if(!q.#_m) continue
					i -= s.length
					if(i<0){ q[idx-1] = s.slice(0, i); break }
				}else if(Array.isArray(s)) q.#_v = s
				else if(typeof s == 'object') q.#_f = s
				else if(typeof s == 'boolean') q.#_m = s
			}
			this.#f = q.#_f
			this.#sh = q.#_sh
			this.#sc = q.#_sc
			this.#yo = q.#_yo
			this.#st = q.#_st
			this.#sk = q.#_sk
			this.#lsb = q.#_lsb
			this.#arc = q.#_arc
			this.#v = q.#_v
			q.length = idx
			q.#w=NaN
		}
		concat(st){
			const q = this.#q, q2 = st.#q
			q.#len += q2.#len
			let idx = 0
			this.#f = null; this.#sh = msdfShader; this.#sc = 1; this.#yo = 0; this.#st = 1
			this.#sk = 0; this.#lsb = 0; this.#arc = 0; this.#v = DEFAULT_PASSES
			// If concat to ourselves, don't loop infinitely
			const q2l = q2.length
			w: while(idx < q2l){
				const s = q2[idx++]
				if(typeof s=='number'){
					const v = q2[idx++]
					switch(s){
						case ADV: idx -= 2; break w
						case SH: this.#sh = v; break
						case SC: this.#sc = v; break
						case YO: this.#yo = v; break
						case ST: this.#st = v; break
						case SK: this.#sk = v; break
						case LSB: this.#lsb = v; break
						case ARC: this.#arc = v; break
					}
				}else if(typeof s == 'string' || typeof s == 'function'){ idx--; break }
				else if(Array.isArray(s)) this.#v = s
				else if(typeof s == 'boolean') this.#m = s
				else this.#f = s
			}
			this.#setv(q)
			while(idx < q2l){
				const s = q2[idx++]
				q.push(s)
				if(typeof s=='number'){
					const v = q2[idx++]
					q.push(v)
					switch(s){
						case SH: this.#sh = v; break
						case SC: this.#sc = v; break
						case YO: this.#yo = v; break
						case ST: this.#st = v; break
						case SK: this.#sk = v; break
						case LSB: this.#lsb = v; break
						case ARC: this.#arc = v; break
					}
				}else if(typeof s == 'string'){
					if(q.#_m) q.#len += s.length
				}else if(Array.isArray(s)) this.#v = s
				else if(typeof s == 'boolean') this.#m = s
				else if(typeof s == 'object') this.#f = s
			}
			q.#w=NaN
		}
		get length(){return this.#q.#len}
		set length(a){this.trim(a)}
		get width(){
			const q = this.#q
			let w=q.#w
			if(w==w) return w
			w = 0
			let cmap = null
			let idx = 0
			let sc = 1, st = 1, lsb = 0, ar = 0, ar1 = 0
			let chw = 1
			let last = -1, lastCw = 1
			while(idx < q.length){
				let s = q[idx++]
				if(typeof s=='number'){
					const v = q[idx++]
					switch(s){
						case ADV: w += chw*v; last = -1; break
						case SC: chw = (sc = v) * st; last = -1; break
						case ST: chw = (st = v) * sc; last = -1; break
						case YO: case SK: last = -1; break // Suppress kerning across geometry change
						case LSB: lsb = v; break
						case ARC: ar1 = 1/v; ar = v; break
					}
				}else if(typeof s == 'string'){
					if(cmap) for(const ch of s){
						const c = ch.codePointAt()
						const g = cmap.get(~c) ?? cmap._default
						if(!g) continue
						const ker = (cmap.get(c+last*1114112) ?? 0) * min(chw, lastCw)
						last = c; lastCw = chw
						const cw = (g.xadv+lsb)*chw + ker
						w += ar ? asin(cw*ar)*ar1||cw : cw
						if(g.tex?.waiting) g.tex.load()
					}
				}else if(typeof s == 'object'){
					if(!s){ cmap = null; continue }
					if(Array.isArray(s)) continue
					cmap = s
					s.then?.(() => q.#w = NaN)
				}
			}
			return q.#w = w
		}
		add(str){
			const q=this.#q
			if(q.#l!=this) this.#setv(q)
			if(q.#_m) q.#len += (str+='').length
			q.push(str)
			q.#w=NaN
		}
		addCb(fn, w=NaN){
			if(typeof fn != 'function') return
			const q=this.#q
			if(q.#l!=this) this.#setv(q)
			w==w?q.push(fn,ADV,w):q.push(fn)
		}
		indexAt(x = 0){
			const q = this.#q
			let cmap = null
			let idx = 0
			let sc = 1, st = 1, lsb = 0, mask = true, ar = 0, ar1 = 0
			let chw = 1
			let last = -1, lastCw = 1
			let i = 0, li = 0
			while(idx < q.length){
				let s = q[idx++]
				if(typeof s=='number'){
					const v = q[idx++]
					switch(s){
						case ADV: x -= chw*v; last = -1; break
						case SC: chw = (sc = v) * st; last = -1; break
						case ST: chw = (st = v) * sc; last = -1; break
						case YO: case SK: last = -1; break // Suppress kerning across geometry change
						case LSB: lsb = v; break
						case ARC: ar1 = 1/v; ar = v; break
					}
				}else if(typeof s == 'string'){
					if(cmap) for(const ch of s){
						const c = ch.codePointAt()
						const g = cmap.get(~c) ?? cmap._default
						if(!g){ if(mask) li = i += ch.length; continue }
						const ker = (cmap.get(c+last*1114112) ?? 0) * min(chw, lastCw)
						last = c; lastCw = chw
						const w = (g.xadv+lsb)*chw + ker
						const fw = ar ? asin(w*ar)*ar1||w : w
						x -= fw
						if(!mask) continue
						if(x <= fw*-.5) return li
						li = i += ch.length
					}else if(mask) i += s.length
				}else if(typeof s == 'object'){
					if(!s){ cmap = null; continue }
					if(Array.isArray(s)) continue
					cmap = s
				}else if(typeof s == 'boolean') mask = s
			}
			return li
		}
		draw(ctx){
			const q = this.#q
			let cmap = null
			let idx = 0
			let sc = 1, sc1 = 1, st = 1, lsb = 0, sk = 0, yo = 0, xo = 0, ar = 0
			let sh = ctx.shader = msdfShader
			let vs = DEFAULT_PASSES, vlen = 3, font = null, dsc = 0
			let last = -1, lastSt = 1
			const pxr0 = ctx.pixelRatio()*2; let pxr = 1, rf = 1, rf1 = 1
			let ea = 0
			w: while(idx < q.length){
				let s = q[idx++]
				if(typeof s=='number'){
					const v = q[idx++]
					switch(s){
						case ADV:
							if(ar){
								if(sk) ctx.skew(-sk,0)
								const r = .5/ar, d = v*ar*2
								ctx.rotate(ea)
								ctx.translate(sin(d)*r, (1-cos(d))*r)
								ctx.rotate(-d); ea = 0
								if(sk) ctx.skew(sk,0)
							}else ctx.translate(v, 0)
							last = -1
							continue w
						case SC:
							const a = v*sc1; sc1 = 1/v; ctx.scale(a); yo *= sc *= sc1; xo *= sc;
							lastSt *= a; ar *= a; sc = v
							if(font) pxr = pxr0*sc*font.rangeFactor
							last = -1
							continue w
						case YO: yo = v*sc1; xo = yo*sk; last = -1; continue w
						case SH: ctx.shader = sh = v; break
						case ST: st = v; last = -1; continue w
						case SK: ctx.skew(v-sk, 0); sk = v; xo = yo*v; last = -1; continue w
						case LSB: lsb = v*.5; continue w
						case ARC: ar = v*sc; continue w
						default: continue w
					}
				}else if(typeof s == 'string'){
					if(cmap) for(const ch of s){
						const c = ch.codePointAt()
						const g = cmap.get(~c) ?? cmap._default
						if(!g) continue
						const ker = (cmap.get(c+last*1114112) ?? 0) * min(lastSt, st)
						last = c; lastSt = st
						const w = (g.xadv+lsb+lsb)*st + ker, xr = ker-xo
						if(ar){
							if(sk) ctx.skew(-sk,0)
							ctx.rotate(ea+(ea=-asin(w*ar)||0))
							if(sk) ctx.skew(sk,0)
						}
						for(let i = 0; i < vlen; i+=4){
							const x = vs[i+1], y = vs[i+2]+yo, v1 = vs[i+3]
							if(typeof x == 'object'){
								const ox = ar*w*(y+dsc)
								ctx.drawRectv(xr+ox,y+dsc,w-ox-ox,v1,x)
							}else if(g.tex){
								v1[0] = g.tex
								V.x = v1.off*rf1
								const {spr} = v1
								V.y = spr!==spr?pxr:spr*rf
								ctx.drawRectv((g.x+lsb)*st+x+xr,g.y+y,g.w*st,g.h,v1)
							}
						}
						ctx.translate(w, 0)
					}
					continue
				}else if(typeof s == 'function'){
					const c2 = ctx.sub()
					if(ea) c2.skew(-sk, 0), c2.rotate(ea), c2.skew(sk, 0)
					s(c2, font)
				}else if(typeof s == 'object'){
					if(!s){ cmap = null; continue }
					if(Array.isArray(s)){
						vlen = (vs = s).length
						continue
					}
					font = s; dsc = font.ascend-1; cmap = s
					pxr = pxr0*sc*(rf=font.rangeFactor); rf1 = 1/rf
				}
			}
			if(sk) ctx.skew(-sk,0)
			if(ea) ctx.rotate(ea)
			if(sc!=1) ctx.scale(sc1)
		}
		break(widths = Infinity, toks = defaultSet, offs = {scale: 1, letterSpacing: 0, curve: 0}){
			const q = this.#q
			let m = true, str = '', i = 0
			while(i < q.length){
				const s = q[i++]
				if(typeof s == 'number'){ i++; continue }
				if(typeof s == 'boolean') m = s
				else if(typeof s == 'string' && m) str += s
			}
			const lines = []
			let maxW = typeof widths=='number'?widths:typeof widths=='function'?widths(lines.length, offs):widths[min(lines.length,widths.length-1)]
			let q2 = new itxtstream()
			let s2 = q2.#l = new txtstream(q2)
			let idx = 0, l = ''; i = 0
			let cmap = null, chw = 1, lastCw = 1, last = -1, w = 0, tainted = false
			while(i < str.length){
				let j = 0, t = defaultToken
				let _i0 = q2.length, _w = w, _sh = s2.#sh, _sc = s2.#sc, _yo = s2.#yo, _st = s2.#st, _sk = s2.#sk, _lsb = s2.#lsb, _f = s2.#f, _arc = s2.#arc, _v = s2.#v, _m = q2.#_m, _len = q2.#len
				a: while(true){
					if(toks) for(t of toks){
						t.lastIndex = i
						const m = t.exec(str)
						if(!m) continue
						if(j) break
						// Match!
						i += j = m[0].length
						toks = t.next ?? toks
						break a
					}
					++j
					if(++i == str.length) break
				}
				const ty = t.type
				if(ty&16){
					lines.push(s2)
					q2.#w = tainted ? NaN : w
					tainted = false
					s2 = s2.sub(); s2.#q = q2 = new itxtstream()
					maxW = typeof widths=='number'?widths:typeof widths=='function'?widths(lines.length, offs):widths[min(lines.length,widths.length-1)]
					_i0 = _w = w = _len = 0
					if(!_m) q2.push(q2.#_m = false)
					s2.#setv(q2)
				}
				const iOnly = (ty&32)!=0 && !!q2.#_f
				if(l){
					let s = l
					if(j<l.length) s = l.slice(0,j), l=l.slice(j),j=0
					else j -= l.length, l = ''
					iOnly&&q2.push(null)
					if(s) q2.push(s)
					if(q2.#_m) q2.#len += s.length
					iOnly&&q2.push(q2.#_f)
				}
				while(j > 0){
					const s = q[idx++]
					if(idx > q.length) debugger
					if(typeof s == 'number'){
						const v = q[idx++]
						q2.push(s, v)
						switch(s){
							case SH: s2.#sh = q2.#_sh = v; break
							case SC: s2.#sc = q2.#_sc = v; break
							case YO: s2.#yo = q2.#_yo = v; break
							case ST: s2.#st = q2.#_st = v; break
							case SK: s2.#sk = q2.#_sk = v; break
							case LSB: s2.#lsb = q2.#_lsb = v; break
							case ARC: s2.#arc = q2.#_arc = v; break
						}
					}else if(typeof s == 'string'){
						if(!q2.#_f){ q2.push(s); q2.#_m&&(q2.#len += s.length); continue }
						j -= s.length
						let v = s
						if(j<0) v = s.slice(0,j), l = s.slice(j)
						else l = ''
						iOnly&&q2.push(null)
						q2.push(v); q2.#_m&&(q2.#len += v.length)
						iOnly&&q2.push(q2.#_f)
					}else if(typeof s == 'boolean') q2.push(q2.#_m = s)
					else{
						q2.push(s)
						if(Array.isArray(s)) q2.#_v = s2.#v = s
						else if(typeof s != 'function') q2.#_f = s2.#f = s
					}
				}
				while(1){
					let i0 = _i0, i1 = 0, _i1 = 0, sh = _sh, sc = _sc, yo = _yo, st = _st, sk = _sk, lsb = _lsb, f = _f, v = _v, m = _m, len = _len, arc = _arc, ar1 = 1/arc, ptext = false
					let sepw = t.sepL == f && t.sepA == arc && t.sepS == lsb ? t.sepW : getSepW(t, f, arc, lsb)
					const canBreak = !ty ? _w*2 < maxW : (36>>ty&1)!=0
					const {scale = 1, letterSpacing = 0, curve = 0} = offs
					tainted ||= scale != 1 || letterSpacing != 0 || curve != 0
					let tarc = arc + curve, tlsb = lsb + letterSpacing
					if(curve) ar1 = 1/tarc
					while(i0 < q2.length){
						const s = q2[i0++]
						if(typeof s == 'number'){
							const s1 = q2[i0++]
							switch(s){
								case ADV:
									w += s1
									last = -1
									if(w > (maxW - (sepw - (cmap?.get(t.sep.codePointAt() + last*1114112)??0))*chw) || !canBreak) break
									_i0 = i0-2, _i1 = 0; ptext = true
									_w = w, _sh = sh, _sc = sc, _yo = yo, _st = st, _sk = sk, _lsb = lsb, _f = f, _arc = arc, _v = v, _m = m, _len = len
									break
								case SH: sh = s1; break
								case SC: sc = s1; chw=s1*st*scale; break
								case YO: yo = s1; break
								case ST: st = s1; chw=s1*sc*scale; break
								case SK: sk = s1; break
								case LSB: lsb = s1; tlsb = s1 + letterSpacing; break
								case ARC: tarc = s1+curve; ar1 = 1/tarc; arc = s1; break
							}
						}else if(typeof s == 'string'){
							i1 = 0
							if(cmap) for(const ch of s){
								const c = ch.codePointAt()
								const g = cmap.get(~c) ?? cmap._default; i1 += ch.length
								if(m) len += ch.length
								if(!g) continue
								const ker = (cmap.get(c + last*1114112) ?? 0) * min(chw, lastCw)
								lastCw = chw; last = c
								const cw = (g.xadv+tlsb)*chw + ker
								w += tarc ? asin(cw*tarc)*ar1||cw : cw
								if(w <= (maxW - (sepw - (cmap.get(t.sep.codePointAt() + c*1114112)??0))*chw) && canBreak){
									ptext = true
									_i0 = i0-1, _i1 = i1
									_w = w, _sh = sh, _sc = sc, _yo = yo, _st = st, _sk = sk, _lsb = lsb, _f = f, _arc = arc, _v = v, _m = m, _len = len
								}
							}else if(m) len += s.length
						}else if(Array.isArray(s)) v = s
						else if(typeof s == 'boolean') m = s
						else if(typeof s == 'function') continue
						else if(f = s) cmap = s, sepw = t.sepL == s && t.sepA == arc && t.sepS == lsb ? t.sepW : getSepW(t, s, arc, lsb)
						else cmap = null, sepw = 0
					}
					if(!_w || w <= maxW || !_i0 || ty == 3) break
					// restore and split/break
					i0 = _i0, i1 = _i1, sh = _sh, sc = _sc, yo = _yo, st = _st, sk = _sk, lsb = _lsb, f = _f, v = _v, m = _m, arc = _arc, len = _len
					if(ty == 6 || (ty == 7 && maxW-_w >= w-maxW)){
						// squish
						const squish = (maxW-_w)/(w-_w), q2l = q2.length
						q2.splice(i0, 0, ST, squish*st); i0 += 2
						while(i0 < q2l){
							const s = q2[i0++]
							if(typeof s != 'number') continue
							if(s == ST) q2[i0] *= squish
							i0++
						}
						q2.push(ST, st)
						break
					}
					w = _w
					const q3 = new itxtstream(), s3 = new txtstream(q3), q2l = q2.length
					s3.#sh = sh; s3.#sc = sc; s3.#yo = yo; s3.#st = st
					s3.#sk = sk; s3.#lsb = lsb; s3.#v = v
					s3.#arc = arc; s3.#m = m
					let idx = i0 += !!i1
					let f2 = f
					const appnd = ty != 4 && ty != 5
					if(i1){
						s3.#f = f2
						s3.#setv(q3)
						const s = q2[i0-1]
						q2[i0-1] = s.slice(0, i1)
						q3.push(s.slice(i1))
						if(!appnd) q3.push(s3.#f = q3.#_f = null)
						else f2 = null
					}else{
						w: while(idx < q2l){
							const s = q2[idx++]
							if(typeof s=='number'){
								const v = q2[idx++]
								switch(s){
									case ADV: if(appnd){ idx-=2; break w }else break
									case SH: s3.#sh = v; break
									case SC: s3.#sc = v; break
									case YO: s3.#yo = v; break
									case ST: s3.#st = v; break
									case SK: s3.#sk = v; break
									case LSB: s3.#lsb = v; break
									case ARC: s3.#arc = v; break
								}
							}else if(typeof s == 'string' || typeof s == 'function'){ idx--; break }
							else if(typeof s == 'boolean') s3.#m = s
							else if(!Array.isArray(s)) f2 = s
							else s3.#v = s
						}
						s3.#setv(q3)
					}
					if(!appnd){
						while(idx < q2l){
							const s = q2[idx++]
							if(typeof s == 'number') q3.push(s, q2[idx++])
							else if(typeof s != 'object' || Array.isArray(s)) q3.push(s)
						}
					}else{
						if(f2) q3.push(s3.#f = q3.#_f = f2)
						while(idx < q2l) q3.push(q2[idx++])
					}
					q3.#len = q2.#len - len
					q2.#len = len
					q2.#w = tainted ? NaN : w
					tainted = false
					s3.#sh = q3.#_sh = s2.#sh; s3.#sc = q3.#_sc = s2.#sc
					s3.#yo = q3.#_yo = s2.#yo; s3.#st = q3.#_st = s2.#st
					s3.#sk = q3.#_sk = s2.#sk; s3.#lsb = q3.#_lsb = s2.#lsb
					s3.#arc = q3.#_arc = s2.#arc; s3.#m = q3.#_m = s2.#m; s3.#v = q3.#_v = s2.#v
					q2.length = i0
					if(!appnd && f2) q3.push(s3.#f = q3.#_f = f2)
					if(ptext) q2.#_m&&q2.push(q2.#_m=false), q2.push(t.sep)
					lines.push(s2); s2=s3; q2=q3
					maxW = typeof widths=='number'?widths:typeof widths=='function'?widths(lines.length, offs):widths[min(lines.length,widths.length-1)]
					_i0 = _i1 = _w = w = _len = 0 // other props are correct
				}
				if(ty&8){
					lines.push(s2)
					q2.#w = tainted ? NaN : w
					tainted = false
					w = 0
					s2 = s2.sub(); s2.#q = q2 = new itxtstream()
					maxW = typeof widths=='number'?widths:typeof widths=='function'?widths(lines.length, offs):widths[min(lines.length,widths.length-1)]
					s2.#setv(q2)
				}
			}
			while(idx < q.length){
				const s = q[idx++]
				q2.push(s)
				if(typeof s == 'number'){
					const v = q[idx++]
					q2.push(v)
					switch(s){
						case SH: s2.#sh = q2.#_sh = v; break
						case SC: s2.#sc = q2.#_sc = v; break
						case YO: s2.#yo = q2.#_yo = v; break
						case ST: s2.#st = q2.#_st = v; break
						case SK: s2.#sk = q2.#_sk = v; break
						case LSB: s2.#lsb = q2.#_lsb = v; break
						case ARC: s2.#arc = q2.#_arc = v; break
					}
				}else if(Array.isArray(s)) s2.#v = q2.#_v = s
				else if(typeof s == 'object') s2.#f = q2.#_f = s
				else if(typeof s == 'boolean') s2.#m = q2.#_m = s
			}
			q2.#w = tainted ? NaN : w
			lines.push(s2)
			return lines
		}
		toString(){
			let str = ''
			let m = true, i = 0
			const q = this.#q, l = q.length
			while(i < l){
				const s = q[i++]
				if(typeof s == 'number'){ i++; continue }
				if(typeof s == 'boolean') m = s
				else if(typeof s == 'string' && m) str += s
			}
			return str
		}
	}
	interface Font{
		rangeFactor = 0; #cb = []; map = new Map; ascend = 0
		_default = {x:0.05,y:-0.0625,w:0.5,h:0.75,xadv:0.6,tex:defaultChar}
		get then(){return this.#cb?this.#then:undefined}
		#then(cb,rj){this.#cb?.push(cb,rj)}
		done(){
			const cb = this.#cb; this.#cb = null
			if(cb) for(let i=0;i<cb.length;i+=2) cb[i]?.(this)
		}
		error(e){
			const cb = this.#cb; this.#cb = null
			if(cb) for(let i=1;i<cb.length;i+=2) cb[i]?.(e)
		}
		set(char = -1, tex = null, adv = 0, x=0, y=0, w=0, h=0){
			if(typeof tex == 'number') adv = tex, tex = null
			if(typeof char == 'string') char = char.codePointAt()
			if(char < 0){
				const d = this._default
				if(!tex && !adv) d.x = d.y = d.w = d.h = d.xadv = 0, d.tex = null
				else d.x = +x, d.y = +y, d.w = +w, d.h = +h, d.xadv = +adv, d.tex = tex
			}else{
				if(!tex && !adv) return super.delete(~char)
				else super.set(~char, { x: +x, y: +y, w: +w, h: +h, xadv: +adv, tex })
			}
		}
		getWidth(char){
			if(typeof char == 'string') char = char.codePointAt()
			return (this.get(~char) ?? this._default).xadv
		}
		setKerning(a, b, adv = 0){
			let code = 0
			if(typeof a == 'string'){
				const a0 = a.codePointAt()
				code = a0*1114112
				if(typeof b == 'number'){
					adv = b
					code += a.codePointAt(1+(a0>65535))
				}else code += b.codePointAt()
			}else code = a*1114112+b
			if(adv) super.set(code, adv)
			else super.delete(code)
		}
		getKerning(a, b){
			let code = 0
			if(typeof a == 'string'){
				const a0 = a.codePointAt()
				code = a0*1114112
				if(typeof b == 'string') code += b.codePointAt()
				else if(typeof b != 'undefined') code += b&0xffffff
				else code += a.codePointAt(1+(a0>65535))
			}else code = (a&0xffffff)*1114112+(b&0xffffff)
			return this.get(code) ?? 0
		}
		chlumsky(src, atlas = 'atlas.png'){ if(src.endsWith('/')) src += 'index.json'; fetch(src).then(a => (src=a.url,a.json())).then(d => {
			const {atlas:{type,distanceRange,size,width,height},metrics:{ascender,descender},glyphs,kerning} = d
			this.rangeFactor = distanceRange/size
			const img = $.Img(new URL(atlas, src).href,$.SMOOTH, type.toLowerCase().endsWith('msdf') ? $.Formats.RGB : $.Formats.RGBA4)
			this.ascend = ascender/(ascender-descender)
			for(const {unicode1,unicode2,advance} of kerning) super.set(unicode2+unicode1*1114112, advance)
			for(const {unicode,advance,planeBounds:pb,atlasBounds:ab} of glyphs) super.set(~unicode, pb ? {
				x: +pb.left, y: +pb.bottom,
				w: (pb.right-pb.left), h: (pb.top-pb.bottom),
				xadv: advance, tex: img.sub(ab.left/width,ab.bottom/height,(ab.right-ab.left)/width,(ab.top-ab.bottom)/height)
			} : {x:0,y:0,w:0,h:0,xadv: advance, tex: null})
			this.done()
		}, this.error.bind(this)); return this}
		bmfont(src, baselineOffset=0){ fetch(src).then(a => (src=a.url,a.json())).then(d => {
			const {chars,distanceField:df,pages,common:{base,lineHeight:sc,scaleW,scaleH},kernings} = d
			const s = 1/d.info.size
			this.rangeFactor = df.distanceRange/sc
			const b = this.ascend = base/sc
			const p = pages.map(a => $.Img(new URL(a,src).href,$.SMOOTH, df.fieldType.toLowerCase().endsWith('msdf') ? $.Formats.RGB : $.Formats.RGBA4))
			for(const {first,second,amount} of kernings) super.set(second+first*1114112, amount/s)
			for(const {id,x,y,width,height,xoffset,yoffset,xadvance,page} of chars) super.set(id, {
				x: xoffset*s, y: b-(yoffset-baselineOffset+height)*s,
				w: width*s, h: height*s,
				xadv: xadvance*s,
				tex: width&&height?p[page].sub(x/scaleW,1-(y+height)/scaleH,width/scaleW,height/scaleH):null
			})
			this.done()
		}, this.error.bind(this)); return this}
		draw(ctx, txt, v=[], off=0, spr=NaN, lsb = 0, last = -1){
			if(this.#cb) return
			lsb *= .5
			off /= this.rangeFactor
			spr = spr!==spr ? ctx.pixelRatio()*2*this.rangeFactor : this.rangeFactor/spr
			for(const ch of txt){
				const c = ch.codePointAt()
				const g = this.get(~c) ?? this._default
				if(!g) continue
				const ker = this.get(c+last*1114112) ?? 0; last = c
				const w = g.xadv + lsb + lsb + ker
				if(g.tex) V.x = off, V.y = spr, ctx.drawRect(g.x+lsb+ker,g.y,g.w,g.h,g.tex,V,...v)
				ctx.translate(w, 0)
			}
			return last
		}
		measure(txt, lsb = 0, last = -1){
			if(this.#cb) return
			let w = 0
			for(const ch of txt){
				const c = ch.codePointAt()
				const g = this.get(c) ?? this._default
				if(!g) continue
				const ker = this.get(c+last*1114112) ?? 0; last = c
				w += g.xadv + lsb + ker
			}
			return w
		}
	}
	/** Construct a new, empty font. See its methods for how to build your own font or import one. */
	function Font(): Font
}