/// <reference path="../docs/monolith-global.d.ts" />

title = 'Firework simulator'
icon = './examples/fireworks.webp'

const font = Font.chlumsky('/fonts/ubuntu/')

Shader.AA_CIRCLE ??= Shader(`
void main(){
	float dist = 0.5 - length(pos - 0.5);

	// Make [0, 1] the range covered by one pixel
	float alpha = clamp(dist/fwidth(dist) + 0.5, 0.0, 1.0);

	color = param0(pos) * alpha;
}
`, {params: COLOR})

const colors = Array.map(96, i => hsla((i>>1)*7.5, (i&1)*.2+.6, .5))
const confetti = new ParticleContainer({
	update(ctx, p, dt){
		p.dy -= 50*dt
		p.x += p.dx*dt; p.y += p.dy*dt
		const drag = p.drag*dt+1; p.dx *= drag; p.dy *= drag
		ctx.drawRect(p.x-p.r, p.y-p.r, p.r*2, p.r*2, p.col)
		return (p.t -= dt) < 0
	},
	init(x, y){
		const th = random()*PI2, r = sqrt(random())*50
		const col = (sin(th+t*3)+1)*.15
		const sz = random()*.2+.1
		return {x, y, dx: sin(th)*r, dy: cos(th)*r + 25, r: sz, col: colors[floor((col+this.seed+random()*.35)*96)%96], t: 5, drag: log(.9-sz)}
	},
	seed: random(),
	prepare(ctx){
		this.seed = random()
		ctx.shader = Shader.AA_CIRCLE
		ctx.blend = Blend.MAX
	}
})

const label = GUI.Text()
function updateLabel(){
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
}
let n = 0
let lastPressed = -1
updateLabel()
const ui = GUI.ZStack()
	.add(GUI.BoxFill(Texture.from('/examples/mountains.jpeg'), GUI.BOTTOM, max, vec4(.5)))
	.add(GUI.Transform(label, ctx => {
		let a = max(0, lastPressed-t+.5); a *= a
		ctx.scale(3+a*3)
		ctx.rotate(-.5*a)
	}))
	.add(GUI.Target((x, y) => {
		n++; lastPressed = t
		updateLabel()
		for(let i = 0; i < 50000; i++) confetti.add(x, y)
	}))

render = () => {
	const dims = getUIDimensons()
	ctx.reset(1/dims.width, 0, 0, 1/dims.height, 0, 0)
	ctx.clear(0, 0, 0, 1)
	ictx.reset()
	ui.draw(ctx.sub(), ictx, dims.width, dims.height)
	confetti.draw(ctx)
}