import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, DollarSign, ArrowLeft, AlertTriangle, CheckCircle, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"

const TestDatesRegistrationPage = () => {
  // const testDates2024 = [
  //   { date: "March 9, 2024", registration: "February 23, 2024", late: "February 27, 2024", status: "past" },
  //   { date: "May 4, 2024", registration: "April 19, 2024", late: "April 23, 2024", status: "past" },
  //   { date: "June 1, 2024", registration: "May 17, 2024", late: "May 21, 2024", status: "past" },
  //   { date: "August 24, 2024", registration: "August 9, 2024", late: "August 13, 2024", status: "past" },
  //   { date: "October 5, 2024", registration: "September 6, 2024", late: "September 24, 2024", status: "past" },
  //   { date: "November 2, 2024", registration: "October 4, 2024", late: "October 22, 2024", status: "past" },
  //   { date: "December 7, 2024", registration: "November 8, 2024", late: "November 26, 2024", status: "past" },
  // ]

  const testDates2025 = [
    { date: "March 8, 2025", registration: "February 21, 2025", late: "February 25, 2025", status: "upcoming" },
    { date: "May 3, 2025", registration: "April 18, 2025", late: "April 22, 2025", status: "upcoming" },
    { date: "June 7, 2025", registration: "May 23, 2025", late: "May 27, 2025", status: "upcoming" },
  ]

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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Test Dates & Registration</h1>
                <p className="text-purple-100 text-base md:text-lg">
                  Everything you need to know about SAT test dates and registration process
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Important Alert */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Important:</strong> Register early! Test centers fill up quickly, especially for popular test dates.
            Late registration fees apply after the regular deadline.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="space-y-8">
          {/* 2025 Test Dates */}
          <Card className="shadow-lg border-0 bg-card py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-6 w-6 text-purple-600" />
                2025 SAT Test Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testDates2025.map((test, index) => (
                  <div
                    key={index}
                    className="p-4 border border-green-200 bg-green-50 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{test.date}</h3>
                        <Badge className="bg-green-600">Available</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Regular Registration: {test.registration}</div>
                        <div>Late Registration: {test.late}</div>
                      </div>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 w-full md:w-auto">Register Now</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Registration Process */}
          <Card className="shadow-lg border-0 bg-card py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">How to Register</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Online Registration (Recommended)</h3>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          1
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Create a College Board Account</p>
                          <p className="text-sm text-muted-foreground">Visit collegeboard.org and create your account</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          2
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Choose Test Date & Location</p>
                          <p className="text-sm text-muted-foreground">Select your preferred test center and date</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          3
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Complete Registration</p>
                          <p className="text-sm text-muted-foreground">Fill out personal information and pay fees</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          4
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Print Admission Ticket</p>
                          <p className="text-sm text-muted-foreground">Print your ticket 1-2 weeks before test date</p>
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Registration Requirements</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-800">Valid photo ID</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-800">Credit card or other payment method</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-800">High school information</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-800">College preferences (optional)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fees */}
          <Card className="shadow-lg border-0 bg-card py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Registration Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Standard Fees</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-foreground">SAT Registration</span>
                      <span className="font-bold text-foreground">$60</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-foreground">Late Registration Fee</span>
                      <span className="font-bold text-foreground">+$30</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-foreground">Change Fee</span>
                      <span className="font-bold text-foreground">$35</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Additional Services</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-foreground">Score Reports (per college)</span>
                      <span className="font-bold text-foreground">$14</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-foreground">Question-and-Answer Service</span>
                      <span className="font-bold text-foreground">$18</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-foreground">Student Answer Service</span>
                      <span className="font-bold text-foreground">$13.50</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Fee Waivers Available
                </h4>
                <p className="text-green-800 text-sm">
                  Students from low-income families may be eligible for fee waivers. Contact your school counselor to
                  learn more about eligibility and how to apply.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Test Day Information */}
          <Card className="shadow-lg border-0 bg-card py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-600" />
                Test Day Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">What to Bring</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-foreground">Admission ticket (printed)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-foreground">Acceptable photo ID</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-foreground">No. 2 pencils with erasers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-foreground">Approved calculator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-foreground">Watch (without alarm)</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Test Day Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900">7:45 AM</div>
                        <div className="text-sm text-blue-700">Doors open, check-in begins</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900">8:00 AM</div>
                        <div className="text-sm text-blue-700">Testing begins</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900">12:00 PM</div>
                        <div className="text-sm text-blue-700">Testing ends (approximately)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Test Center Tips
                </h4>
                <ul className="text-amber-800 text-sm space-y-1">
                  <li>• Arrive at the test center by 7:45 AM</li>
                  <li>• Visit your test center beforehand to know the location</li>
                  <li>• Bring a snack and water for breaks</li>
                  <li>• Leave prohibited items at home or in your car</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Score Reporting */}
          <Card className="shadow-lg border-0 bg-card py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">Score Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Free Score Reports</h3>
                    <p className="text-green-800 text-sm mb-3">
                      You can send your scores to up to 4 colleges for free when you register or by the Thursday after
                      your test date.
                    </p>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Choose colleges during registration</li>
                      <li>• Scores sent automatically when available</li>
                      <li>• No additional cost</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Additional Score Reports</h3>
                    <p className="text-blue-800 text-sm mb-3">
                      After your free reports, additional score reports cost $14 each and can be sent anytime.
                    </p>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Order through your College Board account</li>
                      <li>• Sent electronically to colleges</li>
                      <li>• Usually delivered within 1-2 weeks</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Score Release Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-800 text-sm">
                    <div>
                      <strong>Multiple Choice Scores:</strong> Available online 13 days after test date
                    </div>
                    <div>
                      <strong>Score Reports to Colleges:</strong> Sent within 1-2 weeks of score release
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
          <Link href="/info/how-sat-is-scored">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Previous: How SAT is Scored
            </Button>
          </Link>
          <Link href="/info">
            <Button className="flex items-center gap-2">
              Back to Articles
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TestDatesRegistrationPage
