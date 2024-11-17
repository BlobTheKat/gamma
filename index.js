const i = TextField()
i.focus = true
globalThis.temp1 = i
const font = await Font.chlumsky('cursive/index.json', 'cursive/atlas.png')

i.simpleTransformer(font, 'Write some text...')

let cx = 0, cxi = 0, zoom = 50, zoomi = 50
render = () => {
	cursorType = 'default'
	ctx.reset(pixelRatio/ctx.width, 0, 0, pixelRatio/ctx.height, .5, .5)
	ctx.scale(zoomi)
	zoom *= .995**wheel.y; wheel.y = 0
	zoomi *= (zoom/zoomi)**(dt*10)
	cxi += (cx-cxi)*(dt*5)
	ctx.translate(-cxi,0)
	if(!i.isSelecting) cx = (i.sel0width + i.sel1width) * .5
	i.consumeInputs()
	i.draw(ctx)
}