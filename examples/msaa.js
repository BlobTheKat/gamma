/// <reference path="../docs/monolith-global.d.ts" />

function drawSquare(c){
	c.clear()
	const wid = c.width/c.height * 10
	c.reset(1/wid, 0, 0, .1, .5, .5)
	c.rotate(t*.25)
	c.scale(sin(t)*.2+1)
	c.drawRect(-2, -2, 4, 4, vec4(1))
	return c
}

const d = Drawable()
let tex = null, msaa = null

render = () => {
	const w = ctx.width >> 4, h = ctx.height >> 4
	const useMSAA = t%2<1
	if(!tex || tex.width != w || tex.height != h){
		tex?.delete()
		tex = Texture(w, h, 1, Formats.RGBA)
	}
	if(useMSAA && (!msaa || msaa.width != w || msaa.height != h)){
		msaa?.delete()
		msaa = Texture.Surface(w, h, 999, Formats.RGBA)
	}
	d.setTarget(0, useMSAA ? msaa : tex)
	drawSquare(d)
	if(useMSAA) tex.paste(msaa)
	ctx.draw(tex)
}