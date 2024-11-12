const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const jwt = require("jsonwebtoken");
const cors = require('cors');



const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://navin280302:RA2PIT0n9oLH9nqL@cluster0.zzg1k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User model
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);



// Connect to the responses cluster (MongoDB Atlas cluster for responses)
const responseDb = mongoose.createConnection('mongodb+srv://navin280302:RA2PIT0n9oLH9nqL@cluster0.zzg1k.mongodb.net/responses', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Question model
const QuestionSchema = new mongoose.Schema({
  category: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
});

const Question = mongoose.model('Question', QuestionSchema);

// const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answer: { type: String, required: true },
  rating: { type: Number, default: null }, 
  remediation: { type: String, default: null },
  recommendation: { type: String, default: null }
});

module.exports = mongoose.model('Response', responseSchema);

const Response = mongoose.model('Response', responseSchema);


app.post('/api/signup', async (req, res) => {
  const { username, password, userType } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, userType });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ message: 'Sign-up failed' });
  }
});


app.post('/api/login', async (req, res) => {
  const { username, password, userType } = req.body;
  try {
   
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    
    if (user.userType !== userType) {
      return res.status(403).json({ message: 'User type does not match the provided credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

  
    const responses = await Response.find({ username }, 'questionId answer');
    const answers = responses.map((response) => ({
      questionId: response.questionId.toString(),
      answer: response.answer,
    }));

    res.status(200).json({
      message: 'Login successful',
      username: user.username,
      userType: user.userType,
      answers,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// app.post("/login", async (req, res) => {
//   const { username, password, userType } = req.body;

//   try {
//       // Find the user by username
//       const user = await User.findOne({ username });

//       if (!user) {
//           return res.status(400).json({ error: "User not found" });
//       }

//       // Check if the user type matches
//       if (user.userType !== userType) {
//           return res.status(403).json({ error: "User type does not match" });
//       }

//       // Verify password
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) {
//           return res.status(400).json({ error: "Invalid credentials" });
//       }

//       // Generate a token
//       const token = jwt.sign({ id: user._id, userType: user.userType }, "your_jwt_secret", {
//           expiresIn: "1h",
//       });

//       res.json({ message: "Login successful", token });
//   } catch (error) {
//       res.status(500).json({ error: "Server error" });
//   }
// });



// app.post('/responses/bulk', async (req, res) => {
//   try {
//     const { answers } = req.body; // Extracting the answers array from the request body
//     if (!answers || answers.length === 0) {
//       return res.status(400).json({ message: 'No answers provided' });
//     }

//     await Response.insertMany(answers); // Using insertMany for bulk insert
//     res.status(201).json({ message: 'Answers saved successfully' });
//   } catch (error) {
//     console.error('Error saving answers:', error);
//     res.status(500).json({ message: 'Failed to save answers' });
//   }
// });
app.post('/responses/bulk', async (req, res) => {
  try {
    const responses = req.body.map(response => ({
      ...response,
      rating: undefined  
    }));

    const validResponses = responses.filter(response => response.username && response.questionId && response.answer);

    if (validResponses.length > 0) {
      await Response.insertMany(validResponses);
      res.status(201).send({ message: 'Responses saved successfully' });
    } else {
      res.status(400).send({ message: 'No valid responses provided' });
    }

  } catch (error) {
    console.error('Error saving responses:', error);
    res.status(500).send({ message: 'Failed to save responses' });
  }
});


app.post('/questionnaire', async (req, res) => {
  const { category, question, options } = req.body;

  try {
    const newQuestion = new Question({ category, question, options });
    await newQuestion.save();
    res.status(201).send({ message: 'Question submitted successfully!' });
  } catch (error) {
    res.status(500).send({ message: 'Error saving question' });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const categories = await Question.distinct('category');
    res.status(200).json(categories.map(category => ({ name: category })));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to retrieve categories' });
  }
});

app.get('/questions', async (req, res) => {
  try {
    const category = req.query.category;
    const query = category ? { category } : {};
    const questions = await Question.find(query);
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Failed to retrieve questions' });
  }
});

app.get('/api/getAnswers', async (req, res) => {
  const username = req.query.username; 
  try {
      const answers = await AnswerModel.find({ username });
      res.json(answers);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching answers', error });
  }
});


app.post('/responses', async (req, res) => {
  const { username, questionId, answer } = req.body;

  try {
    const existingResponse = await Response.findOne({ username, questionId });

    if (existingResponse) {
      return res.status(400).json({ message: 'You have already answered this question.' });
    }

    const response = new Response({ username, questionId, answer });
    await response.save();
    res.json({ message: 'Answer saved successfully' });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ message: 'Failed to save answer' });
  }
});

app.get('/responses', async (req, res) => {
  const { username } = req.query;

  try {
    const userResponses = await Response.find({ username }).populate('questionId');
    res.status(200).json(userResponses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ message: 'Failed to retrieve responses' });
  }
});

// // Update remediation for a response
// app.put('/responses/remediation', async (req, res) => {
//   const { responseId, remediation } = req.body;

//   try {
//     const response = await Response.findById(responseId);

//     if (!response) {
//       return res.status(404).json({ message: 'Response not found' });
//     }

//     response.remediation = remediation;
//     await response.save();

//     res.json({ message: 'Remediation updated successfully' });
//   } catch (error) {
//     console.error('Error updating remediation:', error);
//     res.status(500).json({ message: 'Failed to update remediation' });
//   }
// });

app.post('/responses/bulk', async (req, res) => {
  try {
    const responses = req.body.map(response => ({
      username: response.username,
      questionId: response.questionId,
      answer: response.answer,
      recommendation: response.recommendation, 
    }));

    const validResponses = responses.filter(response => response.username && response.questionId && response.answer && response.recommendation);

    if (validResponses.length > 0) {
      await Response.insertMany(validResponses); 
      res.status(201).send({ message: 'Responses with recommendations saved successfully' });
    } else {
      res.status(400).send({ message: 'No valid responses provided' });
    }
  } catch (error) {
    console.error('Error saving responses with recommendations:', error);
    res.status(500).send({ message: 'Failed to save responses' });
  }
});


app.get('/questions-only', async (req, res) => {
  try {
    const questions = await Question.find({}, 'category question');
    res.status(200).json(questions);  
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Failed to retrieve questions' });
  }
});

app.get('/answers-only', async (req, res) => {
  try {
    
    const responses = await Response.find({}, 'username answer questionId');
    res.status(200).json(responses); 
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ message: 'Failed to retrieve answers' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); 
    res.status(200).json(users); 
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

app.post('/save-rating-remediation', async (req, res) => {
  const { username, questionId, remediation, rating } = req.body;

  console.log('Received data:', { username, questionId, remediation, rating });  

  
  if (!username || !questionId || rating === undefined) {
    return res.status(400).json({ message: 'Username, questionId, and rating are required' });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
  }

  try {
  
    const response = await Response.findOne({ username, questionId });

    if (!response) {
      return res.status(404).json({ message: 'Response not found for the given user and question' });
    }


    response.remediation = remediation || response.remediation; 
    response.rating = rating;
    await response.save();

    res.status(200).json({ message: 'Rating and remediation saved successfully' });
  } catch (error) {
    console.error('Error saving rating and remediation:', error);
    res.status(500).json({ message: 'Failed to save rating and remediation' });
  }
});

app.get('/get-response', async (req, res) => {
  const { username, questionId } = req.query;

  try {
    
    const response = await Response.findOne({ username, questionId });

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    res.status(200).json(response);  
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({ message: 'Failed to fetch response' });
  }
});

app.get('/user-assessments', async (req, res) => {
  try {
    const assessments = await Response.find({}, 'username questionId remediation rating');
    
    const groupedAssessments = assessments.reduce((acc, assessment) => {
      if (!acc[assessment.username]) {
        acc[assessment.username] = {};
      }
      acc[assessment.username][assessment.questionId] = {
        remediation: assessment.remediation,
        rating: assessment.rating,
      };
      return acc;
    }, {});

    res.status(200).json(groupedAssessments);  
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    res.status(500).json({ message: 'Failed to retrieve user assessments' });
  }
});

app.post('/responses/recommendation', async (req, res) => {
  const { username, questionId, recommendation } = req.body;

  if (!username || !questionId || !recommendation) {
    return res.status(400).json({ message: 'Username, questionId, and recommendation are required' });
  }

  try {
   
    const response = await Response.findOne({ username, questionId });

    if (!response) {
      return res.status(404).json({ message: 'Response not found for the given user and question' });
    }

    response.recommendation = recommendation;

    await response.save();

    res.status(200).json({ message: 'Recommendation saved successfully' });
  } catch (error) {
    console.error('Error saving recommendation:', error);
    res.status(500).json({ message: 'Failed to save recommendation' });
  }
});


app.get('/responses/recommendations', async (req, res) => {
  const { username } = req.query;
  try {
    const recommendations = await Response.find({ username }, { recommendation: 1, _id: 0 });
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});


// app.delete('/users/:id', async (req, res) => {
//   try {
//       const { id } = req.params;
//       const deletedUser = await User.findByIdAndDelete(id);
//       if (!deletedUser) return res.status(404).send('User not found');
//       res.status(200).send({ message: 'User deleted successfully' });
//   } catch (error) {
//       console.error('Error deleting user:', error);
//       res.status(500).send('Internal server error');
//   }
// });




app.delete('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Delete user
    await User.findByIdAndDelete(userId);
    
    // Delete responses by user ID
    await Response.deleteMany({ userId: userId });
    
    res.status(200).json({ message: 'User and their responses deleted successfully' });
  } catch (error) {
    console.error('Error deleting user and responses:', error);
    res.status(500).json({ message: 'Error deleting user and responses' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));





