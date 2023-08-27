import React, { useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill';
import katex from 'katex';
import ImageUploader from 'quill-image-uploader';
import ImageResize from 'quill-image-resize-module-react';
import { uploadFile } from '../../utils/api/file';
import { SERVER_URL } from '../../utils/constants';
import 'katex/dist/katex.min.css';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

Quill.register('modules/imageUploader', ImageUploader);
Quill.register('modules/imageResize', ImageResize);
window.Quill = Quill;
window.katex = katex;

export default function RichTextEditor({ isSticky = true, minContainerHeight = '9rem', ...props }) {
  const quillRef = useRef(null);
  const navigate = useNavigate();
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block', 'formula'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'video'],
        ],
      },
      // Sends pasted, dragged and dropped, and inserted images to backend
      imageUploader: {
        upload: (file) =>
          uploadFile(file, navigate).then((data) => {
            return `${SERVER_URL}/api/file/${data.fileId}`;
          }),
      },
      // Allows for image resizing
      imageResize: {
        parchment: Quill.import('parchment'),
        modules: ['Resize', 'DisplaySize'],
      },
      // Avoid a bug in quill where unnecessary line breaks are inserted between elements
      clipboard: {
        matchVisual: false,
      },
    }),
    [navigate]
  );
  useEffect(() => {
    // Apply styles
    const toolbar = document.querySelector('.ql-toolbar');
    toolbar.style.position = isSticky && 'sticky';
    toolbar.style.top = isSticky && 'calc(var(--navHeight) + 0.25rem)';

    const container = document.querySelector('.ql-editor');
    container.style.minHeight = minContainerHeight;
  });
  return <ReactQuill theme="snow" modules={modules} {...props} ref={quillRef} />;
}
