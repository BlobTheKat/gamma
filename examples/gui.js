/// <reference path="../docs/monolith-global.d.ts" />

const font = Font.chlumsky('/fonts/ubuntu/')

const label = GUI.Text('You pressed the button 0 times', font)
let n = 0
let lastPressed = -1

Shader.AA_CIRCLE ??= Shader(`
void main(){
	float dist = 0.5 - length(pos - 0.5);

	// Make [0, 1] the range covered by one pixel
	float alpha = clamp(dist/fwidth(dist) + 0.5, 0.0, 1.0);

	color = param0(pos) * alpha;
}
`, {params: COLOR})

const colors = Array.map(24, i => hsla((i%12)*30, i<12?.8:.6, .5))
const confetti = new ParticleContainer({
	update(ctx, p, dt){
		p.dy -= 50*dt
		p.x += p.dx*dt; p.y += p.dy*dt
		const drag = (.9-p.r)**dt; p.dx *= drag; p.dy *= drag
		ctx.drawRect(p.x-p.r, p.y-p.r, p.r*2, p.r*2, p.col)
		return (p.t -= dt) < 0
	},
	init(x, y){
		const th = random()*PI2, r = sqrt(random())*50
		return {x, y, dx: sin(th)*r, dy: cos(th)*r + 25, r: random()*.2+.1, col: colors[randint()&63], t: 5}
	},
	prepare(ctx){
		ctx.shader = Shader.AA_CIRCLE
	}
})

const ui = GUI.ZStack()
	.add(GUI.BoxFill(Texture.from('/examples/mountains.jpeg'), GUI.BOTTOM, max, vec4(.5)))
	.add(GUI.Transform(label, ctx => {
		let a = max(0, lastPressed-t+.5); a *= a
		ctx.scale(3+a*3)
		ctx.rotate(-.5*a)
	}))
	.add(GUI.Target((x, y) => {
		n++; lastPressed = t
		const text = label.text
		text.clear(); text.reset(font)
		text.add(`You pressed the button `)
		const a = 10/(n+5)
		text.setTextPass(0, [vec4(1,a,a,1)])
		text.scale = 1.5+.5*tanh(n*.25-5)
		text.add(n)
		text.setTextPass(0)
		text.add(n == 1 ? ' time' : ' times')
		label.invalidate()
		for(let i = 0; i < 1000; i++) confetti.add(x, y)
	}))

render = () => {
	const dims = getUIDimensons()
	ctx.reset(1/dims.width, 0, 0, 1/dims.height, 0, 0)
	ctx.clear(0, 0, 0, 1)
	ictx.reset()
	ui.draw(ctx.sub(), ictx, dims.width, dims.height)
	confetti.draw(ctx)
}