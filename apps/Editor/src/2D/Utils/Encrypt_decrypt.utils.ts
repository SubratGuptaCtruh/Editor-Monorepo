import CryptoJS from "crypto-js";
export const decrypt = (data: string | undefined) => {
    if (data) {
        const encodedEncrypted = data.replace(/_/g, "/");
        const bytes = CryptoJS.AES.decrypt(encodedEncrypted, import.meta.env.VITE_ENCRYPTION_SECRET_KEY);
        const decrypt = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return decrypt;
    }
};

export const encrypt = (data: string | undefined) => {
    if (data) {
        const encryptData = CryptoJS.AES.encrypt(JSON.stringify(data), import.meta.env.VITE_ENCRYPTION_SECRET_KEY).toString();
        const encodedEncrypted = encryptData.replace(/\//g, "_");
        return encodedEncrypted;
    }
};
