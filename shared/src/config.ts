export const CONFIG_FIELD = 'index';
export type Config = { [CONFIG_FIELD]?: number };

export function getIndexFromConfig(
  config: Config | undefined,
): number | undefined {
  if (Number.isSafeInteger(config?.index)) {
    return config?.index;
  }
  return undefined;
}
