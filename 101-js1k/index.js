var IMAGE_WIDTH = 800;
var IMAGE_HEIGHT = 600;
var NUMBER_OF_SAMPLES = 10;
var CAMERA_APERTURE = 0.1;

var image = c.getImageData(0, 0, a.width, a.height);

class HitableList {
  constructor() {
    this.e = [];
  }

  add(entry) {
    this.e.push(entry);
  }

  hit(ray, tmin, tmax) {
    var hitAnything = false;
    var closestSoFar = tmax;
    this.e.forEach((entry) => {
      var result = entry.hit(ray, tmin, closestSoFar);
      if (result) {
        hitAnything = result;
        closestSoFar = result.t;
      }
    });
    return hitAnything;
  }
}

function Sphere(vec3Center, radius, material) {
  return {
    hit: (ray, tmin, tmax) => {
      var oc = ray.origin.sub(vec3Center);
      var a = ray.direction.dot(ray.direction);
      var b = oc.dot(ray.direction);
      var c = oc.dot(oc) - radius * radius;
      var discriminant = b * b - a * c;
      if (discriminant > 0) {
        var temp = (-b - Math.sqrt(discriminant)) / a;
        if (temp < tmax && temp > tmin) {
          var p = ray.pointAtParameter(temp);
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
          var p = ray.pointAtParameter(temp);
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
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static rand() {
    var vec1 = new Vec3(1, 1, 1);
    var p;
    do {
      p = new Vec3(Math.random(), Math.random(), Math.random())
        .mul(2)
        .sub(vec1);
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

  neg(vec3) {
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
    var k = 1 / t;
    return new Vec3(
      this.x * k,
      this.y * k,
      this.z * k
    );
  }
  cross(vec3) {
    var ax = this.x, ay = this.y, az = this.z,
          bx = vec3.x, by = vec3.y, bz = vec3.z;
    return new Vec3(
      ay * bz - az * by,
      az * bx - ax * bz,
      ax * by - ay * bx
    );
  }

  length() {
    return Math.sqrt(
      this.x * this.x +
      this.y * this.y +
      this.z * this.z
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

function Ray(origin, direction) {
  return {
    origin,
    direction,
    pointAtParameter: (t) => {
      return origin.add(direction.mul(t));
    }
  }
}

class Camera {

  constructor(vec3LookFrom, vec3Lookat, vec3Vup, vfov, aspect, aperture, focusDist) {
    var halfHeight = Math.tan(vfov * Math.PI / 180 / 2);
    var halfWidth = aspect * halfHeight;
    this.r = aperture / 2;
    this.w = vec3LookFrom.sub(vec3Lookat).uv();
    this.u = vec3Vup.cross(this.w).uv();
    this.v = this.w.cross(this.u);
    this.origin = vec3LookFrom;
    this.lowerLeftCorner = vec3LookFrom
      .sub(this.u.mul(halfWidth * focusDist))
      .sub(this.v.mul(halfHeight * focusDist))
      .sub(this.w.mul(focusDist));
    this.horizontal = this.u.mul(2 * halfWidth * focusDist);
    this.vertical = this.v.mul(2 * halfHeight * focusDist);
  }

  getRay(s, t) {
    // apply defocus blur
    var rd;
    do {
      rd = new Vec3(Math.random(), Math.random(), 0)
        .mul(2)
        .sub(new Vec3(1, 1, 0));
    } while (rd.dot(rd) >= 1);

    rd = rd.mul(this.r);
    var offset = this.u
      .mul(rd.x)
      .add(this.v.mul(rd.y))
    var vecDirection = this.lowerLeftCorner
      .add(this.horizontal.mul(s))
      .add(this.vertical.mul(t))
      .sub(this.origin)
      .sub(offset);
    return Ray(this.origin.add(offset), vecDirection);
  }
}

function Metal(a, f) {
  return {
    scatter: (rayIn, hitRecord) => {
      var reflected = rayIn.direction.uv().sub(hitRecord.normal.mul(2 * rayIn.direction.uv().dot(hitRecord.normal)));
      var s = Ray(hitRecord.p, reflected.add(
        //randomFuzzyness
        Vec3.rand().mul(f)
      ));
      return { s, a }
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

var vecZero = new Vec3(0, 0, 0);

function color(ray, hitableList, depth) {
  var hitVec = hitableList.hit(ray, 0.001, Number.MAX_VALUE);
  if (hitVec) {
    //hit, draw sphere
    var material = hitVec.material.scatter(ray, hitVec);
    if (depth < 50 && material) {
      return material.a
        .mulVec(color(material.s, hitableList, depth + 1));
    }
    return vecZero;
  }
  //ray not hit, draw background
  var t = 0.5 * (ray.direction.uv().y + 1);
  return new Vec3(1, 1, 1).mul(1 - t).add(new Vec3(0.5, 0.7, 1).mul(t));
}

function cloudColor() {
  return new Vec3(
    0.6 + Math.random() * 0.1,
    0.6 + Math.random() * 0.1,
    0.6 + Math.random() * 0.2
  );
}

var CAMERA_LOOK_FROM = new Vec3(-6, -4, 10);
var CAMERA_LOOK_AT = vecZero;
var CAMERA_LOOK_UP = new Vec3(0, 1, 0);
var CAMERA_DISTANCE_TO_FOCUS=18;
var CAMERA_VERTICAL_FIELD_OF_VIEW = 16;

var camera = new Camera(
  CAMERA_LOOK_FROM,
  CAMERA_LOOK_AT,
  CAMERA_LOOK_UP,
  CAMERA_VERTICAL_FIELD_OF_VIEW,
  IMAGE_WIDTH / IMAGE_HEIGHT,
  CAMERA_APERTURE,
  CAMERA_DISTANCE_TO_FOCUS
);


//BUILD SCENE
var hitableList = new HitableList();
var SPREADX = 6;
var SPREADY = 4;
hitableList.add(
  Sphere(
    new Vec3(8, 0, -20), 15,
//    new Vec3(0, -1000, 0), 1000,
    Metal(cloudColor(), 0.05)
  )
);

for (var z = 0; z < 40; z++) {
  hitableList.add(
    Sphere(
      new Vec3(Math.random()*SPREADX, Math.random()*SPREADY, -4 - Math.random()/4),
      0.3 + Math.random() * 0.2,
      z < 8 ?
        Lambertian(new Vec3(1, 0, 0)) :
        Metal(cloudColor(), 0.5 * Math.random())
    )
  );
}

hitableList.add(
  Sphere(
    new Vec3(Math.random()*SPREADX, Math.random()*SPREADY, -4),
    0.5 + Math.random() * 0.4,
    Metal(new Vec3(1, 1, 1), 0.3 * Math.random())
  )
);
hitableList.add(
  Sphere(
    new Vec3(Math.random()*SPREADX, Math.random()*SPREADY, -3.5),
    0.5 + Math.random() * 0.2,
    Metal(new Vec3(1, 1, 1), 0.3 * Math.random())
  )
);/**/
// BUILD SCENE END

var offset = 0;
for (var j = IMAGE_HEIGHT - 1; j >= 0; j--) {
  for (var i = 0; i < IMAGE_WIDTH; i++) {
    var col = vecZero;

    for (var y = 0; y < NUMBER_OF_SAMPLES; y++) {
      col = col.add(color(camera.getRay(
        (i + Math.random()) / IMAGE_WIDTH,
        (j + Math.random()) / IMAGE_HEIGHT
      ), hitableList, 0));
    }

    // gamma correction
    image.data[offset    ] = 255 * Math.sqrt(col.x/NUMBER_OF_SAMPLES);
    image.data[offset + 1] = 255 * Math.sqrt(col.y/NUMBER_OF_SAMPLES);
    image.data[offset + 2] = 255 * Math.sqrt(col.z/NUMBER_OF_SAMPLES);
    image.data[offset + 3] = 255;
    offset += 4;
  }
  offset += 4 * (a.width - IMAGE_WIDTH);
}
c.putImageData(image, 0, 0);
