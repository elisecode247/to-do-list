import { motion } from "framer-motion";
import "./Logged-out.css";
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
                    transition={{ duration: 6, ease: "easeOut" }}
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

                <motion.div
                    className="cta-row"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4, duration: 2 }}
                >
                    <div className="login-orbit">
                        <p className="login-label" >Enter your space</p>
                        <div className="google-shell">
                            <GoogleLoginButton
                                onSuccess={onSuccessfulLogin}
                            />
                        </div>
                    </div>
                </motion.div>

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
