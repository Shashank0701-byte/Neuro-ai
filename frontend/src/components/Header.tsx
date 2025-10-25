import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, Menu, X } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">NeuroAid</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">Home</Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">How It Works</Link>
            <Link to="/technical" className="text-gray-600 hover:text-primary-600 transition-colors">Technology</Link>
            <Link to="/speech-analysis" className="text-gray-600 hover:text-primary-600 transition-colors">Speech Analysis</Link>
            <Link to="/feature-extraction" className="text-gray-600 hover:text-primary-600 transition-colors">Features</Link>
            <Link to="/cognitive-scoring" className="text-gray-600 hover:text-primary-600 transition-colors">Assessment</Link>
            <Link to="/explainability" className="text-gray-600 hover:text-primary-600 transition-colors">Explainability</Link>
            <button className="btn-primary">Get Started</button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>How It Works</Link>
              <Link to="/technical" className="text-gray-600 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Technology</Link>
              <Link to="/speech-analysis" className="text-gray-600 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Speech Analysis</Link>
              <Link to="/feature-extraction" className="text-gray-600 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Features</Link>
              <Link to="/cognitive-scoring" className="text-gray-600 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Assessment</Link>
              <Link to="/explainability" className="text-gray-600 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Explainability</Link>
              <button className="btn-primary w-full">Get Started</button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
