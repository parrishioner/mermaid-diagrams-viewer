import { getPageContent } from '../lambda';
import api, { route } from '@forge/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock @forge/api
vi.mock('@forge/api', () => ({
  __esModule: true,
  default: {
    asUser: vi.fn(),
  },
  route: vi.fn(
    (strings: TemplateStringsArray, ...values: (string | number)[]) => {
      return strings.reduce((result, string, i) => {
        const value = values[i] ?? '';
        return result + string + String(value);
      }, '');
    },
  ),
}));

const mockApi = vi.mocked(api);
const mockRoute = vi.mocked(route);

describe('api-client/lambda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPageContent', () => {
    const pageId = 'test-page-id';
    const mockAdfValue = '{"type":"doc","content":[]}';
    const mockPageResponse = {
      body: {
        atlas_doc_format: {
          value: mockAdfValue,
        },
      },
    };

    const mockRequestConfluence = vi.fn();

    beforeEach(() => {
      const mockAsUserReturn = {
        requestConfluence: mockRequestConfluence,
      };
      mockApi.asUser.mockReturnValue(
        mockAsUserReturn as Parameters<typeof mockApi.asUser>[0] extends (
          callback: (methods: infer T) => unknown,
        ) => unknown
          ? T
          : never,
      );
      mockRoute.mockImplementation(
        (strings: TemplateStringsArray, ...values: unknown[]) => {
          let result = '';
          for (let i = 0; i < strings.length; i++) {
            result += strings[i];
            if (i < values.length) {
              result += String(values[i]);
            }
          }
          return result as never; // Mock return - Route type not accessible
        },
      );
    });

    it('should fetch page content successfully', async () => {
      mockRequestConfluence.mockResolvedValue({
        status: 200,
        json: vi.fn().mockResolvedValue(mockPageResponse),
      });

      const result = await getPageContent(pageId, false);

      expect(mockApi).toHaveProperty('asUser');
      expect(mockRequestConfluence).toHaveBeenCalledWith(
        `/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format&get-draft=false`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      expect(result).toEqual(JSON.parse(mockAdfValue));
    });

    it('should fetch page content with draft when isEditing is true', async () => {
      mockRequestConfluence.mockResolvedValue({
        status: 200,
        json: vi.fn().mockResolvedValue(mockPageResponse),
      });

      await getPageContent(pageId, true);

      expect(mockRequestConfluence).toHaveBeenCalledWith(
        `/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format&get-draft=true`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
    });

    it('should fallback to blogpost API when page returns 404', async () => {
      mockRequestConfluence
        .mockResolvedValueOnce({
          status: 404,
          json: vi.fn(),
        })
        .mockResolvedValueOnce({
          status: 200,
          json: vi.fn().mockResolvedValue(mockPageResponse),
        });

      const result = await getPageContent(pageId, false);

      expect(mockRequestConfluence).toHaveBeenCalledTimes(2);
      expect(mockRequestConfluence).toHaveBeenNthCalledWith(
        1,
        `/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format&get-draft=false`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      expect(mockRequestConfluence).toHaveBeenNthCalledWith(
        2,
        `/wiki/api/v2/blogposts/${pageId}?body-format=atlas_doc_format&get-draft=false`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      expect(result).toEqual(JSON.parse(mockAdfValue));
    });

    it('should handle errors from API', async () => {
      const error = new Error('API error');
      mockRequestConfluence.mockRejectedValue(error);

      await expect(getPageContent(pageId, false)).rejects.toThrow('API error');
    });

    it('should parse complex ADF correctly', async () => {
      const complexAdf = {
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            attrs: { language: 'text' },
            content: [
              {
                type: 'text',
                text: 'graph TD\n  A --> B',
              },
            ],
          },
        ],
      };

      mockRequestConfluence.mockResolvedValue({
        status: 200,
        json: vi.fn().mockResolvedValue({
          body: {
            atlas_doc_format: {
              value: JSON.stringify(complexAdf),
            },
          },
        }),
      });

      const result = await getPageContent(pageId, false);
      expect(result).toEqual(complexAdf);
    });
  });
});
