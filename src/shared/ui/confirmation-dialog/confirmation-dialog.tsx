import { Button, Flex, Panel, Typography } from '@maxhub/max-ui';
import { useEffect, useRef } from 'react';

const TITLE_ID = 'confirmation-dialog-title';
const DESCRIPTION_ID = 'confirmation-dialog-description';

const BACKDROP_CLASS_NAME =
  'fixed inset-0 z-50 flex items-center justify-center bg-background-overlay p-4';
// Panel по умолчанию тянется на всю высоту — для диалога это не нужно.
const DIALOG_CLASS_NAME =
  'h-auto max-h-full w-full max-w-sm overflow-y-auto rounded-floating shadow-2xl';

export interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) => {
  const onCancelRef = useRef(onCancel);

  // Обработчик может меняться между рендерами, но не должен переподписывать листенер.
  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancelRef.current();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div className={BACKDROP_CLASS_NAME} onClick={onCancel}>
      <Panel
        mode="primary"
        className={DIALOG_CLASS_NAME}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        aria-describedby={description ? DESCRIPTION_ID : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <Flex direction="column" gap={8} className="p-6">
          <Typography.Title variant="small-strong" asChild>
            <h2 id={TITLE_ID}>{title}</h2>
          </Typography.Title>
          {description && (
            <Typography.Text id={DESCRIPTION_ID} variant="description" color="secondary">
              {description}
            </Typography.Text>
          )}
        </Flex>

        <Flex gap={8} className="px-6 pb-6">
          <Button variant="secondary" stretched autoFocus onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" stretched onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Flex>
      </Panel>
    </div>
  );
};
