'use strict';

console.log('hello world');
const startTs = Date.now();

c.fillStyle = '#0f0';
c.fillRect(0, 0, 800, 600);


const image = c.getImageData(0, 0, a.width, a.height);

const colorWhite = new Vec3(1, 1, 1);
const colorBlue = new Vec3(0.5, 0.7, 1);
const colorIntense = new Vec3(1, 1, 1);

function color(ray, hitableList) {
  const hitVec = hitableList.hit(ray, 0.0, Number.MAX_SAFE_INTEGER);
  if (hitVec) {
    return colorIntense.add(hitVec.normal)
      .mul(0.5);
  }

  const unitDirection = ray.direction.unitVector();
  const t = 0.5 * (unitDirection.y + 1);
  const blue = colorBlue.mul(t);
  const whiteMul = colorWhite.mul(1 - t);
  return whiteMul.add(blue);
}

const nx = 800;
const ny = 400;
let offset = 0;

const lowerLeftCorner = new Vec3(-2, -1, -1);
const horizontal = new Vec3(4, 0, 0);
const vertical = new Vec3(0, 2, 0);
const origin = new Vec3(0, 0, 0);

const hitableList = new HitableList();
hitableList.add(new Sphere(new Vec3(0, 0, -1), 0.5));
hitableList.add(new Sphere(new Vec3(0, -100.5, -1), 100));

for (let j = ny - 1; j >= 0; j--) {
  for (let i = 0; i < nx; i++) {
    const u = i / nx;
    const v = j / ny;

    const vecU = horizontal.mul(u);
    const vecV = vertical.mul(v);
    const vecUV = vecU.add(vecV);
    const vecDirection = lowerLeftCorner.add(vecUV);

    const ray = new Ray(origin, vecDirection);
    const p = ray.pointAtParameter(2.0);
    const col = color(ray, hitableList);

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
