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
      color: "#06B6D4",
    },
    {
      title: "Fee Waivers Available",
      description: "Low-income students may qualify for fee waivers covering registration, score reports, and more.",
      icon: DollarSign,
      color: "#10B981",
    },
    {
      title: "Late Registration",
      description: "Late registration is available for an additional fee, typically 1-2 weeks after the regular deadline.",
      icon: AlertCircle,
      color: "#F59E0B",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f9fafb" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "#111827" : "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
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
            backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#06B6D4" : "#0891B2"} />
          <Text
            style={{
              color: isDark ? "#06B6D4" : "#0891B2",
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
              backgroundColor: "#8B5CF6",
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
                color: isDark ? "#ffffff" : "#1f2937",
                marginBottom: 4,
              }}
            >
              Test Dates & Registration
            </Text>
            <Text style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280" }}>
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
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 16,
            }}
          >
            Spring 2026 SAT Test Dates
          </Text>

          {testDatesSpring2026.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: "#8B5CF6",
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
                    color: isDark ? "#ffffff" : "#1f2937",
                    marginBottom: 4,
                  }}
                >
                  {item.month} {item.date}, {item.year}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Registration Deadline: {item.registration}
                </Text>
              </View>
              <Calendar size={24} color="#8B5CF6" />
            </View>
          ))}
        </View>

        {/* Fall 2026 Test Dates */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 16,
            }}
          >
            Fall 2026 SAT Test Dates
          </Text>

          {testDatesFall2026.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: "#06B6D4",
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
                    color: isDark ? "#ffffff" : "#1f2937",
                    marginBottom: 4,
                  }}
                >
                  {item.month} {item.date}, {item.year}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Registration Deadline: {item.registration}
                </Text>
              </View>
              <Calendar size={24} color="#06B6D4" />
            </View>
          ))}
        </View>

        {/* Spring 2027 Test Dates */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 16,
            }}
          >
            Spring 2027 SAT Test Dates
          </Text>

          {testDatesSpring2027.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: "#10B981",
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
                    color: isDark ? "#ffffff" : "#1f2937",
                    marginBottom: 4,
                  }}
                >
                  {item.month} {item.date}, {item.year}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Registration Deadline: {item.registration}
                </Text>
              </View>
              <Calendar size={24} color="#10B981" />
            </View>
          ))}
        </View>

        {/* Registration Process */}
        <View
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: "#06B6D4",
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
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 12,
            }}
          >
            Registration Process
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#9ca3af" : "#6b7280",
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
                  backgroundColor: "#06B6D4",
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
                  color: isDark ? "#9ca3af" : "#6b7280",
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
              color: isDark ? "#ffffff" : "#1f2937",
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
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
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
                      color: isDark ? "#ffffff" : "#1f2937",
                    }}
                  >
                    {tip.title}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9ca3af" : "#6b7280",
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
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: "#10B981",
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
              color: isDark ? "#ffffff" : "#1f2937",
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
              <Check size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9ca3af" : "#6b7280",
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
            backgroundColor: isDark ? "#1e293b" : "#f0f9ff",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#bae6fd",
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <ExternalLink size={20} color={isDark ? "#06B6D4" : "#0891B2"} style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark ? "#06B6D4" : "#0891B2",
              }}
            >
              Official Registration
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#9ca3af" : "#6b7280",
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
            backgroundColor: "#06B6D4",
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
