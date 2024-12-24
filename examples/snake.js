Shader.AA_CIRCLE ??= Shader(`
void main(){
	float dist = 0.5 - length(uv - 0.5);

	// Make [0, 1] the range covered by one pixel
	float alpha = clamp(dist/fwidth(dist) + 0.5, 0.0, 1.0);

	color = arg0() * alpha;
}
`, COLOR)

// [x,y,x,y,x,y,...]
const circles = new Float32Array(20)

render = () => {
	ctx.reset(pixelRatio/ctx.width, 0, 0, pixelRatio/ctx.height, .5, .5)
	ctx.shader = Shader.AA_CIRCLE

	let {x, y} = ctx.from(cursor)

	let radius = 50
	ctx.drawRect(x-radius, y-radius, radius*2, radius*2, vec4(.5))
	for(let i = 0; i < circles.length; i += 2){
		const prevRadius = radius
		radius *= .9
		const dist = prevRadius + radius

		let dx = circles[i] - x,
			dy = circles[i+1] - y

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
		circles[i] = x
		circles[i+1] = y

		ctx.drawRect(x-radius, y-radius, radius*2, radius*2, vec4(radius/100))
	}
}