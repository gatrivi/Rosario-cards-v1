import {
  installErrorCapture,
  getCapturedErrorsText,
  copyCapturedErrors,
} from '../utils/errorCapture';

describe('errorCapture', () => {
  beforeAll(() => {
    installErrorCapture();
  });

  test('records console.error lines', () => {
    console.error('test-capture-line', { code: 42 });
    expect(getCapturedErrorsText()).toMatch(/test-capture-line/);
  });

  test('copyCapturedErrors writes clipboard when available', async () => {
    const writeText = jest.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    console.error('copy-me');
    const { ok, text } = await copyCapturedErrors();
    expect(ok).toBe(true);
    expect(text).toMatch(/copy-me/);
    expect(writeText).toHaveBeenCalled();
  });
});
