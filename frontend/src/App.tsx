import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import HowItWorksPage from './pages/HowItWorksPage'
import TechnicalPage from './pages/TechnicalPage'
import SpeechAnalysisPage from './pages/SpeechAnalysisPage'
import FeatureExtractionPage from './pages/FeatureExtractionPage'
import CognitiveScoringPage from './pages/CognitiveScoringPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/technical" element={<TechnicalPage />} />
            <Route path="/speech-analysis" element={<SpeechAnalysisPage />} />
            <Route path="/feature-extraction" element={<FeatureExtractionPage />} />
            <Route path="/cognitive-scoring" element={<CognitiveScoringPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
