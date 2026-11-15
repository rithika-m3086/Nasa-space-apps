import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="oc-error-boundary">
        <section className="oc-error-boundary__card" role="alert">
          <h1 className="oc-display">Mission Control had a hiccup.</h1>
          <p>Tap to restart.</p>
          <button className="oc-button oc-button--primary" type="button" onClick={() => window.location.reload()}>
            Restart
          </button>
        </section>
      </main>
    );
  }
}
