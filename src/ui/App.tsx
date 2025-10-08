import React from 'react';
import style from './style.module.css';
import SocketContextProvider from './src/contexts/socket';

function App() {

    return (
        <SocketContextProvider>
            <div className={style.app}>
                Everything is working!!
            </div>
        </SocketContextProvider>
    );
}

export default App;
