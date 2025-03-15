const crypto = require("crypto");
const { SECRET_KEY } = require("../config");

function getKeyFromSecret(secret) {
    return crypto.createHash("sha256").update(secret).digest();
}

// Encryption function
function encrypt(text) {
    const key = getKeyFromSecret(SECRET_KEY);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + encrypted; 
}

// Decryption function
function decrypt(encrypted) {
    if (!encrypted) return null;

    try {
        const key = getKeyFromSecret(SECRET_KEY);
        const iv = Buffer.from(encrypted.slice(0, 32), 'hex');
        const encryptedText = encrypted.slice(32);

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (err) {
        console.error("❌[ERROR] Decrypting error:", err.message);
        return null;
    }
}

module.exports = { encrypt, decrypt };