const MAX_AVATAR_EDGE = 512;
const AVATAR_QUALITY = 0.85;

/**
 * Reads a selected image file and returns a downscaled JPEG data URL.
 * Avatars are posted inline (base64) with the JSON payload, so sending a raw
 * 2MB photo would exceed the API request body limit. Resizing to 512px keeps
 * uploads around 30-120KB.
 */
export function fileToDownscaledDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.onload = () => {
      const source = String(reader.result || '');
      const image = new Image();

      image.onerror = () => reject(new Error('The selected file is not a valid image.'));
      image.onload = () => {
        const largestEdge = Math.max(image.width, image.height) || 1;
        const scale = Math.min(1, MAX_AVATAR_EDGE / largestEdge);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
          // Fall back to the original data URL if the canvas is unavailable.
          resolve(source);
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', AVATAR_QUALITY));
      };

      image.src = source;
    };

    reader.readAsDataURL(file);
  });
}