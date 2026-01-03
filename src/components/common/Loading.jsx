import './Loading.css'

function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div className="loading-spinner__circle"></div>
      <div className="loading-spinner__message">{message}</div>
    </div>
  )
}

export default Loading

