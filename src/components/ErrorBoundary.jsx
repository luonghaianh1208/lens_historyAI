import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--clr-paper)' }}>
          <div className="card-ancient p-8 text-center max-w-md w-full">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
              Có lỗi xảy ra
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
              {this.state.error?.message || 'Ứng dụng gặp sự cố không mong muốn.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button type="button" onClick={this.handleReset} className="btn-primary">
                Về trang chủ
              </button>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-ghost"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
