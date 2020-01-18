import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Import the Slate editor factory.
import { createEditor, Node, Editor, Transforms } from 'slate-fork'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, RenderElementProps } from 'slate-react-fork'
import { withImages, ImageToolBarBtn, ImageElement, ImageSearchToolBarBtn } from './ImagePlugins';
import { withHistory } from 'slate-history-fork'
import { LinkElement, LinkToolBarBtn, withLinks } from './LinkPlugins';

const App = (props: any) => {
  // Create a Slate editor object that won't change across renders.
  const editor = React.useMemo(() => withImages(withLinks(withReact(withHistory(createEditor())))), [])

  console.log("current editor")
  console.log(editor)

  console.log("current selection: ")
  console.log(editor.selection)
  // Keep track of state for the value of the editor.
  const [value, setValue] = React.useState<Node[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ])

  const DefaultElement: React.FunctionComponent<RenderElementProps> = props => {
    return <p {...props.attributes}>{props.children}</p>
  }
  const renderElement = React.useCallback(props => {
    switch (props.element.type) {
      case 'image':
        return <ImageElement {...props} />
      case 'link':
        return <LinkElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const editorStyle = {
    width: "500px",
    border: "solid 1px black"
  }

  return (
    <div>
      <h1>Welcome to React w/ TypeScript Template</h1>
      <Slate editor={editor} value={value} onChange={value => setValue(value)} >
        <ImageToolBarBtn editor={editor} />
        <ImageSearchToolBarBtn editor={editor} />
        <LinkToolBarBtn editor={editor} />
        <Editable
          style={editorStyle}
          renderElement={renderElement}
          placeholder="enter your blog content here ..."
          onKeyDown={event => {
          if (!event.ctrlKey) {
            return
          }

          switch (event.key) {
            // undo 
            case 'z': {
              event.preventDefault()
              console.log("let's undo")
              editor.undo()
              break
            }

            // redo
            case 'y': {
              event.preventDefault()
              console.log("let's undo")
              editor.redo()
              break
            }
          }}
          }
        />
      </Slate>
    </div>
  );
};

ReactDOM.render(
  <App />
  , document.getElementById('root')
)
