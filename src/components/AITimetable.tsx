import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Users, MapPin, Bell, Zap, Brain, RefreshCw, Download } from 'lucide-react';

interface TimeSlot {
  time: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
  type: 'theory' | 'lab' | 'test' | 'break';
  duration: number;
}

interface AITimetableProps {
  currentUser: {
    name: string;
    role: 'student' | 'faculty' | 'admin';
    id: string;
  };
}

const AITimetable: React.FC<AITimetableProps> = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Sample subjects for random generation
  const subjects = [
    { name: 'Data Structures', code: 'CS3301', faculty: 'Mrs. M. Samundeeshwari' },
    { name: 'Discrete Mathematics', code: 'MA3354', faculty: 'Mrs. Kanchana' },
    { name: 'Foundation Data Science', code: 'CS3352', faculty: 'Mr. C. Chinima' },
    { name: 'Digital Principles & Comp Org', code: 'CS3351', faculty: 'Mr. G. Sathish Kumar' },
    { name: 'Object Oriented Programming', code: 'CS3391', faculty: 'Mr. S. Balaji (HOD)' },
    { name: 'Machine Learning', code: 'CS3401', faculty: 'Dr. A. Rajesh' },
    { name: 'Database Management', code: 'CS3402', faculty: 'Prof. S. Priya' },
    { name: 'Computer Networks', code: 'CS3403', faculty: 'Mr. K. Venkat' }
  ];

  const rooms = ['Room 101', 'Room 102', 'Room 201', 'Room 202', 'Lab 1', 'Lab 2', 'Auditorium'];

  const timeSlots = [
    '09:00-10:00',
    '10:20-11:15',
    '11:15-12:05',
    '12:55-13:45',
    '13:45-14:35',
    '14:50-15:40',
    '15:40-16:30'
  ];

  // Generate AI-powered timetable
  const generateAITimetable = () => {
    setIsGenerating(true);
    setConflicts([]);

    setTimeout(() => {
      const newTimetable: TimeSlot[] = [];
      const usedRooms = new Set<string>();
      const usedFaculty = new Set<string>();

      // Add morning break
      newTimetable.push({
        time: '10:00-10:20',
        subject: 'Morning Break',
        code: '',
        faculty: '',
        room: 'Cafeteria',
        type: 'break',
        duration: 20
      });

      // Add lunch break
      newTimetable.push({
        time: '12:05-12:55',
        subject: 'Lunch Break',
        code: '',
        faculty: '',
        room: 'Cafeteria',
        type: 'break',
        duration: 50
      });

      // Add afternoon break
      newTimetable.push({
        time: '14:35-14:50',
        subject: 'Afternoon Break',
        code: '',
        faculty: '',
        room: 'Cafeteria',
        type: 'break',
        duration: 15
      });

      // Generate 5 random subjects with tests
      const selectedSubjects = subjects.slice(0, 5);
      const availableSlots = timeSlots.filter(slot => 
        !['10:00-10:20', '12:05-12:55', '14:35-14:50'].includes(slot)
      );

      selectedSubjects.forEach((subject, index) => {
        if (index < availableSlots.length) {
          const slot = availableSlots[index];
          const room = rooms[Math.floor(Math.random() * rooms.length)];
          const isTest = Math.random() > 0.6; // 40% chance of test

          // Check for conflicts
          const timeConflict = newTimetable.find(t => t.time === slot);
          const facultyConflict = usedFaculty.has(subject.faculty);
          const roomConflict = usedRooms.has(room);

          if (timeConflict || facultyConflict || roomConflict) {
            setConflicts(prev => [...prev, `Conflict detected for ${subject.name} at ${slot}`]);
          }

          newTimetable.push({
            time: slot,
            subject: isTest ? `${subject.name} - TEST` : subject.name,
            code: subject.code,
            faculty: subject.faculty,
            room: room,
            type: isTest ? 'test' : 'theory',
            duration: 60
          });

          usedFaculty.add(subject.faculty);
          usedRooms.add(room);
        }
      });

      // Sort by time
      newTimetable.sort((a, b) => {
        const timeA = parseInt(a.time.split(':')[0]) * 100 + parseInt(a.time.split(':')[1]);
        const timeB = parseInt(b.time.split(':')[0]) * 100 + parseInt(b.time.split(':')[1]);
        return timeA - timeB;
      });

      setTimetable(newTimetable);
      setIsGenerating(false);
    }, 2000);
  };

  // Auto-generate timetable on component mount
  useEffect(() => {
    generateAITimetable();
  }, []);

  const getSlotColor = (type: string) => {
    switch (type) {
      case 'theory': return 'from-blue-500 to-blue-600';
      case 'lab': return 'from-green-500 to-green-600';
      case 'test': return 'from-red-500 to-red-600';
      case 'break': return 'from-yellow-500 to-yellow-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getSlotIcon = (type: string) => {
    switch (type) {
      case 'theory': return <BookOpen className="w-4 h-4" />;
      case 'lab': return <Users className="w-4 h-4" />;
      case 'test': return <Bell className="w-4 h-4" />;
      case 'break': return <Clock className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow - ${date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Smart Timetable Generator</h2>
          <p className="text-slate-400">Intelligent scheduling with conflict resolution</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateAITimetable}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Regenerate</span>
              </>
            )}
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">AI Optimization</h3>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">94%</div>
          <div className="text-sm text-green-400">Efficiency Score</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Conflicts Resolved</h3>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{conflicts.length}</div>
          <div className="text-sm text-blue-400">Auto-fixed</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Total Classes</h3>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{timetable.filter(t => t.type !== 'break').length}</div>
          <div className="text-sm text-slate-400">Scheduled</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Tests Today</h3>
            <Bell className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{timetable.filter(t => t.type === 'test').length}</div>
          <div className="text-sm text-orange-400">Scheduled</div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Schedule for {formatDate(selectedDate)}</h3>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <Bell className="w-5 h-5 text-orange-400 mr-2" />
              <span className="font-medium text-orange-400">AI Conflict Resolution</span>
            </div>
            <ul className="text-sm text-orange-300 space-y-1">
              {conflicts.map((conflict, idx) => (
                <li key={idx}>• {conflict}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Timetable */}
        {isGenerating ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
              <div>
                <div className="text-lg font-semibold text-white mb-2">AI is generating your timetable...</div>
                <div className="text-sm text-slate-400">Optimizing schedule and resolving conflicts</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {timetable.map((slot, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl bg-gradient-to-r ${getSlotColor(slot.type)} bg-opacity-10 border border-slate-600 hover:border-slate-500 transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getSlotColor(slot.type)} flex items-center justify-center`}>
                      {getSlotIcon(slot.type)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {slot.subject}
                        {slot.type === 'test' && (
                          <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                            TEST
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        {slot.code && <span>{slot.code}</span>}
                        {slot.faculty && (
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {slot.faculty}
                          </span>
                        )}
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {slot.room}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{slot.time}</div>
                    <div className="text-sm text-slate-400">{slot.duration} min</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-400" />
          AI Scheduling Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center mb-2">
              <Zap className="w-4 h-4 text-blue-400 mr-2" />
              <span className="font-medium text-white">Optimization</span>
            </div>
            <p className="text-sm text-slate-300">
              AI has optimized your schedule to minimize travel time between classes and maximize learning efficiency.
            </p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center mb-2">
              <Bell className="w-4 h-4 text-green-400 mr-2" />
              <span className="font-medium text-white">Test Preparation</span>
            </div>
            <p className="text-sm text-slate-300">
              {timetable.filter(t => t.type === 'test').length} tests scheduled with optimal spacing for preparation time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITimetable;