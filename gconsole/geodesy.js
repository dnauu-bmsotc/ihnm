"use strict"

const Тип3Т5КП = 0;
const Тип2Т5К = 1;

// stores angle in pure degrees
// Секунды лучше округлять до 9 знаков после запятйо
class Angle {
  constructor(d=0, m=0, s=0) {
    if (d instanceof Angle) {
      this.degrees = d.degrees;
    }
    else {
      this.degrees = d + m / 60 + s / 3600;
    }
  }
  // example: "d360 m.2"
  // d360 --- Целое число градусов в пределах 360 градусов
  toFormat(format) {
    format = format.replace(/d360/, Math.trunc(this.degrees) % 360);
    format = format.replace(/d/, Math.trunc(this.degrees));
    format = format.replace(/m.(\d*)/, function(a, b) { return `${ground(this.degrees % 1 * 60, parseInt(b))}` }.bind(this));
    return format;
  }
  toString() {
    return `
    dd: ${this.degrees}
    d: ${Math.trunc(this.degrees)}
    m: ${Math.trunc(this.degrees % 1 * 60)}
    s: ${this.degrees % 1 * 60 % 1 * 60}`;
  }
  plus(angle) {
    if (angle instanceof Angle) return new Angle(this.degrees + angle.degrees);
    else return new Angle(this.degrees + angle);
  }
  minus(angle) {
    if (angle instanceof Angle) return new Angle(this.degrees - angle.degrees);
    else return new Angle(this.degrees - angle);
  }
  times(n) {
    return new Angle(this.degrees * n);
  }
  divide(n) {
    return new Angle(this.degrees / n);
  }
  to360 () {
    return new Angle((360 + this.degrees % 360) % 360);
  }
  groundMinutes(n=1) {
    const d = Math.trunc(this.degrees);
    const m = ground(this.degrees % 1 * 60, n);
    return new Angle(d + m / 60);
  }
  get abs() {
    return new Angle(Math.abs(this.degrees));
  }
  get sign() {
    return Math.sign(this.degrees);
  }
  get radians() {
    return this.degrees * Math.PI / 180;
  }
}

function ground(n, d=2) {
  // https://stackoverflow.com/questions/3108986
  let x = Math.trunc(n * Math.pow(10, d + 1)) / 10;
  let r = Math.round(x);
  let br = Math.abs(x) % 1 === 0.5 ? (r % 2 === 0 ? r : r-1) : r;
  return br / Math.pow(10, d);
}

function P(n) {
  if (!P.ps) {
    throw "Не установлены поправки. Используйте функцию P.init";
  }
  let closest = 0;
  for (let i = 0; i < P.ps.length; i += 2) {
    if (Math.abs(n - P.ps[i]) < Math.abs(n - P.ps[closest])) {
      closest = i;
    }
  }
  return n + P.ps[closest + 1];
}

// Принимает массив следующего вида: расстояние, поправка, расстояние, поправка...
P.init = function(...args) {
  P.ps = args;
};

// a --- начальный дирекционный угол
// s --- массив расстояний
// b --- массив левых углов
function drawTraverse(a, s, b, scale=1/20) {
  let x, y, prevX = 50, prevY = 50;
  let angle = new Angle(a).minus(90);
  let ss = [200, ...s, 200];
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.innerHTML = "";
  for (let i = 0; i < ss.length; i++) {
    x = prevX + Math.cos(new Angle(angle).radians) * ss[i] * scale;
    y = prevY + Math.sin(new Angle(angle).radians) * ss[i] * scale;
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttributeNS(null, "x1", prevX);
    line.setAttributeNS(null, "y1", prevY);
    line.setAttributeNS(null, "x2", x);
    line.setAttributeNS(null, "y2", y);
    line.setAttributeNS(null, "stroke", (i === 0 || i === ss.length - 1) ? "red" : "blue");
    svg.append(line);
    prevX = x;
    prevY = y;
    angle = angle.plus(b[i]);
    if (angle.degrees > 180) angle = angle.minus(180);
    else angle = angle.plus(180);
  }
  return svg;
}

// Вычисления на станции тахеометрического хода
// i --- высота инструмента
// hl1, hl2, hr1, hr2 --- горизонтальные отсчёты
// Vl, Vr --- высоты реек
// vl1, vl2, vr1, vr2 --- вертикальные отсчёты
// ll1, ll2, lr1, lr2 --- отсчёты по дальномеру
// hback --- h обратное
// Сохраняемые данные:
// traverseStation.s_backward;
// traverseStation.s_forward;
// traverseStation.h_backward;
// traverseStation.h_forward;
// traverseStation.h;
// traverseStation.b;
function traverseStation({i, hl1, hl2, hr1, hr2, Vl, Vr, vl1, vl2, vr1, vr2, ll1, ll2, lr1, lr2, hback, type}) {
  const firstStation = !vl1;
  const lastStation = !vr1;
  const horl = new Angle(hl2).minus(hl1).to360();
  const horr = new Angle(hr2).minus(hr1).to360();
  const hor = horl.plus(horr).divide(2).groundMinutes(1);
  let MOl, MOr, vl, vr;
  switch (type) {
    case Тип3Т5КП:
      MOl = new Angle(vl1).minus(vl2).divide(2);
      MOr = new Angle(vr1).minus(vr2).divide(2);
      vl = new Angle(vl1).plus(vl2).divide(2);
      vr = new Angle(vr1).plus(vr2).divide(2);
      break;
    case Тип2Т5К:
      MOl = new Angle(vl1).plus(vl2).divide(2);
      MOr = new Angle(vr1).plus(vr2).divide(2);
      vl = new Angle(vl1).minus(vl2).divide(2);
      vr = new Angle(vr1).minus(vr2).divide(2);
      break;
    default:
      throw "Не установлен тип прибора";
  }
  const ll = ground((ll1 + ll2) / 2, 1);
  const lr = ground((lr1 + lr2) / 2, 1);
  const Dl = ground(P(ll));
  const Dr = ground(P(lr));
  const Sl = ground(Dl * Math.pow(Math.cos(vl.radians), 2), 1);
  const Sr = ground(Dr * Math.pow(Math.cos(vr.radians), 2), 1);
  const hlf = ground(Sl * Math.tan(vl.radians));
  const hrf = ground(Sr * Math.tan(vr.radians));
  const dl = ground(i - Vl);
  const dr = ground(i - Vr);
  const hl = ground(hlf + dl);
  const hr = ground(hrf + dr);
  const h = ground((hr - hback) / 2, 2);
  
  const table = document.createElement("div");
  table.classList.add("gtable");
  table.innerHTML = `
    <div class="grow grow-average">
      <div class="gheader"></div>
      <div>Пункт</div>
      <div class="userinputed">${i}</div>
    </div>
    <div class="grow grow-average">
      <div class="gheader"></div>
      <div>Пред</div>
      <div>След</div>
      <div>Пред</div>
      <div>След</div>
    </div>
    <div class="grow" grow-tight>
      <div class="gheader"></div>
      <div>Л</div>
      <div>П</div>
    </div>
    <div class="grow grow-average">
      <div class="gheader">Гор кр</div>
      <div class="userinputed">${hl1.toFormat("d m.1")}</div>
      <div class="userinputed">${hl2.toFormat("d m.1")}</div>
      <div class="userinputed">${hr1.toFormat("d m.1")}</div>
      <div class="userinputed">${hr2.toFormat("d m.1")}</div>
    </div>
    <div class="grow grow-average">
      <div class="gheader"></div>
      <div>${horl.toFormat("d m.1")}</div>
      <div>${hor.toFormat("d m.1")}</div>
      <div>${horr.toFormat("d m.1")}</div>
    </div>
    <div class="grow grow-average">
      <div class="gheader"></div>
      <div>${!firstStation ? "Пред" : ""}</div>
      <div class="userinputed">${!firstStation ? Vl : ""}</div>
      <div>${!lastStation ? "След" : ""}</div>
      <div class="userinputed">${!lastStation ? Vr : ""}</div>
    </div>
    <div class="grow grow-tight">
      <div class="gheader"></div>
      <div>${!firstStation ? "Л" : ""}</div>
      <div>${!firstStation ? "П" : ""}</div>
      <div>${!lastStation ? "Л" : ""}</div>
      <div>${!lastStation ? "П" : ""}</div>
    </div>
    <div class="grow grow-average">
      <div class="gheader">Вер кр</div>
      <div class="userinputed">${!firstStation ? new Angle(vl1).toFormat("d m.1") : ""}</div>
      <div class="userinputed">${!firstStation ? new Angle(vl2).toFormat("d m.1") : ""}</div>
      <div class="userinputed">${!lastStation ? new Angle(vr1).toFormat("d m.1") : ""}</div>
      <div class="userinputed">${!lastStation ? new Angle(vr2).toFormat("d m.1") : ""}</div>
    </div>
    <div class="grow grow-tight">
      <div class="gheader"></div>
      <div>${!firstStation ? new Angle(MOl).sign : ""}</div>
      <div>${!firstStation ? new Angle(vl).sign : ""}</div>
      <div>${!lastStation ? new Angle(MOr).sign : ""}</div>
      <div>${!lastStation ? new Angle(vr).sign : ""}</div>
    </div>
    <div class="grow grow-average">
      <div class="gheader"></div>
      <div>${!firstStation ? new Angle(MOl).abs.toFormat("d m.1") : ""}</div>
      <div>${!firstStation ? new Angle(vl).abs.toFormat("d m.1") : ""}</div>
      <div>${!lastStation ? new Angle(MOr).abs.toFormat("d m.1") : ""}</div>
      <div>${!lastStation ? new Angle(vr).abs.toFormat("d m.1") : ""}</div>
    </div>
    <div class="grow grow-average">
      <div class="gheader">Дальномер</div>
      <div class="userinputed">${!firstStation ? ll1 : ""}</div>
      <div class="userinputed">${!firstStation ? ll2 : ""}</div>
      <div>${!firstStation ? ll : ""}</div>
      <div class="userinputed">${!lastStation ? lr1 : ""}</div>
      <div class="userinputed">${!lastStation ? lr2 : ""}</div>
      <div>${!lastStation ? lr : ""}</div>
    </div>
    <div class="grow grow-average">
      <div class="gheader">D, S</div>
      <div>${!firstStation ? Dl : ""}</div>
      <div>${!firstStation ? Sl : ""}</div>
      <div>${!lastStation ? Dr : ""}</div>
      <div>${!lastStation ? Sr : ""}</div>
    </div>
    <div class="grow grow-tight">
      <div class="gheader"></div>
      <div>${!firstStation ? Math.sign(hlf) : ""}</div>
      <div>${!firstStation ? Math.sign(dl) : ""}</div>
      <div>${!firstStation ? Math.sign(hl) : ""}</div>
      <div>${!lastStation ? Math.sign(hrf) : ""}</div>
      <div>${!lastStation ? Math.sign(dr) : ""}</div>
      <div>${!lastStation ? Math.sign(hr) : ""}</div>
    </div>
    <div class="grow grow-average">
      <div class="gheader"></div>
      <div>${!firstStation ? hlf : ""}</div>
      <div>${!firstStation ? dl : ""}</div>
      <div>${!firstStation ? hl : ""}</div>
      <div>${!lastStation ? hrf : ""}</div>
      <div>${!lastStation ? dr : ""}</div>
      <div>${!lastStation ? hr : ""}</div>
    </div>
    <div class="grow grow-average">
      <div class="gheader">h пр обр ср</div>
      <div>${!firstStation ? "-" : ""}</div>
      <div>${!firstStation ? "-" : ""}</div>
      <div>${!firstStation ? "-" : ""}</div>
      <div>${!lastStation ? hr : ""}</div>
      <div>${!lastStation ? hback : ""}</div>
      <div>${!lastStation ? h : ""}</div>
    </div>
  `;

  traverseStation.s_backward = !firstStation ? Sl : 0;
  traverseStation.s_forward =  !lastStation  ? Sr : 0;
  traverseStation.h_backward = !firstStation ? hl : 0;
  traverseStation.h_forward =  !lastStation  ? h  : 0;
  traverseStation.h = h;
  traverseStation.b = hor;

  return table;
}

function add_s_from_traverse(arr) {
  if (arr.length) {
    arr[arr.length - 1] = ground((arr[arr.length-1] + traverseStation.s_backward) / 2, 1);
  }
  if ((arr.length === 0) || (traverseStation.s_forward)) {
    arr.push(traverseStation.s_forward);
  }
  return arr;
}

function add_b_from_traverse(arr) {
  arr.push(traverseStation.b);
  return arr;
}

// Сохраняемые данные:
// totalStation.s --- массив длин сторон хода
// totalStation.b --- массив углов поворота
// totalStation.h --- массив средних превышений
function* totalStation(stationsData) {
  const h_backward_arr = [];
  totalStation.s = [];
  totalStation.b = [];
  totalStation.h = [];
  for (let station of stationsData) {
    traverseStation(station);
    h_backward_arr.push(traverseStation.h_backward);
  }
  for (let i = 0; i < stationsData.length; i++) {
    if (i + 1 < stationsData.length) {
      stationsData[i].hback = h_backward_arr[i + 1];
    }
    yield traverseStation(stationsData[i]);
    add_s_from_traverse(totalStation.s);
    add_b_from_traverse(totalStation.b);
    totalStation.h.push(traverseStation.h);
  }
  totalStation.h.pop();
  return [h_backward_arr, totalStation.s, totalStation.b, totalStation.h];
}

function linkHeights(H1, Hn, s_arr, h_arr) {
  const ssum = s_arr.reduce((partialSum, a) => partialSum + a, 0);
  const fsum = h_arr.reduce((partialSum, a) => partialSum + a, 0);
  const table = document.createElement("div");
  table.classList.add("gtable");
  let html = "";
  // S
  html += `<div class="grow">`;
  html += `<div>S</div>`;
  for (let s of s_arr) {
    html += `<div></div>`;
    html += `<div class="userinputed">${s}</div>`;
  }
  html += `<div></div>`;
  html += `<div>${ssum}</div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `</div>`;
  // h среднее
  html += `<div class="grow">`;
  html += `<div>h ср</div>`;
  for (let h of h_arr) {
    html += `<div></div>`;
    html += `<div class="userinputed">${ground(h, 2)}</div>`;
  }
  html += `<div></div>`;
  html += `<div>${ground(fsum, 2)}</div>`;
  html += `<div>${ground(Hn-H1, 2)}</div>`;
  html += `<div>${ground(fsum-(Hn-H1), 2)}</div>`;
  html += `<div>${ground(0.04*ssum/Math.sqrt(s_arr.length), 0)}</div>`;
  html += `</div>`;
  // v
  html += `<div class="grow">`;
  html += `<div>Поправка v</div>`;
  const v_arr = calculate_v(s_arr.length, i => s_arr[i], (a, b) => b.k - a.k, fsum - (Hn - H1), 2, false);
  for (let i = 0; i < s_arr.length; i++) {
    html += `<div></div>`;
    html += `<div>${v_arr[i]}</div>`;
  }
  html += `<div></div>`;
  html += `<div>${ground(v_arr.reduce((partialSum, a) => partialSum + a, 0), 2)}</div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `</div>`;
  // h испр
  const hv = [];
  html += `<div class="grow">`;
  html += `<div>h испр</div>`;
  for (let i = 0; i < s_arr.length; i++) {
    html += `<div></div>`;
    hv.push(ground(h_arr[i] + v_arr[i], 2));
    html += `<div>${hv[i]}</div>`;
  }
  html += `<div></div>`;
  html += `<div>${ground(hv.reduce((partialSum, a) => partialSum + a, 0), 2)}</div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `</div>`;
  // H
  const H_arr = [];
  html += `<div class="grow">`;
  html += `<div>H</div>`;
  html += `<div>${ground(H1, 2)}</div>`;
  H_arr.push(ground(H1, 2));
  for (let i = 0; i < s_arr.length; i++) {
    html += `<div></div>`;
    H_arr.push(ground(H_arr[H_arr.length - 1] + hv[i], 2));
    html += `<div>${H_arr[H_arr.length - 1]}</div>`;
  }
  html += `<div></div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `</div>`;
  //
  html += `</div>`;
  table.innerHTML = html;
  return table;
}


function* rectangularCoordinatesSheet(alpha1, alphan, X1, Xn, Y1, Yn, b_arr, s_arr) {
  // Вычисление поправок в углы
  const b_sum_measured = b_arr.reduce((partialSum, a) => partialSum.plus(a), new Angle(0));
  const b_sum_theoretical = alphan.minus(alpha1).plus(180 * b_arr.length);
  const fb = b_sum_measured.minus(b_sum_theoretical);
  const s_sum = s_arr.reduce((partialSum, a) => partialSum + a, 0);
  const bv_arr = calculate_v(b_arr.length, i => (i === 0 || i === b_arr.length - 1 ? s_sum : s_arr[i - 1] + s_arr[i]), (a, b) => a.k - b.k, fb.abs.degrees * 60, 1, true);
  // Вычисление дирекционных углов
  const alpha_arr = [alpha1];
  for (let i = 0; i < b_arr.length; i++) {
    const alpha_plus_b = alpha_arr[alpha_arr.length - 1].plus(b_arr[i]).plus(bv_arr[i] / 60).groundMinutes(1);
    const alpha_pm_180 = alpha_plus_b.plus(alpha_plus_b.degrees < 180 ? +180 : -180);
    alpha_arr.push(alpha_pm_180.to360().groundMinutes(1));
  }
  // Вычисление приращений
  const dx = [], dy = [];
  for (let i = 0; i < s_arr.length; i++) {
    dx.push(ground(s_arr[i] * Math.cos(alpha_arr[i + 1].radians), 1));
    dy.push(ground(s_arr[i] * Math.sin(alpha_arr[i + 1].radians), 1));
  }
  // Вычисление поправок в приращения
  const sdx = dx.reduce((partialSum, a) => partialSum + a, 0);
  const sdy = dy.reduce((partialSum, a) => partialSum + a, 0);
  const fx = ground(sdx - (Xn - X1), 1);
  const fy = ground(sdy - (Yn - Y1), 1);
  const fs = ground(Math.sqrt(Math.pow(fx, 2) + Math.pow(fy, 2)), 1);
  const xv_arr = calculate_v(dx.length, i => s_arr[i], (a, b) => b.k - a.k, fx, 1, false);
  const yv_arr = calculate_v(dy.length, i => s_arr[i], (a, b) => b.k - a.k, fy, 1, false);
  // Вычисление прямоугольных координат
  const x_arr = [X1], y_arr = [Y1];
  for (let i = 0; i < s_arr.length; i++) {
    x_arr.push(ground(x_arr[x_arr.length - 1] + dx[i] + xv_arr[i], 1));
    y_arr.push(ground(y_arr[y_arr.length - 1] + dy[i] + yv_arr[i], 1));
  }
  // Построение таблицы
  const table = document.createElement("div");
  table.classList.add("gtable");
  let tableHtml = ``;
  tableHtml += `<div class="grow">`;
  tableHtml += `<div class="gheader">Углы поворота</div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  for (let i = 0; i < b_arr.length; i++) {
    tableHtml += `<div>${bv_arr[i]}</div>`;
    tableHtml += `<div class="userinputed">${b_arr[i].toFormat("d m.1")}</div>`;
  }
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div>${b_sum_measured.toFormat("d m.1")}</div>`;
  tableHtml += `<div>${b_sum_theoretical.toFormat("d m.1")}</div>`;
  tableHtml += `</div>`;
  tableHtml += `<div class="grow">`;
  tableHtml += `<div class="gheader">Дирекционные</div>`;
  tableHtml += `<div class="userinputed">${alpha_arr[0].toFormat("d m.1")}</div>`;
  for (let i = 1; i < alpha_arr.length; i++) {
    tableHtml += `<div>${alpha_arr[i].toFormat("d m.1")}</div>`;
  }
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `</div>`; 
  tableHtml += `<div class="grow">`;
  tableHtml += `<div class="gheader">S</div>`;
  tableHtml += `<div></div>`;
  for (let s of s_arr) {
    tableHtml += `<div class="userinputed">${s}</div>`;
  }
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div>${s_sum}</div>`;
  tableHtml += `</div>`;
  tableHtml += `<div class="grow">`;
  tableHtml += `<div class="gheader">dx</div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  for (let i = 0; i < dx.length; i++) {
    tableHtml += `<div>${xv_arr[i]}</div>`;
    tableHtml += `<div>${dx[i]}</div>`;
  }
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div>${sdx}</div>`;
  tableHtml += `<div>${ground(Xn - X1, 1)}</div>`;
  tableHtml += `</div>`;
  tableHtml += `<div class="grow">`;
  tableHtml += `<div class="gheader">dy</div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  for (let i = 0; i < dy.length; i++) {
    tableHtml += `<div>${yv_arr[i]}</div>`;
    tableHtml += `<div>${dy[i]}</div>`;
  }
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div>${sdy}</div>`;
  tableHtml += `<div>${ground(Yn - Y1, 1)}</div>`;
  tableHtml += `</div>`;
  tableHtml += `<div class="grow">`;
  tableHtml += `<div class="gheader">X</div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div class="userinputed">${x_arr[0]}</div>`;
  for (let i = 1; i < x_arr.length; i++) {
    tableHtml += `<div>${x_arr[i]}</div>`;
  }
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `</div>`;
  tableHtml += `<div class="grow">`;
  tableHtml += `<div class="gheader">Y</div>`;
  tableHtml += `<div></div>`;
  tableHtml += `<div class="userinputed">${y_arr[0]}</div>`;
  for (let i = 1; i < y_arr.length; i++) {
    tableHtml += `<div>${y_arr[i]}</div>`;
  }
  tableHtml += `<div></div>`;
  tableHtml += `<div></div>`;
  tableHtml += `</div>`;
  table.innerHTML = tableHtml;
  yield table;

  const undertable = document.createElement("div");
  undertable.innerHTML = `
    <div>fb = ${ground(fb.degrees * 60, 1)}'</div>
    <div>fb доп = ${ground(Math.sqrt(b_arr.length), 1)}'</div>
    <div>fx = ${fx}м</div>
    <div>fy = ${fy}м</div>
    <div>fs = ${fs}м</div>
    <div>Относительная ошибка = 1/${s_sum / fs}</div>
  `;
  return undertable;
}

function calculate_v(n, k_func, sort_func, f, accuracy, do_even) {
  const arr_t = [];
  for (let i = 0; i < n; i++) {
    arr_t.push({id: i, k: k_func(i), v: 0});
  }
  let i_start = 0;
  if (!do_even) {
    const k_sum = arr_t.reduce((partialSum, a) => partialSum + a.k, 0);
    for (let x of arr_t) {
      x.v = Math.trunc(-x.k / k_sum * f * Math.pow(10, accuracy)) / Math.pow(10, accuracy);
      i_start += Math.abs(x.v) * Math.pow(10, accuracy);
    }
  }
  arr_t.sort(sort_func);
  for (let i = Math.round(i_start); i < Math.abs(Math.round(f * Math.pow(10, accuracy))); i++) {
    arr_t[(i - Math.round(i_start)) % arr_t.length].v -= Math.pow(10, -accuracy) * Math.sign(f);
  }
  return arr_t.sort((a, b) => a.id - b.id).map(x => ground(x.v, accuracy));
}

function levelingStation({bl_up_1, bl_mid_1, bl_up_2, bl_mid_2, red_2, red_1, d, dS}) {
  levelingStation._1 = bl_up_1;
  levelingStation._2 = bl_mid_1;
  levelingStation._3 = bl_up_2;
  levelingStation._4 = bl_mid_2;
  levelingStation._5 = red_2;
  levelingStation._6 = red_1;

  levelingStation._7 = Math.abs(levelingStation._2 - levelingStation._1);
  levelingStation._8 = levelingStation._4 - levelingStation._3;
  levelingStation._9 = levelingStation._6 - levelingStation._2;
  levelingStation._10 = levelingStation._5 - levelingStation._4;
  levelingStation._11 = levelingStation._2 - levelingStation._4;
  levelingStation._12 = levelingStation._6 - levelingStation._5;
  levelingStation._14 = levelingStation._11 - levelingStation._12;
  levelingStation._13 = ground((levelingStation._11 + levelingStation._12 + Math.sign(levelingStation._14) * d) / 2, 0);
  levelingStation._22 = levelingStation._8 - levelingStation._7;

  const table = document.createElement("div");
  table.classList.add("gtable");
  table.innerHTML = `
    <div class="grow grow-average">
      <div>${levelingStation._7}</div>
      <div>${levelingStation._8}</div>
      <div>${levelingStation._22}</div>
    </div>
    <div class="grow grow-average">
      <div class="userinputed">${levelingStation._1}</div>
      <div class="userinputed">${levelingStation._2}</div>
      <div class="userinputed">${levelingStation._6}</div>
      <div>${levelingStation._9}</div>
    </div>
    <div class="grow grow-average">
      <div class="userinputed">${levelingStation._3}</div>
      <div class="userinputed">${levelingStation._4}</div>
      <div class="userinputed">${levelingStation._5}</div>
      <div>${levelingStation._10}</div>
    </div>
    <div class="grow grow-average">
      <div>${levelingStation._11}</div>
      <div>${levelingStation._12}</div>
      <div>${levelingStation._14}</div>
    </div>
    <div class="grow grow-average">
      <div>${levelingStation._13}</div>
    </div>
  `;
  return table
}

// stations is an array of arrays of objects with properties that are required for each station.
// inner arrays unite stations for control checks.
// [ [stationObject, stationObject, stationObject],
//   [stationObject, stationObject] ]
function* levelingLog(H1, Hn, stations) {
  const ks = new Array(21+1).fill(0);
  for (let page of stations) {
    const kp = new Array(21+1).fill(0);
    for (let station of page) {
      yield levelingStation(station);
      kp[15] += levelingStation._2 + levelingStation._6;
      kp[16] += levelingStation._4 + levelingStation._5;
      kp[17] += levelingStation._11 + levelingStation._12 + levelingStation._14;
      kp[18] += levelingStation._13;
      kp[21] += levelingStation._7 + levelingStation._8;
    }
    kp[19] = kp[15] - kp[16];
    kp[20] = ground(kp[17] / 2, 0);
    yield "Постраничный контроль:";
    yield levelingPageControls(kp);
    for (let i = 15; i <= 21; i++) {
      ks[i] += kp[i];
    }
  }
  yield "Контроль секции:";
  yield levelingPageControls(ks);
  levelingLog.L = ground(ks[21] * 2 / 10000, 1);
  const kstable = document.createElement("div");
  kstable.innerHTML = `
    <div>L = ${ks[21]}мм = ${levelingLog.L}км</div>
    <div>fh = ${ground(ks[18] - (Hn - H1) * 1000, 0)}мм</div>
    <div>fh допустимое = 20мм sqrt(L) = ${ground(20 * Math.sqrt(levelingLog.L), 0)}мм</div>
  `;
  return kstable;
}

function levelingPageControls(sums) {
  const table = document.createElement("div");
  table.classList.add("gtable");
  table.innerHTML = `
    <div class="grow">
      <div>${sums[21]}</div>
    </div>
    <div class="grow">
      <div>${sums[15]}</div>
      <div>${sums[16]}</div>
      <div>${sums[19]}</div>
    </div>
    <div class="grow">
      <div>${sums[16]}</div>
    </div>
    <div class="grow">
      <div>${sums[17]}</div>
      <div>${sums[20]}</div>
    </div>
    <div class="grow">
      <div>${sums[18]}</div>
    </div>
  `;
  return table;
}