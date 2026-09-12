export enum ENUM_NODE_ENV {
  ENV_PROD = 'production',
  ENV_STAGE = 'stage',
  ENV_DEV = 'developer',
}

export const { NODE_ENV } = import.meta.env;
export const FRONT_ENV = import.meta.env.REACT_APP_FRONT_ENV as ENUM_NODE_ENV;

export const isProd = FRONT_ENV === ENUM_NODE_ENV.ENV_PROD;

// function getApiUrl() {
//   const localStorageApiUrl = localStorage.getItem(LOCALSTORAGE_URL_API_KEY);

//   if (isProd || !localStorageApiUrl) {
//     return import.meta.env.REACT_APP_API_URL;
//   }

//   return JSON.parse(localStorageApiUrl);
// }

// export const API_URL = getApiUrl();
export const API_URL = import.meta.env.VITE_API_URL;

/*
 * `MODULE_PAYMENT` saiu daqui.
 *
 * Era global: ligava e desligava a cobrança do sistema inteiro, e não havia
 * como uma igreja cobrar e a outra não. Virou `Church.modulePayment`, que chega
 * junto do evento (`event.church.modulePayment`) e da lista de inscrições
 * (`modulePayment` em cada cartão).
 */
