const locus = await Font('locus-msdf/index.json')

const t = RichText()
t.font = locus
t.height = 2
t.add('Hello, World!')
t.skew = .2
t.height = 1
t.add(' italic text')
console.log(t.width)

ctx.scale(100) // draw at base size of 100px
t.draw(ctx) // Draws the text as one line

const lines = t.break(5)
for(const line of lines){
	console.log(line.width)
	line.draw(ctx.sub()) // draw() mutates the canvas so we pass a copy
	ctx.translate(0, 1.2) // 1.2x the height of 100px, so we have a
								 // 20px gap between each line
}

render = () => {
	
}