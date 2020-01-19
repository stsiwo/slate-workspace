import * as React from 'react'
import { Element, Text, Transforms, Editor, Range } from "../fork/slate";
import { ReactEditor, RenderElementProps, useSlate } from '../fork/slate-react';
import { FloatProperty } from 'csstype';
import cloneDeep from 'lodash/cloneDeep'
import isUrl from 'is-url'
import { ToolBarBtnType } from './types';
import { FaLink } from 'react-icons/fa';

export const withLinks = (editor: ReactEditor) => {
  const { insertData, insertText, isInline } = editor

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element)
  }

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertText(text)
    }
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')

    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

export const LinkElement: React.FunctionComponent<RenderElementProps> = props => {
  return (
    <a {...props.attributes} href={props.element.url}>
      {props.children}
    </a>
  )
}

const insertLink = (editor: ReactEditor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url)
  }
}

const isLinkActive = (editor: ReactEditor) => {
  const [link] = Editor.nodes(editor, { match: n => n.type === 'link' })
  return !!link
}

const unwrapLink = (editor: ReactEditor) => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'link' })
}

const wrapLink = (editor: ReactEditor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor)
  }

  const { selection } = editor
  // collapsed means anchor and focus have the exact same (same Point) (no selection)
  const isCollapsed = selection && Range.isCollapsed(selection)
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, link)
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

export const LinkToolBarBtn: React.FunctionComponent<ToolBarBtnType> = (props) => {
  const editor = useSlate()
  const style = {
    fontSize: "20px",
    ...(!isLinkActive(editor) &&  { opacity: 0.3 }),
  }
  return (
    <span
      style={style}
      onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
        console.log("you clicked insert iamge btn")
        event.preventDefault()
        const url = window.prompt('Enter the URL of the link:')
        if (!url) return
        insertLink(editor, url)
      }}
    >
      <FaLink />
    </span>
  )
}
