const locus = Font('locus-msdf/index.json')

render = () => {
	const t = Paragraph()
	t.font = locus
	t.add('Hello, World!')
	ctx.draw(vec4(cursor.x, cursor.y, cursor.y, 1))
}