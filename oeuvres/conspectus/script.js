"use strict"

$(document).ready(_ => {
    const conspectus = new Conspectus("./src/", {
        $groupsContainer:      $("#groups-section"),
        $disciplinesContainer: $("#disciplines-section"),
        $questionContainer:    $("#question"),
        $conspectContainer:    $("#conspect"),
    },
    _ => conspectus.set("Природные ресурсы", "Геоморфология с основами геологии"));
});

class Conspectus {
    constructor(folder, {$groupsContainer, $disciplinesContainer, $questionContainer, $conspectContainer}, ready) {
        this.folder = folder;
        this.$groupsContainer      = $groupsContainer;
        this.$disciplinesContainer = $disciplinesContainer;
        this.$questionContainer    = $questionContainer;
        this.$conspectContainer    = $conspectContainer;

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
        this.$disciplinesContainer.empty();
        const path = this.folder + "markdown/" + name + "/";
        getListing(path, listing => {
            for (let discipline of listing) {
                const name = decodeURIComponent(discipline);
                const button = $(`<button>${name}</button>`);
                button.on("click", _ => this.setDiscipline(path, name));
                this.$disciplinesContainer.append(button);
            }
            callback && callback();
        });
    }

    setDiscipline(path, name) {
        let disciplineClass = null;
        switch(name) {
            case "Минералы и горные породы":
                disciplineClass = RocksGuessDiscipline;
                break;
            default:
                disciplineClass = DefaultDiscipline;
        }
        this.$conspectContainer.empty();
        const discipline = new disciplineClass(path, name, this.$conspectContainer, this.$questionContainer);
        discipline.deploy();
    }

    set(group, discipline) {
        this.setGroup(group, _ => {
            const folder = this.folder + "markdown/" + group + "/";
            this.setDiscipline(folder, discipline, this.$disciplinesContainer);
        })
    }
}
