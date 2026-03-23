"use client";

import MECSFAQ from "components/mecs/mecsFaq";
import StaffStats from "components/mecs/staffStats";
import { motion } from "motion/react";

export default function MecsStaffPage() {
  return (
    <div className="mx-auto my-auto max-w-7xl grow px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6"
      >
        <StaffStats />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mt-6 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6"
      >
        <MECSFAQ />
      </motion.div>
    </div>
  );
}
