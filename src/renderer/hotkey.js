import Vue from 'vue';

/**
 * Binds hotkeys globally according to key map.
 * Modifiers specify key map names to bind.
 * Handlers are triggered FILO, until one returns false.
 * 
 * It is possible to stop an element triggering a certain handler if the element has the focus.
 * Add `v-hotkey-ignore` to the element with modifiers of which keys to ignore.
 */

const hotkeys = [];
const ignored = [];

Vue.directive('hotkey', {
  bind(element, {
    modifiers,
    value,
  }) {
    hotkeys.unshift({
      names: Object.keys(modifiers),
      action: value,
      element,
    });
  },

  unbind(element) {
    hotkeys.splice(hotkeys.findIndex(hotkey => hotkey.element === element), 1);
  },
});

Vue.directive('hotkey-ignore', {
  bind(element, {
    modifiers,
  }) {
    ignored.push({
      names: Object.keys(modifiers),
      element,
    });
  },

  unbind(element) {
    ignored.splice(ignored.findIndex(ignore => ignore.element === element), 1);
  },
});

export default {
  init(keymap) {
    document.addEventListener('keyup', (event) => {
      hotkeys.some(({
        names,
        action,
      }) => {
        const keyCodes = names.map(name => keymap[name]);
        const ignoredElementFocussed = ignored.find((ignore) => {
          const ignoreKeyCodes = ignore.names.map(name => keymap[name]);
          return ignoreKeyCodes.includes(event.keyCode) && ignore.element.contains(document.activeElement);
        });

        if (!ignoredElementFocussed && keyCodes.includes(event.keyCode)) {
          const returnValue = action();
          return returnValue === false;
        }
        return false;
      });
    });
  },
};
