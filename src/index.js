import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      style={{ background: props.highlight ? 'red' : 'white' }}
      className="square"
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        highlight={this.props.winningSquares.includes(i) ? true : false }
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }


  render() {
    return (
      <div>
        {
          [1, 2, 3].map((i) => {
            return (
              <div key={i} className="board-row">
                {
                  [1, 2, 3].map((j) => this.renderSquare(j + i * 3 - 4))
                }
              </div>
            )
          })
        }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        player: null,
        position: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      historyDirection: 'column'
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        player: squares[i],
        position: i
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  changeHistoryDirection() {
    this.setState({
      historyDirection: this.state.historyDirection === 'column' ? 'column-reverse' : 'column'
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const result = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ` [${step.player} on ${Math.floor(step.position / 3) + 1}, ${step.position % 3 + 1}]`:
        'Go to game start';
      return (
        <li key={move}>
          <button style={{fontWeight: this.state.stepNumber === move ? 'bold' : 'normal'}} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    })
    let status;
    let winner;
    let winningSquares = [];
    if (result) {
      [winner, winningSquares] = result;
      status = 'Winner: ' + winner;
    } else if (current.squares.every((square) => square)) {
      status = 'A draw';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            winningSquares={winningSquares}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol style={{display: 'flex', flexDirection: this.state.historyDirection}}>{moves}</ol>
          <button onClick={() => {this.changeHistoryDirection()}}>reverse</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);


function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], [a, b, c]];
    }
  }
  return null;
}