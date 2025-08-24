// Mock hardcoded data for Users, Notes, and Comments

const users = [
  {
    id: "u1",
    username: "teacher1",
    password: "hashedpassword123", // in real app this would be bcrypt hashed
    is_admin: true,
  },
  {
    id: "u2",
    username: "student1",
    password: "hashedpassword456",
    is_admin: false,
  },
  {
    id: "u3",
    username: "student2",
    password: "hashedpassword789",
    is_admin: false,
  },
];

const notes = [
  {
    id: "n1",
    note_title: "Introduction to Node.js",
    note_picture: "/images/nodejs.png",
    ai_summary: "This note introduces Node.js basics and runtime concepts.",
    comments: ["c1", "c2"], // references to comments
    time: "2025-08-23T12:00:00Z",
    owner: "u1", // created by teacher1
  },
  {
    id: "n2",
    note_title: "Express.js Routing",
    note_picture: "/images/express.png",
    ai_summary: "Covers routing fundamentals in Express.js applications.",
    comments: ["c3"],
    time: "2025-08-22T15:30:00Z",
    owner: "u2", // created by student1
  },
];

const comments = [
  {
    id: "c1",
    description: "Great note! This helped me understand callbacks.",
    commentBy: "u2", // student1
    commentTo: "n1", // note about Node.js
    ai_prompt_comment: "Summarize note usefulness",
    ai_comment: "This note is helpful for beginners learning Node.js.",
  },
  {
    id: "c2",
    description: "Can you add examples on async/await?",
    commentBy: "u3", // student2
    commentTo: "n1",
    ai_prompt_comment: "Request for clarification",
    ai_comment: "More examples on async/await would be useful.",
  },
  {
    id: "c3",
    description: "Nice explanation on routing middleware!",
    commentBy: "u1", // teacher1
    commentTo: "n2",
    ai_prompt_comment: null,
    ai_comment: null,
  },
];

module.exports = {
  users,
  notes,
  comments,
};
