declare const process: any;

export const environment = {
  production: true,
  apiUrl: (typeof process !== 'undefined' && process.env && process.env['API_URL']) 
    ? process.env['API_URL'] 
    : 'https://computer-lab-inventory-backend-yuca.onrender.com'