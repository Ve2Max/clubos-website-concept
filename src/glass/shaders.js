// Glass shaders, ported from the glassness prototype.
//
// Differences from the prototype:
// - The backdrop is one texture of the whole viewport (the "scene"), shared by every
//   glass element. u_rect says where this element sits in it, so nothing is cropped per card.
// - Rail, depth and refraction are scaled by u_unit, so a 120px-tall card and a
//   1400px-wide bar bend light by the same number of pixels.
// - The face (inside the rail) shows the blurred scene with a tint and a soft sheen,
//   instead of an opaque phone screen.
//
// Coordinates: the shape is 1 unit wide and u_aspect units tall, centred on 0, y up.

export const VERTEX = `attribute vec2 a_position; varying vec2 v_uv;
void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;

// 13-tap separable Gaussian. u_direction is the tap spacing in UV.
export const BLUR = `precision highp float;
varying vec2 v_uv;uniform sampler2D u_image;uniform vec2 u_direction;
void main(){
 vec4 color=vec4(0.);float weight=0.;
 for(int i=-6;i<=6;i++){
  float x=float(i);float w=exp(-x*x/13.);
  color+=texture2D(u_image,clamp(v_uv+u_direction*x,0.,1.))*w;weight+=w;
 }
 gl_FragColor=color/weight;
}`;

export const GLASS = `precision highp float;
varying vec2 v_uv;
uniform sampler2D u_background,u_frameBlur,u_screenBlur;
uniform vec2 u_resolution,u_light,u_rot;
uniform vec4 u_rect;
uniform float u_radius,u_rail,u_softness,u_profile,u_unit;
uniform float u_refraction,u_depth,u_dispersion,u_frost,u_splay;
uniform float u_reflection,u_highlights,u_tintAmount,u_lightAngle,u_lightHeight;
uniform vec3 u_tint;
uniform float u_transmission,u_sheen;
uniform float u_clarity,u_lens,u_aspect;
uniform float u_rimK,u_rimKv; // width of the clear face's bending rim, × (1 = default): at the sides, at top and bottom
#define aspect u_aspect

float roundedBox(vec2 p,vec2 b,float r){
 vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;
}
// Outward normal of the rounded rectangle at p.
vec2 edgeNormal(vec2 p){
 vec2 q=abs(p)-vec2(.5-u_radius,aspect*.5-u_radius);
 if(max(q.x,q.y)>0.)return normalize(max(q,0.))*sign(p);
 return q.x>q.y?vec2(sign(p.x),0.):vec2(0.,sign(p.y));
}
// Height of the glass rail across its width; t runs -1 (inside) to 1 (outside).
float heightAt(float t){
 float a=clamp(abs(t),0.,.9999);
 float e=mix(6.,2.,u_softness);
 float h=pow(max(0.,1.-pow(a,e)),1./e);              // superellipse dome
 if(u_profile>.5&&u_profile<1.5)h=mix(1.-a,sqrt(1.-a*a),u_softness*.6); // cut / bevel
 if(u_profile>1.5)h*=1.-.15*pow(cos(t*3.14159),8.);  // double ridge
 return h*u_depth*.022*u_unit;
}
// u_rect: the element's unrotated box (bottom-left, size) in scene UV; u_rot: (cos, sin) of its
// rotation, y up. A rotated element (the showcase's curved row) samples what is really under it.
vec2 sceneUV(vec2 p){
 vec2 c=u_rect.xy+vec2(.5,aspect*.5)*u_rect.zw;
 return c+vec2(u_rot.x*p.x-u_rot.y*p.y,u_rot.y*p.x+u_rot.x*p.y)*u_rect.zw;
}
vec3 background(vec2 p,float frost){
 vec2 uv=clamp(sceneUV(p),.001,.999);
 return mix(texture2D(u_background,uv).rgb,texture2D(u_frameBlur,uv).rgb,frost);
}
// Studio environment: two softboxes, a warm strip light, a dark horizon.
vec3 environment(vec3 ray){
 float a=u_lightAngle;
 ray.xy=mat2(cos(a),-sin(a),sin(a),cos(a))*ray.xy;
 float broad=exp(-pow((ray.x+.46-u_light.x*.2)*4.,2.))*smoothstep(-.3,.25,ray.y);
 float strip=exp(-pow((ray.x-.67-u_light.x*.15)*18.,2.))*smoothstep(-.7,.1,ray.y);
 float horizon=exp(-pow((ray.y+.2-u_lightHeight*.14)*8.,2.));
 vec3 sky=mix(vec3(.15,.20,.25),vec3(.94,.97,1.),smoothstep(-.55,.7,ray.y));
 sky*=1.-horizon*.8;
 sky+=vec3(.8,.93,1.)*broad+vec3(1.,.91,.77)*strip*1.35;
 return sky;
}
// Diagonal reflection band across the face, turning with the light.
float sheenAt(vec2 p){
 float a=u_lightAngle+u_light.x*.34;
 vec2 d=vec2(cos(a),sin(a));
 float x=dot(p/vec2(1.,max(aspect,.15)),d);
 return smoothstep(.55,-.1,x)*.6+exp(-pow((x+.12)*5.,2.))*.4;
}
vec3 faceColor(vec2 p){
 vec3 behind=texture2D(u_screenBlur,clamp(sceneUV(p),.001,.999)).rgb;
 vec3 base=mix(vec3(.9804),behind,u_transmission);
 base=mix(base,u_tint,u_tintAmount);
 if(u_clarity>.001){
  // Clear slab: magnifies what lies under it and bends harder toward its rim.
  float side=min(1.,aspect);
  float ins=u_rail*2.;vec2 bx=vec2(.5-ins,aspect*.5-ins);
  float rr=max(max(u_radius*.4,u_radius-ins),.12*side);
  float sd=roundedBox(p,bx,rr);float e=.002;
  vec2 n=normalize(vec2(roundedBox(p+vec2(e,0.),bx,rr)-roundedBox(p-vec2(e,0.),bx,rr),
                        roundedBox(p+vec2(0.,e),bx,rr)-roundedBox(p-vec2(0.,e),bx,rr))+1e-6);
  float k=mix(u_rimKv,u_rimK,abs(n.x)); // the band's width follows the edge: sides vs top/bottom, blended round the corners
  float rim=1.-smoothstep(0.,.08*side*k,-sd);
  vec2 q=p/(1.+u_lens*.25)-n*rim*rim*.04*side*u_refraction*k;
  float ch=u_dispersion*.007*side*rim*k;
  vec3 clear=vec3(texture2D(u_background,clamp(sceneUV(q+n*ch),.001,.999)).r,
                  texture2D(u_background,clamp(sceneUV(q),.001,.999)).g,
                  texture2D(u_background,clamp(sceneUV(q-n*ch),.001,.999)).b);
  clear=mix(clear,u_tint,u_tintAmount*.5);
  clear=mix(clear,vec3(1.),rim*rim*.18);
  base=mix(base,clamp(clear,0.,1.),u_clarity);
 }
 base+=vec3(.16)*sheenAt(p)*u_sheen*u_reflection;
 return base;
}
void main(){
 vec2 p=(v_uv-.5)*vec2(1.,aspect);
 float outer=roundedBox(p,vec2(.5,aspect*.5),u_radius);
 float aa=1.15/u_resolution.x;
 float coverage=1.-smoothstep(-aa,aa,outer);
 if(coverage<.001){gl_FragColor=vec4(0.);return;}
 float inset=u_rail*2.;
 float inner=roundedBox(p,vec2(.5-inset,aspect*.5-inset),max(u_radius*.4,u_radius-inset));
 if(inner< -aa||u_rail<.0005){gl_FragColor=vec4(faceColor(p),coverage);return;}

 // Position across the rail and the surface slope there.
 float d=outer+u_rail;
 float t=clamp(d/u_rail,-.999,.999);
 float height=heightAt(t);
 float slope=(heightAt(t+.001)-heightAt(t-.001))/(.002*u_rail);
 vec2 gn=edgeNormal(p);
 vec2 radial=normalize(p+vec2(.00001));
 vec2 bendDirection=normalize(mix(gn,radial,clamp(u_splay*.36,0.,.72)));
 vec3 n=normalize(vec3(-gn*slope,1.));
 vec3 eye=vec3(0.,0.,1.);

 // Fresnel (Schlick) + Snell refraction into glass (IOR 1.46).
 float cosTheta=max(dot(n,eye),0.);
 float fresnel=.04+.96*pow(1.-cosTheta,5.);
 vec3 refracted=refract(-eye,n,1./1.46);
 float offsetLength=length(refracted.xy)/max(.2,-refracted.z);
 vec2 offset=bendDirection*sign(t)*offsetLength*(height+.012*u_depth*u_unit)*u_refraction*3.4;

 // Chromatic dispersion: sample R, G, B at slightly different bends.
 float chroma=u_dispersion*.18;
 float frost=smoothstep(0.,.5,u_frost);
 vec3 transmitted=vec3(background(p+offset*(1.+chroma),frost).r,
                       background(p+offset,frost).g,
                       background(p+offset*(1.-chroma),frost).b);
 transmitted=mix(transmitted,u_tint,u_tintAmount*(.55+.45*abs(t)));

 // Lighting.
 float angle=u_lightAngle+u_light.x*.34;
 float elevation=u_lightHeight+u_light.y*.2;
 vec3 light=normalize(vec3(sin(angle)*cos(elevation),cos(angle)*cos(elevation),sin(elevation)));
 vec3 halfVector=normalize(light+eye);
 float roughness=mix(180.,12.,u_frost);
 float glint=pow(max(dot(n,halfVector),0.),roughness);
 float softGlint=pow(max(dot(n,halfVector),0.),8.);
 vec3 reflection=environment(reflect(-eye,n));
 float reflectionWeight=clamp((.08+fresnel*.86)*u_reflection,0.,.95);
 vec3 color=mix(transmitted,reflection,reflectionWeight);
 float boundary=exp(-pow((abs(t)-.82)*18.,2.));
 color*=1.-boundary*.24*u_reflection*(1.-u_frost*.7);
 color+=vec3(1.,.985,.96)*(glint+softGlint*.12)*u_highlights*(1.-u_frost*.4);
 vec3 spectral=.5+.5*cos(vec3(0.,2.094,4.189)+t*7.+atan(n.y,n.x)*2.);
 float spectralEdge=pow(abs(t),5.)*(.3+.7*softGlint);
 color+=(spectral-.45)*spectralEdge*u_dispersion*.32;
 float innerLine=exp(-pow(inner/aa*.6,2.));
 color=mix(color,vec3(.46,.53,.59),innerLine*.2);
 color=clamp(color,0.,1.);
 if(inner<aa)color=mix(faceColor(p),color,smoothstep(-aa,aa,inner));
 gl_FragColor=vec4(color,coverage);
}`;

// Glass lines: every visible line as a round glass rod (a cylinder lying on the page).
// Each line arrives as TUBE_SAMPLES points (x, y, arc length) in CSS px, plus the drawn
// part as an arc-length range and an opacity. Per pixel: nearest point on any drawn line
// → distance across the rod gives the surface normal → refraction (the scene seen through
// the rod, flipped and split into colours), Fresnel reflection and a specular highlight.
export const TUBE_LINES = 4;
export const TUBE_SAMPLES = 16;
export const TUBE = `precision highp float;
#define MAXC ${TUBE_LINES}
#define N ${TUBE_SAMPLES}
varying vec2 v_uv;
uniform sampler2D u_background,u_screenBlur;
uniform vec2 u_viewport,u_light;
uniform vec4 u_box;            // output region in CSS px: x, y (from top), w, h
uniform float u_px;            // output pixels per CSS px
uniform vec3 u_p[MAXC*N];      // samples: x, y, arc length
uniform vec3 u_c[MAXC];        // per line: drawn from, drawn to (px), opacity
uniform float u_half;          // rod radius, px
uniform float u_refraction,u_dispersion,u_reflection,u_tintAmount,u_lightAngle;
uniform vec3 u_tint;

vec2 uvOf(vec2 p){return clamp(vec2(p.x/u_viewport.x,1.-p.y/u_viewport.y),.001,.999);}
vec3 environment(vec3 ray){
 float a=u_lightAngle;
 ray.xy=mat2(cos(a),-sin(a),sin(a),cos(a))*ray.xy;
 float broad=exp(-pow((ray.x+.46-u_light.x*.2)*4.,2.))*smoothstep(-.3,.25,ray.y);
 float strip=exp(-pow((ray.x-.67-u_light.x*.15)*18.,2.))*smoothstep(-.7,.1,ray.y);
 vec3 sky=mix(vec3(.15,.20,.25),vec3(.94,.97,1.),smoothstep(-.55,.7,ray.y));
 sky+=vec3(.8,.93,1.)*broad+vec3(1.,.91,.77)*strip*1.35;
 return sky;
}
void main(){
 vec2 p=u_box.xy+vec2(v_uv.x,1.-v_uv.y)*u_box.zw;
 float best=1e9;vec2 dir=vec2(0.,-1.);float op=0.;
 for(int c=0;c<MAXC;c++){
  vec3 cr=u_c[c];
  if(cr.z<.003)continue;
  for(int i=0;i<N-1;i++){
   vec3 a=u_p[c*N+i];vec3 b=u_p[c*N+i+1];
   vec2 ab=b.xy-a.xy;float L=max(length(ab),1e-4);
   float lo=clamp((cr.x-a.z)/L,0.,1.),hi=clamp((cr.y-a.z)/L,0.,1.);
   if(hi<=lo)continue;
   float t=clamp(dot(p-a.xy,ab)/(L*L),lo,hi);
   vec2 q=a.xy+ab*t;float d=length(p-q);
   if(d<best){best=d;dir=(p-q)/max(d,1e-4);op=cr.z;}
  }
 }
 float aa=.8/u_px;
 float cover=(1.-smoothstep(u_half-aa,u_half+aa,best))*op;
 if(cover<.002){gl_FragColor=vec4(0.);return;}

 // Across the rod: t = 0 on the axis, 1 at the edge. Cylinder normal (y up for lighting).
 float t=clamp(best/u_half,0.,.999);
 vec2 d2=vec2(dir.x,-dir.y);
 vec3 n=normalize(vec3(d2*t,sqrt(1.-t*t)));
 vec3 eye=vec3(0.,0.,1.);

 // Refraction: a rod flips what's behind it; stronger towards the edges.
 float bend=u_refraction*u_half*.55*t*(1.+t*t);
 vec2 off=-dir*bend;
 float ch=u_dispersion*.09;
 vec3 seen=vec3(texture2D(u_background,uvOf(p+off*(1.+ch))).r,
                texture2D(u_background,uvOf(p+off)).g,
                texture2D(u_background,uvOf(p+off*(1.-ch))).b);
 seen=mix(seen,texture2D(u_screenBlur,uvOf(p)).rgb,.25*t);
 seen=mix(seen,u_tint,u_tintAmount*(.5+.5*t));

 float fresnel=.04+.96*pow(1.-max(dot(n,eye),0.),5.);
 vec3 refl=environment(reflect(-eye,n));
 vec3 color=mix(seen,refl,clamp((.06+fresnel*.8)*u_reflection,0.,.9));
 vec3 L=normalize(vec3(cos(u_lightAngle+u_light.x*.34),sin(u_lightAngle+u_light.x*.34),.9));
 float spec=pow(max(dot(n,normalize(L+eye)),0.),90.);
 color+=vec3(1.,.985,.96)*(spec*1.1+pow(max(dot(n,normalize(L+eye)),0.),10.)*.08);
 vec3 spectral=.5+.5*cos(vec3(0.,2.094,4.189)+t*6.);
 color+=(spectral-.45)*pow(t,4.)*u_dispersion*.25;
 color*=1.-smoothstep(.8,1.,t)*.22;  // darker rim, so the rod reads against light backgrounds
 gl_FragColor=vec4(clamp(color,0.,1.),cover);
}`;
