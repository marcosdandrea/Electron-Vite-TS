import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeView from "../../views/Home";
import AboutView from "../../views/About";
import PublicView from "../../views/Public";
import IpcContextProvider from "../../contexts/ipc";
import SocketContextProvider from "../../contexts/socket";

const Navigation = () => {
    return ( 
        <BrowserRouter>
            <IpcContextProvider>
                <SocketContextProvider>
                    <Routes>
                        <Route path="/" element={<HomeView />} />
                        <Route path="/about" element={<AboutView />} />
                        <Route path="/public" element={<PublicView />} />
                    </Routes>
                </SocketContextProvider>
            </IpcContextProvider>
        </BrowserRouter>
    );
}

export default Navigation;