import React from 'react';

function IconBase({ size = 24, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconStats({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <path d="M4 19V11" />
      <path d="M10 19V5" />
      <path d="M16 19V9" />
      <path d="M22 19V3" />
      <path d="M3 19H21" />
    </IconBase>
  );
}

export function IconPlan({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3V7" />
      <path d="M16 3V7" />
      <path d="M4 10H20" />
      <path d="M8 14H8.01" />
      <path d="M12 14H12.01" />
      <path d="M16 14H16.01" />
    </IconBase>
  );
}

export function IconCamino({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <path d="M6 19C6 15 9 12 12 12C15 12 18 15 18 19" />
      <circle cx="12" cy="8" r="3" />
      <path d="M4 19H20" />
      <path d="M12 12V9" />
    </IconBase>
  );
}

export function IconLibro({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <path d="M5 5C5 4 6 3 8 3H16C18 3 19 4 19 5V19C17 18 15 17 12 17C9 17 7 18 5 19V5Z" />
      <path d="M12 17V3" />
      <path d="M8 7H10" />
      <path d="M14 7H16" />
    </IconBase>
  );
}

export function IconRosa({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <path d="M12 20V10" />
      <path d="M8 14C8 11 10 8 12 6C14 8 16 11 16 14" />
      <path d="M6 14C7 12 9 10 12 9C15 10 17 12 18 14" />
      <path d="M9 18C10 16 11 15 12 15C13 15 14 16 15 18" />
    </IconBase>
  );
}

export function IconRosario({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 6.5V17.5" />
      <path d="M9.5 8.5L7.5 11.5" />
      <path d="M14.5 8.5L16.5 11.5" />
      <path d="M7.5 13.5L9.5 15.5" />
      <path d="M16.5 13.5L14.5 15.5" />
    </IconBase>
  );
}

export function IconVoz({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <rect x="9" y="4" width="6" height="10" rx="3" />
      <path d="M6 10C6 13.3 8.7 16 12 16C15.3 16 18 13.3 18 10" />
      <path d="M12 16V20" />
      <path d="M9 20H15" />
    </IconBase>
  );
}

export function IconFeedback({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <path d="M5 6H19V16H9L5 19V6Z" />
      <path d="M8 10H16" />
      <path d="M8 13H13" />
    </IconBase>
  );
}

export function IconHelp({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5C9.8 8.2 11 7 12.5 7C14.4 7 16 8.4 16 10C16 11.8 14.5 12.5 13.5 13.2C12.8 13.7 12 14.4 12 15.5" />
      <circle cx="12" cy="18" r="0.5" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconSync({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <path d="M6 8C7.5 5.5 10 4 12.5 4C16.6 4 20 7.4 20 11.5" />
      <path d="M18 16C16.5 18.5 14 20 11.5 20C7.4 20 4 16.6 4 12.5" />
      <path d="M18 4V8H14" />
      <path d="M6 20V16H10" />
    </IconBase>
  );
}

export function IconSyncLoading({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <path d="M12 4V8" />
      <path d="M12 16V20" />
      <path d="M4 12H8" />
      <path d="M16 12H20" />
      <path d="M6.3 6.3L8.7 8.7" />
      <path d="M15.3 15.3L17.7 17.7" />
      <path d="M6.3 17.7L8.7 15.3" />
      <path d="M15.3 8.7L17.7 6.3" />
    </IconBase>
  );
}

/** Ajustes control — classic gear (users do not recognize the old sunburst as settings). */
export function IconSettings({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconBase>
  );
}

export function IconHandLeft({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <path d="M8 8V16C8 18 10 20 12 20" />
      <path d="M8 8C8 6 9 4 11 4C12 4 12 6 12 8" />
      <path d="M12 8C12 6 13 4 15 4C16 4 16 6 16 9V14" />
      <path d="M16 14C16 16 15 18 13 18" />
    </IconBase>
  );
}

export function IconHandRight({ size = 24, ...props }) {
  return (
    <IconBase size={size} {...props}>
      <path d="M16 8V16C16 18 14 20 12 20" />
      <path d="M16 8C16 6 15 4 13 4C12 4 12 6 12 8" />
      <path d="M12 8C12 6 11 4 9 4C8 4 8 6 8 9V14" />
      <path d="M8 14C8 16 9 18 11 18" />
    </IconBase>
  );
}

export const NAV_ICONS = {
  stats: IconStats,
  tracker: IconPlan,
  camino: IconCamino,
  booklet: IconLibro,
  rose: IconRosa,
  rosary: IconRosario,
  voz: IconVoz,
};
