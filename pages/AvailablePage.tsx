
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// THIS PAGE IS DEPRECATED AND NO LONGER IN USE.
// It can be safely deleted from the project.
// It now redirects to the main collection page to prevent broken links.

const AvailablePage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/collection', { replace: true });
    }, [navigate]);

    return null; // Render nothing while redirecting
};

export default AvailablePage;
