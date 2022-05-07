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
  let x = n * Math.pow(10, d);
  let r = Math.round(x);
  let br = Math.abs(x) % 1 === 0.5 ? (r % 2 === 0 ? r : r-1) : r;
  return br / Math.pow(10, d);
}

function initP(p30, p60, p90, p120, p150) {
  P.p30 = p30;
  P.p60 = p60;
  P.p90 = p90;
  P.p120 = p120;
  P.p150 = p150;
}

function P(n) {
  if (typeof P.p30 === "undefined") {
    alert("Не установлены поправки. Используйте функцию InitP");
  }
  if (n < 30) return n + P.p30;
  if (n < 60) return n + P.p60;
  if (n < 90) return n + P.p90;
  if (n < 120) return n + P.p120;
  if (n < 150) return n + P.p150;
}

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
function traverseStation(i, hl1, hl2, hr1, hr2, Vl, Vr, vl1, vl2, vr1, vr2, ll1, ll2, lr1, lr2, hback) {
  const horl = new Angle(hl2).minus(hl1);
  const horr = new Angle(hr2).minus(hr1);
  const hor = horl.plus(horr).divide(2);
  const MOl = new Angle(vl1).plus(vl2).divide(2);
  const MOr = new Angle(vr1).plus(vr2).divide(2);
  const vl = new Angle(vl1).minus(vl2).divide(2);
  const vr = new Angle(vr1).minus(vr2).divide(2);
  const ll = ground((ll1 + ll2) / 2, 1);
  const lr = ground((lr1 + lr2) / 2, 1);
  const Dl = P(ll);
  const Dr = P(lr);
  const Sl = ground(Dl * Math.pow(Math.cos(vl.radians), 2), 1);
  const Sr = ground(Dr * Math.pow(Math.cos(vr.radians), 2), 1);
  const hlf = ground(Sl * Math.tan(vl.radians), 2);
  const hrf = ground(Sr * Math.tan(vr.radians), 2);
  const dl = i - Vl;
  const dr = i - Vr;
  const hl = hlf + dl;
  const hr = hrf + dr;
  const h = ground((hr - hback) / 2, 2);
  
  const table = document.createElement("div");
  table.classList.add("gtable");
  table.innerHTML = `
    <div class="grow">
      <div>Номер пункта</div>
      <div>${i}</div>
    </div>
    <div class="grow">
      <div>Предыдущий пункт</div>
      <div>Следующий пункт</div>
      <div>Предыдущий пункт</div>
      <div>Следующий пункт</div>
    </div>
    <div class="grow">
      <div>Л</div>
      <div>П</div>
    </div>
    <div class="grow">
      <div>${hl1.toFormat("d360 m.1")}</div>
      <div>${hl2.toFormat("d360 m.1")}</div>
      <div>${hr1.toFormat("d360 m.1")}</div>
      <div>${hr2.toFormat("d360 m.1")}</div>
    </div>
    <div class="grow">
      <div>${horl.toFormat("d360 m.1")}</div>
      <div>${hor.toFormat("d360 m.1")}</div>
      <div>${horr.toFormat("d360 m.1")}</div>
    </div>
    <div class="grow">
      <div>Предыдущий пункт</div>
      <div>${Vl}</div>
      <div>Следующий пункт</div>
      <div>${Vr}</div>
    </div>
    <div class="grow">
      <div>Л</div>
      <div>П</div>
      <div>Л</div>
      <div>П</div>
    </div>
    <div class="grow">
      <div>${new Angle(vl1).toFormat("d360 m.1")}</div>
      <div>${new Angle(vl2).toFormat("d360 m.1")}</div>
      <div>${new Angle(vr1).toFormat("d360 m.1")}</div>
      <div>${new Angle(vr2).toFormat("d360 m.1")}</div>
    </div>
    <div class="grow">
      <div>${new Angle(MOl).sign}</div>
      <div>${new Angle(vl).sign}</div>
      <div>${new Angle(MOr).sign}</div>
      <div>${new Angle(vr).sign}</div>
    </div>
    <div class="grow">
    <div>${new Angle(MOl).abs.toFormat("d360 m.1")}</div>
    <div>${new Angle(vl).abs.toFormat("d360 m.1")}</div>
    <div>${new Angle(MOr).abs.toFormat("d360 m.1")}</div>
    <div>${new Angle(vr).abs.toFormat("d360 m.1")}</div>
    </div>
    <div class="grow">
      <div>${ll1}</div>
      <div>${ll2}</div>
      <div>${ll}</div>
      <div>${lr1}</div>
      <div>${lr2}</div>
      <div>${lr}</div>
    </div>
    <div class="grow">
      <div>${Dl}</div>
      <div>${Sl}</div>
      <div>${Dr}</div>
      <div>${Sr}</div>
    </div>
    <div class="grow">
      <div>${Math.sign(hlf)}</div>
      <div>${Math.sign(dl)}</div>
      <div>${Math.sign(hl)}</div>
      <div>${Math.sign(hrf)}</div>
      <div>${Math.sign(dr)}</div>
      <div>${Math.sign(hr)}</div>
    </div>
    <div class="grow">
      <div>${ground(hlf, 2)}</div>
      <div>${ground(dl)}</div>
      <div>${ground(hl)}</div>
      <div>${ground(hrf)}</div>
      <div>${ground(dr)}</div>
      <div>${ground(hr)}</div>
    </div>
    <div class="grow">
      <div>-</div>
      <div>-</div>
      <div>-</div>
      <div>${hr}</div>
      <div>${hback}</div>
      <div>${h}</div>
    </div>
  `;
  return table;
}
