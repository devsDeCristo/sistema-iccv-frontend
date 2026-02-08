import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CustomToolbar from './customToolbar';
import Quill from 'quill';

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
  'video',
  'formula',
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
