# Meta Title & Description Generator

A web application that generates SEO-optimized meta titles and descriptions for websites using Google's Gemini AI.

## Features

- Generate SEO-optimized meta titles and descriptions
- Specify keywords to include in the generated content
- Generate multiple variations
- Copy to clipboard functionality
- Modern, responsive UI

## Tech Stack

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express
- **AI**: Google Generative AI (Gemini 1.5 Flash model)
- **Web Scraping**: Axios, Cheerio

## Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm
- Google Gemini API key

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/meta-title-generator.git
   cd meta-title-generator
   ```

2. Install dependencies:
   ```
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development servers:

   Backend:
   ```
   npm run dev
   ```

   Frontend:
   ```
   cd frontend
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploying to Render

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Use the following settings:
   - **Name**: meta-title-generator (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add your `GEMINI_API_KEY`

4. Click "Create Web Service"

### Deploying to Heroku

1. Create a new app on Heroku
2. Connect your GitHub repository
3. Add the following buildpacks:
   - heroku/nodejs
4. Add your `GEMINI_API_KEY` to the Config Vars
5. Deploy the app

## License

MIT