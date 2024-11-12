
import React, { useState, useEffect } from "react";
import axios from "axios";

const Evaluation = ({ username }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [finalRecommendation, setFinalRecommendation] = useState("");
  const [averageScore, setAverageScore] = useState(0);
  const [compatibilityMessage, setCompatibilityMessage] = useState("");
  const [compatibilityPercentage, setCompatibilityPercentage] = useState(0);

  const recommendationScores = {
    Rehost: 4.5,
    Replatform: 4,
    Refactor: 3.5,
    Rebuild: 3,
    Replace: 2.5,
    Retain: 2,
    Retire: 1,
  };

  const compatibilityInfo = {
    Rehost: { message: "Compatible with cloud and cost-effective", percentage: 100 },
    Replatform: { message: "Compatible with cloud and cost-effective", percentage: 90 },
    Refactor: { message: "Compatible with cloud but expensive", percentage: 60 },
    Rebuild: { message: "Compatible with cloud but expensive", percentage: 55 },
    Replace: { message: "Compatible with cloud but expensive", percentage: 50 },
    Retain: { message: "Not compatible with cloud", percentage: 0 },
    Retire: { message: "Not compatible with cloud", percentage: 0 },
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/responses/recommendations?username=${username}`);
        setRecommendations(response.data.map(item => item.recommendation)); 
      } catch (error) {
        console.error("Error fetching user recommendations:", error);
      }
    };

    fetchRecommendations();
  }, [username]);

  useEffect(() => {
    if (recommendations.length > 0) {
      let cumulativeScore = 0;

      recommendations.forEach((recommendation) => {
        const score = recommendationScores[recommendation];
        if (score !== undefined) {
          cumulativeScore += score;
        }
      });

      const avgScore = cumulativeScore / recommendations.length;
      const roundedAverageScore = parseFloat(avgScore.toFixed(2));
      setAverageScore(roundedAverageScore);

      const roundedScore = Math.round(roundedAverageScore);

      const finalRecommendationKey = Object.keys(recommendationScores).find(
        (key) => recommendationScores[key] === roundedScore
      );

      setFinalRecommendation(finalRecommendationKey || "No recommendation");

      if (finalRecommendationKey && compatibilityInfo[finalRecommendationKey]) {
        setCompatibilityMessage(compatibilityInfo[finalRecommendationKey].message);
        setCompatibilityPercentage(compatibilityInfo[finalRecommendationKey].percentage);
      }
    }
  }, [recommendations]);

  return (
    <div>
      <h2>Evaluation for {username}</h2>
      <div>
        <h3>Average Score: {averageScore}</h3>
        <h3>Final Cumulative Recommendation: {finalRecommendation}</h3>
        <h3>Compatibility: {compatibilityMessage}</h3>
        <h3>Compatibility Percentage: {compatibilityPercentage}%</h3>
      </div>
    </div>
  );
};

export default Evaluation;
