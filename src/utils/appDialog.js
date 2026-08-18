let nextDialogId = 1;
let hostDispatch = null;
const pendingBeforeMount = [];

function enqueue(request) {
  if (hostDispatch) {
    hostDispatch(request);
    return;
  }
  pendingBeforeMount.push(request);
}

export function bindAppDialogHost(dispatch) {
  hostDispatch = dispatch;
  while (pendingBeforeMount.length) {
    hostDispatch(pendingBeforeMount.shift());
  }

  return () => {
    if (hostDispatch === dispatch) hostDispatch = null;
  };
}

function requestDialog(kind, message, options = {}) {
  return new Promise((resolve) => {
    enqueue({
      id: nextDialogId++,
      kind,
      message: String(message ?? ''),
      title: options.title || '',
      confirmLabel: options.confirmLabel || '',
      cancelLabel: options.cancelLabel || '',
      defaultValue: options.defaultValue ?? '',
      destructive: options.destructive === true,
      resolve,
    });
  });
}

export function appAlert(message, options = {}) {
  return requestDialog('alert', message, options).then(() => undefined);
}

export function appConfirm(message, options = {}) {
  return requestDialog('confirm', message, options).then(Boolean);
}

export function appPrompt(message, defaultValue = '', options = {}) {
  return requestDialog('prompt', message, { ...options, defaultValue });
}
