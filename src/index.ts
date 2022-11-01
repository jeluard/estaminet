import { ApiPromise } from "@polkadot/api";
import { UniquesCollectionMediaElement, UniquesItemMediaElement } from "./uniques/media";
export { UniquesCollectionMediaElement, UniquesItemMediaElement } from "./uniques/media";

// Global estaminet configuration

export type Config = {
  defaultApi?: ApiPromise,
  defaultProviders: Map<string, Provider>,
}

/**
 * Abstract away the access to a parachain
 */
interface Provider {
  wssURL: string;
}

/**
* @returns a Map of default providers for well-know parachains
*/
function defaultProviders(): Map<string, Provider> {
  const providers = new Map<string, Provider>();
  providers.set("statemine", {wssURL: "wss://statemine-rpc.polkadot.io"});
  providers.set("statemint", {wssURL: "wss://statemint-rpc.polkadot.io"});
  providers.set("westmint", {wssURL: "wss://westmint-rpc.polkadot.io"});
  providers.set("rockmine", {wssURL: "wss://rococo-rockmine-rpc.polkadot.io"});
  return providers;
}

export const config = self.__ESTAMINET_CONFIG__;

export function registerDefaultApi(api: ApiPromise) {
  config.defaultApi = api;
}

export function registerDefaultProviders(providers: Map<string, Provider>) {
  config.defaultProviders = providers;
}

export function registerElements() {
  customElements.define('es-uniques-collection-media', UniquesCollectionMediaElement);
  customElements.define('es-uniques-item-media', UniquesItemMediaElement);
}

registerDefaultProviders(defaultProviders());
registerElements();

// Define global types to help with type checking
interface CustomEventMap {
  "api-changed": CustomEvent<{ api: ApiPromise | null }>;
  "attribute-changed": CustomEvent<{ name: string, oldValue: any, newValue: any }>;
}

// TODO trigger redraw when globals change

declare global {
  interface HTMLElement {
    addEventListener<K extends keyof CustomEventMap>(type: K,
       listener: (this: Document, ev: CustomEventMap[K]) => void): void;
  }
  interface HTMLElementTagNameMap {
    'es-uniques-collection-media': UniquesCollectionMediaElement,
    'es-uniques-item-media': UniquesItemMediaElement,
  }
  interface Window {
    __ESTAMINET_CONFIG__: Config;
  }
}