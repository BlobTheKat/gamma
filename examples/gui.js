/// <reference path="../docs/monolith-global.d.ts" />

const font = Font.chlumsky('/fonts/ubuntu/')

const ui = GUI.ZStack()
	.add(GUI.Img(Texture.from('/examples/mountains.jpeg')))
	.add(GUI.Text('Hello World', font, 32), GUI.CENTERED)
	.add(GUI.Button(() => {
		console.log('Button Pressed')
	}))

render = () => {
	ctx.clear(0, 0, 0, 1)
	ui.draw(ctx, ictx)
}