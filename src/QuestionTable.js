

import React, { useEffect, useState } from "react";
import axios from "axios";
import { writeFile, utils } from "xlsx"; 
import Evaluation from "./Evaluation";  
import "./QuestionTable.css";

function QuestionTable({ username }) {
  const [categories, setCategories] = useState([]); 
  const [questions, setQuestions] = useState([]);  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [answers, setAnswers] = useState({}); 
  const [submittedAnswers, setSubmittedAnswers] = useState({}); 
  const [recommendations, setRecommendations] = useState({}); 
  const [activeTab, setActiveTab] = useState("questions"); 
  const [showAnswers, setShowAnswers] = useState(false); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5001/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAnswers = async () => {
      if (username) {
        try {
          const response = await axios.get(`http://localhost:5001/responses?username=${username}`);
          const answersMap = response.data.reduce((acc, answer) => {
            if (answer.questionId && answer.questionId._id) {
              acc[answer.questionId._id] = answer.answer;
            }
            return acc;
          }, {});
          setAnswers(answersMap);
          setSubmittedAnswers(answersMap);
        } catch (error) {
          console.error("Error fetching answers:", error);
        }
      } else {
        setAnswers({});
        setSubmittedAnswers({});
      }
    };
    fetchAnswers();
  }, [username]);


  useEffect(() => {
    if (selectedCategory && activeTab === "questions") {
      const fetchQuestions = async () => {
        try {
          const response = await axios.get(`http://localhost:5001/questions?category=${selectedCategory}`);
          setQuestions(response.data);

          const recommendationsData = {};
          response.data.forEach(question => {
            if (question.recommendations) {
              recommendationsData[question._id] = question.recommendations;
            }
          });
          setRecommendations(recommendationsData);
        } catch (error) {
          console.error("Error fetching questions:", error);
        }
      };
      fetchQuestions();
    }
  }, [selectedCategory, activeTab]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const handleSubmitAnswers = async () => {
    try {
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        username,
        questionId,
        answer,
      }));

      await axios.post("http://localhost:5001/responses/bulk", responses, {
        headers: { "Content-Type": "application/json" },
      });

      const recommendationsToSave = Object.entries(answers).map(([questionId, answer]) => ({
        username,
        questionId,
        recommendation: getRecommendation(questionId, answer),
      }));

      await Promise.all(
        recommendationsToSave.map((recommendationData) =>
          axios.post("http://localhost:5001/responses/recommendation", recommendationData, {
            headers: { "Content-Type": "application/json" },
          })
        )
      );

      setSubmittedAnswers({ ...submittedAnswers, ...answers });
      setAnswers({});
      alert("All answers and recommendations saved successfully");
    } catch (error) {
      console.error("Error saving answers and recommendations:", error.response ? error.response.data : error.message);
      alert("Failed to save answers and recommendations");
    }
  };

  const getRecommendation = (questionId, answer) => {
    const questionRecommendations = recommendations[questionId];
    if (questionRecommendations && questionRecommendations[answer]) {
      return questionRecommendations[answer];
    }
    return "No recommendation available";
  };

  const downloadTableAsExcel = () => {
    const tableData = questions.map((question) => ({
      Question: question.question,
      Answer: submittedAnswers[question._id] || "",
    }));

    const ws = utils.json_to_sheet(tableData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Questions");

    writeFile(wb, `Questions_${selectedCategory}.xlsx`);
  };

  return (
    <div className="question-table">
      <h2>Assessment Portal</h2>

      <div className="category-tabs">
        <button
          className={activeTab === "evaluation" ? "active" : ""}
          onClick={() => setActiveTab("evaluation")}
        >
          Evaluations
        </button>
        <button
          className={activeTab === "questions" ? "active" : ""}
          onClick={() => setActiveTab("questions")}
        >
          Question Category
        </button>
      </div>

      {activeTab === "questions" && (
        <div>
          <h3>Select a Category</h3>
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category.name}
                className={selectedCategory === category.name ? "active" : ""}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "questions" && selectedCategory && (
        <div>
          <h3>Questions for {selectedCategory}</h3>
          {questions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question._id}>
                    <td>{question.question}</td>
                    <td>
                      {submittedAnswers[question._id] ? (
                        <span>Your Answer: {submittedAnswers[question._id]}</span>
                      ) : (
                        <select
                          value={answers[question._id] || ""}
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        >
                          <option value="">Select an option</option>
                          {question.options.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No questions available for this category.</p>
          )}
          <button onClick={handleSubmitAnswers} disabled={!Object.keys(answers).length}>
            Submit All Answers
          </button>
        
          <button onClick={downloadTableAsExcel}>
            Download as Excel
          </button>
        </div>
      )}

     
      {activeTab === "evaluation" && <Evaluation username={username} />}
    </div>
  );
}

export default QuestionTable;
