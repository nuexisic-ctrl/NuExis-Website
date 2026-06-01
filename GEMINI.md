# Project: NuExis Website

## Project Overview

This is a React-based e-commerce or product catalog website for a company called "NuExis". The application showcases a wide range of electronic products, including digital signage, podiums, conference systems, and professional audio equipment. The frontend is built with React and TypeScript, utilizing Vite for fast development and bundling. It features dynamic routing with React Router, animations powered by Framer Motion, and backend integration with Supabase for features like authentication.

## Key Technologies

*   **Frontend Framework**: React
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Routing**: React Router DOM v6
*   **Styling**: CSS (as per `index.css`, likely with a utility-first approach)
*   **Animations**: Framer Motion
*   **Backend as a Service (BaaS)**: Supabase (for authentication, etc.)
*   **Icons**: Lucide React
*   **Notifications**: React Hot Toast
*   **Smooth Scrolling**: Lenis/Luxy.js

## Project Structure

The project follows a standard structure for a modern React application:

```
/
├── components/         # Reusable React components and page components
├── context/            # React Context providers (e.g., AuthContext)
├── data/               # Static data, including the main product catalog
├── images/             # Product images, logos, and other assets
├── lib/                # Client configurations (e.g., Supabase)
├── public/             # Static assets that are not processed by Vite
├── App.tsx             # Main application component with routing
├── index.tsx           # Application entry point
├── vite.config.ts      # Vite configuration file
└── package.json        # Project dependencies and scripts
```

## Building and Running the Project

### Prerequisites

*   Node.js installed on your system.
*   A Gemini API key.

### Setup and Execution

1.  **Install Dependencies**:
    Open a terminal in the project root and run the following command to install the necessary packages:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    The project requires a Gemini API key. Create a `.env` file in the project root and add your API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Run the Development Server**:
    To start the application in development mode, run:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

4.  **Build for Production**:
    To create an optimized production build, run:
    ```bash
    npm run build
    ```
    The output files will be generated in the `dist/` directory.

5.  **Preview the Production Build**:
    To serve the production build locally for testing, run:
    ```bash
    npm run preview
    ```

## Development Conventions

*   **Component-Based Architecture**: The application is built using a modular structure with components for different UI elements and pages.
*   **TypeScript**: The codebase is written in TypeScript, providing type safety and improved developer experience.
*   **Path Aliases**: The project uses the `@/` alias to refer to the root directory for cleaner import paths.
*   **Code Splitting**: Components are lazy-loaded using `React.lazy` and `Suspense` to improve initial page load times.
*   **Centralized Product Data**: The product catalog is managed in a structured manner within `data/productCatalog.ts`, making it easy to update and maintain product information.
*   **Routing**: The application uses React Router for client-side routing, with dynamic routes for product pages.
