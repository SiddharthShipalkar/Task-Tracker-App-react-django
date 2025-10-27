import React from 'react'
import Button from './Button'

const Main = () => {
  return (
    <section className="d-flex align-items-center justify-content-center text-center bg-light" style={{ minHeight: '85vh' }}>
      <div className="bg-white p-5 shadow-sm rounded-4">
        <h1 className="fw-bold mb-3">Tracker App</h1>
        <p className="lead text-muted mb-4">
          Your centralized workspace for project tracking, team coordination, and performance insights.
        </p>
        <Button text="Explore Now" class="btn-outline-info" url="/dashboard" />
      </div>
    </section>
  )
}

export default Main
