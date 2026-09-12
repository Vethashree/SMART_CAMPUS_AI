import React, { useState } from 'react';
import { Calendar, Camera, BarChart3, Clock, CheckCircle, XCircle, AlertCircle, Star, Coffee } from 'lucide-react';
import { getStudentData } from '../data/studentData';
import { Subject } from '../types/Student';

interface SmartAttendanceProps {
  currentUser: {
    name: string;
    role: 'student' | 'faculty' | 'admin';
    id: string;
  };
}

const SmartAttendance: React.FC<SmartAttendanceProps> = ({ currentUser }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  
  const studentData = getStudentData(currentUser.id);

  if (!studentData) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400">No student data available</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'holiday': return 'bg-pink-500';
      case 'event': return 'bg-yellow-500';
      case 'future': return 'bg-white/20';
      default: return 'bg-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      case 'holiday': return <Coffee className="w-4 h-4" />;
      case 'event': return <Star className="w-4 h-4" />;
      case 'future': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'holiday': return 'Holiday';
      case 'event': return 'College Event';
      case 'future': return 'Future';
      default: return 'Unknown';
    }
  };

  const renderAttendanceCalendar = (subject: Subject) => {
    const today = new Date();
    // Get last 30 days of attendance
    const recentAttendance = subject.attendance
      .filter(record => {
        const recordDate = new Date(record.date);
        const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 30;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs text-slate-400 p-2 font-medium">
            {day}
          </div>
        ))}
        {recentAttendance.slice(-21).map((record, idx) => {
          const date = new Date(record.date);
          return (
            <div
              key={idx}
              className={`aspect-square rounded-lg ${getStatusColor(record.status)} flex items-center justify-center text-white text-xs font-medium relative group cursor-pointer`}
              title={`${date.toLocaleDateString()} - ${getStatusLabel(record.status)}`}
            >
              {date.getDate()}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {getStatusLabel(record.status)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Smart Attendance System</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'detailed'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Overall Attendance</h3>
            <BarChart3 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold mb-1">{studentData.overallAttendance}%</div>
          <div className={`text-sm ${studentData.overallAttendance >= 75 ? 'text-green-400' : 'text-red-400'}`}>
            {studentData.overallAttendance >= 75 ? 'Meeting requirement' : 'Below 75% requirement'}
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Total Subjects</h3>
            <Calendar className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold mb-1">{studentData.subjects.length}</div>
          <div className="text-sm text-blue-400">
            {studentData.subjects.filter(s => s.type === 'theory').length} Theory + {studentData.subjects.filter(s => s.type === 'lab').length} Labs
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">At Risk Subjects</h3>
            <AlertCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold mb-1">
            {studentData.subjects.filter(s => s.attendancePercentage < 75).length}
          </div>
          <div className="text-sm text-orange-400">Need attention</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Recognition System</h3>
            <Camera className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold mb-1">Active</div>
          <div className="text-sm text-green-400">Face + Voice enabled</div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Attendance Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { status: 'present', label: 'Present', description: 'Attended class' },
            { status: 'absent', label: 'Absent', description: 'Missed class' },
            { status: 'event', label: 'College Event', description: 'College event day' },
            { status: 'holiday', label: 'Holiday', description: 'Official holiday' },
            { status: 'future', label: 'Future', description: 'Upcoming dates' }
          ].map(item => (
            <div key={item.status} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${getStatusColor(item.status)} flex items-center justify-center`}>
                {getStatusIcon(item.status)}
              </div>
              <span className="text-sm text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {viewMode === 'overview' ? (
        /* Subject Overview */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentData.subjects.map((subject) => (
            <div key={subject.code} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
                  <p className="text-sm text-slate-400">{subject.code} • {subject.type.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${subject.attendancePercentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                    {subject.attendancePercentage}%
                  </div>
                  <div className="text-xs text-slate-400">Attendance</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    subject.attendancePercentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${subject.attendancePercentage}%` }}
                ></div>
              </div>

              {/* Recent Attendance */}
              <div className="grid grid-cols-7 gap-1">
                {subject.attendance.slice(-7).map((record, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square rounded ${getStatusColor(record.status)} flex items-center justify-center text-white text-xs`}
                    title={`${new Date(record.date).toLocaleDateString()} - ${getStatusLabel(record.status)}`}
                  >
                    {getStatusIcon(record.status)}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedSubject(subject.code);
                  setViewMode('detailed');
                }}
                className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed View */
        <div className="space-y-6">
          {/* Subject Selector */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Choose a subject...</option>
              {studentData.subjects.map(subject => (
                <option key={subject.code} value={subject.code}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          {selectedSubject && (
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              {(() => {
                const subject = studentData.subjects.find(s => s.code === selectedSubject);
                if (!subject) return null;

                return (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">{subject.name}</h3>
                        <p className="text-slate-400">{subject.code} • {subject.type.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${subject.attendancePercentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                          {subject.attendancePercentage}%
                        </div>
                        <div className="text-sm text-slate-400">Attendance Rate</div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-white mb-4">Attendance Calendar (Last 30 Days)</h4>
                    {renderAttendanceCalendar(subject)}

                    {/* Attendance Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                      {[
                        { status: 'present', count: subject.attendance.filter(r => r.status === 'present').length },
                        { status: 'absent', count: subject.attendance.filter(r => r.status === 'absent').length },
                        { status: 'event', count: subject.attendance.filter(r => r.status === 'event').length },
                        { status: 'holiday', count: subject.attendance.filter(r => r.status === 'holiday').length },
                        { status: 'future', count: subject.attendance.filter(r => r.status === 'future').length }
                      ].map(item => (
                        <div key={item.status} className="text-center">
                          <div className={`w-12 h-12 rounded-lg ${getStatusColor(item.status)} flex items-center justify-center mx-auto mb-2`}>
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="text-lg font-bold text-white">{item.count}</div>
                          <div className="text-xs text-slate-400">{getStatusLabel(item.status)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartAttendance;