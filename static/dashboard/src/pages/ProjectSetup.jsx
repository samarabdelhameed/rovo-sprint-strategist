import React from 'react';
import { motion } from 'framer-motion';
import ProjectSetup from '../components/ProjectSetup';

const ProjectSetupPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ProjectSetup />
    </motion.div>
  );
};

export default ProjectSetupPage;