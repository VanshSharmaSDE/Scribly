import { motion } from 'framer-motion';
import { ChevronRight, Home, FileText, Edit, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = ({ items = [], noteTitle = null }) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs based on current route if no items provided
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [{ label: 'Home', path: '/', icon: Home }];
    
    // Handle dashboard routes
    if (pathnames[0] === 'dashboard') {
      breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });
    }
    
    // Handle note routes
    else if (pathnames[0] === 'notes') {
      breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });
      
      if (pathnames[1] === 'new') {
        breadcrumbs.push({ label: 'Create Note', path: '/notes/new', icon: Plus });
      } else if (pathnames[1] === 'view' && pathnames[2]) {
        const noteLabel = noteTitle ? noteTitle : 'Note';
        breadcrumbs.push({ label: noteLabel, path: `/notes/view/${pathnames[2]}`, icon: FileText });
      } else if (pathnames[1] === 'edit' && pathnames[2]) {
        const noteLabel = noteTitle ? noteTitle : 'Note';
        breadcrumbs.push({ label: noteLabel, path: `/notes/view/${pathnames[2]}`, icon: FileText });
        breadcrumbs.push({ label: 'Edit', path: `/notes/edit/${pathnames[2]}`, icon: Edit });
      } else if (pathnames[1] && pathnames[2] === 'edit') {
        // Legacy route format: /notes/:id/edit
        const noteLabel = noteTitle ? noteTitle : 'Note';
        breadcrumbs.push({ label: noteLabel, path: `/notes/view/${pathnames[1]}`, icon: FileText });
        breadcrumbs.push({ label: 'Edit', path: `/notes/edit/${pathnames[1]}`, icon: Edit });
      } else if (pathnames[1]) {
        // Legacy route format: /notes/:id
        const noteLabel = noteTitle ? noteTitle : 'Note';
        breadcrumbs.push({ label: noteLabel, path: `/notes/view/${pathnames[1]}`, icon: FileText });
      }
    }
    
    // Handle other authenticated routes
    else if (['profile', 'settings'].includes(pathnames[0])) {
      breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });
      let currentPath = '';
      pathnames.forEach((pathname) => {
        currentPath += `/${pathname}`;
        const label = pathname.charAt(0).toUpperCase() + pathname.slice(1);
        breadcrumbs.push({ label, path: currentPath });
      });
    }
    
    // Handle public routes (login, signup, etc.)
    else if (pathnames.length > 0) {
      let currentPath = '';
      pathnames.forEach((pathname) => {
        currentPath += `/${pathname}`;
        const label = pathname.charAt(0).toUpperCase() + pathname.slice(1);
        breadcrumbs.push({ label, path: currentPath });
      });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = items.length > 0 ? items : generateBreadcrumbs();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 text-sm mb-6"
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = crumb.icon;
        
        return (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-500 mx-2" />
            )}
            {isLast ? (
              <span 
                className="text-white font-medium flex items-center"
                style={{ color: '#4F70E2' }}
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-gray-400 hover:text-white transition-colors flex items-center"
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </motion.nav>
  );
};

export default Breadcrumb;
