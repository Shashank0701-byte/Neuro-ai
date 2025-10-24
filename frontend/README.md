# NeuroAid Frontend

A modern React application for NeuroAid, an AI-based cognitive decline screening tool that emphasizes non-invasive, accessible health assessment using speech and text patterns.

## Features

- **Modern UI/UX**: Built with React, Vite, and Tailwind CSS
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with proper semantic HTML
- **Performance**: Fast loading with Vite's optimized build process
- **Component-based**: Modular architecture for easy maintenance

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Lucide React** - Beautiful SVG icons

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── Hero.tsx        # Hero section
│   ├── Features.tsx    # Features showcase
│   ├── HowItWorks.tsx  # Process explanation
│   ├── CTA.tsx         # Call-to-action section
│   └── Footer.tsx      # Site footer
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles

```

## Key Features Highlighted

- **Non-invasive Screening**: Emphasizes comfort and accessibility
- **AI-Powered Analysis**: Advanced speech and text pattern recognition
- **Quick Assessment**: 5-10 minute screening process
- **Home Accessibility**: No clinic visits required
- **HIPAA Compliance**: Secure and private health data handling

## Design System

The application uses a cohesive design system with:

- **Primary Colors**: Blue gradient (primary-500 to primary-700)
- **Secondary Colors**: Purple gradient (secondary-500 to secondary-700)
- **Typography**: Inter font family for modern readability
- **Spacing**: Consistent spacing scale using Tailwind's system
- **Components**: Reusable button styles and card layouts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
