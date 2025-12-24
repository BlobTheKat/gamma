{Object.defineProperties(Array.prototype, {
	best: {enumerable: false, value(pred, best = -Infinity){
		let el = undefined
		const length = this.length
		for(let i = 0; i < length; i++){
			const a = this[i], score = pred(a, i, this)
			if(score >= best) best = score, el = a
		}
		return el
	}},
	mmap: {enumerable: false, value(fn){
		const len = this.length
		for(let i = 0; i < len; i++)
			this[i] = fn(this[i])
		return this
	}},
	bind: {enumerable: false, value(fn,idx=-1){
		if((idx>>>=0)>=this.length)return this.push(fn);let a;while(idx<this.length)a=this[idx],this[idx++]=fn,fn=a;return this.push(a)
	}},
	fire: {enumerable: false, value(...v){
		for(const r of this) try{r(...v)}catch(e){Promise.reject(e)}
	}},
	mapFire: {enumerable: false, value(...v){
		const res = []
		for(const r of this) try{res.push(r(...v))}catch(e){Promise.reject(e);res.push(undefined)}
		return res
	}},
	remove: { enumerable: false, value(a){
		let i = this.indexOf(a)
		if(i >= 0){
			while(i<this.length) this[i] = this[++i]
			this.pop()
		}
		return i
	}}
})
globalThis.TypedArray ??= Object.getPrototypeOf(Uint8Array)
Uint8Array.fromHex = function(hex){
	const res = new Uint8Array(hex.length>>>1)
	let r = 1, i = 0
	for(let j = 0; j < hex.length; j++){
		const c = hex.charCodeAt(j)
		if(c>47&&c<58) r = r<<4|c-48
		else if(c>64&&c<71) r = r<<4|c-55
		else if(c>96&&c<103) r = r<<4|c-87
		if(r&256) res[i++] = r, r = 1
	}
	return res.slice(0, i)
}
Uint16Array.fromHex = function(hex){
	const res = new Uint16Array(hex.length>>>2)
	let r = 1, i = 0
	for(let j = 0; j < hex.length; j++){
		const c = hex.charCodeAt(j)
		if(c>47&&c<58) r = r<<4|c-48
		else if(c>64&&c<71) r = r<<4|c-55
		else if(c>96&&c<103) r = r<<4|c-87
		if(r&65536) res[i++] = r, r = 1
	}
	return res.slice(0, i)
}
globalThis.hsla = (h,s,l,a=1) => {
	h *= 1/30; h %= 12; h += (h<0)*12
	const f = s*(l<.5?l:1-l)
   return vec4(max(0, l-f*max(3-abs(h-6),-1)),max(0, l-f*max(3-abs(h+(h<4)*12-10),-1)),max(0, l-f*max(3-abs(h-(h>=8)*12-2),-1)),a)
}
const h = '0123456789abcdef'
Number.prototype.toHex = function(){return h[this>>>28]+h[this>>24&15]+h[this>>20&15]+h[this>>16&15]+h[this>>12&15]+h[this>>8&15]+h[this>>4&15]+h[this&15]}
Number.formatData = bytes => bytes < 512 ? bytes.toFixed(0)+'B' : bytes < 524288 ? (bytes/1024).toFixed(1)+'KiB' : bytes < 536870912 ? (bytes/1048576).toFixed(1)+'MiB' : bytes < 549755813888 ? (bytes/1073741824).toFixed(1)+'GiB' : (bytes/1099511627776).toFixed(1)+'TiB'
Date.kebab = (d = new Date()) => `${d.getYear()+1900}-${('0'+d.getMonth()).slice(-2)}-${('0'+d.getDate()).slice(-2)}-at-${('0'+d.getHours()).slice(-2)}-${('0'+d.getMinutes()).slice(-2)}-${('0'+d.getSeconds()).slice(-2)}`
globalThis.randint ??= Math.randint ??= () => Math.random() * 4294967296 | 0
const a = document.createElement('a')
globalThis.download = (file, name = file.name ?? (file.type[0]=='@' ? 'file' : file.type.split('/',1)[0])) => {
	a.href = URL.createObjectURL(file)
	a.download = name
	a.click()
	URL.revokeObjectURL(a.href)
}
const {floor, trunc, fround} = Math
const grow = 'transfer' in ArrayBuffer.prototype ? (b,n=0)=>{ b.buf8 = new Uint8Array((b.buf = new DataView(b.buf.buffer.transfer(b.cap=(b.cap<<1)+n))).buffer) } : (b, n = 0) => {
	const r = new Uint8Array(new ArrayBuffer(b.cap=(b.cap<<1)+n))
	r.set(b.buf8, 0); b.buf = new DataView(r.buffer); b.buf8 = r
}
// Feds are coming, watch out!
let encodable = (f,e,d,s) => (f.encode=e,f.decode=d,f.size=s,f)
globalThis.Nanobuf = {
	decoder: new TextDecoder(),
	encoder: new TextEncoder(),
	BufReader: class BufReader extends DataView{
		/**  */
		constructor(arr){
			if(arr instanceof ArrayBuffer) super(arr)
			else super(arr.buffer, arr.byteOffset, arr.byteLength)
			this.i = this.bitState = 0
		}
		decode(t,v){ return t.decode(this,v) }
		b1(){
			let a = this.bitState
			if(a<2) try{a=this.getUint8(this.i++)|256}catch{a=256}
			this.bitState = a>>1; return a&1
		}
		b2(){
			let a = this.bitState
			if(a<4) try{a=a&(a=+(a<2))|(this.getUint8(this.i++)|256)<<a}catch{a=256<<a}
			this.bitState = a>>2; return a&3
		}
		b4(){
			let a = this.bitState
			if(a<16){
				let x = -21936>>(a<<1)&3;
				try{a=a&7>>(3-x)|(this.getUint8(this.i++)|256)<<x}catch{a=256<<x}
			}
			this.bitState = a>>4; return a&15
		}
		u8(){ try{return this.getUint8(this.i++)}catch{return 0} }
		i8(){ try{return this.getInt8(this.i++)}catch{return 0} }
		u16(){ try{return this.getUint16((this.i+=2)-2)}catch{return 0} }
		i16(){ try{return this.getInt16((this.i+=2)-2)}catch{return 0} }
		u24(){ try{return this.getUint8(this.i)<<16|this.getUint16((this.i+=3)-2)}catch{return 0} }
		i24(){ try{return this.getInt8(this.i)<<16|this.getUint16((this.i+=3)-2)}catch{return 0} }
		u32(){ try{return this.getUint32((this.i+=4)-4)}catch{return 0} }
		i32(){ try{return this.getInt32((this.i+=4)-4)}catch{return 0} }
		u48(){ try{return this.getUint16((this.i+=6)-6)*4294967296+this.getUint32(this.i-4)}catch{return 0} }
		i48(){ try{return this.getInt16((this.i+=6)-6)*4294967296+this.getUint32(this.i-4)}catch{return 0} }
		u64(){ try{return this.getUint32((this.i+=8)-8)*4294967296+this.getUint32(this.i-4)}catch{return 0} }
		i64(){ try{return this.getInt32((this.i+=8)-8)*4294967296+this.getUint32(this.i-4)}catch{return 0} }
		bu64(){ try{return this.getBigUint64((this.i+=8)-8)}catch{return 0} }
		bi64(){ try{return this.getBigInt64((this.i+=8)-8)}catch{return 0} }
		f32(){ try{return this.getFloat32((this.i+=4)-4)}catch{return 0} }
		f64(){ try{return this.getFloat64((this.i+=8)-8)}catch{return 0} }
		bool(){ try{return this.getUint8(this.i++) != 0}catch{return 0} }
		v64(){ try{
			const n = this.getUint8(this.i++)
			if(n < 64) return n
			if(n >= 128) return (this.getUint32((this.i += 7)-8)&0x7FFFFFFF)*4294967296+this.getUint32(this.i-4)
			if(n >= 96) return this.getUint32((this.i += 3)-4)&0x1FFFFFFF
			return this.getUint8(this.i++)|n<<8&0x1FFF
		}catch{return 0} }
		bv64(){ try{
			let n = this.getUint8(this.i++)
			if(n >= 64){
				if(n >= 128) return this.getBigUint64((this.i+=7)-8)&0x7FFFFFFFFFFFFFFFn
				n = n >= 96 ? this.getUint32((this.i += 3)-4)&0x1FFFFFFF : this.getUint8(this.i++)|n<<8&0x1FFF
			}
			return BigInt(n)
		}catch{return 0} }
		v32(){ try{
			const n = this.getUint8(this.i++)
			if(n < 64) return n
			if(n >= 128) return this.getUint32((this.i += 3)-4) & 0x7FFFFFFF
			return this.getUint8(this.i++)|n<<8&0x3FFF
		}catch{return 0} }
		v16(){ try{
			const n = this.getUint8(this.i++)
			return n < 128 ? n : this.getUint8(this.i++)|n<<8&0x3FFF
		}catch{return 0} }
		/** Advance a number of bytes. Useful for padding */
		skip(n){ this.i += n }
		u8arr(len = -1){ try{
			let i = this.i
			if(len < 0){
				len = this.getUint8(i++)
				if(len >= 64){
					if(len >= 128)len = this.getUint32(i) & 0x7FFFFFFF, i += 3
					else len = this.getUint8(this.i++)|len<<8&0x3FFF
				}
			}
			this.i = i + len
			return new Uint8Array(this.buffer.slice(i+=this.byteOffset, len))
		}catch{return new Uint8Array()} }
		str(){
			let i = this.i
			let len = this.getUint8(i++)
			if(len >= 64){
				if(len >= 128)len = this.getUint32(i) & 0x7FFFFFFF, i += 3
				else len = this.getUint8(this.i++)|len<<8&0x3FFF
			}
			this.i = i + len
			return decoder.decode(new Uint8Array(this.buffer, this.byteOffset + i, len))
		}
		enum({intToStr, defaultString}){
			let n = this.getUint8(this.i++)
			if(n > 64){
				if(n >= 128) n = this.getUint32((this.i += 3)-4) & 0x7FFFFFFF
				else n = this.getUint8(this.i++)|n<<8&0x3FFF
			}
			return intToStr[n]??defaultString
		}
		/** Returns a mutable Uint8Array view of the next bytes */
		view(size=0){ return new Uint8Array(this.buffer, this.byteOffset+(this.i+=size)-size, size) }
		/** How many bytes have been read from this buffer so far */
		get read(){ return this.i }
		/** How many more bytes can be read before reaching the end of the buffer */
		get remaining(){ return this.byteLength - this.i }
		/** Whether we have reached and passed the end of the buffer. All read functions will return "null" values (i.e, 0, "", Uint8Array(0)[], false, ...) */
		get overran(){ return this.i>this.byteLength }
		/** Get a Uint8Array pointing to remaining unread data. This is a reference and not a copy. Use Uint8Array.slice() to turn it into a copy */
		toUint8Array(){ return new Uint8Array(this.buffer,this.byteOffset+this.i,this.byteLength-this.i) }
		/** Copies all the bytes that have already been read since this object's creation into a new ArrayBuffer */
		copyReadToArrayBuffer(){ return this.buffer.slice(this.byteOffset,this.byteOffset+this.i) }
		/** Copies all the bytes yet to be read into a new ArrayBuffer */
		copyRemainingToArrayBuffer(){ return this.buffer.slice(this.byteOffset+this.i,this.byteOffset+this.byteLength) }
		/** Same as new BufWriter(this.copyReadToArrayBuffer(), this.i) */
		copyToWriter(){ return new BufWriter(this.buffer.slice(this.byteOffset, this.byteOffset+this.i), this.i) }
		/** Same as new BufReader(this.copyRemainingToArrayBuffer()) */
		copy(){ return new BufReader(this.buffer.slice(this.byteOffset+this.i,this.byteOffset+this.byteLength)) }
		[Symbol.for('nodejs.util.inspect.custom')](){
			let str = `BufReader(${this.byteLength - this.i}) [ \x1b[33m`
			let {i} = this; const end = (i+50>this.byteLength?this.byteLength:i+50)
			while(i<end){
				const a = this.getUint8(i++)
				str += '0123456789abcdef'[a>>4]+'0123456789abcdef'[a&15]+' '
			}
			return str += `\x1b[m${this.byteLength>end?'... ':''}]`
		}
	},
	BufWriter: class BufWriter{
		/** Construct a new BufWriter, optionally passing the underlying ArrayBuffer and head position. Once the head surpasses the ArrayBuffer's length, it is discarded (and possibly detached) and a new ArrayBuffer is allocated and used */
		constructor(arr = new ArrayBuffer(64), head = 0){
			this.buf = new DataView(arr)
			this.buf8 = new Uint8Array(arr)
			this.i = head<=(this.cap=arr.byteLength)?head:this.cap
			this.bitState = 0
		}
		encode(t,v){return t.encode(this,v)}
		b1(n=0){
			let a=this.bitState
			if(!(a&7)){
				if(this.i >= this.cap) grow(this)
				a = this.i<<3
				this.buf8[this.i++] = 0
			}
			this.buf8[a>>>3] |= n<<(a&7); this.bitState = a+1
		}
		b2(n=0){
			let a=this.bitState,b=a&7
			if(b){
				this.buf8[a>>>3] |= n<<b
				if(b<7){this.bitState=a+2;return}
				a = b = 1
			}else a = 2
			if(this.i >= this.cap) grow(this)
			this.bitState = a|this.i<<3
			this.buf8[this.i++] = n>>b
		}
		b4(n=0){
			let a=this.bitState,b=a&7
			if(b){
				this.buf8[a>>>3] |= n<<b
				if(b<5){this.bitState=a+4;return}
				a = b-4; b = 8-b
			}else a = 4
			if(this.i >= this.cap) grow(this)
			this.bitState = a|this.i<<3
			this.buf8[this.i++] = n>>b
		}
		u8(n=0){ if(this.i >= this.cap)grow(this); this.buf8[this.i++] = n }
		i8(n=0){ if(this.i >= this.cap)grow(this); this.buf8[this.i++] = n }
		u16(n=0){ if((this.i+=2) > this.cap)grow(this); this.buf8[this.i-2] = n>>8; this.buf8[this.i-1] = n }
		i16(n=0){ if((this.i+=2) > this.cap)grow(this); this.buf8[this.i-2] = n>>8; this.buf8[this.i-1] = n }
		u24(n=0){ if((this.i+=3) > this.cap)grow(this); this.buf8[this.i-3] = n>>16; this.buf8[this.i-2] = n>>8; this.buf8[this.i-1] = n }
		i24(n=0){ if((this.i+=3) > this.cap)grow(this); this.buf8[this.i-3] = n>>16; this.buf8[this.i-2] = n>>8; this.buf8[this.i-1] = n }
		u32(n=0){ if((this.i+=4) > this.cap)grow(this); this.buf.setUint32(this.i-4, n) }
		i32(n=0){ if((this.i+=4) > this.cap)grow(this); this.buf.setInt32(this.i-4, n) }
		u48(n=0){ if((this.i+=6) > this.cap)grow(this); this.buf.setUint16(this.i-6, floor(trunc(n)/4294967296)); this.buf.setInt32(this.i-4, n|0) }
		i48(n=0){ if((this.i+=6) > this.cap)grow(this); this.buf.setInt16(this.i-6, floor(trunc(n)/4294967296)); this.buf.setInt32(this.i-4, n|0) }
		u64(n=0){ if((this.i+=8) > this.cap)grow(this); this.buf.setUint32(this.i-8, floor(trunc(n)/4294967296)); this.buf.setInt32(this.i-4, n|0) }
		i64(n=0){ if((this.i+=8) > this.cap)grow(this); this.buf.setInt32(this.i-8, floor(trunc(n)/4294967296)); this.buf.setInt32(this.i-4, n|0) }
		bu64(n=0n){ if((this.i+=8) > this.cap)grow(this); this.buf.setBigUint64(this.i-8, n) }
		bi64(n=0n){ if((this.i+=8) > this.cap)grow(this); this.buf.setBigInt64(this.i-8, n) }
		f32(n=0){ if((this.i+=4) > this.cap)grow(this); this.buf.setFloat32(this.i-4, n) }
		f64(n=0){ if((this.i+=8) > this.cap)grow(this); this.buf.setFloat64(this.i-8, n) }
		bool(n=false){ if(this.i >= this.cap)grow(this); this.buf8[this.i++] = n }
		// 1xxxxxxx (+7B)
		// 011xxxxx (+3B)
		// 010xxxxx (+1B)
		// 00xxxxxx
		v64(n=0){
			if(this.i > this.cap-8) grow(this)
			if(n > 0x3F){
				if(n > 0x1FFFFFFF) this.buf.setUint32((this.i += 8) - 8, floor(trunc(n)/4294967296) | 0x80000000), this.buf.setInt32(this.i - 4, n|0)
				else if(n > 0x1FFF) this.buf.setInt32((this.i += 4) - 4, n | 0x60000000)
				else this.buf8[this.i++] = n>>8|64, this.buf8[this.i++] = n
			}else this.buf8[this.i++] = n<0?0:n
		}
		bv64(bn=0n){
			if(this.i > this.cap-8) grow(this)
			const n = Number(bn)
			if(n > 0x3F){
				if(n > 0x1FFFFFFF) this.buf.setBigUint64((this.i += 8) - 8, bn | 0x8000000000000000n)
				else if(n > 0x1FFFn) this.buf.setInt32((this.i += 4) - 4, n | 0x60000000)
				else this.buf8[this.i++] = n>>8|64, this.buf8[this.i++] = n
			}else this.buf8[this.i++] = n<0?0:n
		}
		// 1xxxxxxx (+3B)
		// 01xxxxxx (+1B)
		// 00xxxxxx
		v32(n=0){
			if(this.i > this.cap-4) grow(this)
			if(n > 0x3F){
				if(n > 0x3FFF) this.buf.setInt32((this.i += 4) - 4, n | 0x80000000)
				else this.buf8[this.i++] = n>>8|64, this.buf8[this.i++] = n
			}else this.buf8[this.i++] = n<0?0:n
		}
		// 1xxxxxxx (+1B)
		// 0xxxxxxx
		v16(n=0){
			if(this.i > this.cap-2) grow(this)
			if(n > 0x7F) this.buf8[this.i++] = n>>8|128, this.buf8[this.i++] = n
			else this.buf8[this.i++] = n>=0?n:0
		}
		u8arr(v, n = -1){
			if(!(v instanceof Uint8Array)){
				if(v instanceof BufWriter) v = v.buf8.subarray(0, v.i)
				else{if(this.i >= this.cap) grow(this); this.buf8[this.i++] = 0;return}
			}
			if(n < 0){
				n = v.byteLength
				if(n>2147483647){if(this.i >= this.cap) grow(this); this.buf8[this.i++] = 0;return}
				if(this.i > this.cap-4-n) grow(this,n)
				if(n > 0x3FFF){
					if(n > 0x7FFFFFFF) this.buf8[this.i++] = n = 0
					else this.buf.setInt32((this.i += 4) - 4, n | 0x80000000)
				}else if(n > 0x3F) this.buf8[this.i++] = n>>8|64, this.buf8[this.i++] = n
				else this.buf8[this.i++] = n
			}else if(this.i > this.cap-n) grow(this,n)
			this.buf8.set(v, this.i); this.i += n
		}
		/** Advance a number of bytes. Useful for padding */
		skip(n=0){ if((this.i+=n) > this.cap) grow(this,n) }
		str(v=''){
			if(this.i > this.cap-4) grow(this)
			const encoded = encoder.encode(v)
			let n = encoded.length
			if(n>2147483647){if(this.i >= this.cap) grow(this); this.buf8[this.i++] = 0;return}
			if(this.i > this.cap-4-n) grow(this,n)
			if(n > 0x3FFF){
				if(n > 0x7FFFFFFF) this.buf8[this.i++] = n = 0
				else this.buf.setInt32((this.i += 4) - 4, n | 0x80000000)
			}else if(n > 0x3F) this.buf8[this.i++] = n>>8|64, this.buf8[this.i++] = n
			else this.buf8[this.i++] = n
			new Uint8Array(this.buffer).set(encoded, this.i); this.i += n
		}
		enum({strToInt, default: d}, str){
			if(this.i > this.cap-4) grow(this)
			const n = strToInt.get(str)??d
			if(n > 0x3F){
				if(n > 0x3FFF) this.buf.setInt32((this.i += 4) - 4, n | 0x80000000)
				else this.buf8[this.i++] = n>>8|64, this.buf8[this.i++] = n
			}else this.buf8[this.i++] = n<0?0:n
		}
		/** How many bytes have been written to this buffer so far */
		get written(){ return this.i }
		/** The underlying array buffer that is being modified. May be larger than this.written (this is intentional to avoid excessive reallocations). May become detached as writer grows */
		get buffer(){ return this.buf.buffer }
		// Always 0
		get byteOffset(){ return 0 }
		// Same as .written
		get byteLength(){ return this.i }
		/** View into the currently written data. May become detached as writer grows, consider using a copying method */
		toUint8Array(){ return this.buf8.subarray(0,this.i) }
		/** Reader for the currently written data. May become detached as writer grows, consider using a copying method */
		toReader(){ return new BufReader(this) }
		/** Get a copy of the written data as an ArrayBuffer */
		copyToArrayBuffer(){ return this.buf8.buffer.slice(0,this.i) }
		/** Get a copy of the written data as a second BufWriter */
		copy(){ return new BufWriter(this.buf.buffer.slice(0,this.i), this.i) }
		/** Same as new BufReader(this.copyToArrayBuffer()) */
		copyToReader(){ return new BufReader(this.buf8.buffer.slice(0,this.i)) }
		[Symbol.for('nodejs.util.inspect.custom')](){
			let {i} = this, str = `BufWriter(${i}) [ ${i>50?(i-=50,'... '):(i=0,'')}\x1b[33m`
			while(i<this.i){
				const a = this.buf8[i++]
				str += '0123456789abcdef'[a>>4]+'0123456789abcdef'[a&15]+' '
			}
			return str += `\x1b[m]`
		}
	},
	b1: encodable((a=0) => +!!a, (buf,a) => buf.b1(a), (buf,_) => buf.b1(),0),
	b2: encodable((a=0) => (typeof a=='number'?a:Number(a))&3, (buf,a) => buf.b2(a), (buf,_) => buf.b2(),0),
	b4: encodable((a=0) => (typeof a=='number'?a:Number(a))&15, (buf,a) => buf.b4(a), (buf,_) => buf.b4(),0),
	u8: encodable((a=0) => (typeof a=='number'?a:Number(a))&255, (buf,a) => buf.u8(a), (buf,_) => buf.u8(),1),
	i8: encodable((a=0) => (typeof a=='number'?a:Number(a))<<24>>24, (buf,a) => buf.i8(a), (buf,_) => buf.i8(),1),
	u16: encodable((a=0) => (typeof a=='number'?a:Number(a))&65535, (buf,a) => buf.u16(a), (buf,_) => buf.u16(),2),
	i16: encodable((a=0) => (typeof a=='number'?a:Number(a))<<16>>16, (buf,a) => buf.i16(a), (buf,_) => buf.i16(),2),
	u24: encodable((a=0) => (typeof a=='number'?a:Number(a))&16777215, (buf,a) => buf.u24(a), (buf,_) => buf.u24(),3),
	i24: encodable((a=0) => (typeof a=='number'?a:Number(a))<<8>>8, (buf,a) => buf.i24(a), (buf,_) => buf.i24(),3),
	u32: encodable((a=0) => (typeof a=='number'?a:Number(a))>>>0, (buf,a) => buf.u32(a), (buf,_) => buf.u32(),4),
	i32: encodable((a=0) => (typeof a=='number'?a:Number(a))|0, (buf,a) => buf.i32(a), (buf,_) => buf.i32(),4),
	u48: encodable((a=0) => (floor(trunc(a=(typeof a=='number'?a:Number(a)))/4294967296)&65535)*4294967296+(a>>>0), (buf,a) => buf.u48(a), (buf,_) => buf.u48(),6),
	i48: encodable((a=0) => (floor(trunc(a=(typeof a=='number'?a:Number(a)))/4294967296)<<16>>16)*4294967296+(a>>>0), (buf,a) => buf.i48(a), (buf,_) => buf.i48(),6),
	u64: encodable((a=0) => (floor(trunc(a=(typeof a=='number'?a:Number(a)))/4294967296)>>>0)*4294967296+(a>>>0), (buf,a) => buf.u64(a), (buf,_) => buf.u64(),8),
	i64: encodable((a=0) => (floor(trunc(a=(typeof a=='number'?a:Number(a)))/4294967296)|0)*4294967296+(a>>>0), (buf,a) => buf.i64(a), (buf,_) => buf.i64(),8),
	bu64: encodable((a=0n) => (typeof a=='bigint'?a:BigInt(a))&0xFFFFFFFFFFFFFFFFn, (buf,a) => buf.bu64(a), (buf,_) => buf.bu64(),8),
	bi64: encodable((a=0n) => BigInt.asIntN(64, typeof a=='bigint'?a:BigInt(a)), (buf,a) => buf.bi64(a), (buf,_) => buf.bi64(),8),
	f32: encodable((a=0) => fround(typeof a=='number'?a:Number(a)), (buf,a) => buf.f32(a), (buf,_) => buf.f32(),4),
	f64: encodable((a=0) => typeof a=='number'?a:Number(a), (buf,a) => buf.f64(a), (buf,_) => buf.f64(),8),
	v16: encodable((a=0) => (a=typeof a=='number'?a:Number(a))<0?0:a&32767, (buf,a) => buf.v16(a), (buf,_) => buf.v16(),1),
	v32: encodable((a=0) => (a=typeof a=='number'?a:Number(a))<0?0:a&2147483647, (buf,a) => buf.v32(a), (buf,_) => buf.v32(),1),
	v64: encodable((a=0) => (typeof a=='number'?a:Number(a))<0?0:a%9223372036854775808, (buf,a) => buf.v32(a), (buf,_) => buf.v32(),1),
	bv64: encodable((a=0n) => (typeof a=='bigint'?a:BigInt(a))<0n?0n:a&0x7FFFFFFFFFFFFFFFn, (buf,a) => buf.v32(a), (buf,_) => buf.v32(),1),
	u8arr: encodable(a => {try{const b = typeof a == 'string' ? encoder.encode(a) : new Uint8Array(a.buffer ? a.buffer.slice(a.byteOffset, a.byteLength) : a instanceof ArrayBuffer ? a.slice(0,2147483647) : a);return b.byteLength>2147483647?b.subarray(0,2147483647):b}catch{return new Uint8Array()}}, (buf,a) => buf.u8arr(a), (buf,_) => buf.u8arr(),1),
	str: encodable((a='') => a+'', (buf,a) => buf.str(a), (buf,_) => buf.str(),1),
	bool: encodable(a => !!a, (buf,a) => buf.bool(a), (buf,_) => buf.bool(),1),
	Struct: (obj, f) => {
		const fparams = [], f1ret = [], f2bod = [], f3bod = [], f3ret = []
		let i = 0, sz = 0
		const os = {}
		for(const k in obj){
			let n = /^[a-zA-Z$_][a-zA-Z0-9$_]*$/.test(k) ? k : JSON.stringify(k)
			fparams.push(n+':a'+i)
			f1ret.push(n+':this.a'+i+'(a'+i+')')
			f2bod.push('this.a'+i+'.encode(b,a'+i+')')
			f3ret.push(''+n+':this.a'+i+'.decode(b)')
			n = (n.length==k.length?'v.'+n:'v['+n+']')
			f3bod.push(n+'=this.a'+i+'.decode(b,'+n+')')
			sz += (os['a'+i++] = obj[k]).size??0
		}
		const f1bod = `return{${f1ret}}`
		f ??= new Function(`{${fparams}}={}`, f1bod).bind(os)
		f.encode = new Function(`b,{${fparams}}={}`, f2bod.join(';')).bind(os)
		f.decode = new Function(`b,v`, `if(!v)return {${f3ret}};${f3bod.join(';')};return v`).bind(os)
		f.size = sz
		f.of = new Function(Object.keys(os), f1bod).bind(os)
		return f
	},
	Arr: (type, len = -1) => {
		(len=floor(len))>=0||(len=-1)
		const f=encodable(a => {
		const arr = []
		try{for(const el of a) arr.push(type(el))}catch{}
		if(len >= 0){
			if(arr.length > len) arr.length = len
			else while(arr.length < len) arr.push(type())
		}else if(arr.length > 2147483647) arr.length = 2147483647
		return arr
	}, (buf, v=[]) => {
		const l = len < 0 ? (buf.v32(v.length),v.length) : len
		for(let i = 0; i < l; i++) type.encode(buf, v[i])
	}, (buf, v) => {
		const l = len < 0 ? buf.v32() : len
		if(v) for(let i = 0; i < l; i++) v[i] = type.decode(buf, v[i])
		else{ v = []; for(let i = l; --i>=0;) v.push(type.decode(buf)) }
		return v
	}, len<0?1:(type.size??0)*len);f.of=(...a)=>f(a);return f
	},
	Optional: t => encodable(a => a==null?null:t(a), (buf,v) => {
		if(v==null) buf.u8(0)
		else buf.u8(1),t.encode(buf,v)
	}, (buf, v) => buf.u8() ? t.decode(buf, v) : null, 1),
	Enum: (v=[], def=undefined) => {
		const map = new Map, rmap = []
		if(Array.isArray(v)) for(let i=0;i<v.length;i++) map.set(v[i]+'',i), rmap[i] = v[i]
		else for(const k in v){const j=v[k]&2147483647;map.set(k, j);rmap[j]=k}
		if(typeof def!='string') def=map.keys().next().value??''
		let none = -1; while(rmap[++none]);
		const f = encodable(a => typeof a=='string'?map.get(a)??none:Number(a)&2147483647, (buf,a) => buf.v32(typeof a=='string'?map.get(a)??none:a), (buf, _) => rmap[buf.v32()]??def, 1)
		f.strToInt = map; f.intToStr = rmap; f.default = none; f.defaultString = def
		return f
	},
	Padding: (sz=0) => encodable(() => undefined, (buf,_) => buf.skip(sz), (buf, _) => (buf.i+=sz,undefined), sz)
}
globalThis.Nanobuf.u8arr.len = len => ((len=floor(len))>=0||(len=0), encodable(a => a instanceof ArrayBuffer ? new Uint8Array(a.byteLength >= len ? a.slice(0, len) : len) : new Uint8Array(a?.length === len ? a : len), (buf,a) => buf.u8arr(a, len), (buf,_) => buf.u8arr(len),len))

globalThis.loader = ({url})=>{
	url = url.slice(0,url.lastIndexOf('/')+1)
	return (...src) => {
		if(src[0].raw){
			const a = [src[0][0]]
			for(let i = 1; i <= src.length; i++) a.push(src[i], src[0][i])
			const s = a.join('')
			return s[0]=='/'?s:url+s
		}
		return src.length==1?src[0][0]=='/'?src[0]:url+src[0]:src.map(src=>src[0]=='/'?src:url+src)
	}
}
Array.map ??= (len=0, fn) => {
	const a = []
	for(let i = 0; i < len; i++) a.push(fn(i))
	return a
}
Gamma.utils = $ => {
	Object.assign($, Nanobuf)
	$.screenshot = (t='image/png',q) => new Promise(r => requestAnimationFrame(() => $.canvas.toBlob(r, t, q)))
}}