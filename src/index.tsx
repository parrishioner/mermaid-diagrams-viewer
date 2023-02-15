import ForgeUI, { useState, render, Fragment, Macro, Text } from '@forge/ui';
import api from '@forge/api';
import mermaid from 'mermaid';
mermaid.mermaidAPI.initialize({ startOnLoad: false });

const App = () => {
  const [data] = useState(async () => {
    const bitbucket = api.asUser().withProvider('bitbucket', 'bitbucket-api')
    console.log('------- 1')
    if (!await bitbucket.hasCredentials()) {
      console.log('------- 2')
      await bitbucket.requestCredentials()
      console.log('------- 3')
    }
    console.log('------- 4')
    // https://api.bitbucket.org/2.0/repositories/atlassian/bbql/src/eefd5ef/tests/__init__.py?format=meta
    const response = await bitbucket.fetch('https://api.bitbucket.org/2.0/repositories/atlassian/diagrams/src/master/src/AccessNarrowing/ECORFC-131/filter-extensions.mmd');
    const diagram = await response.text();
    const rendered = await mermaid.mermaidAPI.renderAsync('test', diagram);
    return JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      text: rendered,
    }, null, 2)
  })

  return (
    <Fragment>
      <Text>{data}</Text>
    </Fragment>
  );
};

export const run = render(
  <Macro
    app={<App />}
  />
);
