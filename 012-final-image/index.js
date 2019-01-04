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

function makeScene() {
  const hitableList = new HitableList();

  hitableList.add(
    new Sphere(
      new Vec3(0, -1000, 0), 1000, new Lambertian(new Vec3(0.5, 0.5, 0.5))
    )
  );

  const centerSub = new Vec3(4, 0.2, 0);
  for (let a = -11; a < 11; a++) {
    for (let b = -11; b < 11; b++) {
      const material = Math.random();
      const center = new Vec3(a + 0.9 * Math.random(), 0.2, b + 0.9 * Math.random());

      if (center.sub(centerSub).length() > 0.9) {
        if (material < 0.8) {
          //diffuse
          hitableList.add(
            new Sphere(
              center, 0.2, new Lambertian(new Vec3(Math.random() * Math.random(), Math.random() * Math.random(), Math.random() * Math.random()))
            )
          );

        } else if (material < 0.95) {
          // metal
          hitableList.add(
            new Sphere(
              center, 0.2, new Metal(new Vec3(0.5 * (1 + Math.random()), 0.5 * (1 + Math.random()), 0.5 * (1 + Math.random())), 0.5 * Math.random())
            )
          );

        } else {
          //glass
          hitableList.add(
            new Sphere(
              center, 0.2, new Dielectric(1.5)
            )
          );
        }

      }
    }
  }

  hitableList.add(
    new Sphere(
      new Vec3(0, 1, 0), 1, new Dielectric(1.5)
      )
  );
  hitableList.add(
    new Sphere(
      new Vec3(-4, 1, 0), 1, new Lambertian(new Vec3(0.4, 0.2, 0.1))
    )
  );
  hitableList.add(
    new Sphere(
      new Vec3(4, 1, 0), 1, new Metal(new Vec3(0.7, 0.6, 0.5), 0.0)
    )
  );

  return hitableList;
}

const nx = 1200/1;
const ny = 800/1;
const ns = 150;
let offset = 0;

const hitableList = makeScene();

const lookFrom = new Vec3(13, 2, 3);
const lookAt = new Vec3(0, 0, 0);
const aperture = 0.1;
const distToFocus = 10;//lookFrom.sub(lookAt).length();
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
