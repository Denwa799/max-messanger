import { Button, Flex, Input, Panel, Typography } from '@maxhub/max-ui';
import { useState } from 'react';

import { useIsClient } from '@shared/lib';
import { useInstanceCredentialsStore, useIsInstanceConfigured } from '@shared/model';

import { instanceSetupSchema } from '../model/schema';
import type { InstanceSetupFormValues } from '../model/schema';

type InstanceSetupErrors = Partial<Record<keyof InstanceSetupFormValues, string>>;

const TITLE_ID = 'instance-setup-title';
const ID_INSTANCE_INPUT_ID = 'instance-setup-id';
const API_TOKEN_INPUT_ID = 'instance-setup-token';

const BACKDROP_CLASS_NAME =
  'fixed inset-0 z-50 flex items-center justify-center bg-background-overlay p-4';
// Panel по умолчанию тянется на всю высоту — для диалога это не нужно.
const DIALOG_CLASS_NAME =
  'h-auto max-h-full w-full max-w-md overflow-y-auto rounded-floating shadow-2xl';

const collectFieldErrors = (formValues: InstanceSetupFormValues): InstanceSetupErrors => {
  const result = instanceSetupSchema.safeParse(formValues);
  if (result.success) return {};

  const errors: InstanceSetupErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if ((field === 'idInstance' || field === 'apiTokenInstance') && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
};

export const InstanceSetupModal = () => {
  const isClient = useIsClient();
  const isConfigured = useIsInstanceConfigured();
  const setCredentials = useInstanceCredentialsStore((state) => state.setCredentials);

  const [formValues, setFormValues] = useState<InstanceSetupFormValues>({
    idInstance: '',
    apiTokenInstance: '',
  });
  const [errors, setErrors] = useState<InstanceSetupErrors>({});

  if (!isClient || isConfigured) return null;

  const handleFieldChange =
    (field: keyof InstanceSetupFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fieldErrors = collectFieldErrors(formValues);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setCredentials(formValues);
    // Очищаем форму: при выходе из аккаунта модалка показывается снова, и секреты прошлой
    // сессии не должны оставаться в полях.
    setFormValues({ idInstance: '', apiTokenInstance: '' });
  };

  return (
    <div className={BACKDROP_CLASS_NAME}>
      <Panel
        mode="primary"
        className={DIALOG_CLASS_NAME}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <Flex direction="column" gap={8}>
            <Typography.Title variant="small-strong" asChild>
              <h2 id={TITLE_ID}>Подключение инстанса</h2>
            </Typography.Title>
            <Typography.Text variant="description" color="secondary">
              Укажите idInstance и apiTokenInstance из личного кабинета GREEN-API — они нужны для
              работы с MAX и сохранятся в этом браузере.
            </Typography.Text>
          </Flex>

          <Flex direction="column" gap={16}>
            <label className="flex flex-col gap-1.5" htmlFor={ID_INSTANCE_INPUT_ID}>
              <Typography.Label variant="small-strong" asChild>
                <span>idInstance</span>
              </Typography.Label>
              <Input
                id={ID_INSTANCE_INPUT_ID}
                value={formValues.idInstance}
                onChange={handleFieldChange('idInstance')}
                placeholder="Например, 1101000000"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                aria-invalid={Boolean(errors.idInstance)}
                hint={
                  errors.idInstance && (
                    <span className="text-text-negative">{errors.idInstance}</span>
                  )
                }
              />
            </label>

            <label className="flex flex-col gap-1.5" htmlFor={API_TOKEN_INPUT_ID}>
              <Typography.Label variant="small-strong" asChild>
                <span>apiTokenInstance</span>
              </Typography.Label>
              <Input
                id={API_TOKEN_INPUT_ID}
                value={formValues.apiTokenInstance}
                onChange={handleFieldChange('apiTokenInstance')}
                placeholder="Токен инстанса"
                autoComplete="off"
                aria-invalid={Boolean(errors.apiTokenInstance)}
                hint={
                  errors.apiTokenInstance && (
                    <span className="text-text-negative">{errors.apiTokenInstance}</span>
                  )
                }
              />
            </label>
          </Flex>

          <Button type="submit" size="large" stretched>
            Сохранить
          </Button>
        </form>
      </Panel>
    </div>
  );
};
