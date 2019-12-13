import React from 'react';

const Meta = ({ attributes, children, element }) => {
  const handleClick = (e) => {
    e.preventDefault()
  }
  return (
   <div contentEditable={false} onClick={handleClick}>
     abcd
   </div>
  )
}

export default Meta
