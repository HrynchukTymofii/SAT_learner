import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react"

export function ContactSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-muted text-foreground mb-4">Contact Us</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get in Touch</h2>
          <p className="text-xl text-muted-foreground">Have questions? We're here to help you succeed</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <Card className="shadow-lg border-0 bg-card rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Mail className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Email Support</h3>
                    <p className="text-muted-foreground">support@satprep.com</p>
                    <p className="text-sm text-muted-foreground">Response within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-card rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Phone className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Phone Support</h3>
                    <p className="text-muted-foreground">1-800-SAT-PREP</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-card rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <MapPin className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Office</h3>
                    <p className="text-muted-foreground">123 Education St</p>
                    <p className="text-muted-foreground">Learning City, LC 12345</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg border-0 bg-card rounded-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-6">Send us a message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="First Name" />
                  <Input placeholder="Last Name" />
                </div>
                <Input type="email" placeholder="Email Address" />
                <Input placeholder="Subject" />
                <textarea
                  className="w-full p-3 border border-border bg-background text-foreground rounded-xl resize-none h-32"
                  placeholder="Your message..."
                ></textarea>
                <Button className="w-full bg-primary hover:opacity-90 rounded-xl">
                  Send Message
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
