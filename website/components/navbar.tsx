"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BarChart2, BookOpen, GraduationCap, Home, Menu, Moon, Sun, Calendar } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { LoginModal } from "./login-modal"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useAuth } from "@/lib/useAuth"

export function Navbar() {
  const searchParams = useSearchParams()
  const isEmbedded = searchParams.get("embed") === "true"
  const {user} = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isLoggedIn = !!user

  // Hide navbar if embedded
  if (isEmbedded) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background px-8 rounded-b-3xl">
      <div className="flex flex-row h-16 items-center justify-between">
        {/* Logo */}
        <div className="mr-4 flex items-center md:mr-6">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">SAT Tutor</span>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsOpen(false)}
                >
                <Home className="h-5 w-5" />
                Home
              </Link>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Practice Tests</h3>
                <Link
                  href="/tests"
                  className="ml-4 flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  All Test Modes
                </Link>
                <Link
                  href="/tests/exam"
                  className="ml-4 flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Full SAT Exam
                </Link>
                <Link
                  href="/tests"
                  className="ml-4 flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Practice by Topics
                </Link>
              </div>

              <Link
                href="/course"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsOpen(false)}
                >
                <BookOpen className="h-5 w-5" />
                Course
              </Link>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">SAT Info</h3>
                <Link
                  href="/info/what-is-sat"
                  className="ml-4 flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  What is SAT?
                </Link>
                <Link
                  href="/info/how-sat-is-scored"
                  className="ml-4 flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  How SAT is Scored
                </Link>
                <Link
                  href="/info/test-dates-registration"
                  className="ml-4 flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Test Dates & Registration
                </Link>
              </div>

              {/* Theme Toggle - Mobile */}
              <div className="flex items-center justify-between py-2">
                <span className="text-lg font-semibold">Theme</span>
                {mounted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="gap-2"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4" />
                        Light
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        Dark
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* {isLoggedIn && (
                <Link
                  href="/planner"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <Calendar className="h-5 w-5" />
                  Study Planner
                </Link>
              )} */}

              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="mt-4 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button variant="outline" onClick={() => signOut()}>Logout</Button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="mt-4 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                    <Link href="/" >
                    Home</Link></NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Online SAT</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {testItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href}>
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild><Link href="/course" >Course</Link></NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>SAT Info</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {satInfoItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href}>
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Auth Button & Theme Toggle */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Planner Link */}
          {/* {isLoggedIn && (
            <Link
              href="/planner"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span className="hidden lg:inline text-sm font-medium">Planner</span>
            </Link>
          )} */}

          {isLoggedIn ? (
            <>
            {user.isPro &&
             <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <BarChart2 className="w-4 h-4" />
              Dashboard
            </Link>}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <Avatar className="h-6 w-6 ">
                  <AvatarImage src={user?.image || ''} />
                  <AvatarFallback className="bg-green-500">{(user?.name?.charAt(0) || 'U')}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {user?.name?.split(' ')[0] || 'Користувач'}
                </span>
              </Link>
            </>
          ) : (
            <LoginModal>
              <Button variant="secondary" className="cursor-pointer">Login</Button>
            </LoginModal>
          )}
        </div>
      </div>
    </header>
  );
}

const testItems = [
  {
    title: "Practice Tests",
    href: "/tests",
    description: "All test modes: Full SAT, Practice by Topics, and more.",
  },
  {
    title: "Full SAT Exam",
    href: "/tests/exam",
    description: "70-minute timed exam with SAT scoring (200-800).",
  },
  {
    title: "Practice by Topics",
    href: "/tests",
    description: "Focus on specific math topics and chapters.",
  },
]

const satInfoItems = [
  {
    title: "What is SAT?",
    href: "/info/what-is-sat",
    description: "Learn about the SAT test structure and purpose.",
  },
  {
    title: "How SAT is Scored",
    href: "/info/how-sat-is-scored",
    description: "Understand the SAT scoring system and what your score means.",
  },
  {
    title: "Test Dates & Registration",
    href: "/info/test-dates-registration",
    description: "Find upcoming test dates and registration information.",
  },
]

interface ListItemProps extends React.ComponentPropsWithoutRef<"div"> {
  title: string
  children: React.ReactNode
  href: string
}

export function ListItem({ className, title, href, children }: ListItemProps) {
  return (
      <NavigationMenuLink asChild>
        <Link
            href={href}
            className={cn(
                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                className,
            )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </Link>
      </NavigationMenuLink>
  )
}

const navigationMenuTriggerStyle = () => {
  return cn(
    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
  )
}
