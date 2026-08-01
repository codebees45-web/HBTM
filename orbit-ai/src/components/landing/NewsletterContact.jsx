import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MapPin, Mail, MessageSquare } from 'lucide-react'

export default function NewsletterContact() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if(email) setSent(true)
  }

  return (
    <section className="py-24 px-6 w-full" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-16">
        
        {/* Newsletter */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{ flex: 1, background: 'var(--bg-primary)', padding: '48px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-base)' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Join the HiveMind</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Get weekly insights on cognitive optimization and deep work strategies.</p>
          
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '16px', background: 'var(--gold-dim)', color: 'var(--gold)', borderRadius: '12px', fontWeight: 600 }}>
              Welcome to the collective.
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <button type="submit" className="l-pill l-pill-primary" style={{ padding: '16px 24px', borderRadius: '12px' }}>
                <Send size={20} />
              </button>
            </form>
          )}
        </motion.div>

        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{ flex: 1, padding: '48px' }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '32px' }}>System Support</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                <Mail size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Email Protocol</strong>
                <span style={{ color: 'var(--text-secondary)' }}>support@aether-os.com</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Live Uplink</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Available 24/7 for Pro members</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
