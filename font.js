Gamma.font = $ => {
	let oldPxRange = 0
	const msdf = $.Shader(`void main(){
		color = vec4(1,1,1,1);
	}`, [COLOR], [FLOAT]), T = $.TokenSet = () => {
		const s = []
		s.add = (regex, type, sepAfter = '', sepBefore = '', breakRatio = 0) => {
			if(regex instanceof RegExp){
				let f = regex.flags, g = f.indexOf('g')
				if(g>-1) f=f.slice(0,g)+f.slice(g+1)
				if(!f.includes('y')) f += 'y'
				if(regex.flags!=f) regex = new RegExp(regex.source, f)
			}else if(typeof regex == 'string') regex = new String(regex)
			regex.type = type
			regex.sepA = sepAfter
			regex.sepB = sepBefore
			regex.bR = breakRatio
			s.push(regex)
			return s
		}
		return s
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
	// Always break here, even if not overflowing
	T.BREAK = 9
	// Always break here, and don't render anything
	T.VANISH_BREAK = 10
	// Always break immediately before, drawing text to the left of the new line
	T.LEFT_OVERFLOW_BREAK = 11
	// Always break before and after token, making the token stand on its own line
	T.BREAK_BEFORE_AFTER = 12

	const defaultSet = T().add(/\r\n?|\n/y, 10, '').add(/[\w]/yi, 0, '-').add(/\s/y, 5)
	const BR = 0, F = 1, SH = 2, TS = 3, LH = 4, ST = 5, SK = 6, CSB = 7, LSB = 8
	class txtstream{
		constructor(o){
			if(!o){o=[];o.f=null;o.sh=msdf;o.lh=1;o.st=1;o.sk=0;o.csb=0;o.lsb=0;o.l=this}
			this.#q = o
		}
		sub(){return new txtstream(this.#q)}
		#q
		#f = null
		get font(){return this.#f}
		set font(a){if(typeof a=='object')this.#f=a;this.#q.l=null}
		#sh = msdf
		get shader(){return this.#sh}
		set shader(a){if(typeof a=='function')this.#sh=a;this.#q.l=null}
		#ts = defaultSet
		get tokenSet(){return this.#ts}
		set tokenSet(a){if(Arrray.isArray(a))this.#ts=a;this.#q.l=null}
		#lh = 1
		get lineHeight(){return this.#lh}
		set lineHeight(a){this.#lh=+a}
		#st = 1
		get stretch(){return this.#st}
		set stretch(a){this.#st=+a;this.#q.l=null}
		get letterWidth(){return this.#lh*this.stretch}
		set letterWidth(a){this.stretch=a/this.lineHeight}
		#sk = 0
		get skew(){return this.#sk}
		set skew(a){this.#sk=+a;this.#q.l=null}
		#csb = 0
		get letterSpacingBias(){return this.#csb}
		set letterSpacingBias(a){this.#csb=+a;this.#q.l=null}
		#lsb = 0
		get lineSpacingBias(){return this.#lsb}
		set lineSpacingBias(a){this.#lsb=+a;this.#q.l=null}
		tokenizer = null
		// Sets the shader's uniforms at this point in the stream
		uniforms(...a){this.#q.push(a)}
		// Add a callback that is called at this point in the stream
		addCb(fn){
			// Set values in case function reads them
			const q=this.#q
			if(q.l!=this) this.#setv(q)
			this.#q.push(fn)
		}
		newline(gap = this.#lh + this.#lsb){

		}
		advance(gap = 0){

		}
		// Add text to the stream using current text settings
		#addToken(str){
			
		}
		#setv(q){
			if(this.#f!=q.f)q.push(F,q.f=this.#f)
			if(this.#sh!=q.sh)q.push(SH,q.sh=this.#sh)
			if(this.#ts!=q.ts)q.push(TS,q.ts=this.#ts)
			if(this.#lh!=q.lh)q.push(LH,q.lh=this.#lh)
			if(this.#st!=q.st)q.push(ST,q.st=this.#st)
			if(this.#sk!=q.sk)q.push(SK,q.sk=this.#sk)
			if(this.#lsb!=q.lsb)q.push(LSB,q.lsb=this.#lsb)
			if(this.#csb!=q.csb)q.push(CSB,q.csb=this.#csb)
			q.l=this
		}
		add(str){
			const q=this.#q
			if(q.l!=this) this.#setv(q)
			const tok = this.tokenizer??defaultSet

		}
		addToken(str){
			const q=this.#q
			if(q.l!=this) this.#setv(q)
			this.#addToken(str)
		}
		draw(ctx){
			const q=this.#q
			if(q.l!=this) this.#setv(q)
		}
	}
	$.Paragraph = () => {
		const t = new txtstream()
		return t
	}

	
	class font{
		_flags = 0; _dstr = 0
		draw(ctx, txt, lsb = 0){
			const d = this._dstr*ctx.pixelRatio()
			if(d!=oldPxRange) msdf.uniforms(oldPxRange=d)
		}
	}
	$.Font = src => {
		const f = new font()
		fetch(src).then(a => a.json()).then(({chars,distanceField:df,pages}) => {
			f._flags |= df.fieldType.toLowerCase() == 'msdf'
			f._dstr = df.distanceRange
			const p = pages.map(src=>Img(src,0,f.msdf?Formats.RGB:Formats.LUM))
			const map = new Map
			for(const {id,x,y,width:w,height:h,xoffset:xo,yoffset:yo,xadvance:xadv,page} of chars)
				map.set(id, {x,y,w,h,xo,yo,xadv,img:p[page]})
			
		})
		return f
	}
}