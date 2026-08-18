describe('AudioManager opt-in contract', () => {
  const OriginalAudioContext = window.AudioContext;

  afterEach(() => {
    jest.resetModules();
    localStorage.clear();
    window.AudioContext = OriginalAudioContext;
  });

  test('does not create an AudioContext while sound is disabled or unset', async () => {
    const AudioContext = jest.fn(() => ({ state: 'suspended', resume: jest.fn() }));
    window.AudioContext = AudioContext;

    let audioManager;
    jest.isolateModules(() => {
      audioManager = require('../utils/audioManager').default;
    });

    expect(audioManager.getContext()).toBeNull();
    await audioManager.resume();
    expect(AudioContext).not.toHaveBeenCalled();
  });

  test('creates and resumes audio only after explicit opt-in', async () => {
    const resume = jest.fn(() => Promise.resolve());
    const context = { state: 'suspended', resume };
    const AudioContext = jest.fn(() => context);
    window.AudioContext = AudioContext;
    localStorage.setItem('rosario_sound_enabled', 'true');

    let audioManager;
    jest.isolateModules(() => {
      audioManager = require('../utils/audioManager').default;
    });

    expect(audioManager.getContext()).toBe(context);
    await audioManager.resume();

    expect(AudioContext).toHaveBeenCalledTimes(1);
    expect(resume).toHaveBeenCalledTimes(1);
  });
});
