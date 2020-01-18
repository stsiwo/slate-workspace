import * as React from 'react'
import { Element, Text, Transforms, Editor, Path } from "../fork/slate";
import { ReactEditor, RenderElementProps } from '../fork/slate-react';
import { FloatProperty } from 'csstype';
import cloneDeep from 'lodash/cloneDeep'
import { ToolBarBtnType } from './types';

declare type ImagePluginEditor = {
  insertImage: () => void
  searchImage: () => void
} & ReactEditor

declare type ImageRenderElementProps = RenderElementProps & {
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
          "data-img-id": 3,
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
      const textOfCurrentElement = Editor.getTextOfCurrentElement(editor) 

      /**
       * do nothing if node at the current direction has text
       **/
      if (!textOfCurrentElement) {
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

export const ImageToolBarBtn: React.FunctionComponent<ToolBarBtnType> = (props) => {
  /**
   * hide image tool bar if current element has non-empty text
   *  - if visible, sometime cause error
   *  - also double validation: even if this toolbar is visible and user try to insert image in the node which has text
   *    it can't do it because of insertImage(). it also check if it has text or not
   *  - or use IsActive function and make this toolbar button disable (proposal)
   **/
  return ( props.editor.selection && !Editor.getTextOfCurrentElement(props.editor).text &&
    <button
      className="small-icon-wrapper"
      onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
        console.log("you clicked insert iamge btn")
        event.preventDefault()
        // #REFACTOR
        // if user try to image before focus editor, not allow to do that.
        // make user to focus first
        if (props.editor.selection) {
          props.editor.insertImage()
        }
      }}
    >
      Insert Image Btn
    </button>
  )
}

