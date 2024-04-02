import browser from 'webextension-polyfill';

import { logError } from './logger';

const IMAGE_URL_ENDPOINT_KEY = 'endpoint';
const PARSED_CONTENT_KEY = 'parsed_content';

const saveValue = async (key, value) => {
    try {
        await browser.storage.local.set({ [key]: value });
    } catch (ex) {
        logError('Error trying browser.storage.local.set', ex);
    }
};

const getValue = async (key) => {
    const records = await browser.storage.local.get(key);
    return records && records[key];
};

export const removeValue = async (key) => {
    return browser.storage.local.remove(key);
};

export const getEndpoint = async () => {
    const result = await getValue(IMAGE_URL_ENDPOINT_KEY);
    return result || '';
};

export const getParsedContent = async () => {
    const result = await getValue(PARSED_CONTENT_KEY);
    return result || '';
};

export const saveEndpoint = async (value) => {
    return saveValue(IMAGE_URL_ENDPOINT_KEY, value);
};

export const saveParsedContent = async (value) => {
    return saveValue(PARSED_CONTENT_KEY, value);
};
