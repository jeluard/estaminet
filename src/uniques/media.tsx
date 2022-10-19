import { ApiPromise, WsProvider } from "@polkadot/api";
import { Uniques } from "gerbeur";
import { extractHash, url } from "../utils/ipfs";

/**
 * Resolves Metadata content based on Metadata#data field.
 */
interface MetadataResolver {
    resolve(data: string): Promise<any> | undefined;
}

export class IPFSMetadataResolver implements MetadataResolver {
    async resolve(data: string): Promise<string | undefined> {
        const res = await fetch(url(data));
        if (res.ok) {
            return await res.json();
        }
    }
}

type Metadata = {
    name?: string,
    media: MetadataMedia,
    description?: string,
    createdBy?: string,
    yearCreated?: string,
    tags?: Array<string>,
}

type MetadataMedia = {
    uri: string,
    mimeType?: string,
    width?: number,
    height?: number,
    size?: number,
}

function normalizeMetadata(data: any): Metadata {
    return {
        media: {
            uri: data.media?.uri || data.image,
            mimeType: data.media?.mimeType,
            width: data.width,
            height: data.height,
        },
        description: data.description,
    };
}

interface SourceResolver {
    resolve(source: string): string | undefined;
}

export class IPFSGatewaySourceResolver implements SourceResolver {
    resolve(source: string): string | undefined {
        const hash = extractHash(source);
        if (hash) {
            return url(hash);
        }
    }
}

function createImageElement({name, media, description}: Metadata, sourceResolver: SourceResolver): HTMLElement {
    const { uri, width, height } = media;
    const el = document.createElement('img');
    el.style.width = "100%";
    el.style.height = "100%";
    const source = sourceResolver.resolve(uri);
    if (source) {
        el.src = source;
    }
    const alt = name || description;
    if (alt) {
        el.alt = alt;
    }
    if (width) {
        el.width = width;
    }
    if (height) {
        el.height = height;
    }
    return el;
}

function createMediaElement(metadata: Metadata, sourceResolver: SourceResolver): HTMLElement | undefined {
    switch(metadata.media.mimeType) {
        case undefined:
        case "image/png":
            return createImageElement(metadata, sourceResolver);
        default:
    }
}

interface Provider {
    wssURL: string;
}

function getAttributeAsNumber(el: Element, attributeName: string): number | null {
    const attribute = el.getAttribute(attributeName);
    if (attribute) {
        return Number.parseInt(attribute);
    }
    return null;
}

function setAttribute(el: Element, attributeName: string, attributeValue: Object | null) {
    if (attributeValue) {
        el.setAttribute(attributeName, attributeValue.toString());
    } else {
        el.removeAttribute(attributeName);
    }
    return null;
}

function clearElement(el: ShadowRoot) {
    el.innerHTML = '';
}

const collectionAttribute = 'collection';
const itemAttribute = 'item';
const providerAttribute = 'provider';

export class UniquesItemMedia extends HTMLElement {
  private readonly resolvers;
  private readonly providers;
  private api: ApiPromise | null = null;
  constructor(resolvers: Map<string, MetadataResolver> = UniquesItemMedia.defaultResolvers, providers: Map<string, Provider> = UniquesItemMedia.defaultProviders) {
    super();
    this.resolvers = resolvers;
    this.providers = providers;

    this.attachShadow({ 'mode': 'open' });
  }

  static get defaultResolvers(): Map<string, MetadataResolver> {
    const resolvers = new Map<string, MetadataResolver>();
    resolvers.set("ipfs", new IPFSMetadataResolver());
    return resolvers;
  }

  static get defaultProviders(): Map<string, Provider> {
    const providers = new Map<string, Provider>();
    providers.set("statemine", {wssURL: "wss://statemine-rpc.polkadot.io"});
    providers.set("statemint", {wssURL: "wss://statemint-rpc.polkadot.io"});
    providers.set("westmint", {wssURL: "wss://westmint-rpc.polkadot.io"});
    providers.set("rockmine", {wssURL: "wss://rococo-rockmine-rpc.polkadot.io"});
    return providers;
  }

  get collection(): number | null {
    return getAttributeAsNumber(this, collectionAttribute);
  }

  set collection(number: number | null) {
    setAttribute(this, collectionAttribute, number);
  }

  get item(): number | null {
    return getAttributeAsNumber(this, itemAttribute);
  }

  set item(number: number | null) {
    setAttribute(this, itemAttribute, number);
  }

  get provider(): Provider | undefined {
    const provider = this.getAttribute(providerAttribute);
    if (provider) {
        return this.providers.get(provider);
    }
  }

  async resolve(data: string): Promise<string | undefined> {
    for (const resolver of this.resolvers.values()) {
        const content = resolver.resolve(data);
        if (content) {
            return await content;
        }
    }
  }

  private async syncContent(api: ApiPromise, collectionId: number, itemId: number) {
    const uniques = new Uniques(api);
    const collection = uniques.collection(collectionId);
    const item = collection.item(itemId);
    const metadata = await item.getMetadata();
    // Ensure an eventual existing element is wiped
    this.shadowRoot && clearElement(this.shadowRoot);
    if (metadata) {
        const content = await this.resolve(metadata.data);
        if (content) {
            const metadata = normalizeMetadata(content);
            const el = createMediaElement(metadata, new IPFSGatewaySourceResolver());
            if (el && this.shadowRoot) {
                // Append the newly created element
                this.shadowRoot.appendChild(el);
            } else {
                console.error("No element");
            }
        } else {
            console.error("No content");
        }
    } else {
        console.error("No Metadata");
    }
  }

  static get observedAttributes() {
    return [collectionAttribute, itemAttribute, providerAttribute];
  }

  async rerender(api: ApiPromise) {
    if (this.collection && this.item) {
        await this.syncContent(api, this.collection, this.item);
    }
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    switch (name) {
        case collectionAttribute:
        case itemAttribute:
            if (this.api) {
                this.rerender(this.api);
            } else {
                if (this.shadowRoot) {
                    clearElement(this.shadowRoot);
                }
            }
            break;
        case providerAttribute:
            if (this.provider) {
                const provider = new WsProvider(this.provider.wssURL);
                ApiPromise.create({ provider }).then(async (api: ApiPromise) => {
                    this.api = api;
    
                    this.rerender(api);
                });
            } else {
                if (this.shadowRoot) {
                    clearElement(this.shadowRoot);
                }
                this.api = null;

                console.error('Unknown provider');
            }
            break;
    }
  }

}
