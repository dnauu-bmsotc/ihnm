function askQuestion(question) {
	katex.render("\\text{" + question + "}", $("#question"), {
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

function appendButton(container, name, func) {
	container.append($(`<button>${name}</button>`).click(func));
}

function addDiscipline(discipline) {
	appendButton($("#disciplines"), discipline.name, () => {
		$("#themes-section").empty();
		for (let topic of discipline.topics) {
			topic.notAsked = [];
			appendButton($("#themes-section"), topic.name, () => askTopic(topic));
		}
	});
}

document.addEventListener("DOMContentLoaded", function() {
	$.ajax({
		url : "./questions",
		success: function (data) {
			$(data).find("a").attr("href", async function (i, val) {
				if( val.includes(".json") ) { 
					let response = await fetch("./questions/" + val);
					if (response.ok) {
						addDiscipline(await response.json());
					}
					else {
						alert("Ошибка HTTP: " + response.status);
					}
				} 
			});
		}
	});
});