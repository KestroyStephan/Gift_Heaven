import React from 'react'
import { Link } from 'react-router-dom'

// If one page crashes, show a friendly message instead of a blank screen
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { failed: false }
    }
    static getDerivedStateFromError() { return { failed: true } }
    componentDidCatch(error, info) { console.error('Page error:', error, info?.componentStack) }
    componentDidUpdate(prev) { if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false }) }

    render() {
        if (!this.state.failed) return this.props.children
        return (
            <div className='py-24 text-center flex flex-col items-center gap-4'>
                <p className='font-display text-4xl font-semibold'>Something went wrong</p>
                <p className='text-mauve max-w-md'>Sorry — this page hit a problem. Please refresh, or head back and try again.</p>
                <div className='flex gap-3 mt-2'>
                    <button onClick={() => window.location.reload()} className='btn-primary'>Refresh</button>
                    <Link to='/' className='btn-outline'>Back to home</Link>
                </div>
            </div>
        )
    }
}

export default ErrorBoundary
