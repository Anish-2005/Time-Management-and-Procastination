import React, { useState } from 'react';
import axios from 'axios';
import { FaSpinner, FaPaperPlane,FaLightbulb } from 'react-icons/fa';


const Solutions = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
  
    const fullQuery = `You are an AI expert in time management and handling procrastination.Give a short and precise solution in 2-3 points and one liner.Respose must not be greater than 5 sentences or points. Provide a helpful response to the following: ${query}`;
  
    try {
      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBrFdHlgr-mhXs13iFBeaAnG299jCJYC3M`,
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
    
        setResponse(formattedText);
      } catch (error) {
        setResponse('Failed to fetch solution. Try again.');
        console.error(error);
      }
    
      setLoading(false);
    };
  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-900 text-white rounded-xl shadow-lg backdrop-blur-lg bg-opacity-80 border border-gray-700">
      <h2 className="text-3xl font-bold mb-4 text-center text-purple-400">Get your Solutions</h2>
      <textarea
        className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg resize-none"
        rows="4"
        placeholder="Ask how to manage time better..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 transition-transform transform hover:scale-105 active:scale-95 rounded-lg text-lg font-semibold"
        onClick={handleAsk}
        disabled={loading}
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />} {loading ? 'Thinking...' : 'Get Solution'}
      </button>
      {response && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p dangerouslySetInnerHTML={{ __html: response }} />
        </div>
        )}
    </div>
  );
};

export default Solutions;