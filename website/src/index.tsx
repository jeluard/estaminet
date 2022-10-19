import React from "react";
import * as ReactDOMClient from 'react-dom/client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import "estaminet";
import { Input, NextUIProvider, Spacer } from "@nextui-org/react";

const container = document.getElementById('root');
if (container) {
  const root = ReactDOMClient.createRoot(container);
  root.render(<App />);
}

function App() {
  const [provider, setProvider] = React.useState("statemine");
  const [collection, setCollection] = React.useState("11");
  const [item, setItem] = React.useState("1");

  const html = `<es-uniques-item-media provider="${provider}" collection="${collection}" item="${item}"></es-uniques-item-media>`
  return (
    <NextUIProvider>
      <div style={{display: "flex", height: "100vh", alignItems: "center"}}>
        <div style={{display: "flex", height: "50vh", flex: "1"}}>
          <div style={{flex: "1"}}>
            <es-uniques-item-media provider={provider} collection={collection} item={item}></es-uniques-item-media>
          </div>
          <div style={{display: "flex", flexDirection: "column", flex: "1", alignItems: "center"}}>
            <div style={{display: "flex", flex: "1", alignItems: "center"}}>
                <Input
                  labelPlaceholder="Provider"
                  initialValue={provider}
                  onChange={(e) => setProvider(e.target.value)}
                />
                <Spacer x={0.5} />
                <Input
                  labelPlaceholder="Collection"
                  initialValue={collection}
                  onChange={(e) => setCollection(e.target.value)}
                />
                <Spacer x={0.5} />
                <Input
                  labelPlaceholder="Item"
                  initialValue={item}
                  onChange={(e) => setItem(e.target.value)}
                />
            </div>
            <div style={{display: "flex", flex: "1", alignItems: "center"}}>
              <SyntaxHighlighter language="html">
              {html}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </NextUIProvider>
  );
}