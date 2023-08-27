import React from 'react';
import RichTextEditor from './RichTextEditor/RichTextEditor';
import EditorFormInputBase from './EditorFormInputBase';

export default function RichTextInput({
  label = 'Description',
  id = 'description',
  value,
  onChange,
  ...rest
}) {
  return (
    <EditorFormInputBase label={label} htmlFor={id}>
      <RichTextEditor id="description" value={value} onChange={onChange} {...rest} />
    </EditorFormInputBase>
  );
}
