const fs = require("fs")

const archivoClases = "Iris2Clases.txt";
const archivoTest = "TestIris01.txt";

var clases = readClases(archivoClases);
var test = readTest(archivoTest)
console.log("SADASDASDASDASDASDASD", test);



function readClases(archivo) {
    var array = fs.readFileSync(archivo).toString().split("\r");
    array = array.toString().split("\n");
    array = array.map(line => {
        line = line.toString().split("\,");
        line = line.filter(element => element);
        return line;
    });
    return array;
}

function readTest(archivo) {
    var array = fs.readFileSync(archivo).toString().split("\r");
    array = array.toString().split("\,");
    return array;
}
