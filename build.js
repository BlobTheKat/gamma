import { minify } from 'terser'
import fs, {promises as fsa} from 'fs'

const renames = {
	__proto__: null,
	gl: '_',
	defaultShape: '$d',
	defaults: '$D',
	uniformDefaults: '$U',
	setv: '$S',
	sh: '$s',
	shp: '$p',
	program: '$P',
	vao: '$V',
	grow: '$G',
	shuniBind: '$x',
	boundUsed: '$X',
	uniLocs: '$L',
	switchShader: '$l',
	setShp: '$h',
	iarr: '$I',
	arr: '$i',
	img: '$m'
}
/** @type { {[x: string]: import('terser').MinifyOptions} } */
const tersers = {
	__proto__: null,
	'gamma.js': {
		mangle: {
			eval: true,
			reserved: ['$', 'draw', ...'ixyzwhlabcdef', ...Object.keys(renames), ...Object.values(renames)],
			properties: { regex: /^_/ }
		}
	}
}, defaultTerser = {}

renames._shp = 'S'

const glConstants = {
	TEXTURE_2D_ARRAY: 35866,
	ARRAY_BUFFER: 34962,
	UNPACK_FLIP_Y_WEBGL: 37440,
	UNPACK_PREMULTIPLY_ALPHA_WEBGL: 37441,
	DEPTH_TEST: 2929,
	BLEND: 3042,
	UNPACK_ALIGNMENT: 3317,
	PACK_ALIGNMENT: 3333,
	PIXEL_UNPACK_BUFFER: 35052,
	MAX_VERTEX_ATTRIBS: 34921,
	READ_FRAMEBUFFER: 36008,
	COLOR_ATTACHMENT0: 36064,
	RENDERBUFFER: 36161,
	DRAW_FRAMEBUFFER: 36009,
	COLOR_BUFFER_BIT: 16384,
	NEAREST: 9728,
	STREAM_COPY: 35042,
	RED: 6403,
	RG: 33319,
	RGB: 6407,
	RGBA: 6408,
	UNSIGNED_BYTE: 5121,
	FLOAT: 5126,
	UNSIGNED_INT: 5125,
	UNSIGNED_INT_10F_11F_11F_REV: 35899,
	UNSIGNED_INT_2_10_10_10_REV: 33640,
	UNSIGNED_INT_5_9_9_9_REV: 35902,
	PIXEL_PACK_BUFFER: 35051,
	STREAM_READ: 35041,
	TEXTURE0: 33984,
	TEXTURE_MAG_FILTER: 10240,
	TEXTURE_MIN_FILTER: 10241,
	TEXTURE_WRAP_S: 10242,
	TEXTURE_WRAP_T: 10243,
	TEXTURE_MIN_LOD: 33082,
	TEXTURE_MAX_LOD: 33083,
	MAX_COLOR_ATTACHMENTS: 36063,
	MAX_TEXTURE_SIZE: 3379,
	MAX_ARRAY_TEXTURE_LAYERS: 35071,
	MAX_SAMPLES: 36183,
	RENDERBUFFER_SAMPLES: 36011,
	HALF_FLOAT: 5131,
	STENCIL_ATTACHMENT: 36128,
	STENCIL_INDEX8: 36168,
	STENCIL_TEST: 2960,
	NEVER: 512,
	NOTEQUAL: 517,
	EQUAL: 514,
	ALWAYS: 519,
	INVERT: 5386,
	REPLACE: 7681,
	ZERO: 0,
	KEEP: 7680,
	SAMPLE_ALPHA_TO_COVERAGE: 32926,
	TRIANGLE_STRIP: 5
}
const unknownConstants = new Set()

const postprocessors = {
	__proto__: null,
	'gamma.js': code =>
		code.replace(/gl\.([A-Z]\w*)/g, (str, name) => glConstants[name] ?? (unknownConstants.size != unknownConstants.add(name).size && console.warn('Unminified GL constant: gl.'+name), str))
		.replace(/(?<![\w$]|\$\.)\w\w+(?![\w$])/g, v => renames[v] ?? v)
}

const pr = []
let allDefs = '', allDefsGlobal = ''
for(const src of fs.readdirSync('docs')){
	if(src.startsWith('monolith')){
		pr.push(fsa.unlink('docs/'+src).catch(_ => null))
		continue
	}
	if(!src.endsWith('-global.d.ts')) continue
	const name = src.slice(0, -12)
	pr.push(fsa.readFile('docs/'+src).then(code => {
		code = code.toString()
		allDefs += `export type * from "./${name}.d.ts"\n`
		allDefsGlobal += `export type * from './${name}.d.ts'\nexport type * from './${name}-global.d.ts'\n`
		if(name == 'gamma'){
			return fsa.readFile('docs/_gamma.d.ts').then(head => {
				head = head.toString()
				code = head.slice(0, head.lastIndexOf('\n')+1) + code + '\n}}'
				return fsa.writeFile('docs/' + name + '.d.ts', code)
			})
		}
		code = `/// <reference path="./gamma.d.ts" />
export {}
declare global{
	namespace GammaInstance{ type ${name} = typeof GammaInstance.${name}; }
	namespace Gamma{
		function ${name}(): GammaInstance.${name}
		function ${name}(o: object): asserts o is GammaInstance.${name}
	}
	namespace GammaInstance.${name}{
${code.split('\n').slice(4).join('\n')}
}`
		return fsa.writeFile('docs/' + name + '.d.ts', code)
	}))
}
for(const p of pr) await p
pr.length = 0
fs.writeFileSync('docs/monolith.d.ts', allDefs.trimEnd())
fs.writeFileSync('docs/monolith-global.d.ts', allDefsGlobal.trimEnd())
let all = ''
for(const src of fs.readdirSync('min')) pr.push(fsa.unlink('min/'+src).catch(_=>null))
for(const p of pr) await p
pr.length = 0
for(const src of fs.readdirSync('src')){
	if(!src.endsWith('.js')) continue
	pr.push(fsa.readFile('src/'+src)
		.then(code => minify(code+'', tersers[src] ?? defaultTerser))
		.then(res => {
			let {code} = res
			const fn = postprocessors[src] ?? null
			if(fn) code = fn(code)
			all += code
			return fsa.writeFile('min/'+src.slice(0, -3) + '.min.js', code)
		}))
}
for(const p of pr) await p
pr.length = 0
fs.writeFileSync('min/monolith.min.js', all)