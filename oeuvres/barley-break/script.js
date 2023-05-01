class NameplateAnimation {
    constructor(element, x, y, width, height) {
        this.el = element;

        this.fastering = {
            offset: width * 1 / 5,
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
            angle: Math.PI * Math.random(),
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

        const dt = timestamp - this.physic.prevTimestamp;
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

        // this.el.style.top = this.fastering.y - this.fastering.offset + "px";
        // this.el.style.left = this.fastering.x - this.geometry.width / 2 + "px";
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
        const nameplate = this.querySelector('.nameplate');
        new NameplateAnimation(nameplate, 0, 0, nameplate.offsetWidth, nameplate.offsetHeight);
    }
}

customElements.define("barley-tile", Tile);

class Field {
    constructor(element, cols, rows) {
        this.cols = cols;
        this.rows = rows;
        
        this.el = element;
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
                tile.style.left = (i % this.rows) * this.tileWidth + "px";
                tile.style.top = Math.floor(i / this.rows) * this.tileHeight + "px";
                this.tiles.push(tile);
                this.el.appendChild(tile);
                tile.querySelector(".nameplate-name").textContent = tile.dataset.id;
            }
        }

        for (let tile of this.tiles) {
            tile.addEventListener("click", function(event) {
                console.log(event.target.dataset.id);
            });
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
    let fieldAngle = 0;

    new Field(fieldEl, 4, 4);

    document.getElementById("rotate-btn").addEventListener("click", function(event) {
        fieldEl.style.transform = `rotate(${fieldAngle += 90}deg)`;
    });
});
