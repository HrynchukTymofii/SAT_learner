import { ArrowRight, Play, Trophy } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'


const HeroSection = () => {
  return (
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
                  className="border-white text-white bg-transparent hover:bg-white hover:text-blue-600 rounded-xl"
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
  )
}

export default HeroSection
