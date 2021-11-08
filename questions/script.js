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
	appendButton("disciplines", discipline.name, () => {
		document.getElementById("themes-section").innerHTML = "";
		for (let topic of discipline.topics) {
			topic.notAsked = [];
			appendButton("themes-section", topic.name, () => askTopic(topic));
		}
	});
}

document.addEventListener("DOMContentLoaded", async function() {
	let disciplinesFile = await fetch("./disciplines.json");
	if (disciplinesFile.ok) {
		for (let url of await disciplinesFile.json()) {
			let topicsFile = await fetch(url);
			if (topicsFile.ok) {
				addDiscipline(await topicsFile.json());
			}
		}
	}
});