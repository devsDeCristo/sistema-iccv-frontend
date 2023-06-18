declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_FRONT_ENV:
    | 'development'
    | 'production'
    | 'test'
    | 'stage';
    readonly REACT_APP_API_URL: string;
    readonly REACT_APP_GOOGLE_MAPS_EMBED_API_KEY: string;
  }
}
