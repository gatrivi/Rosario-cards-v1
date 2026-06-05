jest.mock('../utils/rosarySequence', () => ({
  buildRosarySequence: () => [
    { index: 0, id: 'P', title: 'Padre Nuestro', text: 'Padre nuestro...' },
    { index: 1, id: 'A', title: 'Ave María', text: 'Dios te salve...' },
  ],
}));

describe('getCoverageMap', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('rosario_prayer_recordings_v1');
  });

  test('marks slots with and without recordings', async () => {
    const { saveRecording, getCoverageMap } = await import('../utils/prayerRecordingStore');

    await saveRecording({
      mystery: 'gozosos',
      sequenceIndex: 0,
      prayerId: 'P',
      variantIndex: 0,
      blob: new Blob(['x'.repeat(600)], { type: 'audio/webm' }),
      mimeType: 'audio/webm',
      label: 'test',
    });

    const map = await getCoverageMap('gozosos');
    expect(map).toHaveLength(2);
    expect(map[0]).toMatchObject({
      slotIndex: 0,
      prayerId: 'P',
      hasRecording: true,
      takeCount: 1,
    });
    expect(map[1]).toMatchObject({
      slotIndex: 1,
      prayerId: 'A',
      hasRecording: false,
      takeCount: 0,
    });
  });
});
