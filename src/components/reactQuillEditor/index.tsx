import { Box } from '@mui/material';
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

/**
 * A altura mínima vai na área editável, e não na raiz do Quill.
 *
 * O container do Quill é `height: 100%`, que contra um pai que só tem
 * `min-height` vira altura automática: o texto ocupava umas quatro linhas e a
 * raiz continuava esticada em 180px, deixando um vão vazio embaixo da caixa —
 * que na tela parecia margem sobrando antes do bloco seguinte. Na área editável,
 * a caixa inteira cresce, e o clique no espaço vazio cai dentro do editor.
 */
const alturaDoEditor = { '& .ql-editor': { minHeight: 180 } };

function ReactQuillEditor({ value, onChange }: ReactQuillEditorProps) {
  return (
    <Box sx={alturaDoEditor}>
      <CustomToolbar />
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
      />
    </Box>
  );
}

export default ReactQuillEditor;
