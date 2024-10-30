Gamma.font = $ => {
	let oldPxRange = 0
	const msdf = $.Shader(`void main(){
		color = vec4(1,1,1,1);
	}`, [COLOR], [FLOAT])
	let T = $.Token = (regex, type = 0, sepAfter = '', sepBefore = '', breakRatio = 0, cb = null, next = undefined, ret = undefined) => {
		if(regex instanceof RegExp){
			let f = regex.flags, g = f.indexOf('g')
			if(g>-1) f=f.slice(0,g)+f.slice(g+1)
			if(!f.includes('y')) f += 'y'
			regex = new RegExp(regex.source, f)
		}else{
			let src = '['
			for(const ch of regex+''){
				const c = ch.codePointAt()
				src += (c>=92&&c<=94)||c==45?'\\'+ch:ch
			}
			regex = new RegExp(src+']','y')
		}
		regex.type = type
		regex.sepA = sepAfter
		regex.sepB = sepBefore
		regex.bR = breakRatio
		regex.cb = cb
		regex.next = next
		regex.ret = ret
		return regex
	}
	// Token jumps to new line on break, unless it would take up more than half of that line, in which case insert sep
	T.NORMAL = 0
	// On break, always go on a new line
	T.ALWAYS_JUMP = 1
	// Token overflows instead of breaking
	T.OVERFLOW = 2
	// Token cannot be broken in half and must go on a new line, even if it overflows on that line
	T.DONT_SPLIT = 3
	// Token "underflows" on the left of the new line
	T.LEFT_OVERFLOW = 4
	// Token is not rendered if it breaks
	T.VANISH = 5
	// Token is squished if it breaks
	T.SQUISH = 6
	// Token is shrunk if it breaks
	T.SCALE = 7
	// Overflowing characters are not rendered
	T.TRIM = 8
	// Token can be broken anywhere
	T.ANYWHERE = 9
	// Always break here, even if not overflowing
	T.BREAK = 10
	// Always break here, and don't render anything
	T.VANISH_BREAK = 11
	// Always break immediately before, drawing text to the left of the new line
	T.LEFT_OVERFLOW_BREAK = 12
	// Always break before and after token, making the token stand on its own line
	T.BREAK_BEFORE_AFTER = 13
	const defaultSet = [T(/\r\n?|\n/y, 11, ''), T(/[$£"+]?[\w'-]+[,.!?:;"^%€*]?/yi, 0, '-'), T(/\s+/y, 5)]
	const defaultToken = T(/[^]/y)
	const addToken = (str, t, q) => {
		const type = t.type
		t.sepA; t.sepB; t.bR
		q.push(str)
	}
	T = new Map
	const ADV = 1, LH = 4, ST = 5, SK = 6, LSB = 7
	class txtstream{
		constructor(q,i=0){ this.#q = q }
		sub(){const s=new txtstream(this.#q);s.#f=this.#f;s.#sh=this.#sh;s.#lh=this.#lh;s.#st=this.#st;s.#sk=this.#sk;s.#lsb=this.#lsb;return s}
		reset(f=null,sh=msdf,lh=1,st=1,sk=0,lsb=0,...a){this.#f=typeof f=='object'?f:null;this.#sh=typeof sh=='function'?sh:msdf;this.#lh=+lh;this.#st=+st;this.#sk=+sk;this.#lsb=+lsb;this.#q.push(a);this.#q.l==this&&(this.#q.l=null)}
		#q;
		#f = null
		get font(){return this.#f}
		set font(a){if(typeof a=='object')this.#f=a;this.#q.l==this&&(this.#q.l=null)}
		#sh = msdf
		get shader(){return this.#sh}
		set shader(a){if(typeof a=='function')this.#sh=a;this.#q.l==this&&(this.#q.l=null)}
		#lh = 1
		get height(){return this.#lh}
		set height(a){this.#lh=+a}
		#st = 1
		get stretch(){return this.#st}
		set stretch(a){this.#st=+a;this.#q.l==this&&(this.#q.l=null)}
		get letterWidth(){return this.#lh*this.stretch}
		set letterWidth(a){this.stretch=a/this.#lh}
		#sk = 0
		get skew(){return this.#sk}
		set skew(a){this.#sk=+a;this.#q.l==this&&(this.#q.l=null)}
		#lsb = 0
		get letterSpacingBias(){return this.#lsb}
		set letterSpacingBias(a){this.#lsb=+a;this.#q.l==this&&(this.#q.l=null)}
		// Sets the shader's values at this point in the stream
		values(...a){ this.#q.push(a) }
		advance(gap = 0){ this.#q.push(ADV, +gap); this.#q.w=NaN }
		#setv(q){
			if(this.#f!=q.f)q.push(q.f=this.#f)
			if(this.#sh!=q.sh)q.push(q.sh=this.#sh)
			if(this.#lh!=q.lh)q.push(LH,q.lh=this.#lh)
			if(this.#st!=q.st)q.push(ST,q.st=this.#st)
			if(this.#sk!=q.sk)q.push(SK,q.sk=this.#sk)
			if(this.#lsb!=q.lsb)q.push(LSB,q.lsb=this.#lsb)
			q.l=this
		}
		slice(i=0, j=this.#q.len){
			const q = this.#q, q2 = []
			if(i<0) (i+=q.len)<0&&(i=0)
			if(j<0) (j+=q.len)<0&&(j=0)
			j -= i
			q2.f=null;q2.sh=msdf;q2.lh=1;q2.st=1;q2.sk=0;q2.lsb=0;q2.len=0;q2.w=NaN
			const st = q2.l = new txtstream(q2)
			let idx = 0
			w: while(i > 0 && idx < q.length){
				const s = q[idx++]
				if(typeof s=='number'){
					const v = q[idx++]
					switch(s){
						case LH: st.height = v; break
						case ST: st.stretch = v; break
						case SK: st.skew = v; break
						case LSB: st.letterSpacingBias = v; break
					}
				}else if(typeof s == 'string'){
					i -= s.length
					if(i<0){
						if(q2.l!=st) st.#setv(q2)
						const v = s.slice(i,(j+=i)+s.length)
						q2.push(v); q2.len += v.length
						break w
					}
				}else if(typeof s == 'function') st.shader = s
				else st.font = s
			}
			while(j > 0 && idx < q.length){
				const s = q[idx++]
				if(typeof s == 'string'){
					j -= s.length; q2.len += s.length
					if(j < 0) q2.push(s.slice(0, j)), q2.len += s.length+j
					else q2.push(s), q2.len += s.length
				}else q2.push(s), q2.len += s.len
			}
			return st
		}
		trim(i){
			const q = this.#q
			if(i<0) (i+=q.len)<0&&(i=0)
			if(i>=q.len) return
			q.len = i < 0 ? 0 : i
			let idx = 0
			q.f = null; q.sh = msdf; q.lh = 1; q.st = 1; q.sk = 0; q.lsb = 0
			w: while(i > 0 && idx < q.length){
				const s = q[idx++]
				if(typeof s=='number'){
					const v = q[idx++]
					switch(s){
						case LH: q.lh = v; break
						case ST: q.st = v; break
						case SK: q.sk = v; break
						case LSB: q.lsb = v; break
					}
				}else if(typeof s == 'string'){
					i -= s.length
					if(i<0){ q[idx-1] = s.slice(0, i); break w }
				}else if(typeof s == 'function') q.sh = s
				else q.f = s
			}
			this.#f = q.f
			this.#sh = q.sh
			this.#lh = q.lh
			this.#st = q.st
			this.#sk = q.sk
			this.#lsb = q.lsb
			q.length = idx
			q.w=NaN
		}
		concat(st){
			const q = this.#q, q2 = st.#q
			q.len += q2.len
			let idx = 0
			this.#f = null; this.#sh = msdf; this.#lh = 1; this.#st = 1; this.#sk = 0; this.#lsb = 0
			// If concat to ourselves, don't loop infinitely
			const q2l = q2.length
			w: while(idx < q2l){
				const s = q2[idx++]
				if(typeof s=='number'){
					const v = q[idx++]
					switch(s){
						case ADV: q.push(s, v); break
						case LH: this.#lh = v; break
						case ST: this.#st = v; break
						case SK: this.#sk = v; break
						case LSB: this.#lsb = v; break
					}
				}else if(typeof s == 'string'){ this.#setv(q); q.push(s); break w }
			}
			while(idx < q2l) q.push(q2[idx++])
			q.w=NaN
		}
		get length(){return this.#q.len}
		set length(a){this.trim(a)}
		get width(){
			let w=this.#q.w
			if(w==w)return w
			w = 0
			const q = this.#q
			let cmap = T
			let idx = 0
			let lh = 1, st = 1, lsb = 0
			let chw = 1
			while(idx < q.length){
				let s = q[idx++]
				if(typeof s=='number'){
					const v = q[idx++]
					switch(s){
						case LH: chw = (lh = v) * st; break
						case ST: chw = (st = v) * lh; break
						case LSB: lsb = v; break
					}
				}else if(typeof s == 'string'){
					for(const ch of s){
						const g = cmap.get(ch.codePointAt())
						if(g) w += (g.xadv+lsb)*chw
					}
				}else if(typeof s == 'object'){
					cmap = s.map
					s.then?.(() => q.w=NaN)
				}
			}
			return q.w = w-lsb*chw
		}
		add(str){
			const q=this.#q
			if(q.l!=this) this.#setv(q)
			if(typeof str != 'function') q.len += (str+='').length
			q.push(typeof str == 'function' ? str : ''+str)
			q.w=NaN
		}
		break(widths, tokss = [defaultSet]){
			if(!Array.isArray(tokss[0])) tokss = [tokss]
			let toks = tokss[tokss.length-1]
			let i = 0; const l = str.length
			w: while(i < l){
				if(toks) for(const t of toks){
					t.lastIndex = i
					const m = t.exec(str)
					if(!m) continue
					// Match!
					let s = m[0]
					if(t.cb){
						s = t.cb(this, s, m) ?? s
						this.#setv(q)
					}
					addToken(s, t, q); i += s.length
					toks = t.next ?? toks
					continue w
				}
				addToken(str[i++], defaultToken, q)
			}
			this.tokenSet = tok
			
		}
		toString(){
			let r = ''
			for(const s of this.#q) if(typeof s == 'string') r += s
			return r
		}
	}
	$.RichText = () => {
		const q = []; q.f=null;q.sh=msdf;q.lh=1;q.st=1;q.sk=0;q.lsb=0;q.len=0;q.w=NaN
		return q.l = new txtstream(q)
	}

	
	void class font{
		#flags = 0; #dstr = 0; #info = null; #pages = []; map = new Map; ascend = 0; descend = 0
		get then(){return this.#info?undefined:this.#then}
		get info(){return this.#info}
		get pages(){return this.#info?this.#pages:null}
		#then(cb,rj){if(!this.#info)this.#pages.push(cb,rj)}
		draw(ctx, txt, lsb = 0){
			if(!this.#info) return
			const d = this.#dstr*ctx.pixelRatio()
			if(d!=oldPxRange) msdf.uniforms(oldPxRange=d)
		}
	static _ = $.Font = src => {
		const f = new font()
		fetch(src).then(a => a.json()).then(({info,chars,distanceField:df,pages,common:{lineHeight:lh,base,scaleW,scaleH}}) => {
			f.#flags |= df.fieldType.toLowerCase() == 'msdf'
			f.#dstr = df.distanceRange
			f.#info = info
			f.ascend = base
			base = f.descend = lh-base
			const cb = f.#pages
			f.#pages = pages.map(src => Img(src,0,f.msdf?Formats.RGB:Formats.LUM))
			for(const {id,x,y,width,height,xoffset,yoffset,xadvance,page} of chars)
				f.map.set(id, {
					x: xoffset/lh, y: (base-yoffset-height)/lh,
					w: width/lh, h: height/lh,
					xadv: xadvance/lh,
					tex: f.#pages[page].sub(x/scaleW,y/scaleH,width/scaleW,height/scaleH)
				})
			for(let i=0;i<cb.length;i+=2) cb[i]?.(f)
		}, err => {
			for(let i=1;i<f.#pages.length;i+=2) f.#pages[i]?.(err)
			f.#pages.length = 0
		})
		return f
	}}
}