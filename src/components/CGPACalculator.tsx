import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  BookOpen,
  TrendingUp,
  BarChart3,
  Target,
  Star,
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  Brain,
  Trophy,
  GraduationCap
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string;
  gradePoints: number;
  semester: number;
}

interface SemesterData {
  semester: number;
  subjects: Subject[];
  sgpa: number;
  totalCredits: number;
}

interface CGPACalculatorProps {
  currentUser: {
    name: string;
    role: 'student' | 'faculty' | 'admin';
    id: string;
  };
}

const CGPACalculator: React.FC<CGPACalculatorProps> = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [currentSemester, setCurrentSemester] = useState(1);
  const [cgpa, setCgpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [targetCGPA, setTargetCGPA] = useState(8.5);
  const [showPrediction, setShowPrediction] = useState(false);

  const gradeScale = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'RA': 0,
    'SA': 0,
    'W': 0
  };

  const gradeColors = {
    'O': 'bg-green-500 text-white',
    'A+': 'bg-green-400 text-white',
    'A': 'bg-blue-500 text-white',
    'B+': 'bg-blue-400 text-white',
    'B': 'bg-yellow-500 text-white',
    'C': 'bg-orange-500 text-white',
    'RA': 'bg-red-500 text-white',
    'SA': 'bg-red-400 text-white',
    'W': 'bg-gray-500 text-white'
  };

  // Initialize with sample data for current user
  useEffect(() => {
    const sampleData: SemesterData[] = [
      {
        semester: 1,
        subjects: [
          { id: '1', name: 'Engineering Mathematics I', credits: 4, grade: 'A+', gradePoints: 9, semester: 1 },
          { id: '2', name: 'Engineering Physics', credits: 3, grade: 'A', gradePoints: 8, semester: 1 },
          { id: '3', name: 'Engineering Chemistry', credits: 3, grade: 'A+', gradePoints: 9, semester: 1 },
          { id: '4', name: 'Problem Solving & Python', credits: 3, grade: 'O', gradePoints: 10, semester: 1 },
          { id: '5', name: 'Engineering Graphics', credits: 4, grade: 'A', gradePoints: 8, semester: 1 }
        ],
        sgpa: 0,
        totalCredits: 0
      },
      {
        semester: 2,
        subjects: [
          { id: '6', name: 'Engineering Mathematics II', credits: 4, grade: 'A', gradePoints: 8, semester: 2 },
          { id: '7', name: 'Physics & Chemistry Lab', credits: 2, grade: 'A+', gradePoints: 9, semester: 2 },
          { id: '8', name: 'Programming in C', credits: 3, grade: 'A+', gradePoints: 9, semester: 2 },
          { id: '9', name: 'Engineering Mechanics', credits: 4, grade: 'A', gradePoints: 8, semester: 2 },
          { id: '10', name: 'Environmental Science', credits: 3, grade: 'A+', gradePoints: 9, semester: 2 }
        ],
        sgpa: 0,
        totalCredits: 0
      },
      {
        semester: 3,
        subjects: [
          { id: '11', name: 'Data Structures', credits: 4, grade: 'A+', gradePoints: 9, semester: 3 },
          { id: '12', name: 'Discrete Mathematics', credits: 4, grade: 'A', gradePoints: 8, semester: 3 },
          { id: '13', name: 'Digital Principles & Computer Organization', credits: 4, grade: 'A+', gradePoints: 9, semester: 3 },
          { id: '14', name: 'Object Oriented Programming', credits: 3, grade: 'A', gradePoints: 8, semester: 3 },
          { id: '15', name: 'Foundation Data Science', credits: 3, grade: 'A+', gradePoints: 9, semester: 3 }
        ],
        sgpa: 0,
        totalCredits: 0
      }
    ];

    setSemesters(sampleData);
    setCurrentSemester(3);
  }, []);

  // Calculate SGPA for a semester
  const calculateSGPA = (subjects: Subject[]): number => {
    if (subjects.length === 0) return 0;
    
    const totalGradePoints = subjects.reduce((sum, subject) => sum + (subject.gradePoints * subject.credits), 0);
    const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
    
    return totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0;
  };

  // Calculate CGPA
  const calculateCGPA = (): void => {
    let totalGradePoints = 0;
    let totalCreds = 0;

    const updatedSemesters = semesters.map(semester => {
      const sgpa = calculateSGPA(semester.subjects);
      const semesterCredits = semester.subjects.reduce((sum, subject) => sum + subject.credits, 0);
      
      totalGradePoints += semester.subjects.reduce((sum, subject) => sum + (subject.gradePoints * subject.credits), 0);
      totalCreds += semesterCredits;

      return {
        ...semester,
        sgpa,
        totalCredits: semesterCredits
      };
    });

    setSemesters(updatedSemesters);
    setCgpa(totalCreds > 0 ? parseFloat((totalGradePoints / totalCreds).toFixed(2)) : 0);
    setTotalCredits(totalCreds);
  };

  useEffect(() => {
    calculateCGPA();
  }, [semesters]);

  // Add new subject
  const addSubject = (semesterNum: number) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      credits: 3,
      grade: 'A',
      gradePoints: 8,
      semester: semesterNum
    };

    setSemesters(prev => prev.map(sem => 
      sem.semester === semesterNum 
        ? { ...sem, subjects: [...sem.subjects, newSubject] }
        : sem
    ));
  };

  // Remove subject
  const removeSubject = (semesterNum: number, subjectId: string) => {
    setSemesters(prev => prev.map(sem => 
      sem.semester === semesterNum 
        ? { ...sem, subjects: sem.subjects.filter(sub => sub.id !== subjectId) }
        : sem
    ));
  };

  // Update subject
  const updateSubject = (semesterNum: number, subjectId: string, field: keyof Subject, value: string | number) => {
    setSemesters(prev => prev.map(sem => 
      sem.semester === semesterNum 
        ? {
            ...sem,
            subjects: sem.subjects.map(sub => 
              sub.id === subjectId 
                ? { 
                    ...sub, 
                    [field]: value,
                    gradePoints: field === 'grade' ? gradeScale[value as keyof typeof gradeScale] : sub.gradePoints
                  }
                : sub
            )
          }
        : sem
    ));
  };

  // Add new semester
  const addSemester = () => {
    const newSemesterNum = Math.max(...semesters.map(s => s.semester)) + 1;
    const newSemester: SemesterData = {
      semester: newSemesterNum,
      subjects: [],
      sgpa: 0,
      totalCredits: 0
    };
    setSemesters(prev => [...prev, newSemester]);
    setCurrentSemester(newSemesterNum);
  };

  // Get grade classification
  const getGradeClassification = (cgpa: number): { label: string; color: string; description: string } => {
    if (cgpa >= 9.5) return { label: 'Outstanding', color: 'text-green-400', description: 'Exceptional Performance' };
    if (cgpa >= 8.5) return { label: 'Excellent', color: 'text-green-300', description: 'Very Good Performance' };
    if (cgpa >= 7.5) return { label: 'Very Good', color: 'text-blue-400', description: 'Good Performance' };
    if (cgpa >= 6.5) return { label: 'Good', color: 'text-yellow-400', description: 'Satisfactory Performance' };
    if (cgpa >= 5.5) return { label: 'Average', color: 'text-orange-400', description: 'Below Average Performance' };
    return { label: 'Poor', color: 'text-red-400', description: 'Needs Improvement' };
  };

  // Predict required grades for target CGPA
  const predictRequiredGrades = () => {
    const currentTotalGradePoints = semesters.reduce((total, sem) => 
      total + sem.subjects.reduce((sum, sub) => sum + (sub.gradePoints * sub.credits), 0), 0
    );
    
    const remainingSemesters = 8 - semesters.length; // Assuming 8 semester program
    const avgCreditsPerSemester = 18; // Average credits per semester
    const remainingCredits = remainingSemesters * avgCreditsPerSemester;
    
    const requiredTotalGradePoints = targetCGPA * (totalCredits + remainingCredits);
    const requiredGradePoints = requiredTotalGradePoints - currentTotalGradePoints;
    const requiredAvgGradePoints = remainingCredits > 0 ? requiredGradePoints / remainingCredits : 0;

    return {
      requiredAvgGradePoints: Math.max(0, requiredAvgGradePoints),
      remainingSemesters,
      remainingCredits,
      isAchievable: requiredAvgGradePoints <= 10 && requiredAvgGradePoints >= 0
    };
  };

  const classification = getGradeClassification(cgpa);
  const prediction = predictRequiredGrades();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">CGPA Calculator</h2>
          <p className="text-slate-400">Calculate and track your academic performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPrediction(!showPrediction)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Brain className="w-4 h-4" />
            <span>AI Prediction</span>
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* CGPA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Current CGPA</h3>
            <Calculator className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{cgpa.toFixed(2)}</div>
          <div className={`text-sm ${classification.color}`}>{classification.label}</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Total Credits</h3>
            <BookOpen className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{totalCredits}</div>
          <div className="text-sm text-blue-400">Completed</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Semesters</h3>
            <GraduationCap className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{semesters.length}</div>
          <div className="text-sm text-green-400">Completed</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Best SGPA</h3>
            <Trophy className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {Math.max(...semesters.map(s => s.sgpa)).toFixed(2)}
          </div>
          <div className="text-sm text-yellow-400">Highest</div>
        </div>
      </div>

      {/* AI Prediction Panel */}
      {showPrediction && (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-400" />
            AI CGPA Prediction & Target Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target CGPA</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(parseFloat(e.target.value))}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                prediction.isAchievable 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <div className="flex items-center mb-2">
                  {prediction.isAchievable ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  )}
                  <span className={`font-medium ${
                    prediction.isAchievable ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {prediction.isAchievable ? 'Target Achievable' : 'Target Not Achievable'}
                  </span>
                </div>
                <div className="text-sm text-slate-300">
                  Required average grade points: <strong>{prediction.requiredAvgGradePoints.toFixed(2)}</strong>
                </div>
                <div className="text-sm text-slate-400">
                  Remaining semesters: {prediction.remainingSemesters} | Credits: {prediction.remainingCredits}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Scale Reference */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Grade Scale Reference</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(gradeScale).map(([grade, points]) => (
            <div key={grade} className={`px-3 py-1 rounded-full text-xs font-medium ${gradeColors[grade as keyof typeof gradeColors]}`}>
              {grade} = {points}
            </div>
          ))}
        </div>
      </div>

      {/* Semester Tabs */}
      <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700">
        <div className="flex space-x-2 overflow-x-auto">
          {semesters.map((semester) => (
            <button
              key={semester.semester}
              onClick={() => setCurrentSemester(semester.semester)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                currentSemester === semester.semester
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>Semester {semester.semester}</span>
              <span className="text-xs opacity-75">SGPA: {semester.sgpa.toFixed(2)}</span>
            </button>
          ))}
          <button
            onClick={addSemester}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Semester</span>
          </button>
        </div>
      </div>

      {/* Current Semester Details */}
      {semesters.find(s => s.semester === currentSemester) && (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Semester {currentSemester}</h3>
              <p className="text-slate-400">
                SGPA: <span className="text-white font-medium">
                  {semesters.find(s => s.semester === currentSemester)?.sgpa.toFixed(2)}
                </span> | 
                Credits: <span className="text-white font-medium">
                  {semesters.find(s => s.semester === currentSemester)?.totalCredits}
                </span>
              </p>
            </div>
            <button
              onClick={() => addSubject(currentSemester)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="space-y-4">
            {semesters.find(s => s.semester === currentSemester)?.subjects.map((subject) => (
              <div key={subject.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={subject.name}
                      onChange={(e) => updateSubject(currentSemester, subject.id, 'name', e.target.value)}
                      placeholder="Subject Name"
                      className="w-full bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none text-sm"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={subject.credits}
                      onChange={(e) => updateSubject(currentSemester, subject.id, 'credits', parseInt(e.target.value))}
                      className="w-full bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none text-sm"
                    />
                    <div className="text-xs text-slate-400 mt-1">Credits</div>
                  </div>
                  
                  <div>
                    <select
                      value={subject.grade}
                      onChange={(e) => updateSubject(currentSemester, subject.id, 'grade', e.target.value)}
                      className="w-full bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none text-sm"
                    >
                      {Object.keys(gradeScale).map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                    <div className="text-xs text-slate-400 mt-1">Grade ({subject.gradePoints} pts)</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{(subject.gradePoints * subject.credits).toFixed(1)}</div>
                      <div className="text-xs text-slate-400">Grade Points</div>
                    </div>
                    <button
                      onClick={() => removeSubject(currentSemester, subject.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
            Semester-wise Performance
          </h3>
          <div className="space-y-3">
            {semesters.map((semester) => (
              <div key={semester.semester} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Semester {semester.semester}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        semester.sgpa >= 9 ? 'bg-green-500' :
                        semester.sgpa >= 8 ? 'bg-blue-500' :
                        semester.sgpa >= 7 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(semester.sgpa / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-white font-medium w-12">{semester.sgpa.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-400" />
            Performance Insights
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center mb-1">
                <Info className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-sm font-medium text-blue-400">Current Status</span>
              </div>
              <p className="text-sm text-slate-300">{classification.description}</p>
            </div>
            
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center mb-1">
                <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-sm font-medium text-green-400">Improvement Tip</span>
              </div>
              <p className="text-sm text-slate-300">
                {cgpa < 8 
                  ? "Focus on scoring A+ grades in upcoming subjects to boost your CGPA"
                  : "Maintain your excellent performance to stay in the top tier"
                }
              </p>
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center mb-1">
                <Star className="w-4 h-4 text-purple-400 mr-2" />
                <span className="text-sm font-medium text-purple-400">Achievement</span>
              </div>
              <p className="text-sm text-slate-300">
                You've completed {totalCredits} credits with a {classification.label.toLowerCase()} performance!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGPACalculator;