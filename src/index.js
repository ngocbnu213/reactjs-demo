import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import en from './translations/en.json';
import ja from './translations/ja.json';
import vi from './translations/vi.json';
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import * as serviceWorker from './serviceWorker';

i18next.init({
  interpolation: { escapeValue: false },  // React already does escaping
  lng: 'en',                              // language to use
  resources: {
    en: {
      common: en               // 'common' is our custom namespace
    },
    ja: {
      common: ja
    },
    vi: {
      common: vi
    }
  },
});
ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <App />
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
