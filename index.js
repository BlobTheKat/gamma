const font = await Font.chlumsky('ankacoder/index.json', 'ankacoder/atlas.png')
const font1 = await Font.chlumsky('marker/index.json', 'marker/atlas.png')

const p = RichText()
p.font = font
p.scale = 2
p.add('T')
p.scale = 1
p.add('he ')
p.skew = .2
p.add('quick ')
p.skew = 0
p.values = [.1]
p.add('brown ')
p.values = null
p.add('fox ')
p.yOffset = .5
p.add('jumps ')
p.yOffset = 0
{const p2 = p.sub()
	p2.font = font1
	p2.values = [0, vec4(1, 0.8, 0.2, 1)]
	p2.add('over')
}
p.add(' the ')
{const p2 = p.sub()
	p2.letterSpacingBias = .1
	p2.stretch = 1.25
	p2.add('lazy')
}
// Thin text with negative weight
p.values = [-.1]
p.add(' dog')

const p2 = p.slice()
p.curveBy(0.111)

Shader.CIRCLE = Shader(`void main(){
	color = length(uv-.5)<.5 ? arg0() : vec4(0);
}`, [COLOR])
let zoom = 50, w = 20, wid = 20
cursor.x = cursor.y = .5
let cam = globalThis.cam = {x: 0, y: 0, z: 50}
const punchBlend = Blend(ONE, REVERSE_SUBTRACT, ONE)
render = () => {
	if(keys.has(KEY.SHIFT)) w += wheel.y*.01
	else zoom *= .999**wheel.y
	const d = .002**dt
	cam.x = (cursor.x-.5)*-64*(1-d)+cam.x*d; cam.y = (cursor.y-.5)*-36*(1-d)+cam.y*d
	wid = w*(1-d)+wid*d
	cam.z = cam.z**d*zoom**(1-d)
	wheel.y=0

	ctx.scale(1/ctx.width,1/ctx.height)
	ctx.translate(ctx.width*.5, ctx.height*.5)
	ctx.scale(cam.z)
	ctx.translate(-cam.x,-cam.y)
	
	const {x,y} = ctx.from(0, 0)
	ctx.drawRect(x, 0, ctx.fromDelta(1, 0).x, y, vec4(.2,.2,.2,.4))
	{	const c2 = ctx.sub()
		c2.blend = punchBlend
		c2.scale(.5)
		c2.translate(-20, -.5-font.ascend)
		font.draw(c2, 'Hint: SHIFT+wheel to break text')
	}
	{	const c2 = ctx.sub()
		c2.blend = Blend.BEHIND
		p.draw(c2)
	}
	{	const c2 = ctx.sub()
		c2.translate(7, 0)
		c2.blend = Blend.BEHIND
		// It's usually a good idea to cache result
		// TODO: cache `lines` if `wid` doesn't change
		const lines = p2.break(wid)
		for(const l of lines){
			l.draw(c2.sub())
			c2.translate(0, -1.4)
		}
		c2.drawRect(wid, 1.4, .1, lines.length*1.4 - .9, vec4(1,0,0,1))
	}
}