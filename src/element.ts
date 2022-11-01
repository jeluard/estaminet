import { ApiPromise, WsProvider } from "@polkadot/api";
import { config } from ".";
import { setAttribute } from "./utils/html";

// If `provider` is set, use associated `ApiPromise`
// If not, fallback to default `ApiPromise`

export abstract class BaseProviderElement extends HTMLElement {
    private static readonly providerAttribute = 'provider';
    protected api: ApiPromise | null = null;

    constructor() {
      super();
  
      this.attachShadow({ 'mode': 'open' });
    }

    /**
     * The eventual provider encapsulated by this `BaseProviderElement`
     */
    get provider(): string | null {
      return this.getAttribute(BaseProviderElement.providerAttribute);
    }

    /**
     * Sets the provider attribute
     */
    set provider(provider: string | null) {
      setAttribute(this, BaseProviderElement.providerAttribute, provider);
    }

    static get observedAttributes() {
      return [BaseProviderElement.providerAttribute];
    }

    fireApiChangedEvent(api: ApiPromise | null) {
      this.dispatchEvent(
        new CustomEvent("api-changed", {
          bubbles: true,
          composed: true,
          detail: { api }
        })
      );
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        this.dispatchEvent(
            new CustomEvent("attribute-changed", {
              bubbles: true,
              composed: true,
              detail: { name, oldValue, newValue }
            })
          );

      switch (name) {
          case BaseProviderElement.providerAttribute:
              if (this.provider) {
                const provider = config.defaultProviders.get(this.provider);
                if (provider) {
                    const wsProvider = new WsProvider(provider.wssURL);
                    ApiPromise.create({ provider: wsProvider }).then(async (api: ApiPromise) => {
                        this.api = api;

                        this.fireApiChangedEvent(this.api);
                    }).catch(e => {
                        this.api = null;

                        this.fireApiChangedEvent(this.api);
                        console.error('Failed to create API');
                    });
                } else {
                    this.api = null;

                    this.fireApiChangedEvent(this.api);
                    console.error('No matching provider');
                }
              } else {
                  this.api = null;

                  this.fireApiChangedEvent(this.api);
              }
              break;
      }
    }
  
  }