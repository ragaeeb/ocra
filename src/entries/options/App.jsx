import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { getEndpoint, saveEndpoint } from '../../utils/db';

import './App.css';

function App() {
    const [endpoint, setEndpoint] = useState('');

    useEffect(() => {
        getEndpoint().then(setEndpoint);
    }, []);

    return (
        <main>
            GET Endpoint for Image URLs:{' '}
            <input
                onChange={(e) => {
                    setEndpoint(e.target.value);
                }}
                style={{ width: '80%' }}
                value={endpoint}
            />
            <button
                onClick={() => {
                    if (endpoint.includes('{{url}}')) {
                        saveEndpoint(endpoint.trim());
                        toast.success('Saved');
                    } else {
                        toast.error('Endpoint must include {{url}}');
                    }
                }}
            >
                Save
            </button>
            <Toaster />
        </main>
    );
}

export default App;
