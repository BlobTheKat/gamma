{const defer = Promise.resolve()
Gamma.textfield = $ => {
	const rem = e => (e.target._field._f|=256,defer.then(e.target._field.recalc),e.target.remove(),curf=null)
	const cri = (typ, o) => {
		const i = document.createElement(typ)
		// Chrome requires 1px size in order for some features such as copy-paste to work
		i.style = `width:1px;height:1px;border:0;padding:0;opacity:0;position:absolute;inset:-100px;font-size:1px;font-family:monospace;white-space:nowrap`
		i.onblur = rem
		i.tabIndex = -1
		i._field = o
		document.documentElement.append(i)
		return i
	}
	let curf = null
	const defaultSr = (p2, field) => p2.insertLinePass(-1, 0, 1, field.focus ? vec4(0,.2,.4,.6) : vec4(.2,.2,.2,.6))
	const defaultCr = (ctx, font) => {
		ctx.shader = null
		ctx.drawRect(0, font.ascend-1, .05, 1, vec4(t%1<.5))
	}
	class _txtfield{
		_f=0; #s=0; #e=0
		get allowTabs(){return(this._f&1)!=0}
		set allowTabs(a){this._f=this._f&-2|a&1}
		#i
		constructor(t){this.#i=cri(t?'textarea':'input', this);this._f=t}
		get value(){return this.#i.value}
		set value(a){this.#i.value=a;this._f|=256;defer.then(this.recalc)}
		get sel0(){return this.#s}
		set sel0(a){this.#i.selectionStart=this.#s=a;this._f|=256;defer.then(this.recalc)}
		get sel1(){return this.#e}
		set sel1(a){this.#i.selectionEnd=this.#e=a;this._f|=256;defer.then(this.recalc)}
		#tr=null
		get transformer(){return this.#tr}
		set transformer(a){this.#tr!=(this.#tr=a)&&(this._f|=256,defer.then(this.recalc))}
		simpleTransformer(font, placeholder='', ...v){
			let w = v.slice()
			w[0] = v[0]?.times(.4) ?? vec4(.4)
			this.#tr = value => {
				const p = RichText(font)
				if(v.length) p.setValues(0, ...v)
				if(value) p.add(value)
				else{
					p.setValues(0, ...w)
					p.drawOnly()
					p.add(placeholder)
				}
				return p
			}
			this._f|=256
			defer.then(this.recalc)
		}
		#cr = defaultCr
		#sr = defaultSr
		#p=null;#pa=null
		#mw=Infinity
		#sw=0; #ew=0; #w=0
		get sel0pos(){return this.#sw}
		get sel1pos(){return this.#ew}
		get multiline(){return(this._f&2048)!=0}
		get width(){return this.#w}
		get line(){return this.#p}
		get lines(){return this.#pa}
		get cursor(){return this.#cr}
		set cursor(a){this.#cr!=(this.#cr=a)&&(this._f|=256,defer.then(this.recalc))}
		get selector(){return this.#sr}
		set selector(a){this.#sr!=(this.#sr=a)&&(this._f|=256,defer.then(this.recalc))}
		get maxWidth(){return this.#mw}
		set maxWidth(a){this.#mw!=(this.#mw=a)&&(this._f|=256,defer.then(this.recalc))}
		recalc = () => {
			const i = this.#i
			const s = i.selectionStart, e = i.selectionEnd
			if(!(this._f&256)&&this.#s==s&&this.#e==e) return
			this._f &= -257; this.#s = s; this.#e = e
			const v = i.value
			const p = this.#tr?.(v, this) ?? $.RichText()
			if(s == e){
				const p2 = p.slice(s)
				p.trim(s)
				if(!(this._f&2048)) this.#sw = this.#ew = p.width
				this.#cr&&document.activeElement==this.#i&&p.addCb(this.#cr)
				p.concat(p2)
			}else{
				const p2 = p.slice(s), p3 = p2.slice(e-s)
				p2.trim(e-s)
				p.trim(s)
				if(this._f&2048){
					this.#sr?.(p2, this)
					p.concat(p2)
				}else{
					this.#sw = p.width
					this.#sr?.(p2, this)
					p.concat(p2)
					this.#ew = p.width
				}
				p.concat(p3)
			}
			if(this._f&2048) this.#pa = p.break(this.#mw)
			else this.#p = p
		}
		insert(t='', off = t.length){
			const i = this.#i, v = i.value, s = i.selectionStart, e = i.selectionEnd
			i.value = v.slice(0,s) + t + v.slice(e)
			i.selectionStart = i.selectionEnd = s + off
			this.recalc()
		}
		get focus(){ return document.activeElement==this.#i }
		set focus(f = true){
			if(f){
				if(!curf) document.documentElement.append(curf = this.#i)
				else if(curf != this.#i) curf.replaceWith(curf = this.#i)
				else return
				curf.focus()
				this._f |= 256; defer.then(this.recalc)
			}else if(curf == this.#i) curf.remove(), curf = null
		}
		get isSelecting(){return (this._f>>9&3)!=0}
		lineHeight = 1.3
		lineAscend = .9
		#lc=0
		get height(){return this.lineHeight*(this.#pa?this.#pa.length:1)}
		consumeInputs(ctx, {x, y} = ctx.from($.cursor), k = $.keys.has(0)){
			y = this.lineAscend-y; cursorType = 'text'
			if(!k) return void(this._f = this._f&-1537)
			if(!this.focus){
				this.focus = true
				if(this.#s!=this.#e) return void(this._f |= 1536)
			}
			const sel = this._f>>9&3
			let j = 0
			if(this.#p) j = this.#p.indexAt(x)
			else{
				let i = floor(y/this.lineHeight)
				i = i<0?0:i>=this.#pa.length?this.#pa.length-1:i
				j = this.#pa[i].indexAt(x)
				while(i) j += this.#pa[--i].length
			}
			if(sel == 1){
				if(j > this.sel1) this.sel0 = this.sel1, this.sel1 = j, this._f = this._f&-1537|1024
				else if(j != this.#s) this.#s = this.#i.selectionStart = j, this._f |= 256, defer.then(this.recalc)
			}else if(sel == 2){
				if(j <= this.sel0) this.sel1 = this.sel0, this.sel0 = j, this._f = this._f&-1537|512
				else if(j != this.#e) this.#e = this.#i.selectionEnd = j, this._f |= 256, defer.then(this.recalc)
			}else if(!sel){
				let seekType = 0, s = j, e = j
				if(this.#lc<0){
					if(this.#lc-(this.#lc=-t) < .3) seekType = 2
					else this.#lc = t
				}else if(this.#lc>0){
					if(this.#lc-(this.#lc=t) > -.3) seekType = 1, this.#lc=-t
				}else this.#lc = t
				this._f = this._f&-1537|512
				if(seekType){
					this._f |= 1024
					const v = this.#i.value
					const min = 33-seekType
					while(v.codePointAt(e++)>min);
					while(v.codePointAt(--s)>min);
					s++; e--
				}
				if(s != this.#s || e != this.#e){
					this._f |= 256
					this.#i.selectionStart = this.#s = s
					this.#i.selectionEnd = this.#e = e
					defer.then(this.recalc)
				}
			}
		}
		draw(ctx){
			if(this.#pa){
				let c = ctx
				for(const l of this.#pa){
					l.draw(c = ctx.sub())
					ctx.translate(0,-this.lineHeight)
				}
				return c
			}else this.#p?.draw(ctx)
		}
	}
	$.TextField = (multiline=false) => new _txtfield(multiline<<11&2048)
}
document.addEventListener('input', e => {
	const f = e.target._field
	if(f) f._f|=256, defer.then(f.recalc)
})
document.addEventListener('selectionchange', e => {
	const f = e.target._field
	if(f) defer.then(f.recalc)
})}