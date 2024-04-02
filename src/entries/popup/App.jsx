import { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';

import { getParsedContent, saveParsedContent } from '../../utils/db';

import './App.css';

const App = () => {
    const [body, setBody] = useState('');

    useEffect(() => {
        getParsedContent().then(setBody);
        browser.action.setBadgeText({ text: '' });
    }, []);

    const uploadImage = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            browser.runtime.sendMessage({ encodedImageData: base64Image });
        };
        reader.readAsDataURL(file);
    };

    const handlePaste = async (event) => {
        const { items } = event.clipboardData || window.clipboardData;
        for (let i = 0; i < items.length; i += 1) {
            // Check if the pasted item is an image
            if (items[i].type.indexOf('image') === 0) {
                const file = items[i].getAsFile();
                uploadImage(file);
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                uploadImage(file);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <main>
            <textarea
                dir="rtl"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onPaste={handlePaste}
                rows={20}
                value={body}
            />
            <button
                onClick={() => {
                    setBody('');
                    saveParsedContent('');
                    browser.action.setBadgeText({ text: '' });
                }}
            >
                Clear
            </button>
        </main>
    );
};

export default App;
