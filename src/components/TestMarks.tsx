import React, { useState } from 'react';
import { FileText, Award, Calendar, User, TrendingUp, Download, Bell } from 'lucide-react';
import { getTestMarks } from '../data/studentData';

interface TestMarksProps {
  currentUser: {
    name: string;
    role: 'student' | 'faculty' | 'admin';
    id: string;
  };
}

const TestMarks: React.FC<TestMarksProps> = ({ currentUser }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const testMarks = getTestMarks(currentUser.id);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-400 bg-green-400/10';
      case 'A': return 'text-green-300 bg-green-300/10';
      case 'B+': return 'text-blue-400 bg-blue-400/10';
      case 'B': return 'text-blue-300 bg-blue-300/10';
      case 'C+': return 'text-yellow-400 bg-yellow-400/10';
      case 'C': return 'text-yellow-300 bg-yellow-300/10';
      default: return 'text-red-400 bg-red-400/10';
    }
  };

  const getPercentage = (obtained: number, max: number) => {
    return Math.round((obtained / max) * 100);
  };

  const filteredMarks = selectedSubject === 'all' 
    ? testMarks 
    : testMarks.filter(mark => mark.subjectCode === selectedSubject);

  const subjects = [...new Set(testMarks.map(mark => mark.subjectCode))];

  const averagePercentage = testMarks.length > 0 
    ? Math.round(testMarks.reduce((acc, mark) => acc + getPercentage(mark.obtainedMarks, mark.maxMarks), 0) / testMarks.length)
    : 0;

  const totalTests = testMarks.length;
  const passedTests = testMarks.filter(mark => getPercentage(mark.obtainedMarks, mark.maxMarks) >= 50).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Test Marks & Results</h2>
          <p className="text-slate-400">View your test scores and performance analytics</p>
        </div>
        <button className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Results</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Average Score</h3>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{averagePercentage}%</div>
          <div className={`text-sm ${averagePercentage >= 75 ? 'text-green-400' : averagePercentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            {averagePercentage >= 75 ? 'Excellent' : averagePercentage >= 60 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Total Tests</h3>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{totalTests}</div>
          <div className="text-sm text-blue-400">Completed</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Pass Rate</h3>
            <Award className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%</div>
          <div className="text-sm text-green-400">{passedTests}/{totalTests} passed</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Latest Update</h3>
            <Bell className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">Today</div>
          <div className="text-sm text-purple-400">New marks uploaded</div>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-300">Filter by Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {filteredMarks.length === 0 ? (
          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Test Results</h3>
            <p className="text-slate-400">No test marks available for the selected criteria.</p>
          </div>
        ) : (
          filteredMarks.map((mark) => (
            <div key={mark.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{mark.testName}</h3>
                    <p className="text-sm text-slate-400">{mark.subject} ({mark.subjectCode})</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(mark.grade)}`}>
                    Grade {mark.grade}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{mark.obtainedMarks}</div>
                  <div className="text-sm text-slate-400">Marks Obtained</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{mark.maxMarks}</div>
                  <div className="text-sm text-slate-400">Total Marks</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{getPercentage(mark.obtainedMarks, mark.maxMarks)}%</div>
                  <div className="text-sm text-slate-400">Percentage</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{mark.grade}</div>
                  <div className="text-sm text-slate-400">Grade</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getPercentage(mark.obtainedMarks, mark.maxMarks) >= 75 
                      ? 'bg-green-500' 
                      : getPercentage(mark.obtainedMarks, mark.maxMarks) >= 60 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${getPercentage(mark.obtainedMarks, mark.maxMarks)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Test Date: {new Date(mark.testDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {mark.uploadedBy}
                  </span>
                </div>
                <span>Uploaded: {new Date(mark.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Performance Analytics */}
      {testMarks.length > 0 && (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Performance Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Subject-wise Performance</h4>
              <div className="space-y-3">
                {subjects.map(subject => {
                  const subjectMarks = testMarks.filter(mark => mark.subjectCode === subject);
                  const subjectAvg = Math.round(
                    subjectMarks.reduce((acc, mark) => acc + getPercentage(mark.obtainedMarks, mark.maxMarks), 0) / subjectMarks.length
                  );
                  return (
                    <div key={subject} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{subject}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              subjectAvg >= 75 ? 'bg-green-500' : subjectAvg >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${subjectAvg}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white font-medium w-12">{subjectAvg}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Grade Distribution</h4>
              <div className="space-y-2">
                {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'].map(grade => {
                  const count = testMarks.filter(mark => mark.grade === grade).length;
                  const percentage = totalTests > 0 ? Math.round((count / totalTests) * 100) : 0;
                  return (
                    <div key={grade} className="flex items-center justify-between">
                      <span className={`text-sm px-2 py-1 rounded ${getGradeColor(grade)}`}>
                        Grade {grade}
                      </span>
                      <span className="text-sm text-slate-300">{count} tests ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestMarks;