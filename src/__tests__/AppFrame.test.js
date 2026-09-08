import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AppFrame from '../components/Layout/AppFrame';
import AppOverlay from '../components/Layout/AppOverlay';

function Prayer() {
  const [verse, setVerse] = useState(1);
  return <button onClick={() => setVerse(v => v + 1)}>Verse {verse}</button>;
}

test('reserves measured chrome, adapts to resizing, and preserves prayer state', () => {
  const originalObserver = global.ResizeObserver;
  let resize;
  const disconnect = jest.fn();
  global.ResizeObserver = jest.fn(callback => { resize = callback; return { observe: jest.fn(), disconnect }; });
  let headerHeight = 62;
  let navHeight = 70;
  const rectangles = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return { height: this.tagName === 'HEADER' ? headerHeight : navHeight };
  });
  try {
    const view = render(<AppFrame header={<button>Settings</button>} navigation={<nav aria-label="Navigation" />} overlays={<div role="dialog">Settings panel</div>}><Prayer /></AppFrame>);
    const shell = screen.getByTestId('app-frame');
    expect(shell.style.getPropertyValue('--app-header-height')).toBe('62px');
    expect(shell.style.getPropertyValue('--app-above-nav')).toBe('70px');
    expect(screen.getByRole('main')).toContainElement(screen.getByText('Verse 1'));
    expect(screen.getByRole('main')).not.toContainElement(screen.getByRole('dialog'));
    fireEvent.click(screen.getByText('Verse 1'));
    headerHeight = 86;
    navHeight = 94;
    act(() => resize());
    expect(shell.style.getPropertyValue('--app-header-height')).toBe('86px');
    expect(shell.style.getPropertyValue('--app-above-nav')).toBe('94px');
    expect(screen.getByText('Verse 2')).toBeInTheDocument();
    view.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  } finally {
    rectangles.mockRestore();
    global.ResizeObserver = originalObserver;
  }
});


test('view-owned dialogs render in the overlay host outside the prayer surface', () => {
  function ViewWithDialog() {
    const [open, setOpen] = useState(false);
    return <><button onClick={() => setOpen(true)}>Open prayer</button>{open && <AppOverlay><div role="dialog">Prayer</div></AppOverlay>}</>;
  }
  render(<AppFrame header={<button>Settings</button>} navigation={<nav />}><ViewWithDialog /></AppFrame>);
  fireEvent.click(screen.getByText('Open prayer'));
  expect(screen.getByTestId('app-overlays')).toContainElement(screen.getByRole('dialog'));
  expect(screen.getByRole('main')).not.toContainElement(screen.getByRole('dialog'));
});
