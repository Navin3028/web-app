import React, { useState } from 'react';
import axios from 'axios';

function Questionnaire1({ category }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['']);
  const [message, setMessage] = useState('');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/questionnaire', {
        category,
        question,
        options,
      });
      setMessage(response.data.message);
      setQuestion('');
      setOptions(['']);
    } catch (error) {
      alert('Error submitting question');
    }
  };

  return (
    <div className="form-container">
      <h3>{category} Questionnaire</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            required
          />
        ))}
        <button type="button" onClick={addOption}>Add Option</button>
        <button type="submit">Submit Question</button>
      </form>
      {message && <h4>{message}</h4>}
    </div>
  );
}

export default Questionnaire1;
