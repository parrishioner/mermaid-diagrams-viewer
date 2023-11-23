import { traverse } from '@atlaskit/adf-utils/traverse';
import api, { isForgePlatformError, route } from '@forge/api';
import Resolver from '@forge/resolver';
import { addErrorFormatter, formatError, isInternalError } from './lib/error';

const resolver = new Resolver();

class MissingDiagram extends Error {}

addErrorFormatter(MissingDiagram, {
  code: 'DIAGRAM_IS_NOT_SELECTED',
});

type Config = { diagram?: string } | undefined;

resolver.define('getFile', async (req) => {
  try {
    const config = req.context.extension.config as Config;

    if (!config?.diagram) {
      throw new MissingDiagram('No diagram selected');
    }

    const isEditing = req.context.extension.isEditing as boolean;

    const pageResponse = await api
      .asUser()
      .requestConfluence(
        route`/wiki/api/v2/pages/${
          req.context.extension.content.id
        }?body-format=atlas_doc_format&get-draft=${isEditing.toString()}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

    const pageResponseBody = await pageResponse.json();
    const adf = JSON.parse(pageResponseBody.body.atlas_doc_format.value);
    console.log(adf.content);

    let data = '';

    traverse(adf, {
      codeBlock: (node) => {
        console.log(node);
        const text = node.content?.[0]?.text || '';
        if (text.includes(config.diagram!)) {
          data = text;
        }
      },
    });

    if (!data) {
      throw new MissingDiagram(`Diagram ${config.diagram} not found`);
    }

    return {
      data,
    };
  } catch (error: any) {
    if (isForgePlatformError(error)) {
      console.warn(error);
      throw error;
    }

    if (isInternalError(error)) {
      console.error(error);
    } else {
      console.warn(error);
    }

    return {
      error: formatError(error),
    };
  }
});

export const run = resolver.getDefinitions();
