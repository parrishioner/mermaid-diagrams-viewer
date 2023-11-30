import ForgeUI, {
  MacroConfig,
  render,
  Select,
  useEffect,
  useProductContext,
  useState,
  Option,
  useConfig,
} from '@forge/ui';
import { findCodeBlocks, getPageContent } from './lib/confluence';
import { Config } from './lib/config';

const DiagramConfig = () => {
  const [codeBlocks, setCodeBlocks] = useState<string[]>([]);

  const context = useProductContext();
  const config = useConfig() as Config | undefined;

  useEffect(async () => {
    const isEditing = true;

    const adf = await getPageContent(context.contentId!, isEditing);
    setCodeBlocks(findCodeBlocks(adf));
  }, []);

  return (
    <MacroConfig>
      <Select
        label="Select codeblock with mermaid diagram to render"
        name="index"
      >
        {codeBlocks.map((codeBlock, i) => {
          return (
            <Option
              label={`${i + 1} - ${codeBlock.substring(0, 35)}...`}
              value={i}
              defaultSelected={config?.index === i}
            />
          );
        })}
      </Select>
    </MacroConfig>
  );
};

export const run = render(<DiagramConfig />);
