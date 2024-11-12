import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ handleLogout }) => {
    const navigate = useNavigate();

    const onLogout = () => {
        handleLogout();
        navigate('/login'); 
    };

    return <button onClick={onLogout}>Logout</button>;
};

export default LogoutButton;
