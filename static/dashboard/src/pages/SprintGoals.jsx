import React from 'react';
import { motion } from 'framer-motion';
import SprintGoals from '../components/SprintGoals';

const SprintGoalsPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SprintGoals />
    </motion.div>
  );
};

export default SprintGoalsPage;