const font = await Font.chlumsky('ankacoder/index.json', 'ankacoder/atlas.png')
const font1 = await Font.chlumsky('marker/index.json', 'marker/atlas.png')

const p = RichText()
p.font = font
p.height = 2
p.add('T')
p.height = 1
p.add('he ')
p.skew = .2
p.add('quick ')
p.skew = 0
p.values(.1)
p.add('brown ')
p.values()
p.add('fox ')
p.yOffset = .5
p.add('jumps ')
p.yOffset = 0
{const p2 = p.sub()
	p2.font = font1
	p2.values(0, vec4(1, 0.8, 0.2, 1))
	p2.add('over')
}
p.add(' the ')
{const p2 = p.sub()
	p2.letterSpacingBias = .1
	p2.stretch = 1.25
	p2.add('lazy')
}
// Thin text with negative weight
p.values(-.1)
p.add(' dog')

Shader.CIRCLE = Shader(`void main(){
	color = length(uv-.5)<.5 ? arg0() : vec4(0);
}`, [COLOR])
let zoom = 50, c = 0, curve = 0
cursor.x = cursor.y = .5
let cam = globalThis.cam = {x: 0, y: 0, z: 50}
const punchBlend = Blend(ONE, REVERSE_SUBTRACT, ONE)
render = () => {
	if(keys.has(KEY.SHIFT)) c += wheel.y
	else zoom *= .999**wheel.y
	const d = .002**dt
	cam.x = (cursor.x-.5)*-64*(1-d)+cam.x*d; cam.y = (cursor.y-.5)*-36*(1-d)+cam.y*d
	curve = c*(1-d)+curve*d
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
		c2.translate(0, -.5-font.ascend)
		const w = font.measure('Hint: SHIFT+wheel to curve text')
		const RAD = 10*t+10
		// theta = arc/r
		c2.translate(0, -RAD)
		c2.rotate(-.5*w/RAD)
		c2.translate(0, RAD)
		font.draw(c2, 'Hint: SHIFT+wheel to curve text', -RAD)
	}
	{	const c2 = ctx.sub()
		c2.blend = Blend.BEHIND
		const RAD = -3e4/curve
		p.draw(c2, RAD)
		font.draw(c2, ', ')
		p.draw(c2, -RAD)
	}
}