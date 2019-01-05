'use strict';

const IMAGE_WIDTH = 1200/1;
const IMAGE_HEIGHT = 800/1;
const NUMBER_OF_SAMPLES = 500;

const CAMERA_APERTURE = 0.1;

console.log('hello world', { NUMBER_OF_SAMPLES, IMAGE_WIDTH, IMAGE_HEIGHT });
const startTs = Date.now();
c.fillStyle = '#0f0';
c.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

const image = c.getImageData(0, 0, a.width, a.height);

class HitableList {
  constructor() {
    this.entries = [];
  }

  add(entry) {
    this.entries.push(entry);
  }

  hit(ray, tmin, tmax) {
    let hitAnything = false;
    let closestSoFar = tmax;
    this.entries.forEach((entry) => {
      const result = entry.hit(ray, tmin, closestSoFar);
      if (result) {
        hitAnything = result;
        closestSoFar = result.t;
      }
    });
    return hitAnything;
  }
}

class Sphere {
  constructor(vec3Center, radius, material) {
    this.vec3Center = vec3Center;
    this.radius = radius;
    this.material = material;
  }

  hit(ray, tmin, tmax) {
    const oc = ray.origin.sub(this.vec3Center);
    const a = ray.direction.dot(ray.direction);
    const b = oc.dot(ray.direction);
    const c = oc.dot(oc) - this.radius * this.radius;
    const discriminant = b * b - a * c;
    if (discriminant > 0) {
      let temp = (-b - Math.sqrt(discriminant)) / a;
      if (temp < tmax && temp > tmin) {
        const p = ray.pointAtParameter(temp);
        //return hitRecord
        return {
          material: this.material,
          t: temp,
          p,
          normal: p
            .sub(this.vec3Center)
            .div(this.radius),
        }
      }
      temp = (-b + Math.sqrt(discriminant)) / a;
      if (temp < tmax && temp > tmin) {
        const p = ray.pointAtParameter(temp);
        //return hitRecord
        return {
          material: this.material,
          t: temp,
          p,
          normal: p
            .sub(this.vec3Center)
            .div(this.radius),
        }
      }
    }
    return false;
  }
}

class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static randomInUnitSphere() {
    const vec1 = new Vec3(1, 1, 1);
    let p;
    do {
      p = new Vec3(Math.random(), Math.random(), Math.random())
        .mul(2)
        .sub(vec1);
    } while (p.squaredLength() >= 1);
    return p;
  }

  static randomInUnitDisk() {
    const vec1 = new Vec3(1, 1, 0);
    let p;
    do {
      p = new Vec3(Math.random(), Math.random(), 0)
        .mul(2)
        .sub(vec1);
    } while (p.dot(p) >= 1);
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
    const k = 1 / t;
    return new Vec3(
      this.x * k,
      this.y * k,
      this.z * k
    );
  }
  cross(vec3) {
    const ax = this.x, ay = this.y, az = this.z,
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

  unitVector() {
    return this.div(this.length());
  }
}

class Ray {
  constructor(vec3Origin, vec3Direction) {
    this.origin = vec3Origin;
    this.direction = vec3Direction;
  }

  origin() {
    return this.origin;
  }

  direction() {
    return this.direction;
  }

  pointAtParameter(t) {
    const directionT = this.direction.mul(t);
    return this.origin.add(directionT);
  }

}

class Camera {

  constructor(vec3LookFrom, vec3Lookat, vec3Vup, vfov, aspect, aperture, focusDist) {
    const theta = vfov * Math.PI / 180;
    const halfHeight = Math.tan(theta / 2);
    const halfWidth = aspect * halfHeight;
    this.lensRadius = aperture / 2;
    this.w = vec3LookFrom.sub(vec3Lookat).unitVector();
    this.u = vec3Vup.cross(this.w).unitVector();
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
    // appl defocus blur
    const rd = Vec3.randomInUnitDisk().mul(this.lensRadius);
    const offset = this.u
      .mul(rd.x)
      .add(this.v.mul(rd.y))
    const vecDirection = this.lowerLeftCorner
      .add(this.horizontal.mul(s))
      .add(this.vertical.mul(t))
      .sub(this.origin)
      .sub(offset);
    return new Ray(this.origin.add(offset), vecDirection);
  }
}

class Metal {
  constructor(vec3Albedo, fuzziness) {
    this.albedo = vec3Albedo;
    this.fuzziness = 1;
    if (fuzziness < 1) {
      this.fuzziness = fuzziness;
    }
  }

  _reflect(vec3V, vec3N) {
    const dot = 2 * vec3V
      .dot(vec3N);
    return vec3V.sub(vec3N.mul(dot));
  }

  scatter(rayIn, hitRecord) {
    const reflected = this._reflect(rayIn.direction.unitVector(), hitRecord.normal);
    const randomFuzzyness = Vec3.randomInUnitSphere().mul(this.fuzziness);

    const scattered = new Ray(hitRecord.p, reflected.add(randomFuzzyness));
    return {
      scattered,
      attenuation: this.albedo,
    }
  }
}

class Lambertian {
  constructor(vec3Albedo) {
    this.albedo = vec3Albedo;
  }

  scatter(rayIn, hitRecord) {
    const target = hitRecord.p
      .add(hitRecord.normal)
      .add(Vec3.randomInUnitSphere());

    const scattered = new Ray(hitRecord.p, target.sub(hitRecord.p));
    return {
      scattered,
      attenuation: this.albedo,
    }
  }

}

class Dielectric {
  constructor(ri) {
    this.ri = ri;
    // glass absorb nothing
    this.attenuation = new Vec3(1, 1, 1);
  }

  _reflect(vec3V, vec3N) {
    const dot = 2 * vec3V
      .dot(vec3N);
    return vec3V.sub(vec3N.mul(dot));
  }

  _schlick(cosine, refIndex) {
    const r0 = (1 - refIndex) / (1 + refIndex);
    const r1 = r0 * r0;
    return r1 + (1 - r1) * Math.pow((1 - cosine), 5);
  }

  _refract(vec3V, vec3N, niOverNt) {
    const uv = vec3V.unitVector();
    const dt = uv.dot(vec3N);
    const discriminant = 1 - niOverNt * niOverNt * (1 - dt * dt);
    if (discriminant > 0) {
      const nMulDt = vec3N.mul(dt);
      const uvSub = uv.sub(nMulDt);
      return uvSub
        .mul(niOverNt)
        .sub(vec3N.mul(Math.sqrt(discriminant)));
    }
  }

  scatter(rayIn, hitRecord) {
    let outwardNormal;
    let niOverNt;
    let cosine;
    let reflectProb;
    const rayDot = rayIn.direction.dot(hitRecord.normal);
    if (rayDot > 0) {
      outwardNormal = hitRecord.normal.neg();
      niOverNt = this.ri;
      cosine = this.ri * rayDot / rayIn.direction.length();
    } else {
      outwardNormal = hitRecord.normal
      niOverNt = 1 / this.ri;
      cosine = -rayDot / rayIn.direction.length();
    }

    let scattered;
    const reflected = this._reflect(rayIn.direction, hitRecord.normal);
    const refracted = this._refract(rayIn.direction, outwardNormal, niOverNt);
    if (refracted) {
      //scattered = new Ray(hitRecord.p, refracted);
      reflectProb = this._schlick(cosine, this.ri);
    } else {
      scattered = new Ray(hitRecord.p, reflected);
      reflectProb = 1;
    }

    if (Math.random() < reflectProb) {
      scattered = new Ray(hitRecord.p, reflected);
    } else {
      scattered = new Ray(hitRecord.p, refracted);
    }

    return {
      scattered,
      attenuation: this.attenuation,
    }
  }

}


const colorWhite = new Vec3(1, 1, 1);
const colorBlue = new Vec3(0.5, 0.7, 1);

function color(ray, hitableList, depth) {
  const hitVec = hitableList.hit(ray, 0.001, Number.MAX_VALUE);
  if (hitVec) {
    //hit, draw sphere
    const material = hitVec.material.scatter(ray, hitVec);
    if (depth < 50 && material) {
      return material.attenuation
        .mulVec(color(material.scattered, hitableList, depth + 1));
    }
    return new Vec3(0, 0, 0);
  }
  //ray not hit, draw background
  const unitDirection = ray.direction.unitVector();
  const t = 0.5 * (unitDirection.y + 1);
  const blue = colorBlue.mul(t);
  const whiteMul = colorWhite.mul(1 - t);
  return whiteMul.add(blue);
}

function cloudColor() {
  return new Vec3(
    0.6 + Math.random() * 0.1,
    0.6 + Math.random() * 0.1,
    0.6 + Math.random() * 0.2
  );
}
function makeCloudScene() {
  const hitableList = new HitableList();

  hitableList.add(
    new Sphere(
      new Vec3(8, 0, -20), 15,
      new Metal(cloudColor(), 0.1)
      //new Lambertian(cloudColor())
    )
  );

  const SPREADX = 6;
  const SPREADY = 4;

  for (let a = 0; a < 40; a++) {
    hitableList.add(
      new Sphere(
        new Vec3(Math.random()*SPREADX, Math.random()*SPREADY, -4 - Math.random() / 4),
        0.3 + Math.random() * 0.2,
        a < 12 ?
          new Lambertian(cloudColor()) :
          new Metal(cloudColor(), 0.5 * Math.random())
      )
    );
  }

  hitableList.add(
    new Sphere(
      new Vec3(Math.random() * 1000, Math.random() * 1000, 1000),
      500,
      new Metal(new Vec3(1, 0, 0), 0.2)
      )
  );
  hitableList.add(
    new Sphere(
      new Vec3(Math.random() * 800  , Math.random() * 800, 800),
      400,
      new Metal(new Vec3(0.9, 0.2, 0.2), 0.1)
      )
  );

  hitableList.add(
    new Sphere(
      new Vec3(Math.random() * SPREADX, Math.random() * SPREADY, -4 - Math.random() / 4),
      0.5 + Math.random() * 0.2,
      new Metal(new Vec3(1, 1, 1), 0.3 * Math.random())
    )
  );
  hitableList.add(
    new Sphere(
      new Vec3(Math.random() * SPREADX, Math.random() * SPREADY, -4 - Math.random() / 4),
      0.5 + Math.random() * 0.2,
      new Metal(new Vec3(1, 1, 1), 0.3 * Math.random())
    )
  );

  return hitableList;
}

const CAMERA_LOOK_FROM = new Vec3(-6, -4, 10);
const CAMERA_LOOK_AT = new Vec3(0, 0, 0);
const CAMERA_LOOK_UP = new Vec3(0, 1, 0);
const CAMERA_DISTANCE_TO_FOCUS = 18;//CAMERA_LOOK_FROM.sub(CAMERA_LOOK_AT).length();
console.log('CAMERA_DISTANCE_TO_FOCUS',CAMERA_DISTANCE_TO_FOCUS)
const CAMERA_VERTICAL_FIELD_OF_VIEW = 16;

const camera = new Camera(
  CAMERA_LOOK_FROM,
  CAMERA_LOOK_AT,
  CAMERA_LOOK_UP,
  CAMERA_VERTICAL_FIELD_OF_VIEW,
  IMAGE_WIDTH / IMAGE_HEIGHT,
  CAMERA_APERTURE,
  CAMERA_DISTANCE_TO_FOCUS
);


//const hitableList = makeScene();
const hitableList = makeCloudScene();

let offset = 0;
for (let j = IMAGE_HEIGHT - 1; j >= 0; j--) {
  for (let i = 0; i < IMAGE_WIDTH; i++) {
    let col = new Vec3(0, 0, 0);

    for (let a = 0; a < NUMBER_OF_SAMPLES; a++) {
      const u = (i + Math.random()) / IMAGE_WIDTH;
      const v = (j + Math.random()) / IMAGE_HEIGHT;
      const ray = camera.getRay(u, v);
      col = col.add(color(ray, hitableList, 0));
    }

    col = col.div(NUMBER_OF_SAMPLES);

    // gamma correction
    col = new Vec3(
      Math.sqrt(col.x),
      Math.sqrt(col.y),
      Math.sqrt(col.z),
    );

    image.data[offset    ] = 255.99 * col.x;
    image.data[offset + 1] = 255.99 * col.y;
    image.data[offset + 2] = 255.99 * col.z;
    image.data[offset + 3] = 255;

    offset += 4;
  }
  offset += 4 * (a.width - IMAGE_WIDTH);
}
c.putImageData(image, 0, 0);
console.log('done, duration in ms:', Date.now() - startTs);
