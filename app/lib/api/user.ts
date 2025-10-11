import api from "../axios";

export const getUserData = async (token: string) => {
  try {
    const res = await api.get("/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, user: res.data };
  } catch (error: any) {
    console.error("❌ getUserData error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch user data",
    };
  }
};
