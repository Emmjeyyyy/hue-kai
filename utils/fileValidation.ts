const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const validateImageFile = async (file: File): Promise<ValidationResult> => {
    // 1. Check File Size
    if (file.size > MAX_FILE_SIZE) {
        return { isValid: false, error: `File size exceeds the 10MB limit (Size: ${(file.size / 1024 / 1024).toFixed(2)}MB).` };
    }

    // 2. Initial MIME type check (easy to spoof, but good first line of defense)
    if (!file.type.startsWith('image/')) {
         return { isValid: false, error: 'Invalid file type. Only images (JPG, PNG, WEBP) are allowed.' };
    }

    // 3. Magic Bytes (File Signature) Validation
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
            if (!e.target || !e.target.result) {
                resolve({ isValid: false, error: 'Failed to read file for validation.' });
                return;
            }

            const arr = new Uint8Array(e.target.result as ArrayBuffer);
            let header = "";
            for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16).padStart(2, '0').toUpperCase();
            }

            let isValidSignature = false;

            // Magic Bytes Patterns
            // JPEG: FF D8 FF
            if (header.startsWith("FFD8FF")) {
                isValidSignature = true;
            }
            // PNG: 89 50 4E 47
            else if (header.startsWith("89504E47")) {
                isValidSignature = true;
            }
            // WEBP: starts with 52 49 46 46 (RIFF) and has 57 45 42 50 (WEBP) at offset 8
            else if (header.startsWith("52494646") && header.substring(16, 24) === "57454250") {
                isValidSignature = true;
            }

            if (!isValidSignature) {
                 resolve({ isValid: false, error: `Invalid file signature. The file does not appear to be a genuine JPG, PNG, or WEBP image.` });
            } else {
                 resolve({ isValid: true });
            }
        };

        reader.onerror = () => {
            resolve({ isValid: false, error: 'File reading error during validation.' });
        }

        // We only need the first 12 bytes for magic number checking
        reader.readAsArrayBuffer(file.slice(0, 12));
    });
};
