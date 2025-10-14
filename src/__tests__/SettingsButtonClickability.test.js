import { render, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import InterfaceToggle from "../components/common/InterfaceToggle";

// Mock window.matchMedia for ThemeToggle
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock props for InterfaceToggle
const mockProps = {
  showRosary: true,
  showCounters: true,
  onToggleRosary: jest.fn(),
  onToggleCounters: jest.fn(),
  leftHandedMode: false,
  setLeftHandedMode: jest.fn(),
  focusMode: false,
  onToggleFocusMode: jest.fn(),
  onEnterFocusMode: jest.fn(),
  onExitFocusMode: jest.fn(),
  onReset: jest.fn(),
};

describe("Settings Button Clickability Test", () => {
  test("Settings button is clickable and toggles panel", async () => {
    const { container } = render(<InterfaceToggle {...mockProps} />);

    // Find the settings button
    const settingsBtn = container.querySelector(".main-toggle-btn");
    expect(settingsBtn).toBeInTheDocument();
    expect(settingsBtn).toBeVisible();

    // Initially panel should be closed
    let controlPanel = container.querySelector(".control-panel");
    expect(controlPanel).not.toBeInTheDocument();

    // Click the settings button
    await act(async () => {
      fireEvent.click(settingsBtn);
    });

    // Panel should now be open
    controlPanel = container.querySelector(".control-panel");
    expect(controlPanel).toBeInTheDocument();
    expect(controlPanel).toBeVisible();

    // Click again to close
    await act(async () => {
      fireEvent.click(settingsBtn);
    });

    controlPanel = container.querySelector(".control-panel");
    expect(controlPanel).not.toBeInTheDocument();
  });

  test("Settings button has proper styling and size", () => {
    const { container } = render(<InterfaceToggle {...mockProps} />);

    const settingsBtn = container.querySelector(".main-toggle-btn");
    expect(settingsBtn).toBeInTheDocument();

    // Check button styling
    const style = window.getComputedStyle(settingsBtn);
    expect(style.width).toBe("50px");
    expect(style.height).toBe("50px");
    expect(style.cursor).toBe("pointer");
  });

  test("Settings panel contains all expected controls", async () => {
    const { container } = render(<InterfaceToggle {...mockProps} />);

    const settingsBtn = container.querySelector(".main-toggle-btn");

    // Open the panel
    await act(async () => {
      fireEvent.click(settingsBtn);
    });

    const controlPanel = container.querySelector(".control-panel");
    expect(controlPanel).toBeInTheDocument();

    // Check for key controls
    expect(controlPanel.textContent).toContain("Interface Controls");
    expect(controlPanel.textContent).toContain("Interactive Rosary");
    expect(controlPanel.textContent).toContain("Prayer Counters");
    expect(controlPanel.textContent).toContain("Left-Handed Mode");
    expect(controlPanel.textContent).toContain("Focus Mode");
    expect(controlPanel.textContent).toContain("Font Size");
    expect(controlPanel.textContent).toContain("Actions");
    expect(controlPanel.textContent).toContain("Reset Counter");
    expect(controlPanel.textContent).toContain("Theme");
  });
});

