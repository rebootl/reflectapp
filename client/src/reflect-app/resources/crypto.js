import base64EncArr from 'encode-madmurphy.js';

async function genKey(password) {
  const encodedPassword = new TextEncoder().encode(password);
  return window.crypto.subtle.importKey(
    "raw",
    encodedPassword,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

async function genEncryptionKey (password, salt) {
  const encoded = new TextEncoder().encode(password);
  const key = await crypto.subtle.importKey('raw', encoded, { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey({
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: new TextEncoder().encode(salt),
      iterations: 1000
    },
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptMessage(text, key) {
  const encoded = new TextEncoder().encode(text);
  // The iv must never be reused with a given key.
  iv = window.crypto.getRandomValues(new Uint8Array(16));
  ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv
    },
    key,
    encoded
  );
  return {
    encryptedText: buffer,
    iv: iv
  };
}
