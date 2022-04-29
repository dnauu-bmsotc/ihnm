function askQuestion(question) {
	katex.render("\\text{" + question + "}", document.getElementById("question"), {
    throwOnError: true,
		macros: {'\\arccot': '\\operatorname{arccot}'},
	});
}

function askTopic(topic) {
	if (topic.notAsked.length === 0) {
		topic.notAsked = [...topic.questions];
	}
	let n = Math.floor(Math.random() * topic.notAsked.length);
	askQuestion(topic.notAsked.splice(n, 1)[0]);
}

function appendButton(containerId, name, func) {
	let btn = document.createElement("button");
	btn.innerHTML = name;
	btn.addEventListener("click", func);
	document.getElementById(containerId).append(btn);
}

function addDiscipline(discipline) {
	let disciplineName = discipline.name;
	delete discipline.name;
	
	appendButton("disciplines", disciplineName, () => {
		document.getElementById("themes-section").innerHTML = "";
		for (const [name, questions] of Object.entries(discipline)) {
			let topic = {
				questions: questions,
				notAsked: [],
			}
			appendButton("themes-section", name, () => askTopic(topic));
		}
	});
}

document.addEventListener("DOMContentLoaded", async function() {
	// Получение файла со списком путей к файлам с вопросами.
	let disciplinesFile = await fetch("./disciplines.json");
	if (disciplinesFile.ok) {
		// Чтение каждого адреса из файла
		for (let url of await disciplinesFile.json()) {
			// Чтение файлов с вопросами
			let topicsFile = await fetch(url);
			if (topicsFile.ok) {
				addDiscipline(await topicsFile.json());
			}
		}
	}
	
	// 
	document.getElementById("disciplines").firstChild.dispatchEvent(new Event("click"));
});