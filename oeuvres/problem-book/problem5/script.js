register("Пциклический список", _ => {
    const p = new Problem();

    p.dom.condition.innerHTML = `
    <p>Дан односвязный список, в котором может быть цикл. Необходимо найти вершину,
    в которой начинается цикл, не используя при этом дополнительную память.
    Необходимо либо решить задачу, либо обосновать приведённое ниже решение.</p>
    <details><summary>Алгоритм (решение)</summary>
    <p>Заводим два указателя. На каждой итерации первый будет перемещаться на две позиции вперёд,
    второй на одну. Если в списке есть цикл, они обязательно встретятся в одном из узлов. Если
    цикла нет, то первый указатель упрётся в конец списка.</p>
    </p>Для того, чтобы найти начало цикла, необходимо переместить один из указателей в начало
    списка. Теперь на каждой итерации оба указателя перемещаются только на одну позицию вперёд.
    После нескольких итераций они встретятся в одном узле, который и будет началом цикла.</p>
    </details>
    `;

    p.dom.sketch.hidden = true;

    p.dom.solution.innerHTML = `<img src="./problem5/solution.png"></img>`;
});
