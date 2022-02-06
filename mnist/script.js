const w = 200;
const h = 200;
const penSize = 16;
let canvas28x28 = null;
let resultP = null;
let model = null;

async function setup() {
  pixelDensity(1);
  createCanvas(w, h);
  resetCanvas();
  createButton("Очистить").mousePressed(resetCanvas);
  resultP = createP("");
  canvas28x28 = createGraphics(28, 28);
  model = await tf.loadLayersModel('./modelb4096e64.json');
}

function draw() {
  if (mouseIsPressed) {
    stroke(255, 255, 255);
    fill(255, 255, 255);
    strokeWeight(penSize);
    line(draw.lastX, draw.lastY, mouseX, mouseY);

    canvas28x28.background(0, 0, 0);
    canvas28x28.image(get(), 0, 0, 28, 28);
    canvas28x28.loadPixels();
    let img = canvas28x28.pixels.filter((el, ind) => ind % 4 === 0);
    let labels = model.predict(tf.tensor(img, [1, 28, 28, 1])).dataSync();
    resultP.html("Предположительно, " + labels.indexOf(Math.max(...labels)));
  }
  draw.lastX = mouseX;
  draw.lastY = mouseY;
}

function mousePressed() {
  draw.lastX = mouseX;
  draw.lastY = mouseY;
}

function resetCanvas() {
  background(0, 0, 0);
}
