Gamma.textfield = $ => {
	const refocus = e => e.target.focus()
	const cri = typ => {
		const i = document.createElement(typ)
		i.style = `width:0;height:0;border:0;padding:0;opacity:0;position:absolute;inset:-100px;font-size:1px`
		i.onblur = refocus
		document.documentElement.append(i)
		return i
	}
	let curf = null
	class _txtfield{
		#i = cri('input')
		get value(){return this.#i.value}
		set value(a){this.#i.value=a}
		get sel0(){return this.#i.selectionStart}
		set sel0(a){this.#i.selectionStart=a}
		get sel1(){return this.#i.selectionEnd}
		set sel1(a){this.#i.selectionEnd=a}
		write(t='', off = t.length){
			const i = this.#i, v = i.value, s = i.selectionStart, e = i.selectionEnd
			i.value = v.slice(0,s) + t + v.slice(e)
			i.selectionStart = i.selectionEnd = s + off
		}
		setFocus(f = true){
			if(f){
				if(!curf) document.documentElement.append(curf = this.#i)
				else if(curf != this.#i) curf.replaceWith(curf = this.#i)
				curf.focus()
			}else if(curf == this.#i) curf.remove(), curf = null
		}
	}
	class _txtfield2{
		#i = cri('textarea')
	}
	$.TextField = () => new _txtfield()
	$.MultiTextField = () => new _txtfield2()
}