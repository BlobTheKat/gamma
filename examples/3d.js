/// <reference path="../docs/monolith-global.d.ts" />

title = '3D demo'

const fonts = {
	ubuntu: await Font.chlumsky('fonts/ubuntu/'),
	marker: await Font.chlumsky('fonts/marker/')
}

const label = RichText(fonts.ubuntu)
// middle-line rather than baseline
label.yOffset = .5-fonts.ubuntu.ascend
label.add('Gamma is ')
label.addTextPass(0, [vec4(1,0,0,.4)])
label.addTextPass(1, [vec4(0,0,0,.5)], 0, 0, -.04)
label.font = fonts.marker
label.yOffset = .5-fonts.marker.ascend
label.add('peak')

const ground = Texture(2, 2, 1, DOWNSCALE_SMOOTH | MIPMAP_SMOOTH | REPEAT, Formats.RGB5_A1, 2)
	.pasteData(Uint16Array.fromHex('A529 C631 C631 A529')).super(.5,.5,.01,.01)
ground.genMipmaps()

const cyl = Geometry3D()
cyl.type = TRIANGLE_STRIP | CW_ONLY
const top = [], bottom = [], ring = [], ring2 = []
for(let i = PI/32; i < PI; i += PI/16){
	const dx = sin(i), dz = cos(i)
	const a = cyl.addPoint(dx, 1, dz)
	cyl.addPoint(-dx, 1, dz)
	cyl.addPoint(dx, -1, dz)
	cyl.addPoint(-dx, -1, dz)
	top.push(a+1, a)
	bottom.push(a+2, a+3)
	ring.push(a, a+2)
	ring2.push(a+3, a+1)
}
ring2.reverse()
cyl.upload(new Uint8Array([...top, top[top.length-1], bottom[0], ...bottom, bottom[bottom.length-1], ring[0], ...ring, ...ring2, 0, 2]))

onKey(MOUSE.LEFT, () => {
	pointerLock = true
})
let pos = vec3(0, 0, -6), vel = vec3(), look = vec2()

Shader.AA_CIRCLE ??= Shader(`
void main(){
	float dist = 0.5 - length(pos - 0.5);

	// Make [0, 1] the range covered by one pixel
	float alpha = clamp(dist/fwidth(dist) + 0.5, 0.0, 1.0);

	color = param0(pos) * alpha;
}
`, {params: COLOR})
const skyShader = Shader(`
uint uhash(uvec2 a){
	uint x = ((a.x * 1597334673U) ^ (a.y * 3812015801U));
	x = x * 0x7feb352du;
	x = x ^ (x >> 15u);
	x = x * 0x846ca68bu;
	return x;
}
#define lerp(a,b,c) mix(a,b,c*c*(3.f-2.f*c))
float valnoise(vec2 uv){
	vec2 fa = floor(uv);
	uv -= fa;
	uvec2 i = uvec2(ivec2(fa));
	uint x = uhash(i);
	float a = float(x)/4294967296.;
	i.x++; x = uhash(i);
	a = lerp(a, float(x)/4294967296., uv.x);
	i.y++; x = uhash(i);
	float a2 = float(x)/4294967296.;
	i.x--; x = uhash(i);
	a2 = lerp(float(x)/4294967296., a2, uv.x);
	return lerp(a, a2, uv.y);
}
vec2 valnoise2(vec2 uv){
	vec2 fa = floor(uv);
	uv -= fa;
	uvec2 i = uvec2(ivec2(fa));
	uint x = uhash(i);
	float a = float(x&0xffffu)/65535., b = float(x>>16)/65535.;
	i.x++; x = uhash(i);
	a = lerp(a, float(x&0xffffu)/65535., uv.x); b = lerp(b, float(x>>16)/65535., uv.x);
	i.y++; x = uhash(i);
	float a2 = float(x&0xffffu)/65535., b2 = float(x>>16)/65535.;
	i.x--; x = uhash(i);
	a2 = lerp(float(x&0xffffu)/65535., a2, uv.x); b2 = lerp(float(x>>16)/65535., b2, uv.x);
	return vec2(lerp(a, a2, uv.y), lerp(b, b2, uv.y));
}

void main(){
	vec3 p = pos*2.-1.;
	vec3 a = normalize(p);
	color = vec4(0, .5+a.y*.25, 1, 1);
	if(a.y > uni1){
		float d = .6/uni1;
		vec2 uv = p.xz/p.y*10.;
		vec2 off = valnoise2(uv);
		uv += uni0*vec2(.15,.4);
   	vec2 v = valnoise2(vec2(uv.x+uv.y, uv.x-uv.y)/2.8+off);
		color.rgb = lerp(color.rgb, vec3(.8+abs(v.x-.75)*.3+v.y*.2), clamp(0., v.x*min(2.,a.y*d-.6)-.5, 1.));
	}
}
`, {uniforms: [FLOAT, FLOAT], uniformDefaults: [0, .05], vertex: Geometry3D.DEFAULT_VERTEX})

function drawText(ctx){
	ctx.translate(label.width*-.5 + .5, 0)
	ctx.mask |= SET
	ctx.drawRect(-1.5, -.75, label.width+2, 1.5, vec4(0,0,0,.5))
	ctx.mask = RGBA
	let ctx3 = ctx.sub(); ctx3.translate(-.75, 0)
	ctx3 = ctx3.sub3dProj()
		ctx3.shader = Shader.SHADED_3D
		ctx3.geometry = Geometry3D.CUBE
		ctx3.translate(0, 0, 4)
		ctx3.rotateXZ(t)
		ctx3.rotateXY(t)
		ctx3.drawCube(-1, -1, -1, 2, 2, 2, vec4(.8,0,0,1))
	const {x, y} = ctx.from(pointerLock ? vec2(.5) : cursor)
	label.draw(ctx.sub())
	ctx.mask |= IF_SET
	ctx.drawRect(x-.1, y-.01, .2, .02, vec4(0,0,0,1))
	ctx.drawRect(x-.01, y-.1, .02, .2, vec4(0,0,0,1))
}

let FOV = 90, targetFov = 90
render = () => {
	if(keys.has(KEY.C)) targetFov = min(targetFov / SQRT2**dt, 15)
	else targetFov = 90
	FOV += (targetFov - FOV) * min(1, dt*20)
	skyShader.uniforms(t)
	const {width, height} = ctx
	ctx.reset(.05*height/width, 0, 0, .05, .5, .5)
	let ctx3 = ctx.sub3dProj(0, .125*tan(FOV * PI/360))
	if(pointerLock){
		look.x = (look.x + rawMouse.x*.00003*FOV) % PI2
		look.y = clamp(look.y + rawMouse.y*.00003*FOV, PI*-.5, PI*.5)
		const MAX_SPEED = 5
		const dz = cos(look.x)*dt*20*MAX_SPEED, dx = sin(look.x)*dt*20*MAX_SPEED
		const lr = keys.has(KEY.D) - keys.has(KEY.A), fb = keys.has(KEY.W) - keys.has(KEY.S)
		const ud = keys.has(KEY.SPACE) - keys.has(KEY.SHIFT)
		vel.x += dx*fb+dz*lr, vel.z += dz*fb-dx*lr
		vel.y = clamp(vel.y + ud*dt*50, -MAX_SPEED, MAX_SPEED)
		const d = hypot(vel.x, vel.z)
		if(d > MAX_SPEED) vel.x *= MAX_SPEED/d, vel.z *= MAX_SPEED/d
	}
	pos.x += vel.x*dt; pos.y += vel.y*dt; pos.z += vel.z*dt
	const drag = .01**dt
	vel.x *= drag; vel.y *= drag; vel.z *= drag
	ctx3.rotateZY(look.y)
	ctx3.rotateXZ(-look.x)

	ctx3.shader = skyShader
	ctx3.geometry = Geometry3D.INSIDE_CUBE
	ctx3.drawCube(-20, -20, -20, 40, 40, 40)
	ctx3.translate(-pos.x, -pos.y, -pos.z)

	ctx3.geometry = Geometry3D.XZ_FACE
	ctx3.shader = Shader.COLOR_3D_XZ
	ctx3.drawCube(-250, -2, -250, 500, 10, 500, ground)
	
	ctx3.geometry = cyl
	ctx3.shader = Shader.SHADED_3D
	
	const cubeCtx = ctx3.sub()
		cubeCtx.rotateXZ(t*.1)
		cubeCtx.rotateXY(t*.1)
	
	ctx3.translate(0, 0, -3)
	
	if(pos.z > -3){
		const ct2 = ctx3.sub2dXY()
		ct2.scale(-1,1)
		drawText(ct2)
	}
	cubeCtx.draw(vec4(.2,.85,.1,1))
	if(!(pos.z > -3))
		drawText(ctx3.sub2dXY())
	
	if(!pointerLock){
		ctx.scale(0.5)
		ctx.translate(fonts.ubuntu.measure('Click anywhere to lock pointer')*-.5, -18)
		ctx.shader = Shader.MSDF
		fonts.ubuntu.draw(ctx, 'Click anywhere to lock pointer', [vec4(.3+sin(t*PI)*.2)])
	}
	ctxSupersample = keys.has(KEY.V) ? 0.125/devicePixelRatio : 1 + (devicePixelRatio < 2)
}