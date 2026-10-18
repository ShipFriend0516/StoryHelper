export function createEditor(text = '본문글') {
  const iframe = document.createElement('iframe');
  iframe.id = 'editor-tistory_ifr';
  document.body.appendChild(iframe);

  const editorDocument = iframe.contentDocument;
  editorDocument.body.innerHTML = '<div id="tinymce"></div>';
  const editor = editorDocument.getElementById('tinymce');
  // jsdom does not implement innerText; provide the text exposed by the browser.
  Object.defineProperty(editor, 'innerText', { value: text, configurable: true });
  return editor;
}
