import * as React from 'react'
import { ImageToolBarBtn } from '../ImagePlugins'
import { EmbedsToolBarBtn } from '../EmbedPlugins'
import { LinkToolBarBtn } from '../LinkPlugins'
import { RichTextToolBar } from '../RichText'
import { PositionProperty, FlexDirectionProperty } from 'csstype';

export const ToolBar: React.FunctionComponent<{}> = (props) => {

  const style = {
    position: "sticky" as PositionProperty,
    top: 0,
    alignSelf: "flex-start",
    display: "flex",
    flexDirection: "column" as FlexDirectionProperty,
    padding: "20px"
  }
  return (
    <div style={style}>
      <ImageToolBarBtn />{' '}
      <EmbedsToolBarBtn />{' '}
      <LinkToolBarBtn />{' '}
      <RichTextToolBar />
    </div>
  )
}
