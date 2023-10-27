import { ApiPromise } from '@polkadot/api';
import {
  UniquesCollectionMediaElement,
  UniquesItemMediaElement,
} from './media';
export {
  UniquesCollectionMediaElement,
  UniquesItemMediaElement,
} from './media';

// Global estaminet configuration

export type Config = {
  defaultApi?: ApiPromise;
  defaultProviders: Map<string, Provider>;
};

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
  providers.set('statemine', { wssURL: 'wss://statemine-rpc.polkadot.io' });
  providers.set('statemint', { wssURL: 'wss://statemint-rpc.polkadot.io' });
  providers.set('westmint', { wssURL: 'wss://westmint-rpc.polkadot.io' });
  providers.set('rockmine', {
    wssURL: 'wss://rococo-rockmine-rpc.polkadot.io',
  });
  return providers;
}

export const config: Config = {
  defaultProviders: new Map(),
};

export function registerDefaultProviders(providers: Map<string, Provider>) {
  config.defaultProviders = providers;
}

export function registerElements() {
  console.log("register")
  customElements.define(
    'es-uniques-collection-media',
    UniquesCollectionMediaElement
  );
  customElements.define('es-uniques-item-media', UniquesItemMediaElement);
}

registerDefaultProviders(defaultProviders());
//registerElements();

// Define global types to help with type checking
interface CustomEventMap {
  'api-changed': CustomEvent<{ api: ApiPromise }>;
  'api-failed': CustomEvent<{ error: Error }>;
  'attribute-changed': CustomEvent<{
    name: string;
    oldValue: any;
    newValue: any;
  }>;
}

// https://www.totaltypescript.com/what-is-jsx-intrinsicelements

declare global {
  interface HTMLElement {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void
    ): void;
  }
  interface HTMLElementTagNameMap {
    'es-uniques-collection-media': UniquesCollectionMediaElement;
    'es-uniques-item-media': UniquesItemMediaElement;
  }
}
