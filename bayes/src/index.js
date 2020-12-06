import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
var NaiveBayesClassifier = require('naivebayesclassifier');

const fs = window.require("fs");

var app = window.require('electron').remote;
var dialog = app.dialog;

class MainCom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clases: null,
            tests: null,
            errorMsg: "",
            archivoClases: null,
            archivosTest: null,
            resultado: null,
            lineasTest: null,
            categorias: null,
            valores: null
        }
        this.bayes = this.bayes.bind(this);
        this.leerClases = this.leerClases.bind(this);
        this.leerTests = this.leerTests.bind(this);
        this.readTest = this.readTest.bind(this);
        this.readClases = this.readClases.bind(this);
        this.reset = this.reset.bind(this);
    }

    leerClases() {
        console.log("Se van a leer los datos");
        dialog.showOpenDialog({
            properties: ["openFile"]
        }).then(result => {
            var filepath = result.filePaths[0];
            var clases = this.readClases(filepath);
            var filename = filepath.replace(/^.*[\\\/]/, '');
            console.log("Se han seleccionado los archivos: ", filepath);
            this.setState({ clases: clases, errorMsg: null, archivoClases: filename });
        }).catch(err => {
            this.setState({ errorMsg: "No se ha podido leer el archivo" });
            console.log(err)
        });
    }

    leerTests() {
        console.log("Se van a leer los datos");
        dialog.showOpenDialog({
            properties: ["openFile", 'multiSelections']
        }).then(result => {
            var tests = [];
            var archivosTest = result.filePaths.map(path => {
                var test = this.readTest(path);
                console.log("AAAS: ", test);
                tests.push(test);
                return path.replace(/^.*[\\\/]/, '');
            });
            console.log("Los archivos para los tests son", archivosTest);
            this.setState({ tests: tests, archivosTest: archivosTest, errorMsg: null });
        }).catch(err => {
            this.setState({ errorMsg: "No se ha podido leer el archivo" });
            console.log(err)
        });
    }

    bayes() {
        if (this.state.clases && this.state.tests) {
            var splitOnChar = function(text) {
                var rgxPunctuation = /[^.(a-zA-ZA-Яa-я0-9_)+\s]/g
                var sanitized = text.replace(rgxPunctuation, ' ')
                return sanitized.split('');
            };
            var classifier = new NaiveBayesClassifier({ tokenizer: splitOnChar });
            var categorias = [];
            var myMap = {};
            const cc =  this.state.clases;
            const aa =  this.state.clases;
            aa.forEach((clase) => {
                var num = clase.length - 1;
                var final = clase[num];
                var join = clase.slice(0, num);
                join = join.join(", ");
                classifier.learn(join, final);
            });
            Object.entries(classifier.categories).forEach(element => {
                categorias.push(element[0]);
                myMap[element[0]] = [];
            })
            cc.forEach((clase) => {
                var final = clase.pop();
                var join = clase.join(", ");
                myMap[final].push(join);
            });
            console.log("Despues de todos los learn", myMap);
            var lineas = [];
            var resultados = this.state.tests.map((test) => {
                var res = test.join(", ");
                lineas.push(res);
                return classifier.categorize(res);
            })
            console.log("LOSSOSOSO RESULTADOS SON", resultados);
            resultados = resultados.map(res => res.category);
            this.setState({ resultado: resultados, errorMsg: null, lineas: lineas, categorias: myMap });
        } else {
            this.setState({ errorMsg: "Faltan Elementos, comprueba que has añadido todos los archivos" });
            console.log("Faltan elementos");
        }
    }

    reset() {
        this.setState({
            clases: null,
            tests: null,
            archivoClases: null,
            archivosTest: null,
            resultado: null,
            errorMsg: "Se ha reseteado el estado",
            lineas: null,
            categorias: null,
            valores: null
        });
    }

    readTest(archivo) {
        var array = fs.readFileSync(archivo, "utf-8").toString().split("\r");
        array = array.toString().split("\,");
        return array;
    }

    readClases(archivo) {
        var array = fs.readFileSync(archivo).toString().split("\r");
        array = array.toString().split("\n");
        array = array.map(line => {
            line = line.toString().split("\,");
            line = line.filter(element => element);
            return line;
        });
        return array;
    }

    render() {
        const error = this.state.errorMsg;
        const mostrar = this.state.clases && this.state.tests;
        const resultado = this.state.resultado;
        const archivoClases = this.state.archivoClases;
        const archivosTest = this.state.archivosTest;
        const tests = this.state.lineas;
        const categorias = this.state.categorias;

        var items = []
        var itemsCategoria = [];
        if (resultado) {
            for (const [index, value] of resultado.entries()) {
                items.push(<li key={index}>{tests[index]}:  {value}</li>)
            }

            itemsCategoria.push(<h1>Clases</h1>);
            Object.entries(categorias).forEach(element => {
                itemsCategoria.push(<h3 className="columna">{element[0]}</h3>);
                console.log("PPPPPPPPPPPPPPPPP", element);
                element[1].forEach(linea => {
                    itemsCategoria.push(<li> {linea.toString()}</li>);
                });
            })
        }
        return (
            <div className="container">

                <div className="header">
                    <div>Práctica 3: Métodos de Clasificación</div>
                    <div>Ronny Demera Centeno</div>
                </div>

                <div className="selection">
                    <div>Primer Paso: Seleccionar los archivos de Clases y los Tests</div>
                    <div>
                        <button className="boton-selection btn" onClick={() => this.leerClases()}>LEER CLASES</button>
                    </div>
                    {archivoClases && <div>Has seleccionado el archivo de clases:    {archivoClases}</div>}
                    <div>
                        <button className="boton-selection btn" onClick={() => this.leerTests()}>LEER TESTS</button>
                    </div>
                    {archivosTest && <div>Has seleccionado los archivo de tests:    {archivosTest.toString()}</div>}
                </div>

                {mostrar && <div className="botones">
                    <div>
                        <button className="boton-inicio btn" onClick={() => this.bayes()}>APLICAR BAYES</button>
                        <button className="boton-reset btn" onClick={() => this.reset()}>RESET</button>
                    </div>
                </div>}

                {resultado &&
                    <div className="clases">
                        {itemsCategoria}
                    </div>
                }

                {resultado &&
                    <div className="resultados">
                        <h2>La categorias de los ejemplos son: </h2>
                        {items}
                    </div>
                }

                {error &&
                    <div className="alert">
                        <strong>{error}</strong>
                    </div>
                }
            </div>
        );
    }
}

ReactDOM.render(
    <MainCom />,
    document.getElementById('root')
);

serviceWorker.unregister();
