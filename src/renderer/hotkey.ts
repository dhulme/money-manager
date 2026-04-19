/**
 * Binds hotkeys globally according to key map.
 * Modifiers specify key map names to bind.
 * Handlers are triggered FILO, until one returns false.
 */

interface HotkeyKey {
  name: string;
  code: number;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
}

interface Hotkey {
  names: string[];
  action: () => boolean | void;
  element: HTMLElement;
}

const hotkeys: Hotkey[] = [];

export const hotkeyDirective = {
  mounted(element: HTMLElement, { modifiers, value }: { modifiers: Partial<Record<string, boolean>>; value: () => boolean | void }) {
    hotkeys.unshift({
      names: Object.keys(modifiers),
      action: value,
      element
    });
  },

  unmounted(element: HTMLElement) {
    hotkeys.splice(hotkeys.findIndex(hotkey => hotkey.element === element), 1);
  }
};

export default {
  init(keymap: Record<string, HotkeyKey>) {
    document.addEventListener('keyup', event => {
      hotkeys.some(({ names, action }) => {
        const keys = names.map(name => keymap[name]);

        const pressed = keys.some(
          key =>
            key.code === event.keyCode &&
            event.ctrlKey === !!key.ctrl &&
            event.altKey === !!key.alt &&
            event.shiftKey === !!key.shift
        );

        if (pressed) {
          const returnValue = action();
          return returnValue === false;
        }
        return false;
      });
    });
  }
};
