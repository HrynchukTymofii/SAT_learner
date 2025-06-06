import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "1 Month",
      description: "Perfect for quick review",
      price: "$49",
      period: "/month",
      features: ["Full course access", "Practice tests", "Mobile app access", "Progress tracking"],
      buttonClass: "bg-slate-900 hover:bg-slate-800",
      popular: false,
    },
    {
      name: "3 Months",
      description: "Recommended preparation time",
      price: "$99",
      period: "/3 months",
      savings: "Save 33%",
      features: ["Full course access", "Practice tests", "Mobile app access", "Progress tracking", "Email support"],
      buttonClass: "bg-blue-600 hover:bg-blue-700",
      popular: true,
    },
    {
      name: "1 Year",
      description: "Maximum flexibility & value",
      price: "$149",
      period: "/year",
      savings: "Save 75%",
      features: [
        "Full course access",
        "Practice tests",
        "Mobile app access",
        "Progress tracking",
        "Priority email support",
        "Score guarantee",
      ],
      buttonClass: "bg-green-600 hover:bg-green-700",
      popular: false,
    },
  ]

  return (
    <section className="py-16 bg-white rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-green-100 text-green-800 mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-slate-600">Flexible pricing options to fit your preparation timeline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 rounded-xl ${
                plan.popular ? "shadow-xl border-2 border-blue-500 relative" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-slate-600">{plan.description}</p>
                  </div>
                  <div>
                    <div
                      className={`text-4xl font-bold ${plan.popular ? "text-blue-600" : plan.name === "1 Year" ? "text-green-600" : "text-slate-900"}`}
                    >
                      {plan.price}
                    </div>
                    <div className="text-slate-500">{plan.period}</div>
                    {plan.savings && <div className="text-sm text-green-600 font-medium">{plan.savings}</div>}
                  </div>
                  <div className="space-y-3 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className={`w-full rounded-xl ${plan.buttonClass}`}>Get Started</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-600">All plans include a 30-day money-back guarantee</p>
        </div>
      </div>
    </section>
  )
}
