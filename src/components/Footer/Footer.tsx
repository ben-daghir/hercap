import { Linkedin } from 'lucide-react'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <p className="footer__copyright">Herald Capital © 2014</p>
        <div className="footer__links">
          <a href="#" aria-label="LinkedIn" className="footer__link footer__link--social">
            <Linkedin size={16} /> LinkedIn
          </a>
          <a href="#" className="footer__link">Privacy Policy</a>
          <a href="#" className="footer__link">Terms and Conditions</a>
        </div>
      </div>
    </footer>
  )
}

