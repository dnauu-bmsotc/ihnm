class Problem2 extends Problem {
    constructor() {
        super();
    }
    makeCondition() {
        this.conditionContainer.innerHTML = `
        <p>Парке́т или замощение — разбиение плоскости на многоугольники или
        пространства на многогранники без пробелов и наслоений. Предполагается,
        что существует всего 15 классов пятиугольников, бесконечные паркеты из
        которых могут замостить плоскость. [www.wikipedia.org, 2023]</p>

        <p>В данной задаче рассматривается пятиугольник пятого типа.</p>
        <img src="./problem2/Lattice_p6-type5.png"></img>
        <p>Для данного типа прямоугольников верны следующие свойства:
        a=b; d=e; A=60deg; D=120deg. Пусть даны b и... Необходимо найти: B, c.</p>
    `;
    };
    makeSketch() {};
    makeSolution() {};
}