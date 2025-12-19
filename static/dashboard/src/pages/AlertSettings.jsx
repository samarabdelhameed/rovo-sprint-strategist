import React from 'react';
import { motion } from 'framer-motion';
import AlertSettings from '../components/AlertSettings';

const AlertSettingsPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AlertSettings />
    </motion.div>
  );
};

export default AlertSettingsPage;