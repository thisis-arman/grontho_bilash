import React, { useState, useMemo } from 'react';
import examData from '../../assets/db/exam_suggestions.json';

const ExamSuggestions = () => {
  // Extract unique departments from data
  const departments = useMemo(() => {
    return Array.from(new Set(examData.map(item => item.department)));
  }, []);

  const [activeTab, setActiveTab] = useState(departments[0] || 'Accounting');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Filter subjects by active department
  const subjects = useMemo(() => {
    return examData.filter(item => item.department === activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            BBA Final Exam Suggestions
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Session: 2020-2021 | Final Year
          </p>
        </div>

        {/* Department Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {departments.map(dept => (
            <button
              key={dept}
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === dept
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => {
                setActiveTab(dept);
                setExpandedSubject(null);
              }}
            >
              {dept} Department
            </button>
          ))}
        </div>

        {/* Subjects List */}
        <div className="space-y-4">
          {subjects.map(subject => (
            <div 
              key={subject.subjectCode} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setExpandedSubject(
                  expandedSubject === subject.subjectCode ? null : subject.subjectCode
                )}
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {subject.subjectName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {subject.subjectCode} • {subject.year} • {subject.preparedBy && `Prepared by: ${subject.preparedBy}`}
                  </p>
                </div>
                <div className={`transform transition-transform duration-200 ${expandedSubject === subject.subjectCode ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Chapters Content */}
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSubject === subject.subjectCode ? 'max-h-[5000px] opacity-100 pb-6' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t border-gray-100 pt-6 space-y-8">
                  {subject.chapters.map((chapter, idx) => (
                    <div key={idx} className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          অধ্যায় {chapter.chapterNo}
                        </span>
                        {chapter.chapterName}
                      </h4>
                      <ul className="space-y-3">
                        {chapter.questions.map((q, qIdx) => (
                          <li key={qIdx} className="flex gap-3 text-gray-700 text-sm leading-relaxed">
                            <span className="text-yellow-500 font-bold mt-0.5">
                              {qIdx + 1}.
                            </span>
                            <div className="flex-1">
                                {q.text} 
                                <span className="ml-2 text-xs text-gray-400 font-medium whitespace-nowrap">
                                  ({q.priority > 2 ? '★★★' : '★★'})
                                </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  
                  {subject.chapters.length === 0 && (
                     <p className="text-gray-500 italic text-sm py-4">No questions available for this subject.</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {subjects.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-500">No suggestions found for {activeTab} department.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamSuggestions;
