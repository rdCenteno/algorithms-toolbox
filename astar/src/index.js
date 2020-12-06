import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
var PF = require('pathfinding');

function Square(props) {
    let mostrar = ""
    if (props.value === 100) { mostrar = "I" }
    else if (props.value === 1) { mostrar = "X" }
    else if (props.value === 1000) { mostrar = "F" }
    else if (props.value === 2) { mostrar = "O" }
    return (
        <button className="square" onClick={props.onClick}>
            {mostrar}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(x, y) {
        return <Square
            value={this.props.currentBoard[x][y]}
            onClick={() => this.props.onClick(x, y)}
        />;
    }

    render() {
        const items = this.props.currentBoard.map((arrayRow, index) => {
            const squares = arrayRow.map((value, indexY) => {
                return this.renderSquare(index, indexY);
            });
            return <div className="board-row">
                {squares}
            </div>;
        })
        return (
            <div>
                {items}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        let initialArray = this.initialArray();
        this.state = {
            board: initialArray,
            path: {},
            indexButtom: null,
            start: null,
            end: null,
            obstacles: null,
            errorMsg: "",
        }
        this.handleClick = this.handleClick.bind(this);
        this.buttomHandle = this.buttomHandle.bind(this);
        this.findPath = this.findPath.bind(this);
        this.initialArray = this.initialArray.bind(this);
    }

    initialArray() {
        const initalLength = 12;
        let initialArray = [];
        for (let i = 0; i < initalLength; i++) {
            initialArray[i] = [];
            for (let j = 0; j < initalLength; j++) {
                initialArray[i][j] = 0;
            }
        }
        return initialArray;
    }

    handleClick(x, y) {
        let board = this.state.board;
        if (this.state.indexButtom === 1) {
            const previous = this.state.start;
            if (previous) {
                board[previous.x][previous.y] = 0;
            }
            console.log("El tablero es: ", board);
            board[x][y] = 100;
            const start = { x: x, y: y };
            console.log("El inicio del camino es: ", start);
            this.setState({ board: board, start: start });
        } else if (this.state.indexButtom === 2) {
            const previous = this.state.end;
            if (previous) {
                board[previous.x][previous.y] = 0;
            }
            board[x][y] = 1000;
            const end = { x: x, y: y };
            console.log("El fin va a estar en: ", end);
            this.setState({ board: board, end: end });
        } else if (this.state.indexButtom === 3) {
            const newObstacle = { x: x, y: y };
            let obstacles = this.state.obstacles;
            if (obstacles) {
                let found = false;
                for (let i = 0; i < obstacles.length; i++) {
                    if (newObstacle.x === obstacles[i].x && newObstacle.y === obstacles[i].y) {
                        found = true;
                        break;
                    }
                }
                if (!found && board[x][y] === 0) {
                    obstacles.push(newObstacle);
                    board[x][y] = 1;
                    console.log("Se añade un obstáculo en: ", obstacles);
                }
            } else {
                obstacles = Array(1).fill(newObstacle);
                board[x][y] = 1;
                console.log("Se añade un obstáculo en: ", obstacles);
            }
            this.setState({ board: board, obstacles: obstacles });
        }
    }

    buttomHandle(index) {
        console.log("Se selecciona el botón: ", index);
        this.setState({ indexButtom: index, errorMsg: "" });
        if (index === 4) {
            console.log("Se va a calcular el camino más corto");
            let start = this.state.start;
            let end = this.state.end;
            if(start && end) {
                this.findPath();
            } else {
                this.setState({errorMsg: "Faltan elementos por colocar"});
            }          
        } else if (index === 5) {
            console.log("Se va a reiniciar todo");
            let board = this.initialArray();
            this.setState({
                board: board,
                start: null,
                end: null,
                obstacles: null,
            });
        }
    }

    findPath() {
        let grid = new PF.Grid(12, 12);
        let start = this.state.start;
        let end = this.state.end;
        let obstacles = this.state.obstacles;
        if(obstacles) {
            obstacles.forEach(obstacle => {
                console.log("Los obstaculos son: ", obstacle)
                grid.setWalkableAt(obstacle.y, obstacle.x, false);
            });
        }
        var finder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: false
        });

        var path = finder.findPath(start.y, start.x, end.y, end.x, grid);
        console.log("El usuario quiere encontrar el camino", path);
        if (path.length > 0) {
            console.log("Path was found. The first Point is ", path);
            let boardPath = this.state.board;
            for (let i = 1; i < path.length - 1; i++) {
                let coord = path[i];
                boardPath[coord[1]][coord[0]] = 2;
            }
            this.setState({ board: boardPath });
        } else {
            const error = "No se ha podido encontrar ningún camino";
            console.log("ERROR: ", error);
            this.setState({ errorMsg: error });
        }
    }

    render() {
        const currentBoard = this.state.board;
        const error = this.state.errorMsg;
        return (
            <div className="container">

                <div className="header">
                    <div>Práctica 1: Implementación del Algoritmo A*</div>
                    <div>Ronny Demera Centeno</div>
                </div>

                <div className="botones">
                    <div>
                        <button className="boton-inicio btn" onClick={() => this.buttomHandle(1)}> Inicio</button>
                        <button className="boton-obstaculo btn" onClick={() => this.buttomHandle(3)}>Obstáculo</button>
                        <button className="boton-final btn" onClick={() => this.buttomHandle(2)}>Fin</button>
                        <button className="boton-reset btn" onClick={() => this.buttomHandle(5)}>Reset</button>
                    </div>
                    
                    <div>
                        <button className="boton-find btn" onClick={() => this.buttomHandle(4)}>Encontrar Camino</button>
                    </div>
                </div>

                <div className="game">
                    <div className="game-board">
                        <Board
                            currentBoard={currentBoard}
                            onClick={(x, y) => this.handleClick(x, y)}
                        />
                    </div>
                    <div className="game-info">
                        <div>{/* status */}</div>
                        <ol>{/* TODO */}</ol>
                    </div>
                </div>

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
    <Game />,
    document.getElementById('root')
);

serviceWorker.unregister();
