const i = TextField()
i.setFocus()
i.value = 'Lorem'
console.log('temp1')
console.log(globalThis.temp1 = i)
const font = await Font.chlumsky('marker/index.json', 'marker/atlas.png')

render = () => {
	ctx.reset(pixelRatio/ctx.width, 0, 0, pixelRatio/ctx.height, .5, .5)
	ctx.scale(50)

	const l = font.draw(ctx, i.value.slice(0, i.sel0))
	ctx.shader = null
	ctx.drawRect(0, font.ascend-1, .05, 1, vec4(t%1<.5))
	font.draw(ctx, i.value.slice(i.sel0), l, _, _, _)
}