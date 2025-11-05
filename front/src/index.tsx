import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

root.render(
    <React.StrictMode>
        <CookiesProvider>
            <BrowserRouter>
                <GoogleOAuthProvider clientId={googleClientId}>
                    <App />
                </GoogleOAuthProvider>
            </BrowserRouter>
        </CookiesProvider>
    </React.StrictMode>
);