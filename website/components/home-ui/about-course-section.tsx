import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BookOpen, CheckCircle, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

const AboutCourseSection = () => {
  return (
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
  )
}

export default AboutCourseSection
