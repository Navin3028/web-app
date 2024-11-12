


// import React, { useEffect, useState } from 'react';
// import { Route, Routes, NavLink } from 'react-router-dom';
// import Questionnaire from './Questionnaire'; 
// import './AdminDashboard.css'; 
// import axios from 'axios';
// import * as XLSX from 'xlsx'; 

// function AdminDashboard() {
//   const [questions, setQuestions] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [showTable, setShowTable] = useState(false); 
//   const [showUserTable, setShowUserTable] = useState(false);
//   const [newUser, setNewUser] = useState({ username: '', role: '' }); 

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const response = await axios.get('http://localhost:5001/questions');
//         setQuestions(response.data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//       }
//     };

//     fetchQuestions();
//   }, []);


//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get('http://localhost:5001/users');
//         setUsers(response.data);
//       } catch (error) {
//         console.error('Error fetching users:', error);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const downloadExcel = () => {
//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.aoa_to_sheet([['Category', 'Question', 'Options']]);

//     questions.forEach((item) => {
//       const row = [item.category, item.question, item.options.join(', ')];
//       XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: -1 });
//     });

//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
//     XLSX.writeFile(workbook, 'questions.xlsx');
//   };

//   const handleAddUser = async () => {
//     try {
//       const response = await axios.post('http://localhost:5001/users', newUser);
//       setUsers([...users, response.data]);
//       setNewUser({ username: '', role: '' }); 
//     } catch (error) {
//       console.error('Error adding user:', error);
//     }
//   };

//   const handleDeleteUser = async (userId) => {
//     try {
//       await axios.delete(`http://localhost:5001/users/${userId}`);
//       setUsers(users.filter(user => user._id !== userId)); // Remove deleted user from state
//     } catch (error) {
//       console.error('Error deleting user:', error);
//     }
//   };

//   return (
//     <div className="admin-dashboard-container">
//       <div className="sidebar">
//         <h3>Questionnaire</h3>
//         <NavLink to="/admin/infrastructure" className="sidebar-link" activeClassName="active">Infrastructure Questionnaire</NavLink>
//         <NavLink to="/admin/application" className="sidebar-link" activeClassName="active">Application Questionnaire</NavLink>
//         <NavLink to="/admin/integration" className="sidebar-link" activeClassName="active">Integration Questionnaire</NavLink>
        
//         <h3>Manage</h3>
//         <button className="sidebar-button" onClick={() => setShowUserTable(true)}>Manage Users</button>
//         <button className="sidebar-button" onClick={() => setShowTable(true)}>View Responses</button>
        
//         <h3>Actions</h3>
//         <button className="sidebar-button" onClick={() => setShowTable(true)}>View Questions</button>
//         <button className="sidebar-button" onClick={downloadExcel}>Download as Excel</button>
//       </div>

//       <div className="main-content">
//         <Routes>
//           <Route path="/infrastructure" element={<Questionnaire category="Infrastructure" />} />
//           <Route path="/application" element={<Questionnaire category="Application" />} />
//           <Route path="/integration" element={<Questionnaire category="Integration" />} />
//         </Routes>

      
//         {showUserTable && (
//           <div className="user-management">
//             <h3>Manage Users</h3>
//             <div className="add-user-form">
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={newUser.username}
//                 onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
//               />
//               <input
//                 type="text"
//                 placeholder="Role"
//                 value={newUser.role}
//                 onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
//               />
//               <button className="add-user-button" onClick={handleAddUser}>Add User</button>
//             </div>
//             <table className="user-table">
//               <thead>
//                 <tr>
//                   <th>Username</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {users.map((user) => (
//                   <tr key={user._id}>
//                     <td>{user.username}</td> 
//                     <td>
//                       <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {showTable && (
//           <div className="questions-table">
//             <h3>All Questions</h3>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Category</th>
//                   <th>Question</th>
//                   <th>Options</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {questions.map((item, index) => (
//                   <tr key={index}>
//                     <td>{item.category}</td>
//                     <td>{item.question}</td>
//                     <td>
//                       <select>
//                         <option value="">Select an option</option>
//                         {item.options.map((option, i) => (
//                           <option key={i} value={option}>{option}</option>
//                         ))}
//                       </select>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;




import React, { useEffect, useState } from 'react';
import { Route, Routes, NavLink } from 'react-router-dom';
import Questionnaire from './Questionnaire'; 
import './AdminDashboard.css'; 
import axios from 'axios';
import * as XLSX from 'xlsx'; 

function AdminDashboard() {
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [showTable, setShowTable] = useState(false); 
  const [showUserTable, setShowUserTable] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', role: '' }); 

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5001/questions');
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const downloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Category', 'Question', 'Options']]);

    questions.forEach((item) => {
      const row = [item.category, item.question, item.options.join(', ')];
      XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: -1 });
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
    XLSX.writeFile(workbook, 'questions.xlsx');
  };

  const handleAddUser = async () => {
    try {
      const response = await axios.post('http://localhost:5001/users', newUser);
      setUsers([...users, response.data]);
      setNewUser({ username: '', role: '' }); 
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:5001/users/${userId}`);
      console.log(response.data); // Check if the response message is as expected
  
      // Update the frontend list of users after successful deletion
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  




  

  // Toggle visibility for the tables
  const toggleUserTable = () => {
    setShowUserTable(!showUserTable);
  };

  const toggleQuestionTable = () => {
    setShowTable(!showTable);
  };

  return (
    <div className="admin-dashboard-container">
      <div className="sidebar">
        <h3>Questionnaire</h3>
        <NavLink to="/admin/infrastructure" className="sidebar-link" activeClassName="active">Infrastructure Questionnaire</NavLink>
        <NavLink to="/admin/application" className="sidebar-link" activeClassName="active">Application Questionnaire</NavLink>
        <NavLink to="/admin/integration" className="sidebar-link" activeClassName="active">Integration Questionnaire</NavLink>
        
        <h3>Manage</h3>
        <button className="sidebar-button" onClick={toggleUserTable}>Manage Users</button>
        <button className="sidebar-button" onClick={toggleQuestionTable}>View Responses</button>
        
        <h3>Actions</h3>
        <button className="sidebar-button" onClick={toggleQuestionTable}>View Questions</button>
        <button className="sidebar-button" onClick={downloadExcel}>Download as Excel</button>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/infrastructure" element={<Questionnaire category="Infrastructure" />} />
          <Route path="/application" element={<Questionnaire category="Application" />} />
          <Route path="/integration" element={<Questionnaire category="Integration" />} />
        </Routes>

        {showUserTable && (
          <div className="user-management">
            <h3>Manage Users</h3>
            <div className="add-user-form">
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
              <input
                type="text"
                placeholder="Role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              />
              <button className="add-user-button" onClick={handleAddUser}>Add User</button>
            </div>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td> 
                    <td>
                      <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showTable && (
          <div className="questions-table">
            <h3>All Questions</h3>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Question</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((item, index) => (
                  <tr key={index}>
                    <td>{item.category}</td>
                    <td>{item.question}</td>
                    <td>
                      <select>
                        <option value="">Select an option</option>
                        {item.options.map((option, i) => (
                          <option key={i} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
