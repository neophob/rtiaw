'use strict';

console.log('hello world');

c.fillStyle = '#000';
c.fillRect(0, 0, 800, 600);

const nx = 200;
const ny = 100;
let offset = 0;

const image = c.getImageData(0, 0, a.width, a.height);

for (let j = ny - 1; j >= 0; j--) {
  for (let i = 0; i < nx; i++) {
    const col = new Vec3(i / nx, j / ny, 0.2);

    image.data[offset    ] = 255.99 * col.x;
    image.data[offset + 1] = 255.99 * col.y;
    image.data[offset + 2] = 255.99 * col.z;
    image.data[offset + 3] = 255;

    offset += 4;
  }
  offset += 4 * (a.width - nx);
}
c.putImageData(image, 0, 0);
console.log('done');
