export function getAttributeAsNumber(el: Element, attributeName: string): number | null {
    const attribute = el.getAttribute(attributeName);
    if (attribute) {
        return Number.parseInt(attribute);
    }
    return null;
}

export function setAttribute(el: Element, attributeName: string, attributeValue: Object | null) {
    if (attributeValue) {
        el.setAttribute(attributeName, attributeValue.toString());
    } else {
        el.removeAttribute(attributeName);
    }
    return null;
}

export function clearShadowRoot(shadowRoot: ShadowRoot) {
    shadowRoot.innerHTML = '';
}