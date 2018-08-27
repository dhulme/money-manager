import Vue from 'vue';

/**
 * Binds hotkeys globally according to key map.
 * Modifiers specify key map names to bind.
 * Handlers are triggered FILO, until one returns false.
 */

const hotkeys = [];

Vue.directive('hotkey', {
  bind(element, { modifiers, value }) {
    hotkeys.unshift({
      names: Object.keys(modifiers),
      action: value,
      element
    });
  },

  unbind(element) {
    hotkeys.splice(hotkeys.findIndex(hotkey => hotkey.element === element), 1);
  }
});

export default {
  init(keymap) {
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
