let introductionToAnalysisButton;
let introductionToAnalysis = [
	"Кванторы",
	"Множества чисел",
	"Определение функции",
	"Определение обратной функции",
	"Определение чётной, нечётной функций",
	"Определение периодической функции",
	"Определение элементарной функции",
	"Определение сложной функции",
	"Определение графика функции",
	"Определение последовательности чисел",
	"Определение предела последовательности",
	"Арифметические операции конечных пределов",
	"Определение ограниченной последовательности",
	"Свойства сходящихся последовательностей",
	"Определение бесконечно малых и бесконечно больших функций",
	"Теоремы о предельных переходах для последовательностей",
	"Определение предельной точки",
	"Определение верхнего и нижнего пределов последовательности",
	"Теорема Больцано-Вейерштрасса",
	"Определение числа e",
	"Гиперболические функции",
	"Определение предела функции",
	"Геометрический смысл предела функции",
	"Определение предела функции в бесконечности",
	"Определение одностороннего предела",
	"Теорема о локально ограниченной функции",
	"Теорема о локальной знакоопределённости функции",
	"Теоремы о предельных переходах для функций",
	"Теорема о единственности предела",
	"Теорема о пределе сложной функции",
	"Замечательные пределы и их следствия",
	"Теорема о связи функции, её предела и бесконечно малой",
	"Свойства бесконечно малых функций",
	"Теорема о связи бесконечно малых и бесконечно больших",
	"Сравнимые бесконечно малые",
	"Теорема о пределах эквивалентных функций",
	"Таблица эквивалентных бесконечно малых",
	"Непрерывная функция",
	"Непрерывная на интервале функция, непрерывная на отрезке функция",
	"Точка разрыва функции. Классификация точек разрыва",
];

let differentiationOfAFunctionOfOneVariableButton;
let differentiationOfAFunctionOfOneVariable = [
	"Производная функции",
	"Дифференцируемая на интервале функция",
	"Физический смысл производной",
	"Геометрический смысл производной",
	"Уравнения кастельной и нормали к функции",
	"Связь дифференцируемости и непрерывности",
	"Связь дифференцируемости и существования касательной",
	"Правила дифференцирования",
	"Производная сложной функции",
	"Производная обратной функции",
	"Таблица производных",
	"Явное и параметрическое задание функции. Нахождение их производных",
	"Логарифмическое дифференцирование",
	"Дифференцирование функции вида $u(x)^{v(x)}$",
	"Производная n-го порядка",
	"Механический смысл второй производной",
	"Производная второго порядка неявно заданной функции",
	"Определение дифференциала функции",
	"Геометрический смысл дифференциала",
	"Теоремы об арифметических операциях дифференциала",
	"Теорема о дифференциале сложной функции и следсвтие",
	"Применение дифференциала для приближённых вычислений",
	"Теорема Ролля и её геометрическая интерпретация",
	"Теорема Лагранжа и её геометрический смысл и следсвтия",
	"Теорема Коши. Без доказательства",
	"Правило Лопиталя-Бернулли",
	"Формула Тейлора",
	"Возрастающие и убывающие функции",
	"Теорема об убывании дифференцируемой функции с отрицательной производной",
	"Точки минимума и максимума функции",
	"Необходимое условие экстремума. Достатоное условие экстремума",
	"Схема нахождения наибольшего и наименьшего значений функции на отрезке",
	"Определение выпуклой функции",
	"Определение точки перегиба",
	"Теорема о связи второй производной и выпуклости функции",
	"Достаточное условие существования точек перегиба",
	"Определение асимптоты",
	"Определение вертикальных наклонных и горизонтальных асимптот",
	"Схема исследования графика функции",
];

let indefiniteIntegralButton;
let indefiniteIntegral = [
	"Определение первообразной",
	"Определение неопределённого интеграла",
	"Подынтегральная функция, подынтегральное выражение",
	"Теорема о существовании неопределённого интеграла. Без доказательства",
	"Свойства неопределённого интеграла",
	"Таблица основных интегралов",
	"Методы интегрирования",
];

let trigonometryButton;
let trigonometry = [
	"$\\tan^2\\alpha+1$",
	"$\\cot^2\\alpha+1$",
	"$\\sin{2\\alpha}$",
	"$\\cos{2\\alpha}$",
	"$\\tan{2\\alpha}$",
];

let abbreviatedMultiplicationFormulasButton;
let abbreviatedMultiplicationFormulas = [
	"",
];

let derivativeTableButton;
let derivativeTable = [
	"",
];

let integralTableButton;
let integralTable = [
	"",
];

let equivalentInfinitelySmallFunctionsButton;
let equivalentInfinitelySmallFunctions = [
	"",
];

function getQuestion(questions) {
	return questions[Math.floor(Math.random() * questions.length)];
}

function removeElementsKeepChildren(b) {
	while(b.length) {
    let parent = b[ 0 ].parentNode;
    while( b[ 0 ].firstChild ) {
        parent.insertBefore(  b[ 0 ].firstChild, b[ 0 ] );
    }
     parent.removeChild( b[ 0 ] );
}
}

function showQuestion(question) {
	katex.render("\\text{" + question + "}", questionEl, {
    throwOnError: true
	});
}

function ask(questions) {
	showQuestion(getQuestion(questions));
}

document.addEventListener("DOMContentLoaded", function() {
	questionEl = document.getElementById("question"); 
	
	introductionToAnalysisButton = document.getElementById("introduction-to-analysis-btn");
	introductionToAnalysisButton.addEventListener("click", ()=>ask(introductionToAnalysis));
	
	differentiationOfAFunctionOfOneVariableButton = document.getElementById("differentiation-of-a-function-of-one-variable-btn");
	differentiationOfAFunctionOfOneVariableButton.addEventListener("click", ()=>ask(differentiationOfAFunctionOfOneVariable));
	
	indefiniteIntegralButton = document.getElementById("indefinite-integral-btn");
	indefiniteIntegralButton.addEventListener("click", ()=>ask(indefiniteIntegral));
	
	trigonometryButton = document.getElementById("trigonometry-btn");
	trigonometryButton.addEventListener("click", ()=>ask(trigonometry));
	
	abbreviatedMultiplicationFormulasButton = document.getElementById("abbreviated-multiplication-formulas-btn");
	abbreviatedMultiplicationFormulasButton.addEventListener("click", ()=>ask(abbreviatedMultiplicationFormulas));
	
	derivativeTableButton = document.getElementById("derivative-table-btn");
	derivativeTableButton.addEventListener("click", ()=>ask(derivativeTable));
	
	integralTableButton = document.getElementById("integral-table-btn");
	integralTableButton.addEventListener("click", ()=>ask(integralTable));
	
	equivalentInfinitelySmallFunctionsButton = document.getElementById("equivalent-infinitely-small-functions-btn");
	equivalentInfinitelySmallFunctionsButton.addEventListener("click", ()=>ask(equivalentInfinitelySmallFunctions));
});