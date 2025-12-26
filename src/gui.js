{Gamma.gui = $ => {
	if(!$.Font) throw 'Initialize Gamma.font before Gamma.gui'
	$.GUIElement = class GUIElement{
		#w = NaN; #h = NaN; #drawDep = null; _invalidated = false
		_dimensions(){ return vec2.zero }
		invalidate = () => {
			this._invalidated = true
			this.#w = this.#h = NaN
			const hook = this.#drawDep
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
	class GUIElementManualValidate{
		#drawDep = null; _invalidated = false
		invalidate = () => {
			if(this._invalidated) return
			this._invalidated = true
			const hook = this.#drawDep
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
	}
	const zdraw = function(ctx, ictx, w, h){
		this._invalidated = false
		let i = this.children.length
		w = this.width || w; h = this.height || h
		for(const el of this.children) el.draw?.(--i ? ctx.sub() : ctx, ictx, w, h)
	}
	const list = (draw, layout) => {
		class list extends GUIElementManualValidate{
			width = 0; height = 0
			sized(w, h){ this.width = w; this.height = h; return this }
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
		draw(ctx, _, w, h){ this.texture.then?.(this.invalidate); ctx.drawRect(0, 0, w, h, this.texture) }
	}
	class Text extends GUIElement{
		constructor(rt){ super(); this.text = rt }
		get width(){ return this.text.width }
		get height(){ return 1 }
		draw(ctx, ictx, w, h){ this.text.draw(ctx) }
	}
	$.canvas.style.setProperty('--__gamma__sarea__', 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)')
	$.getGUIDimensions = (s=16) => {
		s = 1/s
		const {0: t, 1: r, 2: b, 3: l} = getComputedStyle($.canvas).getPropertyValue('--__gamma__sarea__').split(' ')
		return { width: $.canvas.offsetWidth*s, height: $.canvas.offsetHeight*s, paddingLeft: parseFloat(l)*s, paddingRight: parseFloat(r)*s, paddingBottom: parseFloat(b)*s, paddingTop: parseFloat(t)*s }
	}
	class Box extends GUIElementManualValidate{
		constructor(el, pos, sz){ super(); this.child = el; this.pos = pos; this.size = sz }
		width = 0; height = 0
		sized(w, h){ this.width = w; this.height = h; return this }
		replace(other){
			this.child.removeDependency(this.invalidate)
			void (this.child = other).addDependency(this.invalidate)
		}
		draw(ctx, ictx, w, h){
			this._invalidated = false
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
	class Transform extends GUIElementManualValidate{
		constructor(el, tr, ax, ay){ super(); this.child = el; this.child.addDependency(this.invalidate); this.transform = tr; this.anchorX = ax; this.anchorY = ay }
		get width(){ return this.child.width }
		get height(){ return this.child.height }
		replace(other){
			this.child.removeDependency(this.invalidate)
			void (this.child = other).addDependency(this.invalidate)
		}
		draw(ctx, ictx, w, h){
			this._invalidated = false
			if(!this.child.draw) return
			ctx.translate(w*this.anchorX, h*this.anchorY)
			const {width, height} = this.child
			this.transform(ctx, w, h, width, height)
			ctx.translate(-width*this.anchorX, -height*this.anchorY)
			this.child.draw(ctx, ictx, width, height)
		}
	}
	class BoxFill extends GUIElement{
		constructor(tex, pos, sz, tint){ super(); this.texture = tex; this.pos = pos; this.size = sz; this.tint = tint }
		width = 0; height = 0
		draw(ctx, _, w, h){
			if(!this.texture) return void ctx.drawRect(0, 0, w, h, this.tint)
			if(!this.texture.loaded) return void this.texture.then?.(this.invalidate)
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
	class Layer extends GUIElementManualValidate{
		width = 0; height = 0
		ictx = InputContext()
		constructor(c){ super(); this.child = c; this.child.addDependency(this.invalidate) }
		sized(w, h){ this.width = w; this.height = h; return this }
		#mouseHovering = false
		#a = NaN; #b = NaN; #c = NaN; #d = NaN; #e = NaN; #f = NaN; #g = NaN; #h = NaN; #i = NaN; #sw = NaN; #sh = NaN; #tw = 0; #th = 0
		#x0 = 0; #rw = -1; #y0 = 0; #rh = 0
		options = 0; format = Formats.RGBA; mipmaps = 1
		#tex = null
		#drw = Drawable(); #drw2 = this.#drw.subPersp()
		replace(other){
			this.child.removeDependency(this.invalidate)
			void (this.child = other).addDependency(this.invalidate)
		}
		tolerance = 0.25
		depthTolerance = 0.01
		lastRedraw = -1
		draw(ctx, ictx, sw, sh){
			let a, b, c, d, e, f, g, h, i, diff = true
			const {width, height} = ctx
			ctx.scale(sw, sh)
			// Tolerance of 1/4px
			const tol1 = +this.tolerance, tg = this.#g, th = this.#h
			a: if(ctx.perspective){
				const tol2 = tol1*(1-this.depthTolerance)
				void ({a, b, c, d, e, f, g, h, i} = ctx)
				if(tg !== tg) break a
				let i0 = i, i1 = this.#i; if(i0>i1) i0 = i1, i1 = i
				if(max(abs(g-tg)*width + abs(h-th)*height, max(i1, 1e-6)*tol2) > max(i0, 1e-6)*tol1) break a
				const gd = g+d, gd2 = tg+this.#d, he = h+e, he2 = th+this.#e, fi = i+f, fi2 = this.#i + this.#f
				if(fi>fi2) i0 = fi2, i1 = fi; else i0 = fi, i1 = fi2
				if(max(abs(gd-gd2)*width + abs(he-he2)*height, max(i1, 1e-6)*tol2) > max(i0, 1e-6)*tol1) break a
				i0 = fi+c, i1 = fi2+this.#c; if(i0>i1) i0 = i1, i1 = fi2+c
				if(max(abs(gd+a-(gd2+this.#a))*width + abs(he+b-(he2+this.#b))*height, max(i1, 1e-6)*tol2) > max(i0, 1e-6)*tol1) break a
				i0 = i+c, i1 = this.#i+this.#c; if(i0>i1) i0 = i1, i1 = i+c
				if(max(abs(g+a-(tg+this.#a))*width + abs(h+b-(th+this.#b))*height, max(i1, 1e-6)*tol2) > max(i0, 1e-6)*tol1) break a
				diff = false
			}else{
				void ({a, b, c: d, d: e, e: g, f: h} = ctx)
				c = 0, f = 0, i = 1
				if(tg !== tg) break a
				if(abs(g-tg)*width + abs(h-th)*height > tol1) break a
				if(abs(a-this.#a)*width + abs(b-this.#b)*height > tol1) break a
				if(abs(d-this.#d)*width + abs(e-this.#e)*height > tol1) break a
				diff = false
			}
			if(sw!=this.#sw||this._invalidated||diff||sh!=this.#sh){
				const bound = ctx.loopBoundary()
				this.#sw = sw; this.#sh = sh; this._invalidated = false; this.#tw = width; this.#th = height
				this.#a = a; this.#b = b; this.#c = c; this.#d = d; this.#e = e; this.#f = f; this.#g = g; this.#h = h; this.#i = i
				let tex = this.#tex
				if(!bound){
					this.#rw = -1
					if(tex) this.#drw.setTarget(0, null), tex.delete(), this.#tex = null
				}else{
					this.lastRedraw = t
					const o = this.options
					const x0 = floor(bound.x0*width), rw = ceil(bound.x1*width)-x0
					const y0 = floor(bound.y0*height), rh = ceil(bound.y1*height)-y0
					this.#x0 = x0/width; this.#rw = rw/width; this.#y0 = y0/height; this.#rh = rh/height
					if(!tex||tex.format!=this.format||tex.width!=rw||tex.height!=rh||tex.format!=this.format){
						tex?.delete()
						tex = this.#tex = Texture(rw, rh, 1, o, this.format, this.mipmaps)
						this.#drw.setTarget(0, tex)
						this.mipmaps = tex.mipmaps; this.format = tex.format
					}else this.#drw.clear(0, 0, 0, 0)
					if(this.#tex.options != o) this.#tex.option = o
					this.ictx.reset()
					const irw = 1/this.#rw, irh = 1/this.#rh
					let ct
					if(ctx.perspective)
						(ct = this.#drw2).reset((a-this.#x0*c)*irw,(b-this.#y0*c)*irh,c,(d-this.#x0*f)*irw,(e-this.#y0*f)*irh,f,(g-this.#x0*i)*irw,(h-this.#y0*i)*irh,i)
					else
						(ct = this.#drw).reset(a*irw,b*irh,d*irw,e*irh,(g-this.#x0)*irw,(h-this.#y0)*irh)
					ct.scale(1/sw, 1/sh)
					const postdraw = this.predraw?.(ct, this.ictx, sw, sh)
					this.child.draw(ct, this.ictx, sw, sh)
					postdraw?.()
					if(this.mipmaps) tex.genMipmaps()
				}
			}
			if(this.#rw < 0) return
			const m = ctx.mask&RGBA
			ctx.mask = SET|NEVER
			ctx.draw(vec4.zero)
			ctx.perspective ? ctx.reset(this.#rw, 0, 0, 0, this.#rh, 0, this.#x0, this.#y0, 1) : ctx.reset(this.#rw, 0, 0, this.#rh, this.#x0, this.#y0)
			ctx.mask = m|IF_SET|UNSET
			ctx.draw(this.#tex)
			//ctx.draw(vec4(.2,0,0,.2))
			ictx.onPointerUpdate((id, ptr) => {
				if(!id) this.#mouseHovering = !!ptr
				if(!ptr) return void this.ictx.setPointer(id, null)
				let p = ctx.unproject(ptr)
				if(p.x >= 0 && p.y >= 0 && p.x < 1 && p.y < 1){
					ptr.x = p.x; ptr.y = p.y
					const p2 = this.ictx.setPointer(id, ptr)
					if(p2) ({x: p2.x, y: p2.y} = ctx.project(p2))
					return p2
				}
				this.ictx.setPointer(id, null)
				// pass
			})
			ictx.onWheel((dx, dy) => {
				if(this.#mouseHovering) return this.ictx.fireWheel(dx, dy)
			})
			ictx.onMouse((dx, dy) => {
				if(this.#mouseHovering) return this.ictx.fireMouse(dx, dy)
			})
			ictx.onKeyUpdate(this.ictx)
			ictx.onGamepadUpdate(this.ictx)
		}
	}
	class ScrollableLayer extends Layer{
		constructor(el, ax, ay){ super(el); this.anchorX = ax; this.anchorY = ay }
		x = 0; y = 0
		scrollSpanX = 0; scrollSpanY = 0
		sensitivity = .0625
		easing = .05
		_velocityX = 0; _velocityY = 0
		scrollBarX = dfs
		scrollBarY = dfs
		get scrollbar(){return this.scrollBarY}
		set scrollbar(a){ this.scrollBarX = this.scrollBarY = a }
		predraw(ctx, ictx, w, h){
			let {width, height} = this.child
			width = max(width - w, 0); height = max(height - h, 0)
			const xsctx = this.scrollBarX && width ? ctx.sub() : null
			const ysctx = this.scrollBarY && height ? ctx.sub() : null
			const aw = -width*this.anchorX, ah = -height*this.anchorY
			let {_velocityX: vx, _velocityY: vy} = this
			if(vx||vy){
				const dt2 = dt/this.easing
				if(vx){
					if(abs(vx) > dt2){ const a = sign(vx)*dt2; this._velocityX = vx-a; vx -= a*.5 }
					else this._velocityX = 0, vx *= .5
					const x = this.x + vx*dt2
					if(x != (this.x = clamp(x, aw, width+aw))) this._velocityX = 0
				}
				if(vy){
					if(abs(vy) > dt2){ const a = sign(vy)*dt2; this._velocityY = vy-a; vy -= a*.5 }
					else this._velocityY = 0, vy *= .5
					const y = this.y + vy*dt2
					if(y != (this.y = clamp(y, ah, height+ah))) this._velocityY = 0
				}
				this.invalidate()
			}
			const tx = ctx.getTransform()
			ctx.translate(aw-this.x, ah-this.y)
			ictx.onWheel((dx, dy) => {
				if(!ictx.cursor) return
				const p = tx.unproject(ictx.cursor)
				if(p.x < 0 || p.y < 0 || p.x > w || p.y > h) return
				dx *= this.sensitivity; dy *= this.sensitivity
				if(this.easing){
					// Move (dx, dy) in {easing} seconds, following a quadratic curve
					// We assume easing = 1s, as the speed is applied per frame instead of here, for correct behavior when easing is changed mid-animation
					const {_velocityX: vx, _velocityY: vy} = this
					dx = vx*abs(vx)+dx+dx; dy = vy*abs(vy)+dy+dy
					this._velocityX = sqrt(abs(dx))*sign(dx)
					this._velocityY = sqrt(abs(dy))*sign(dy)
				}else{
					this.x = clamp(this.x + dx, aw, width+aw)
					this.y = clamp(this.y + dy, ah, height+ah)
				}
				this.invalidate()
				return null
			})
			return xsctx || ysctx ? () => {
				if(xsctx){
					xsctx.translate(0, h)
					const iw = 1 / (w + width)
					this.scrollBarX(xsctx, (this.x-aw) * iw, w * iw, w)
				}
				if(ysctx){
					ysctx.translate(w, 0)
					ysctx.multiply(0, -1)
					const ih = 1 / (h + height)
					this.scrollBarY(ysctx, (this.y-ah) * ih, h * ih, h)
				}
			} : undefined
		}
	}
	class Padding extends GUIElement{
		constructor(el, b, l, t, r){ this.child = el; this.bottom = b; this.left = l; this.top = t; this.right = r; this.child.addDependency(this.invalidate) }
		replace(other){
			this.child.removeDependency(this.invalidate)
			void (this.child = other).addDependency(this.invalidate)
		}
		_dimensions(){ return vec2(this.child.width + this.left + this.right, this.child.height + this.bottom + this.top) }
		draw(ctx, ictx, w, h){
			ctx.translate(this.left, this.bottom)
			this.child.draw?.(ctx, ictx, w-this.left-this.right, h-this.top-this.bottom)
		}
	}
	class ParticleContainer extends GUIElementManualValidate{
		width = 0; height = 0
		sized(w, h){ this.width = w; this.height = h; return this }
		#config
		constructor(config){ super(); this.#config = config }
		get config(){ return this.#config }
		set config(c){ this.#config = c; this.#free.length = 0; this.#particles.length = 0 }
		lastT = NaN
		#particles = []
		#free = []
		draw(ctx, a, b, c){
			this._invalidated = false
			ctx = this.#config.prepare?.(ctx, a, b, c) ?? ctx
			const dt = t - this.lastT || 0; this.lastT = t
			const len = this.#particles.length
			if(!len) return
			for(let i = len-1; i >= 0; i--){
				const p = this.#particles[i]
				if(p && this.#config.update(ctx, p, dt)) this.#particles[i] = null, this.#free.push(i)
			}
			if(this.#free.length >= min(len, max(5, len>>1))){
				this.#free.length = 0
				let i = 0
				while(this.#particles[i]) i++
				let j = i+1
				while(j < len){
					const n = this.#particles[j++]
					if(n) this.#particles[i++] = n
				}
				this.#particles.length = i
			}
			this.invalidate()
		}
		add(...a){
			const v = this.#config.init(...a)
			if(!this.#particles.length) this.lastT = t
			if(this.#free.length) this.#particles[this.#free.pop()] = v
			else this.#particles.push(v)
		}
	}
	$.GUI = {
		MIDDLE: vec2(.5, .5),
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
		Text: (rt='', font=null) => {
			if(typeof rt == 'string'){
				const txt = rt
				rt = $.RichText(font)
				if(txt) rt.add(txt)
			}
			return new Text(rt)
		},
		Target: (cb = null, cur = PointerState.POINTER, cur2 = PointerState.POINTER) => new Target(cb,cur,cur2),
		Box: (a,b=.5,c=1) => new Box(a,b,c),
		BoxFill: (a,b=.5,c=max,d) => a.identity ? new BoxFill(a,b,c,d) : new BoxFill(null,1,1,a),
		Transform: (el, fn=Function.prototype, x=.5, y=.5) => new Transform(el,fn,x,y),
		Layer: (el) => new Layer(el),
		ScrollableLayer: (c, ax=0, ay=1) => (typeof ax=='object'&&({x:ax,y:ay}=ax),new ScrollableLayer(c, ax, ay)),
		Padding: (c, b=0, l=b, t=b, r=l) => new Padding(c, b, l, t, r),
		TextField: (multiline=false) => new _txtfield(multiline<<11&2048)
	}
	$.GUI.TextField.cursorTimer = () => $.t-ltf
	$.ParticleContainer = ParticleContainer
	const v4p2 = $.vec4(.2)
	const dfs = $.GUI.ScrollableLayer.defaultScrollbar = (ctx, x, w, width) => {
		ctx.shader = null
		ctx.drawRect(x*width, 0, w*width, .5, v4p2)
	}

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
	class _txtfield extends GUIElementManualValidate{
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
		#onPointerUpdate(ctx, w, h, id, ptr){
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
		get height(){return this.#pa?this.#pa.length*this.lineHeight:this.lineHeight}
		get xOffset(){return 0}
		get yOffset(){return -this.lineAscend}
		draw(ctx, ictx, w, h){
			ictx.onPointerUpdate(this.#onPointerUpdate.bind(this, ctx, w, h))
			ictx.onKeyUpdate((key, isDown) => {
				if(this.focus) $.captureKeyEvent(this.#i, key, isDown)
				return false
			})
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
}}