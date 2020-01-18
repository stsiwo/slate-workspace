import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Import the Slate editor factory.
import { createEditor, Node, Editor, Transforms } from 'slate-fork'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, RenderElementProps } from 'slate-react-fork'
import { withImages, ImageToolBarBtn, ImageElement, ImageSearchToolBarBtn } from './ImagePlugins';
import { withHistory } from 'slate-history-fork'
import { LinkElement, LinkToolBarBtn, withLinks } from './LinkPlugins';
import { BlockButton, MarkButton, HOTKEYS, LIST_TYPES, toggleMark, NumberedListElement, ListItemElement, HeadingTwoElement, HeadingOneElement, BulletedListElement, BlockQuoteElement, Leaf } from './RichText';
import isHotkey from 'is-hotkey'
import { withEmbeds, EmbedsElement, EmbedsToolBarBtn } from './EmbedPlugins';

const App = (props: any) => {
  // Create a Slate editor object that won't change across renders.
  const editor = React.useMemo(() => withEmbeds(withImages(withLinks(withReact(withHistory(createEditor()))))), [])

  console.log("current editor")
  console.log(editor)

  console.log("current selection: ")
  console.log(editor.selection)
  // Keep track of state for the value of the editor.
  const [value, setValue] = React.useState<Node[]>([
    {
      type: 'paragraph',
      children: [{ text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum" }],
    },
  ])
  const renderElement = React.useCallback(props => {
    switch (props.element.type) {
      case 'image':
        return <ImageElement {...props} />
      case 'video':
        return <EmbedsElement {...props} />
      case 'link':
        return <LinkElement {...props} />
      case 'block-quote':
        return <BlockQuoteElement {...props} />
      case 'bulleted-list':
        return <BulletedListElement {...props} />
      case 'heading-one':
        return <HeadingOneElement {...props} />
      case 'heading-two':
        return <HeadingTwoElement {...props} />
      case 'list-item':
        return <ListItemElement {...props} />
      case 'numbered-list':
        return <NumberedListElement {...props} />
      default:
        return <p {...props.attributes}>{props.children}</p>
    }
  }, [])

  const renderLeaf = React.useCallback(props => <Leaf {...props} />, []) 

  const editorStyle = {
    width: "500px",
    border: "solid 1px black"
  }

  return (
    <div>
      <h1>Welcome to React w/ TypeScript Template</h1>
      <Slate editor={editor} value={value} onChange={value => setValue(value)} >
        <ImageToolBarBtn editor={editor} />
        <EmbedsToolBarBtn editor={editor} />
        <ImageSearchToolBarBtn editor={editor} />
        <LinkToolBarBtn editor={editor} />
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="heading-one" icon="looks_one" />
        <BlockButton format="heading-two" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        <Editable
          style={editorStyle}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="enter your blog content here ..."
          spellCheck
          autoFocus
          onKeyDown={(event: React.KeyboardEvent) => {
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
            }
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event as unknown as KeyboardEvent)) {
                event.preventDefault()
                const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS]
                console.log("mark at onKeyDown of toolbar")
                console.log(mark)
                toggleMark(editor, mark)
              }
            }
          }
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
