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