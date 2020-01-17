import * as React from 'react'
import { Element, Text, Transforms, Editor } from "slate-fork";
import { ReactEditor, RenderElementProps } from 'slate-react-fork';

export declare type ImagePluginEditor = {
  InsertImage: () => void
} & ReactEditor

export declare type ImageRenderElementProps = RenderElementProps & {
  src: string
  publicSrc: URL
  imageFile?: Blob // extract this when saving. need to remove.
  style?: string
}

export const withImages = (editor: ReactEditor) => {
  const { isVoid } = editor

  editor.isVoid = (element: Element) => {
    return element.type === 'image' ? true : isVoid(element)
  }

  // custom command
  // maybe should this be read only so other plugins can override this property
  editor.insertImage = () => {
    console.log("current location when insertImage is called")
    console.log(editor.selection)

    const tempInput = document.createElement('input')
    tempInput.type = 'file'
    tempInput.onchange = (e) => {
      let tempFile: File = (e.target as HTMLInputElement).files[0]
      //tempFile = generateFileWithUuidv4(tempFile)
      const imgSrc: string = window.URL.createObjectURL(tempFile);
      const text: Text = { text: '' }
      const image = {
        type: 'image',
        src: imgSrc,
        children: [text],
        attributes: {
          onLoad: (e: React.SyntheticEvent) => {
            window.URL.revokeObjectURL(imgSrc)
          },
          style: {
            width: "100%"
          }
        }
      }
      const nextDefaultElement: Element = {
        type: 'paragraph',
        children: [text]
      }

      console.log("leaf")
      const textOfCurrentElement = Editor.leaf(editor, editor.selection)[0].text

      if (textOfCurrentElement) {
        console.log("text is not empty")
        const currentOffset = editor.selection.anchor.offset
        if (currentOffset === 0) {
          console.log("offset is 0")
          Transforms.insertNodes(editor, image, { at: editor.selection })
        }
        else {
          console.log("offset is not 0")
          Transforms.insertNodes(editor, image, { at: editor.selection })
          Transforms.insertNodes(editor, nextDefaultElement, { at: Editor.after(editor, editor.selection) })
        }
      }
      else {
        console.log('text is empty')
        Transforms.setNodes(editor, image, { at: editor.selection })
        Transforms.insertNodes(editor, nextDefaultElement, { at: Editor.after(editor, editor.selection) })
      }
    }
    tempInput.click();
  }
  return editor as ImagePluginEditor
}

/**
 * react-editor.ts:426 Uncaught Error: Cannot resolve a Slate point from DOM point: [object HTMLElement],0
 * - slate state value structure must match with dom element structure
 * - ex)
 * - 
      <figure className="editable-figure" >
        <img src={props.element.src} {...props.element.attributes}  />
        <figcaption>test caption</figcaption>
      </figure>
   - this give you above error. this is because slate state does not match with dom structure
     - <figure> dom element is skipped 
     - you must create slate Node for <figure> 
     - then, do like below
     ex) 
      <figure {props.element.attribute} className="editable-figure" >
        <img src={props.element.children[0].src} {...props.element.children[0].attributes} />
        <figcaption {props.element.children[1].attribute}>test caption</figcaption>
      </figure>
     - node would be:
       Element (figure) {
        type: ...,
        children: [
          Element (img): {
            ...
          },
          Text (figcaption): {
            ...
          }
        ],
       }
 **/

export const ImageElement: React.FunctionComponent<ImageRenderElementProps> = props => {
  return (
    <img src={props.element.src} {...props.element.attributes} />
  )
}

export declare type ToolBarBtnType = {
  editor?: ReactEditor
}

export const ImageToolBarBtn: React.FunctionComponent<ToolBarBtnType> = (props) => {
  return (
    <button
      className="small-icon-wrapper"
      onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
        console.log("you clicked insert iamge btn")
        event.preventDefault()
        props.editor.insertImage()
      }}
    >
      Insert Image Btn
    </button>
  )
}
