import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { instanceCredentialsSchema } from './schema';
import { createCookieStorage } from './storage';

export interface InstanceCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

interface InstanceCredentialsState extends InstanceCredentials {
  setCredentials: (credentials: InstanceCredentials) => void;
  resetCredentials: () => void;
}

const EMPTY_CREDENTIALS: InstanceCredentials = {
  idInstance: '',
  apiTokenInstance: '',
};

const STORAGE_KEY = 'max-instance-credentials';

export const useInstanceCredentialsStore = create<InstanceCredentialsState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        ...EMPTY_CREDENTIALS,
        setCredentials: ({ idInstance, apiTokenInstance }) =>
          set({
            idInstance: idInstance.trim(),
            apiTokenInstance: apiTokenInstance.trim(),
          }),
        resetCredentials: () => set({ ...EMPTY_CREDENTIALS }),
      }),
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(createCookieStorage),
        partialize: ({ idInstance, apiTokenInstance }) => ({ idInstance, apiTokenInstance }),
        merge: (persistedState, currentState) => {
          const parsed = instanceCredentialsSchema.safeParse(persistedState);
          return parsed.success ? { ...currentState, ...parsed.data } : currentState;
        },
      },
    ),
  ),
);

export const clearInstanceCredentials = (): void => {
  useInstanceCredentialsStore.getState().resetCredentials();
  void useInstanceCredentialsStore.persist.clearStorage();
};

/** Актуальные учётные данные для не-React кода (например, внутри `mutationFn`). */
export const getInstanceCredentials = (): InstanceCredentials => {
  const { idInstance, apiTokenInstance } = useInstanceCredentialsStore.getState();
  return { idInstance, apiTokenInstance };
};

export const useIsInstanceConfigured = (): boolean =>
  useInstanceCredentialsStore(
    (state) => state.idInstance.length > 0 && state.apiTokenInstance.length > 0,
  );

/** Текущие учётные данные инстанса (сравнение по полям, без лишних ре-рендеров). */
export const useInstanceCredentials = (): InstanceCredentials =>
  useInstanceCredentialsStore(
    useShallow((state) => ({
      idInstance: state.idInstance,
      apiTokenInstance: state.apiTokenInstance,
    })),
  );
