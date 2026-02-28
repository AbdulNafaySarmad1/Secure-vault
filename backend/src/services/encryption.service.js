const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

class EncryptionService {
  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
    if (this.key.length !== KEY_LENGTH) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 bytes');
    }
  }

  encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const { encrypted, iv, authTag } = encryptedData;

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      this.key,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  encryptNote(content) {
    const result = this.encrypt(content);
    return JSON.stringify(result);
  }

  decryptNote(encryptedContent) {
    const parsed = JSON.parse(encryptedContent);
    return this.decrypt(parsed);
  }
}

module.exports = new EncryptionService();
