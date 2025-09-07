import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error){ return { hasError: true, error } }
  componentDidCatch(error, info){ console.error('App error:', error, info) }
  render(){
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
            <h2 style={{ color: '#b91c1c', marginBottom: 8 }}>Something went wrong</h2>
            <pre style={{ whiteSpace:'pre-wrap' }}>{String(this.state.error)}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
