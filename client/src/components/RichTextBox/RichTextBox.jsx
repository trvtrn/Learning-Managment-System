import React, { useRef, useEffect } from 'react';
import './RichTextBox.css';

export default function RichTextBox({ content, ...rest }) {
  const boxRef = useRef();
  useEffect(() => {
    if (!boxRef.current) return;
    boxRef.current.innerHTML = content;
  }, [content]);
  return <div className="richTextBox" ref={boxRef} {...rest} />;
}
