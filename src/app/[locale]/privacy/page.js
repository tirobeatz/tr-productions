'use client'

import { motion } from 'framer-motion'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Background from '@/app/components/Background'
import { useT } from '@/i18n/I18nProvider'

export default function PrivacyPage() {
  const t = useT()
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      <Background />
      <Header />

      <div className="relative z-10">

      <section className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.p
              variants={fadeUp}
              className="text-[#8B5CF6] font-medium mb-4 tracking-[0.2em] uppercase text-xs"
            >
              {t('legal.privacy.label')}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-12"
            >
              {t('legal.privacy.title')}
            </motion.h1>

            <motion.div variants={fadeUp} className="space-y-8 text-gray-300">
              {/* Overview */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">1. Privacy at a Glance</h2>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">General Information</h3>
                <p className="mb-4">
                  The following information provides a simple overview of what happens to your
                  personal data when you visit this website. Personal data is any data that can
                  be used to personally identify you.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">Data Collection on This Website</h3>
                <p className="mb-2"><strong className="text-white">Who is responsible for data collection on this website?</strong></p>
                <p className="mb-4">
                  Data processing on this website is carried out by the website operator:<br />
                  Timo Romeo, TR Productions, Trier, Germany<br />
                  Email: contact@trproductions.de
                </p>

                <p className="mb-2"><strong className="text-white">How do we collect your data?</strong></p>
                <p className="mb-4">
                  Your data is collected in part by you providing it to us (e.g., via contact forms,
                  beat purchases, or mixing requests). Other data is collected automatically or with
                  your consent when you visit the website through our IT systems.
                </p>

                <p className="mb-2"><strong className="text-white">What do we use your data for?</strong></p>
                <p>
                  Some of the data is collected to ensure error-free provision of the website.
                  Other data may be used to analyze your user behavior, process payments, or
                  communicate with you.
                </p>
              </div>

              {/* Hosting */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">2. Hosting</h2>
                <p className="mb-4">
                  This website is hosted by an external service provider (hoster). The personal
                  data collected on this website is stored on the hoster's servers. This may
                  include IP addresses, contact requests, meta and communication data, contract
                  data, contact details, names, website accesses, and other data generated via
                  a website.
                </p>
                <p>
                  The use of the hoster is in the interest of secure, fast, and efficient
                  provision of our online offering by a professional provider (Art. 6 para. 1
                  lit. f GDPR).
                </p>
              </div>

              {/* General Information */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">3. General Information and Mandatory Disclosures</h2>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">Data Protection</h3>
                <p className="mb-4">
                  The operators of this website take the protection of your personal data very
                  seriously. We treat your personal data confidentially and in accordance with
                  statutory data protection regulations and this privacy policy.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">Responsible Party</h3>
                <p className="mb-4">
                  The responsible party for data processing on this website is:<br /><br />
                  Timo Romeo<br />
                  TR Productions<br />
                  Trier, Germany<br />
                  Email: contact@trproductions.de
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">Storage Duration</h3>
                <p className="mb-4">
                  Unless a more specific storage period has been specified within this privacy
                  policy, your personal data will remain with us until the purpose for data
                  processing no longer applies. If you assert a legitimate request for deletion
                  or revoke your consent to data processing, your data will be deleted unless
                  we have other legally permissible reasons for storing your personal data.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">Your Rights</h3>
                <p className="mb-2">You have the right at any time to:</p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Obtain information about your stored data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Request restriction of data processing</li>
                  <li>Request data portability</li>
                  <li>Object to data processing</li>
                  <li>Lodge a complaint with a supervisory authority</li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">Withdrawal of Consent</h3>
                <p>
                  Many data processing operations are only possible with your express consent.
                  You can withdraw consent you have already given at any time. The legality of
                  data processing carried out before the withdrawal remains unaffected by the withdrawal.
                </p>
              </div>

              {/* Cookies */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">4. Cookies</h2>
                <p className="mb-4">
                  Our website uses cookies. Cookies do not harm your computer and do not contain
                  viruses. Cookies serve to make our offering more user-friendly, effective, and secure.
                </p>
                <p className="mb-4">
                  Cookies are small text files that are stored on your computer by your browser.
                  Most of the cookies we use are so-called "session cookies." They are automatically
                  deleted after your visit ends.
                </p>
                <p className="mb-4">
                  You can set your browser so that you are informed about the setting of cookies
                  and only allow cookies in individual cases, exclude the acceptance of cookies
                  for certain cases or in general, and activate automatic deletion of cookies
                  when closing the browser.
                </p>
                <p className="mb-4">
                  <strong className="text-white">We use the following types of cookies:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Necessary cookies:</strong> Required for website operation (e.g., shopping cart function for beat purchases)</li>
                  <li><strong>Preference cookies:</strong> Store your settings (e.g., cookie consent)</li>
                </ul>
              </div>

              {/* Contact Forms */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">5. Contact Forms and Requests</h2>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">Contact Form</h3>
                <p className="mb-4">
                  If you send us inquiries via the contact form, your details from the inquiry
                  form, including the contact data you provided there, will be stored by us for
                  the purpose of processing the inquiry and in case of follow-up questions.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">Mixing & Mastering Requests</h3>
                <p className="mb-4">
                  For mixing and mastering service requests, we collect: name, email, track name,
                  genre, reference track (optional), notes, and selected delivery option. This
                  data is used to process your request and communicate with you.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">Studio Bookings</h3>
                <p>
                  For studio booking requests, we collect: name, email, desired date, session
                  type, and optional notes. This data is used for appointment coordination and communication.
                </p>
              </div>

              {/* Payment Processing */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">6. Payment Processing (Stripe)</h2>
                <p className="mb-4">
                  For payment processing of beat purchases, we use the payment service provider
                  Stripe (Stripe, Inc., 510 Townsend Street, San Francisco, CA 94103, USA).
                </p>
                <p className="mb-4">
                  The following data is transmitted to Stripe during payment:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Email address</li>
                  <li>Name (if provided)</li>
                  <li>Payment information (credit card data is processed directly by Stripe)</li>
                  <li>IP address</li>
                  <li>Transaction amount and details</li>
                </ul>
                <p className="mb-4">
                  Stripe processes this data to execute the payment and for fraud prevention.
                  Stripe's privacy policy can be found at:{' '}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B5CF6] hover:underline"
                  >
                    https://stripe.com/privacy
                  </a>
                </p>
                <p>
                  The legal basis for data processing is Art. 6 para. 1 lit. b GDPR (contract fulfillment).
                </p>
              </div>

              {/* Email Service */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">7. Email Delivery (Resend)</h2>
                <p className="mb-4">
                  For sending transactional emails (e.g., purchase confirmations, download links),
                  we use the service Resend (Resend, Inc.).
                </p>
                <p className="mb-4">
                  The following data is processed when sending emails:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Recipient's email address</li>
                  <li>Name (if available)</li>
                  <li>Order information</li>
                </ul>
                <p>
                  Resend's privacy policy can be found at:{' '}
                  <a
                    href="https://resend.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B5CF6] hover:underline"
                  >
                    https://resend.com/legal/privacy-policy
                  </a>
                </p>
              </div>

              {/* Database */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">8. Database and Storage (Supabase)</h2>
                <p className="mb-4">
                  For data storage, we use Supabase (Supabase, Inc.). Supabase provides a
                  PostgreSQL database and file storage.
                </p>
                <p className="mb-4">
                  The following data is stored:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Contact requests and form data</li>
                  <li>Order information and transaction data</li>
                  <li>Mixing/mastering requests</li>
                  <li>Studio booking requests</li>
                  <li>Audio files and images (beats, covers)</li>
                </ul>
                <p>
                  Supabase's privacy policy can be found at:{' '}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B5CF6] hover:underline"
                  >
                    https://supabase.com/privacy
                  </a>
                </p>
              </div>

              {/* Beat Purchases */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">9. Beat Purchases and Downloads</h2>
                <p className="mb-4">
                  When purchasing beats, the following data is collected and processed:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Email address (for purchase confirmation and download link)</li>
                  <li>Name (optional, for the license)</li>
                  <li>Purchased products and licenses</li>
                  <li>Payment information (via Stripe)</li>
                  <li>Download token and timestamp</li>
                </ul>
                <p className="mb-4">
                  This data is stored for contract fulfillment (provision of beats and licenses)
                  and for accounting purposes.
                </p>
                <p>
                  The storage period is at least 10 years in accordance with commercial and tax
                  law retention requirements.
                </p>
              </div>

              {/* Social Media */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">10. Social Media</h2>
                <p className="mb-4">
                  Our website contains links to our social media profiles (Instagram, YouTube,
                  TikTok). When you click on these links, you will be redirected to the
                  respective platforms.
                </p>
                <p>
                  Data is only transferred to the respective providers when you click on the
                  link. We have no influence on the data processing by these providers.
                  Information on data processing can be found in the privacy policies of the
                  respective providers.
                </p>
              </div>

              {/* SSL/TLS */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">11. SSL/TLS Encryption</h2>
                <p>
                  This site uses SSL or TLS encryption for security reasons and to protect the
                  transmission of confidential content, such as orders or inquiries that you
                  send to us as the site operator. You can recognize an encrypted connection
                  by the fact that the browser's address line changes from "http://" to "https://"
                  and by the lock symbol in your browser line.
                </p>
              </div>

              {/* Last Updated */}
              <p className="text-gray-500 text-sm text-center pt-8">
                {t('legal.lastUpdated')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
      </div>
    </main>
  )
}
