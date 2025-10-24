import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../../contexts/socket';

const AboutView = () => {
    const navigate = useNavigate()
    const { socket } = useContext(SocketContext)

    const handleOnHomeClick = () => {
        navigate('/')
    }

    useEffect(() => {
        socket.emit('ping');
    }, []);

    return ( 
        <div>
            <h1>About</h1>
            <h3> Developed by Marcos D'Andrea - 2025</h3>
            <p>This application is built using Electron, Vite, and TypeScript.</p>
            <p>It serves as a template for developing desktop applications with modern web technologies.</p>
            <button onClick={handleOnHomeClick}>
                Home
            </button>
        </div>
     );
}
 
export default AboutView;