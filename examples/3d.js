/// <reference path="../docs/monolith-global.d.ts" />


const libnoise = await fetch('examples/libnoise.glsl').then(a => a.text())

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
globalThis.pos = pos
globalThis.vel = vel
globalThis.look = look

Shader.AA_CIRCLE ??= Shader(`
void main(){
	float dist = 0.5 - length(pos - 0.5);

	// Make [0, 1] the range covered by one pixel
	float alpha = clamp(dist/fwidth(dist) + 0.5, 0.0, 1.0);

	color = param0(pos) * alpha;
}
`, {params: COLOR})
const skyShader = Shader(`${libnoise}
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
	ctx3 = ctx3.sub3dProj(4, 1)
		ctx3.shader = Shader.SHADED_3D
		ctx3.geometry = Geometry3D.CUBE
		ctx3.rotateXZ(t)
		ctx3.rotateXY(t)
		ctx3.drawCube(-1, -1, -1, 2, 2, 2, vec4(.8,0,0,1))
	const {x, y} = ctx.unproject(pointerLock ? vec2(.5) : cursor)
	label.draw(ctx.sub())
	ctx.mask |= IF_SET
	ctx.drawRect(x-.1, y-.01, .2, .02, vec4(0,0,0,1))
	ctx.drawRect(x-.01, y-.1, .02, .2, vec4(0,0,0,1))
}

let surface = null, surface2 = null

let FOV = 90, targetFov = 90
const altctx = Drawable(true), altctx2 = Drawable(false)

const bulgeShader = Shader(`void main(){
	vec2 uv = pos-.5; float j = 0.;
	color = vec4(0);
	for(float i = .5; i <= 1.; i += .03){
		j++;
		vec2 uv = uv * (i + 1. - length(uv)*i*2.);
		color += getColor(uni0, vec3(uv+.5, 0.));
	}
	color /= j;
	color.rgb = color.rgb*mat3(.393,.769,.189,.349,.686,.168,.272,.534,.131);
}`, {uniforms: TEXTURE})

const ghostShader = Shader(`void main(){
	color = getColor(uni0, vec3(pos.xy, 0.)) * param0;
}`, {uniforms: TEXTURE, params: FLOAT})

const edgeShader = Shader(`vec4 cubic(float v){
	vec4 s = vec4(1., 2., 3., 4.) - v;
	s *= s*s;
	float x = s.x, y = s.y - 4.*s.x, z = s.z - 4.*s.y + 6.*s.x;
	return vec4(x, y, z, 6. - x - y - z) * .1666666667;
}

vec4 texture2(sampler2DArray sampler, vec2 texCoords, int m){
	vec2 texSize = vec2(textureSize(sampler, m));
	texCoords = texCoords * texSize - 0.5;
	vec2 fxy = fract(texCoords);
	texCoords -= fxy;
	vec4 xcubic = cubic(fxy.x);
	vec4 ycubic = cubic(fxy.y);
	vec4 c = texCoords.xxyy + vec4(-.5, 1.5, -.5, 1.5);
	vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
	vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;
	offset *= (1./texSize).xxyy;
	float fm = float(m);
	vec4 sample0 = textureLod(sampler, vec3(offset.xz,0.), fm);
	vec4 sample1 = textureLod(sampler, vec3(offset.yz,0.), fm);
	vec4 sample2 = textureLod(sampler, vec3(offset.xw,0.), fm);
	vec4 sample3 = textureLod(sampler, vec3(offset.yw,0.), fm);
	float sx = s.x / (s.x + s.y);
	float sy = s.z / (s.z + s.w);
	return mix(
		mix(sample3, sample2, sx),
		mix(sample1, sample0, sx)
	, sy);
}

// three-point filter convolution
vec3 tpfc(vec3 x){
	vec3 xx = x*x;
	x = abs(x);
	vec3 v = step(.5, x);
	return ((v*-1.5+1.)*xx+(v*2.)*x+v*-.75-1.5)*xx+.8125+.03125*v;
}

vec4 texture9(sampler2DArray img, vec2 uv, int m){
	vec2 sz = vec2(textureSize(img, m));
	vec2 uv1 = fract(uv*sz);
	uv1 -= .5;
	vec3 uv0 = vec3(uv-uv1/sz,0.);
	float m1 = float(m);
	vec4 aa = textureLodOffset(img, uv0, m1, ivec2(-1,-1));
	vec4 ab = textureLodOffset(img, uv0, m1, ivec2(-1,0));
	vec4 ac = textureLodOffset(img, uv0, m1, ivec2(-1,1));
	 vec4 ba = textureLodOffset(img, uv0, m1, ivec2(0,-1));
	 vec4 bb = textureLodOffset(img, uv0, m1, ivec2(0));
	 vec4 bc = textureLodOffset(img, uv0, m1, ivec2(0,1));
	  vec4 ca = textureLodOffset(img, uv0, m1, ivec2(1,-1));
	  vec4 cb = textureLodOffset(img, uv0, m1, ivec2(1,0));
	  vec4 cc = textureLodOffset(img, uv0, m1, ivec2(1,1));

	vec3 lmr = tpfc(uv1.x+vec3(1.,0.,-1.)), dmu = tpfc(uv1.y+vec3(1.,0.,-1.));
	vec4 a = lmr.x*aa+lmr.y*ba+lmr.z*ca;
	vec4 b = lmr.x*ab+lmr.y*bb+lmr.z*cb;
	vec4 c = lmr.x*ac+lmr.y*bc+lmr.z*cc;
	return dmu.x*a+dmu.y*b+dmu.z*c;
}

void main(){
	color = texture(uni0, vec3(pos,0.));
	float a = 0., m = 1.;
	for(int i = 2; i < 10; i++){
		a += length(fwidth(texture9(uni0, pos, i).rgb)) * m;
		m *= 2.;
	}
	color.rgb *= a;
}`, {uniforms: TEXTURE})

const waterShader = Shader(`${libnoise}
void main(){
	vec2 uv = pos; uv.x *= uni1; uv *= 10.;
	uv += param0*vec2(.6,1.6);
	vec2 off = valnoise2(uv);
	off += param0*vec2(1.6,.5);
	vec2 v = valnoise2(vec2(uv.x+uv.y, uv.x-uv.y)/2.8+off);
	v -= .5; v.x *= uni1; v *= .1;
	color = getColor(uni0, vec3(pos + v, 0.));
}`, {uniforms: [TEXTURE, FLOAT], params: [FLOAT]})

let sfx = 0
let frames = []

const fogXzShader = Shader(`void main(){ color = param0(pos.xz)*(1.-1./(i_depth*i_depth)); }`, {params: COLOR, vertex: Geometry3D.DEFAULT_VERTEX})

render = () => {
	ctxSupersample = keys.has(KEY.V) ? 0.125/devicePixelRatio : 1 + (devicePixelRatio < 2)
	sfx = 0
	for(let k = 0; k < 10; k++)
		if(keys.has(KEY.NUM_0 + k)){ sfx = k; break }
	if(keys.has(KEY.C)) targetFov = min(targetFov / SQRT2**dt, 15)
	else targetFov = 90
	FOV += (targetFov - FOV) * min(1, dt*20)
	skyShader.uniforms(t)
	const {width, height} = ctx
	let scene = ctx
	if(!surface || surface.width != width || surface.height != height){
		surface?.delete()
		surface = Texture(width, height, 1, SMOOTH, Formats.RGB, 999)
		surface2 = Texture(width, height, 1, 0, Formats.RGBA32F)
		altctx.setTarget(0, surface)
		altctx2.setTarget(0, surface2)
		for(const sh of [bulgeShader, ghostShader, edgeShader, waterShader]) sh.uniforms(surface, width/height)
	}
	if(sfx){
		scene = altctx
		scene.clearStencil()
	}
	scene.reset(.025*height/width, 0, 0, .025, .5, .5)
	const h = 40, w = width/height*40

	let ctx3 = scene.sub3dProj(keys.has(KEY.P)*.4, 1)
	const sc = .16/tan(FOV * PI/360)
	// Scale FOV without changing depth values (used for fog)
	ctx3.scale(sc, sc, .01)

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
	pos.x += vel.x*dt; pos.z += vel.z*dt
	if(vel.y < 0 && pos.y<0) pos.y = tanh(atanh(pos.y*.55) + vel.y*dt*.55)/.55
	else pos.y += vel.y*dt
	const drag = .01**dt
	vel.x *= drag; vel.y *= drag; vel.z *= drag
	if(sfx==5){
		ctx3.skewY(sin(t)*.25, cos(t)*.75)
		ctx3.skewX(sin(t)*.5, cos(t)*.5)
		ctx3.skewY(cos(t)*.5, sin(t)*.5)
	}
	ctx3.rotateZY(look.y)
	ctx3.rotateXZ(-look.x)

	const light = ctx3.metric(0, -0.25, 0)

	ctx3.shader = skyShader
	ctx3.geometry = Geometry3D.INSIDE_CUBE
	ctx3.drawCube(-20, -20, -20, 40, 40, 40)
	ctx3.translate(-pos.x, -pos.y, -pos.z)

	ctx3.geometry = Geometry3D.XZ_FACE
	ctx3.shader = fogXzShader
	ctx3.drawCube(floor(pos.x*.2)*5-250, -2, floor(pos.z*.2)*5-250, 500, 0, 500, ground)
	
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
	cubeCtx.draw(vec4(.2,.85,.1,1), cubeCtx.metricFrom(light))
	if(!(pos.z > -3))
		drawText(ctx3.sub2dXY())
	
	const hint = pointerLock ? 'Press 0-9 to try some special FX' : 'Click anywhere to lock pointer'
	const sc2 = scene.sub()
	sc2.translate(fonts.ubuntu.measure(hint)*-.5, -18)
	sc2.shader = Shader.MSDF
	fonts.ubuntu.draw(sc2, hint, [vec4(.3+sin(t*PI)*.2)])
	if(sfx){
		surface.genMipmaps()
		switch(sfx){
			case 1:
				ctx.shader = bulgeShader
				ctx.draw()
				break
			case 2:
				altctx2.shader = ghostShader
				altctx2.draw(1-.1**dt)
				ctx.draw(surface2)
				break
			case 3:
				ctx.shader = edgeShader
				ctx.draw()
				break
			case 4:
				ctx.shader = waterShader
				ctx.draw(t)
				break
			default:
				ctx.draw(surface)
		}
	}
	ctx.resetTo(scene)
	ctx.translate(-.5*w, .5*h - 1)
	ctx.shader = Shader.MSDF
	let i = 0
	frames.push(t+1)
	const fps = (frames.length-1)/(t+1-frames[0])
	while(frames[i] < t) i++
	if(i) frames.splice(0, i)
	const str = `FPS: ${fps==fps?fps.toFixed(1):'-'}`
	fonts.ubuntu.draw(ctx.sub(), str, [vec4(0,0,0,1)], -.03, .07)
	fonts.ubuntu.draw(ctx, str, [], -.03)
}