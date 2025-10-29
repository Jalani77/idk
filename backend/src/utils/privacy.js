const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phoneRegex = /(\+?\d[\d\s\-()]{7,}\d)/g;

export function maskPII(input) {
  if (!input || typeof input !== 'string') return input;
  return input
    .replace(emailRegex, (m) => `${m.slice(0, 2)}***@***.${m.split('.').pop()}`)
    .replace(phoneRegex, (m) => `${m.slice(0, 2)}***${m.slice(-2)}`);
}
