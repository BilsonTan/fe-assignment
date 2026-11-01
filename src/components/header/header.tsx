import React from 'react'
import { ThemeToggle } from './theme-toggle'
import { SegmentSwitch } from './segment-switch'
import './header.css'

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <div className="header-brand">
            <span className="header-logo-icon" aria-hidden="true">
              M
            </span>
            <span>Meridian</span>
          </div>

          <nav className="header-nav" aria-label="Main navigation">
            <a href="#overview" className="nav-link active" aria-current="page">
              Overview
            </a>
            <span className="nav-link disabled" aria-disabled="true">
              Cards
            </span>
            <span className="nav-link disabled" aria-disabled="true">
              Payments
            </span>
            <span className="nav-link disabled" aria-disabled="true">
              Insights
            </span>
          </nav>
        </div>

        <div className="header-right">
          <div className="header-segment-wrapper">
            <SegmentSwitch />
          </div>
          <ThemeToggle />
          <div
            className="header-avatar"
            role="img"
            aria-label="Ava Chen avatar"
            title="Ava Chen"
          >
            AC
          </div>
        </div>
      </div>
    </header>
  )
}

