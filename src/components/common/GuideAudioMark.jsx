import React from 'react';
import './GuideAudioMark.css';

/** Corner pip on a thumb when CatTS guide audio exists for that devotion. */
export default function GuideAudioMark({ label = 'Guía de audio lista' }) {
  return <span className="guide-audio-mark" title={label} aria-hidden="true" />;
}
