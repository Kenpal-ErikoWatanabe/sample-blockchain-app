const navItems = [
  { label: 'マーケット', href: '#market' },
  { label: '交換', href: '#exchange' },
  { label: 'ブロックチェーン', href: '#blockchain' },
  { label: 'ウォレット', href: '#wallet' },
] as const

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/45 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-white sm:text-xl"
        >
          BlockChains
        </a>

        <nav
          className="hidden items-center gap-6 md:flex md:gap-8 lg:gap-10"
          aria-label="メイン"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="shrink-0 rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          ログイン
        </button>
      </div>
    </header>
  )
}
