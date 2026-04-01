import React, { createContext, useContext, useState, useCallback } from 'react';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [score, setScore] = useState(null);
  const [report, setReport] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState(null);
  const [learningPath, setLearningPath] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [motivation, setMotivation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAIScore = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/score', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch AI score');
      const data = await response.json();
      setScore(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAIReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/report', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch AI report');
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCareerRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAIInsights = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch insights');
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLearningPath = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/learning-path', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLearningPath(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSkillGaps = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/skill-gap', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSkillGaps(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMotivation = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/motivation', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMotivation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportPDF = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/export-pdf', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to export PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DRUS_AI_Profile.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const sendChatMessage = useCallback(async (message) => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      return data.reply;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return (
    <AIContext.Provider value={{
      score, report, recommendations, insights, learningPath, skillGaps, motivation, loading, error,
      fetchAIScore, fetchAIReport, fetchCareerRecommendations, fetchAIInsights, 
      fetchLearningPath, fetchSkillGaps, fetchMotivation, exportPDF, sendChatMessage
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);
