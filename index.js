const locus = await Font.chlumsky('locus/index.json', 'locus/atlas.png')

const p = RichText()
p.font = locus
p.height = 2
p.add('Hello, World!')
p.height = 1
p.values(.1, vec4(1,1,0,0))
p.add(' bold')
p.skew = .2
p.values(0, vec4(1,1,0,0))
p.add(' italic')

p.trim()
p.font = locus
p.height = .5
p.add('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"$%^&*()-_=+[]{};:\'@#~\\|,<.>/?`\0')

let zoom = 50
cursor.x = cursor.y = .5
render = () => {
	zoom *= .999**wheel.y;wheel.y=0
	
	ctx.scale(1/ctx.width,1/ctx.height)
	ctx.translate(ctx.width*.5, ctx.height*.5)
	ctx.scale(zoom)
	ctx.translate((cursor.x-.5)*ctx.width*.02,(cursor.y-.5)*ctx.height*.02)
	ctx.translate(-p.width*.5,0)
	p.draw(ctx.sub())
	ctx.blend = Blend(ONE, SUBTRACT, ONE)
	const {x,y} = ctx.from(0, 0)
	ctx.drawRect(x, 0, ctx.fromDelta(1, 0).x, y, vec4(1))
}