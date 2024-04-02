import browser from 'webextension-polyfill';

import { doGetRequest, doPostRequest } from '../../api';
import { getEndpoint, saveParsedContent } from '../../utils/db';
import { log, logError } from '../../utils/logger';

const CONTEXT_ACTIONS = {
    IMAGE: 'action::image',
    IMAGE_URL: 'action::ocr_image_url',
};

const ocrImageUrl = async (link) => {
    const endpoint = await getEndpoint();

    if (!endpoint) {
        log('Endpoint not set, ignoring OCR request');
        return;
    }

    browser.action.setBadgeText({ text: '…' });

    try {
        const url = endpoint.replace('{{url}}', encodeURIComponent(link));
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

const processBase64EncodedImage = async (encodedImageData) => {
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

const ocrLocalImage = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    log('Loaded blob');

    const reader = new FileReader();
    reader.onloadend = async (e) => {
        await processBase64EncodedImage(e.target.result);
    };
    reader.readAsDataURL(blob);
};

browser.runtime.onInstalled.addListener((details) => {
    const manifestData = browser.runtime.getManifest();

    if (details.reason === 'install') {
        log(`${manifestData.name} by ${manifestData.author} installed v${manifestData.version}.`);
    } else if (details.reason === 'update') {
        log(`${manifestData.name} by ${manifestData.author} updated to v${manifestData.version}.`);
    }

    browser.contextMenus.create({
        contexts: ['image'],
        id: CONTEXT_ACTIONS.IMAGE_URL,
        title: 'Image Url',
    });

    browser.contextMenus.create({
        contexts: ['image'],
        id: CONTEXT_ACTIONS.IMAGE,
        title: 'Image',
    });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === CONTEXT_ACTIONS.IMAGE_URL) {
        ocrImageUrl(info.srcUrl, tab);
    }

    if (info.menuItemId === CONTEXT_ACTIONS.IMAGE) {
        ocrLocalImage(info.srcUrl, tab);
    }
});

browser.runtime.onMessage.addListener((message) => {
    if (message.encodedImageData) {
        processBase64EncodedImage(message.encodedImageData);
    }
});
