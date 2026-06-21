import React from 'react';

export function splitIntoBursts(text) {
  if (!text) return [];

  if (text.includes('\n')) {
    return text.split('\n').map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return { type: 'spacer' };
      return { type: 'verse', text: trimmed };
    });
  }

  return text
    .split(/(?<=[.,;:!])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((verse) => ({ type: 'verse', text: verse }));
}

export function renderVerseLines(text) {
  return splitIntoBursts(text).map((item, i) => {
    if (item.type === 'spacer') {
      return <div key={`sp-${i}`} className="booklet-verse-spacer" aria-hidden="true" />;
    }
    return (
      <p key={`ln-${i}`} className="booklet-verse">
        {item.text}
      </p>
    );
  });
}
