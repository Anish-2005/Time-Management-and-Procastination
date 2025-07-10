import React, { useState } from 'react';
import axios from 'axios';
import { FaSpinner, FaPaperPlane,FaLightbulb,FaRobot,FaRegCommentDots } from 'react-icons/fa';
import DOMPurify from 'dompurify';

// Add to your component

const Solutions = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    
    // Check if API key is available
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      setResponse('API key not configured. Please check your environment variables.');
      return;
    }
    
    setLoading(true);
    setResponse('');
  
    const fullQuery = `You are an AI expert in time management and handling procrastination.Give a short and precise solution in 2-3 points and one liner.Respose must not be greater than 5 sentences or points. Provide a helpful response to the following: ${query}`;
  
    try {
      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
            contents: [{ parts: [{ text: fullQuery }] }]
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
    
        let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
        
        // Formatting the response
        let formattedText = rawText
          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Make text bold
          .replace(/\n(\d+\.)/g, '\n<br/>$1') // Move numbered lists to the next line
          .replace(/^\*(.*)$/gm, '• $1') // Convert single * into bullet points
          .replace(/\n(• )/g, '\n<br/>$1'); // Move • points to a new line
    
        setResponse(rawText);
      } catch (error) {
        setResponse('Failed to fetch solution. Try again.');
        console.error(error);
      }
    
      setLoading(false);
    };
    return (
      <div>
        {/* Desktop Layout */}
        <div className="hidden md:block max-w-7xl mx-auto p-8">
  <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-12 space-y-10">
    {/* Header Section - Fixed Centering */}
    <div className="flex items-center justify-center gap-6 mb-12 text-center"> {/* Added justify-center and text-center */}
      <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
        <FaRobot className="w-16 h-16 text-purple-400 animate-pulse mx-auto" /> {/* Added mx-auto */}
      </div>
      <div className="flex flex-col items-center"> {/* Added flex-col and items-center */}
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 mb-2">
          Productivity AI
        </h2>
        <p className="text-gray-400 mt-1">AI-powered time management solutions</p>
      </div>
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-2 gap-10">
      {/* Input Section */}
      <div className="space-y-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <textarea
            className="w-full p-8 bg-gray-800/60 rounded-2xl border border-gray-700/50 focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/20 text-xl resize-none h-80 placeholder-gray-500 backdrop-blur-sm transition-all duration-300"
            placeholder="Describe your productivity challenge..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute bottom-6 right-6 p-2 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <FaLightbulb className="w-8 h-8 text-purple-400/80" />
          </div>
        </div>

        <button
          className="w-full flex items-center justify-center gap-4 px-10 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600/90 hover:to-indigo-600/90 rounded-2xl text-2xl font-bold transition-all duration-300 transform hover:scale-[1.015] active:scale-95 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20"
          onClick={handleAsk}
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin w-8 h-8" />
              <span>Analyzing Patterns...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="w-8 h-8" />
              <span>Generate Smart Solution</span>
            </>
          )}
        </button>
      </div>

      {/* Response Section */}
{/* Response Section */}
<div className="relative group w-full min-h-[600px]">
  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl blur opacity-30 transition duration-1000"></div>
  <div className="h-full p-8 bg-gray-800/60 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
    {response ? (
      <>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700/50">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <FaRobot className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-purple-200">Optimized Solution</h3>
            <p className="text-gray-400 text-sm">AI-Powered Recommendations</p>
          </div>
        </div>
        <div className="prose prose-lg prose-invert text-gray-300">
          <div 
            className="space-y-4"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(response)
              .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Make text bold
              .replace(/\n(\d+\.)/g, '\n<br/>$1') // Move numbered lists to the next line
              .replace(/^\*(.*)$/gm, '• $1') // Convert single * into bullet points
              .replace(/\n(• )/g, '\n<br/>$1') // Move • points to a new line
            }}
          />
        </div>
      </>
    ) : (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <FaRegCommentDots className="w-16 h-16 text-gray-600/50" />
        <p className="text-gray-600/50 text-xl font-medium">
          AI-generated solutions will appear here
        </p>
        <p className="text-gray-600/40 text-sm">
          Describe your challenge and click "Generate Solution"
        </p>
      </div>
    )}
  </div>
</div>
  </div>
  </div>
    </div>
        {/* Mobile Layout */}
        <div className="md:hidden mx-4 my-6">
  <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700/50 p-5 space-y-6">
    {/* Header */}
    <div className="flex items-center gap-4">
      <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <FaRobot className="w-8 h-8 text-purple-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-purple-200">Productivity AI</h2>
        <p className="text-gray-400 text-xs">Smart Time Solutions</p>
      </div>
    </div>

    {/* Input Area */}
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-purple-500/10 rounded-xl blur opacity-30 transition duration-500"></div>
      <textarea
        className="w-full p-4 bg-gray-800/70 rounded-xl border border-gray-700/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-base resize-none h-40 placeholder-gray-500 backdrop-blur-sm"
        placeholder="Describe your time management challenge..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>

    {/* Generate Button */}
    <button
      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-base font-semibold active:scale-95 transition-transform"
      onClick={handleAsk}
      disabled={loading}
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin w-5 h-5" />
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <FaPaperPlane className="w-5 h-5" />
          <span>Get Solutions</span>
        </>
      )}
    </button>

    {/* Response Area */}
    <div className="relative group min-h-[300px]">
      <div className="absolute -inset-0.5 bg-purple-500/10 rounded-xl blur opacity-20 transition duration-500"></div>
      <div className="h-full p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
        {response ? (
          <>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700/50">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FaRobot className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-purple-200">AI Solution</h3>
            </div>
            <div 
              className="text-sm text-gray-300 space-y-3"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(response)
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Make text bold
                .replace(/\n(\d+\.)/g, '\n<br/>$1') // Move numbered lists to the next line
                .replace(/^\*(.*)$/gm, '• $1') // Convert single * into bullet points
                .replace(/\n(• )/g, '\n<br/>$1') // Move • points to a new line
              }}
            />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-8">
            <FaRegCommentDots className="w-12 h-12 text-gray-600/50" />
            <p className="text-gray-600/50 text-sm font-medium">
              Your AI solutions will appear here
            </p>
            <p className="text-gray-600/40 text-xs">
              Describe your challenge above
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
</div>

        </div>
    );
  };
  
  export default Solutions;