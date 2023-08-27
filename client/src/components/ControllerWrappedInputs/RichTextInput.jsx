import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import RawRichTextInput from '../RichTextInput';

export default function RichTextInput({ name, control, rules, defaultValue, setValue, ...rest }) {
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);
  useEffect(() => {
    setValue(name, inputValue);
  }, [name, inputValue, setValue]);
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={() => <RawRichTextInput {...rest} value={inputValue} onChange={setInputValue} />}
    />
  );
}
