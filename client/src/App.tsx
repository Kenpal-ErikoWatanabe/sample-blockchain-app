import { HeroSection } from './components/HeroSection'
import { Navbar } from './components/Navbar'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <Navbar />
      <HeroSection />
    </div>
  )
}

export default App