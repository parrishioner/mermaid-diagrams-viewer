import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import mermaid from 'mermaid';
import SVG from 'react-inlinesvg';

mermaid.mermaidAPI.initialize({ startOnLoad: false });

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(async () => {
    try {
      const data = await invoke('getFile', {});
      const svg = await mermaid.mermaidAPI.renderAsync('test', data);
      setData(svg);
    } catch (error) {
      console.error(error);
      setError(error.message)
    }
  }, []);

  const loadingMessage = !data && !error ? 'Loading...' : null;
  const errorComponent = error;
  const dataComponent = data ? <SVG src={data} /> : null;

  return (
    <div>
      {loadingMessage}
      {errorComponent}
      {dataComponent}
    </div>
  );
}

export default App;
