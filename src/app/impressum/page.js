'use client'

import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Background from '../components/Background'

export default function ImpressumPage() {
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
              Legal Notice
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-12"
            >
              Impressum
            </motion.h1>

            <motion.div variants={fadeUp} className="space-y-8 text-gray-300">
              {/* Provider Information */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Information according to § 5 TMG</h2>
                <div className="space-y-2">
                  <p className="font-medium text-white">Timo Romeo</p>
                  <p>TR Productions</p>
                  <p>Trier, Germany</p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Contact</h2>
                <div className="space-y-2">
                  <p>Email: <a href="mailto:contact@trproductions.de" className="text-[#8B5CF6] hover:underline">contact@trproductions.de</a></p>
                  <p>Mixing & Mastering: <a href="mailto:mixmaster@trproductions.de" className="text-[#8B5CF6] hover:underline">mixmaster@trproductions.de</a></p>
                </div>
              </div>

              {/* VAT */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">VAT Information</h2>
                <p>Small business according to § 19 UStG (German VAT Act) - No VAT ID required.</p>
              </div>

              {/* Responsible for Content */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Responsible for Content (§ 55 Abs. 2 RStV)</h2>
                <div className="space-y-2">
                  <p className="font-medium text-white">Timo Romeo</p>
                  <p>Trier, Germany</p>
                </div>
              </div>

              {/* Dispute Resolution */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Dispute Resolution</h2>
                <p className="mb-4">
                  The European Commission provides a platform for online dispute resolution (OS):{' '}
                  <a
                    href="https://ec.europa.eu/consumers/odr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B5CF6] hover:underline break-all"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
                <p>
                  We are not willing or obliged to participate in dispute resolution proceedings
                  before a consumer arbitration board.
                </p>
              </div>

              {/* Liability for Content */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Liability for Content</h2>
                <p className="mb-4">
                  As a service provider, we are responsible for our own content on these pages in
                  accordance with general laws pursuant to § 7 Abs.1 TMG. According to §§ 8 to 10
                  TMG, however, we are not obligated as a service provider to monitor transmitted
                  or stored third-party information or to investigate circumstances that indicate
                  illegal activity.
                </p>
                <p>
                  Obligations to remove or block the use of information under general law remain
                  unaffected. However, liability in this regard is only possible from the point
                  in time at which a concrete infringement of the law becomes known. If we become
                  aware of any such legal violations, we will remove this content immediately.
                </p>
              </div>

              {/* Liability for Links */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Liability for Links</h2>
                <p className="mb-4">
                  Our website contains links to external third-party websites over whose content
                  we have no influence. Therefore, we cannot assume any liability for this
                  third-party content. The respective provider or operator of the pages is always
                  responsible for the content of the linked pages.
                </p>
                <p>
                  The linked pages were checked for possible legal violations at the time of
                  linking. Illegal content was not recognizable at the time of linking. However,
                  permanent monitoring of the content of the linked pages is not reasonable without
                  concrete evidence of a legal violation. If we become aware of any legal
                  violations, we will remove such links immediately.
                </p>
              </div>

              {/* Copyright */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Copyright</h2>
                <p className="mb-4">
                  The content and works created by the site operators on these pages are subject
                  to German copyright law. Duplication, processing, distribution, or any form of
                  commercialization of such material beyond the scope of the copyright law shall
                  require the prior written consent of its respective author or creator. Downloads
                  and copies of this site are only permitted for private, non-commercial use.
                </p>
                <p className="mb-4">
                  Insofar as the content on this site was not created by the operator, the
                  copyrights of third parties are respected. In particular, third-party content
                  is marked as such. Should you nevertheless become aware of a copyright
                  infringement, please inform us accordingly. If we become aware of any
                  infringements, we will remove such content immediately.
                </p>
                <p className="text-[#8B5CF6]">
                  All beats, instrumentals, and audio files offered on this website are protected
                  by copyright and may only be used with the appropriate license.
                </p>
              </div>

              {/* Last Updated */}
              <p className="text-gray-500 text-sm text-center pt-8">
                Last updated: January 2025
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
