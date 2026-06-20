'use client'

import { motion } from 'framer-motion'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Background from '@/app/components/Background'
import { useT } from '@/i18n/I18nProvider'

export default function TermsPage() {
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
              {t('legal.terms.label')}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-12"
            >
              {t('legal.terms.title')}
            </motion.h1>

            <motion.div variants={fadeUp} className="space-y-8 text-gray-300">
              {/* General */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">1. General Terms</h2>
                <p className="mb-4">
                  These Terms and Conditions govern the use of the TR Productions website
                  (trproductions.de) and all services offered, including beat sales, mixing
                  and mastering services, and studio bookings.
                </p>
                <p className="mb-4">
                  By using this website or purchasing any products or services, you agree to
                  these Terms and Conditions. If you do not agree with any part of these terms,
                  please do not use our services.
                </p>
                <p>
                  <strong className="text-white">Provider:</strong><br />
                  Timo Romeo / TR Productions<br />
                  Trier, Germany<br />
                  Email: contact@trproductions.de
                </p>
              </div>

              {/* Beat Licenses */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">2. Beat Licenses</h2>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">2.1 License Types</h3>
                <p className="mb-4">
                  TR Productions offers the following license types for beats:
                </p>

                <div className="space-y-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-[#8B5CF6] mb-2">MP3 Lease</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>MP3 file (320kbps)</li>
                      <li>Up to 50,000 streams/sales</li>
                      <li>Non-exclusive license</li>
                      <li>Credit required: "Prod. by TR Productions"</li>
                      <li><strong className="text-[#8B5CF6]">Publishing split: 20%</strong> to producer</li>
                      <li>Cannot be used for NFTs or AI training</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-[#8B5CF6] mb-2">WAV Lease</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>High-quality WAV file</li>
                      <li>Up to 100,000 streams/sales</li>
                      <li>Non-exclusive license</li>
                      <li>Credit required: "Prod. by TR Productions"</li>
                      <li><strong className="text-[#8B5CF6]">Publishing split: 20%</strong> to producer</li>
                      <li>Radio broadcasting rights (up to 2 stations)</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-[#8B5CF6] mb-2">Stems/Trackout</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Individual track stems (WAV)</li>
                      <li>Up to 250,000 streams/sales</li>
                      <li>Non-exclusive license</li>
                      <li>Credit required: "Prod. by TR Productions"</li>
                      <li><strong className="text-[#8B5CF6]">Publishing split: 20%</strong> to producer</li>
                      <li>1 music video allowed</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-[#8B5CF6]/30">
                    <h4 className="font-semibold text-[#8B5CF6] mb-2">Exclusive Rights</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Full ownership of the master recording</li>
                      <li>Unlimited streams/sales</li>
                      <li>Beat removed from store after purchase</li>
                      <li>Credit appreciated but not required</li>
                      <li>Full commercial rights</li>
                      <li><strong className="text-[#8B5CF6]">Publishing split: 20%</strong> to producer</li>
                      <li>Unlimited music videos</li>
                      <li>Radio, TV, and sync licensing allowed</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">2.2 Publishing Rights & Splits Explained</h3>
                <p className="mb-4">
                  <strong className="text-white">What is a publishing split?</strong> When a song earns royalties
                  (from streaming, radio play, TV placements, etc.), those royalties are split between the
                  songwriter(s) and the publisher(s). The producer of the beat is typically entitled to a
                  share of the composition/publishing rights.
                </p>
                <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-xl p-4 mb-4">
                  <p className="text-sm mb-2"><strong className="text-white">For ALL Beat Licenses (MP3, WAV, Stems, Exclusive):</strong></p>
                  <p className="text-sm text-gray-400 mb-3">A <strong className="text-[#8B5CF6]">20% publishing split</strong> applies to all licenses. This means TR Productions (Timo Romeo) retains 20% of the publishing/composition rights, while you receive 80%. You pay the upfront license fee and keep 80% of all royalties earned from the song.</p>

                  <p className="text-sm mb-2"><strong className="text-white">What does this mean in practice?</strong></p>
                  <p className="text-sm text-gray-400">If your song earns €10,000 in royalties, you keep €8,000 and the producer receives €2,000. This is a fair split that recognizes the creative contribution of the beat while ensuring you keep the majority of your earnings.</p>
                </div>
                <p className="mb-4">
                  <strong className="text-white">Why 20% for all licenses?</strong> The beat is the foundation of your song.
                  As the producer, I created the melody, chords, drums, and arrangement. The 20% split
                  is a fair and transparent way to recognize this creative contribution while ensuring
                  you keep the majority (80%) of your royalties.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">2.3 How Royalty Collection Works</h3>
                <p className="mb-4">
                  To ensure proper royalty collection for both parties, please follow these steps when releasing your song:
                </p>
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li><strong className="text-white">Register with a PRO:</strong> Both the artist and producer should be registered with a Performance Rights Organization (e.g., GEMA in Germany, ASCAP/BMI in USA, PRS in UK).</li>
                    <li><strong className="text-white">Register the song:</strong> When you distribute your song (via DistroKid, TuneCore, etc.), register it with your PRO and list the songwriters/composers.</li>
                    <li><strong className="text-white">List the producer:</strong> Add "Timo Romeo" (IPI: will be provided upon purchase) as a co-writer with 20% share.</li>
                    <li><strong className="text-white">Automatic collection:</strong> Once registered, PROs automatically collect and distribute royalties based on the registered splits.</li>
                  </ol>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  <strong className="text-white">Producer PRO Info:</strong> Timo Romeo is registered with SACEM Luxembourg.
                  IPI number and full registration details will be included in your license PDF upon purchase.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">2.4 License Restrictions</h3>
                <p className="mb-4">
                  Unless you have purchased exclusive rights, the following restrictions apply:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You may not resell, redistribute, or give away the beat</li>
                  <li>You may not register the beat with a PRO (unless exclusive)</li>
                  <li>You may not claim ownership of the underlying composition</li>
                  <li>The beat may continue to be sold to other artists (non-exclusive)</li>
                  <li>You may not use the beat for NFTs, AI training, or similar purposes</li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">2.5 Credit Requirements</h3>
                <p>
                  For all non-exclusive licenses, you must credit "Prod. by TR Productions" or
                  "Prod. by Timo Romeo" in the song title, description, or credits. Failure to
                  provide proper credit may result in license termination.
                </p>
              </div>

              {/* Beat Purchases */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">3. Beat Purchases</h2>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">3.1 Payment</h3>
                <p className="mb-4">
                  All payments are processed securely through Stripe. We accept major credit
                  cards and other payment methods supported by Stripe. All prices are displayed
                  in EUR and include applicable taxes where required.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">3.2 Delivery</h3>
                <p className="mb-4">
                  Upon successful payment, you will receive:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>An email confirmation with your order details</li>
                  <li>A download link for your purchased files</li>
                  <li>A PDF license agreement</li>
                </ul>
                <p>
                  Download links are valid for 7 days and can be used up to 5 times. If you
                  need a new download link, please contact us.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">3.3 Refund Policy</h3>
                <p className="mb-4">
                  Due to the digital nature of our products, all sales are final. We do not
                  offer refunds for beat purchases once the download link has been accessed.
                </p>
                <p>
                  If you experience technical issues with your download or received incorrect
                  files, please contact us within 48 hours and we will resolve the issue.
                </p>
              </div>

              {/* Mixing & Mastering */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">4. Mixing & Mastering Services</h2>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">4.1 Service Description</h3>
                <p className="mb-4">
                  Our mixing and mastering service includes professional processing of your
                  audio tracks to achieve radio-ready sound quality. The standard service
                  includes:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Full mixing of vocals and instrumental</li>
                  <li>EQ, compression, and effects processing</li>
                  <li>Mastering for streaming platforms</li>
                  <li>Delivery in WAV and MP3 formats</li>
                  <li>One revision included</li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">4.2 Credits & Royalties</h3>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-300">
                    <strong className="text-green-400">No royalty split required!</strong> Unlike beat licenses, mixing and mastering
                    services are paid as a flat fee with <strong className="text-white">no publishing or royalty split</strong>. You keep 100%
                    of your royalties from the final song.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    <strong className="text-white">Credit requirement:</strong> Please credit "Mixed by TR Productions" or
                    "Mixed & Mastered by Timo Romeo" in your song credits/description. This helps support the service
                    and is greatly appreciated!
                  </p>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">4.3 Pricing</h3>
                <p className="mb-4">
                  <strong className="text-white">Standard Mix & Master:</strong> €60 per track (2-3 business days)<br />
                  <strong className="text-white">Rush Delivery:</strong> +€30 (24-48 hours)<br />
                  <strong className="text-white">Additional Revisions:</strong> €15 each<br />
                  <strong className="text-white">Bulk Discount:</strong> 15% off for 5+ tracks
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">4.4 File Requirements</h3>
                <p className="mb-4">
                  For best results, please provide:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Vocal recordings in WAV format (minimum 44.1kHz/16bit)</li>
                  <li>Instrumental/beat file (preferably stems if available)</li>
                  <li>Reference track (optional but helpful)</li>
                  <li>Any specific instructions or preferences</li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">4.5 Revisions</h3>
                <p className="mb-4">
                  One revision is included with each mix. Please provide clear, specific
                  feedback for revisions. Additional revisions beyond the first are charged
                  at €15 per revision.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">4.6 Payment Terms</h3>
                <p>
                  Payment is required before work begins. For larger projects (5+ tracks),
                  a 50% deposit may be arranged with the remaining balance due upon completion.
                </p>
              </div>

              {/* Studio Sessions */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">5. Studio Sessions</h2>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">5.1 Booking</h3>
                <p className="mb-4">
                  Studio sessions can be booked through our website or by contacting us directly.
                  Sessions are subject to availability and require confirmation before they are
                  considered booked.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">5.2 Cancellation Policy</h3>
                <p className="mb-4">
                  <strong className="text-white">48+ hours notice:</strong> Full refund or reschedule<br />
                  <strong className="text-white">24-48 hours notice:</strong> 50% fee applies<br />
                  <strong className="text-white">Less than 24 hours:</strong> Full session fee applies
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3 text-white">5.3 Studio Rules</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>No smoking or vaping inside the studio</li>
                  <li>Maximum 3 guests unless arranged in advance</li>
                  <li>No alcohol or illegal substances</li>
                  <li>Respect the equipment and space</li>
                  <li>Arrive on time; late arrival reduces your session time</li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">6. Intellectual Property</h2>
                <p className="mb-4">
                  All beats, instrumentals, and audio content on this website are the intellectual
                  property of TR Productions / Timo Romeo unless otherwise stated.
                </p>
                <p className="mb-4">
                  Purchasing a license grants you specific usage rights as defined in your license
                  type. It does not transfer copyright ownership of the underlying composition
                  (unless exclusive rights are purchased).
                </p>
                <p>
                  Unauthorized use, reproduction, or distribution of our content without proper
                  licensing is strictly prohibited and may result in legal action.
                </p>
              </div>

              {/* Liability */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">7. Limitation of Liability</h2>
                <p className="mb-4">
                  TR Productions provides services and products "as is" without warranties of
                  any kind, either express or implied.
                </p>
                <p className="mb-4">
                  We are not liable for any indirect, incidental, special, or consequential
                  damages arising from the use of our products or services.
                </p>
                <p>
                  Our total liability for any claim arising from or related to these terms
                  shall not exceed the amount paid by you for the specific product or service
                  giving rise to the claim.
                </p>
              </div>

              {/* Disputes */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">8. Disputes and Governing Law</h2>
                <p className="mb-4">
                  These Terms and Conditions are governed by and construed in accordance with
                  the laws of the Federal Republic of Germany.
                </p>
                <p className="mb-4">
                  In case of disputes, we encourage you to contact us first to seek an amicable
                  resolution. If a resolution cannot be reached, disputes shall be subject to
                  the exclusive jurisdiction of the courts in Trier, Germany.
                </p>
                <p>
                  The European Commission's online dispute resolution platform is available at:{' '}
                  <a
                    href="https://ec.europa.eu/consumers/odr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B5CF6] hover:underline"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
              </div>

              {/* Changes */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">9. Changes to Terms</h2>
                <p className="mb-4">
                  We reserve the right to modify these Terms and Conditions at any time.
                  Changes will be posted on this page with an updated revision date.
                </p>
                <p>
                  Your continued use of our website and services after changes are posted
                  constitutes your acceptance of the modified terms.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-white">10. Contact</h2>
                <p className="mb-4">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <p>
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:contact@trproductions.de" className="text-[#8B5CF6] hover:underline">
                    contact@trproductions.de
                  </a>
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
