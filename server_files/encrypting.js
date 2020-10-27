const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = 'encryptedsecretpassword12345dare'
let iv = 'lslovestoplay123'

/*function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, 'secretpassword');
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex');
    return encrypted.toString();
    //encrypted = Buffer.concat([encrypted, cipher.final()]);
    //return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}*/

function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), Buffer.from(iv));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
    if (iv = Buffer.from(Buffer.from(iv), 'hex')) {
        //console.log('done');
    } else {
       // console.log('not')
    }
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    //console.log(`Decrypted ${text} to ${decrypted.toString()}`)
    return decrypted.toString();
}

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;