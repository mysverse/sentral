"use client";

import MECSFAQ from "components/mecs/mecsFaq";
import StaffStats from "components/mecs/staffStats";
import { motion } from "motion/react";
import { springUI } from "components/ui/motion";

export default function MecsStaffPage() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={springUI}
        className="bg-surface rounded-lg px-5 py-6 shadow-sm sm:px-6"
      >
        <StaffStats />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ ...springUI, delay: 0.05 }}
        className="bg-surface mt-6 rounded-lg px-5 py-6 shadow-sm sm:px-6"
      >
        <MECSFAQ />
      </motion.div>
    </div>
  );
}
