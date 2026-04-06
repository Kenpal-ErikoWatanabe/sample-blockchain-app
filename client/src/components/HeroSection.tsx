export function HeroSection() {
  return (
    <main className="relative flex flex-1 flex-col bg-linear-to-b from-slate-900 via-indigo-950 to-[#2d1b4e]">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-12 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-8 lg:py-16">
        <section className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Crypt Card
          </h1>
          <button
            type="button"
            className="mt-8 rounded-xl bg-sky-400 px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-sky-500/25 transition hover:bg-sky-300"
          >
            ウォレット連携
          </button>
        </section>

        <section
          className="w-full max-w-md"
          aria-labelledby="send-card-heading"
        >
          <h2 id="send-card-heading" className="sr-only">
            送金フォーム
          </h2>
          <div className="rounded-2xl border border-white/15 bg-purple-950/35 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-white/80">
                  アドレス
                </span>
                <input
                  type="text"
                  name="address"
                  placeholder="0x..."
                  autoComplete="off"
                  className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-white placeholder:text-white/35 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-white/80">
                  通貨(ETH)
                </span>
                <input
                  type="text"
                  name="amount"
                  inputMode="decimal"
                  placeholder="0.0"
                  className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-white placeholder:text-white/35 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                />
              </label>
              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
              >
                送信
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
