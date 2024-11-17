Gamma.textfield = $ => {
	const rem = e => (e.target.remove(), curf=null), defer = Promise.resolve()
	const cri = (typ, o) => {
		const i = document.createElement(typ)
		i.style = `width:0;height:0;border:0;padding:0;opacity:0;position:absolute;inset:-100px;font-size:1px;font-family:monospace`
		i.onblur = rem
		i.tabIndex = -1
		i._field = o
		document.documentElement.append(i)
		return i
	}
	let curf = null
	class _txtfield{
		_f = 0; _s=0; _e=0
		#i = cri('input', this)
		get value(){return this.#i.value;this._f|=256;defer.then(this.recalc)}
		set value(a){this.#i.value=a;defer.then(this.recalc)}
		get sel0(){return this._s}
		set sel0(a){this.#i.selectionStart=a;defer.then(this.recalc)}
		get sel1(){return this._e}
		set sel1(a){this.#i.selectionEnd=a;defer.then(this.recalc)}
		#tr=null
		get transformer(){return this.#tr}
		set transformer(a){this.#tr=a;this._f|=256;this.recalc()}
		simpleTransformer(font, placeholder='', ...v){ this.transformer = value => {
			const p = RichText(font)
			if(value) p.add(value)
			else{
				p.setValues(0, vec4(.4))
				p.drawOnly()
				p.add(placeholder)
			}
			return p
		}}
		#cr = (ctx, dsc) => {
			if(!this.focus) return
			ctx.shader = null
			ctx.drawRect(0, dsc, .05, 1, vec4(t%1<.5))
		}
		#sw=0;#ew=0;#w=0;#p=null
		get sel0width(){return this.#sw}
		get sel1width(){return this.#ew}
		get width(){return this.#w}
		get cursor(){return this.#cr}
		set cursor(a){this.#cr=a;this._f|=256;this.recalc()}
		recalc = () => {
			const i = this.#i
			const s = i.selectionStart, e = i.selectionEnd
			if(!(this._f&256)&&this._s==s&&this._e==e) return
			this._f &= -257; this._s = s; this._e = e
			const v = i.value
			const p = this.#p = this.#tr?.(v) ?? $.RichText()
			if(s == e){
				const p2 = p.slice(s)
				p.trim(s)
				this.#sw = this.#ew = p.width
				p.addCb(this.#cr)
				p.concat(p2)
				this.#w = p.width
			}else{
				const p2 = p.slice(s), p3 = p2.slice(e-s)
				p2.trim(e-s)
				p.trim(s)
				this.#sw = p.width
				p2.insertLinePass(-1, 0, 1, vec4(0,.2,.4,.6), 0)
				p.concat(p2)
				this.#ew = p.width
				p.concat(p3)
				this.#w = p.width
			}
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
				curf.focus()
			}else if(curf == this.#i) curf.remove(), curf = null
		}
		get isSelecting(){return (this._f>>9&3)!=0}
		consumeInputs(c = cursor, k = keys.has(MOUSE.LEFT)){
			const {x, y} = ctx.from(c)
			const sel = this._f>>9&3
			if(sel || x >= 0 && x <= this.#w && y >= -.5 && y <= 1){
				if(k){
					this.focus = true
					const j = this.#p.indexAt(x)
					if(sel == 1){
						if(j > this.sel1) this.sel0 = this.sel1, this.sel1 = j, this._f = this._f&-1537|1024
						else this.sel0 = j
					}else if(sel == 2){
						if(j <= this.sel0) this.sel1 = this.sel0, this.sel0 = j, this._f = this._f&-1537|512
						else this.sel1 = j
					}else this._f = this._f&-1537|512, this.sel0 = this.sel1 = j
				}else this._f = this._f&-1537
				cursorType = 'text'
			}
		}
		draw(ctx){
			this.#p.draw(ctx)
		}
	}
	class _txtfield2{
		flags = 0
		#i = cri('textarea', this)
	}
	$.TextField = () => new _txtfield()
	$.MultiTextField = () => new _txtfield2()
}