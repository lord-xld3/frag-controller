#version 300 es
    #define F gl_FragCoord.xy
    precision highp float;
    out vec3 o;
    
    uniform z {
        vec2 iMouse, iResolution;
        float iTime, iZoom;
        
        uvec2 iter;
        vec2 esc, delta;      
        vec3 hue;
        float scale;
    };
    
    void main() {
        float s = iTime*.0005,
			ct = cos(s),
			st = sin(s),
            g = exp(iZoom),
            m = iZoom/12.,
            e = esc.y-esc.x*m + esc.x;

        vec2 z = (F+F - iResolution.xy) / (g*iResolution.y) + delta,
            c = z;
        int h = int(float(iter.y-iter.x)*m + float(iter.x)), i = 0;

		
        for (; i < h && z.x*z.x < e; z = mat2(z, -z.y, z.x)*z + c, i++);
		vec2 rz = mat2(ct, st, -st, ct)*z;
        o = i < h ? vec3(.5+.5*cos(
        	hue - s + scale*(m*float(i) - log2(log2(abs(rz.x*rz.y) / log2(e)))))
           ) 
        : vec3(0);
    }