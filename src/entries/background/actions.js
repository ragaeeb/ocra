import browser from 'webextension-polyfill';

import { doGetRequest, doPostRequest } from '../../api';
import { getEndpoint, saveParsedContent } from '../../utils/db';
import { cropBase64Image } from '../../utils/io';
import { log, logError } from '../../utils/logger';

const handleOCRImageUrl = async (info) => {
    const endpoint = await getEndpoint();

    if (!endpoint) {
        log('Endpoint not set, ignoring OCR request');
        return;
    }

    browser.action.setBadgeText({ text: '…' });

    try {
        const url = endpoint.replace('{{url}}', encodeURIComponent(info.srcUrl));
        log(`OCR Url`, endpoint, url);

        const { body } = await doGetRequest(url);

        if (body) {
            await saveParsedContent(body);
            browser.action.setBadgeText({ text: '1' });
        } else {
            browser.action.setBadgeText({ text: '' });
        }
    } catch (error) {
        logError(error);
        browser.action.setBadgeText({ text: '' });
    }
};

export const processBase64EncodedImage = async (encodedImageData) => {
    const endpoint = await getEndpoint();

    if (!endpoint) {
        throw new Error('Endpoint not set');
    }

    browser.action.setBadgeText({ text: '…' });

    log(`OCR Image`, endpoint);

    const { body } = await doPostRequest(endpoint, {
        encodedImageData,
    });

    await saveParsedContent(body);
    browser.action.setBadgeText({ text: '1' });
};

const handleOCRLocalImage = async (info) => {
    const response = await fetch(info.srcUrl);
    const blob = await response.blob();
    log('Loaded blob');

    const reader = new FileReader();
    reader.onloadend = async (e) => {
        await processBase64EncodedImage(e.target.result);
    };
    reader.readAsDataURL(blob);
};

const handleCapturePageArea = (info, tab) => {
    browser.tabs.sendMessage(tab.id, { command: 'activateSelectionCapture' });
};

const handleCaptureVisiblePage = async (info, tab) => {
    try {
        // Ensure we have a valid window ID
        const windowId = tab?.windowId && tab.windowId !== -1 ? tab.windowId : (await browser.windows.getCurrent()).id;

        // Capture the visible portion of the tab
        const dataUrl = await browser.tabs.captureVisibleTab(windowId, { format: 'png' });

        // Open a new tab displaying the captured image using a data URL
        await browser.tabs.create({ url: dataUrl });
    } catch (error) {
        console.error('Error capturing visible page:', error);
    }
};

export const ocrSelectedArea = async ({ x1, x2, y1, y2 }, tab) => {
    try {
        log('Capture screenshot');
        const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
        log('Crop screenshot to selection');
        const croppedImage = await cropBase64Image(dataUrl, { x1, x2, y1, y2 });

        log('Send cropped image for OCR');
        processBase64EncodedImage(croppedImage);
        log('Sent image for processing');
    } catch (error) {
        logError('ocrSelectedArea', error);
        browser.action.setBadgeText({ text: 'X' });
    }
};

export const CONTEXT_ACTIONS = {
    AREA_CAPTURE: {
        contexts: ['all'],
        handler: handleCapturePageArea,
        title: 'OCR Area',
    },
    IMAGE: {
        contexts: ['image'],
        handler: handleOCRLocalImage,
        title: 'Image',
    },
    IMAGE_URL: {
        contexts: ['image'],
        handler: handleOCRImageUrl,
        title: 'Image URL',
    },
    VISIBLE_CAPTURE: {
        contexts: ['all'],
        handler: handleCaptureVisiblePage,
        title: 'Screenshot Visible',
    },
};
