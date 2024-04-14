import browser from 'webextension-polyfill';

import { MESSAGE_TYPE_AREA_CAPTURED } from '../../utils/constants';
import { log } from '../../utils/logger';

const createSelectionRectangle = () => {
    const rect = document.createElement('div');
    rect.style.position = 'absolute';
    rect.style.border = '2px dashed red';
    rect.style.zIndex = '10000'; // Ensure it's above most page content
    rect.style.pointerEvents = 'none'; // Ensure the rectangle doesn't interfere with mouse events
    document.body.appendChild(rect);
    return rect;
};

const init = () => {
    let isSelecting = false;
    let selectionRectangle = null;
    let startX;
    let startY;

    const onMouseDown = (e) => {
        if (e.button !== 0) {
            // Ensure left click
            return;
        }

        startX = e.clientX;
        startY = e.clientY;
        document.body.style.userSelect = 'none'; // Disable text selection on the body

        selectionRectangle = createSelectionRectangle();
        selectionRectangle.style.left = `${startX}px`;
        selectionRectangle.style.top = `${startY}px`;
        isSelecting = true;
    };

    const onMouseMove = (e) => {
        if (!isSelecting || !selectionRectangle) return;
        const currentX = e.clientX;
        const currentY = e.clientY;
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        selectionRectangle.style.width = `${width}px`;
        selectionRectangle.style.height = `${height}px`;
        selectionRectangle.style.left = `${Math.min(startX, currentX)}px`;
        selectionRectangle.style.top = `${Math.min(startY, currentY)}px`;
    };

    const onMouseUp = (e) => {
        if (!isSelecting) {
            return;
        }

        const endX = e.clientX;
        const endY = e.clientY;
        isSelecting = false;
        document.body.style.userSelect = '';

        const x1 = Math.min(startX, endX) * window.devicePixelRatio;
        const x2 = Math.max(startX, endX) * window.devicePixelRatio;
        const y1 = Math.min(startY, endY) * window.devicePixelRatio;
        const y2 = Math.max(startY, endY) * window.devicePixelRatio;

        browser.runtime.sendMessage({
            coordinates: { x1, x2, y1, y2 },
            type: MESSAGE_TYPE_AREA_CAPTURED,
        });

        e.preventDefault();
        // eslint-disable-next-line no-use-before-define
        disableSelectionMode();
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            // eslint-disable-next-line no-use-before-define
            disableSelectionMode(); // Stop selection mode if escape is pressed
        }
    };

    const enableSelectionMode = () => {
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('keydown', onKeyDown);
    };

    const disableSelectionMode = () => {
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('keydown', onKeyDown);

        if (selectionRectangle) {
            document.body.removeChild(selectionRectangle);
            selectionRectangle = null;
        }
    };

    browser.runtime.onMessage.addListener((request) => {
        if (request.command === 'activateSelectionCapture') {
            enableSelectionMode();
        }
    });

    log('Content script loaded');
};

log('Content script loading...');

init();
