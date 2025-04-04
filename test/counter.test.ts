import { describe, it, expect, beforeEach } from 'vitest';
import { setupCounter } from '../src/counter';

describe('setupCounter', () => {
  let button: HTMLButtonElement;

  beforeEach(() => {
    button = document.createElement('button');
    setupCounter(button);
  });

  it('initializes the button with "count is 0"', () => {
    expect(button.innerHTML).toBe('count is 0');
  });

  it('increments the counter when the button is clicked', () => {
    button.click();
    expect(button.innerHTML).toBe('count is 1');
  });

  it('increments the counter cumulatively on multiple clicks', () => {
    button.click();
    button.click();
    button.click();
    expect(button.innerHTML).toBe('count is 3');
  });
});