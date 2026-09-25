import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { clearInstanceCredentials, useInstanceCredentialsStore } from '@shared/model';

import { InstanceSetupModal } from './instance-setup-modal';

beforeEach(() => {
  clearInstanceCredentials();
});

describe('InstanceSetupModal', () => {
  it('показывает форму подключения, когда инстанс не настроен', () => {
    render(<InstanceSetupModal />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Подключение инстанса');
    expect(screen.getByLabelText('idInstance')).toBeInTheDocument();
    expect(screen.getByLabelText('apiTokenInstance')).toBeInTheDocument();
  });

  it('не рендерится, когда инстанс уже настроен', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });

    render(<InstanceSetupModal />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('показывает ошибки для пустых полей', async () => {
    render(<InstanceSetupModal />);

    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(screen.getByText('Укажите idInstance')).toBeInTheDocument();
    expect(screen.getByText('Укажите apiTokenInstance')).toBeInTheDocument();
    expect(useInstanceCredentialsStore.getState().idInstance).toBe('');
  });

  it('требует целочисленный idInstance', async () => {
    render(<InstanceSetupModal />);

    await userEvent.type(screen.getByLabelText('idInstance'), 'abc');
    await userEvent.type(screen.getByLabelText('apiTokenInstance'), 'token');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(screen.getByText('idInstance должен быть целым числом')).toBeInTheDocument();
  });

  it('сохраняет учётные данные и скрывается при корректном вводе', async () => {
    render(<InstanceSetupModal />);

    await userEvent.type(screen.getByLabelText('idInstance'), '1101000000');
    await userEvent.type(screen.getByLabelText('apiTokenInstance'), 'token');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(useInstanceCredentialsStore.getState()).toMatchObject({
      idInstance: '1101000000',
      apiTokenInstance: 'token',
    });
  });
});
