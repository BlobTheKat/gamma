Gamma.textfield = $ => {
	class _txtfield{
		#i = document.createElement('input')
		#p = null
		get value(){return this.#i.value}
		set value(a){this.#i.value=a}
	}
	class _txtfield2{
		#i = document.createElement('textarea')
	}
	$.TextField = () => new _txtfield()
	$.MultiTextField = () => new _txtfield2()
}