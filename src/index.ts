import { UniquesItemMedia } from "./uniques/media";
export { UniquesItemMedia } from "./uniques/media";

window.customElements.define('es-uniques-item-media', UniquesItemMedia);

declare global {
  interface HTMLElementTagNameMap {
    'es-uniques-item-media': UniquesItemMedia,
  }
  namespace JSX {
    interface IntrinsicElements {
        'es-uniques-item-media': UniquesItemMedia;
    }
}
}