import React, { useMemo, useState, useCallback } from 'react';
// Import the Slate editor factory.
import { createEditor, Editor, Range, Point } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import MetaElement from './MetaElement'
import CheckListItemElement from './CheckListItemElement'
import ReactJson from 'react-json-view'

const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}

// Define a React component to render leaves with bold text.
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underlined) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}


const withCustom = editor => {
  const { exec, isVoid } = editor

  editor.exec = command => {
    const { selection } = editor
    // Define a command to toggle the bold  formatting.
    if (command.type === 'toggle_bold_mark') {
      const isActive = CustomEditor.isBoldMarkActive(editor)
      Editor.setNodes(
        editor,
        { bold: isActive ? null : true },
        { match: 'text', split: true }
      )
    }

    // Define a command to toggle the bold  formatting.
    else if (command.type === 'toggle_italic_mark') {
      const isActive = CustomEditor.isItalicMarkActive(editor)
      Editor.setNodes(
        editor,
        { italic: isActive ? null : true },
        { match: 'text', split: true }
      )
    }

    else if (command.type === 'toggle_underline_mark') {
      const isActive = CustomEditor.isUnderlineMarkActive(editor)
      Editor.setNodes(
        editor,
        { underlined: isActive ? null : true },
        { match: 'text', split: true }
      )
    }


    // Define a command to toggle the code block formatting.
    else if (command.type === 'toggle_code_block') {
      const isActive = CustomEditor.isCodeBlockActive(editor)
      Editor.setNodes(
        editor,
        { type: isActive ? null : 'code' },
        { match: 'block' }
      )
    }

    else if (command.type === 'toggle_checklist_block') {
      Editor.insertNodes(
        editor,
        {
          type: 'check-list-item',
          checked: false,
          children: [{ text: 'abcd' }]
        }
      )
    }


    else if (command.type === 'toggle_meta_block') {
      const meta = {
        type: 'meta-block',
        cooktime: 3,
        serves: 4,
        children: [{ text: '' }]
      }
      Editor.insertNodes(editor, meta)
    }

    else if (
      command.type === 'delete_backward' &&
      selection &&
      Range.isCollapsed(selection)
    ) {
      const [match] = Editor.nodes(editor, {
        match: { type: 'check-list-item' },
      })

      if (match) {
        const [, path] = match
        const start = Editor.start(editor, path)
        if (Point.equals(selection.anchor, start)) {
          Editor.setNodes(
            editor,
            { type: 'paragraph' },
            { match: { type: 'check-list-item' } }
          )
          return
        } else {
          exec(command)
        }
      } else {
        exec(command)
      }
    }

    // Otherwise, fall back to the built-in `exec` logic for everything else.
    else {
      exec(command)
    }
  }

  editor.isVoid = element => {
    return element.type === 'meta-block' ? true : isVoid(element)
  }

  return editor
}

// Define our own custom set of helpers for active-checking queries.
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: { bold: true },
      mode: 'all',
    })

    return !!match
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: { type: 'code' },
      mode: 'highest',
    })

    return !!match
  },

  isMetaBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: { type: 'meta-block' },
      mode: 'all',
    })

    return !!match
  },

  isItalicMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: { italic: true },
      mode: 'all'
    })

    return !!match
  },

  isUnderlineMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: { underlined: true },
      mode: 'all'
    })

    return !!match
  }
}

const App = () => {
  const editor = useMemo(
    () => withCustom(withHistory(withReact(createEditor()))),
    []
  )
  const [selection, setSelection] = useState(null)
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ])

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      case 'meta-block':
        return <MetaElement {...props} />
      case 'check-list-item':
        return <CheckListItemElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])

  return (
    <>
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(value, selection) => {
        setValue(value)
        setSelection(selection)
      }}
    >
      <div>
        <button
          onMouseDown={event => {
            event.preventDefault()
            editor.exec({ type: 'toggle_bold_mark' })
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={event => {
            event.preventDefault()
            editor.exec({ type: 'toggle_code_block' })
          }}
        >
          Code Block
        </button>
        <button
          onMouseDown={event => {
            event.preventDefault()
            editor.exec({ type: 'toggle_italic_mark' })
          }}
        >
          Italic
        </button>
        <button
          onMouseDown={event => {
            event.preventDefault()
            editor.exec({ type: 'toggle_underline_mark' })
          }}
        >
          underline
        </button>
        <button
          onMouseDown={event => {
            event.preventDefault()
            editor.exec({ type: 'toggle_checklist_block' })
          }}
        >
          check list
        </button>
        <button
          onMouseDown={event => {
            event.preventDefault()
            editor.exec({ type: 'toggle_meta_block' })
          }}
        >
          Meta Block
        </button>
      </div>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={event => {
          if (!event.ctrlKey) {
            return
          }
          switch (event.key) {
            case '`': {
              event.preventDefault()
              editor.exec({ type: 'toggle_code_block' })
              break
            }

            case 'b': {
              event.preventDefault()
              editor.exec({ type: 'toggle_bold_mark' })
              break
            }
            default:
          }
        }}
      />
    </Slate>
    <br />
    <br />
    <br />
    <br />
    <ReactJson src={value} collapsed={true}/>
    </>
  )
}

export default App;
