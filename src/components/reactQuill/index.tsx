import { memo } from 'react';
import ReactQuill from 'react-quill';
import Quill from 'quill';
import 'react-quill/dist/quill.snow.css';
// import ImageResize from "quill-image-resize-module-react";
// Quill.register("modules/imageResize", ImageResize);

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
interface ReactQuillProps {
  value: string;
  // onChange: (content: string) => void;
}

// viewer não precisa de toolbar custom; desabilitamos o toolbar para evitar erro
const modules = {
  toolbar: false,
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
  'video',
  'formula',
  // 'width',
  // 'height',
  // 'style',
];

/**
 * `memo` não é otimização aqui, é correção.
 *
 * O `react-quill` é um editor: a cada renderização ele compara o `value`
 * recebido com o HTML que ele mesmo gera e, se forem diferentes, apaga e
 * reescreve o conteúdo inteiro. Texto salvo quase nunca é idêntico, byte a
 * byte, ao HTML do Quill — então qualquer mudança de estado na tela em volta
 * reescrevia o texto. No Safari do iPhone, que não preserva a posição da
 * rolagem quando o conteúdo é refeito, isso jogava a leitura de volta para o
 * topo: no termo da inscrição, o aceite libera perto do fim, a tela
 * re-renderiza e o texto "pisca e sobe" sem deixar chegar ao final.
 *
 * Com `memo`, o visualizador só redesenha quando o texto muda de verdade.
 */
const ReactQuillViewer = memo(function ReactQuillViewer({
  value,
}: ReactQuillProps) {
  return (
    <>
      <ReactQuill
        theme="snow"
        value={value}
        readOnly={true}
        modules={modules}
        formats={formats}
        className="viewer-rquil"
        style={{
          minHeight: 180,
        }}
      />
    </>
  );
});

export default ReactQuillViewer;
