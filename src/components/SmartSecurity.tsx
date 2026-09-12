import React, { useState } from 'react';
import {
  Shield,
  Camera,
  AlertTriangle,
  Users,
  MapPin,
  Bell,
  Lock,
  Eye,
  Flame,
  UserX,
  Clock,
  BarChart3,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wifi,
  Smartphone
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'intrusion' | 'anomaly' | 'emergency' | 'access' | 'fire' | 'weapon' | 'crowd' | 'sos';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  camera: string;
  timestamp: string;
  description: string;
  status: 'active' | 'resolved' | 'investigating';
  assignedTo?: string;
}

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  type: 'indoor' | 'outdoor' | 'entrance' | 'lab' | 'library';
  features: string[];
  lastActivity?: string;
}

interface AccessLog {
  id: string;
  personId: string;
  personName: string;
  personType: 'student' | 'faculty' | 'staff' | 'visitor';
  location: string;
  action: 'entry' | 'exit' | 'denied';
  method: 'face' | 'card' | 'qr' | 'manual';
  timestamp: string;
  authorized: boolean;
}

interface SmartSecurityProps {
  currentUser: {
    name: string;
    role: 'student' | 'faculty' | 'admin';
    id: string;
  };
}

const SmartSecurity: React.FC<SmartSecurityProps> = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'surveillance' | 'access' | 'analytics' | 'settings'>('dashboard');
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [alertsFilter, setAlertsFilter] = useState<string>('all');
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Sample data
  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: 'SE001',
      type: 'intrusion',
      severity: 'high',
      location: 'Main Gate',
      camera: 'CAM-001',
      timestamp: '2024-12-20T14:30:00Z',
      description: 'Unknown person detected attempting unauthorized entry',
      status: 'investigating',
      assignedTo: 'Security Team Alpha'
    },
    {
      id: 'SE002',
      type: 'anomaly',
      severity: 'medium',
      location: 'Library - Section A',
      camera: 'CAM-015',
      timestamp: '2024-12-20T13:45:00Z',
      description: 'Suspicious loitering behavior detected for 15+ minutes',
      status: 'active'
    },
    {
      id: 'SE003',
      type: 'fire',
      severity: 'critical',
      location: 'Lab Building - Floor 2',
      camera: 'CAM-008',
      timestamp: '2024-12-20T12:15:00Z',
      description: 'Smoke detected in Computer Lab 2',
      status: 'resolved',
      assignedTo: 'Fire Safety Team'
    },
    {
      id: 'SE004',
      type: 'crowd',
      severity: 'low',
      location: 'Cafeteria',
      camera: 'CAM-012',
      timestamp: '2024-12-20T12:00:00Z',
      description: 'High crowd density detected during lunch hour',
      status: 'resolved'
    },
    {
      id: 'SE005',
      type: 'sos',
      severity: 'critical',
      location: 'Parking Area B',
      camera: 'CAM-020',
      timestamp: '2024-12-20T11:30:00Z',
      description: 'Emergency SOS alert triggered by student',
      status: 'resolved',
      assignedTo: 'Medical Team'
    }
  ]);

  const [cameraFeeds] = useState<CameraFeed[]>([
    {
      id: 'CAM-001',
      name: 'Main Gate',
      location: 'Campus Entrance',
      status: 'online',
      type: 'entrance',
      features: ['Face Recognition', 'License Plate', 'Intruder Detection'],
      lastActivity: '2 min ago'
    },
    {
      id: 'CAM-002',
      name: 'Admin Block',
      location: 'Administrative Building',
      status: 'online',
      type: 'indoor',
      features: ['Face Recognition', 'Anomaly Detection'],
      lastActivity: '5 min ago'
    },
    {
      id: 'CAM-008',
      name: 'Computer Lab 2',
      location: 'Lab Building - Floor 2',
      status: 'maintenance',
      type: 'lab',
      features: ['Fire Detection', 'Weapon Detection', 'Access Control'],
      lastActivity: '1 hour ago'
    },
    {
      id: 'CAM-012',
      name: 'Cafeteria',
      location: 'Student Cafeteria',
      status: 'online',
      type: 'indoor',
      features: ['Crowd Analysis', 'Fight Detection', 'Emergency Detection'],
      lastActivity: '1 min ago'
    },
    {
      id: 'CAM-015',
      name: 'Library Section A',
      location: 'Central Library',
      status: 'online',
      type: 'library',
      features: ['Behavior Analysis', 'Noise Detection', 'Access Control'],
      lastActivity: '3 min ago'
    },
    {
      id: 'CAM-020',
      name: 'Parking Area B',
      location: 'Student Parking',
      status: 'online',
      type: 'outdoor',
      features: ['Vehicle Tracking', 'Emergency Detection', 'Theft Prevention'],
      lastActivity: '4 min ago'
    }
  ]);

  const [accessLogs] = useState<AccessLog[]>([
    {
      id: 'AL001',
      personId: 'ST2024001',
      personName: 'Kirishipathi',
      personType: 'student',
      location: 'Main Gate',
      action: 'entry',
      method: 'face',
      timestamp: '2024-12-20T08:30:00Z',
      authorized: true
    },
    {
      id: 'AL002',
      personId: 'FC2024001',
      personName: 'Dr. Rajesh Gupta',
      personType: 'faculty',
      location: 'Lab Building',
      action: 'entry',
      method: 'card',
      timestamp: '2024-12-20T09:15:00Z',
      authorized: true
    },
    {
      id: 'AL003',
      personId: 'UNKNOWN',
      personName: 'Unknown Person',
      personType: 'visitor',
      location: 'Main Gate',
      action: 'denied',
      method: 'face',
      timestamp: '2024-12-20T14:30:00Z',
      authorized: false
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'intrusion': return <UserX className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'emergency': return <AlertCircle className="w-4 h-4" />;
      case 'access': return <Lock className="w-4 h-4" />;
      case 'fire': return <Flame className="w-4 h-4" />;
      case 'weapon': return <Shield className="w-4 h-4" />;
      case 'crowd': return <Users className="w-4 h-4" />;
      case 'sos': return <Bell className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'maintenance': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const triggerEmergency = () => {
    setEmergencyMode(true);
    // Simulate emergency response
    setTimeout(() => {
      setEmergencyMode(false);
    }, 5000);
  };

  const filteredEvents = alertsFilter === 'all' 
    ? securityEvents 
    : securityEvents.filter(event => event.severity === alertsFilter);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Emergency Alert */}
      {emergencyMode && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-red-400 animate-bounce" />
              <div>
                <h3 className="text-xl font-bold text-red-400">EMERGENCY MODE ACTIVATED</h3>
                <p className="text-red-300">All security systems are on high alert</p>
              </div>
            </div>
            <button
              onClick={() => setEmergencyMode(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Deactivate
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Active Cameras</h3>
            <Camera className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {cameraFeeds.filter(cam => cam.status === 'online').length}/{cameraFeeds.length}
          </div>
          <div className="text-sm text-green-400">
            {Math.round((cameraFeeds.filter(cam => cam.status === 'online').length / cameraFeeds.length) * 100)}% operational
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Active Alerts</h3>
            <AlertTriangle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {securityEvents.filter(event => event.status === 'active').length}
          </div>
          <div className="text-sm text-orange-400">Require attention</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Access Attempts</h3>
            <Lock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {accessLogs.length}
          </div>
          <div className="text-sm text-blue-400">Today</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Security Score</h3>
            <Shield className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">94%</div>
          <div className="text-sm text-green-400">Excellent</div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Security Events</h3>
          <div className="flex items-center space-x-2">
            <select
              value={alertsFilter}
              onChange={(e) => setAlertsFilter(e.target.value)}
              className="bg-slate-700 text-white px-3 py-1 rounded-lg text-sm border border-slate-600"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredEvents.slice(0, 5).map((event) => (
            <div key={event.id} className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${
                    event.severity === 'critical' ? 'from-red-500 to-red-600' :
                    event.severity === 'high' ? 'from-orange-500 to-orange-600' :
                    event.severity === 'medium' ? 'from-yellow-500 to-yellow-600' :
                    'from-blue-500 to-blue-600'
                  } flex items-center justify-center`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{event.description}</h4>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </span>
                      <span className="flex items-center">
                        <Camera className="w-3 h-3 mr-1" />
                        {event.camera}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'active' ? 'bg-red-500/20 text-red-400' :
                    event.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {event.status.toUpperCase()}
                  </div>
                  {event.assignedTo && (
                    <div className="text-xs text-slate-400 mt-1">{event.assignedTo}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Emergency Response</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={triggerEmergency}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <Bell className="w-5 h-5" />
            <span>Trigger Emergency Alert</span>
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-4 rounded-xl transition-colors flex items-center justify-center space-x-2">
            <Flame className="w-5 h-5" />
            <span>Fire Alarm</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-4 rounded-xl transition-colors flex items-center justify-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>Lockdown Mode</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSurveillance = () => (
    <div className="space-y-6">
      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameraFeeds.map((camera) => (
          <div key={camera.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Camera Feed Display */}
            <div className="aspect-video bg-slate-900 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                  <div className="text-sm text-slate-400">{camera.name}</div>
                  <div className="text-xs text-slate-500">Live Feed</div>
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="absolute top-2 left-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  camera.status === 'online' ? 'bg-green-500/20 text-green-400' :
                  camera.status === 'offline' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(camera.status)} animate-pulse`}></div>
                  <span>{camera.status.toUpperCase()}</span>
                </div>
              </div>

              {/* Recording Indicator */}
              {isRecording && camera.status === 'online' && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span>REC</span>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors">
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                  >
                    {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
                <button className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors">
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Camera Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{camera.name}</h4>
                <span className="text-xs text-slate-400">{camera.lastActivity}</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">{camera.location}</p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {camera.features.map((feature, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recording Controls */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recording Controls</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccessControl = () => (
    <div className="space-y-6">
      {/* Access Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Total Access</h3>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{accessLogs.length}</div>
          <div className="text-sm text-blue-400">Today</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Authorized</h3>
            <CheckCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {accessLogs.filter(log => log.authorized).length}
          </div>
          <div className="text-sm text-green-400">Successful</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Denied</h3>
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {accessLogs.filter(log => !log.authorized).length}
          </div>
          <div className="text-sm text-red-400">Blocked</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-slate-400">Face Recognition</h3>
            <Eye className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {accessLogs.filter(log => log.method === 'face').length}
          </div>
          <div className="text-sm text-purple-400">AI Verified</div>
        </div>
      </div>

      {/* Access Logs */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Access Logs</h3>
          <div className="flex items-center space-x-2">
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Filter</span>
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1">
              <Search className="w-3 h-3" />
              <span>Search</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {accessLogs.map((log) => (
            <div key={log.id} className={`p-4 rounded-lg border ${
              log.authorized 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${
                    log.authorized ? 'bg-green-500' : 'bg-red-500'
                  } flex items-center justify-center`}>
                    {log.authorized ? <CheckCircle className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{log.personName}</h4>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="capitalize">{log.personType}</span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {log.location}
                      </span>
                      <span className="capitalize">{log.action}</span>
                      <span className="capitalize">{log.method}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Control Settings */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Access Control Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">Authentication Methods</h4>
            <div className="space-y-2">
              {[
                { method: 'Face Recognition', enabled: true, icon: Eye },
                { method: 'ID Card', enabled: true, icon: Lock },
                { method: 'QR Code', enabled: false, icon: Smartphone },
                { method: 'Manual Override', enabled: true, icon: Users }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-white">{item.method}</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full ${item.enabled ? 'bg-green-500' : 'bg-slate-600'} relative transition-colors`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-1'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">Time Restrictions</h4>
            <div className="space-y-2">
              {[
                { location: 'Main Gate', hours: '24/7', status: 'active' },
                { location: 'Lab Building', hours: '8:00 AM - 8:00 PM', status: 'active' },
                { location: 'Library', hours: '7:00 AM - 10:00 PM', status: 'active' },
                { location: 'Admin Block', hours: '9:00 AM - 5:00 PM', status: 'restricted' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="text-sm text-white">{item.location}</div>
                    <div className="text-xs text-slate-400">{item.hours}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Security Trends</h3>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Incidents</span>
              <span className="text-sm text-red-400">-15%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Response Time</span>
              <span className="text-sm text-green-400">-23%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Detection Rate</span>
              <span className="text-sm text-green-400">+12%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Peak Hours</h3>
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">8:00 - 10:00 AM</span>
              <div className="w-16 bg-slate-700 rounded-full h-2">
                <div className="w-12 bg-yellow-500 h-2 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">12:00 - 2:00 PM</span>
              <div className="w-16 bg-slate-700 rounded-full h-2">
                <div className="w-14 bg-orange-500 h-2 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">5:00 - 7:00 PM</span>
              <div className="w-16 bg-slate-700 rounded-full h-2">
                <div className="w-10 bg-blue-500 h-2 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">IoT Status</h3>
            <Wifi className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Smart Lights</span>
              <span className="text-sm text-green-400">98% Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Door Locks</span>
              <span className="text-sm text-green-400">100% Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Sensors</span>
              <span className="text-sm text-yellow-400">94% Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Campus Activity Heatmap</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { area: 'Main Gate', activity: 'high', count: 245 },
            { area: 'Cafeteria', activity: 'very-high', count: 389 },
            { area: 'Library', activity: 'medium', count: 156 },
            { area: 'Lab Building', activity: 'high', count: 203 },
            { area: 'Admin Block', activity: 'low', count: 67 },
            { area: 'Parking Area', activity: 'medium', count: 134 },
            { area: 'Sports Complex', activity: 'low', count: 89 },
            { area: 'Auditorium', activity: 'medium', count: 178 }
          ].map((area, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${
              area.activity === 'very-high' ? 'bg-red-500/20 border-red-500/30' :
              area.activity === 'high' ? 'bg-orange-500/20 border-orange-500/30' :
              area.activity === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30' :
              'bg-blue-500/20 border-blue-500/30'
            }`}>
              <div className="text-sm font-medium text-white">{area.area}</div>
              <div className="text-2xl font-bold text-white mt-1">{area.count}</div>
              <div className={`text-xs capitalize ${
                area.activity === 'very-high' ? 'text-red-400' :
                area.activity === 'high' ? 'text-orange-400' :
                area.activity === 'medium' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                {area.activity.replace('-', ' ')} activity
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Security Reports</h3>
          <div className="flex items-center space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Daily Report</span>
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1">
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h4 className="font-medium text-white mb-2">Incident Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Total Incidents:</span>
                <span className="text-white">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Resolved:</span>
                <span className="text-green-400">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">In Progress:</span>
                <span className="text-yellow-400">2</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h4 className="font-medium text-white mb-2">Response Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Avg Response Time:</span>
                <span className="text-white">2.3 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Detection Accuracy:</span>
                <span className="text-green-400">96.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">False Positives:</span>
                <span className="text-yellow-400">3.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* System Settings */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">System Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">AI Detection Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Face Recognition Sensitivity</label>
                <input type="range" min="1" max="10" defaultValue="7" className="w-full" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Anomaly Detection Threshold</label>
                <input type="range" min="1" max="10" defaultValue="6" className="w-full" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Relaxed</span>
                  <span>Strict</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">Alert Preferences</h4>
            <div className="space-y-3">
              {[
                { type: 'Email Notifications', enabled: true },
                { type: 'SMS Alerts', enabled: true },
                { type: 'Push Notifications', enabled: false },
                { type: 'Sound Alarms', enabled: true }
              ].map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{pref.type}</span>
                  <div className={`w-10 h-6 rounded-full ${pref.enabled ? 'bg-green-500' : 'bg-slate-600'} relative transition-colors`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${pref.enabled ? 'translate-x-5' : 'translate-x-1'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* IoT Device Management */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">IoT Device Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Smart Gate Lock', type: 'Access Control', status: 'online', battery: 87 },
            { name: 'Emergency Siren', type: 'Alert System', status: 'online', battery: 92 },
            { name: 'Motion Sensor #1', type: 'Detection', status: 'online', battery: 76 },
            { name: 'Smart Light Panel', type: 'Lighting', status: 'maintenance', battery: 45 },
            { name: 'Fire Detector', type: 'Safety', status: 'online', battery: 89 },
            { name: 'Door Sensor #3', type: 'Access Control', status: 'offline', battery: 12 }
          ].map((device, idx) => (
            <div key={idx} className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{device.name}</h4>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></div>
              </div>
              <div className="text-sm text-slate-400 mb-2">{device.type}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Battery</span>
                <div className="flex items-center space-x-2">
                  <div className="w-12 bg-slate-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        device.battery > 50 ? 'bg-green-500' : 
                        device.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${device.battery}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-white">{device.battery}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Emergency Contacts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { role: 'Security Head', name: 'Mr. Rajesh Kumar', phone: '+91 98765 43210', email: 'security@college.edu' },
            { role: 'Fire Safety Officer', name: 'Ms. Priya Sharma', phone: '+91 98765 43211', email: 'fire@college.edu' },
            { role: 'Medical Emergency', name: 'Dr. Amit Patel', phone: '+91 98765 43212', email: 'medical@college.edu' },
            { role: 'Campus Administrator', name: 'Mr. Suresh Gupta', phone: '+91 98765 43213', email: 'admin@college.edu' }
          ].map((contact, idx) => (
            <div key={idx} className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{contact.role}</h4>
                <button className="text-green-400 hover:text-green-300">
                  <Bell className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-slate-300 mb-1">{contact.name}</div>
              <div className="text-xs text-slate-400">{contact.phone}</div>
              <div className="text-xs text-slate-400">{contact.email}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Smart Security System</h2>
          <p className="text-slate-400">AI-powered campus security and surveillance</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            emergencyMode 
              ? 'bg-red-500/20 text-red-400 animate-pulse' 
              : 'bg-green-500/20 text-green-400'
          }`}>
            {emergencyMode ? 'EMERGENCY MODE' : 'SYSTEM NORMAL'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700">
        <div className="flex space-x-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Shield },
            { id: 'surveillance', label: 'Surveillance', icon: Camera },
            { id: 'access', label: 'Access Control', icon: Lock },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'dashboard' | 'surveillance' | 'access' | 'analytics' | 'settings')}
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
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'surveillance' && renderSurveillance()}
      {activeTab === 'access' && renderAccessControl()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  );
};

export default SmartSecurity;