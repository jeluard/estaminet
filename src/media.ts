import loading from 'bundle-text:./assets/loading.svg';
import noContent from 'bundle-text:./assets/no-content.svg';
import noMetadata from 'bundle-text:./assets/no-metadata.svg';
import { Metadata, Uniques } from './uniques';
import { url } from './utils/ipfs';
import { BaseProviderElement } from './element';
import {
  IPFSGatewayStorageResolver,
  resolve,
  StorageResolver,
} from './storage';
import {
  clearShadowRoot,
  createSVGElement,
  getAttributeAsNumber,
  setAttribute,
} from './utils/html';

type ExtendedMetadata = {
  name?: string;
  media: Media;
  description?: string;
  createdBy?: string;
  yearCreated?: string;
  tags?: Array<string>;
};

type Media = {
  uri: string;
  mimeType?: string;
  width?: number;
  height?: number;
  size?: number;
};

/**
 * Resolves a chunk of data into something that can be used as an image element `src` attribute.
 */
export interface SourceResolver {
  resolve(data: string): string | undefined;
}

export class IPFSGatewaySourceResolver implements SourceResolver {
  resolve(data: string): string | undefined {
    return url(data);
  }
}

export function defaultResolvers(): Map<string, StorageResolver> {
  const resolvers = new Map();
  resolvers.set('ipfs', new IPFSGatewayStorageResolver());
  return resolvers;
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

function createImageElement(
  { name, media, description }: ExtendedMetadata,
  sourceResolver: SourceResolver
): HTMLElement {
  const { uri, width, height } = media;
  const el = document.createElement('img');
  el.style.width = '100%';
  el.style.height = '100%';
  const source = sourceResolver.resolve(uri);
  if (source) el.src = source;
  const alt = name || description;
  if (alt) el.alt = alt;
  if (width) el.width = width;
  if (height) el.height = height;
  return el;
}

function createMediaElement(
  metadata: ExtendedMetadata,
  sourceResolver: SourceResolver
): HTMLElement | undefined {
  switch (metadata.media.mimeType) {
    case undefined:
    case 'image/png':
      return createImageElement(metadata, sourceResolver);
    default:
  }
}

const collectionAttribute = 'collection';
const itemAttribute = 'item';

function setShadowRoot(shadowRoot: ShadowRoot, el: Node) {
  clearShadowRoot(shadowRoot);
  shadowRoot.appendChild(el);
}

function syncFromMetadata(
  shadowRoot: ShadowRoot,
  metadata: ExtendedMetadata
) {
  const el = createMediaElement(metadata, new IPFSGatewaySourceResolver());
  if (el && shadowRoot) {
    setShadowRoot(shadowRoot, el);
  } else {
    console.error(`Can't create image element: unsupported media ${metadata.media}`);
  }
}

export class UniquesCollectionMediaElement extends BaseProviderElement {
  constructor() {
    super();
console.log("super")
    this.addEventListener('api-changed', this.rerender);
    this.addEventListener('attribute-changed', this.rerender);
  }

  get collection(): number | null {
    return getAttributeAsNumber(this, collectionAttribute);
  }

  set collection(number: number | null) {
    setAttribute(this, collectionAttribute, number ? number.toString() : null);
  }

  protected async metadata(): Promise<Metadata | undefined | null> {
    if (this.api && this.collection) {
      const uniques = new Uniques(this.api);
      const collection = uniques.collection(this.collection);
      return await collection.getMetadata();
    }
    return null;
  }

  private async rerender() {
    console.log("rerender")
    setShadowRoot(this.shadowRoot!!, createSVGElement(loading));
    const metadata = await this.metadata();
    if (metadata) {
      const content = await resolve(
        // TODO allow to configure globally resolvers
        Array.from(defaultResolvers().values()),
        metadata.data
      );
      if (content) {
        const metadata = normalizeExtendedMetadata(content);
        syncFromMetadata(this.shadowRoot!!, metadata);
      } else {
        setShadowRoot(this.shadowRoot!!, createSVGElement(noContent));
      }
    } else if (metadata == null) {
      // Some missing attributes preventing metadata access, clear shadow root
      clearShadowRoot(this.shadowRoot!!);
      console.log("Null metadata")
    } else {
      setShadowRoot(this.shadowRoot!!, createSVGElement(noMetadata));
      console.log("No metadata")
    }
  }

  static get observedAttributes() {
    return [collectionAttribute, ...super.observedAttributes];
  }
}

export class UniquesItemMediaElement extends UniquesCollectionMediaElement {
  constructor() {
    super();
    console.log("UniquesItemMediaElement")
  }

  get item(): number | null {
    return getAttributeAsNumber(this, itemAttribute);
  }

  set item(number: number | null) {
    setAttribute(this, itemAttribute, number ? number.toString() : null);
  }

  protected async metadata(): Promise<Metadata | null | undefined> {
    console.log("metadata items")
    console.log(this.api, this.collection, this.item)
    if (this.api && this.collection && this.item) {
      const uniques = new Uniques(this.api);
      const collection = uniques.collection(this.collection);
      const item = collection.item(this.item);
      return await item.getMetadata();
    }
    return null;
  }

  static get observedAttributes() {
    return [itemAttribute, ...super.observedAttributes];
  }

}
