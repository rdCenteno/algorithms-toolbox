import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Tree from 'react-tree-graph';
import * as serviceWorker from './serviceWorker';

var DecisionTree = require("decision-tree");

const fs = window.require("fs");

var app = window.require('electron').remote;
var dialog = app.dialog;

class TreeP extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            datosJuego: null,
            atributos: null,
            errorMsg: "",
            dt: null,
            predicciones: null,
            resultado: null
        }
        this.leerDatos = this.leerDatos.bind(this);
        this.leerAtributos = this.leerAtributos.bind(this);
        this.crearArbol = this.crearArbol.bind(this);
        this.createTree = this.createTree.bind(this);
        this.reset = this.reset.bind(this);
    }

    leerDatos() {
        console.log("Se van a leer los datos");
        dialog.showOpenDialog({
            properties: ['openFile']
        }).then(result => {
            var filepath = result.filePaths[0];
            console.log("Se ha seleccionado el archivo", filepath);
            var lines = fs.readFileSync(filepath, "utf-8").split("\n").filter(Boolean);
            var data = lines.map(line => {
                var array = line.toString().split("\,");
                array = array.toString().split("\r");
                return array.filter(element => element);
            });
            data = data.map(auxArray => auxArray.toString().split("\,"));
            console.log("No file selected", data);
            this.setState({ datosJuego: data, errorMsg: null });
        }).catch(err => {
            this.setState({ errorMsg: "No se ha podido leer el archivo" });
            console.log(err)
        });
    }

    leerAtributos() {
        console.log("Se van a leer los atributos");
        dialog.showOpenDialog({
            properties: ['openFile']
        }).then(result => {
            var filepath = result.filePaths[0];
            console.log("Se ha seleccionado el archivo", filepath);
            var array = fs.readFileSync(filepath).toString().split("\r");
            array = array.toString().split("\n");
            array = array.toString().split("\,");
            console.log("Los atributos son: ", array);
            this.setState({ atributos: array, errorMsg: null });
        }).catch(err => {
            this.setState({ errorMsg: "No se ha podido leer el archivo" });
            console.log(err)
        })
    }

    crearArbol() {
        if (this.state.atributos && this.state.datosJuego) {
            var atributos = this.state.atributos.filter(element => element);
            var trainingData = this.state.datosJuego.map(data => {
                var result = {};
                atributos.forEach((key, i) => result[key] = data[i]);
                return result;
            });
            var className = atributos.pop();


            var dt = new DecisionTree(trainingData, className, atributos);
            var treeJson = dt.toJSON();
            console.log("AAAAAAAAAAAAAA", treeJson);
            var result = this.createTree(treeJson);
            this.setState({ data: result, atributos: atributos, dt: dt });
        } else {
            this.setState({ errorMSg: "Tienes que tener seleccionados dos archivos con los datos y atributos" });
        }
    }

    createTree(jsonTree) {
        var data = {};
        var children = [];
    
        data["name"] = jsonTree.name;
        if (jsonTree.type === "result") {
            console.log("LLego a un result");
        } else if (jsonTree.type === "feature_value") {
            if (jsonTree.child) {
                var res = this.createTree(jsonTree.child);
                children.push(res);
            }
        } else if (jsonTree.type === "feature") {
            if (jsonTree.vals) {
                jsonTree.vals.forEach(child => {
                    var res = this.createTree(child);
                    children.push(res);
                });
            }
            console.log("Termino un nodo feature", data);
        }
        data["children"] = children;
        return data;
    }

    reset () {
        this.setState({
            data: null,
            datosJuego: null,
            atributos: null,
            errorMsg: "Se ha reseteado el estado",
            dt: null,
            predicciones: null,
            resultado: null
        });
    }

    leerPrediccion() {
        console.log("Se van a leer los atributos");
        dialog.showOpenDialog({
            properties: ['openFile']
        }).then(result => {
            var filepath = result.filePaths[0];
            console.log("Se ha seleccionado el archivo", filepath);
            var array = fs.readFileSync(filepath).toString().split("\r");
            array = array.toString().split("\n");
            array = array.toString().split("\,");
            console.log("Los atributos son: ", array);

            var res = {};
            this.state.atributos.forEach((key, i) => res[key] = array[i]);

            var predicted_class = this.state.dt.predict(res);
            this.setState({ predicciones: array, resultado: predicted_class });
        }).catch(err => {
            this.setState({ errorMsg: "No se ha podido leer el archivo" });
            console.log(err)
        })
    }

    render() {
        const dataTree = this.state.data;
        const error = this.state.errorMsg;
        const prediccion = this.state.dt ? true : false;
        const atributos = this.state.atributos;
        const final = this.state.predicciones ? true : false;
        const predicciones = this.state.predicciones;
        const resultado = this.state.resultado;
        return (
            <div className="container">

                <div className="header">
                    <div>Práctica 2: Implementación del Algoritmo ID3*</div>
                    <div>Ronny Demera Centeno</div>
                </div>

                <div className="botones">
                    <div>
                        <button className="boton-inicio btn" onClick={() => this.leerDatos()}>Selecciona un fichero CON LOS DATOS del juego</button>
                        <button className="boton-obstaculo btn" onClick={() => this.leerAtributos()}>Selecciona un fichero CON LOS ATRIBUTOS</button>
                        {prediccion && <div>
                            <button className="boton-final btn" onClick={() => this.leerPrediccion()}>Selecciona un fichero CON LA PREDICCION</button>
                            <div>El fichero tiene que seguir el modelo: {atributos.toString()} </div>
                        </div>}
                        <button className="boton-reset btn" onClick={() => this.reset()}>RESET</button>
                    </div>

                    {!prediccion && <div>
                        <button className="boton-find btn" onClick={() => this.crearArbol()}>Crea tu arbol de Desición</button>
                    </div>}
                </div>

                <div className="game">
                    {dataTree && <Tree
                        data={dataTree}
                        height={500}
                        width={500} />}
                </div>

                {final && <div>
                    <div>El resultado para {predicciones.toString()}  es :   {resultado}</div>
                
                </div>}

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
    <TreeP />,
    document.getElementById('root')
);

serviceWorker.unregister();
