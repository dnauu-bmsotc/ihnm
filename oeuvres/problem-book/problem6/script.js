register("Парадокс Монти Холла", _ => {
    const p = new Problem();

    p.dom.condition.innerHTML = `
        <p>Представьте, что вы стали участником игры, в которой вам нужно выбрать одну из трёх дверей.
        За одной из дверей находится автомобиль, за двумя другими дверями — козы. Вы выбираете одну из
        дверей, например, номер 1, после этого ведущий, который знает, где находится автомобиль,
        а где — козы, открывает одну из оставшихся дверей, например, номер 3, за которой находится коза.
        После этого он спрашивает вас — не желаете ли вы изменить свой выбор и выбрать дверь номер 2?
        Увеличатся ли ваши шансы выиграть автомобиль, если вы примете предложение ведущего и измените
        свой выбор? [https://ru.wikipedia.org/wiki/Парадокс_Монти_Холла]</p>
    `;

    p.dom.sketch.innerHTML = `
        <div>
            <button class="simBtn" data-n="1" data-delay="0">+1</button>
            <button class="simBtn" data-n="10" data-delay="150">+10</button>
            <button class="simBtn" data-n="100" data-delay="20">+100</button>
        </div>
    `;

    
    p.createSVGSketch(-0.5, -0.5, 1, 1);
    p.dom.sketchSVG.innerHTML = `
        <rect id="door1" x="${-1/3-.2/2}" y="0" width="0.2" height="0.2" style="${p.stdsDark}"/>
        <rect id="door2" x="${+0/3-.2/2}" y="0" width="0.2" height="0.2" style="${p.stdsDark}"/>
        <rect id="door3" x="${+1/3-.2/2}" y="0" width="0.2" height="0.2" style="${p.stdsDark}"/>
        <circle id="prize" cx="0" cy="0.1" r=".05" style="${p.stdsLight}"/>
        <polygon id="choice" points=".0,-.05 .05,-.2 -.05,-.2" style="${p.stdsYellow}"/>
    `;


    p.dom.solution.innerHTML = `
        <p>[https://ru.wikipedia.org/wiki/Парадокс_Монти_Холла]</p>

        <p>Для стратегии выигрыша важно следующее: если вы меняете выбор двери после действий ведущего,
        то вы выигрываете, если изначально выбрали проигрышную дверь. Это произойдёт с вероятностью 2⁄3,
        так как изначально выбрать проигрышную дверь можно 2 способами из 3. Иными словами, если вероятность того,
        что выигрыш за изначально выбранной дверью равна 1⁄3, то вероятность обратного — 2⁄3, а ведущий
        устраняет неопределённость, не меняя при этом вероятность.</p>

        <p>Но часто при решении этой задачи рассуждают примерно так: ведущий всегда в итоге убирает одну проигрышную дверь,
        и тогда вероятности появления автомобиля за двумя не открытыми становятся равны 1⁄2, вне зависимости от первоначального
        выбора. Но это неверно: хотя возможностей выбора действительно остаётся две, эти возможности (с учётом предыстории)
        не являются равновероятными. Это так, поскольку изначально все двери имели равные шансы быть выигрышными, но затем имели
        разные вероятности быть исключёнными.</p>
    `;


    let stats = {
        noChangeWin: 0,
        winWithChange: 0,
    }


    function randomDoor() {
        return Math.floor(Math.random() * 3);
    }


    function setPicture(winDoor, choice) {
        p.dom.sketchSVG.getElementById("prize").setAttribute('transform', `translate(${(winDoor-1)/3} 0)`);
        p.dom.sketchSVG.getElementById("choice").setAttribute('transform', `translate(${(choice-1)/3} 0)`);
    }


    function updateInfo(noChangeWinModifier, winWithChangeModifier) {
        p.setSketchSVGInfo(new Map([
            ["Count", stats.noChangeWin + stats.winWithChange],
            ["Win with no change", `${stats.noChangeWin} (+${noChangeWinModifier})`],
            ["Win with change", `${stats.winWithChange} (+${winWithChangeModifier})`],
        ]));
    }

    
    function animate(n, delay, callback, i=0) {
        if (i < n) {
            let winDoor = randomDoor();
            let choice = randomDoor();

            setPicture(winDoor, choice);

            noChangeWinModifier = +(winDoor == choice);
            winWithChangeModifier = +(winDoor != choice);

            stats.noChangeWin += noChangeWinModifier;
            stats.winWithChange += winWithChangeModifier;

            updateInfo(noChangeWinModifier, winWithChangeModifier);

            setTimeout(() => animate(n, delay, callback, i+1), delay);
        }
        else {
            callback();
        }
    }


    p.dom.sketch.querySelectorAll(".simBtn").forEach(el => {
        el.addEventListener("click", _ => {
            p.dom.sketch.querySelectorAll(".simBtn").forEach(btn => btn.disabled = true);
            animate(el.dataset.n, el.dataset.delay, _ => {
                p.dom.sketch.querySelectorAll(".simBtn").forEach(btn => btn.disabled = false);
            });
        });
    });


    updateInfo(0, 0);
});
