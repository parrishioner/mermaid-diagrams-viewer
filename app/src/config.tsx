import ForgeUI, {
  MacroConfig,
  render,
  Select,
  TextField,
  useEffect,
  useProductContext,
  useState,
  Option,
  useConfig,
} from '@forge/ui';
import api, { route } from '@forge/api';
import { traverse } from '@atlaskit/adf-utils/traverse';

const BitbucketConfig = () => {
  return (
    <MacroConfig>
      <TextField name="url" label="Bitbucket file URL" />
    </MacroConfig>
  );
};

export const bitbucket = render(<BitbucketConfig />);

const ConfluenceConfig = () => {
  const [diagrams, setDiagrams] = useState<string[]>([]);

  const context = useProductContext();
  const config = useConfig() as { diagram?: string } | undefined;

  useEffect(async () => {
    const isEditing = true;

    const pageResponse = await api
      .asUser()
      .requestConfluence(
        route`/wiki/api/v2/pages/${context.contentId!}?body-format=atlas_doc_format&get-draft=${isEditing.toString()}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

    const pageResponseBody = await pageResponse.json();
    const adf = JSON.parse(pageResponseBody.body.atlas_doc_format.value);
    console.log(adf.content);

    const diagrams: string[] = [];
    const titleRegexp = /title\s+(.+)\n/i;

    traverse(adf, {
      codeBlock: (node) => {
        console.log(node);
        const text = node.content?.[0]?.text?.trim();
        if (!text) {
          return;
        }

        const title = text.match(titleRegexp)?.[1];
        if (!title) {
          return;
        }
        diagrams.push(title);
      },
    });
    console.log({ diagrams });
    setDiagrams(diagrams);
  }, []);

  return (
    <MacroConfig>
      <Select
        label="Select codeblock with mermaid diagram to render"
        name="diagram"
      >
        {diagrams.map((diagram) => {
          return (
            <Option
              label={diagram}
              value={diagram}
              defaultSelected={config?.diagram === diagram}
            />
          );
        })}
      </Select>
    </MacroConfig>
  );
};

export const confluence = render(<ConfluenceConfig />);
