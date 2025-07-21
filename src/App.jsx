import React, { useState } from 'react';

// Main App component for the Text Summarizer application.
// This component handles user input, calls the Gemini API for summarization,
// and displays the results.
function App() {
  // State to store the text input by the user.
  const [inputText, setInputText] = useState('');
  // State to store the summarized text received from the API.
  const [summary, setSummary] = useState('');
  // State to manage the loading status during API calls.
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error messages that occur during the process.
  const [error, setError] = useState('');

  // Function to handle changes in the text input area.
  const handleInputChange = (event) => {
    setInputText(event.target.value);
    // Clear any previous error messages when the user starts typing again.
    setError('');
  };

  // Asynchronous function to call the Gemini API for text summarization.
  const summarizeText = async () => {
    // Clear previous summary and error messages.
    setSummary('');
    setError('');

    // Basic validation: ensure there's text to summarize.
    if (!inputText.trim()) {
      setError('Please enter some text to summarize.');
      return;
    }

    setIsLoading(true); // Set loading state to true.

    try {
      // Construct the prompt for the Gemini API.
      const prompt = `Summarize the following text concisely and accurately:\n\n${inputText}`;

      // Prepare the payload for the API request.
      const chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };

      // API key for the Gemini API. Leave empty for Canvas to provide.
      const apiKey = "";
      // API URL for the Gemini 2.0 Flash model.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      // Make the API call to Gemini.
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Check if the response was successful.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch summary from API.');
      }

      const result = await response.json();

      // Extract the summarized text from the API response.
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const generatedText = result.candidates[0].content.parts[0].text;
        setSummary(generatedText); // Update the summary state.
      } else {
        // Handle cases where the response structure is unexpected.
        setError('Could not get a valid summary. Please try again.');
        console.error('Unexpected API response structure:', result);
      }

    } catch (err) {
      // Catch and display any errors during the API call.
      setError(`Error: ${err.message}`);
      console.error('Summarization error:', err);
    } finally {
      setIsLoading(false); // Reset loading state to false, regardless of success or failure.
    }
  };

  return (
    // Main container for the application, styled with Tailwind CSS for responsiveness.
    // Changed background to bg-gray-900 for a dark look.
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 hover:scale-[1.01]">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6 tracking-tight">
          AI Text Summarizer
        </h1>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Concise summaries powered by Google's Gemini AI.
        </p>

        {/* Input Text Area */}
        <div className="mb-6">
          <label htmlFor="inputText" className="block text-gray-700 text-sm font-semibold mb-2">
            Enter Text to Summarize:
          </label>
          <textarea
            id="inputText"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-800 text-base resize-y min-h-[150px] shadow-sm"
            placeholder="Paste your article, document, or paragraph here..."
            value={inputText}
            onChange={handleInputChange}
            rows="8"
          ></textarea>
        </div>

        {/* Summarize Button */}
        <div className="mb-6 text-center">
          <button
            onClick={summarizeText}
            disabled={isLoading || !inputText.trim()} // Disable button when loading or no text.
            className={`
              w-full px-6 py-3 rounded-full text-lg font-bold
              transition-all duration-300 ease-in-out
              ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Summarizing...
              </span>
            ) : (
              'Summarize Text'
            )}
          </button>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* Summary Output Area */}
        {summary && (
          <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary:</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
              {summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
