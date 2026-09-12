import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types/Student';
import { getStudentData } from '../data/studentData';
import { buildStudentContext } from '../core/context/buildStudentContext';
import { generateRecommendations } from '../core/recommendation/recommendationEngine';
import { explainWhy } from '../core/recommendation/explanationEngine';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    role: 'student' | 'faculty' | 'admin';
    id: string;
  };
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `Hello ${currentUser.name}! I'm your Smart Campus AI assistant. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Show me today's timetable",
    "What's my next class?",
    "Who is teaching DS?",
    "Show my test marks",
    "What's my overall attendance?",
    "Show my subject-wise attendance",
    "What subjects am I taking?",
    "Show me Monday's schedule",
    "When is lunch break?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    const studentData = getStudentData(currentUser.id);

    // Concierge queries route to the real recommendation engine (Phase 17)
    // instead of a canned reply — same logic the dashboard's Next Best
    // Actions section uses, so the answer here always matches what's shown there.
    if (message.includes('next best action') || message.includes('what should i do') || message.includes('recommend')) {
      const context = buildStudentContext({ name: currentUser.name });
      const [top] = generateRecommendations(context, 1);
      if (!top) {
        return "I don't have a specific recommendation right now — check back after your next class or free period.";
      }
      return `${explainWhy(top)}\n\nYou can also see this in your Next Best Actions on the dashboard.`;
    }

    if (!studentData) {
      return "I don't have access to your student data. Please contact the administrator.";
    }

    // Timetable queries
    if (message.includes('timetable') || message.includes('schedule')) {
      const today = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = dayNames[today.getDay()];
      
      if (message.includes('today')) {
        const todaySchedule = studentData.timetable.schedule.find(day => day.day === currentDay);
        if (todaySchedule && currentDay !== 'Sunday' && currentDay !== 'Saturday') {
          let response = `📅 Today's Schedule (${currentDay}):\n\n`;
          todaySchedule.slots.forEach(slot => {
            if (slot.type === 'break') {
              response += `⏰ ${slot.time} - ${slot.subject}\n`;
            } else {
              response += `📚 ${slot.time} - ${slot.subject} (${slot.code})\n`;
              if (slot.faculty) response += `   👨‍🏫 ${slot.faculty}\n`;
            }
          });
          return response;
        } else {
          return currentDay === 'Sunday' || currentDay === 'Saturday' 
            ? "It's weekend! No classes today. Enjoy your day! 😊"
            : "No schedule available for today.";
        }
      }
      
      if (message.includes('monday')) {
        const mondaySchedule = studentData.timetable.schedule.find(day => day.day === 'Monday');
        if (mondaySchedule) {
          let response = "📅 Monday's Schedule:\n\n";
          mondaySchedule.slots.forEach(slot => {
            if (slot.type === 'break') {
              response += `⏰ ${slot.time} - ${slot.subject}\n`;
            } else {
              response += `📚 ${slot.time} - ${slot.subject} (${slot.code})\n`;
              if (slot.faculty) response += `   👨‍🏫 ${slot.faculty}\n`;
            }
          });
          return response;
        }
      }
      
      return "I can show you today's timetable or specific day schedules. Try asking 'Show me today's timetable' or 'Show me Monday's schedule'.";
    }

    // Next class queries
    if (message.includes('next class') || message.includes('next subject')) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert to HHMM format
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = dayNames[now.getDay()];
      
      const todaySchedule = studentData.timetable.schedule.find(day => day.day === currentDay);
      if (todaySchedule) {
        const upcomingClasses = todaySchedule.slots.filter(slot => {
          if (slot.type === 'break') return false;
          const slotTime = parseInt(slot.time.split('–')[0].replace(':', ''));
          return slotTime > currentTime;
        });
        
        if (upcomingClasses.length > 0) {
          const nextClass = upcomingClasses[0];
          return `🕐 Your next class is:\n\n📚 ${nextClass.subject} (${nextClass.code})\n⏰ Time: ${nextClass.time}\n👨‍🏫 Faculty: ${nextClass.faculty || 'TBA'}`;
        } else {
          return "No more classes today! You're done for the day. 🎉";
        }
      }
      
      return currentDay === 'Sunday' || currentDay === 'Saturday' 
        ? "It's weekend! No classes today."
        : "Unable to determine your next class.";
    }

    // Faculty queries
    if (message.includes('teaching') || message.includes('faculty') || message.includes('teacher')) {
      if (message.includes('data structures')) {
        return "📚 Data Structures (DS) is taught by Mrs. M. Samundeeshwari";
      }
      if (message.includes('foundation data science') || message.includes('fds')) {
        return "📚 Foundation Data Science (FDS) is taught by Mr. C. Chinima";
      }
      if (message.includes('dpco') || message.includes('digital principles')) {
        return "📚 Digital Principles & Computer Organization (DPCO) is taught by Mr. G. Sathish Kumar";
      }
      if (message.includes('oops') || message.includes('object oriented')) {
        return "📚 Object Oriented Programming (OOPS) is taught by Mr. S. Balaji (HOD)";
      }
      if (message.includes('discrete mathematics') || message.includes('dm')) {
        return "📚 Discrete Mathematics (DM) is taught by Mrs. Kanchana";
      }
      
      let response = "👨‍🏫 Your Faculty Members:\n\n";
      response += "• Mrs. M. Samundeeshwari - Data Structures (DS)\n";
      response += "• Mr. C. Chinima - Foundation Data Science (FDS)\n";
      response += "• Mr. G. Sathish Kumar - Digital Principles & Comp Org (DPCO)\n";
      response += "• Mr. S. Balaji (HOD) - Object Oriented Programming (OOPS)\n";
      response += "• Mrs. Kanchana - Discrete Mathematics (DM)\n";
      return response;
    }

    // Break time queries
    if (message.includes('break') || message.includes('lunch')) {
      if (message.includes('lunch')) {
        return `🍽️ Lunch Break: ${studentData.timetable.breaks.lunch}`;
      }
      let response = "⏰ Break Timings:\n\n";
      response += `🌅 Morning Break: ${studentData.timetable.breaks.morning}\n`;
      response += `🍽️ Lunch Break: ${studentData.timetable.breaks.lunch}\n`;
      response += `☕ Afternoon Break: ${studentData.timetable.breaks.afternoon}`;
      return response;
    }

    // Attendance queries
    if (message.includes('attendance') && message.includes('overall')) {
      return `Your overall attendance is ${studentData.overallAttendance}%. You're ${studentData.overallAttendance >= 75 ? 'meeting' : 'below'} the minimum 75% requirement.`;
    }

    if (message.includes('attendance') && (message.includes('subject') || message.includes('wise'))) {
      let response = "Here's your subject-wise attendance:\n\n";
      studentData.subjects.forEach(subject => {
        const status = subject.attendancePercentage >= 75 ? '✅' : '⚠️';
        response += `${status} ${subject.name} (${subject.code}): ${subject.attendancePercentage}%\n`;
      });
      return response;
    }

    if (message.includes('attendance') && message.includes('machine learning')) {
      return "I don't see Machine Learning in your current subjects. You're taking Data Structures (DS), Foundation Data Science (FDS), Digital Principles & Comp Org (DPCO), Object Oriented Programming (OOPS), and Discrete Mathematics (DM) this semester.";
    }

    // Subject queries
    if (message.includes('subjects') || message.includes('semester')) {
      let response = `You're currently in ${studentData.year}nd year, ${studentData.semester}rd semester of ${studentData.department} at ${studentData.college}.\n\nYour subjects this semester:\n\n`;
      
      const theorySubjects = studentData.subjects.filter(s => s.type === 'theory');
      const labSubjects = studentData.subjects.filter(s => s.type === 'lab');
      
      response += "📚 Theory Subjects:\n";
      theorySubjects.forEach(subject => {
        response += `• ${subject.name} (${subject.code})\n`;
      });
      
      response += "\n🔬 Lab Subjects:\n";
      labSubjects.forEach(subject => {
        response += `• ${subject.name} (${subject.code})\n`;
      });
      
      return response;
    }

    // Achievement queries
    if (message.includes('achievement') || message.includes('award') || message.includes('chess')) {
      if (studentData.achievements.length > 0) {
        let response = "🏆 Your achievements:\n\n";
        studentData.achievements.forEach(achievement => {
          response += `🥉 ${achievement.position} in ${achievement.activity}\n`;
          response += `Event: ${achievement.event}\n`;
          response += `Date: ${new Date(achievement.date).toLocaleDateString()}\n\n`;
        });
        return response;
      }
      return "You don't have any recorded achievements yet. Keep participating in activities!";
    }

    // Lab queries
    if (message.includes('lab') || message.includes('computer')) {
      let response = "🔬 Your subjects are primarily theory-based:\n\n";
      response += "• Monday: Data Structures (DS)\n";
      response += "• Tuesday: Foundation Data Science (FDS)\n";
      response += "• Wednesday: Digital Principles & Comp Org (DPCO)\n";
      response += "• Thursday: Object Oriented Programming (OOPS)\n";
      response += "• Friday: Discrete Mathematics (DM)\n\n";
      response += "📍 All classes are in Room 206, Kingston Engineering College";
      return response;
    }

    // Room and location queries
    if (message.includes('room') || message.includes('classroom')) {
      return `📍 Your classroom details:\n\n🏫 Room: ${studentData.timetable.room}\n🏛️ ${studentData.timetable.college}\n📍 ${studentData.timetable.location}`;
    }

    // Exam queries
    if (message.includes('exam') || message.includes('test')) {
      return "I don't have information about upcoming exams yet. Please check with your faculty or the academic calendar.";
    }

    // Default response
    return "I understand you're asking about campus-related information. I can help you with:\n\n• 📅 Timetable and schedule\n• 📊 Attendance records\n• 📚 Subject information\n• 👨‍🏫 Faculty details\n• 🏆 Your achievements\n• 📝 Test marks and results\n• ⏰ Break timings\n\nTry asking 'Show me today's timetable' or 'What's my next class'!";
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputText.trim();
    if (!text) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-slate-800 rounded-xl border border-slate-700 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
            <div className="text-xs text-green-400">● Online</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Questions */}
      <div className="p-4 border-b border-slate-700">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Quick Questions:</h4>
        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
          {quickQuestions.slice(0, 4).map((question, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(question)}
              className="text-left p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-xs text-slate-300 hover:text-white"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'ai' && (
                  <Bot className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                )}
                {message.sender === 'user' && (
                  <User className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                )}
                <div className="text-sm whitespace-pre-line">{message.text}</div>
              </div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-400" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;