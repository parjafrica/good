import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calculator, 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Download, 
  Upload, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Shield, 
  CreditCard, 
  PieChart, 
  BarChart3, 
  FileSpreadsheet, 
  Receipt, 
  Banknote, 
  Wallet, 
  Target, 
  Award, 
  Star, 
  Edit, 
  Save, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  Image as ImageIcon, 
  Link, 
  Printer, 
  Copy, 
  Scissors, 
  Undo, 
  Redo,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'terminated';
  address: string;
  emergencyContact: string;
  benefits: string[];
  avatar: string;
}

interface FinancialRecord {
  id: string;
  type: 'income' | 'expense' | 'invoice' | 'payment';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'pending' | 'completed' | 'overdue';
  clientId?: string;
  employeeId?: string;
}

interface Document {
  id: string;
  name: string;
  content: string;
  type: 'proposal' | 'contract' | 'memo' | 'report' | 'letter';
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
  tags: string[];
}

const AdminBusinessTools: React.FC = () => {
  const [activeModule, setActiveModule] = useState('hr');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDocumentEditor, setShowDocumentEditor] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLDivElement>(null);

  // Mock data for demo
  const employees: Employee[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1-555-0123',
      position: 'Grant Writer',
      department: 'Programs',
      salary: 65000,
      startDate: '2023-01-15',
      status: 'active',
      address: '123 Main St, City, State 12345',
      emergencyContact: 'Jane Doe - +1-555-0124',
      benefits: ['Health Insurance', 'Dental', '401k', 'PTO'],
      avatar: ''
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1-555-0125',
      position: 'Program Manager',
      department: 'Operations',
      salary: 72000,
      startDate: '2022-08-10',
      status: 'active',
      address: '456 Oak Ave, City, State 12345',
      emergencyContact: 'Mike Johnson - +1-555-0126',
      benefits: ['Health Insurance', 'Dental', 'Vision', '401k', 'PTO'],
      avatar: ''
    }
  ];

  const financialRecords: FinancialRecord[] = [
    {
      id: '1',
      type: 'income',
      amount: 50000,
      description: 'Gates Foundation Grant',
      category: 'Grants',
      date: '2025-01-15',
      status: 'completed'
    },
    {
      id: '2',
      type: 'expense',
      amount: 3500,
      description: 'Office Equipment',
      category: 'Operations',
      date: '2025-01-12',
      status: 'completed'
    },
    {
      id: '3',
      type: 'invoice',
      amount: 15000,
      description: 'Consulting Services',
      category: 'Professional Services',
      date: '2025-01-20',
      status: 'pending'
    }
  ];

  const documents: Document[] = [
    {
      id: '1',
      name: 'Q1 Progress Report',
      content: '<h1>Quarterly Progress Report</h1><p>This document outlines our progress for Q1 2025...</p>',
      type: 'report',
      createdAt: '2025-01-15',
      modifiedAt: '2025-01-20',
      createdBy: 'John Doe',
      tags: ['report', 'quarterly', 'progress']
    },
    {
      id: '2',
      name: 'Partnership Agreement Draft',
      content: '<h1>Partnership Agreement</h1><p>This agreement is entered into between...</p>',
      type: 'contract',
      createdAt: '2025-01-10',
      modifiedAt: '2025-01-18',
      createdBy: 'Sarah Johnson',
      tags: ['contract', 'partnership', 'legal']
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': case 'completed': return 'text-green-500 bg-green-900/30';
      case 'pending': return 'text-yellow-500 bg-yellow-900/30';
      case 'inactive': case 'overdue': return 'text-red-500 bg-red-900/30';
      case 'terminated': return 'text-gray-500 bg-gray-900/30';
      default: return 'text-blue-500 bg-blue-900/30';
    }
  };

  const handleTextFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDocumentContent(editorRef.current.innerHTML);
    }
  };

  const openDocument = (doc: Document) => {
    setCurrentDocument(doc);
    setDocumentContent(doc.content);
    setShowDocumentEditor(true);
  };

  const createNewDocument = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: 'Untitled Document',
      content: '<p>Start typing your document here...</p>',
      type: 'memo',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      createdBy: 'Admin',
      tags: []
    };
    setCurrentDocument(newDoc);
    setDocumentContent(newDoc.content);
    setShowDocumentEditor(true);
  };

  const saveDocument = () => {
    if (currentDocument && editorRef.current) {
      const updatedDoc = {
        ...currentDocument,
        content: editorRef.current.innerHTML,
        modifiedAt: new Date().toISOString()
      };
      // Here you would typically save to the database
      console.log('Saving document:', updatedDoc);
      setShowDocumentEditor(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Business Management Suite</h1>
            <p className="text-gray-400">HR • Accounting • Document Management</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={createNewDocument}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Document
            </button>
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'hr', label: 'Human Resources', icon: Users },
            { id: 'accounting', label: 'Accounting', icon: Calculator },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'payroll', label: 'Payroll', icon: DollarSign },
            { id: 'reports', label: 'Reports', icon: BarChart3 }
          ].map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeModule === module.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <module.icon className="w-4 h-4" />
              {module.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* HR Module */}
          {activeModule === 'hr' && (
            <motion.div
              key="hr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Employee Management</h2>
                <button
                  onClick={() => setShowEmployeeModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </button>
              </div>

              {/* Employee Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Employees</p>
                      <p className="text-2xl font-bold text-white">{employees.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active</p>
                      <p className="text-2xl font-bold text-white">{employees.filter(e => e.status === 'active').length}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Departments</p>
                      <p className="text-2xl font-bold text-white">{new Set(employees.map(e => e.department)).size}</p>
                    </div>
                    <Building className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg Salary</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Employee List */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Salary</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {employee.firstName[0]}{employee.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{employee.firstName} {employee.lastName}</p>
                                <p className="text-gray-400 text-sm">{employee.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-white">{employee.position}</td>
                          <td className="px-6 py-4 text-white">{employee.department}</td>
                          <td className="px-6 py-4 text-white">{formatCurrency(employee.salary)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                              {employee.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setShowEmployeeModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Accounting Module */}
          {activeModule === 'accounting' && (
            <motion.div
              key="accounting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">Financial Management</h2>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Income</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(financialRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0))}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-400">
                        {formatCurrency(financialRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0))}
                      </p>
                    </div>
                    <Receipt className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Net Profit</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {formatCurrency(
                          financialRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0) -
                          financialRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
                        )}
                      </p>
                    </div>
                    <Banknote className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Transaction
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {financialRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.type === 'income' ? 'text-green-500 bg-green-900/30' :
                              record.type === 'expense' ? 'text-red-500 bg-red-900/30' :
                              'text-blue-500 bg-blue-900/30'
                            }`}>
                              {record.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white">{record.description}</td>
                          <td className="px-6 py-4 text-gray-400">{record.category}</td>
                          <td className="px-6 py-4">
                            <span className={`font-medium ${
                              record.type === 'income' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400">{formatDate(record.date)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Documents Module */}
          {activeModule === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Document Management</h2>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  <button
                    onClick={createNewDocument}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Document
                  </button>
                </div>
              </div>

              {/* Document Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium line-clamp-2">{doc.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">{doc.type}</p>
                        </div>
                        <FileText className="w-6 h-6 text-blue-500 flex-shrink-0" />
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        <p>Created: {formatDate(doc.createdAt)}</p>
                        <p>Modified: {formatDate(doc.modifiedAt)}</p>
                        <p>By: {doc.createdBy}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDocument(doc)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Document Editor Modal */}
      {showDocumentEditor && currentDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700"
          >
            {/* Editor Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={currentDocument.name}
                  onChange={(e) => setCurrentDocument({...currentDocument, name: e.target.value})}
                  className="text-lg font-medium bg-transparent text-white border-none outline-none"
                />
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                  {currentDocument.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveDocument}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => setShowDocumentEditor(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="p-4 border-b border-gray-700 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleTextFormat('bold')}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTextFormat('italic')}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTextFormat('underline')}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-600 mx-2" />
              <button
                onClick={() => handleTextFormat('justifyLeft')}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTextFormat('justifyCenter')}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTextFormat('justifyRight')}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-600 mx-2" />
              <button
                onClick={() => handleTextFormat('insertOrderedList')}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTextFormat('undo')}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTextFormat('redo')}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Editor */}
            <div className="p-6 h-[60vh] overflow-y-auto">
              <div
                ref={editorRef}
                contentEditable
                dangerouslySetInnerHTML={{ __html: documentContent }}
                className="w-full h-full bg-white text-black p-6 rounded-lg shadow-inner prose prose-lg max-w-none focus:outline-none"
                style={{ minHeight: '500px' }}
                onInput={() => {
                  if (editorRef.current) {
                    setDocumentContent(editorRef.current.innerHTML);
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedEmployee?.firstName || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedEmployee?.lastName || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedEmployee?.email || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedEmployee?.phone || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedEmployee?.position || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedEmployee?.department || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Salary</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedEmployee?.salary || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedEmployee?.startDate || ''}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEmployeeModal(false);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {selectedEmployee ? 'Update' : 'Create'} Employee
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBusinessTools;