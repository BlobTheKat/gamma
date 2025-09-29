/// <reference path="../docs/monolith-global.d.ts" />

title = 'Snake game'

const src = loader(import.meta)

const bg = await Img(src`./mountains.jpeg`)

Shader.AA_CIRCLE ??= Shader(`
void main(){
	float dist = 0.5 - length(uv - 0.5);

	// Make [0, 1] the range covered by one pixel
	float alpha = clamp(dist/fwidth(dist) + 0.5, 0.0, 1.0);

	color = arg0() * alpha;
}
`, COLOR)

const ubuntu = await Font.chlumsky('fonts/ubuntu/')

const circles = []
let fade = .98

const cam = {
	x: 0, y: 0, z: 1
}

class Tooltip{
	alpha = Infinity
	constructor(txt, font = ubuntu){
		this.txt = txt
		this.font = font
		this.w2 = font.measure(txt) * .5
	}
	hide(){ this.alpha = min(this.alpha, 1) }
	draw(ctx){
		if(this.alpha <= 0) return
		this.alpha -= dt*.5
		const alpha = min(this.alpha, 1)
		let lsb = 0
		if(alpha < 1){
			lsb = (1-alpha) * .1
			this.w2 = this.font.measure(this.txt, lsb) * .5
		}
		ctx.translate(-this.w2, 0)
		ctx.shader = Shader.MSDF
		this.font.draw(ctx, this.txt, [vec4(alpha*.5)], 0, TEXT_AA, lsb)
	}
}

const food = new Set()

food.add(vec2(0, 200))

function eat(){
	eatTooltip.hide()
	circles.push(vec2())
	fade = .125 ** (1/(circles.length+3))
	const targetFood = floor(sqrt(circles.length))
	while(food.size < targetFood){
		const th = random()*PI2, r = random() * targetFood * 500
		food.add(vec2(sin(th)*r,cos(th)*r))
	}
}

const zoomTooltip = new Tooltip('Use mouse wheel to zoom')
const panTooltip = new Tooltip('Click and drag to explore around')
const eatTooltip = new Tooltip('Eat food to grow')

let elasticWheel = 0

const colors = Array.map(8, i => (i *= PI2/8, vec4(cos(i)*.5+.5,cos(i+PI2/3)*.5+.5,cos(i+PI2*2/3)*.5+.5,1)))

function checkFood(f, pos, radius){
	if(hypot(f.x-pos.x, f.y-pos.y) < radius+10){
		food.delete(f)
		eat()
	}
}

onKey(MOUSE.LEFT, () => pointerLock = true)

let head = vec2()
render = () => {
	const w = ctx.width, h = ctx.height
	ctx.reset(1/w, 0, 0, 1/h, .5, .5)
	// Let's implement cover fill
	// We know:
	// - Image is centered
	//   - Image scale is same X/Y (no stretch/squish)
	//   - Current transform is well-scaled and centered at (0,0)
	// We want to know:
	//   - What scale to draw the bg at

	// Max ensures we fill, min would be fit
	const scale = max(w / bg.width, h / bg.height)
	ctx.drawRect(-.5 * bg.width * scale, -.5 * bg.height * scale, bg.width * scale, bg.height * scale, bg, vec4(.35))
	elasticWheel += rawWheel.y
	if(abs(elasticWheel) > .01){
		cam.z *= .995**(elasticWheel*dt)
		elasticWheel *= .05**dt
		zoomTooltip.hide()
	}else elasticWheel = 0
	ctx.scale(1/cam.z)
	if(keys.has(MOUSE.LEFT)){
		const mov = ctx.fromDelta(cursorDelta)
		cam.x -= mov.x; cam.y -= mov.y
		panTooltip.hide()
	}
	ctx.translate(-cam.x, -cam.y)
	cursorType = 'none'
	const inflate = sqrt(cam.z)
	{
		const ct2 = ctx.sub()
		ct2.scale(50)
		ct2.translate(0, -1)
		zoomTooltip.draw(ct2.sub())
		ct2.translate(0, -1)
		panTooltip.draw(ct2.sub())
		ct2.translate(0, -1)
		eatTooltip.draw(ct2.sub())
		const scoreLabel = 'Score: ' + circles.length
		ct2.translate(0, 3)
		ct2.scale(inflate)
		ct2.translate(-.5 * ubuntu.measure(scoreLabel), 0)
		ct2.shader = Shader.MSDF
		ubuntu.draw(ct2, scoreLabel)
	}

	ctx.shader = Shader.AA_CIRCLE

	head = pointerLock ? keys.has(MOUSE.LEFT) ? head : vec2.add(head, ctx.fromDelta(cursorDelta)) : ctx.from(cursor)
	let {x, y} = head
	if(pointerLock){
		const wq = w*.333*cam.z
		if(x+wq<cam.x)
			cam.x += (x+wq-cam.x)*dt*2
		if(x-wq>cam.x)
			cam.x += (x-wq-cam.x)*dt*2
		const hq = w*.333*cam.z
		if(y+hq<cam.y)
			cam.y += (y+hq-cam.y)*dt*2
		if(y-hq>cam.y)
			cam.y += (y-hq-cam.y)*dt*2
	}
	let radius = 50
	for(const f of food){
		checkFood(f, head, radius)
		const col = (f.x*f.x+f.y*f.y)*8 & 7
		const r = 10*inflate
		ctx.drawRect(f.x-r, f.y-r, 2*r, 2*r, colors[col])
	}
	ctx.drawRect(x-radius, y-radius, radius*2, radius*2, vec4(.5))
	for(const pos of circles){
		const prevRadius = radius
		radius *= fade
		const dist = prevRadius + radius

		for(const f of food)
			checkFood(f, pos, radius)
		
		let dx = pos.x - x, dy = pos.y - y

		const factor = dist/hypot(dx, dy)
		if(!factor){ // catch NaN or 0
			dx = 0
			dy = dist
		}else{
			dx *= factor
			dy *= factor
		}

		x += dx
		y += dy
		pos.x = x
		pos.y = y

		ctx.drawRect(x-radius, y-radius, radius*2, radius*2, vec4(radius/100))
	}
}