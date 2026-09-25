import { Button, Flex, Typography } from '@maxhub/max-ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { StartChatModal } from '@features/start-chat';

export const Home = () => {
  const [isStartChatOpen, setIsStartChatOpen] = useState(false);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Flex direction="column" align="center" gap={16} className="relative p-6 text-center">
        <Typography.Text variant="body" color="secondary">
          Выберите чат слева или начните новый по номеру телефона
        </Typography.Text>
        <Button
          variant="primary"
          size="medium"
          iconBefore={<Plus size={18} />}
          onClick={() => setIsStartChatOpen(true)}
        >
          Новый чат
        </Button>
      </Flex>

      <StartChatModal open={isStartChatOpen} onClose={() => setIsStartChatOpen(false)} />
    </div>
  );
};
