"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Target, ArrowRight } from "lucide-react"
import Link from "next/link"

const ArticlesPage = () => {
  const articles = [
    {
      title: "What is SAT?",
      description: "Learn about the SAT exam, its purpose, structure, and importance for college admissions.",
      icon: BookOpen,
      href: "/info/what-is-sat",
      color: "bg-lav",
    },
    {
      title: "How SAT is Scored",
      description: "Understand the SAT scoring system, score ranges, and how your performance is evaluated.",
      icon: Target,
      href: "/info/how-sat-is-scored",
      color: "bg-butter",
    },
    {
      title: "Test Dates & Registration",
      description: "Find out about SAT test dates, registration process, deadlines, and important information.",
      icon: Calendar,
      href: "/info/test-dates-registration",
      color: "bg-mint",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">SAT Resources</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about the SAT exam. From basics to advanced preparation strategies.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {articles.map((article) => (
            <Card
              key={article.href}
              className="group transition-colors hover:border-lav-2 bg-card overflow-hidden py-6"
            >
                            <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`paper p-3 rounded-2xl ${article.color}`}>
                    <article.icon className="h-6 w-6" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-brand transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{article.description}</p>
                <Link href={article.href}>
                  <Button className="w-full bg-primary hover:opacity-90 transition-all flex items-center gap-2">
                    Read Article
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ArticlesPage
