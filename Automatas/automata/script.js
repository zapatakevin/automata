const inputTable = document.getElementById('input-table');

let ndGraph, dGraph, rGraph, currentGraphType = 0;

function addState() {
    const newRow = inputTable.insertRow();
    const colCount = inputTable.rows[2].cells.length;
    for (let i = 0; i < colCount; i++) {
        const cell = newRow.insertCell();
        cell.contentEditable = true;
    }
}

function addInput() {
    const colCount = inputTable.rows[inputTable.rows.length - 1].cells.length - 2;
    inputTable.rows[0].cells[1].colSpan++;
    const rowCount = inputTable.rows.length - 2;
    for (let i = 0; i < rowCount + 1; i++) {
        const cell = inputTable.rows[i + 1].insertCell(colCount);
        cell.contentEditable = true;
    }
}

function readInput() {
    const inputCells = inputTable.rows[1].cells;

    const inputs = [];
    for (let i = 0; i < inputCells.length; i++) {
        const text = inputCells[i].innerText.trim();
        if (text === '') { break; }
        inputs.push(text);
    }
    if (inputs.length < 2) {
        showAlert('Entradas inválidas.');
        return;
    }

    const states = [];
    for (let i = 2; i < inputTable.rows.length; i++) {
        const text = inputTable.rows[i].cells[0].innerText.trim();
        if (text === '') { break; }
        states.push(text);
    }
    if (states.length < 2) {
        showAlert('Entradas inválidas.');
        return;
    }

    const data = {};
    for (let i = 0; i < states.length; i++) {
        const row = {};
        for (let j = 0; j < inputs.length; j++) {
            let text = inputTable.rows[i+2].cells[j+1].innerText.trim().replace(/ /g, '');
            if (text.toUpperCase() === 'ERROR') { text = ''; }
            if (!validateValue(text, states)) {
                showAlert(`Valor no válido en [${states[i]}, ${inputs[j]}].`);
                return;
            }
            row[inputs[j]] = text;
        }
        const text = inputTable.rows[i+2].cells[inputCells.length+1].innerText.trim().toUpperCase();
        row.accept = !['', '0', 'FALSE', 'NO'].includes(text);
        data[states[i]] = row;
    }
    showAlert();
    const result = { states, inputs, data };
    ndGraph = drawAutomaton(JSON.parse(JSON.stringify(result)));
    return result;
}

function validateValue(value, states) {
    if (value === '') { return true; }
    const parts = value.split(',');
    for (const part of parts) {
        if (!states.includes(part)) { return false; }
    }
    return true;
}

function validateInput() {
    const inputObj = readInput();
    if (!inputObj) { return; }

    const {states, inputs, data} = inputObj;
    let type = 'Determinístico';
    for (const state of states) {
        if (state === 'Error') { continue; }
        for (const input of inputs) {
            if (data[state][input].split(',').length > 1) {
                type = 'Algoritmo no determinista';
                break;
            }
        }
    }
    showInfo(`El autómata introducido es <strong>${type}</strong>`);
    makeDeterministic();
}

function drawAutomaton(inputObj) {
    const {states, inputs, data} = inputObj;
    const nodes = [];
    let errorFound = false;
    for (const state of states) {
        for (const input of inputs) {
            if (data[state][input] === '') {
                data[state][input] = 'Error';
                errorFound = true;
            }
        }
    }
    if (errorFound) {
        const errorData = {};
        states.push('Error');
        data['Error'] = errorData;
    }

    for (const state of states) {
        let node;
        if (state === 'Error') {
            node = new Node({
                id: state,
                connections: [],
            });
        } else {
            const conns = [];
            for (const input of inputs) {
                const parts = data[state][input].split(',');
                conns.push(...parts.map(part => ({ id: part, cost: input })));
            }
            const finalConns = [];
            for (const conn of conns) {
                const found = finalConns.find(c => c.id === conn.id);
                if (found) {
                    found.cost = [found.cost, conn.cost].sort(alphabeticalSort).join();
                } else {
                    finalConns.push(conn);
                }
            }
            node = new Node({
                id: state,
                connections: finalConns,
                accept: data[state].accept
            });
        }
        nodes.push(node);
    }
    nodes[0].start = true;
    return new Graph(nodes);
}

function makeDeterministic() {
    const { states, inputs, data } = readInput();
    if (!data) { return; }

    const newStates = [states[0]];
    const newData = {};
    newData[states[0]] = {
        states: [states[0]],
        accept: data[states[0]].accept
    };

    for (const nState of newStates) {
        let accepts = false;
        for (const input of inputs) {
            const values = [];
            for (const state of newData[nState].states) {
                if (data[state][input] && data[state][input] !== '') {
                    const parts = data[state][input].split(',');
                    for (const part of parts) { if (!values.includes(part)) { values.push(part); } }
                }
                if (data[state].accept) { accepts = true; }
            }
            let vState = values.sort(alphabeticalSort).join('');
            if (vState === '') { vState = 'Error';}
            newData[nState][input] = vState;
            if (!newStates.includes(vState)) {
                newStates.push(vState);
                newData[vState] = { states: values };
            }
        }
        newData[nState].accept = accepts;
    }

    const result = {
        states: newStates.sort((a, b) => {
            if (a === 'Error') { return 1; }
            if (b === 'Error') { return -1; }
            return 0;
        }),
        inputs,
        data: newData
    };
    drawAutomatonTable('outTable', result);
    dGraph = drawAutomaton(result);
    changeGraph(currentGraphType);
    reduce(result);
}

function reduce({states, inputs, data}) {
    const partitions = [[], []];
    for (const state of states) {
        if (data[state].accept) {
            partitions[1].push(state);
        } else {
            partitions[0].push(state);
        }
    }
    let iterationLimit = 1000;
    let complete = false;
    while(!complete && iterationLimit-- > 0) {
        complete = true;
        for (let pt = 0; pt < partitions.length; pt++) {
            for (const input of inputs) {
                const newPartitions = {};
                for (const state of partitions[pt]) {
                    const value = data[state][input];
                    const container = partitions.findIndex(p => p.includes(value));
                    if (newPartitions[container]) {
                        newPartitions[container].push(state);
                    } else {
                        newPartitions[container] = [state];
                    }
                }

                const keys = Object.keys(newPartitions);
                if (keys.length > 1) {
                    complete = false;
                    partitions[pt] = newPartitions[keys[0]];
                    for (let i = 1; i < keys.length; i++) { partitions.push(newPartitions[keys[i]]); }
                    break;
                }
            }
            if (!complete) { break; }
        }
    }

    const newStates = partitions.map(p => p.sort(alphabeticalSort).join(''));
    const newData = {};
    for (let i = 0; i < partitions.length; i++) {
        newData[newStates[i]] = {
            accept: partitions[i].some(s => data[s].accept),
        };
        for (const input of inputs) {
            const value = data[partitions[i][0]][input];
            const index = partitions.findIndex(p => p.includes(value));
            newData[newStates[i]][input] = newStates[index];
        }
    }
    const result = { states: newStates.sort((a, b) => {
        if (a === states[0]) { return -1; }
        if (b === states[0]) { return 1; }
        if (a.includes(states[0])) { return -1; }
        if (b.includes(states[0])) { return 1; }
        if (a.includes('Error')) { return 1; }
        if (b.includes('Error')) { return -1; }
        return 0;
    }), inputs, data: newData };
    drawAutomatonTable('reduceTable', result);
    rGraph = drawAutomaton(result);
    changeGraph(currentGraphType);
}

function changeGraph(type) {
    currentGraphType = type;
    switch (type) {
        case 0: graph = ndGraph; break;
        case 1: graph = dGraph; break;
        case 2: graph = rGraph; break;
    }
    document.querySelectorAll('.tab-block a').forEach(elem => elem.classList.remove('active'));
    document.getElementById('graph-tab-' + type).classList.add('active');
}

function drawAutomatonTable(target, {states, inputs, data}) {
    const html = `<table class="table table-celled">
        <thead>
            <tr>
                <th rowspan="2">Estados</th>
                <th colspan="${inputs.length}">Símbolos de entrada</th>
                <th rowspan="2">Acepta/Rechaza</th>
            </tr>
            <tr>${inputs.map(i => `<td>${i}</td>`).join('')}</tr>
        </thead>
        <tbody>
            ${states.map(s => `<tr><td>${s}</td>
            ${inputs.map(i => `<td>${data[s][i]}</td>`).join('')}
            <td>${data[s].accept ? 1 : 0}</td></tr>`).join('')}
        </tbody>
    </table>`;
    document.getElementById(target).innerHTML = html;
}

function showAlert(message) {
    const elem = document.getElementById('alert-message');
    if (message) {
        elem.innerText = message;
        elem.classList.remove('d-none');
    } else {
        elem.classList.add('d-none');
    }
}

function showInfo(message) {
    const elem = document.getElementById('info-message');
    if (message) {
        elem.innerHTML = message;
        elem.classList.remove('d-none');
    } else {
        elem.classList.add('d-none');
    }
}

async function init() {
    while (!graph) { await sleep(100); }
    readInput();
    dGraph = null;
    rGraph = null;

    changeGraph(0);
}

function alphabeticalSort(a, b) {
    if (a < b) { return -1; }
    if (a > b) { return 1; }
    return 0;
}

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

init();
