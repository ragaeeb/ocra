const blobToDataURL = async (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Crops a base64 encoded image.
 *
 * @param {string} base64Image The base64 encoded string of the original image.
 * @param {object} cropCoords The coordinates to crop the image to, containing x1, y1, x2, y2.
 * @returns {Promise<string>} A promise that resolves with the cropped base64 encoded image.
 */
export const cropBase64Image = async (base64Image, cropCoords) => {
    // Convert the base64 image URL to a Blob using fetch
    const response = await fetch(base64Image);
    const blob = await response.blob();

    // Create an ImageBitmap from the Blob
    const imageBitmap = await createImageBitmap(blob);

    // Set up an OffscreenCanvas to perform the crop
    const width = cropCoords.x2 - cropCoords.x1;
    const height = cropCoords.y2 - cropCoords.y1;
    const offscreenCanvas = new OffscreenCanvas(width, height);
    const ctx = offscreenCanvas.getContext('2d');

    // Draw the image bitmap to the canvas, cropping it in the process
    ctx.drawImage(
        imageBitmap,
        cropCoords.x1,
        cropCoords.y1, // Start clipping
        width,
        height, // Clipping width and height
        0,
        0, // Place the clipped part at the top left of the canvas
        width,
        height, // Desired size of the clipped part
    );

    // Convert the offscreen canvas content to a Blob
    const croppedBlob = await offscreenCanvas.convertToBlob();

    // Convert Blob to Data URL
    return blobToDataURL(croppedBlob);
};
