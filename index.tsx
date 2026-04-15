import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminDhevv from './AdminDhevv';
import Terms from './Terms';
import About from './About';
import Privacy from './Privacy';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const path = window.location.pathname;

root.render(
  <React.StrictMode>
    {path === '/admindhevv' ? <AdminDhevv /> : 
     path === '/terms' ? <Terms /> : 
     path === '/about' ? <About /> : 
     path === '/privacy' ? <Privacy /> : 
     <App />}
  </React.StrictMode>
);