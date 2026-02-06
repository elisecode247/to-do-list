import { motion } from "framer-motion";
import "./logged-out.css";
import GoogleLoginButton from "src/authentication/google-login-button";

export default function LoggedOut({ onSuccessfulLogin }: { onSuccessfulLogin: (token: string) => Promise<void> }) {
    return (
        <div className="logged-out-root">
            <div className="stars" />
            <div className="content">
                <motion.h1
                    className="headline"
                    initial={{ opacity: 0, filter: "blur(20px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 4, ease: "easeOut" }}
                >
                    free your mind
                </motion.h1>

                <motion.p
                    className="subtext"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.85 }}
                    transition={{ delay: 2.5, duration: 4 }}
                >
                    Holding space for your thoughts so your mind can float freely
                </motion.p>

                <div className="login-orbit">
                    <motion.p
                        className="login-label"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 4 }}
                    >
                        Enter your space
                    </motion.p>
                    <div className="google-shell">
                        <GoogleLoginButton
                            onSuccess={onSuccessfulLogin}
                        />
                    </div>
                </div>

                <motion.p
                    className="footer-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 6, duration: 4 }}
                >
                    nothing is urgent right now
                </motion.p>
            </div>
        </div>
    );
}
