
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssessorTable.css';  

const AssessorTable = () => {
  const [questions, setQuestions] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [openUser, setOpenUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [remediationData, setRemediationData] = useState({});
  const [ratingData, setRatingData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionResponse, assessmentResponse, answersResponse] = await Promise.all([
          axios.get('http://localhost:5001/questions-only'),
          axios.get('http://localhost:5001/user-assessments'),
          axios.get('http://localhost:5001/answers-only')
        ]);
        setQuestions(questionResponse.data);
        setAssessments(assessmentResponse.data);
        const transformedAnswers = {};
        answersResponse.data.forEach((item) => {
          const { username, questionId, answer } = item;
          if (!transformedAnswers[username]) {
            transformedAnswers[username] = {};
          }
          transformedAnswers[username][questionId] = answer;
        });
        setAnswers(transformedAnswers);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      }
    };

    fetchData();
  }, []);

  const handleUserToggle = (username) => {
    setOpenUser(openUser === username ? null : username);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const getRecommendationForAnswer = (answer) => {
    const recommendationMap = {
      "Dynamic IP": "Rehost",
      "Static IP": "Rehost",
      "Custom IP": "Revise"
    };
    return recommendationMap[answer] || 'No recommendation';
  };

  const handleRemediationChange = (username, questionId, value) => {
    setRemediationData((prevState) => ({
      ...prevState,
      [username]: {
        ...prevState[username],
        [questionId]: value,
      },
    }));
  };

  const handleRatingChange = (username, questionId, rating) => {
    setRatingData((prevState) => ({
      ...prevState,
      [username]: {
        ...prevState[username],
        [questionId]: rating,
      },
    }));
  };

  const saveRemediationAndRating = (username, questionId) => {
    const remediation = remediationData[username]?.[questionId];
    const rating = ratingData[username]?.[questionId];

    if (remediation !== undefined && rating !== undefined) {
      axios
        .post('http://localhost:5001/save-rating-remediation', {
          username,
          questionId,
          remediation,
          rating,
        })
        .then((response) => {
          console.log('Remediation and rating saved successfully');
        })
        .catch((error) => {
          console.error('Error saving remediation and rating:', error);
        });
    }
  };

  const filteredQuestions = selectedCategory === 'All'
    ? questions
    : questions.filter(q => q.category === selectedCategory);

  const filteredUsers = Object.keys(assessments).filter(username =>
    username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="assessor-table-container">
      <h1>Assessor Tables</h1>

   
      <input
        className="search-box"
        type="text"
        placeholder="Search users"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="filter-container">
        <select
          className="filter-dropdown"
          onChange={handleCategoryChange}
          value={selectedCategory}
        >
          <option value="All">All Categories</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Application">Application</option>
          <option value="Integration">Integration</option>
        </select>
      </div>

      {error && <p>{error}</p>}

      {filteredQuestions.length > 0 ? (
        filteredUsers.map((username) => (
          <div key={username}>
            <button onClick={() => handleUserToggle(username)}>
              {username} {openUser === username ? '▲' : '▼'}
            </button>

            {openUser === username && (
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Question</th>
                      <th>Answer (with Recommendation)</th>
                      <th>Rating</th>
                      <th>Remediation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((question) => {
                      const userResponse = assessments[username]?.[question._id] || {};
                      const userRating = userResponse?.rating || null;
                      const userRemediation = userResponse?.remediation || null;

                      return (
                        <tr key={question._id}>
                          <td>{question.category}</td>
                          <td>{question.question}</td>
                          <td>
                            {answers[username]?.[question._id] || 'No answer'}
                            <br />
                            <span>Recommendation: {getRecommendationForAnswer(answers[username]?.[question._id])}</span>
                          </td>
                          <td>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`star ${userRating >= star ? 'filled' : ''}`}
                                onClick={() => handleRatingChange(username, question._id, star)}
                              >
                                ★
                              </span>
                            ))}
                          </td>

                          <td>
                            <input
                              className="remediation-input"
                              type="text"
                              value={remediationData[username]?.[question._id] || userRemediation || ''}
                              onChange={(e) => handleRemediationChange(username, question._id, e.target.value)}
                              placeholder="Enter remediation"
                            />
                            <button
                              className="remediation-save-button"
                              onClick={() => saveRemediationAndRating(username, question._id)}
                            >
                              Save Remediation & Rating
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
};

export default AssessorTable;
