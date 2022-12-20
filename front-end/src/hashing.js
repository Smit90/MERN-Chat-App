const cryptoJS = require('crypto-js');

const algorithm = process.env.REACT_APP_ALGORITHM;
const secretKey = process.env.REACT_APP_HASHING_SECRET;
// const iv = crypto.randomBytes(16);

const encrypt = (text) => {
    return cryptoJS.AES.encrypt(text, secretKey).toString()
    // const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    // const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    // return {
    //     iv: iv.toString('hex'),
    //     content: encrypted.toString('hex')
    // };
};

const decrypt = (hash) => {
    // const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
    // const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    // return decrpyted.toString();

    var bytes = cryptoJS.AES.decrypt(hash, secretKey);
    return bytes.toString(cryptoJS.enc.Utf8)
};

module.exports = {
    encrypt,
    decrypt
};