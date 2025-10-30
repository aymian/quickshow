import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Youtube, Smartphone, Tv, Monitor, Download, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-gray-800 mt-20">
      {/* Download App Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Download Our App
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Watch anywhere. Cancel anytime. Download and watch offline on any device.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="gap-3 px-6 py-6 bg-white hover:bg-gray-100 text-black font-bold rounded-xl">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    App Store
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="gap-3 px-6 py-6 bg-white hover:bg-gray-100 text-black font-bold rounded-xl">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    Google Play
                  </Button>
                </motion.div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <Smartphone className="w-5 h-5" />
                  <span>Mobile</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Tv className="w-5 h-5" />
                  <span>Smart TV</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Monitor className="w-5 h-5" />
                  <span>Desktop</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - App Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative">
                {/* Glowing Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
                
                {/* Phone Mockup */}
                <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-[3rem] p-4 border-4 border-gray-800 shadow-2xl max-w-sm mx-auto">
                  <div className="bg-black rounded-[2.5rem] overflow-hidden">
                    <div className="h-96 bg-gradient-to-br from-primary/10 to-purple-900/10 flex items-center justify-center">
                      <Download className="w-20 h-20 text-primary animate-bounce" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold mb-4">
              <span className="text-primary">Q</span>
              <span className="text-white">uickShow</span>
            </h3>
            <p className="text-gray-400 mb-6 max-w-sm">
              Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV without paying more.
            </p>
            
            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-300">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-900 border-gray-700 focus:border-primary"
                />
                <Button className="bg-primary hover:bg-primary/90 px-6">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Movies', 'TV Shows', 'New & Popular', 'My List'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              {['Help Center', 'FAQ', 'Account', 'Contact Us', 'Legal'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-400">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>support@quickshow.com</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Streaming St, Los Angeles, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-gray-800">
          {[
            { icon: Download, title: 'Download & Go', desc: 'Watch offline' },
            { icon: Tv, title: '4K Ultra HD', desc: 'Crystal clear' },
            { icon: Monitor, title: 'Multi-Device', desc: 'Watch anywhere' },
            { icon: Smartphone, title: 'No Ads', desc: 'Uninterrupted' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h5 className="font-bold text-white mb-1">{feature.title}</h5>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
          <p className="text-gray-500 text-sm">
            © {currentYear} QuickShow. All rights reserved. Better than Netflix.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {[
              { Icon: Facebook, href: '#' },
              { Icon: Twitter, href: '#' },
              { Icon: Instagram, href: '#' },
              { Icon: Youtube, href: '#' },
            ].map(({ Icon, href }, index) => (
              <motion.a
                key={index}
                href={href}
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

          {/* Language Selector */}
          <select className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 focus:border-primary focus:outline-none">
            <option>English</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
          </select>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
