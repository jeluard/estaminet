import React from "react";
import * as ReactDOMClient from 'react-dom/client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { registerDefaultApi, registerElements,  UniquesCollectionMediaElement, UniquesItemMediaElement } from "estaminet";
import { Dropdown, Input, NextUIProvider, Spacer } from "@nextui-org/react";
import { ApiPromise, WsProvider } from "@polkadot/api";

const container = document.getElementById('root');
if (container) {
  const root = ReactDOMClient.createRoot(container);
  root.render(<App />);
}

type Snippet = {
  id: string,
  name: string,
  defaults: Record<string, string>
}

const wsProvider = new WsProvider("wss://statemine.api.onfinality.io/public-ws");
ApiPromise.create({ provider: wsProvider }).then(api => {
  registerDefaultApi(api);
});

const snippets: Array<Snippet> = [{id: "es-uniques-item-media",
                   name: "Item Media",
                   defaults: {collection: "11", item: "1"}},
                  {id: "es-uniques-collection-media",
                   name: "Collection Media",
                   defaults: {collection: "11"}}];

function Selector({ snippets, onChange }: { snippets: Array<Snippet>, onChange: (snippet: Snippet) => void }): JSX.Element {
  const [selected, setSelected] = React.useState(snippets[0]);
  return (
    <Dropdown>
      <Dropdown.Button flat>{selected.name}</Dropdown.Button>
      <Dropdown.Menu
        aria-label="Static Actions"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selected.id}
        onAction={(e) => {const snippet = snippets.find(s => s.id == e)!; onChange(snippet); setSelected(snippet)}}>
        {snippets.map(snippet => {
          return <Dropdown.Item key={snippet.id} >{snippet.name}</Dropdown.Item>;
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}

function snippetAsString(snippet: Snippet): string {
  const attributes = Object.entries(snippet.defaults).map(values => {
    values[1] = `"${values[1]}"`;
    return values.join("=");
  }).join(" ");
  return `<${snippet.id} ${attributes}></${snippet.id}>`;
}

function App() {
  const [snippet, setSnippet] = React.useState<Snippet>(snippets[0]);

  const __html = snippetAsString(snippet);
  return (
    <NextUIProvider>
      <div style={{display: "flex", height: "100vh", alignItems: "center"}}>
        <div style={{display: "flex", height: "50vh", flex: "1"}}>
          <div style={{flex: "1"}} dangerouslySetInnerHTML={{__html}} />
          <div style={{display: "flex", flexDirection: "column", flex: "1", alignItems: "center"}}>
            <Selector snippets={snippets} onChange={setSnippet} />
            <Spacer x={0.5} />
            <div style={{display: "flex", flex: "1", alignItems: "center"}}>
              {Object.keys(snippet.defaults).map(key => {
                return (
                  <>
                    <Input
                      labelPlaceholder={key}
                      initialValue={snippet.defaults[key]}
                      onChange={(e) => {snippet.defaults[key] = e.target.value; setSnippet({...snippet})}}
                    />
                    <Spacer x={0.5} />
                  </>
                );
              })}
            </div>
            <div style={{display: "flex", flex: "1", alignItems: "center"}}>
              <SyntaxHighlighter language="html">
              {__html}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </NextUIProvider>
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'es-uniques-collection-media': React.DetailedHTMLProps<React.HTMLAttributes<UniquesCollectionMediaElement>, UniquesCollectionMediaElement>,
      'es-uniques-item-media': React.DetailedHTMLProps<React.HTMLAttributes<UniquesItemMediaElement>, UniquesItemMediaElement>,
    }
}
}