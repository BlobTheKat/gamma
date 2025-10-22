/// <reference path="../docs/monolith-global.d.ts" />

const ubuntu = await Font.chlumsky('fonts/ubuntu/')

const label = RichText(ubuntu)
label.add('Gamma is ')
label.setValues(0, [vec4(1,0,0,.5)])
label.add('peak')

const cat = Texture.from('./examples/catpheus.png')

const cubeGeo = Geometry3D()
cubeGeo.type = LINE_LOOP
for(let i = 0; i < 8; i++) cubeGeo.addPoint((i<<1&2)-1, (i&2)-1, (i>>1&2)-1)
cubeGeo.upload(new Uint8Array([1, 2, 3, 6, 7, 4, 5, 0, 3, 7, 2, 6, 5, 1, 4, 0, 2, 4, 6, 0, 1, 3, 5, 7]))

onKey(MOUSE.LEFT, () => {
	pointerLock = true
})
let pos = vec3(0, 0, -4), vel = vec3(), look = vec2()

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
	if(a.y > .1){
		vec2 uv = p.xz/p.y*10.;
		vec2 off = valnoise2(uv);
		uv += uni0*vec2(.15,.4);
   	vec2 x = valnoise2(vec2(uv.x+uv.y, uv.x-uv.y)/2.8+off);
		color.rgb = lerp(color.rgb, vec3(.8+abs(x.x-.75)*.3+x.y*.2), clamp(0., x.x*min(2.,a.y*6.-.6)-.5, 1.));
	}
}

`, {uniforms: [FLOAT], vertex: Geometry3D.DEFAULT_VERTEX})

render = () => {
	skyShader.uniforms(t)
	const {width, height} = ctx
	ctx.reset(.2*height/width, 0, 0, .2, .5, .5)
	const ctx3 = ctx.sub3DProj(0, .5)
	if(pointerLock){
		look.x = (look.x + rawMouse.x*.002) % PI2
		look.y = clamp(look.y + rawMouse.y*.002, -PI, PI)
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

	ctx3.geometry = Geometry3D.CUBE
	ctx3.shader = Shader.SHADED_3D
	ctx3.translate(-pos.x, -pos.y, -pos.z)
	
	const cubeCtx = ctx3.sub()
		const col = vec4(cos(t*.1)*.5+.5, sin(t*.1)*.5+.5, 0, 1)
		cubeCtx.rotateXZ(t*.1)
		cubeCtx.rotateXY(t*.1)
		cubeCtx.drawCube(-1, -1, -1, 2, 2, 2, col)
	
	ctx3.translate(0, 3, 0)
	const textCtx = ctx3.sub2D()
	textCtx.translate(label.width*-.5, 0)
	label.draw(textCtx)
}