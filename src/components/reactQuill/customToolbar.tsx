import formats from './toolbarOptions';
// import formats from './ToolbarOptions.js';
interface FormatDataProps {
  className: string;
  value?: string;
  options?: string[];
}
const renderOptions = (formatData: FormatDataProps) => {
  const { className, options } = formatData;
  return (
    <select className={className}>
      <option selected={true}></option>
      {options?.map((value) => {
        return <option value={value}></option>;
      })}
    </select>
  );
};
const renderSingle = (formatData: FormatDataProps) => {
  const { className, value } = formatData;
  return <button className={className} value={value}></button>;
};
const CustomToolbar = () => (
  <div id="toolbar">
    {formats.map((classes: FormatDataProps[]) => {
      return (
        <span className="ql-formats">
          {classes.map((formatData) => {
            return formatData.options
              ? renderOptions(formatData)
              : renderSingle(formatData);
          })}
        </span>
      );
    })}
  </div>
);
export default CustomToolbar;
