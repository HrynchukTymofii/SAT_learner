import React from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, ArrowLeft, Clock, DollarSign, AlertCircle, Check, ExternalLink } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TestDatesPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const testDatesSpring2026 = [
    { month: "March", date: "14", year: "2026", registration: "February 27 / March 3, 2026" },
    { month: "May", date: "2", year: "2026", registration: "April 17 / April 21, 2026" },
    { month: "June", date: "6", year: "2026", registration: "May 22 / May 26, 2026" },
  ];

  const testDatesFall2026 = [
    { month: "August", date: "15", year: "2026", registration: "TBA" },
    { month: "September", date: "12", year: "2026", registration: "TBA" },
    { month: "October", date: "3", year: "2026", registration: "TBA" },
    { month: "November", date: "7", year: "2026", registration: "TBA" },
    { month: "December", date: "5", year: "2026", registration: "TBA" },
  ];

  const testDatesSpring2027 = [
    { month: "March", date: "13", year: "2027", registration: "TBA" },
    { month: "May", date: "1", year: "2027", registration: "TBA" },
    { month: "June", date: "5", year: "2027", registration: "TBA" },
  ];

  const registrationSteps = [
    "Create a College Board account if you don't have one",
    "Select your test date and location",
    "Upload a photo that meets requirements",
    "Pay the registration fee ($60 without fee waiver)",
    "Receive your admission ticket via email",
  ];

  const importantTips = [
    {
      title: "Register Early",
      description: "Test centers fill up quickly. Register as early as possible to secure your preferred location.",
      icon: Clock,
      color: "#8A5CE6",
    },
    {
      title: "Fee Waivers Available",
      description: "Low-income students may qualify for fee waivers covering registration, score reports, and more.",
      icon: DollarSign,
      color: "#2E9A5E",
    },
    {
      title: "Late Registration",
      description: "Late registration is available for an additional fee, typically 1-2 weeks after the regular deadline.",
      icon: AlertCircle,
      color: "#E5A50A",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#17151C" : "#E5DFEE",
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isDark ? "#17151C" : "#EFEAF7",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#C9AAFB" : "#7A4BDB"} />
          <Text
            style={{
              color: isDark ? "#C9AAFB" : "#7A4BDB",
              fontWeight: "600",
              marginLeft: 6,
              fontSize: 14,
            }}
          >
            Back to Articles
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#8A5CE6",
              marginRight: 12,
            }}
          >
            <Calendar size={24} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: isDark ? "#F4F1F8" : "#0B0A0F",
                marginBottom: 4,
              }}
            >
              Test Dates & Registration
            </Text>
            <Text style={{ fontSize: 14, color: isDark ? "#9C95A8" : "#6B6577" }}>
              Plan your SAT test schedule
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Spring 2026 Test Dates */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              marginBottom: 16,
            }}
          >
            Spring 2026 SAT Test Dates
          </Text>

          {testDatesSpring2026.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: "#8A5CE6",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: isDark ? "#F4F1F8" : "#0B0A0F",
                    marginBottom: 4,
                  }}
                >
                  {item.month} {item.date}, {item.year}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9C95A8" : "#6B6577",
                  }}
                >
                  Registration Deadline: {item.registration}
                </Text>
              </View>
              <Calendar size={24} color="#8A5CE6" />
            </View>
          ))}
        </View>

        {/* Fall 2026 Test Dates */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              marginBottom: 16,
            }}
          >
            Fall 2026 SAT Test Dates
          </Text>

          {testDatesFall2026.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: "#8A5CE6",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: isDark ? "#F4F1F8" : "#0B0A0F",
                    marginBottom: 4,
                  }}
                >
                  {item.month} {item.date}, {item.year}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9C95A8" : "#6B6577",
                  }}
                >
                  Registration Deadline: {item.registration}
                </Text>
              </View>
              <Calendar size={24} color="#8A5CE6" />
            </View>
          ))}
        </View>

        {/* Spring 2027 Test Dates */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              marginBottom: 16,
            }}
          >
            Spring 2027 SAT Test Dates
          </Text>

          {testDatesSpring2027.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: "#2E9A5E",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: isDark ? "#F4F1F8" : "#0B0A0F",
                    marginBottom: 4,
                  }}
                >
                  {item.month} {item.date}, {item.year}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9C95A8" : "#6B6577",
                  }}
                >
                  Registration Deadline: {item.registration}
                </Text>
              </View>
              <Calendar size={24} color="#2E9A5E" />
            </View>
          ))}
        </View>

        {/* Registration Process */}
        <View
          style={{
            backgroundColor: isDark ? "#17151C" : "#ffffff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: "#8A5CE6",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              marginBottom: 12,
            }}
          >
            Registration Process
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#9C95A8" : "#6B6577",
              lineHeight: 22,
              marginBottom: 16,
            }}
          >
            Follow these steps to register for the SAT through the College Board website:
          </Text>

          {registrationSteps.map((step, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#8A5CE6",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "700" }}>
                  {index + 1}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9C95A8" : "#6B6577",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* Important Tips */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              marginBottom: 16,
            }}
          >
            Important Tips
          </Text>

          {importantTips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <View
                key={index}
                style={{
                  backgroundColor: isDark ? "#17151C" : "#ffffff",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: tip.color,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Icon size={20} color={tip.color} style={{ marginRight: 8 }} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: isDark ? "#F4F1F8" : "#0B0A0F",
                    }}
                  >
                    {tip.title}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9C95A8" : "#6B6577",
                    lineHeight: 20,
                  }}
                >
                  {tip.description}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Test Day Requirements */}
        <View
          style={{
            backgroundColor: isDark ? "#17151C" : "#ffffff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: "#2E9A5E",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              marginBottom: 12,
            }}
          >
            What to Bring on Test Day
          </Text>

          {[
            "Admission ticket (printed or on mobile device)",
            "Acceptable photo ID",
            "No. 2 pencils with erasers",
            "Approved calculator for Math section",
            "Watch to keep track of time (optional)",
          ].map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <Check size={16} color="#2E9A5E" style={{ marginRight: 8, marginTop: 2 }} />
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9C95A8" : "#6B6577",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* College Board Link */}
        <View
          style={{
            backgroundColor: isDark ? "#17151C" : "#f0f9ff",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? "#2B2733" : "#bae6fd",
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <ExternalLink size={20} color={isDark ? "#C9AAFB" : "#7A4BDB"} style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark ? "#C9AAFB" : "#7A4BDB",
              }}
            >
              Official Registration
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#9C95A8" : "#6B6577",
              lineHeight: 20,
            }}
          >
            For the most up-to-date information and to register, visit the official College Board SAT website at collegeboard.org/sat
          </Text>
        </View>

        {/* Back to Articles Button */}
        <TouchableOpacity
          onPress={() => router.push("/info" as any)}
          style={{
            backgroundColor: "#8A5CE6",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
            Back to All Articles
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
