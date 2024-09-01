import { config } from "dotenv";
import express from "express";
import OpenAI from "openai";
import cors from "cors";
import axios from "axios";
config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
};
app.use(cors(corsOptions));

//Conversation history
let conversationHistory = [
  { role: "system", content: "You are a helpful assistant" },
];
//Routes
/*
app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  conversationHistory.push({ role: "user", content: userMessage });
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        ...conversationHistory,
        { role: "user", content: userMessage },
      ],
      
      model: "gpt-4o-mini",
    });
    console.log(completion);

    //response
    const botResponse = completion.choices[0].message.content;
    res.json({
      message: botResponse,
    });
  } catch (error) {
    res.status(500).json("Error generting response from OpenAI");
  }
});
*/

app.post("/ask", async (req, res) => {
  const { message, thread_id } = req.body;
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [...conversationHistory, { role: "user", content: message }],
        thread_id: thread_id || null,
        stream: true,
      },
      {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      }
    );

    res.json({
      reply: response.data.choices[0].message.content,
      thread_id: response.data.thread_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Error generting response from OpenAI");
  }
});

app.get("/data", (req, res) => {
  res.json(data);
});

app.listen(PORT, console.log(`Server is running on port ${PORT}`));
