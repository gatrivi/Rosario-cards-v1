import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PrayerRecorder from '../components/common/PrayerRecorder';

// Prefix with "mock" so Jest allows referencing from jest.mock factory.
const mockSaveRecording = jest.fn();
const mockListRecordingsForPrayer = jest.fn();
const mockListRecordingsForSlot = jest.fn();
const mockDeleteRecording = jest.fn();
const mockBlobToObjectUrl = jest.fn(() => 'blob:mock');

jest.mock('../utils/prayerRecordingStore', () => ({
  saveRecording: (...args) => mockSaveRecording(...args),
  listRecordingsForPrayer: (...args) => mockListRecordingsForPrayer(...args),
  listRecordingsForSlot: (...args) => mockListRecordingsForSlot(...args),
  deleteRecording: (...args) => mockDeleteRecording(...args),
  blobToObjectUrl: (...args) => mockBlobToObjectUrl(...args),
}));

class MediaRecorderMock {
  constructor(_stream, opts) {
    this.opts = opts;
    this.state = 'inactive';
    this.ondataavailable = null;
    this.onstop = null;
  }

  static isTypeSupported() {
    return true;
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.onstop?.();
  }
}

describe('PrayerRecorder (mic core)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSaveRecording.mockReset();
    mockListRecordingsForPrayer.mockReset();
    mockListRecordingsForSlot.mockReset();
    mockDeleteRecording.mockReset();
    mockBlobToObjectUrl.mockClear();

    // Default: no clips in storage
    mockListRecordingsForPrayer.mockResolvedValue([]);
    mockListRecordingsForSlot.mockResolvedValue([]);

    global.MediaRecorder = MediaRecorderMock;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('disables mic UI when getUserMedia is unavailable', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
    });

    await act(async () => {
      render(
        <PrayerRecorder
          prayerId="P"
          prayerTitle="Padre Nuestro"
          mystery="gozosos"
          sequenceIndex={0}
          placement="header"
        >
          Mic
        </PrayerRecorder>
      );
      await Promise.resolve();
    });

    const toggleBtn = screen.getByRole('button', { name: /🎙️/i });
    expect(toggleBtn).toBeDisabled();
  });

  test('records, persists, and refreshes after stopping recording', async () => {
    const getUserMedia = jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia },
      configurable: true,
    });

    mockSaveRecording.mockResolvedValue(undefined);
    // After stop, refreshClips should still see empty clips
    mockListRecordingsForPrayer.mockResolvedValue([]);
    mockListRecordingsForSlot.mockResolvedValue([]);

    await act(async () => {
      render(
        <PrayerRecorder
          prayerId="A"
          prayerTitle="Ave María"
          mystery="gozosos"
          sequenceIndex={3}
          placement="header"
        >
          Mic
        </PrayerRecorder>
      );
      // Flush the initial refreshClips() effect.
      await Promise.resolve();
    });

    // Expand panel (toggle button shows as 🎙️)
    const expandBtn = screen.getByRole('button', { name: /🎙️/i });
    fireEvent.click(expandBtn);

    expect(screen.getByRole('button', { name: /Grabar/i })).toBeInTheDocument();

    // Start recording
    const recordBtn = screen.getByRole('button', { name: /Grabar/i });
    await act(async () => {
      fireEvent.click(recordBtn);
      await Promise.resolve();
    });
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });

    // Stop recording
    const stopBtn = await screen.findByRole('button', { name: /Detener/i });
    await act(async () => {
      fireEvent.click(stopBtn);
      // Flush async onstop flow (saveRecording + refreshClips)
      await Promise.resolve();
    });

    expect(mockSaveRecording).toHaveBeenCalled();
    const args = mockSaveRecording.mock.calls[0][0];
    expect(args.mystery).toBe('gozosos');
    expect(args.sequenceIndex).toBe(3);
    expect(args.prayerId).toBe('A');
    expect(args.variantIndex).toBe(0);
    expect(args.mimeType).toMatch(/^audio\//);
    expect(args.label).toMatch(/Ave María toma 1/i);
    expect(args.blob).toBeInstanceOf(Blob);

    // status is shown immediately
    expect(screen.getByText(/Guardado ✓/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.queryByText(/Guardado ✓/i)).not.toBeInTheDocument();
  });
});

