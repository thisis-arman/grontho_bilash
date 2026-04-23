import { useState, useEffect, useMemo } from 'react';
import { Plus, RotateCcw, Calculator } from 'lucide-react';
import { Course, Semester, GradingScaleType } from './types';
import { SCALE_4, SCALE_5, DEFAULT_SCALE_TYPE } from './constants';
import SemesterCard from './SemesterCard';
import GradingSettings from './GradingSettings';

// Helper for generating IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

export default function CgpaCalculator() {
  const [scaleType, setScaleType] = useState<GradingScaleType>(DEFAULT_SCALE_TYPE);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedData = localStorage.getItem('gb_cgpa_data');
    if (savedData) {
      try {
        const { scaleType: savedScale, semesters: savedSemesters } = JSON.parse(savedData);
        if (savedScale) setScaleType(savedScale);
        if (savedSemesters && savedSemesters.length > 0) {
          setSemesters(savedSemesters);
        } else {
          addSemester(); // Start with one if empty
        }
      } catch (e) {
        addSemester();
      }
    } else {
      addSemester();
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gb_cgpa_data', JSON.stringify({ scaleType, semesters }));
    }
  }, [scaleType, semesters, isLoaded]);

  const activeScale = scaleType === '4.00' ? SCALE_4 : SCALE_5;

  const addSemester = () => {
    setSemesters(prev => [
      ...prev,
      {
        id: generateId(),
        name: `Semester ${prev.length + 1}`,
        courses: [
          { id: generateId(), name: '', credits: 3, grade: '' },
          { id: generateId(), name: '', credits: 3, grade: '' },
          { id: generateId(), name: '', credits: 3, grade: '' }
        ],
        included: true
      }
    ]);
  };

  const removeSemester = (id: string) => {
    setSemesters(prev => prev.filter(s => s.id !== id));
  };

  const updateSemester = (id: string, field: keyof Semester, value: any) => {
    setSemesters(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addCourse = (semesterId: string) => {
    setSemesters(prev => prev.map(s => {
      if (s.id === semesterId) {
        return {
          ...s,
          courses: [...s.courses, { id: generateId(), name: '', credits: 3, grade: '' }]
        };
      }
      return s;
    }));
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setSemesters(prev => prev.map(s => {
      if (s.id === semesterId) {
        return { ...s, courses: s.courses.filter(c => c.id !== courseId) };
      }
      return s;
    }));
  };

  const updateCourse = (semesterId: string, courseId: string, field: keyof Course, value: any) => {
    setSemesters(prev => prev.map(s => {
      if (s.id === semesterId) {
        return {
          ...s,
          courses: s.courses.map(c => c.id === courseId ? { ...c, [field]: value } : c)
        };
      }
      return s;
    }));
  };

  const resetAll = () => {
    if (window.confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      setSemesters([]);
      setTimeout(addSemester, 0); // Re-add first semester after state clear
    }
  };

  const calculateGpa = (courses: Course[]) => {
    let totalCredits = 0;
    let totalPoints = 0;

    courses.forEach(course => {
      if (course.credits !== '' && course.grade) {
        const creditVal = Number(course.credits);
        const gradeEntry = activeScale.find(g => g.grade === course.grade);
        
        if (creditVal > 0 && gradeEntry) {
          totalCredits += creditVal;
          totalPoints += creditVal * gradeEntry.points;
        }
      }
    });

    return {
      gpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
      credits: totalCredits
    };
  };

  const { overallCgpa, overallCredits } = useMemo(() => {
    let allCredits = 0;
    let allPoints = 0;

    semesters.filter(s => s.included).forEach(semester => {
      semester.courses.forEach(course => {
        if (course.credits !== '' && course.grade) {
          const creditVal = Number(course.credits);
          const gradeEntry = activeScale.find(g => g.grade === course.grade);
          
          if (creditVal > 0 && gradeEntry) {
            allCredits += creditVal;
            allPoints += creditVal * gradeEntry.points;
          }
        }
      });
    });

    return {
      overallCgpa: allCredits > 0 ? allPoints / allCredits : 0,
      overallCredits: allCredits
    };
  }, [semesters, activeScale]);

  if (!isLoaded) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-ubuntu-regular min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-16 md:mt-24">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calculator className="text-yellow-500 w-8 h-8" />
            CGPA Calculator
          </h1>
          <p className="text-muted-foreground mt-2">Calculate and track your academic progress.</p>
        </div>
        
        {/* Results Card */}
        <div className="bg-card border border-yellow-200 dark:border-yellow-900/30 rounded-2xl p-5 shadow-lg shadow-yellow-500/5 w-full md:w-auto min-w-[280px]">
          <div className="flex justify-between items-end gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Overall CGPA</p>
              <div className="text-4xl font-black text-foreground">
                {overallCgpa.toFixed(2)}
                <span className="text-lg text-muted-foreground font-medium ml-1">
                  / {scaleType}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Credits</p>
              <p className="text-xl font-bold text-foreground">{overallCredits}</p>
            </div>
          </div>
        </div>
      </div>

      <GradingSettings scaleType={scaleType} onChangeScaleType={setScaleType} />

      <div className="space-y-6">
        {semesters.map(semester => {
          const { gpa, credits } = calculateGpa(semester.courses);
          return (
            <SemesterCard
              key={semester.id}
              semester={semester}
              gradingScale={activeScale}
              semesterGpa={gpa}
              totalCredits={credits}
              onUpdateSemester={updateSemester}
              onRemoveSemester={removeSemester}
              onAddCourse={addCourse}
              onUpdateCourse={updateCourse}
              onRemoveCourse={removeCourse}
            />
          );
        })}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <button
          onClick={addSemester}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus size={20} /> Add Semester
        </button>
        
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-destructive hover:text-destructive-foreground text-foreground rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
        >
          <RotateCcw size={18} /> Reset All Data
        </button>
      </div>
    </div>
  );
}
