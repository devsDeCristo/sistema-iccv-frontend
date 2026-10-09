import { Box, Theme } from '@mui/material';
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
  /** borda vermelha, como a de um TextField com erro */
  error?: boolean;
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

/**
 * O editor com a cara dos outros campos do sistema (o `MuiOutlinedInput` do
 * tema): fundo `background.input`, borda `divider`, `border` no hover e a cor
 * primária no foco, raio de 8px. O tema "snow" do Quill traz borda cinza
 * clara e ícones pretos, que no tema escuro ficavam quase invisíveis.
 */
const visualDoCampo = (error?: boolean) => (theme: Theme) => {
  const icone = theme.palette.text.secondary;
  const ativo = theme.palette.primary.main;

  return {
    ...alturaDoEditor,
    borderRadius: '8px',
    border: '1px solid',
    borderColor: error ? theme.palette.error.main : theme.palette.divider,
    backgroundColor: theme.palette.background.input,
    overflow: 'hidden',
    transition: 'border-color .15s',
    '&:hover': {
      borderColor: error ? theme.palette.error.main : theme.palette.border,
    },
    '&:focus-within': {
      borderColor: error ? theme.palette.error.main : ativo,
    },

    '& .ql-toolbar.ql-snow, & .ql-container.ql-snow': { border: 'none' },
    '& .ql-toolbar.ql-snow': {
      borderBottom: `1px solid ${theme.palette.divider}`,
      padding: '6px 8px',
    },
    '& .ql-container': {
      fontFamily: theme.typography.fontFamily,
      fontSize: '0.9375rem',
      color: theme.palette.text.primary,
    },
    '& .ql-editor.ql-blank::before': {
      color: theme.palette.text.disabled,
      fontStyle: 'normal',
    },

    // ícones e seletores da barra: discretos parados, primária ao usar
    '& .ql-snow .ql-stroke': { stroke: icone },
    '& .ql-snow .ql-fill, & .ql-snow .ql-stroke.ql-fill': { fill: icone },
    '& .ql-snow .ql-picker': { color: icone },
    '& .ql-snow button:hover .ql-stroke, & .ql-snow button.ql-active .ql-stroke, & .ql-snow .ql-picker-label:hover .ql-stroke, & .ql-snow .ql-picker-label.ql-active .ql-stroke':
      { stroke: ativo },
    '& .ql-snow button:hover .ql-fill, & .ql-snow button.ql-active .ql-fill': {
      fill: ativo,
    },
    '& .ql-snow .ql-picker-label:hover, & .ql-snow .ql-picker-label.ql-active, & .ql-snow .ql-picker-item:hover, & .ql-snow .ql-picker-item.ql-selected':
      { color: ativo },
    '& .ql-snow .ql-picker-options': {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: '8px',
    },
    '& .ql-snow .ql-tooltip': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
    },
  };
};

function ReactQuillEditor({ value, onChange, error }: ReactQuillEditorProps) {
  return (
    <Box sx={visualDoCampo(error)}>
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
