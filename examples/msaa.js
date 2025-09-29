let ctx1 = null, ctx2 = null
function drawSquare(c, w, h, msaa){
	if(!c || c.width !== w || c.height !== h){
		if(msaa>1) c = DrawableMSAA(w, h, Formats.RGBA)
		else c.texture = 
	}else c.clear()
	const w = c.width/c.height * 10
	c.reset(1/w, 0, 0, .1, .5, .5)
	c.rotate(t*.25)
	c.scale(sin(t)*.2+1)
	c.drawRect(-2, -2, 4, 4, vec4(1))
	return c
}

render = () => {
	if(t%2<1){
		ctx2 = drawSquare(ctx2)
		ctx.paste(ctx2)
	}else drawSquare(ctx)
}