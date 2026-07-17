// TopBar — product identity and global controls.

import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

function TopBar({ theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-5">
        <Logo className="h-[1.375rem] w-[1.375rem] text-accent" />

        <div className="flex items-baseline gap-2.5">
          <span className="text-[0.9375rem] font-semibold tracking-tight text-ink">
            FreightParse
          </span>
          <span className="label-micro hidden md:inline">
            Freight document extraction
          </span>
        </div>

        <div className="flex-1" />

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}

export default TopBar
