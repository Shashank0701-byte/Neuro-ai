import Header from './components/Header'
import Hero from './components/Hero'
import ProblemGoal from './components/ProblemGoal'
import About from './components/About'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import TechnicalPipeline from './components/TechnicalPipeline'
import SpeechToText from './components/SpeechToText'
import CTA from './components/CTA'
import Footer from './components/Footer'
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main>
        <Hero />
        <ProblemGoal />
        <About />
        <Features />
        <HowItWorks />
        <TechnicalPipeline />
        <SpeechToText />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
