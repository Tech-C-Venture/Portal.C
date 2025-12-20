// Jest setup file
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextEncoder, TextDecoder });

// Mock global fetch and related Web APIs
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
    headers: new Headers(),
  })
);

// Polyfill for Request, Response, Headers
if (typeof Request === 'undefined') {
  global.Request = class RequestMock {};
}
if (typeof Response === 'undefined') {
  global.Response = class ResponseMock {};
}
if (typeof Headers === 'undefined') {
  global.Headers = class HeadersMock {};
}
