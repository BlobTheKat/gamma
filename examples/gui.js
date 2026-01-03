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
		const {dx, dy} = p
		p.dy -= 50*dt
		const drag = p.drag*dt+1, hdt = dt*.5; p.dx *= drag; p.dy *= drag
		p.x += (p.dx+dx)*hdt; p.y += (p.dy+dy)*hdt
		ctx.drawRect(p.x-p.r, p.y-p.r, p.r*2, p.r*2, p.col)
		return p.y < -p.r
	},
	init(x, y){
		const th = random()*PI2, r = sqrt(random())*30
		const col = (sin(th+t*3)+1)*.15
		const sz = random()*.2+.1
		return {x, y, dx: sin(th)*r, dy: cos(th)*r + 20, r: sz, col: colors[floor((col+this.seed+random()*.35)*96)%96], drag: log(.9-sz)}
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

const ui = GUI.Layer(
	GUI.ZStack()
		.add(GUI.BoxFill(Texture.from('/examples/mountains.jpeg'), GUI.BOTTOM, max, vec4(.5)))
		/*.add(GUI.Transform(label, function(ctx, w, h, w2, h2){
			let a = max(0, lastPressed-t+.5); a *= a
			ctx.scale(min((w-2)/w2, 3+a*3))
			ctx.rotate(-.5*a)
			if(a) this.invalidate()
		}))
		.add(GUI.Target((x, y) => {
			n++; lastPressed = t
			updateLabel()
			for(let i = 0; i < 2000; i++) confetti.add(x, y)
		}))*/
		.add(GUI.Box(GUI.ZStack()
			.add(GUI.BoxFill(vec4(0,0,0,.5)))
			.add(GUI.TextField.multiline(font, 'Enter some text').setAutoWidth())
		, GUI.BOTTOM, 4, GUI.INHERIT_WIDTH))
		.add(confetti)
)

let accX = 0, accY = 0, posZ = 0.6, targetPosZ = 0.6
render = () => {
	const dims = getGUIDimensions()
	ctx.reset(1/dims.width, 0, 0, 1/dims.height, 0, 0)
	ctx.clear(0, 0, 0, 1)
	ictx.reset()
	ictx.onPointerUpdate((_, ptr) => void ptr?.setHint(PointerState.DEFAULT))
	ictx.onWheel((_, dy) => {
		targetPosZ *= .999**dy
		return null
	})
	ctx.translate(.5*dims.width, .5*dims.height)
	const ctx3 = ctx.sub3dPersp(0, 4/dims.height)
	const {x, y} = ctx.unproject(ictx.firstPointer ?? {x: .5, y: .5})
	const expDt = 1 - 0.5**dt
	posZ += (targetPosZ-posZ)*expDt
	ctx3.translate(0, 0, (.5+posZ)*dims.height*.25)
	accX += (x*.01-accX)*expDt; accY += (y*.01-accY)*expDt
	ctx3.rotateXZ(-accX)
	ctx3.rotateZY(accY)
	const ctx2 = ctx3.sub2dXY()
	ctx2.translate(-.5*dims.width, -.5*dims.height)
	ui.draw(ctx2.sub(), ictx, dims.width, dims.height)
	const a = ui.lastRedraw-t+.25
	//if(a>0) ctx2.drawRect(0, 0, dims.width, dims.height, vec4(a*a*4,0,0,0))
}