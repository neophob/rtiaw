'use strict';

console.log('hello world');
const startTs = Date.now();
c.fillStyle = '#0f0';
c.fillRect(0, 0, 800, 600);

const image = c.getImageData(0, 0, a.width, a.height);

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

const nx = 800/1;
const ny = 600/1;
const ns = 50;
let offset = 0;

const hitableList = new HitableList();
hitableList.add(
  new Sphere(
    new Vec3(0, 0, -1), 0.5, new Lambertian(new Vec3(0.1, 0.2, 0.5))
  )
);
hitableList.add(
  new Sphere(
    new Vec3(0, -100.5, -1), 100, new Lambertian(new Vec3(0.8, 0.8, 0.0))
  )
);
hitableList.add(
  new Sphere(
    new Vec3(1, 0, -1), 0.5, new Metal(new Vec3(0.8, 0.6, 0.2), 0.8)
  )
);
hitableList.add(
  new Sphere(
    new Vec3(-1, 0, -1), 0.5, new Dielectric(1.5)
  )
);
hitableList.add(
  new Sphere(
    new Vec3(-1, 0, -1), -0.45, new Dielectric(1.5)
  )
);

const lookFrom = new Vec3(3, 3, 2);
const lookAt = new Vec3(0, 0, -1);
const aperture = 1;
const distToFocus = lookFrom.sub(lookAt).length();
const camera = new Camera(
  lookFrom,
  lookAt,
  new Vec3(0, 1, 0),
  20,
  nx / ny,
  aperture,
  distToFocus
);

for (let j = ny - 1; j >= 0; j--) {
  for (let i = 0; i < nx; i++) {
    let col = new Vec3(0, 0, 0);

    for (let a = 0; a < ns; a++) {
      const u = (i + Math.random()) / nx;
      const v = (j + Math.random()) / ny;
      const ray = camera.getRay(u, v);
      col = col.add(color(ray, hitableList, 0));
    }

    col = col.div(ns);

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
  offset += 4 * (a.width - nx);
}
c.putImageData(image, 0, 0);
console.log('done, duration in ms:', Date.now() - startTs);
