import React, { useState } from 'react';

import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function CopyButton({ text, size = 'medium' }) {
  const [label, setLabel] = useState('Copy');
  return (
    <Tooltip placement="top" title={label}>
      <IconButton
        onClick={() => {
          navigator.clipboard.writeText(text);
          setLabel('Copied!');
          setTimeout(() => setLabel('Copy'), 2000);
        }}
      >
        <ContentCopyIcon fontSize={size} />
      </IconButton>
    </Tooltip>
  );
}
