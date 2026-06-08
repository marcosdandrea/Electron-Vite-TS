import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainView from "../../views/Main";
import PanelView from "../../views/Panel";
import SocketContextProvider from "../../contexts/socket";

const Navigation = () => {
    return ( 
        <BrowserRouter>
            <SocketContextProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/main" replace />} />
                    <Route path="/main" element={<MainView />} />
                    <Route path="/panel" element={<PanelView />} />
                    <Route path="*" element={<Navigate to="/main" replace />} />
                </Routes>
            </SocketContextProvider>
        </BrowserRouter>
    );
}

export default Navigation;