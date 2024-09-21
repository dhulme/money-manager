// import Vue from 'vue';

import { Plugin } from 'vue';

/**
 * Binds hotkeys globally according to key map.
 * Modifiers specify key map names to bind.
 * Handlers are triggered FILO, until one returns false.
 */

type Hotkey = {
  names: string[];
  action: () => boolean;
  element: HTMLElement;
};

type Key = {
  name: string;
  code: number;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

const keyMap: Record<string, Key> = {
  add: {
    name: 'n',
    code: 78,
    ctrl: true,
  },
  new: {
    name: 'n',
    code: 78,
    ctrl: true,
    shift: true,
  },
  close: {
    name: 'escape',
    code: 27,
  },
  save: {
    name: 's',
    code: 83,
    ctrl: true,
  },
  saveAs: {
    name: 's',
    code: 83,
    ctrl: true,
    shift: true,
  },
  open: {
    name: 'o',
    code: 79,
    ctrl: true,
  },
  undo: {
    name: 'z',
    code: 90,
    ctrl: true,
  },
  redo: {
    name: 'y',
    code: 89,
    ctrl: true,
  },
  settings: {
    name: ',',
    code: 188,
    ctrl: true,
  },
  quit: {
    name: 'q',
    code: 81,
    ctrl: true,
  },
};

const hotkeys: Hotkey[] = [];

const hotkey: Plugin = {
  install(app) {
    app.directive('hotkey', {
      mounted(element, { modifiers, value }) {
        hotkeys.unshift({
          names: Object.keys(modifiers),
          action: value,
          element,
        });
      },
      unmounted(element) {
        hotkeys.splice(
          hotkeys.findIndex((hotkey) => hotkey.element === element),
          1,
        );
      },
    });
    document.addEventListener('keyup', (event) => {
      hotkeys.some(({ names, action }) => {
        const keys = names.map((name) => keyMap[name]);

        const pressed = keys.some(
          (key) =>
            key.code === event.keyCode &&
            event.ctrlKey === !!key.ctrl &&
            event.altKey === !!key.alt &&
            event.shiftKey === !!key.shift,
        );

        if (pressed) {
          const returnValue = action();
          return returnValue === false;
        }
        return false;
      });
    });
  },
};

export default hotkey;
