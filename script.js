const canvas = document.querySelector("#canvas");
const recognize = document.querySelector("#recognize");
const clear = document.querySelector("#clear");
const train = document.querySelector("#train");
const negative = document.querySelector("#negative");
const positive = document.querySelector("#positive");
const rez = document.querySelector("#rez");
const iteration = document.querySelector("#iteration");
const activation = document.querySelector("#activation");
const lRate = document.querySelector("#lRate");
const momentum = document.querySelector("#momentum");

function calculateContext(elem) {
  const ctx = elem.getContext("2d");
  const pixel = 20;

  let isMouseDown = false;

  elem.width = 500;
  elem.height = 500;

  const drawLine = (x1, y1, x2, y2, color = "grey") => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const drawCell = (x, y, w, h) => {
    ctx.fillStyle = "grey";
    ctx.strokeStyle = "grey";
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.rect(x, y, w, h);
    ctx.fill();
  };

  this.clear = () => {
    ctx.clearRect(0, 0, elem.width, elem.height);
  };

  const drawGrid = () => {
    const n = elem.width;

    for (let i = 0; i < n; i += 20) {
      drawLine(i, 0, i, n);
      drawLine(0, i, n, i);
    }
  };

  this.calculate = (draw = false) => {
    const n = elem.width;

    const vector = [];
    let _draw = [];

    for (let i = 0; i < n; i += 20) {
      for (let j = 0; j < n; j += 20) {
        const data = ctx.getImageData(i, j, 20, 20);

        let emptyPixel = 0;

        for (let k = 0; k < data.data.length; k += 10) {
          const isElement = data.data[k] === 0;

          if (!isElement) {
            emptyPixel += 1;
          }
        }

        if (emptyPixel > 1 && draw) {
          _draw.push([i, j, 20, 20]);
        }

        vector.push(emptyPixel > 1 ? 1 : 0);
      }
    }

    if (draw) {
      this.clear();
      drawGrid();

      for (let i = 0; i < _draw.length; i++) {
        drawCell(_draw[i][0], _draw[i][1], _draw[i][2], _draw[i][3]);
      }
    }
    return vector;
  };

  elem.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    ctx.beginPath();
  });

  elem.addEventListener("mouseup", (e) => {
    isMouseDown = false;
  });

  elem.addEventListener("mousemove", (e) => {
    if (isMouseDown) {
      ctx.fillStyle = "rgba(81, 39, 163, 1)";
      ctx.strokeStyle = "rgba(81, 39, 163, 1)";
      ctx.lineWidth = pixel;

      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(e.offsetX, e.offsetY, pixel / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    }
  });
}
let vector = [];
let net = null;
let train_data = [];
let isPositive = true;

const main = new calculateContext(canvas);

negative.addEventListener("click", () => {
  isPositive = false;
});

positive.addEventListener("click", () => {
  isPositive = true;
});

clear.addEventListener("click", (e) => {
  main.clear();
});

train.addEventListener("click", () => {
  vector = main.calculate(true);

  if (isPositive) {
    train_data.push({
      input: vector,
      output: { positive: 1 },
    });
  } else {
    train_data.push({
      input: vector,
      output: { negative: 1 },
    });
  }
});

recognize.addEventListener("click", () => {
  net = new brain.NeuralNetwork();
  net.train(train_data, { log: true });

  const result = brain.likely(main.calculate(), net);
  rez.innerHTML = result;

  iteration.innerHTML = net.trainOpts.callbackPeriod;
  lRate.innerHTML = net.trainOpts.learningRate;
  activation.innerHTML = net.activation;
  momentum.innerHTML = net.trainOpts.momentum;
  console.log(net);
});
