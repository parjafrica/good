import { BookOpen, PenTool, Award, Search, Users, Trophy, GraduationCap, Target } from 'lucide-react';

export default function StudentNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900/95 to-purple-900/95 backdrop-blur-lg border-t border-blue-500/20 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {[
          { to: '/student-dashboard', icon: GraduationCap, label: 'Dashboard' },
          { to: '/scholarships', icon: Award, label: 'Scholarships' },
          { to: '/academic-writing', icon: PenTool, label: 'Writing' },
          { to: '/research', icon: Search, label: 'Research' },
          { to: '/student-network', icon: Users, label: 'Network' }
        ].map((item) => {
          const IconComponent = item.icon;
          return (
            <a
              key={item.to}
              href={item.to}
              className="flex flex-col items-center space-y-1 px-2 py-1 text-blue-200 hover:text-white transition-colors"
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}