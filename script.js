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

// основна функція
function calculateContext(elem) {
  // контекст малювання на полотні (у нашому випадку 2d)
  const ctx = elem.getContext("2d");

  // розмір однієї клітинки матриці ( 20 пікселів )
  const pixel = 20;

  let isMouseDown = false;

  // ширина та висова полотна
  elem.width = 500;
  elem.height = 500;

  // функція для малювання ліній для сітки
  const drawLine = (x1, y1, x2, y2, color = "grey") => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // функція для заповнення клітинок сітки
  const drawCell = (x, y, w, h) => {
    ctx.fillStyle = "grey";
    ctx.strokeStyle = "grey";
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.rect(x, y, w, h);
    ctx.fill();
  };

  // функція для очищення полотна
  this.clear = () => {
    ctx.clearRect(0, 0, elem.width, elem.height);
  };

  // функція для малювання сітки
  const drawGrid = () => {
    const n = elem.width;

    for (let i = 0; i < n; i += 20) {
      drawLine(i, 0, i, n);
      drawLine(0, i, n, i);
    }
  };

  // функція для обчислення (заповнена клітинка на сітці відповідає - 1, пуста клітинка - 0)
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

  // додаємо до canvas відповідні обробники подій, за допомогою який ми зможемо малювати на полотні
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

// викликаємо функцію calculateContext і додаємо як аргумент функції елемент canvas
const main = new calculateContext(canvas);

// додаємо до кнопки із ідентифікатором negative
// обробник події click який дозволяє оприділити перемінну isPositive як false
negative.addEventListener("click", () => {
  isPositive = false;
});

// додаємо до кнопки із ідентифікатором positive
// обробник події click який дозволяє оприділити перемінну isPositive як true
positive.addEventListener("click", () => {
  isPositive = true;
});

// додаємо до кнопки із ідентифікатором clear
// обробник подій click який за допомогою функції clear очищає полотно
clear.addEventListener("click", () => {
  main.clear();
});

// додаємо до кнопки із ідентифікатором train
// обробник події click який дозволяє навчити нейронну мережу
train.addEventListener("click", () => {
  // при кліку на кнопку з ідннтифікатором train виконується дана функція.
  // додаємо усі дані матриці у перемінну vector, що являється масивом
  // через викликану вункцію calculate
  vector = main.calculate(true);

  // в залежності від значення перемінної isPositive
  // виконується відповідний блок коду
  if (isPositive) {
    // якщо перемінна isPositive === true
    // в масив train_data, що являється основним масивом для навчання нейронної мережі,
    // ми додаємо об'єкт із входом input, який дорівнює масиву vector, який має усі дані
    // з матриці для навчання, та виходом output, який приймає об'єкт, якому ми вказуємо
    // який саме стан активний при певній вибірці даних (у даному випадку positive: 1, negative: 0, що означає
    // що дана вибірка даних для навчання належить для позитивного типу символу)
    train_data.push({
      input: vector,
      output: { positive: 1 },
    });
  } else {
    // якщо перемінна isPositive === false
    // в масив train_data, що являється основним масивом для навчання нейронної мережі,
    // ми додаємо об'єкт із входом input, який дорівнює масиву vector, який має усі дані
    // з матриці для навчання, та виходом output, який приймає об'єкт, якому ми вказуємо
    // який саме стан активний при певній вибірці даних (у даному випадку positive: 0, negative: 1, що означає
    // що дана вибірка даних для навчання належить для негативного типу символу)
    train_data.push({
      input: vector,
      output: { negative: 1 },
    });
  }
});

// додаємо до кнопки з ідентифікатором recognize обробник подій click
// що дозволяє розпізнавати намальований символ на полотні
// та виводити результат на панелі інформації
recognize.addEventListener("click", () => {
  // створюємо нейронну мережу через відповідний конструтор
  // та ініціальзуємо об'єкт з ключем hiddenLayers, якому присвоюємо значення як масив
  // із прихованими шарами нейронної мережі, де кожне число означає
  // кількість нейроннів прихованого шару
  net = new brain.NeuralNetwork({ hiddenLayers: [200, 100, 40] });
  // далі викликаємо метод train нашого створеного об'єкту net
  // який відповідає за навчання нейронної мережі і
  // додаємо в аргументах даного методу навчальну вибірку даних та об'єкт,
  // що дозволяє вивести додаткові дані у консоль
  net.train(train_data, { log: true });

  // отримуємо результат і прикріплюємо відповідні дані результату розпізнавання
  // до елементів інтерфейсу
  const result = brain.likely(main.calculate(), net);
  rez.innerHTML = result;

  iteration.innerHTML = net.trainOpts.callbackPeriod;
  lRate.innerHTML = net.trainOpts.learningRate;
  activation.innerHTML = net.activation;
  momentum.innerHTML = net.trainOpts.momentum;
  // виводимо усі додаткові дані у консоль
  console.log(net);
});
