/// <reference path="../docs/monolith-global.d.ts" />

const font = Font.chlumsky('/fonts/ubuntu/')

const label = GUI.Text('You pressed the button 0 times', font)
let n = 0
const ui = GUI.ZStack()
	.add(GUI.BoxFill(Texture.from('/examples/mountains.jpeg'), GUI.BOTTOM, max, vec4(.5)))
	.add(GUI.Box(label, .5, 4))
	.add(GUI.Button(() => {
		n++
		const text = label.text
		text.clear(); text.reset(font)
		text.add(`You pressed the button ${n} times`)
		label.invalidate()
	}))

render = () => {
	const dims = getUIDimensons()
	ctx.reset(1/dims.width, 0, 0, 1/dims.height, 0, 0)
	ctx.clear(0, 0, 0, 1)
	ictx.reset()
	ui.draw(ctx, ictx, dims.width, dims.height)
}