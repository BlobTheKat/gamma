const font = await Font.chlumsky('ankacoder/index.json', 'ankacoder/atlas.png')
const font1 = await Font.chlumsky('marker/index.json', 'marker/atlas.png')

const p = RichText()
p.font = font
p.height = 2
p.add('Hello, World!')
p.height = 1
p.values(.1, vec4(1,1,0,0))
p.add(' bold')
p.skew = .2
p.values(0, vec4(1,1,0,0))
p.add(' italic')

p.trim()
p.font = font
p.height = .5
p.add('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"$%^&*()-_=+[]{};:\'@#~\\|,<.>/?`\0')

p.trim()
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
p.yOffset = .25
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


let zoom = 50
cursor.x = cursor.y = .5
render = () => {
	zoom *= .999**wheel.y;wheel.y=0
	
	ctx.scale(1/ctx.width,1/ctx.height)
	ctx.translate(ctx.width*.5, ctx.height*.5)
	ctx.scale(zoom)
	ctx.translate((cursor.x-.5)*32,(cursor.y-.5)*18)
	ctx.translate(-p.width*.5,0)
	p.draw(ctx.sub())
	const {x,y} = ctx.from(0, 0)
	ctx.drawRect(x, 0, ctx.fromDelta(1, 0).x, y, vec4(.2,.2,.2,.4))
}