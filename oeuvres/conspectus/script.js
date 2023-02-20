"use strict"

$.ajaxSetup({'beforeSend': function(xhr){
    if (xhr.overrideMimeType)
        xhr.overrideMimeType("text/plain");
    }
});

marked.setOptions({ baseUrl: "./src/markdown/" });

$(document).ready(_ => {
    $("#button-up").on("click", _ => scrollPage(document.body))

    const conspectus = new Conspectus(
        "./src/",
        {
            $groupsContainer:      $("#groups-section"),
            $disciplinesContainer: $("#disciplines-section"),
            $questionContainer:    $("#question"),
            $conspectContainer:    $("#conspect"),
        },
        _ => conspectus.set("Природные ресурсы", "Геоморфология с основами геологии")
    );

    const questionElObserver = new MutationObserver(function(mutations) {
        $("#question-wrap").css("height", $("#question").height());
    });
    questionElObserver.observe(document.getElementById("question"), {
        childList: true,
        characterData: true
    });
});

class Conspectus {
    constructor(folder, {$groupsContainer, $disciplinesContainer, $questionContainer, $conspectContainer}, ready) {
        this.folder = folder;
        this.$groupsContainer      = $groupsContainer;
        this.$disciplinesContainer = $disciplinesContainer;
        this.$questionContainer    = $questionContainer;
        this.$conspectContainer    = $conspectContainer;
        this.pressedGroupButton = null;
        this.pressedDisciplineButton = null;

        getListing(folder + "markdown/", groups => {
            for (let g of groups) {
                const name = decodeURIComponent(g);
                const button = $(`<button>${name}</button>`);
                button.on("click", _ => this.setGroup(name));
                $groupsContainer.append(button);
            }
            ready && ready();
        })
    }

    setGroup(name, callback) {
        this.$pressedGroupButton && this.$pressedGroupButton.prop('disabled', false);
        this.$pressedGroupButton = $(`#groups-section button:contains(${name})`);
        this.$pressedGroupButton.prop('disabled', true);
        this.$disciplinesContainer.empty();
        this.$conspectContainer.empty();
        const path = this.folder + "markdown/" + name + "/";
        getListing(path, listing => {
            for (let discipline of listing) {
                const name = decodeURIComponent(discipline).replace(".md", "");
                const button = $(`<button>${name}</button>`);
                button.on("click", _ => this.setDiscipline(path, name));
                this.$disciplinesContainer.append(button);
            }
            callback && callback();
        });
    }

    setDiscipline(path, name) {
        this.$pressedDisciplineButton && this.$pressedDisciplineButton.prop('disabled', false);
        this.$pressedDisciplineButton = $(`#disciplines-section-wrap button:contains(${name})`);
        this.$pressedDisciplineButton.prop('disabled', true);
        let disciplineClass = null;
        switch(name) {
            case "Минералы и горные породы":
                disciplineClass = RocksGuessDiscipline;
                break;
            default:
                disciplineClass = DefaultDiscipline;
        }
        this.$questionContainer.text("А расскажи-ка про...");
        this.$conspectContainer.empty();
        const discipline = new disciplineClass(this.folder, path, name,
            this.$conspectContainer, this.$questionContainer);
        discipline.deploy();
    }

    set(group, discipline) {
        this.setGroup(group, _ => {
            const folder = this.folder + "markdown/" + group + "/";
            this.setDiscipline(folder, discipline, this.$disciplinesContainer);
        })
    }
}
