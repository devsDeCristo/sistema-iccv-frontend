import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CustomToolbar from './customToolbar';
import Quill from 'quill';
// @ts-ignore - no type declarations for 'quill-image-resize-module-react'
// import ImageResize from "quill-image-resize-module-react";
// Quill.register("modules/imageResize", ImageResize);

// Quill.register('modules/imageResize', ImageResize);
// import QuillResize from 'quill-resize-module';

// Quill.register('modules/resize', QuillResize);
// Register additional fonts for Quill
try {
  const Font = Quill.import('formats/font');
  Font.whitelist = [
    'sans-serif',
    'serif',
    'monospace',
    'arial',
    'times',
    'georgia',
    'courier',
    'montserrat',
    'roboto',
  ];
  Quill.register(Font, true);
} catch (e) {
  // ignore if Quill not available during SSR
}
interface ReactQuillEditorProps {
  value: string | undefined;
  onChange: (content: any) => void;
}

const modules = {
  toolbar: {
    container: '#toolbar',
  },
  // imageResize: {
  //   modules: ["Resize", "DisplaySize"],
  //   handleStyles: {
  //     backgroundColor: 'black',
  //     border: 'none',
  //     color: 'white'
  //   },
  //   displayStyles: {
  //     backgroundColor: 'black',
  //     border: 'none',
  //     color: 'white'
  //   }
  // },
};

const formats = [
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'script',
  'header',
  'blockquote',
  'code-block',
  'indent',
  'list',
  'direction',
  'align',
  'link',
  'image',
  'bullet',
  'video',
  'formula',
  // 'width',
  // 'height',
  // 'style',
];

function ReactQuillEditor({ value, onChange }: ReactQuillEditorProps) {
  return (
    <>
      <CustomToolbar />
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        style={{ minHeight: 180 }}
      />
    </>
  );
}

export default ReactQuillEditor;
