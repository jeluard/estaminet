![CI status](https://github.com/jeluard/estaminet/actions/workflows/deploy.yml/badge.svg)

A set of [WebComponents](https://www.webcomponents.org/) building on top of [Statemint](https://wiki.polkadot.network/docs/learn-statemint) family of [Polkadot](polkadot.network) [parachains](https://wiki.polkadot.network/docs/learn-parachains).

# Usage

Download the latest version or include it directly from a CDN:

```html
<script src="https://esm.run/estaminet"></script>
​
<es-uniques-item-media provider="statemine" collection="11" item="1"></es-uniques-item-media>

<es-uniques-collection-media provider="statemine" collection="11"></es-uniques-collection-media>
```

You can also install it from [npm](https://www.npmjs.com/package/estaminet) and import the module in JavaScript:

```js
npm install estaminet

/* Import it */
import 'estaminet';

/* It can now be used as any regular HTML element */
function SomeJSXComponent() {
    return (
        <div>
            <es-uniques-item-media provider="statemine" collection={11} item={1}></es-uniques-item-media>
        </div>
    );
}
```

Examples can be found [here](examples/).

Try a live [demo](https://jeluard.github.io/estaminet/)