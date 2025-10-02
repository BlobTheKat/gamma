/// <reference path="../docs/monolith-global.d.ts" />

const font = await Font.chlumsky('fonts/ankacoder/')
// One tab = 3 spaces. Cry about it
font.set(0x09, font.getWidth(0x20) * 3)
const input = TextField(true)
//input.simpleTransformer(font, 'Write some text...')
const styles = new Map()
	.set(/(let|const|var|if|else|while|for|do|try|catch|finally|throw|return|function|class|extends|static|with|switch|case|default|in|instanceof|new|delete|typeof|async|await)(?!\w)/y, vec4(.95,.3,.05))
	.set(/(null|undefined|true|false|of)(?!\w)/y, vec4(.5,.05,.95))
	.set(/NaN|-?Infinity|0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|(\d+(\.\d*)?|\.\d+)([eE]\d+)?/y, vec4(.3,.95,.05))
	.set(/\w+/y, vec4(.9,.9,.9))
	.set(/\/\/[^\n]*(\n|$)|\/\*([^*]|\*[^\/])*(\*\/|$)/y, vec4(.4))
	.set(/`(?:[^\\`]|\\[^])*(?:`|$)|(["'])([^"'\\\n]|\\[^]|(?!\1).)*(\1|(?=\n))/y, vec4(.05, .3, .95))
	.set(/(?<![\)\]\w]\s*)\/([^\\\/]|\\.)+\/[gimsuyvdGIMSUYVD]*/y, vec4(.7, .05, .7))
input.transformer = txt => {
	console.log(input.selDir)
	const r = RichText(font)
	if(!txt){
		r.setValues(0, [vec4(.4)])
		r.index = false
		r.skew = .2
		r.add(`Let's get writing!`)
		return r
	}
	let last = 0, i = 0
	w: while(i < txt.length){
		for(const {0:reg,1:col} of styles){
			reg.lastIndex = i
			if(!reg.test(txt)) continue
			const len = reg.lastIndex - i
			if(i > last){
				r.setValues(0, [vec4.one])
				r.add(txt.slice(last, i))
			}
			r.setValues(0, [col])
			r.add(txt.slice(i, i += len))
			last = i
			continue w
		}
		i++
	}
	if(i > last){
		r.setValues(0, [vec4.one])
		r.add(txt.slice(last, i))
	}
	return r
}
input.maxWidth = 40
input.focus = true
input.allowTabs = true
const scr = Scrollable(input, 40, -20)


Shader.AA_CIRCLE ??= Shader(`
void main(){
	float dist = 0.5 - length(uv - 0.5), alpha = clamp(dist/fwidth(dist) + 0.5, 0.0, 1.0);
	color = arg0() * alpha;
}
`, COLOR, vec4.one)

let cx = 0, cxi = 0, zoom = NaN, zoomi = 0
render = () => {
	const w = ctx.width, h = ctx.height
	if(zoom != zoom) zoom = zoomi = w/42
	ctx.reset(1/w, 0, 0, 1/h, .5, .5)
	ctx.scale(zoomi)
	if(keys.has(KEY.CTRL)) zoom *= 1.005**rawWheel.y, rawWheel.y = 0
	zoomi *= (zoom/zoomi)**(dt*10)
	cxi += (cx-cxi)*(dt*5)
	if(input.multiline)
		ctx.translate(input.maxWidth*-.5, cxi)
	else
		ctx.translate(-cxi,0)
	if(!input.isSelecting)
		cx = (input.sel0pos + input.sel1pos)*.5 * (input.multiline ? input.lineHeight : 1) + scr.y
	const c = ctx.from(cursor)
	//if(input.isSelecting || c.x > -.5 && c.x < input.width + .5 && c.y > -.5 && c.y < 1)
	input.consumeInputs(ctx, c)
	input.draw(ctx.sub())
	ctx.shader = Shader.AA_CIRCLE

	ctx.blend = Blend.INVERT
	const l = +keys.has(MOUSE.LEFT), r = +keys.has(MOUSE.RIGHT)
	if(l+r){
		const col = vec4(l^r,l,l,1)
		ctx.drawRect(c.x-.5,c.y-.5,1,1,col)
		ctx.drawRect(c.x-.42,c.y-.42,.84,.84,col)
	}
}