shader_type canvas_item;

uniform float saturation : hint_range(-1,1);
uniform float value : hint_range(-1,1);
uniform float hue_scale : hint_range(1, 100000);
uniform float hue_offset : hint_range(0,1);
uniform vec2 cam_pos;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void fragment() {
	vec2 worldPos = cam_pos + vec2(1, -1) * (FRAGCOORD.xy - 0.5/SCREEN_PIXEL_SIZE);
	COLOR.rgba = texture(TEXTURE, UV);
	vec3 hsv = rgb2hsv(COLOR.rgb);
	hsv.r = fract(hue_offset + worldPos.y / hue_scale);
	hsv.g = clamp(hsv.g + saturation, 0, 1);
	hsv.b = clamp(hsv.b + value, 0, 1);
	COLOR.rgb = hsv2rgb(hsv);
}