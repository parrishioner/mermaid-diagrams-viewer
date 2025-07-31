import { run } from '../diagram-export';
import { getCodeFromCorrespondingBlock } from 'shared/src/confluence/code-blocks';
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  type MockedFunction,
} from 'vitest';

// Mock the shared modules
vi.mock('shared/src/confluence/code-blocks', () => ({
  getCodeFromCorrespondingBlock: vi.fn(),
}));

vi.mock('shared/src/confluence/api-client/lambda', () => ({
  getPageContent: vi.fn(),
}));

const mockGetCodeFromCorrespondingBlock =
  getCodeFromCorrespondingBlock as MockedFunction<
    typeof getCodeFromCorrespondingBlock
  >;

describe('diagram-export', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to avoid noise in tests
    consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('run', () => {
    const mockPayload = {
      context: {
        content: { id: 'page-123' },
        moduleKey: 'test-module',
        localId: 'local-123',
      },
      config: { index: 1 },
      exportType: 'pdf' as const,
    };

    it('should process payload and return ADF document', async () => {
      const mockCode = 'graph TD\n  A --> B';
      mockGetCodeFromCorrespondingBlock.mockResolvedValue(mockCode);

      const result = await run(mockPayload);

      expect(mockGetCodeFromCorrespondingBlock).toHaveBeenCalledWith(
        {
          extension: {
            isEditing: false,
            config: mockPayload.config,
            content: { id: mockPayload.context.content.id },
          },
          moduleKey: mockPayload.context.moduleKey,
          localId: mockPayload.context.localId,
        },
        expect.any(Function), // getPageContent function
      );

      expect(result).toBeDefined();
      expect(result.type).toBe('doc');
    });

    it('should handle payload without config', async () => {
      const payloadWithoutConfig = {
        ...mockPayload,
        config: undefined,
      };

      const mockCode = 'sequenceDiagram\n  A->>B: Hello';
      mockGetCodeFromCorrespondingBlock.mockResolvedValue(mockCode);

      const result = await run(payloadWithoutConfig);

      expect(mockGetCodeFromCorrespondingBlock).toHaveBeenCalledWith(
        {
          extension: {
            isEditing: false,
            config: undefined,
            content: { id: payloadWithoutConfig.context.content.id },
          },
          moduleKey: payloadWithoutConfig.context.moduleKey,
          localId: payloadWithoutConfig.context.localId,
        },
        expect.any(Function),
      );

      expect(result).toBeDefined();
    });

    it('should handle different export types', async () => {
      const mockCode = 'flowchart LR\n  A --> B';
      mockGetCodeFromCorrespondingBlock.mockResolvedValue(mockCode);

      const wordPayload = { ...mockPayload, exportType: 'word' as const };
      const result = await run(wordPayload);

      expect(result).toBeDefined();
      expect(result.type).toBe('doc');
    });

    it('should propagate errors from getCodeFromCorrespondingBlock', async () => {
      const error = new Error('Failed to get code block');
      mockGetCodeFromCorrespondingBlock.mockRejectedValue(error);

      await expect(run(mockPayload)).rejects.toThrow(error);
    });

    it('should log payload and code', async () => {
      const mockCode = 'graph TD\n  A --> B';
      mockGetCodeFromCorrespondingBlock.mockResolvedValue(mockCode);

      await run(mockPayload);

      expect(consoleLogSpy).toHaveBeenCalledWith('Payload:', mockPayload);
      expect(consoleLogSpy).toHaveBeenCalledWith('Code:', mockCode);
    });
  });
});
