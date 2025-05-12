// TODO
/* eslint-disable no-console */

import { doc, media, mediaSingle } from '@atlaskit/adf-utils/builders';
import { getCodeFromCorrespondingBlock } from 'shared/src/confluence/code-blocks';
import { getPageContent } from 'shared/src/confluence/api-client/lambda';

type Payload = {
  context: {
    content: {
      id: string;
    };
    moduleKey: string;
    localId: string;
  };
  config?: {
    index?: number;
  };
  exportType: 'pdf' | 'word' | 'other';
};

export const run = async (payload: Payload) => {
  console.log('Payload:', payload);

  const code = await getCodeFromCorrespondingBlock(
    {
      extension: {
        isEditing: false,
        config: payload.config,
        content: {
          id: payload.context.content.id,
        },
      },
      moduleKey: payload.context.moduleKey,
      localId: payload.context.localId,
    },
    getPageContent,
  );

  console.log('Code:', code);

  const pic = media({
    type: 'link',
    collection: 'MediaServicesSample',
    id: '131155',
    alt: 'IMG_0428.JPG',
    height: 4000,
    width: 6000,
    // https://dhreben2.atlassian.net/wiki/download/attachments/95289347/IMG_0428.JPG?api=v2
  });

  const group = mediaSingle({
    layout: 'wrap-left',
  })(pic);

  const adf = doc(group);
  console.log(JSON.stringify(adf, null, 2));
  return adf;
};
