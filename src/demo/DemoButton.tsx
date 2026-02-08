import { motion } from "framer-motion";
import { useContext } from "react";
import { DemoContext } from "./DemoContext.tsx";

export const DemoButton = ({ onEnterDemo }: { onEnterDemo: () => void }) => {

    const demo = useContext(DemoContext);
    if (!demo) return null;

    const startDemo = () => {
        // Pre-fill demo items if desired
        demo.setItems([

        ]);
        onEnterDemo();
    };

    return (
        <motion.button
            type="button"
            onClick={startDemo}
            className="logged-out_demo-link"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4, duration: 3, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            Enter Demo
        </motion.button>
    );
};

export default DemoButton;
