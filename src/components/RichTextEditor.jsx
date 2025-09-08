import { useEffect, useRef } from 'react';

export default function RichTextEditor({ value, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const exec = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg);
    if (ref.current) {
      ref.current.focus();
      onChange(ref.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL');
    if (url) exec('createLink', url);
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        exec('insertImage', e.target.result);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <div className="border rounded w-full">
      <div className="flex gap-1 border-b p-1">
        <button type="button" onClick={() => exec('bold')} className="btn-outline px-2">B</button>
        <button type="button" onClick={() => exec('italic')} className="btn-outline px-2">I</button>
        <button type="button" onClick={() => exec('underline')} className="btn-outline px-2">U</button>
        <button type="button" onClick={insertLink} className="btn-outline px-2">Link</button>
        <button type="button" onClick={addImage} className="btn-outline px-2">Img</button>
      </div>
      <div
        ref={ref}
        className="px-3 py-2 h-48 overflow-auto focus:outline-none"
        contentEditable
        onInput={handleInput}
      />
    </div>
  );
}

