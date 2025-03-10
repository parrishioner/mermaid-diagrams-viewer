import { ADFEntity } from '@atlaskit/adf-utils/types';
import { traverse } from '@atlaskit/adf-utils/traverse';
import { requestConfluence } from '@forge/bridge';

export type { ADFEntity } from '@atlaskit/adf-utils/types';

export interface PageResponseBody {
  body: { atlas_doc_format: { value: string } };
}

function getTextFromCodeBlock(node: ADFEntity) {
  return node.content?.[0]?.text?.trim() || '';
}

export function findCodeBlocks(adf: ADFEntity) {
  const codeBlocks: string[] = [];

  traverse(adf, {
    codeBlock: (node) => {
      codeBlocks.push(getTextFromCodeBlock(node));
    },
  });

  return codeBlocks;
}

type Attrs = {
  extensionKey?: string;
  parameters?: {
    localId?: string;
  };
};

export function autoMapMacroToCodeBlock(adf: ADFEntity, moduleKey: string) {
  const extensions: string[] = [];
  const codeBlocks: string[] = [];

  traverse(adf, {
    extension: (node: { attrs?: Attrs }) => {
      const extensionKey = node.attrs?.extensionKey;
      if (!extensionKey?.endsWith(moduleKey)) {
        return;
      }

      const localId = node.attrs?.parameters?.localId;
      if (!localId) {
        // TODO: throw error?
        return;
      }
      extensions.push(localId);
    },
    codeBlock: (node) => {
      codeBlocks.push(getTextFromCodeBlock(node));
    },
  });

  const map = new Map<string, string>();

  while (extensions.length > 0) {
    const extension = extensions.shift()!;
    const codeBlock = codeBlocks.shift()!;
    map.set(extension, codeBlock);
  }

  return map;
}

export async function getPageContent(
  pageId: string,
  isEditing: boolean,
): Promise<ADFEntity> {
  let pageResponse = await requestConfluence(
    `/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format&get-draft=${isEditing.toString()}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (pageResponse.status === 404) {
    pageResponse = await requestConfluence(
      `/wiki/api/v2/blogposts/${pageId}?body-format=atlas_doc_format&get-draft=${isEditing.toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
  }

  const pageResponseBody = (await pageResponse.json()) as PageResponseBody;
  const adf = JSON.parse(
    pageResponseBody.body.atlas_doc_format.value,
  ) as ADFEntity;

  return adf;
}
