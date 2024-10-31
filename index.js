const locus = Font('locus-msdf/index.json')

const t = RichText()
t.font = locus
t.height = 2
t.add('Hello, World!')
t.skew = .2
t.height = 4
t.add(' italic text')

let zoom = 50
render = () => {
	zoom *= .999**wheel.y;wheel.y=0
	
	ctx.scale(1/ctx.width,1/ctx.height)
	ctx.translate(ctx.width*.5, ctx.height*.5)
	ctx.scale(zoom)
	ctx.translate((cursor.x-.5)*ctx.width*.02,(cursor.y-.5)*ctx.height*.02)
	ctx.translate(-t.width*.5,0)
	t.draw(ctx)
}