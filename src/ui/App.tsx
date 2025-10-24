import React from 'react';
import Navigation from './src/components/Navigation';
import './style.module.css';
import IpcContextProvider from './src/contexts/ipc';
import SocketContextProvider from './src/contexts/socket';

function App() {

    return (
        <Navigation />
    );
}

export default App;
