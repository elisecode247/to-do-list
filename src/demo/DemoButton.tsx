import { motion } from "framer-motion";
import { useContext } from "react";
import { DemoContext } from "./DemoContext.tsx";
import { Link } from "wouter";
import { ROUTES } from 'src/router';

export const DemoButton = () => {

    const demo = useContext(DemoContext);
    if (!demo) return null;

    return (
        <motion.button
            type="button"
            className="logged-out_demo-link"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4, duration: 3, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Link className="demo-link" href={ROUTES.demo}>Enter Demo</Link>
        </motion.button>
    );
};

export default DemoButton;
