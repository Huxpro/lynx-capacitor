import { createStore } from '@stencil/store';

export interface State {
  pageTheme: 'light' | 'dark';
}

const { state } = createStore<State>({
  pageTheme: 'light',
});

export const defaults = {
  title: 'Capacitor',
  description: '',
  meta_image: '',
};

export default state;
