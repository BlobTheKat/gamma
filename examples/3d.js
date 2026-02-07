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
label.setTextPass(0, [vec4(1,0,0,.4)])
label.setTextPass(1, [vec4(0,0,0,.5)], 0, 0, -.04)
label.font = fonts.marker
label.yOffset = .5-fonts.marker.ascend
label.add('peak')

const ground = Texture(2, 2, 1, DOWNSCALE_SMOOTH | MIPMAP_SMOOTH | REPEAT, Formats.RGBA, 2)
	.pasteData(Uint8Array.fromHex('#999999FF #CCCCCCFF #CCCCCCFF #999999FF')).super(.5,.5,.01,.01)
ground.genMipmaps()

const cyl = Geometry3D(Geometry3D.Vertex.WITH_NORMALS)
cyl.type = TRIANGLE_STRIP | CW_ONLY
const top = [], bottom = [], ring = [], ring2 = []
{
	const PRECISION = PI/16
	const sp2 = sin(PRECISION/2), cp2 = cos(PRECISION/2)
	const up = vec3(0,1,0), down = vec3(0,-1,0)
	for(let theta = PRECISION/2; theta < PI; theta += PRECISION){
		const dx = sin(theta), dz = cos(theta)
		cyl.addPoint(-dx, 1, dz, up)
		cyl.addPoint(dx, 1, dz, up)
	}
	cyl.dup()
	cyl.addPoint(sp2, -1, cp2)
	for(let theta = PRECISION/2; theta < PI; theta += PRECISION){
		const dx = sin(theta), dz = cos(theta)
		cyl.addPoint(dx, -1, dz, down)
		cyl.addPoint(-dx, -1, dz, down)
	}
	cyl.dup()
	const norm = vec3(-sp2, 0, cp2)
	cyl.addPoint(-sp2, 1, cp2, norm)
	cyl.dup()
	cyl.addPoint(-sp2, -1, cp2, norm)
	for(let theta = PRECISION/2; theta < PI2; theta += PRECISION){
		const dx = sin(theta), dz = cos(theta)
		const norm = vec3(dx, 0, dz)
		cyl.addPoint(dx, 1, dz, norm)
		cyl.addPoint(dx, -1, dz, norm)
	}
	cyl.upload()
}

const smoothNormalShader = Shader(`void main(){
	float a = 1. + dot(normalize(-vparam0),param1);
	color = param0(pos.xy);
	color.rgb *= a;
}`, {
	params: [COLOR, VEC3],
	defaults: [void 0,vec3(-.15,-.3,0)],
	vertex: Geometry3D.Vertex.WITH_NORMALS
})

const sceneIctx = InputContext()
ictx.next = sceneIctx


const lerp = (a,b,c) => a+(b-a)*c*c*(3-2*c)
const uhash = (x, y) => {
	x = imul(x, 1597334673) ^ imul(y, 3812015801)
	x = imul(x, 0x7feb352d)
	x = x ^ (x >>> 15)
	x = imul(x, 0x846ca68b)
	return x
}
const valnoise2 = (x, y) => {
	let fx = floor(x), fy = floor(y)
	x -= fx, y -= fy
	let v = uhash(fx, fy)
	let a = (v&0xffff)/65535, b = (v>>>16)/65535
	v = uhash(fx+1, fy)
	a = lerp(a, (v&0xffff)/65535, x); b = lerp(b, (v>>>16)/65535, x)
	v = uhash(fx+1, fy+1)
	let a2 = (v&0xffff)/65535, b2 = (v>>>16)/65535
	v = uhash(fx, fy+1)
	a2 = lerp((v&0xffff)/65535, a2, x); b2 = lerp((v>>>16)/65535, b2, x)
	return vec2(lerp(a, a2, y), lerp(b, b2, y))
}
ictx.onPointerUpdate((_id, ptr) => {
	if(ptr && sfx == 4){
		let {x, y} = ptr
		x *= ctx.width/ctx.height*10; y *= 10
		x += .6*t; y += 1.6*t
		let {x: offx, y: offy} = valnoise2(x, y)
		offx += t*1.6; offy += t*.5
		let {x: vx, y: vy} = valnoise2((x+y)*0.3571428571+offx, (x-y)*0.3571428571+offy)
		vx = (vx-.5)*ctx.width/ctx.height*.1; vy = (vy-.5)*.1
		ptr.x += vx, ptr.y += vy
	}
})

ictx.onKey(MOUSE.LEFT, () => {
	pointerLock = true
})
const btn = GUI.Target((x, y, ptr) => {
	ictx.orientation.reset()
	ptr.vibrate?.(10)
})

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
	color *= clamp(dGetPixel(uni2, ivec3(gl_FragCoord.xy, 0), 0)*2.-1., 0., 1.);
}
`, {uniforms: [FLOAT, FLOAT, FTEXTURE], uniformDefaults: [0, .05], vertex: Geometry3D.Vertex.DEFAULT})

let pos = vec3(0, 0, -6), vel = vec3(), look = vec2()
globalThis.pos = pos
globalThis.vel = vel
globalThis.look = look

function drawText(ctx){
	ctx.translate(label.width*-.5 + .5, 0)
	ctx.mask = RGBA|SET|IF_CLOSER
	ctx.drawRect(-1.5, -.75, label.width+2, 1.5, vec4(0,0,0,.5))
	ctx.mask = RGBA|IF_CLOSER
	let ctx3 = ctx.sub(); ctx3.translate(-.75, 0)
	ctx3 = ctx3.sub3dPersp(1, 0)
		ctx3.scale(0.3)
		ctx3.shader = Shader.SHADED_3D
		ctx3.geometry = Geometry3D.CUBE
		ctx3.rotateXZ(t)
		ctx3.rotateXY(t)
		ctx3.drawCube(-1, -1, -1, 2, 2, 2, vec4(.8,0,0,1))
	const {x, y} = ctx.unproject(sceneIctx.cursor ?? vec2(.5))
	label.draw(ctx.sub())
	ctx.mask |= IF_SET
	ctx.drawRect(x-.1, y-.01, .2, .02, vec4(0,0,0,1))
	ctx.drawRect(x-.01, y-.1, .02, .2, vec4(0,0,0,1))
	ctx.mask = DEPTH | IF_CLOSER
	ctx.drawRect(-1.5, -.75, label.width+2, 1.5)
}

let surface = null, surface2 = null, dsurface = null

let FOV = 90, targetFov = 90
const scene = Drawable(), altctx2 = Drawable()

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

let selectedShader = -1

ictx.onGamepadButtonPress([GAMEPAD.LB, GAMEPAD.RB], (key) => {
	if(selectedShader == -1) selectedShader = sfx = 0
	sfx = selectedShader = (selectedShader + (key == GAMEPAD.LB ? 5 : 1)) % 6
})
ictx.onGamepadButton([GAMEPAD.A, GAMEPAD.B, GAMEPAD.X], (isDown, btn) => {
	ictx.setKey(btn == GAMEPAD.A ? KEY.SPACE : btn == GAMEPAD.B ? KEY.SHIFT : KEY.NUM_0, isDown)
})
ictx.onGamepadAxis(GAMEPAD.LEFT_STICK, (x, y) => {
	ictx.setKey(KEY.W, y > .5)
	ictx.setKey(KEY.A, x < -.5)
	ictx.setKey(KEY.S, y < -.5)
	ictx.setKey(KEY.D, x > .5)
})
let oldSfx = 0

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
	floor: -2,
	update(ctx, p, dt){
		const {dx, dy, dz} = p
		p.dy -= 50*dt
		const drag = p.drag*dt+1, hdt = dt*.5; p.dx *= drag; p.dy *= drag; p.dz *= drag
		p.x += (p.dx+dx)*hdt; p.y += (p.dy+dy)*hdt; p.z += (p.dz+dz)*hdt
		const floor = this.floor+p.r
		if(p.y<floor) p.y = floor, p.r *= drag
		const p2 = this.projection.point(p.x, p.y, p.z)
		if(p2.z>0){
			const szx = p.r*this.i_width, szy = p.r*this.i_height
			ctx.setTransform(szx*2, 0, 0, 0, szy*2, 0, p2.x-szx, p2.y-szy, p2.z)
			ctx.draw(p.col)
		}
		return (p.t -= dt) < 0
	},
	init(x, y, z){
		let dx, dy, dz
		do{ dx = random()*30-15, dy = random()*30-15, dz = random()*30-15 }while((dx*dx+dy*dy+dz*dz)>15*15)
		const col = (dy+15)*.02
		const sz = random()*.15+.1
		return {x, y, z, dx, dy: dy+10, dz, r: sz, col: colors[floor((col+this.seed+random()*.35)*96)%96], drag: log(.9-sz), t: 4+random()*2}
	},
	seed: random(),
	projection: null,
	i_width: 0, i_height: 0,
	prepare(ctx){
		this.seed = random()
		ctx.shader = Shader.AA_CIRCLE
		ctx.blend = Blend.ADD
		ctx.mask = RGBA | IF_CLOSER
		if(!ctx.perspective) return ctx.subPersp()
	}
})
ictx.onKey(KEY.NUM_0, isDown => {
	if(isDown){
		const R = 10
		let z = cos(look.x), x = sin(look.x), y = sin(look.y)*R, d = cos(look.y)*R
		z *= d; x *= d; x += pos.x; y += pos.y; z += pos.z
		for(let i = 0; i < 10_000; i++) confetti.add(x, y, z)
	}
})
render = () => {
	ctxSupersample = ictx.has(KEY.NUM_9)||ictx.gamepad?.has(GAMEPAD.LEFT) ? 0.125/devicePixelRatio : 1 + (devicePixelRatio < 2)
	if(selectedShader == -1) sfx = 0
	for(let k = 0; k < 10; k++)
		if(ictx.has(KEY.NUM_0 + k)){ selectedShader = -1; sfx = k; break }
	if(ictx.has(KEY.NUM_8) || ictx.gamepad?.has(GAMEPAD.UP)) targetFov = min(targetFov / SQRT2**dt, 15)
	else targetFov = 90
	FOV += (targetFov - FOV) * min(1, dt*20)
	
	if(!surface || surface.width != ctx.width || surface.height != ctx.height){
		surface?.delete(); surface2?.delete(); dsurface?.delete()
		surface = Texture(ctx.width, ctx.height, 1, SMOOTH, Formats.RGB, 999)
		surface2 = Texture(ctx.width, ctx.height, 1, 0, Drawable.BLEND_32F ? Formats.RGBA32F : Formats.RGBA16F)
		dsurface = Texture(ctx.width, ctx.height, 1, 0, Formats.DEPTH32F_STENCIL)
		scene.setTarget(0, surface)
		scene.setTarget(-1, dsurface, 0)
		altctx2.setTarget(0, surface2)
		for(const sh of [bulgeShader, ghostShader, edgeShader, waterShader]) sh.uniforms(surface, ctx.width/ctx.height)
	}
	skyShader.uniforms(t, .05, dsurface)

	scene.mask |= DEPTH
	scene.clear()
	const {width: w, height: h} = getGUIDimensions(20)
	scene.reset(1/w, 0, 0, 1/h, .5, .5)

	let ctx3 = scene.sub3dPersp((ictx.has(KEY.NUM_7)||(ictx.gamepad?.has(GAMEPAD.DOWN)??false))*.4, 1)
	const sc = .16/tan(FOV * PI/360)
	// Scale FOV without changing depth values (used for fog)
	ctx3.scale(sc, sc, .01)
	{
		let rotRight = (ictx.gamepad?.axis(GAMEPAD.RIGHT_STICK)?.x??0)*20
		let rotUp = (ictx.gamepad?.axis(GAMEPAD.RIGHT_STICK)?.y??0)*20
		if(pointerLock) rotRight += ictx.mouse.x, rotUp += ictx.mouse.y
		look.x = (look.x + rotRight*.00003*FOV) % PI2
		look.y = clamp(look.y + rotUp*.00003*FOV, PI*-.5, PI*.5)
		const MAX_SPEED = 5
		const dz = cos(look.x)*dt*20*MAX_SPEED, dx = sin(look.x)*dt*20*MAX_SPEED
		const lr = ictx.has(KEY.D) - ictx.has(KEY.A), fb = ictx.has(KEY.W) - ictx.has(KEY.S)
		const ud = ictx.has(KEY.SPACE) - ictx.has(KEY.SHIFT)
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
	{
		const {x, y, z} = vec3.multiply(ictx.transientVelocity, -200)
		ctx3.translate(x, y, z)
	}
	ctx3.transformInverse(ictx.orientation)
	ctx3.translate(-pos.x, -pos.y, -pos.z)
	const skyCtx = ctx3.sub()
	ctx3.mask |= DEPTH | IF_CLOSER

	const light = ctx3.metric(0, -0.25, 0)
	confetti.config.projection = ctx3.getTransform()

	ctx3.geometry = Geometry3D.XZ_FACE
	ctx3.shader = Shader.XZ_FACE
	ctx3.drawCube(floor(pos.x*.2)*5-250, -2, floor(pos.z*.2)*5-250, 500, 0, 500, ground)
	
	ctx3.geometry = cyl
	ctx3.shader = smoothNormalShader
	
	const cubeCtx = ctx3.sub()
		cubeCtx.rotateXZ(t*.1)
		cubeCtx.rotateXY(t*.1)
	
	ctx3.translate(0, 0, sin(t)*-3)

	cubeCtx.draw(vec4(.2,.85,.1,1), cubeCtx.metricFrom(light))

	skyCtx.shader = skyShader
	scene.setTarget(-1, null)
	skyCtx.geometry = Geometry3D.INSIDE_CUBE
	const {x, y, z} = skyCtx.perspectiveOrigin()
	skyCtx.drawCube(x-20, y-20, z-20, 40, 40, 40)
	scene.setTarget(-1, dsurface, 0)

	drawText(ctx3.sub2dXY())
	
	const hint = pointerLock ? 'Press 0-9 to try some special FX' : 'Click anywhere to lock pointer'
	const sc2 = scene.sub()
	sc2.translate(fonts.ubuntu.measure(hint)*-.5, -.5*h+3)
	sc2.shader = Shader.MSDF
	fonts.ubuntu.draw(sc2, hint, [vec4(.3+sin(t*PI)*.2)])
	confetti.config.i_width = sc/w
	confetti.config.i_height = sc/h
	confetti.draw(sc2)

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
	ctx.resetTo(scene)
	ctx.translate(-.5*w, .5*h - 1)
	ctx.shader = Shader.MSDF
	let i = 0
	frames.push(t+1)
	const fps = (frames.length-1)/(t+1-frames[0])
	while(frames[i] < t) i++
	if(i) frames.splice(0, i)
	for(const str of [
	`FPS: ${fps==fps?fps.toFixed(1):'-'}`,
	`D: ${frameDrawCalls} / M: ${Number.formatData(frameData)} / S: ${frameSprites}`,
]){
		fonts.ubuntu.draw(ctx.sub(), str, [vec4(0,0,0,1)], -.03, .07)
		fonts.ubuntu.draw(ctx.sub(), str, [], -.03)
		ctx.translate(0, -1)
	}
	if(sfx == 4 || sfx != oldSfx) ictx.refirePointers(), oldSfx = sfx
	ctx.reset()
	sceneIctx.reset()
	btn.draw(ctx, sceneIctx, 1, 1)
}

ictx.onKeyPress(KEY.F2, () => {
	screenshot().then(file => download(file, Date.kebab()))
})