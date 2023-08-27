import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import RawRichTextEditor from '../RichTextEditor/RichTextEditor';

export default function RichTextEditor({ name, control, rules, defaultValue, setValue, ...rest }) {
  const [inputValue, setInputValue] = useState(defaultValue);
  useEffect(() => {
    setValue(name, inputValue);
  }, [name, inputValue, setValue]);
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={() => <RawRichTextEditor {...rest} value={inputValue} onChange={setInputValue} />}
    />
  );
}
