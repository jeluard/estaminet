import { ApiPromise } from "@polkadot/api";
import { Uniques } from "gerbeur";
import { BaseProviderElement } from "../element";
import { IPFSGatewaySourceResolver, SourceResolver } from "../media";
import { IPFSGatewayStorageResolver, resolve, StorageResolver } from "../storage";
import { clearShadowRoot, getAttributeAsNumber, setAttribute } from "../utils/html";

type ExtendedMetadata = {
    name?: string,
    media: Media,
    description?: string,
    createdBy?: string,
    yearCreated?: string,
    tags?: Array<string>,
}

type Media = {
    uri: string,
    mimeType?: string,
    width?: number,
    height?: number,
    size?: number,
}

/**
 * @param data 
 * @returns an `ExtendedMetadata` from various forms of data
 */
function normalizeExtendedMetadata(data: any): ExtendedMetadata {
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

function createImageElement({name, media, description}: ExtendedMetadata, sourceResolver: SourceResolver): HTMLElement {
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

function createMediaElement(metadata: ExtendedMetadata, sourceResolver: SourceResolver): HTMLElement | undefined {
    switch(metadata.media.mimeType) {
        case undefined:
        case "image/png":
            return createImageElement(metadata, sourceResolver);
        default:
    }
}

const collectionAttribute = 'collection';
const itemAttribute = 'item';

export function defaultResolvers(): Map<string, StorageResolver> {
    const resolvers = new Map();
    resolvers.set("ipfs", new IPFSGatewayStorageResolver());
    return resolvers;
}

function syncFromMetadata(shadowRoot: ShadowRoot | null, metadata: ExtendedMetadata) {
    const el = createMediaElement(metadata, new IPFSGatewaySourceResolver());
    if (el && shadowRoot) {
      clearShadowRoot(shadowRoot);
        // Append the newly created element
        shadowRoot.appendChild(el);
    } else {
        console.error("No element");
    }
}

export class UniquesCollectionMediaElement extends BaseProviderElement {
    constructor() {
      super();

      window.addEventListener("default-api-changed", (evt) => {
        this.api = evt.detail.api;
        this.rerender();
      });
      this.addEventListener("api-changed", this.rerender);
      this.addEventListener("attribute-changed", this.rerender);
    }

    get collection(): number | null {
      return getAttributeAsNumber(this, collectionAttribute);
    }
  
    set collection(number: number | null) {
      setAttribute(this, collectionAttribute, number);
    }

    async rerender() {
        if (this.api && this.collection) {
            await this.syncContent(this.api, this.collection);
        }
    }

    private async syncContent(api: ApiPromise, collectionId: number) {
      const uniques = new Uniques(api);
      const collection = uniques.collection(collectionId);
      const metadata = await collection.getMetadata();
      if (metadata) {
          const content = await resolve(Array.from(defaultResolvers().values()), metadata.data);
          if (content) {
              const metadata = normalizeExtendedMetadata(content);
              syncFromMetadata(this.shadowRoot, metadata);
          } else {
              console.error("No content");
          }
      } else {
          console.error("No Metadata");
      }
    }

    static get observedAttributes() {
      return [collectionAttribute, ...super.observedAttributes];
    }

}

export class UniquesItemMediaElement extends BaseProviderElement {
  constructor() {
    super();

    window.addEventListener("default-api-changed", (evt) => {
      this.api = evt.detail.api;
      this.rerender();
    });
    this.addEventListener("api-changed", this.rerender);
    this.addEventListener("attribute-changed", this.rerender);
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

  private async syncContent(api: ApiPromise, collectionId: number, itemId: number) {
    const uniques = new Uniques(api);
    const collection = uniques.collection(collectionId);
    const item = collection.item(itemId);
    const metadata = await item.getMetadata();
    if (metadata) {
        const content = await resolve(Array.from(defaultResolvers().values()), metadata.data);
        if (content) {
            const metadata = normalizeExtendedMetadata(content);
            syncFromMetadata(this.shadowRoot, metadata);
        } else {
            console.error("No content");
        }
    } else {
        console.error("No Metadata");
    }
  }

  static get observedAttributes() {
    return [collectionAttribute, itemAttribute, ...super.observedAttributes];
  }

  async rerender() {
    if (this.api && this.collection && this.item) {
        await this.syncContent(this.api, this.collection, this.item);
    }
  }

}

/*TODO Cards */
/*TODO Gallery */