import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Target,
  TrendingUp,
  Calculator,
  Award,
  BookOpen,
  Star,
  CheckCircle,
  ArrowRight,
  Clock,
  Trophy,
  Lightbulb,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Play,
  FileText,
} from "lucide-react"
import Link from "next/link"

export default function SATHomepage() {
  return (
    <div className="min-h-screen max-w-7xl w-full mt-4">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 text-white py-16 md:py-24 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-white/20 text-white border-white/30 w-fit">🎯 #1 SAT Prep Platform</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Master the SAT with
                <span className="block text-yellow-300">Confidence</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Join thousands of students who've improved their scores by 200+ points. Get personalized prep, practice
                tests, and expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 rounded-xl"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-sm rounded-xl">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Trophy className="h-16 w-16 mx-auto text-yellow-300" />
                    <h3 className="text-2xl font-bold">Average Score Increase</h3>
                    <div className="text-5xl font-bold text-yellow-300">+240</div>
                    <p className="text-blue-100">Points improvement</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Taste First Section */}
      <section className="py-16 bg-white mt-4 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Try Before You Buy</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience our platform with a free practice test and sample lesson
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300 rounded-xl">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-blue-600 rounded-full w-fit mx-auto">
                    <Calculator className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">Free Practice Test</h3>
                  <p className="text-blue-700">Take a full-length SAT practice test and get detailed score analysis</p>
                  <Link href="/tests">
                    <Button className="bg-blue-600 hover:bg-blue-700 w-full rounded-xl">
                      Start Practice Test
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300 rounded-xl">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-600 rounded-full w-fit mx-auto">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900">Sample Lesson</h3>
                  <p className="text-green-700">
                    Preview our comprehensive course with a free lesson on algebra fundamentals
                  </p>
                  <Link href="/course">
                    <Button className="bg-green-600 hover:bg-green-700 w-full rounded-xl">
                      Watch Free Lesson
                      <Play className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Course Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-800 mb-4">Our Course</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Complete SAT Preparation Course</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to achieve your target score in one comprehensive program
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Personalized Learning</h3>
                  <p className="text-slate-600">AI-powered study plan adapted to your strengths and weaknesses</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Expert Content</h3>
                  <p className="text-slate-600">Created by SAT experts with 15+ years of teaching experience</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Progress Tracking</h3>
                  <p className="text-slate-600">Detailed analytics and progress reports to monitor improvement</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl md:text-3xl font-bold">What's Included</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span>40+ hours of video lessons</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span>1000+ practice questions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span>8 full-length practice tests</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span>Detailed explanations for every question</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span>Mobile app for studying on-the-go</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-2xl">
                    <video
                      className="w-full h-full object-cover"
                      poster="/placeholder.svg?height=400&width=600"
                      controls
                      preload="metadata"
                    >
                      <source src="/course-preview.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="text-center mt-6">
                    <Link href="/course">
                      <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 rounded-xl">
                        Explore Full Course
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About SAT Section */}
      <section className="py-16 bg-white rounded-3xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-800 mb-4">Learn About SAT</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Know About the SAT
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get comprehensive information about the SAT exam structure, scoring, and preparation tips
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/info/what-is-sat">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-100 rounded-xl w-fit group-hover:bg-blue-200 transition-colors">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">What is SAT?</h3>
                    <p className="text-slate-600 text-sm">
                      Learn about the SAT exam format, sections, and what to expect on test day
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/info/how-sat-is-scored">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-green-100 rounded-xl w-fit group-hover:bg-green-200 transition-colors">
                      <Calculator className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">How SAT is Scored</h3>
                    <p className="text-slate-600 text-sm">
                      Understand the SAT scoring system and what your scores mean for college admissions
                    </p>
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/info/test-dates-registration">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-100 rounded-xl w-fit group-hover:bg-purple-200 transition-colors">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Test Dates & Registration</h3>
                    <p className="text-slate-600 text-sm">
                      Find upcoming SAT test dates and learn how to register for the exam
                    </p>
                    <div className="flex items-center text-purple-600 text-sm font-medium">
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/info/study-tips">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-100 rounded-xl w-fit group-hover:bg-amber-200 transition-colors">
                      <Lightbulb className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Study Tips & Strategies</h3>
                    <p className="text-slate-600 text-sm">
                      Proven strategies and tips to maximize your SAT preparation effectiveness
                    </p>
                    <div className="flex items-center text-amber-600 text-sm font-medium">
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/info/college-admissions">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-red-100 rounded-xl w-fit group-hover:bg-red-200 transition-colors">
                      <Award className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">College Admissions</h3>
                    <p className="text-slate-600 text-sm">
                      How SAT scores impact college admissions and scholarship opportunities
                    </p>
                    <div className="flex items-center text-red-600 text-sm font-medium">
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/info">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-100 to-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-300 rounded-xl w-fit group-hover:bg-slate-400 transition-colors">
                      <BookOpen className="h-6 w-6 text-slate-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">View All Articles</h3>
                    <p className="text-slate-600 text-sm">
                      Browse our complete collection of SAT preparation articles and guides
                    </p>
                    <div className="flex items-center text-slate-700 text-sm font-medium">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section with Marquee */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-800 mb-4">Student Success</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What Our Students Say</h2>
            <p className="text-xl text-slate-600">
              Join thousands of successful students who achieved their dream scores
            </p>
          </div>

          {/* Marquee Container */}
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee space-x-6">
              {/* Review Cards */}
              <Card className=" border-0 bg-white min-w-[300px] md:min-w-[350px] rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700">
                      "Improved my score from 1200 to 1480! The personalized study plan was exactly what I needed."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">SM</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Sarah M.</div>
                        <div className="text-sm text-slate-500">Score: 1480</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className=" border-0 bg-white min-w-[300px] md:min-w-[350px] rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700">
                      "The practice tests were incredibly realistic. I felt completely prepared on test day!"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">JL</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">James L.</div>
                        <div className="text-sm text-slate-500">Score: 1520</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className=" border-0 bg-white min-w-[300px] md:min-w-[350px] rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700">
                      "Amazing platform! The explanations helped me understand concepts I struggled with for months."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">EK</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Emily K.</div>
                        <div className="text-sm text-slate-500">Score: 1450</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className=" border-0 bg-white min-w-[300px] md:min-w-[350px] rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700">
                      "Got into my dream college thanks to this prep course. Worth every penny!"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 font-semibold">MR</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Michael R.</div>
                        <div className="text-sm text-slate-500">Score: 1490</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Duplicate cards for seamless loop */}
              <Card className=" border-0 bg-white min-w-[300px] md:min-w-[350px] rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700">
                      "Improved my score from 1200 to 1480! The personalized study plan was exactly what I needed."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">SM</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Sarah M.</div>
                        <div className="text-sm text-slate-500">Score: 1480</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-8 text-slate-600">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">10,000+</div>
                <div className="text-sm">Students Helped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">4.9/5</div>
                <div className="text-sm">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">240+</div>
                <div className="text-sm">Avg Score Increase</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-white rounded-3xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-amber-100 text-amber-800 mb-4">Pro Tips</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">SAT Success Tips</h2>
            <p className="text-xl text-slate-600">Expert strategies to maximize your SAT performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-3 bg-blue-600 rounded-xl w-fit">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900">Time Management</h3>
                  <p className="text-blue-800">
                    Learn to pace yourself effectively. Spend no more than 1.5 minutes per question in Reading and
                    Writing sections.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-3 bg-green-600 rounded-xl w-fit">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900">Process of Elimination</h3>
                  <p className="text-green-800">
                    Always eliminate obviously wrong answers first. This increases your chances even when guessing.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-3 bg-purple-600 rounded-xl w-fit">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-900">Read Actively</h3>
                  <p className="text-purple-800">
                    Engage with passages by underlining key points and making mental summaries as you read.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-3 bg-amber-600 rounded-xl w-fit">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-900">Calculator Strategy</h3>
                  <p className="text-amber-800">
                    Use your calculator wisely. Some problems are faster to solve by hand than with a calculator.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-3 bg-red-600 rounded-xl w-fit">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-red-900">Practice Consistently</h3>
                  <p className="text-red-800">
                    Study for 30-60 minutes daily rather than cramming. Consistent practice leads to better retention.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-3 bg-teal-600 rounded-xl w-fit">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-teal-900">Review Mistakes</h3>
                  <p className="text-teal-800">
                    Always review incorrect answers. Understanding your mistakes is key to improvement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-slate-100 text-slate-800 mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-600">Get answers to common questions about our SAT prep program</p>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      How much can I realistically improve my SAT score?
                    </h3>
                    <p className="text-slate-600">
                      Most students see improvements of 100-300 points with dedicated preparation. Our average student
                      improves by 240 points. The key is consistent practice and focusing on your weak areas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <HelpCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">How long should I prepare for the SAT?</h3>
                    <p className="text-slate-600">
                      We recommend 2-4 months of preparation, studying 30-60 minutes daily. This gives you enough time
                      to learn concepts, practice, and take multiple practice tests without burning out.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <HelpCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Can I access the course on my mobile device?
                    </h3>
                    <p className="text-slate-600">
                      Yes! Our platform is fully mobile-responsive and we also offer a dedicated mobile app. You can
                      study anywhere, anytime, and your progress syncs across all devices.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <HelpCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      What if I'm not satisfied with the course?
                    </h3>
                    <p className="text-slate-600">
                      We offer a 30-day money-back guarantee. If you're not completely satisfied with our course within
                      the first 30 days, we'll refund your payment in full, no questions asked.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white rounded-t-3xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-800 mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-slate-600">Flexible pricing options to fit your preparation timeline</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1 Month Plan */}
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">1 Month</h3>
                    <p className="text-slate-600">Perfect for quick review</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-slate-900">$49</div>
                    <div className="text-slate-500">/month</div>
                  </div>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Full course access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Practice tests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Mobile app access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Progress tracking</span>
                    </div>
                  </div>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl">Get Started</Button>
                </div>
              </CardContent>
            </Card>

            {/* 3 Month Plan - Most Popular */}
            <Card className="shadow-xl border-2 border-blue-500 bg-white relative rounded-xl">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">3 Months</h3>
                    <p className="text-slate-600">Recommended preparation time</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-blue-600">$99</div>
                    <div className="text-slate-500">/3 months</div>
                    <div className="text-sm text-green-600 font-medium">Save 33%</div>
                  </div>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Full course access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Practice tests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Mobile app access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Progress tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Email support</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">Get Started</Button>
                </div>
              </CardContent>
            </Card>

            {/* 1 Year Plan */}
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">1 Year</h3>
                    <p className="text-slate-600">Maximum flexibility & value</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-green-600">$149</div>
                    <div className="text-slate-500">/year</div>
                    <div className="text-sm text-green-600 font-medium">Save 75%</div>
                  </div>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Full course access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Practice tests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Mobile app access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Progress tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Priority email support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700">Score guarantee</span>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 rounded-xl">Get Started</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-600">All plans include a 30-day money-back guarantee</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Achieve Your Dream SAT Score?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful students who've improved their scores with our proven system. Start your
            journey today with a free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-xl">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-xl">
              Schedule Demo Call
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-slate-100 text-slate-800 mb-4">Contact Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-slate-600">Have questions? We're here to help you succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <Card className="shadow-lg border-0 bg-white rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Email Support</h3>
                      <p className="text-slate-600">support@satprep.com</p>
                      <p className="text-sm text-slate-500">Response within 24 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Phone Support</h3>
                      <p className="text-slate-600">1-800-SAT-PREP</p>
                      <p className="text-sm text-slate-500">Mon-Fri, 9AM-6PM EST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Office</h3>
                      <p className="text-slate-600">123 Education St</p>
                      <p className="text-slate-600">Learning City, LC 12345</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-0 bg-white rounded-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input placeholder="First Name" />
                    <Input placeholder="Last Name" />
                  </div>
                  <Input type="email" placeholder="Email Address" />
                  <Input placeholder="Subject" />
                  <textarea
                    className="w-full p-3 border border-slate-200 rounded-xl resize-none h-32"
                    placeholder="Your message..."
                  ></textarea>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">SAT Prep Pro</span>
              </div>
              <p className="text-slate-400">
                Helping students achieve their dream SAT scores with personalized preparation and expert guidance.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Platform</h4>
              <div className="space-y-2">
                <Link href="/tests" className="block text-slate-400 hover:text-white transition-colors">
                  Practice Tests
                </Link>
                <Link href="/course" className="block text-slate-400 hover:text-white transition-colors">
                  Course
                </Link>
                <Link href="/info" className="block text-slate-400 hover:text-white transition-colors">
                  SAT Info
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Support</h4>
              <div className="space-y-2">
                <Link href="/help" className="block text-slate-400 hover:text-white transition-colors">
                  Help Center
                </Link>
                <Link href="/contact" className="block text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
                <Link href="/faq" className="block text-slate-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/refund" className="block text-slate-400 hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">© {new Date().getFullYear()} SAT Prep Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
