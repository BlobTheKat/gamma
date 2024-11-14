/*const i = TextField()

render = () => {
	ctx.reset(1/ctx.width, 0, 0, 1/ctx.height, .5, .5)
	
}*/
const img = Img('./creo5.png', REPEAT_MIRRORED)
render = () => {
	ctx.drawRect(0, 0, 1, 1, img)
}