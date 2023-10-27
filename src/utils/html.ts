export function getAttributeAsNumber(
  el: Element,
  attributeName: string
): number | null {
  const attribute = el.getAttribute(attributeName);
  if (attribute) {
    return Number.parseInt(attribute);
  }
  return null;
}

export function setAttribute(
  el: Element,
  attributeName: string,
  attributeValue: string | null
) {
  if (attributeValue) {
    el.setAttribute(attributeName, attributeValue);
  } else {
    el.removeAttribute(attributeName);
  }
}

export function clearShadowRoot(shadowRoot: ShadowRoot) {
  shadowRoot.innerHTML = '';
}

export function createSVGElement(content: string): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.innerHTML = content;
  return svg;
}
