import React, { useEffect, useMemo, useState } from 'react';
import { invoke } from '@forge/bridge';
import mermaid from 'mermaid';
import SVG from 'react-inlinesvg';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Banner from '@atlaskit/banner';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Spinner from '@atlaskit/spinner';

mermaid.mermaidAPI.initialize({ startOnLoad: false });

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

type SuccessResponse<T = any> = {
  data: T;
};

class ServerError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

function processResponse<T>(response: ErrorResponse | SuccessResponse<T>) {
  if ('error' in response) {
    throw new ServerError(response.error.message, response.error.code);
  }
  return response.data;
}

async function fetchFile() {
  const response = await invoke<ErrorResponse | SuccessResponse<string>>(
    'getFile',
    {}
  );
  const file = processResponse(response);
  return file;
}

const Diagram: React.FunctionComponent<{ svg?: string }> = (props) => {
  if (!props.svg) {
    return null;
  }

  return (
    <TransformWrapper>
      <TransformComponent
        wrapperStyle={{ width: 'auto' }}
        contentStyle={{ width: 'auto' }}
      >
        <SVG src={props.svg} />
      </TransformComponent>
    </TransformWrapper>
  );
};

const ErrorMessage: React.FunctionComponent<{ error?: Error }> = (props) => {
  if (!props.error) {
    return null;
  }

  return (
    <Banner
      appearance="warning"
      icon={<WarningIcon label="" secondaryColor="inherit" />}
    >
      Error while loading diagram:
      {props.error.message}
    </Banner>
  );
};

const Loading: React.FunctionComponent<{ loading?: boolean }> = (props) => {
  if (!props.loading) {
    return null;
  }

  return (
    <div>
      Loading diagram <Spinner interactionName="load" />
    </div>
  );
};

function App() {
  const [file, setFile] = useState<string | undefined>();

  const [size, setSize] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const [error, setError] = useState<ServerError | undefined>();

  useEffect(() => {
    const onResize = () => {
      const newSize = {
        height: window.innerHeight,
        width: window.innerWidth,
      };
      if (newSize.height !== size.height || newSize.width !== size.width) {
        setSize(newSize);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchFile()
      .then(setFile)
      .catch((error) => {
        if (error instanceof ServerError) {
          return setError(error);
        }
        throw error;
      });
  }, []);

  const svg = useMemo(() => {
    if (!file) {
      return;
    }
    return mermaid.mermaidAPI.render('diagram' + Date.now(), file);
  }, [file, size]);

  return (
    <div>
      <Loading loading={!svg && !error} />
      <Diagram svg={svg} />
      <ErrorMessage error={error} />
    </div>
  );
}

export default App;
