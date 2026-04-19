// Vitest setup file
import { createPinia, setActivePinia } from 'pinia';

beforeEach(() => {
  setActivePinia(createPinia());
});
