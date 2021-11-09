/**
* Finds the position where search starts in text.
* @param {string} search Text to look for
* @param {string} text Text that may contain search
*/
function findText_BruteForce(search, text) {
    if (search == '' || search.length > text.length) { return -1; }
    let limit = text.length - search.length + 1;
    for (let i = 0; i < limit; i++) {
        let equal = true;
        for (let j = 0; j < search.length; j++) {
            if (text[i + j] != search[j]) {
                equal = false;
                break;
            }
        }
        if (equal) { return i; }
    }
    return -1;
}

function FindPattern (patron, texto) {
    let flag = 0;
    let found = false;
    for (let i = 0; i < texto.length; i++) {
        if (texto[i] == patron[0]) {
            flag = i;
            found=true;
            for (let j = 1; j < patron.length; j++) {
                flag++;
                if (texto[flag] == patron[j]) {
                    found = true;
                } else {
                    found = false;
                    break;
                }                
            }
            if (found) { return i; }
        }
    }
    return -1;
}


(() => {
    console.log(findText_BruteForce('algo', 'analisis de algoritmos'));
    console.log(FindPattern('algo', 'analisis de algoritmos'));
})();