import { Link } from 'wouter';
import { ROUTES } from 'src/router';
import './footer.css';

export function Footer() {
  return (
    <footer className={`footer`}>
      <nav className="footer-nav">
            <Link href={ROUTES.privacyPolicy} className="footer-link">
                Privacy Policy
            </Link>
      </nav>
    </footer>
  );
}

export default Footer;
