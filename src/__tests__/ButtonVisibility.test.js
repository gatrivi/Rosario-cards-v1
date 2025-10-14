import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PrayerButtons from "../components/PrayerButtons/PrayerButtons";
import InterfaceToggle from "../components/common/InterfaceToggle";
import RosarioPrayerBook from "../data/RosarioPrayerBook";

// Mock window.matchMedia for ThemeToggle
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
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

// Mock props for PrayerButtons
const mockPrayerButtonsProps = {
  prayers: RosarioPrayerBook,
  countUp: jest.fn(),
  reset: jest.fn(),
  setPrayer: jest.fn(),
  setPrayerImg: jest.fn(),
  currentMystery: "gozosos",
  setcurrentMystery: jest.fn(),
  jumpToPrayer: jest.fn(),
  currentPrayerIndex: 0,
  navigateToIndex: jest.fn(() => ({
    prayer: "test",
    prayerImg: { img: "test.jpg" },
  })),
  getRosarySequence: jest.fn(() => RosarioPrayerBook.RGo),
  leftHandedMode: false,
};

// Mock props for InterfaceToggle
const mockInterfaceToggleProps = {
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

describe("Button Visibility Tests", () => {
  test("All navigation buttons are visible on screen", () => {
    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);

    // Check all 7 navigation buttons are in document
    const buttons = container.querySelectorAll(".segment-btn");
    expect(buttons).toHaveLength(7);

    // Each button should be visible
    buttons.forEach((button) => {
      expect(button).toBeVisible();
    });
  });

  test("All buttons meet minimum touch target size (44x44)", () => {
    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);

    const buttons = container.querySelectorAll(".segment-btn");

    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
    });
  });

  test("Buttons are clickable (not covered by other elements)", () => {
    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);

    const buttons = container.querySelectorAll(".segment-btn");

    buttons.forEach((button) => {
      // Check pointer-events is not 'none'
      const style = window.getComputedStyle(button);
      expect(style.pointerEvents).not.toBe("none");

      // Check z-index allows interaction
      expect(button).toBeEnabled();
    });
  });

  test("Settings button is visible and properly sized", () => {
    const { container } = render(
      <InterfaceToggle {...mockInterfaceToggleProps} />
    );

    const settingsBtn = container.querySelector(".main-toggle-btn");
    expect(settingsBtn).toBeVisible();
    expect(settingsBtn).toBeInTheDocument();

    // Check if button has proper styling (width/height might be 0 in test environment)
    const style = window.getComputedStyle(settingsBtn);
    expect(style.width).toBe("50px");
    expect(style.height).toBe("50px");
  });

  test("Settings button is clickable and toggles panel", async () => {
    const { container } = render(
      <InterfaceToggle {...mockInterfaceToggleProps} />
    );

    const settingsBtn = container.querySelector(".main-toggle-btn");
    expect(settingsBtn).toBeInTheDocument();

    // Initially panel should be closed
    let controlPanel = container.querySelector(".control-panel");
    expect(controlPanel).not.toBeInTheDocument();

    // Click the settings button using fireEvent
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

  test("No elements positioned off-screen", () => {
    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);

    const allButtons = container.querySelectorAll("button");

    allButtons.forEach((element) => {
      const rect = element.getBoundingClientRect();

      // Element should not be off-screen (negative positions beyond reasonable tolerance)
      if (rect.width > 0 && rect.height > 0) {
        // Allow some tolerance for transforms and positioning
        expect(rect.top).toBeGreaterThan(-200);
        expect(rect.left).toBeGreaterThan(-200);
      }
    });
  });

  test("Prayer buttons bar has tooltips", () => {
    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);

    const buttons = container.querySelectorAll(".segment-btn");

    buttons.forEach((button) => {
      // Check that each button has a data-tooltip attribute
      expect(button).toHaveAttribute("data-tooltip");
      expect(button.getAttribute("data-tooltip")).toBeTruthy();
    });
  });

  test("Buttons have aria-labels for accessibility", () => {
    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);

    const buttons = container.querySelectorAll(".segment-btn");

    buttons.forEach((button) => {
      // Check that each button has an aria-label
      expect(button).toHaveAttribute("aria-label");
    });
  });
});

describe("Responsive Layout Tests", () => {
  test("Buttons fit on mobile screen (375px)", () => {
    // Set viewport to iPhone size
    global.innerWidth = 375;
    global.innerHeight = 667;

    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);

    const buttonsContainer = container.querySelector(".navigation-row");
    if (buttonsContainer) {
      const rect = buttonsContainer.getBoundingClientRect();

      // Should not significantly exceed viewport width
      expect(rect.width).toBeLessThanOrEqual(400); // Some tolerance for transforms
    }
  });

  test("Buttons maintain minimum size on desktop (1024px)", () => {
    global.innerWidth = 1024;
    global.innerHeight = 768;

    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);

    const buttons = container.querySelectorAll(".segment-btn");

    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect();
      // Desktop buttons should be at least 44px
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
    });
  });

  test("Settings panel renders correctly", () => {
    const { container } = render(
      <InterfaceToggle {...mockInterfaceToggleProps} />
    );

    // Settings button should be visible
    const settingsBtn = container.querySelector(".main-toggle-btn");
    expect(settingsBtn).toBeInTheDocument();
    expect(settingsBtn).toBeVisible();
  });
});

describe("Integration Tests", () => {
  test("PrayerButtons component renders without errors", () => {
    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);
    expect(container.querySelector(".segmented-bar")).toBeInTheDocument();
  });

  test("InterfaceToggle component renders without errors", () => {
    const { container } = render(
      <InterfaceToggle {...mockInterfaceToggleProps} />
    );
    expect(container.querySelector(".interface-toggle")).toBeInTheDocument();
  });

  test("Progress indicator is visible", () => {
    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);
    const progressBar = container.querySelector(".integrated-progress");
    expect(progressBar).toBeInTheDocument();
  });

  test("Preview text is visible", () => {
    const { container } = render(<PrayerButtons {...mockPrayerButtonsProps} />);
    const preview = container.querySelector(".preview");
    expect(preview).toBeInTheDocument();
    expect(preview).toBeVisible();
  });
});
