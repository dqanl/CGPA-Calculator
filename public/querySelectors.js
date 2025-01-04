// const jsdom = require('jsdom');
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const document = dom.window.document;

// const userName = document.querySelector('.user-username');
// console.log(userName.textContent); // Output the content

export const userName = document.querySelector('.user-username');
export const userEmail = document.querySelector('.user-email');
export const userPassword = document.querySelector('.user-password');

export const loginBtn = document.getElementById('loginBtn');
