import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Award, BookOpen, Calculator, Clock, FileText, Lightbulb } from "lucide-react"
import Link from "next/link"

import React from 'react'

const AboutSatSection = () => {
  return (
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
  )
}

export default AboutSatSection
