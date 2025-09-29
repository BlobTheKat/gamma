devicePixelRatio /= 16

const ctx2 = DrawableMSAA(ctx.width, ctx.height, Formats.RGBA, 4, true)

function drawSquare(ctx){
	const w = ctx.width/ctx.height * 10
	ctx.reset(1/w, 0, 0, .1, .5, .5)
	ctx.rotate(t*.25)
	ctx.drawRect(-2, -2, 4, 4, vec4(1))
}

render = () => {
	drawSquare(ctx2)
}