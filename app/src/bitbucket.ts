import Resolver from '@forge/resolver';
import api from '@forge/api';
import { convertFileUrl, validateFileUrl } from './lib/file-url';

type Config = { url?: string } | undefined;

const resolver = new Resolver();

resolver.define('getFile', async (req) => {
  const config = req.context.extension.config as Config;
  console.log({ config });

  const fileUrl = config?.url;

  if (!fileUrl) {
    throw new Error('No file URL specified');
  }

  validateFileUrl(fileUrl);

  const bitbucket = api.asUser().withProvider('bitbucket', 'bitbucket-api');

  if (!(await bitbucket.hasCredentials())) {
    await bitbucket.requestCredentials();
  }

  const response = await bitbucket.fetch(convertFileUrl(fileUrl));

  if (!response.ok) {
    const errorResponse = await response.text();
    throw new Error(`Error fetching diagram: ${errorResponse}`);
  }

  const diagram = await response.text();
  return diagram;
});

export const run = resolver.getDefinitions();
