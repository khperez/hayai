import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: 'http://localhost:4001',
      id: "",
      clients: [],
    };
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("connect", () => {
      socket.emit("addClient", socket.id);
    });
    socket.on("updateClients", res => {
      this.setState({
        clients: res,
      });
    });
  }

  render() {
    const { id } = this.state;

    const clients = this.state.clients.map(client => {
      return (
        <li key={client.id}>
          {client.username}
        </li>
      );
    });
    return (
      <div className="App">
        <div>Hello {this.state.username}</div>
        <div>
          Players
          <ul>
            {clients}
          </ul>
        </div>
        <button>Click</button>
      </div>
    );
  };
}

export default App;
