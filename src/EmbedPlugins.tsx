import * as React from 'react'
import { Element, Text, Transforms, Editor } from "../fork/slate";
import { ReactEditor, RenderElementProps, useEditor, useSelected, useFocused, useSlate } from '../fork/slate-react';
import { FloatProperty, PointerEventsProperty } from 'csstype';
import cloneDeep from 'lodash/cloneDeep'
import { ToolBarBtnType } from './types';
import { FaCode } from 'react-icons/fa';


declare type EmbedRenderElementProps = RenderElementProps & {
  url: URL
}

export const withEmbeds = (editor: ReactEditor) => {
  const { isVoid } = editor
  editor.isVoid = element => (element.type === 'video' ? true : isVoid(element))

  editor.insertEmbeds = (url: string) => {
    console.log("insertEmbeds is called")
    const text: Text = { text: '' }
    const embeds = {
      type: 'video',
      url: url,
      children: [text]
    }
    const nextDefaultElement: Element = {
      type: 'paragraph',
      children: [text]
    }

    const currentOffset = editor.selection.anchor.offset
    if (currentOffset === 0) {
      console.log("offset is 0")
      Transforms.insertNodes(editor, embeds, { at: editor.selection })
    }
    else {
      console.log("offset is not 0")
      Transforms.insertNodes(editor, embeds, { at: editor.selection })
      Transforms.insertNodes(editor, nextDefaultElement, { at: Editor.after(editor, editor.selection) })
    }
  }
  return editor
}

export const EmbedsElement: React.FunctionComponent<RenderElementProps> = props => {
  const editor = useEditor()
  const selected = useSelected()
  const focused = useFocused()
  const { url } = props.element
  return (
    <div {...props.attributes}>
      <div
        contentEditable={false}
        style={{
          position: 'relative',
          boxShadow: selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
        }}
      >
        <div
          style={{
            display: selected && focused ? 'none' : 'block',
            position: 'absolute',
            top: '0',
            left: '0',
            height: '100%',
            width: '100%',
            cursor: 'cell',
            zIndex: 1,
          }}
        />
        <div
          style={{
            padding: '75% 0 0 0',
            position: 'relative',
          }}
        >
          <iframe
            src={`${url}?title=0&byline=0&portrait=0`}
            frameBorder="0"
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            }}
          />
        </div>
        {selected && focused ? (
          <input
            value={url}
            onClick={e => e.stopPropagation()}
            style={{
              marginTop: '5px',
              boxSizing: 'border-box',
            }}
            onChange={value => {
              const path = editor.findPath(props.element)
              Transforms.setNodes(editor, { url: value }, { at: path })
            }}
          />
        ) : null}
      </div>
      {props.children}
    </div>
  )
}

const isEmbedsDisable: (editor: Editor) => boolean = (editor) => {
  return editor.selection && !Editor.getTextOfCurrentElement(editor).text
}

export const EmbedsToolBarBtn: React.FunctionComponent<ToolBarBtnType> = (props) => {
  const editor = useSlate()
  const style = {
    fontSize: "20px",
    ...(!isEmbedsDisable(editor) &&  { pointerEvents: "none" as PointerEventsProperty}),
    ...(!isEmbedsDisable(editor) &&  { opacity: 0.3 }),
  }
  return (
    <span
      style={style}
      onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
        console.log("you clicked insert iamge btn")
        event.preventDefault()
        // #REFACTOR
        // if user try to image before focus editor, not allow to do that.
        // make user to focus first
        if (props.editor.selection) {
          const url = window.prompt('Enter the URL of the link:')
          if (!url) return
          editor.insertEmbeds(url)
        }
      }}
    >
      <FaCode />
    </span>
  )
}
