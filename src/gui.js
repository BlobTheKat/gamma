{Gamma.gui = $ => {
	if(!$.Font) throw 'Initialize Gamma.font before Gamma.gui'
	class GUIElement{
		#w = NaN; #h = NaN; #drawDep = null
		_dimensions(){ return vec2.zero }
		invalidate = () => {
			this.#w = this.#h = NaN
			const hook = this.#drawDep; this.#drawDep = null
			if(!hook) return
			if(typeof hook == 'function') try{ hook() }catch(e){ Promise.reject(e) }
			else for(const f of hook) try{ f() }catch(e){ Promise.reject(e) }
		}
		addDependency(cb){ if(typeof cb !== 'function') return; const l = this.#drawDep; if(!l) this.#drawDep = cb; else if(typeof l == 'function') this.#drawDep = [l, cb]; else l.push(cb) }
		removeDependency(cb){
			const l = this.#drawDep
			if(!l) return
			if(typeof l == 'function'){
				if(l === cb) this.#drawDep = null
				return
			}
			let i = l.indexOf(cb)
			if(i < 0) return
			while(i<l.length) l[i] = l[++i]
			l.pop()
		}
		get width(){ let w = this.#w; if(w!==w){ const d = this._dimensions(); w = this.#w = d.x; this.#h = d.y } return w }
		get height(){ let h = this.#h; if(h!==h){ const d = this._dimensions(); this.#w = d.x; h = this.#h = d.y } return h }
	}
	const zdraw = function(ctx, ictx, w, h){
		let i = this.children.length
		for(const el of this.children) el.draw?.(--i ? ctx.sub() : ctx, ictx, w, h)
	}
	const list = (draw, layout) => {
		class list extends GUIElement{
			children = []
			add(el){ this.children.push(el); el.addDependency(this.invalidate); return this }
			remove(n){
				const l = this.children
				if(typeof n == 'number'){
					n >>>= 0
					if(n >= l.length) return
					l[n].removeDependency(this.invalidate)
					while(n<l.length) l[n] = l[++n]
					l.pop()
				}else{
					if(this.children.remove(n) >= 0) n.removeDependency(this.invalidate)
				}
			}
		}
		list.prototype.draw = draw
		return () => new list()
	}
	class img extends GUIElement{
		constructor(tex){ super(); this.texture = tex }
		get width(){ return this.texture.width }
		get height(){ return this.texture.height }
		draw(ctx, _, w, h){ ctx.drawRect(0, 0, w, h, this.texture) }
	}
	class text extends GUIElement{
		constructor(rt, font){
			super()
			if(typeof rt == 'string'){
				const str = rt
				rt = RichText(font)
				rt.add(str)
			}
			this.text = rt
		}
		get width(){ return this.text.width }
		get height(){ return 1 }
		draw(ctx, ictx, w, h){ this.text.draw(ctx) }
	}
	$.canvas.style.setProperty('--__gamma__sarea__', 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)')
	$.getUIDimensons = () => {
		const {0: t, 1: r, 2: b, 3: l} = getComputedStyle($.canvas).getPropertyValue('--__gamma__sarea__').split(' ')
		return { width: $.canvas.offsetWidth*.0625, height: $.canvas.offsetHeight*.0625, paddingLeft: parseFloat(l), paddingRight: parseFloat(r), paddingBottom: parseFloat(b), paddingTop: parseFloat(t) }
	}
	class Box extends GUIElement{
		constructor(el, pos, sz){ super(); this.child = el; this.pos = pos; this.size = sz }
		width = 0; height = 0
		replace(other){
			this.child.removeDependency(this.invalidate)
			void (this.child = other).addDependency(this.invalidate)
		}
		draw(ctx, ictx, w, h){
			if(!this.child.draw) return
			const {width, height} = this.child
			let {size, pos} = this, xs = 1, ys = 1
			if(typeof size == 'function') size = size(w/width, h/height)
			if(typeof size == 'number') xs = ys = size
			else if(typeof size == 'object') size && (xs = size.x, ys = size.y)
			const difw = w-width*xs, difh = h-height*ys
			if(typeof pos == 'function') pos = pos(difw, difh)
			if(typeof pos == 'object') pos && ctx.translate(pos.x*difw, pos.y*difh)
			else{
				if(typeof pos != 'number') pos = 0.5
				ctx.translate(pos*difw, pos*difh)
			}
			ctx.scale(xs, ys)
			this.child.draw(ctx, ictx, width, height)
		}
	}
	class Transform extends GUIElement{
		constructor(el, tr, ax, ay){ super(); this.child = el; this.child.addDependency(this.invalidate); this.transform = tr; this.anchorX = ax; this.anchorY = ay }
		get width(){ return this.child.width }
		get height(){ return this.child.height }
		replace(other){
			this.child.removeDependency(this.invalidate)
			void (this.child = other).addDependency(this.invalidate)
		}
		draw(ctx, ictx, w, h){
			if(!this.child.draw) return
			ctx.translate(w*this.anchorX, h*this.anchorY)
			this.transform(ctx, w, h)
			const {width, height} = this.child
			ctx.translate(-width*this.anchorX, -height*this.anchorY)
			this.child.draw(ctx, ictx, width, height)
		}
	}
	class BoxFill extends GUIElement{
		constructor(tex, pos, sz, tint){ super(); this.texture = tex; this.pos = pos; this.size = sz; this.tint = tint }
		width = 0; height = 0
		draw(ctx, _, w, h){
			if(!this.texture) return void ctx.drawRect(0, 0, w, h, this.tint)
			if(!this.texture.usable) return
			let {width, height} = this.texture
			let {size, pos} = this
			if(typeof size == 'function') size = size(w/width, h/height)
			if(typeof size == 'number') width *= size, height *= size
			else if(typeof size == 'object') size && (width *= size.x, height *= size.y)
			let difw = w-width, difh = h-height
			if(typeof pos == 'function') pos = pos(difw, difh)
			if(typeof pos == 'object') pos && (difw *= pos.x, difh *= pos.y)
			else{
				if(typeof pos != 'number') pos = 0.5
				difw *= pos, difh *= pos
			}
			const iw = 1/w, ih = 1/h
			ctx.drawRect(0, 0, w, h, this.texture.super(difw*iw, difh*ih, width*iw, height*ih), this.tint)
		}
	}
	class Target extends GUIElement{
		#click
		#stch = []
		state = 0
		hitTest = null
		constructor(cb, cur, cur2){ super(); this.#click = cb ? [cb] : []; this.cursor = cur; this.activeCursor = cur2 }
		reset(){ this.#click.length = this.#stch.length = 0 }
		onClick(cb){ this.#click.push(cb); return this }
		onStateChange(cb){ this.#stch.push(cb); return this }
		setCursor(cur){ this.cur = cur; return this }
		rounded(tl=0,tr=tl,bl=tl,br=tl){
			const l=max(tl,bl),r=max(tr,br)
			this.hitTest = (x,y,w,h) => {
			if(x<l){
				if(x<bl){ if(y<bl){ const x2=x-bl,y2=y-bl; if(x2*x2-y2*y2>bl*bl) return false } }
				else if(h-y<tl){ const x2=x-tl,y2=h-y-tl; if(x2*x2-y2*y2>tl*tl) return false }
			}
			if(w-x>r){
				if(w-x<br){ if(y<br){ const x2=w-x-br,y2=y-br; if(x2*x2-y2*y2>br*br) return false } }
				else if(h-y<tr){ const x2=x-tr,y2=h-y-tr; if(x2*x2-y2*y2>tr*tr) return false }
			}
			return true
		}; return this }
		#ptrCapt = -1
		#onPointerUpdate(ctx, w, h, id, ptr){
			let p = null
			switch(!ptr){
			case false:
				if(this.#ptrCapt >= 0 && id != this.#ptrCapt) return
				p = ctx.unproject(ptr)
				if(p.x >= 0 && p.x < w && p.y >= 0 && p.y < h && (this.hitTest?.(p.x, p.y, w, h)??true)) break
			case true:
				if(id == this.#ptrCapt){
					this.#ptrCapt = -1
					const pr = this.state; this.state = 0
					for(const r of this.#stch) try{r(NaN, NaN, 0, pr)}catch(e){Promise.reject(e)}
				}
				return
			}
			const cur = ptr.pressed ? this.activeCursor : this.cursor
			if(cur != null) ptr.setHint?.(cur)
			let pst = this.state; this.state = 1+ptr.pressed
			if(this.#ptrCapt == -1) this.#ptrCapt = id
			for(const r of this.#stch) try{r(p.x, p.y, this.state, pst)}catch(e){Promise.reject(e)}
			if(this.state!=2&&pst==2) for(const r of this.#click) try{r(p.x, p.y, this.state)}catch(e){Promise.reject(e)}
			return null
		}
		draw(ctx, ictx, w, h){ ictx.onPointerUpdate(this.#onPointerUpdate.bind(this, ctx, w, h)) }
	}
	class Scrollable{
		x = 0; y = 0
		sensitivity = .5
		constructor(c,w,h){this.contents=c;this.width=w;this.height=h}
		scrollBarX = dfs
		scrollBarY = dfs
		get scrollbar(){return this.scrollBarY}
		set scrollbar(a){this.scrollBarX = this.scrollBarY = a}
		consumeInputs(ctx){
			const {x: wx, y: wy} = ctx.fromDelta(scrollDelta), s = this.sensitivity
			scrollDelta.x = scrollDelta.y = 0
			const w = this.contents.width, h = this.contents.height
			this.x = this.width > 0 ? max(0, min(this.x + wx*s, w-this.width)) : min(0, max(this.x + wx*s, -w-this.width))
			this.y = this.height > 0 ? max(0, min(this.y + wy*s, h-this.height)) : min(0, max(this.y + wy*s, -h-this.height))
			ictx.wheel.x = ictx.wheel.y = 0
			const c = this.contents
			if(!c) return
			ctx = ctx.sub()
			ctx.translate((c.xOffset??0)-this.x, (c.yOffset??0)-this.y)
			c.consumeInputs?.(ctx)
		}
		draw(ctx, ictx){
			const c = this.contents
			if(!c?.draw) return
			const m = ctx.mask
			const ct2 = ctx.sub()
			ct2.mask = 128 // SET
			ct2.drawRect(0, 0, this.width, this.height)
			ct2.mask = m&15|16 // RGBA | IF_SET
			ct2.translate((c.xOffset??0)-this.x, (c.yOffset??0)-this.y)
			this.contents.draw(ct2, ictx)
			ctx.clearStencil()
			if(this.scrollBarX && this.height){
				const ct2 = ctx.sub()
				ct2.translate(0, this.height)
				if(this.height > 0) ct2.scale(1, -1)
				const w = abs(this.width), w1 = w / c.width
				if(w1 < 1) this.scrollBarX(ct2, abs(this.x) * w1, w * w1)
			}
			if(this.scrollBarY && this.width){
				const ct2 = ctx.sub()
				ct2.translate(this.width, 0)
				ct2.multiply(0, 1)
				if(this.width > 0) ct2.scale(1, -1)
				const h = abs(this.height), h1 = h / c.height
				if(h1 < 1) this.scrollBarY(ct2, abs(this.y) * h1, h * h1)
			}
		}
	}
	
	$.GUI = {
		CENTERED: vec2(.5, .5),
		LEFT: vec2(0, .5),
		RIGHT: vec2(1, .5),
		BOTTOM: vec2(.5, 0),
		TOP: vec2(.5, 1),
		BOTTOM_LEFT: vec2(0, 0),
		BOTTOM_RIGHT: vec2(1, 0),
		TOP_LEFT: vec2(0, 1),
		TOP_RIGHT: vec2(1, 1),
		ZStack: list(zdraw),
		Img: (tex) => new img(tex),
		Text: (rt, font) => new text(rt, font),
		Target: (cb = null, cur = PointerState.POINTER, cur2 = PointerState.POINTER) => new Target(cb,cur,cur2),
		Box: (a,b=.5,c=1) => new Box(a,b,c),
		BoxFill: (a,b=.5,c=max,d) => a.identity ? new BoxFill(a,b,c,d) : new BoxFill(null,1,1,a),
		Transform: (el, fn=Function.prototype, x=.5, y=.5) => new Transform(el,fn,x,y),
		//Scrollable: (c, w=1, h=-1) => new Scrollable(c, +w, +h)
	}
	const v4p2 = $.vec4(.2)
	/*const dfs = $.GUI.Scrollable.defaultScrollbar = (ctx, x0, w) => {
		ctx.shader = null
		ctx.drawRect(x0, 0, w, .1, v4p2)
	}*/

	const rem = ({target:t}) => (t._field._f&256||(t._field._f|=256,setImmediate(t._field.recalc)), t.remove(), $.setFocused(curf = null))
	// putting some stuff here allows us to catch system-defined key repeats
	const keydown = e => {
		const i = e.target, tf = i._field
		if(e.keyCode == 38 || e.keyCode == 40){
			if((tf._f>>1&1)^e.shiftKey) e.keyCode == 38 ? tf.upArrowCb?.() : tf.downArrowCb?.()
			else if(tf._f&2048){ // multiline
				if(tf.sel0 == tf.sel1){
					let i = tf.sel0, i0 = i, idx = tf.sel0pos, j = idx
					while(j) i -= tf.lines[--j].length
					const x = tf.lines[idx].slice(0,i).width
					if(e.keyCode == 38 && idx){
						const pl = tf.lines[idx-1]
						tf.sel0 = tf.sel1 = i0 - i - pl.length + pl.indexAt(x)
					}else if(e.keyCode == 40 && idx < tf.lines.length-1){
						tf.sel0 = tf.sel1 = i0 - i + tf.lines[idx].length + tf.lines[idx+1].indexAt(x)
					}
				}else if(e.keyCode == 38) tf.sel0 = tf.sel1
				else tf.sel1=tf.sel0
			}
		}else if(e.keyCode == 13){
			if((tf._f>>2&1)^e.shiftKey) tf.enterCb?.()
			else return
		}else if(e.keyCode == 9){
			if((tf._f>>3&1)^e.shiftKey) tf.tabCb?.()
			else if(tf._f&1) tf.insert('\t')
		}else return
		e.preventDefault()
	}
	const crInput = (type, o) => {
		const i = document.createElement(type)
		// Chrome requires 1px size in order for some features such as copying to work
		i.style = `width:1px;height:1px;border:0;padding:0;opacity:0;position:fixed;inset:-9px;font-size:16px;font-family:monospace;white-space:nowrap;pointer-events:none`
		i.onblur = rem
		i.onkeydown = keydown
		i.tabIndex = -1
		i._field = o
		document.documentElement.append(i)
		return i
	}
	const v4 = $.vec4
	let curf = null, ltf = 0
	const defaultSr = (p2, field) => p2.insertLinePass(-1, [field.focus ? v4(0,.2,.4,.6) : v4(.2,.2,.2,.6)], 0, 1)
	const defaultCr = (ctx, font) => {
		if(!font) return
		ctx.shader = null
		if(($.t-ltf)%1<.5) ctx.drawRect(0, font.ascend-1, .05, 1, v4.one)
	}
	class _txtfield{
		_f=0; #s=0; #e=0
		get allowTabs(){return(this._f&1)!=0}
		set allowTabs(a){this._f=this._f&-2|a&1}
		get shiftArrows(){return(this._f&2)!=0}
		set shiftArrows(a){this._f=this._f&-3|-a&2}
		get shiftEnter(){return(this._f&4)!=0}
		set shiftEnter(a){this._f=this._f&-5|-a&4}
		get shiftTab(){return(this._f&8)!=0}
		set shiftTab(a){this._f=this._f&-9|-a&8}
		upArrowCb = null
		downArrowCb = null
		enterCb = null
		tabCb = null
		scrollable = null
		#i
		constructor(t){this.#i=crInput(t?'textarea':'input', this);this._f=t}
		get value(){return this.#i.value}
		set value(a){this.#i.value=a;this._f&256||(this._f|=256,setImmediate(this.recalc))}
		get sel0(){return this.#s}
		set sel0(a){
			a >>>= 0
			if(this.#e >= this.#s){
				if(a <= this.#e) this.#i.selectionStart = a
				else{
					this.#i.selectionStart = this.#e
					this.#i.selectionEnd = a
					this.#i.selectionDirection = 'backward'
				}
			}else{
				if(a > this.#e) this.#i.selectionEnd = a
				else{
					this.#i.selectionStart = a
					this.#i.selectionEnd = this.#e
					this.#i.selectionDirection = 'forward'
				}
			}
			this.#s = a
		}
		get sel1(){return this.#e}
		set sel1(a){
			a >>>= 0
			if(this.#e >= this.#s){
				if(a >= this.#s) this.#i.selectionEnd = a
				else{
					this.#i.selectionStart = a
					this.#i.selectionEnd = this.#s
					this.#i.selectionDirection = 'backward'
				}
			}else{
				if(a < this.#s) this.#i.selectionStart = a
				else{
					this.#i.selectionStart = this.#s
					this.#i.selectionEnd = a
					this.#i.selectionDirection = 'forward'
				}
			}
			this.#e = a
		}
		select(s, e = s){
			if((s >>>= 0) <= (e >>>= 0)){
				this.#i.selectionStart = s
				this.#i.selectionEnd = e
				if(this.#s > this.#e) this.#i.selectionDirection = 'forward'
			}else{
				this.#i.selectionStart = e
				this.#i.selectionEnd = s
				if(this.#s <= this.#e) this.#i.selectionDirection = 'backward'
			}
			this.#s = s; this.#e = e
			this._f&256||(this._f|=256,setImmediate(this.recalc))
		}
		get selStart(){ return min(this.#s, this.#e) }
		get selEnd(){ return max(this.#s, this.#e) }
		get isSelecting(){ return (this._f&512)!=0 }
		#tr=null
		get transformer(){return this.#tr}
		set transformer(a){this.#tr!=(this.#tr=a)&&!(this._f&256)&&(this._f|=256,setImmediate(this.recalc))}
		simpleTransformer(font, placeholder='', ...v){
			let w = v.slice()
			w[0] = v[0] ? v4.multiply(v[0], .4) : v4(.4)
			this.#tr = value => {
				const p = $.RichText(font)
				if(v.length) p.setTextPass(0, v)
				if(value) p.add(value)
				else{
					p.setTextPass(0, w)
					p.index = false
					p.add(placeholder)
				}
				return p
			}
			this._f&256||(this._f|=256,setImmediate(this.recalc))
		}
		#cr = defaultCr
		#sr = defaultSr
		#p=null;#pa=null
		#mw=Infinity
		#sw=0; #ew=0; #w=0
		get sel0pos(){return this.#sw}
		get sel1pos(){return this.#ew}
		get multiline(){return(this._f&2048)!=0}
		set multiline(a=true){
			const i = this.#i, v = i.value, f = document.activeElement == i
			if(a){
				if(this._f&2048) return
				this.#p = null
				this._f|=2304
				this.#i = crInput('textarea', this)
			}else{
				if(!(this._f&2048)) return
				this.#pa = null
				this._f=this._f&-2049|256
				this.#i = crInput('input', this)
			}
			if(f) this.focus = true
			else i.remove(), curf == i && $.setFocused(curf = null), this._f&256||(this._f|=256,setImmediate(this.recalc))
			this.#i.value = v
			this.#i.selectionStart = this.#s
			this.#i.selectionEnd = this.#e
			this.#i.selectionDirection = this.#s > this.#e ? 'backward' : 'forward'
		}
		get width(){return this.#w}
		get line(){return this.#p}
		get lines(){return this.#pa}
		get cursor(){return this.#cr}
		set cursor(a){this.#cr!=(this.#cr=a)&&!(this._f&256)&&(this._f|=256,setImmediate(this.recalc))}
		get selector(){return this.#sr}
		set selector(a){this.#sr!=(this.#sr=a)&&!(this._f&256)&&(this._f|=256,setImmediate(this.recalc))}
		get maxWidth(){return this.#mw}
		set maxWidth(a){this.#mw=a,this._f&256||(this._f|=256,setImmediate(this.recalc))}
		recalc = () => {
			const f = this._f
			if(!(f&256)) return
			const i = this.#i, s = min(this.#s, this.#e), e = max(this.#s, this.#e)
			this._f = f&-257; ltf = $.t
			const v = i.value
			const p = this.#tr?.(v, this) ?? $.RichText()
			if(s == e){
				const p2 = p.slice(s)
				p.trim(s)
				if(!(f&2048)) this.#sw = this.#ew = p.width
				this.#cr&&document.activeElement==this.#i&&p.addCb(this.#cr)
				p.concat(p2)
			}else{
				const p2 = p.slice(s), p3 = p2.slice(e-s)
				p2.trim(e-s)
				p.trim(s)
				if(f&2048){
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
			if(f&2048){
				const pa = this.#pa = p.break(this.#mw)
				let w = 0
				for(const {width} of pa) if(width>w) w = width
				this.#w = w
				let i = s, l = 0
				while(l < pa.length && i >= 0){
					i -= pa[l++].length
				}
				i = e - s + i + (l ? pa[--l].length : 0)
				this.#sw = l
				while(l < pa.length && i >= 0){
					i -= pa[l++].length
				}
				this.#ew = l?l-1:0
			}else this.#p = p, this.#w = p.width
		}
		insert(t='', off = t.length){
			const i = this.#i, s = i.selectionStart
			i.setRangeText(t, s, i.selectionEnd, 'start')
			i.selectionStart = i.selectionEnd = this.#s = this.#e = s + off
		}
		get focus(){ return document.activeElement==this.#i }
		set focus(f = true){
			if(f){
				if(!curf) document.documentElement.append(curf = this.#i)
				else if(curf != this.#i) curf.replaceWith(curf = this.#i)
				else return
				$.setFocused(curf)
				ltf = $.t
				this._f&256||(this._f|=256,setImmediate(this.recalc))
			}else if(curf == this.#i) curf.remove(), $.setFocused(curf = null)
		}
		lineHeight = 1.3
		lineAscend = .9
		#lc = 0
		#ptrDown = -1
		#onPointerUpdate(ctx, id, ptr){
			if(!ptr){
				if(id == this.#ptrDown){
					// pointer up
					this.#ptrDown = -1
					this._f &= ~1536
				}
				return
			}
			ptr.setHint?.(PointerState.TEXT)
			if(this.#ptrDown == -1 && ptr.pressed){
				this.#ptrDown = id
				// pointer down
				this.focus = true
			}else if(this.#ptrDown != id) return null
			if(!ptr.pressed){
				// pointer up
				this.#ptrDown = -1
				this._f &= ~1536
				return null
			}
			// pointer move
			let {x, y} = ctx.unproject(ptr); y = this.lineAscend-y
			const sel = this._f>>9&3
			if(sel==3) return null
			let j = 0
			if(this.#p) j = this.#p.indexAt(x)
			else if(this.#pa){
				let i = floor(y/this.lineHeight)
				i = i>=0?i>=this.#pa.length?this.#pa.length-1:i>>>0:0
				j = this.#pa[i].indexAt(x)
				while(i) j += this.#pa[--i].length
			}
			if(sel) this.sel1 = j
			else{
				let seekType = 0, s = j, e = j
				if(this.#lc<0){
					if(this.#lc-(this.#lc=-t) < .3) seekType = 2
					else this.#lc = t
				}else if(this.#lc>0){
					if(this.#lc-(this.#lc=t) > -.3) seekType = 1, this.#lc=-t
				}else this.#lc = t
				this._f |= 512|(seekType>0)<<10
				if(seekType){
					const v = this.#i.value
					const min = 33-seekType
					// Will correctly skip unicode chars too, since we are only scanning for chars <= U+20
					while(v.charCodeAt(e++)>min);
					while(v.charCodeAt(--s)>min);
					s++; e--
				}
				if(s != this.#s || e != this.#e) this.select(s, e)
			}
			return null
		}
		get height(){return this.lineHeight*(this.#pa?this.#pa.length:1)}
		layout(ctx, ictx, x=-Infinity, y=-Infinity, w=Infinity, h=Infinity){
			ictx.onPointerUpdate(this.#onPointerUpdate.bind(this, ctx))
			ictx.onKeyUpdate((key, isDown) => {
				$.captureKeyEvent(this.#i, key, isDown)
				return false
			})
		}
		get height(){return this.#pa?this.#pa.length*this.lineHeight:this.lineHeight}
		get xOffset(){return 0}
		get yOffset(){return -this.lineAscend}
		draw(ctx, ictx){
			if(this.#pa){
				for(const l of this.#pa){
					l.draw(ctx.sub())
					ctx.translate(0,-this.lineHeight)
				}
			}else this.#p?.draw(ctx)
		}
		static #_ = (document.addEventListener('input', ({target}) => {
			const f = target._field
			if(!f) return
			const { selectionStart: s, selectionEnd: e, selectionDirection: d } = target
			if(d == 'backward') f.#s = e, f.#e = s
			else f.#s = s, f.#e = e
			f._f&256||(f._f|=256,setImmediate(f.recalc))
		}),
		document.addEventListener('selectionchange', ({target}) => {
			const f = target._field
			if(!f) return
			const { selectionStart: s, selectionEnd: e, selectionDirection: d } = target
			if(d == 'backward') f.#s = e, f.#e = s
			else f.#s = s, f.#e = e
			f._f&256||(f._f|=256,setImmediate(f.recalc))
		}))
	}
	$.TextField = (multiline=false) => new _txtfield(multiline<<11&2048)
	$.TextField.cursorTimer = () => $.t-ltf
}}