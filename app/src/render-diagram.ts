import { isForgePlatformError } from '@forge/api';
import Resolver from '@forge/resolver';
import { addErrorFormatter, formatError, isInternalError } from './lib/error';
import { findCodeBlocks, getPageContent } from './lib/confluence';
import { Config } from './lib/config';

const resolver = new Resolver();

class MissingDiagram extends Error {}

addErrorFormatter(MissingDiagram, {
  code: 'DIAGRAM_IS_NOT_SELECTED',
});

resolver.define('getFile', async (req) => {
  try {
    const config = req.context.extension.config as Config | undefined;

    if (config?.index === undefined) {
      throw new MissingDiagram('No diagram selected');
    }

    const isEditing = req.context.extension.isEditing as boolean;

    const adf = await getPageContent(
      req.context.extension.content.id,
      isEditing
    );

    const codeBlock = findCodeBlocks(adf)[config.index];

    if (!codeBlock) {
      throw new MissingDiagram(
        `Code block under with position ${config.index + 1} not found`
      );
    }

    return {
      data: codeBlock,
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
