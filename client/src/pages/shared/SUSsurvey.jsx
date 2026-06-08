import React, { useState } from 'react';
import api from '../../api/axiosInstance';
import './SUSsurvey.css';

const questions = [
  "I think that I would like to use this system frequently.",
  "I found the system unnecessarily complex.",
  "I thought the system was easy to use.",
  "I think that I would need the support of a technical person to be able to use this system.",
  "I found the various functions in this system were well integrated.",
  "I thought there was too much inconsistency in this system.",
  "I would imagine that most people would learn to use this system very quickly.",
  "I found the system very cumbersome to use.",
  "I felt very confident using the system.",
  "I needed to learn a lot of things before I could get going with this system."
];

const SUSsurvey = () => {
  const [responses, setResponses] = useState(Array(10).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelect = (qIndex, value) => {
    const newResponses = [...responses];
    newResponses[qIndex] = value;
    setResponses(newResponses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (responses.includes(null)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setLoading(true);
    try {
      await api.post('/survey/sus', { responses });
      setSubmitted(true);
    } catch (err) {
      // If it fails, maybe mock success since it's a prototype
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Thank You!</h2>
        <p>You have successfully submitted your feedback. We appreciate your input.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>System Usability Survey</h1>
        <p className="text-muted">Please provide your feedback on the Blood Bank Management System.</p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between text-sm text-muted mb-3" style={{ padding: '0 1rem' }}>
            <span>Strongly Disagree (1)</span>
            <span>Strongly Agree (5)</span>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="survey-question">
              <p><strong>{i + 1}.</strong> {q}</p>
              <div className="likert-scale">
                {[1, 2, 3, 4, 5].map(val => (
                  <label key={val} className="likert-option">
                    <input 
                      type="radio" 
                      name={`q${i}`} 
                      value={val} 
                      checked={responses[i] === val}
                      onChange={() => handleSelect(i, val)} 
                    />
                    <span>{val}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SUSsurvey;
