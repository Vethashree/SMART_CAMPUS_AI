import React, { useState, useEffect } from 'react';
import {
  Brain,
  Target,
  TrendingUp,
  Code,
  Palette,
  Gamepad2,
  Shield,
  Smartphone,
  Globe,
  Briefcase,
  Star,
  CheckCircle,
  Award,
  Users,
  Zap,
  ArrowRight,
  Download,
  Share,
  RefreshCw,
  Lightbulb,
  BarChart3,
  Map,
  Rocket
} from 'lucide-react';
interface CareerMatch {
  career: string;
  matchPercentage: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  demandLevel: 'High' | 'Medium' | 'Growing';
  salaryRange: string;
  companies: string[];
  skills: {
    current: string[];
    toImprove: string[];
    new: string[];
  };
  roadmap: RoadmapStep[];
  projects: string[];
  certifications: string[];
}

interface RoadmapStep {
  phase: string;
  duration: string;
  tasks: string[];
  priority: 'High' | 'Medium' | 'Low';
}

interface SkillAnalysis {
  technical: { skill: string; level: number; trend: 'up' | 'down' | 'stable' }[];
  creative: { skill: string; level: number; trend: 'up' | 'down' | 'stable' }[];
  analytical: { skill: string; level: number; trend: 'up' | 'down' | 'stable' }[];
  communication: { skill: string; level: number; trend: 'up' | 'down' | 'stable' }[];
}

interface CareerPredictionProps {
  currentUser: {
    name: string;
    role: 'student' | 'faculty' | 'admin';
    id: string;
  };
}

const CareerPrediction: React.FC<CareerPredictionProps> = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'roadmap' | 'skills'>('overview');
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [careerMatches, setCareerMatches] = useState<CareerMatch[]>([]);
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis | null>(null);

  // AI Career Analysis based on student data
  const analyzeCareerPaths = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // Simulate AI analysis based on student performance and subjects
      const matches: CareerMatch[] = [
        {
          career: 'Game Design & Development',
          matchPercentage: 94,
          description: 'Perfect blend of technical programming skills and creative design thinking',
          icon: Gamepad2,
          color: 'from-purple-500 to-pink-600',
          demandLevel: 'High',
          salaryRange: '₹8-25 LPA',
          companies: ['Ubisoft', 'EA Games', 'Sony Interactive', 'Rockstar', 'Epic Games', 'Unity Technologies'],
          skills: {
            current: ['Programming Logic', 'Problem Solving', 'Mathematical Thinking', 'Creative Design'],
            toImprove: ['C++ Programming', 'Unity/C#', 'Graphics Programming', 'UI/UX Design'],
            new: ['Blender 3D', 'Game Physics', 'AI for Games', 'VR/AR Development']
          },
          roadmap: [
            {
              phase: 'Foundation (Months 1-3)',
              duration: '3 months',
              tasks: [
                'Master C++ fundamentals and OOP concepts',
                'Learn Unity game engine basics',
                'Complete 2D game development tutorial',
                'Study game design principles and mechanics'
              ],
              priority: 'High'
            },
            {
              phase: 'Skill Building (Months 4-8)',
              duration: '5 months',
              tasks: [
                'Advanced Unity features and scripting',
                'Learn Blender for 3D modeling and animation',
                'Study graphics programming and shaders',
                'Create 3-4 mini-games with different genres'
              ],
              priority: 'High'
            },
            {
              phase: 'Specialization (Months 9-12)',
              duration: '4 months',
              tasks: [
                'Choose specialization (AI, Graphics, VR/AR)',
                'Build a complete game project',
                'Learn advanced mathematics for graphics',
                'Study game AI and procedural generation'
              ],
              priority: 'Medium'
            },
            {
              phase: 'Portfolio & Career (Months 13-18)',
              duration: '6 months',
              tasks: [
                'Create professional portfolio website',
                'Publish games on Steam/mobile stores',
                'Apply for internships at game studios',
                'Participate in game jams and competitions'
              ],
              priority: 'High'
            }
          ],
          projects: [
            '2D Platformer Game (Beginner)',
            '3D Adventure Game (Intermediate)',
            'VR Experience Demo (Advanced)',
            'AI-Powered Strategy Game (Expert)',
            'Mobile Game with Monetization'
          ],
          certifications: [
            'Unity Certified Developer',
            'Unreal Engine Certification',
            'Google VR Developer',
            'Microsoft Mixed Reality'
          ]
        },
        {
          career: 'Software Development',
          matchPercentage: 89,
          description: 'Strong foundation in programming and logical problem-solving abilities',
          icon: Code,
          color: 'from-blue-500 to-cyan-600',
          demandLevel: 'High',
          salaryRange: '₹6-30 LPA',
          companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Spotify'],
          skills: {
            current: ['Programming Fundamentals', 'Data Structures', 'Problem Solving', 'Logical Thinking'],
            toImprove: ['Advanced Algorithms', 'System Design', 'Database Management', 'Web Technologies'],
            new: ['Cloud Computing', 'DevOps', 'Machine Learning', 'Microservices Architecture']
          },
          roadmap: [
            {
              phase: 'Core Development (Months 1-4)',
              duration: '4 months',
              tasks: [
                'Master advanced data structures and algorithms',
                'Learn full-stack web development (React, Node.js)',
                'Practice coding on LeetCode and HackerRank',
                'Build 3-4 web applications with different tech stacks'
              ],
              priority: 'High'
            },
            {
              phase: 'Specialization (Months 5-10)',
              duration: '6 months',
              tasks: [
                'Choose specialization (Frontend, Backend, Mobile, DevOps)',
                'Learn cloud platforms (AWS, Azure, GCP)',
                'Study system design and scalability',
                'Contribute to open-source projects'
              ],
              priority: 'High'
            },
            {
              phase: 'Advanced Skills (Months 11-15)',
              duration: '5 months',
              tasks: [
                'Learn containerization (Docker, Kubernetes)',
                'Study microservices and distributed systems',
                'Practice system design interviews',
                'Build scalable applications with CI/CD'
              ],
              priority: 'Medium'
            },
            {
              phase: 'Career Preparation (Months 16-18)',
              duration: '3 months',
              tasks: [
                'Prepare for technical interviews',
                'Build impressive GitHub portfolio',
                'Apply to top tech companies',
                'Network with industry professionals'
              ],
              priority: 'High'
            }
          ],
          projects: [
            'E-commerce Web Application',
            'Real-time Chat Application',
            'Task Management System',
            'Social Media Platform',
            'Microservices-based API'
          ],
          certifications: [
            'AWS Solutions Architect',
            'Google Cloud Professional',
            'Microsoft Azure Developer',
            'Oracle Java Certification'
          ]
        },
        {
          career: 'Data Science & AI',
          matchPercentage: 87,
          description: 'Excellent mathematical foundation and analytical thinking capabilities',
          icon: Brain,
          color: 'from-green-500 to-teal-600',
          demandLevel: 'Growing',
          salaryRange: '₹8-35 LPA',
          companies: ['Google AI', 'OpenAI', 'DeepMind', 'NVIDIA', 'Tesla', 'IBM Watson'],
          skills: {
            current: ['Mathematics', 'Statistical Thinking', 'Programming Logic', 'Data Analysis'],
            toImprove: ['Python/R Programming', 'Machine Learning', 'Deep Learning', 'Data Visualization'],
            new: ['Neural Networks', 'Computer Vision', 'NLP', 'Big Data Technologies']
          },
          roadmap: [
            {
              phase: 'Foundation (Months 1-4)',
              duration: '4 months',
              tasks: [
                'Master Python programming and libraries (NumPy, Pandas)',
                'Learn statistics and probability theory',
                'Study data visualization (Matplotlib, Seaborn)',
                'Complete online courses on machine learning basics'
              ],
              priority: 'High'
            },
            {
              phase: 'Machine Learning (Months 5-9)',
              duration: '5 months',
              tasks: [
                'Study supervised and unsupervised learning',
                'Learn scikit-learn and TensorFlow/PyTorch',
                'Practice on Kaggle competitions',
                'Build 5-6 ML projects with real datasets'
              ],
              priority: 'High'
            },
            {
              phase: 'Deep Learning (Months 10-14)',
              duration: '5 months',
              tasks: [
                'Study neural networks and deep learning',
                'Learn computer vision and NLP techniques',
                'Work with big data tools (Spark, Hadoop)',
                'Build advanced AI applications'
              ],
              priority: 'Medium'
            },
            {
              phase: 'Specialization (Months 15-18)',
              duration: '4 months',
              tasks: [
                'Choose specialization (CV, NLP, Robotics, etc.)',
                'Contribute to AI research projects',
                'Build portfolio of AI applications',
                'Apply for AI/ML engineer positions'
              ],
              priority: 'High'
            }
          ],
          projects: [
            'Predictive Analytics Dashboard',
            'Computer Vision Image Classifier',
            'Natural Language Processing Chatbot',
            'Recommendation System',
            'Time Series Forecasting Model'
          ],
          certifications: [
            'Google AI/ML Certification',
            'AWS Machine Learning',
            'TensorFlow Developer',
            'Microsoft Azure AI'
          ]
        },
        {
          career: 'Cybersecurity Specialist',
          matchPercentage: 82,
          description: 'Strong analytical skills and attention to detail for security systems',
          icon: Shield,
          color: 'from-red-500 to-orange-600',
          demandLevel: 'High',
          salaryRange: '₹7-28 LPA',
          companies: ['Cisco', 'Palo Alto Networks', 'CrowdStrike', 'FireEye', 'Symantec', 'Check Point'],
          skills: {
            current: ['Logical Thinking', 'Problem Solving', 'System Understanding', 'Attention to Detail'],
            toImprove: ['Network Security', 'Ethical Hacking', 'Cryptography', 'Security Frameworks'],
            new: ['Penetration Testing', 'Incident Response', 'Forensics', 'Cloud Security']
          },
          roadmap: [
            {
              phase: 'Security Fundamentals (Months 1-3)',
              duration: '3 months',
              tasks: [
                'Learn networking fundamentals and protocols',
                'Study operating systems security (Linux, Windows)',
                'Understand cryptography basics',
                'Get familiar with security frameworks (NIST, ISO 27001)'
              ],
              priority: 'High'
            },
            {
              phase: 'Ethical Hacking (Months 4-8)',
              duration: '5 months',
              tasks: [
                'Learn penetration testing methodologies',
                'Practice on platforms like HackTheBox, TryHackMe',
                'Study web application security (OWASP Top 10)',
                'Learn security tools (Nmap, Metasploit, Burp Suite)'
              ],
              priority: 'High'
            },
            {
              phase: 'Specialization (Months 9-12)',
              duration: '4 months',
              tasks: [
                'Choose specialization (Network, Web, Mobile, Cloud)',
                'Study incident response and forensics',
                'Learn compliance and risk management',
                'Practice real-world security scenarios'
              ],
              priority: 'Medium'
            },
            {
              phase: 'Certification & Career (Months 13-18)',
              duration: '6 months',
              tasks: [
                'Prepare for security certifications',
                'Build home lab for practice',
                'Participate in bug bounty programs',
                'Apply for cybersecurity positions'
              ],
              priority: 'High'
            }
          ],
          projects: [
            'Network Security Assessment',
            'Web Application Penetration Test',
            'Malware Analysis Lab',
            'Security Incident Response Plan',
            'Cloud Security Architecture'
          ],
          certifications: [
            'Certified Ethical Hacker (CEH)',
            'CISSP',
            'CompTIA Security+',
            'OSCP'
          ]
        },
        {
          career: 'Mobile App Development',
          matchPercentage: 78,
          description: 'Good programming foundation with potential for mobile platform expertise',
          icon: Smartphone,
          color: 'from-indigo-500 to-purple-600',
          demandLevel: 'High',
          salaryRange: '₹5-22 LPA',
          companies: ['Google', 'Apple', 'Uber', 'Swiggy', 'Paytm', 'WhatsApp'],
          skills: {
            current: ['Programming Logic', 'Problem Solving', 'UI Understanding', 'User Experience Basics'],
            toImprove: ['Mobile Development Frameworks', 'Platform-specific Languages', 'App Store Guidelines', 'Performance Optimization'],
            new: ['React Native/Flutter', 'Swift/Kotlin', 'Mobile UI/UX', 'App Analytics']
          },
          roadmap: [
            {
              phase: 'Mobile Basics (Months 1-3)',
              duration: '3 months',
              tasks: [
                'Choose platform (iOS, Android, or Cross-platform)',
                'Learn mobile development fundamentals',
                'Study mobile UI/UX design principles',
                'Build first simple mobile app'
              ],
              priority: 'High'
            },
            {
              phase: 'Platform Mastery (Months 4-8)',
              duration: '5 months',
              tasks: [
                'Master chosen framework (React Native, Flutter, or Native)',
                'Learn mobile-specific features (GPS, Camera, Sensors)',
                'Study app store optimization and guidelines',
                'Build 3-4 feature-rich mobile applications'
              ],
              priority: 'High'
            },
            {
              phase: 'Advanced Features (Months 9-12)',
              duration: '4 months',
              tasks: [
                'Learn backend integration and APIs',
                'Study mobile app security best practices',
                'Implement push notifications and analytics',
                'Optimize app performance and user experience'
              ],
              priority: 'Medium'
            },
            {
              phase: 'Publishing & Career (Months 13-18)',
              duration: '6 months',
              tasks: [
                'Publish apps to App Store and Google Play',
                'Learn app monetization strategies',
                'Build portfolio of published applications',
                'Apply for mobile developer positions'
              ],
              priority: 'High'
            }
          ],
          projects: [
            'Todo List App with Cloud Sync',
            'Social Media App Clone',
            'E-commerce Mobile App',
            'Fitness Tracking Application',
            'AR-based Mobile Game'
          ],
          certifications: [
            'Google Associate Android Developer',
            'Apple iOS Developer',
            'React Native Certification',
            'Flutter Developer Certification'
          ]
        }
      ];

      // Simulate skill analysis
      const skills: SkillAnalysis = {
        technical: [
          { skill: 'Programming', level: 85, trend: 'up' },
          { skill: 'Data Structures', level: 78, trend: 'up' },
          { skill: 'Algorithms', level: 72, trend: 'stable' },
          { skill: 'Database Design', level: 65, trend: 'up' },
          { skill: 'Web Development', level: 60, trend: 'up' }
        ],
        creative: [
          { skill: 'Problem Solving', level: 88, trend: 'up' },
          { skill: 'Design Thinking', level: 70, trend: 'up' },
          { skill: 'Innovation', level: 75, trend: 'stable' },
          { skill: 'Visual Design', level: 55, trend: 'up' }
        ],
        analytical: [
          { skill: 'Mathematical Thinking', level: 82, trend: 'up' },
          { skill: 'Logical Reasoning', level: 86, trend: 'stable' },
          { skill: 'Data Analysis', level: 68, trend: 'up' },
          { skill: 'Statistical Analysis', level: 62, trend: 'up' }
        ],
        communication: [
          { skill: 'Technical Writing', level: 65, trend: 'up' },
          { skill: 'Presentation', level: 70, trend: 'stable' },
          { skill: 'Team Collaboration', level: 75, trend: 'up' },
          { skill: 'Leadership', level: 58, trend: 'up' }
        ]
      };

      setCareerMatches(matches);
      setSkillAnalysis(skills);
      setSelectedCareer(matches[0].career);
      setIsAnalyzing(false);
    }, 3000);
  };

  useEffect(() => {
    analyzeCareerPaths();
  }, []);

  const getSkillColor = (level: number) => {
    if (level >= 80) return 'text-green-400 bg-green-400/10';
    if (level >= 60) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
      default: return <div className="w-3 h-3 bg-yellow-400 rounded-full" />;
    }
  };

  const selectedCareerData = careerMatches.find(career => career.career === selectedCareer);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* AI Analysis Status */}
      {isAnalyzing ? (
        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">AI Career Analysis in Progress</h3>
          <p className="text-slate-400 mb-4">Analyzing your academic performance, skills, and interests...</p>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Career Matches */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerMatches.slice(0, 3).map((career, idx) => (
              <div
                key={career.career}
                onClick={() => setSelectedCareer(career.career)}
                className={`cursor-pointer p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                  selectedCareer === career.career
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${career.color} flex items-center justify-center`}>
                    <career.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{career.matchPercentage}%</div>
                    <div className="text-xs text-slate-400">Match</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{career.career}</h3>
                <p className="text-sm text-slate-400 mb-4">{career.description}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    career.demandLevel === 'High' ? 'bg-green-500/20 text-green-400' :
                    career.demandLevel === 'Growing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {career.demandLevel} Demand
                  </span>
                  <span className="text-slate-400">{career.salaryRange}</span>
                </div>

                {idx === 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                    TOP MATCH
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* All Career Matches */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">All Career Predictions</h3>
            <div className="space-y-3">
              {careerMatches.map((career) => (
                <div
                  key={career.career}
                  onClick={() => setSelectedCareer(career.career)}
                  className={`cursor-pointer p-4 rounded-lg border transition-colors ${
                    selectedCareer === career.career
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${career.color} flex items-center justify-center`}>
                        <career.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{career.career}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span>{career.demandLevel} Demand</span>
                          <span>{career.salaryRange}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">{career.matchPercentage}%</div>
                      <div className="w-20 bg-slate-600 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${career.color}`}
                          style={{ width: `${career.matchPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderDetailed = () => {
    if (!selectedCareerData) return null;

    return (
      <div className="space-y-6">
        {/* Career Header */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${selectedCareerData.color} flex items-center justify-center`}>
                <selectedCareerData.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedCareerData.career}</h2>
                <p className="text-slate-400">{selectedCareerData.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{selectedCareerData.matchPercentage}%</div>
              <div className="text-sm text-slate-400">AI Match Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-lg font-bold text-white">{selectedCareerData.demandLevel}</div>
              <div className="text-sm text-slate-400">Market Demand</div>
            </div>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-lg font-bold text-white">{selectedCareerData.salaryRange}</div>
              <div className="text-sm text-slate-400">Salary Range</div>
            </div>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-lg font-bold text-white">{selectedCareerData.companies.length}+</div>
              <div className="text-sm text-slate-400">Top Companies</div>
            </div>
          </div>
        </div>

        {/* Why This Career */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
            Why {selectedCareerData.career}?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-300 mb-3">Your Strengths Match</h4>
              <div className="space-y-2">
                {selectedCareerData.skills.current.map((skill, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-300">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-slate-300 mb-3">Career Opportunities</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Growing industry with high demand</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">Multiple career progression paths</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">Global opportunities and remote work</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-300">High job satisfaction and creativity</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
            Top Companies Hiring
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedCareerData.companies.map((company, idx) => (
              <div key={idx} className="p-3 bg-slate-700/50 rounded-lg text-center">
                <div className="font-medium text-white">{company}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-400" />
            Skills Analysis & Development Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-green-400 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Current Strengths
              </h4>
              <div className="space-y-2">
                {selectedCareerData.skills.current.map((skill, idx) => (
                  <div key={idx} className="p-2 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-300">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-yellow-400 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Skills to Improve
              </h4>
              <div className="space-y-2">
                {selectedCareerData.skills.toImprove.map((skill, idx) => (
                  <div key={idx} className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-300">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-400 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                New Skills to Learn
              </h4>
              <div className="space-y-2">
                {selectedCareerData.skills.new.map((skill, idx) => (
                  <div key={idx} className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-300">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Projects */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Rocket className="w-5 h-5 mr-2 text-purple-400" />
            Recommended Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedCareerData.projects.map((project, idx) => (
              <div key={idx} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{project}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    idx < 2 ? 'bg-green-500/20 text-green-400' :
                    idx < 4 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {idx < 2 ? 'Beginner' : idx < 4 ? 'Intermediate' : 'Advanced'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-400" />
            Recommended Certifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedCareerData.certifications.map((cert, idx) => (
              <div key={idx} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 flex items-center justify-between">
                <span className="text-white">{cert}</span>
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRoadmap = () => {
    if (!selectedCareerData) return null;

    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-2">AI-Generated Career Roadmap</h2>
          <p className="text-slate-400 mb-4">Personalized 18-month plan to become a {selectedCareerData.career}</p>
          
          <div className="space-y-6">
            {selectedCareerData.roadmap.map((phase, idx) => (
              <div key={idx} className="relative">
                {/* Timeline connector */}
                {idx < selectedCareerData.roadmap.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-20 bg-slate-600"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    phase.priority === 'High' ? 'bg-red-500' :
                    phase.priority === 'Medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}>
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{phase.phase}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          phase.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                          phase.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {phase.priority} Priority
                        </span>
                        <span className="text-sm text-slate-400">{phase.duration}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-300 mb-3">Key Tasks:</h4>
                      <div className="space-y-2">
                        {phase.tasks.map((task, taskIdx) => (
                          <div key={taskIdx} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Summary */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Map className="w-5 h-5 mr-2 text-blue-400" />
            Roadmap Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {selectedCareerData.roadmap.map((phase, idx) => (
              <div key={idx} className="text-center p-4 bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-white mb-1">{phase.duration}</div>
                <div className="text-sm text-slate-400">{phase.phase}</div>
                <div className="text-xs text-slate-500 mt-1">{phase.tasks.length} tasks</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!skillAnalysis) return null;

    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Comprehensive Skills Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.entries(skillAnalysis) as [string, SkillAnalysis[keyof SkillAnalysis]][]).map(([category, skills]) => (
              <div key={category} className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4 capitalize flex items-center">
                  {category === 'technical' && <Code className="w-5 h-5 mr-2 text-blue-400" />}
                  {category === 'creative' && <Palette className="w-5 h-5 mr-2 text-purple-400" />}
                  {category === 'analytical' && <BarChart3 className="w-5 h-5 mr-2 text-green-400" />}
                  {category === 'communication' && <Users className="w-5 h-5 mr-2 text-yellow-400" />}
                  {category} Skills
                </h3>
                
                <div className="space-y-3">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{skill.skill}</span>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(skill.trend)}
                          <span className={`text-sm font-medium ${getSkillColor(skill.level)}`}>
                            {skill.level}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            skill.level >= 80 ? 'bg-green-500' :
                            skill.level >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Improvement Recommendations */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-400" />
            AI Recommendations for Skill Development
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="font-medium text-blue-400 mb-3">Focus Areas (Next 3 months)</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Strengthen C++ programming fundamentals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Practice advanced data structures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Improve technical communication skills</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="font-medium text-green-400 mb-3">Long-term Goals (6-12 months)</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">Master game development frameworks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">Develop portfolio of creative projects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">Build leadership and team collaboration skills</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Career Prediction</h2>
          <p className="text-slate-400">Personalized career guidance based on your academic performance and skills</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={analyzeCareerPaths}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Re-analyze</span>
              </>
            )}
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Career Overview', icon: Target },
            { id: 'detailed', label: 'Detailed Analysis', icon: BarChart3 },
            { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
            { id: 'skills', label: 'Skills Analysis', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'detailed' | 'roadmap' | 'skills')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'detailed' && renderDetailed()}
      {activeTab === 'roadmap' && renderRoadmap()}
      {activeTab === 'skills' && renderSkills()}
    </div>
  );
};

export default CareerPrediction;