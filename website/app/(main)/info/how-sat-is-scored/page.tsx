import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, ArrowLeft, Calculator, Award, AlertCircle } from "lucide-react"
import Link from "next/link"

const HowSATIsScoredPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/info">
          <Button variant="outline" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Button>
        </Link>

        {/* Header */}
        <Card className="shadow-xl border-0 bg-card mb-8">
          <div className="bg-mint text-on-pastel p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">How SAT is Scored</h1>
                <p className="text-muted-foreground text-base md:text-lg">
                  Understanding the SAT scoring system and what your scores mean
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Score Overview */}
        <Card className="shadow-lg border-0 bg-card mb-8 py-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">Score Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-lav rounded-lg border border-transparent">
                <Calculator className="h-12 w-12 mx-auto mb-3 text-brand" />
                <div className="text-2xl font-bold text-foreground mb-1">200-800</div>
                <div className="text-sm text-foreground">Math Section</div>
              </div>
              <div className="text-center p-6 bg-mint rounded-lg border border-transparent">
                <Target className="h-12 w-12 mx-auto mb-3 text-success" />
                <div className="text-2xl font-bold text-foreground mb-1">200-800</div>
                <div className="text-sm text-foreground">Reading & Writing</div>
              </div>
              <div className="text-center p-6 bg-lav-2 rounded-lg border border-transparent">
                <Award className="h-12 w-12 mx-auto mb-3 text-brand" />
                <div className="text-2xl font-bold text-foreground mb-1">400-1600</div>
                <div className="text-sm text-foreground">Total Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Scoring Process */}
          <Card className="shadow-lg border-0 bg-card py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">How Scoring Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-lav border border-transparent rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Step 1: Raw Score</h3>
                <p className="text-foreground mb-3">
                  Your raw score is simply the number of questions you answered correctly. There&apos;s no penalty for wrong
                  answers, so it&apos;s always better to guess than leave a question blank.
                </p>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">Example: Math Section</div>
                  <div className="flex items-center gap-4">
                    <span className="text-foreground">Correct Answers: 45/58</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold text-brand">Raw Score: 45</span>
                  </div>
                </div>
              </div>

              <div className="bg-mint border border-transparent rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Step 2: Scaled Score</h3>
                <p className="text-foreground mb-3">
                  Raw scores are converted to scaled scores (200-800) using a process called equating. This ensures
                  fairness across different test dates and versions.
                </p>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">Conversion Example</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Raw Score: 45</span>
                      <Progress value={77} className="w-32 h-2" />
                      <span className="font-semibold text-success">Scaled: 650</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-lav-2 border border-transparent rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Step 3: Total Score</h3>
                <p className="text-foreground">
                  Your total SAT score is the sum of your Math and Evidence-Based Reading and Writing section scores.
                </p>
                <div className="bg-white rounded-lg p-4 mt-3">
                  <div className="text-sm text-muted-foreground mb-2">Total Score Calculation</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Math Section:</span>
                      <span className="font-semibold">650</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reading & Writing:</span>
                      <span className="font-semibold">620</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-bold text-brand">
                      <span>Total Score:</span>
                      <span>1270</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Ranges */}
          <Card className="shadow-lg border-0 bg-card py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">Understanding Score Ranges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Score Percentiles</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-rose rounded-lg">
                        <span className="font-medium">1400-1600</span>
                        <Badge className="bg-rose">99th+ percentile</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-butter rounded-lg">
                        <span className="font-medium">1300-1390</span>
                        <Badge className="bg-butter">90th+ percentile</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-butter rounded-lg">
                        <span className="font-medium">1200-1290</span>
                        <Badge className="bg-butter">75th+ percentile</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-lav rounded-lg">
                        <span className="font-medium">1050-1190</span>
                        <Badge className="bg-lav">50th+ percentile</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-medium">400-1040</span>
                        <Badge variant="outline">Below 50th percentile</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">What Scores Mean</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-mint border border-transparent rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">1400+ (Excellent)</h4>
                        <p className="text-foreground text-sm">
                          Competitive for top-tier colleges and universities. Eligible for merit scholarships.
                        </p>
                      </div>
                      <div className="p-4 bg-lav border border-transparent rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">1200-1390 (Good)</h4>
                        <p className="text-foreground text-sm">
                          Competitive for most colleges. Good chance of admission to state universities.
                        </p>
                      </div>
                      <div className="p-4 bg-butter border border-transparent rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">1000-1190 (Average)</h4>
                        <p className="text-foreground text-sm">
                          Meets requirements for many colleges. May need to strengthen other application areas.
                        </p>
                      </div>
                      <div className="p-4 bg-rose border border-transparent rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Below 1000</h4>
                        <p className="text-foreground text-sm">
                          Consider retaking the test. Focus on test prep and skill building.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscores */}
          <Card className="shadow-lg border-0 bg-card py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">Subscores and Cross-Test Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Test Subscores (1-15 scale)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-lav rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Reading Test</h4>
                      <ul className="text-foreground text-sm space-y-1">
                        <li>• Command of Evidence</li>
                        <li>• Words in Context</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-mint rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Writing and Language Test</h4>
                      <ul className="text-foreground text-sm space-y-1">
                        <li>• Expression of Ideas</li>
                        <li>• Standard English Conventions</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-lav-2 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Math Test</h4>
                      <ul className="text-foreground text-sm space-y-1">
                        <li>• Heart of Algebra</li>
                        <li>• Problem Solving and Data Analysis</li>
                        <li>• Passport to Advanced Math</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-butter rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Cross-Test Scores (10-40 scale)</h4>
                      <ul className="text-foreground text-sm space-y-1">
                        <li>• Analysis in History/Social Studies</li>
                        <li>• Analysis in Science</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Improvement Tips */}
          <Card className="shadow-lg border-0 bg-card py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">Score Improvement Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Math Section
                  </h3>
                  <ul className="space-y-2 text-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-mint rounded-full mt-2"></div>
                      <span>Master algebra fundamentals and linear equations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-mint rounded-full mt-2"></div>
                      <span>Practice data analysis and statistics problems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-mint rounded-full mt-2"></div>
                      <span>Learn when to use and not use a calculator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-mint rounded-full mt-2"></div>
                      <span>Focus on advanced math concepts like quadratics</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand" />
                    Reading & Writing
                  </h3>
                  <ul className="space-y-2 text-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-lav rounded-full mt-2"></div>
                      <span>Read actively and practice finding evidence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-lav rounded-full mt-2"></div>
                      <span>Learn grammar rules and punctuation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-lav rounded-full mt-2"></div>
                      <span>Practice vocabulary in context</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-lav rounded-full mt-2"></div>
                      <span>Analyze charts, graphs, and data</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-6 bg-lav rounded-lg border border-transparent">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-brand mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Pro Tip</h4>
                    <p className="text-foreground text-sm">
                      Most students can improve their scores by 100-200 points with dedicated practice. Take practice
                      tests under timed conditions and review your mistakes carefully.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
          <Link href="/info/what-is-sat">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Previous: What is SAT?
            </Button>
          </Link>
          <div className="flex gap-4">
            <Link href="/info/test-dates-registration">
              <Button className="flex items-center gap-2">
                Next: Test Dates & Registration
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowSATIsScoredPage
