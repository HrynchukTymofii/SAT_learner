import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BookOpen, Calculator, Play } from "lucide-react"
import Link from "next/link"

const TasteFirstSection = () => {
  return (
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
                  <Link href="/test">
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
  )
}

export default TasteFirstSection
