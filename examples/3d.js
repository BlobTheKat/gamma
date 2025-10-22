/// <reference path="../docs/monolith-global.d.ts" />

title = '3D demo'

const font = await Font.chlumsky('fonts/marker/')

const label = RichText(font)
label.addTextPass(0, [], 0, 0, 0, -1)
// middle-line rather than baseline
label.yOffset = .5-font.ascend
label.add('Gamma is ')
label.addTextPass(0, [vec4(1,0,0,.4)], 0, 0, 0, -1)
label.add('peak')

const cat = Texture.from('./examples/catpheus.png')

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
	ctx.translate(label.width*-.5, 0)
	ctx.drawRect(-1.5, -.75, label.width+2, 1.5, vec4(0,0,0,.5))
	let ctx3 = ctx.sub(); ctx3.translate(-.75, 0)
	ctx3 = ctx3.sub3dProj()
		ctx3.shader = Shader.SHADED_3D
		ctx3.geometry = Geometry3D.CUBE
		ctx3.translate(0, 0, 4)
		ctx3.rotateXZ(t)
		ctx3.rotateXY(t)
		ctx3.drawCube(-1, -1, -1, 2, 2, 2, vec4(.8,0,0,1))
	label.draw(ctx)
}

const FOV = 90
render = () => {
	skyShader.uniforms(t)
	const {width, height} = ctx
	ctx.reset(.05*height/width, 0, 0, .05, .5, .5)
	const ctx3 = ctx.sub3dProj(0, .125*tan(FOV * PI/360))
	if(pointerLock){
		look.x = (look.x + rawMouse.x*.002) % PI2
		look.y = clamp(look.y + rawMouse.y*.002, PI*-.5, PI*.5)
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
	ctx3.drawCube(-1, -1, -1, 2, 2, 2)

	ctx3.geometry = cyl
	ctx3.shader = Shader.SHADED_3D
	ctx3.translate(-pos.x, -pos.y, -pos.z)
	
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
		ctx.translate(font.measure('Click anywhere to lock pointer')*-.5, -18)
		ctx.shader = Shader.MSDF
		font.draw(ctx, 'Click anywhere to lock pointer', [vec4(.3+sin(t*PI)*.2)])
	}
}