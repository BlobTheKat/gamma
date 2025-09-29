let ctx1 = null, ctx2 = null
function drawSquare(c){
	c.clear()
	const wid = c.width/c.height * 10
	c.reset(1/wid, 0, 0, .1, .5, .5)
	c.rotate(t*.25)
	c.scale(sin(t)*.2+1)
	c.drawRect(-2, -2, 4, 4, vec4(1))
	return c
}

render = () => {
	const w = ctx.width >> 4, h = ctx.height >> 4
	if(!ctx2) ctx2 = Drawable(Texture(w, h, 1, Formats.RGBA))
	else if(ctx2.width != w || ctx2.height != h){
		ctx2.texture.delete()
		ctx2.texture = Texture(w, h, 1, Formats.RGBA)
	}
	if(t%2 < 1){
		if(!ctx1 || ctx1.width != w || ctx1.height != h) ctx1 = DrawableMSAA(w, h, Formats.RGBA)
		drawSquare(ctx1)
		ctx2.paste(ctx1)
	}else drawSquare(ctx2)
	ctx.draw(ctx2.texture)
}