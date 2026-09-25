import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';

const queryDevtools = {
  name: 'Tanstack Query',
  render: <ReactQueryDevtoolsPanel />,
};

const routerDevtools = {
  name: 'Tanstack Router',
  render: <TanStackRouterDevtoolsPanel />,
};

export const AppDevtools = () => {
  return (
    <TanStackDevtools
      config={{
        position: 'bottom-right',
      }}
      plugins={[routerDevtools, queryDevtools]}
    />
  );
};
