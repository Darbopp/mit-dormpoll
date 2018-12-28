export const base_url = 'http://127.0.0.1:8000';
export const url = `${base_url}/login`;
export const client_id = '29ebb90e-bdd6-40c4-8fd9-066348dce18d';
export const client_secret = 'B434SsO9dAVIkA060jbMmAs1yRVc9pkfFVrmpc6SkhUFbcZq0Z4rUWC0iMXvRO6nMQCIRUVxItBfSNcFdnmOJg';
export const oidc_url = `https://oidc.mit.edu/authorize?client_id=${client_id}&response_type=code&scope=openid+profile+email&redirect_uri=${url}&state=123&nonce=324234`;
