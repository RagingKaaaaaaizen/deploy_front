declare const process: any;

export const environment = {
  production: true,
  apiUrl: (typeof process !== 'undefined' && process.env && process.env['API_URL']) 
    ? process.env['API_URL'] 
    : 'https://computer-lab-inventory-backend-klzb.onrender.com',
  version: '1.0.0',
  buildDate: new Date().toISOString()
};

