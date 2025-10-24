import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useIpc from '../../hooks/useIpc';
import { APP_CHANNELS } from '@common/channels/app.channels';
import { SocketContext } from '../../contexts/socket';

const HomeView = () => {
    const navigate = useNavigate()

    const [systemTime, setSystemTime] = useState<number | null>(null);
    const { invoke } = useIpc();
    const { socket } = useContext(SocketContext)

    const handleOnAboutClick = () => {
        navigate('/about')
    }

    const fetchSystemTime = async () => {
        try {
            const time = await invoke(APP_CHANNELS.GET_SYSTEM_TIME, []);
            setSystemTime(time);
            console.log('System Time from Main Process:', time);
        } catch (error) {
            console.error('Error fetching system time:', error);
        }
    }

    useEffect(() => {
        fetchSystemTime();
        socket.emit('ping');
        console.log ('Sent ping to server');
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Home - Electron IPC Demo</h1>
            <p>Welcome to the Electron-Vite-TS Application!</p>
            <p>This demo shows the preload script and IPC functionality.</p>
            <p>System Time: {systemTime !== null ? systemTime : 'Loading...'}</p>

            {/* Navigation */}
            <div style={{ marginTop: '30px' }}>
                <button onClick={handleOnAboutClick} style={{ fontSize: '16px', padding: '10px 20px' }}>
                    Go to About
                </button>
            </div>
        </div>
    );
}

export default HomeView;