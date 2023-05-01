class NameplateAnimation {
    constructor(element, width, height) {
        this.el = element;
        this.rotation = 0;

        const rect = this.el.getBoundingClientRect();
        const x = rect.left + width / 2;
        const y = rect.top + height * 1 / 5;

        this.fastering = {
            offset: height * 1 / 5,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0,
            nextX: x,
            nextY: y,
        }

        this.massCenter = {
            x: x,
            y: y + this.fastering.offset,
        }

        this.physic = {
            mass: 0.01,
            friction: 0.85,
            inertiaMoment: 1,
            gravity: 0.01,
            prevTimestamp: performance.now(),
            angle: Math.PI / 4 + Math.PI / 2 * Math.random(),
            angularVelocity: 0,
            maxdt: 50,
            maxdx: 10,
            maxdy: 10,
        }

        this.geometry = {
            width: width,
            height: height,
            fasteringMassCenterDistance: Math.sqrt(
                (this.fastering.x - this.massCenter.x) ** 2 +
                (this.fastering.y - this.massCenter.y) ** 2),
        }

        this.el.style.transformOrigin = `
            ${this.geometry.width / 2}px ${this.fastering.offset}px`;

        window.requestAnimationFrame(this.animateFrame.bind(this));
    }

    animateFrame(timestamp) {
        const rect = this.el.getBoundingClientRect();
        this.fastering.nextX = rect.left + this.geometry.width / 2;
        this.fastering.nextY = rect.top + this.fastering.offset;

        const dt = 1 + timestamp - this.physic.prevTimestamp;
        const dx = this.fastering.nextX - this.fastering.x;
        const dy = this.fastering.nextY - this.fastering.y;
        
        this.fastering.ax = (dx / dt - this.fastering.vx) / dt;
        this.fastering.ay = (dy / dt - this.fastering.vy) / dt;

        this.fastering.vx = dx / dt;
        this.fastering.vy = dy / dt;

        this.fastering.x = this.fastering.nextX;
        this.fastering.y = this.fastering.nextY;

        const nirfForceX = this.physic.mass * -this.fastering.ax;
        const nirfForceY = this.physic.mass * -this.fastering.ay;

        let resultForceX = nirfForceX;
        let resultForceY = nirfForceY + this.physic.mass * this.physic.gravity;
        
        const resultForce = Math.sqrt(resultForceX ** 2 + resultForceY ** 2);
        const resultForceAngle = Math.atan2(resultForceY, resultForceX);

        const shoulder = this.geometry.fasteringMassCenterDistance * Math.sin(resultForceAngle - this.physic.angle);
        const forceMoment = resultForce * shoulder;

        this.physic.angularVelocity += (forceMoment / this.physic.inertiaMoment * dt);
        this.physic.angularVelocity *= this.physic.friction;
        this.physic.angle += this.physic.angularVelocity;

        this.el.style.transform = `rotate(${(this.physic.angle - Math.PI / 2)}rad)`;
    
        this.physic.prevTimestamp = timestamp;
        window.requestAnimationFrame(this.animateFrame.bind(this));
    }
}

class Tile extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div>
                <div class="nameplate">
                    <span class="nameplate-name"></span>
                </div>
            </div>
        `;
    }
}

customElements.define("barley-tile", Tile);

class Field {
    constructor(element, size) {
        this.cols = size;
        this.rows = size;
        this.counter = 0;
        
        this.el = element;
        this.el.style["grid-template-columns"] = `repeat(${this.cols}, 1fr)`;
        for (let i = 0; i < this.cols * this.rows; i++) {
            const back = document.createElement("div");
            back.classList.add("barley-back");
            this.el.appendChild(back);
        }

        this.tileWidth = this.el.querySelector(".barley-back").offsetWidth;
        this.tileHeight = this.el.querySelector(".barley-back").offsetHeight;

        this.tiles = [];
        const ids = shuffle([...Array(this.cols * this.rows).keys()]);
        for (let i = 0; i < this.cols * this.rows; i++) {
            if (ids[i]) {
                const tile = document.createElement("barley-tile");
                tile.dataset.id = ids[i];
                tile.dataset.idx = i;
                tile.dataset.row = Math.floor(i / this.cols);
                tile.dataset.col = i % this.cols;
                tile.style.transform = `translate(
                    ${(i % this.rows) * this.tileWidth}px,
                    ${Math.floor(i / this.rows) * this.tileHeight}px
                )`;
                this.tiles.push(tile);
                this.el.appendChild(tile);
                tile.querySelector(".nameplate-name").textContent = tile.dataset.id;

                const nameplate = tile.querySelector('.nameplate');
                new NameplateAnimation(nameplate, nameplate.offsetWidth, nameplate.offsetHeight);
            }
            else {
                this.tiles.push(null);
            }
        }

        for (let tile of this.tiles) {
            if (tile) {
                tile.querySelector(".nameplate").addEventListener("click", function(event) {
                    const idx =  parseInt(tile.dataset.idx);
                    const row =  parseInt(tile.dataset.row);
                    const col =  parseInt(tile.dataset.col);
    
                    if ((idx > this.cols - 1) && (this.tiles[idx - this.cols] === null)) {
                        tile.dataset.row = row - 1;
                        this.exchange(tile, idx, idx - this.cols);
                    }
                    else if (((idx % this.cols) < this.cols - 1) && (this.tiles[idx + 1] === null)) {
                        tile.dataset.col = col + 1;
                        this.exchange(tile, idx, idx + 1);
                    }
                    else if ((idx < this.cols * (this.rows - 1)) && (this.tiles[idx + this.cols] === null)) {
                        tile.dataset.row = row + 1;
                        this.exchange(tile, idx, idx + this.cols);
                    }
                    else if (((idx % this.cols) > 0) && (this.tiles[idx - 1] === null)) {
                        tile.dataset.col = col - 1;
                        this.exchange(tile, idx, idx - 1);
                    }

                    setTimeout(this.checkWin.bind(this), 200);
                }.bind(this));
            }
        }
    }

    exchange(tile, idx, nullidx) {
        this.tiles[nullidx] = tile;
        this.tiles[idx] = null;
        tile.dataset.idx = nullidx;
        tile.style.transform = `translate(
            ${(nullidx % this.rows) * this.tileWidth}px,
            ${Math.floor(nullidx / this.rows) * this.tileHeight}px
        )`;
        document.getElementById("counter").textContent = ++this.counter;
    }

    checkWin() {
        let ids = this.tiles.map(t => t ? parseInt(t.dataset.id) : null);
        let matrix = [];
        while(ids.length) {
            matrix.push(ids.splice(0, this.cols));
        }

        for (let i = 0; i < 4; i++) {
            let flat = matrix.flat();
            if ((flat[flat.length - 1] === null) && ((this.rotation % 4) === i)) {
                flat = flat.filter(n => n)
                if (flat.every((v,i,a) => !i || a[i-1] <= v)) {
                    alert("Win!");
                }
            }
            
            matrix = matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
        }
    }
}

// https://stackoverflow.com/questions/2450954
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

window.addEventListener("load", _ => {
    const fieldEl = document.getElementById("field");
    fieldEl.style.transform = `rotate(0)`;
    let fieldAngle = 0;

    const field = new Field(fieldEl, 4);

    document.getElementById("rotate-btn").addEventListener("click", function(event) {
        fieldEl.style.transform = `rotate(${(fieldAngle += 1) * 90}deg)`;
        document.querySelectorAll("barley-tile > div").forEach(element => {
            element.style.transform = `rotate(${-fieldAngle * 90}deg)`;
        });
        field.rotation = fieldAngle;
        setTimeout(field.checkWin.bind(field), 200);
    });
});
