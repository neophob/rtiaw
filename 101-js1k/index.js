var IMAGE_WIDTH = 800;
var IMAGE_HEIGHT = 600;

function Sphere(vec3Center, radius, material) {
  return {
    hit: (ray, tmin, tmax) => {
      var oc = ray.o.sub(vec3Center);
      var a = ray.d.dot(ray.d);
      var b = oc.dot(ray.d);
      var c = oc.dot(oc) - radius * radius;
      var discriminant = b * b - a * c;
      if (discriminant > 0) {
        var temp = (-b - Math.sqrt(discriminant)) / a;
        if (temp < tmax && temp > tmin) {
          var p = ray.p(temp);
          //return hitRecord
          return {
            material,
            t: temp,
            p,
            normal: p
              .sub(vec3Center)
              .div(radius),
          }
        }
        temp = (-b + Math.sqrt(discriminant)) / a;
        if (temp < tmax && temp > tmin) {
          var p = ray.p(temp);
          //return hitRecord
          return {
            material,
            t: temp,
            p,
            normal: p
              .sub(vec3Center)
              .div(radius),
          }
        }
      }

    }
  }
}

class Vec3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static rand() {
    var p;
    do {
      //TODO: could be "Math.random() * 2 - 1" - but output is larger
      p = new Vec3(Math.random() * 2, Math.random() * 2, Math.random() * 2)
        .sub(new Vec3(1, 1, 1));
    } while (p.squaredLength() >= 1);
    return p;
  }

  mul(t) {
    return new Vec3(
      this.x * t,
      this.y * t,
      this.z * t
    );
  }

  mulVec(vec3) {
    return new Vec3(
      this.x * vec3.x,
      this.y * vec3.y,
      this.z * vec3.z
    );
  }

  add(vec3) {
    return new Vec3(
      this.x + vec3.x,
      this.y + vec3.y,
      this.z + vec3.z
    );
  }

  neg() {
    return new Vec3(
      -this.x,
      -this.y,
      -this.z
    );
  }

  sub(vec3) {
    return new Vec3(
      this.x - vec3.x,
      this.y - vec3.y,
      this.z - vec3.z
    );
  }

  dot(vec3) {
    return this.x * vec3.x +
      this.y * vec3.y +
      this.z * vec3.z;
  }

  div(t) {
    return new Vec3(
      this.x / t,
      this.y / t,
      this.z / t
    );
  }
  cross(vec3) {
    return new Vec3(
      this.y * vec3.z - this.z * vec3.y,
      this.z * vec3.x - this.x * vec3.z,
      this.x * vec3.y - this.y * vec3.x
    );
  }

  length() {
    return Math.sqrt(
      this.squaredLength()
    );
  }

  squaredLength() {
    return this.x * this.x +
      this.y * this.y +
      this.z * this.z;
  }

  uv() {
    return this.div(this.length());
  }
}

function Ray(o, d) {
  return {
    o,  //origin
    d,  //destination
    p: (t) => { //pointAtParameter
      return o.add(d.mul(t));
    }
  }
}

var SPREADX = 6;
var SPREADY = 4;

var image = c.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
var vecZero = new Vec3(0, 0, 0);
var CAMERA_APERTURE = 0.1;
var CAMERA_LOOK_FROM = new Vec3(0, 0, 10);
//var CAMERA_LOOK_FROM = new Vec3(-SPREADX, -SPREADY, 10);
var CAMERA_LOOK_AT = vecZero;
var CAMERA_LOOK_UP = new Vec3(0, 1, 0);
var CAMERA_DISTANCE_TO_FOCUS = 18;
var CAMERA_VERTICAL_FIELD_OF_VIEW = 16;

var halfHeight = Math.tan(CAMERA_VERTICAL_FIELD_OF_VIEW * Math.PI / 360);
var halfWidth = IMAGE_WIDTH / IMAGE_HEIGHT * halfHeight;
var w = CAMERA_LOOK_FROM.sub(CAMERA_LOOK_AT).uv();
var u = CAMERA_LOOK_UP.cross(w).uv();
var v = w.cross(u);
var origin = CAMERA_LOOK_FROM;
var lowerLeftCorner = CAMERA_LOOK_FROM
  .sub(u.mul(halfWidth * CAMERA_DISTANCE_TO_FOCUS))
  .sub(v.mul(halfHeight * CAMERA_DISTANCE_TO_FOCUS))
  .sub(w.mul(CAMERA_DISTANCE_TO_FOCUS));
var horizontal = u.mul(2 * halfWidth * CAMERA_DISTANCE_TO_FOCUS);
var vertical = v.mul(2 * halfHeight * CAMERA_DISTANCE_TO_FOCUS);


function getRay(s, t) {
  // apply defocus blur
  var rd;
  do {
    rd = new Vec3(Math.random(), Math.random(), 0)
      .mul(2)
      .sub(new Vec3(1, 1, 0));
  } while (rd.dot(rd) >= 1);

  rd = rd.mul(CAMERA_APERTURE / 2);
  var offset = u
    .mul(rd.x)
    .add(v.mul(rd.y))
  var vecDirection = lowerLeftCorner
    .add(horizontal.mul(s))
    .add(vertical.mul(t))
    .sub(origin)
    .sub(offset);
  return Ray(origin.add(offset), vecDirection);
}


function Metal(a, f) {
  return {
    scatter: (rayIn, hitRecord) => {
      var reflected = rayIn.d.uv().sub(hitRecord.normal.mul(2 * rayIn.d.uv().dot(hitRecord.normal)));
      return {
        s: Ray(hitRecord.p, reflected
            .add(Vec3.rand().mul(f))),
          //randomFuzzyness
        a,
      }
    }
  }
}

function Lambertian(a) {
  return {
    scatter: (rayIn, hitRecord) => {
        var target = hitRecord.p
        .add(hitRecord.normal)
        .add(Vec3.rand());

      return {
        s: Ray(hitRecord.p, target.sub(hitRecord.p)),
        a,
      }
    }
  }
}

function color(ray, depth) {
  var hitVec;
  var closestSoFar = 1e308;
  world.forEach((entry) => {
    var result = entry.hit(ray, 0.001, closestSoFar);
    if (result) {
      hitVec = result;
      closestSoFar = result.t;
    }
  });

  if (hitVec) {
    //hit, draw sphere
    var material = hitVec.material.scatter(ray, hitVec);
    if (depth < 50 && material) {
      return material.a
        .mulVec(color(material.s, depth + 1));
    }
    return vecZero;
  }
  //ray not hit, draw background
  var t = 0.5 * (ray.d.uv().y + 1);
  return new Vec3(1, 1, 1)
    .mul(1 - t)
    .add(new Vec3(0.7, 0.7, 1)
    .mul(t));
}

function cloudColor() {
  return new Vec3(
    0.6 + Math.random() * 0.1,
    0.6 + Math.random() * 0.1,
    0.6 + Math.random() * 0.2
  );
}

//BUILD SCENE

var world = [
  //background
  Sphere(
    new Vec3(8, 0, -20), 15,
    Metal(cloudColor(), 0.05)
  ),
/*
  //white blobs
  Sphere(
    new Vec3(Math.random() * SPREADX, Math.random() * SPREADY, -4 - Math.random() / 4),
    0.5 + Math.random() * 0.2,
    Metal(new Vec3(1, 1, 1), 0.3 * Math.random())
  ),
  new Sphere(
    new Vec3(Math.random() * SPREADX, Math.random() * SPREADY, -4 - Math.random() / 4),
    0.5 + Math.random() * 0.2,
    Metal(new Vec3(1, 1, 1), 0.3 * Math.random())
  ),

  //reflected red blobs
  Sphere(
    new Vec3(Math.random() * 1000, Math.random() * 1000, 1000),
    500,
    Metal(new Vec3(1, 0, 0), 0.2)
  ),

  Sphere(
    new Vec3(Math.random() * 800, Math.random() * 800, 800),
    400,
    Metal(new Vec3(1, 0, 0), 0.1)
  ),*/
];

for (var z = 0; z < 80; z++) {
  world.push(
    Sphere(
      new Vec3(Math.random() * SPREADX, Math.random() * SPREADY, -4 + Math.random() * 8),
      0.3 + Math.random() * 0.2,
      z < 12 ?
        Lambertian(new Vec3(1, 0, 0)) :
        Metal(cloudColor(), 0.3 * Math.random())
    )
  );
}

// BUILD SCENE END

var offset = 0;
var y = 0;
var nrOfSamples = 1;

setInterval(() => {
  for (var a = 0; a < IMAGE_WIDTH * 8; a++) {
    var i = offset % IMAGE_WIDTH;
    var j = y;
    var col = vecZero;

    for (let y = 0; y < nrOfSamples; y++) {
      col = col.add(color(getRay(
        i / IMAGE_WIDTH,
        j / IMAGE_HEIGHT
      ), 0));
    }

    // gamma correction
    image.data[4*offset    ] = 255 * Math.sqrt(col.x / nrOfSamples);
    image.data[4*offset + 1] = 255 * Math.sqrt(col.y / nrOfSamples);
    image.data[4*offset + 2] = 255 * Math.sqrt(col.z / nrOfSamples);
    image.data[4*offset + 3] = 255;

    if (offset % IMAGE_WIDTH === 0) {
      y++;
    }

    if (offset++ > IMAGE_WIDTH * (IMAGE_HEIGHT-1)) {
      nrOfSamples *= 2;
      offset = 0;
      y = 0;
    }
  }

  c.putImageData(image, 0, 0);
}, 0);

