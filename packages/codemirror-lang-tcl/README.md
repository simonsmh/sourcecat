# CodeMirror Tcl Language Support

## Usage

```typescript
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tcl } from 'codemirror-lang-tcl';
import { basicSetup } from 'codemirror';

new EditorView({
  state: EditorState.create({
    doc: `proc greet {name} {
    puts "Hello, $name!"
}
greet "World"`,
    extensions: [basicSetup, tcl()],
  }),
  parent: document.querySelector('#editor'),
});
```






