"use strict"

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
  let x = Math.floor(n * Math.pow(10, d + 1)) / 10;
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
    line.setAttributeNS(null, "stroke", "black");
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
function traverseStation({i, hl1, hl2, hr1, hr2, Vl, Vr, vl1, vl2, vr1, vr2, ll1, ll2, lr1, lr2, hback}) {
  const firstStation = !vl1;
  const lastStation = !vr1;
  const horl = new Angle(hl2).minus(hl1).to360();
  const horr = new Angle(hr2).minus(hr1).to360();
  const hor = horl.plus(horr).divide(2);
  const MOl = new Angle(vl1).plus(vl2).divide(2);
  const MOr = new Angle(vr1).plus(vr2).divide(2);
  const vl = new Angle(vl1).minus(vl2).divide(2);
  const vr = new Angle(vr1).minus(vr2).divide(2);
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
    <div class="grow">
      <div>Пункт</div>
      <div>${i}</div>
    </div>
    <div class="grow">
      <div>Пред пункт</div>
      <div>След пункт</div>
      <div>Пред пункт</div>
      <div>След пункт</div>
    </div>
    <div class="grow">
      <div>Л</div>
      <div>П</div>
    </div>
    <div class="grow">
      <div>${hl1.toFormat("d m.1")}</div>
      <div>${hl2.toFormat("d m.1")}</div>
      <div>${hr1.toFormat("d m.1")}</div>
      <div>${hr2.toFormat("d m.1")}</div>
    </div>
    <div class="grow">
      <div>${horl.toFormat("d m.1")}</div>
      <div>${hor.toFormat("d m.1")}</div>
      <div>${horr.toFormat("d m.1")}</div>
    </div>
    <div class="grow">
      <div>${!firstStation ? "Пред пункт" : ""}</div>
      <div>${!firstStation ? Vl : ""}</div>
      <div>${!lastStation ? "След пункт" : ""}</div>
      <div>${!lastStation ? Vr : ""}</div>
    </div>
    <div class="grow">
      <div>${!firstStation ? "Л" : ""}</div>
      <div>${!firstStation ? "П" : ""}</div>
      <div>${!lastStation ? "Л" : ""}</div>
      <div>${!lastStation ? "П" : ""}</div>
    </div>
    <div class="grow">
      <div>${!firstStation ? new Angle(vl1).toFormat("d m.1") : ""}</div>
      <div>${!firstStation ? new Angle(vl2).toFormat("d m.1") : ""}</div>
      <div>${!lastStation ? new Angle(vr1).toFormat("d m.1") : ""}</div>
      <div>${!lastStation ? new Angle(vr2).toFormat("d m.1") : ""}</div>
    </div>
    <div class="grow">
      <div>${!firstStation ? new Angle(MOl).sign : ""}</div>
      <div>${!firstStation ? new Angle(vl).sign : ""}</div>
      <div>${!lastStation ? new Angle(MOr).sign : ""}</div>
      <div>${!lastStation ? new Angle(vr).sign : ""}</div>
    </div>
    <div class="grow">
    <div>${!firstStation ? new Angle(MOl).abs.toFormat("d m.1") : ""}</div>
    <div>${!firstStation ? new Angle(vl).abs.toFormat("d m.1") : ""}</div>
    <div>${!lastStation ? new Angle(MOr).abs.toFormat("d m.1") : ""}</div>
    <div>${!lastStation ? new Angle(vr).abs.toFormat("d m.1") : ""}</div>
    </div>
    <div class="grow">
      <div>${!firstStation ? ll1 : ""}</div>
      <div>${!firstStation ? ll2 : ""}</div>
      <div>${!firstStation ? ll : ""}</div>
      <div>${!lastStation ? lr1 : ""}</div>
      <div>${!lastStation ? lr2 : ""}</div>
      <div>${!lastStation ? lr : ""}</div>
    </div>
    <div class="grow">
      <div>${!firstStation ? Dl : ""}</div>
      <div>${!firstStation ? Sl : ""}</div>
      <div>${!lastStation ? Dr : ""}</div>
      <div>${!lastStation ? Sr : ""}</div>
    </div>
    <div class="grow">
      <div>${!firstStation ? Math.sign(hlf) : ""}</div>
      <div>${!firstStation ? Math.sign(dl) : ""}</div>
      <div>${!firstStation ? Math.sign(hl) : ""}</div>
      <div>${!lastStation ? Math.sign(hrf) : ""}</div>
      <div>${!lastStation ? Math.sign(dr) : ""}</div>
      <div>${!lastStation ? Math.sign(hr) : ""}</div>
    </div>
    <div class="grow">
      <div>${!firstStation ? hlf : ""}</div>
      <div>${!firstStation ? dl : ""}</div>
      <div>${!firstStation ? hl : ""}</div>
      <div>${!lastStation ? hrf : ""}</div>
      <div>${!lastStation ? dr : ""}</div>
      <div>${!lastStation ? hr : ""}</div>
    </div>
    <div class="grow">
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
    arr[arr.length - 1] = ground((arr[arr.length-1] + traverseStation.s_backward) / 2);
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
  for (let s of s_arr) {
    html += `<div></div>`;
    html += `<div>${ground(s, 1)}</div>`;
  }
  html += `<div></div>`;
  html += `<div>${ssum}</div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `</div>`;
  // h среднее
  html += `<div class="grow">`;
  for (let h of h_arr) {
    html += `<div></div>`;
    html += `<div>${ground(h, 2)}</div>`;
  }
  html += `<div></div>`;
  html += `<div>${ground(fsum, 2)}</div>`;
  html += `<div>${ground(Hn-H1, 2)}</div>`;
  html += `<div>${ground(fsum-(Hn-H1), 2)}</div>`;
  html += `<div>${ground(0.04*ssum/Math.sqrt(s_arr.length), 0)}</div>`;
  html += `</div>`;
  // v
  html += `<div class="grow">`;
  let v_arr = [];
  for (let i = 0; i < s_arr.length; i++) {
    v_arr.push({id: i, s: s_arr[i], v: 0});
  }
  v_arr.sort((a, b) => b.s - a.s);
  for (let i = 0; i < Math.round(Math.abs(fsum - (Hn - H1))*100); i++) {
    v_arr[i % s_arr.length].v += 0.01;
  }
  for (let i = 0; i < s_arr.length; i++) {
    html += `<div></div>`;
    html += `<div>${v_arr.find((el, ind, arr) => el.id === i).v}</div>`;
  }
  html += `<div></div>`;
  html += `<div>${ground(v_arr.reduce((partialSum, a) => partialSum + a.v, 0), 2)}</div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `<div></div>`;
  html += `</div>`;
  // h испр
  const hv = [];
  html += `<div class="grow">`;
  for (let i = 0; i < s_arr.length; i++) {
    html += `<div></div>`;
    hv.push(ground(h_arr[i] + v_arr.find((el, ind, arr) => el.id === i).v, 2));
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