const locus = Font.bmfont('locus/index.json')
const locus1 = await Font.chlumsky('locus1/index.json', 'locus1/atlas.png')

const t = RichText()
t.font = locus1
t.height = 2
t.add('Hello, World!')
t.height = 1
t.values(.05, vec4(1,1,0,0))
t.add(' bold')
t.skew = .2
t.stretch = 2
t.values(0, vec4(1,1,0,0))
t.add(' italic')

let zoom = 50
render = () => {
	zoom *= .999**wheel.y;wheel.y=0
	
	ctx.scale(1/ctx.width,1/ctx.height)
	ctx.translate(ctx.width*.5, ctx.height*.5)
	ctx.scale(zoom)
	ctx.translate((cursor.x-.5)*ctx.width*.02,(cursor.y-.5)*ctx.height*.02)
	ctx.translate(-t.width*.5,0)
	t.draw(ctx.sub())
	ctx.blend = Blend(ONE, SUBTRACT, ONE)
	const {x,y} = ctx.from(0, 0)
	ctx.drawRect(x, 0, ctx.fromDelta(1, 0).x, y, vec4(1))
}