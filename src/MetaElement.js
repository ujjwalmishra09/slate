import React from 'react';
import { ReactEditor, useEditor } from 'slate-react'
import { Editor } from 'slate'

const Meta = ({ attributes, children, element }) => {
  const handleClick = (e) => {
    e.preventDefault()
  }
  const editor = useEditor()
  return (
    <div {...attributes} >
      <div contentEditable={false} onClick={handleClick}>
        <form>
        <input
          onKeyDown={e => e.preventDefault()}
          onClick={e => e.preventDefault()}
          type="text"
          placeholder="Cook Time"
          value={element.cooktime}
          onChange={event => {
          const path = ReactEditor.findPath(editor, element)
            Editor.setNodes(
              editor,
              { cooktime:  event.target.value },
              { at: path }
            )
          }}
        />
        <input
          type="text"
          placeholder="Serves"
          onKeyDown={e => e.preventDefault()}
          onClick={e => e.preventDefault()}
          value={element.serves}
          onChange={event => {
            const path = ReactEditor.findPath(editor, element)
            Editor.setNodes(
              editor,
              { serves:  event.target.value },
              { at: path }
            )
          }}
        />
        </form>
      </div>
      {children}
    </div>
  )
}

export default Meta
