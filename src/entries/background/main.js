import browser from 'webextension-polyfill';

import { MESSAGE_TYPE_AREA_CAPTURED } from '../../utils/constants';
import { log } from '../../utils/logger';
import { CONTEXT_ACTIONS, ocrSelectedArea, processBase64EncodedImage } from './actions';

browser.runtime.onInstalled.addListener((details) => {
    const manifestData = browser.runtime.getManifest();

    if (details.reason === 'install') {
        log(`${manifestData.name} by ${manifestData.author} installed v${manifestData.version}.`);
    } else if (details.reason === 'update') {
        log(`${manifestData.name} by ${manifestData.author} updated to v${manifestData.version}.`);
    }

    Object.entries(CONTEXT_ACTIONS).forEach(([id, { contexts, title }]) => {
        browser.contextMenus.create({
            contexts,
            id,
            title,
        });
    });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    const action = CONTEXT_ACTIONS[info.menuItemId];

    if (action) {
        log(info.menuItemId, 'triggered');
        action.handler(info, tab);
    }
});

browser.runtime.onMessage.addListener((message, sender) => {
    if (message.encodedImageData) {
        processBase64EncodedImage(message.encodedImageData);
    }

    if (message.type === MESSAGE_TYPE_AREA_CAPTURED && message.coordinates) {
        log('Received coordinates:', message.coordinates);
        ocrSelectedArea(message.coordinates, sender.tab);
    }
});
