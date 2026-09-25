import { MaxUI } from '@maxhub/max-ui';

import { useIsClient } from '@shared/lib';

const ROOT_CLASS_NAME = 'h-dvh max-h-full w-full min-w-70 overflow-hidden';

export const MaxUIProvider = ({ children }: { children: React.ReactNode }) => {
  const isClient = useIsClient();

  if (!isClient) {
    return <div className={ROOT_CLASS_NAME}>{children}</div>;
  }

  return <MaxUI className={ROOT_CLASS_NAME}>{children}</MaxUI>;
};
