import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: 'http://localhost:4001',
      uuid: "",
      clients: [],
      clicks: 0,
      timer: 0,
      socket: null,
      winners: [],
      sGameOver: false,
      sGameStart: false,
    };
  }

  timerHandler = () => {
    if (this.state.timer === 0) {
      clearInterval(this.state.timerId);
      this.state.socket.emit("endGame", "yup it's over");
    } else {
      this.setState(prevState => {
        return {
          timer: prevState.timer - 1,
        }
      });
    }
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    this.setState({
      socket: socket,
    });
    socket.on("userDetails", res => {
      this.setState({
        uuid: res.uuid,
        name: res.name,
      });
    });
    socket.on("updateClients", clients => {
      this.setState({
        clients: clients,
      });
    });
    socket.on("startGame", res => {
      this.setState({
        timer: res.timer,
        timerId: setInterval(this.timerHandler, 1000),
        sGameStart: true,
      });
    });
    socket.on("endGame", res => {
      this.setState({
        winners: res,
        sGameOver: true,
        sGameStart: false,
      });
    });
  }

  render() {
    const clients = this.state.clients.map(client => {
      return (
        <div className="IndividualScore" key={client.uuid}>
          <div className="PlayerName">
            {client.name}
          </div>
          <div>
            {client.clicks}
          </div>
        </div>
      );
    });
    const { uuid, name, timer, clicks } = this.state;
    let winner = null;
    if (this.state.winners.length > 0) {
      winner = this.state.winners[0].name;
    }
    return (
      <div className="App">
        <div className="Title">
          Hayai
        </div>
        <div>
          <div className="Game">
            <div>UUID: {uuid}</div>
            <div>Player name: {name}</div>
            {
              this.state.sGameOver &&
              <div>Winner: {winner}</div>
            }
            <div className="Players-Container">
              <div className="Players">
                {clients} 
              </div>
            </div>
            {
              this.state.sGameStart &&
              <div>
                <div className="Timer">
                  Time left: {timer}
                </div>
                <button onClick={() => { 
                  let incClicks = clicks+1;
                  this.setState({
                    clicks: incClicks,
                  });
                  this.state.socket.emit("updateClicks", {uuid: this.state.uuid, clicks: incClicks});
                }}>Click</button>
              </div>
            }
            <div className="Game-Controls">
              <button className="Start"
                onClick={() => { this.state.socket.emit("startGame");}}
              >
                Start Game
              </button>
              <button className="Reset">Reset Game</button>
            </div>
          </div>
        </div>
      </div>
    );
  };
}

export default App;
