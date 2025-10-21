const cat = Texture.from('./examples/catpheus.png')

render = () => {
	const {width, height} = ctx
	ctx.reset(.1*height/width, 0, 0, .1, .5, .5)
	ctx.transform(HALF_SQRT3, .5, -HALF_SQRT3, .5)
	ctx.drawRect(-1, -1, 2, 2, cat)
}