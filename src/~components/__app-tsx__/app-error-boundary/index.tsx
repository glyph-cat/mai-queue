import { Component as ReactComponent, ReactNode } from 'react'
import { FatalErrorFallbackUI } from '~components/fallback-ui/fatal-error'

export interface AppErrorBoundaryProps {
  children: ReactNode
}

export interface AppErrorBoundaryState {
  error: Error
}

export class AppErrorBoundary extends ReactComponent<AppErrorBoundaryProps, AppErrorBoundaryState> {

  state = {
    error: null,
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <FatalErrorFallbackUI
          title='An error occured'
          message='Please refresh or try again later'
          error={this.state.error}
        />
      )
    } else {
      return <>{this.props.children}</>
    }
  }

  componentDidCatch(error: Error): void {
    this.setState({ error })
  }

}
