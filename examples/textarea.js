const font = await Font.chlumsky('fonts/cursive/')
font.ascend = .8 // default ascend value sucks

const input = TextField(true)
input.simpleTransformer(font, 'Write some text...')
input.maxWidth = 10
input.focus = true
input.allowTabs = true
const scr = Scrollable(input, 10, -3)
input.enterCb = () => console.log(input.value)

Shader.AA_CIRCLE ??= Shader(`
void main(){
	float dist = 0.5 - length(uv - 0.5), alpha = clamp(dist/fwidth(dist) + 0.5, 0.0, 1.0);
	color = arg0() * alpha;
}
`, COLOR, vec4.one)

let cx = 0, cxi = 0, zoom = 50, zoomi = 50
render = () => {
	ctx.reset(pixelRatio/ctx.width, 0, 0, pixelRatio/ctx.height, .5, .5)
	ctx.scale(zoomi)
	if(keys.has(KEY.CTRL)) zoom *= .995**wheel.y, wheel.y = 0
	zoomi *= (zoom/zoomi)**(dt*10)
	cxi += (cx-cxi)*(dt*5)
	input.multiline ? ctx.translate(0,cxi) : ctx.translate(-cxi,0)
	if(!input.isSelecting) cx = 0//(input.sel0pos + input.sel1pos) * (input.multiline ? .5*input.lineHeight : .5) + scr.y
	const c = ctx.from(cursor)
	//if(input.isSelecting || c.x > -.5 && c.x < input.width + .5 && c.y > -.5 && c.y < 1)
		scr.consumeInputs(ctx, c)
	scr.draw(ctx)
	ctx.shader = Shader.AA_CIRCLE
	// Epic insane invert blend I can't believe I didn't think of (actually, I did, https://github.com/open-mc/client/blob/c7ada127502698363a75a0f51a728739d1c50746/core/pointer.js#L132)
	// OpenGL may not have a perfect difference blend but this is near perfect
	// When src = 0, it simplifies to dst
	// When src = .5, it simplifies to .5
	// When src = 1, it simplifies to 1 - dst
	ctx.blend = Blend(ONE_MINUS_DST, ADD, ONE_MINUS_SRC)
	const l = +keys.has(MOUSE.LEFT), r = +keys.has(MOUSE.RIGHT)
	if(l+r){
		const col = vec4(l^r,l,l,0)
		ctx.drawRect(c.x-.5,c.y-.5,1,1,col)
		ctx.drawRect(c.x-.42,c.y-.42,.84,.84,col)
	}
}