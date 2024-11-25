interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
}

interface User {
  id: number;
  email: string;
  fullName: string;
}

// Mock user database
const users: (User & { password: string })[] = [];

// Add this interface and function
interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  address?: string;
  defaultPaymentMethod?: string;
}

// Add this to store user profiles
const userProfiles: Record<string, UpdateProfileData> = {};

export const login = async (credentials: LoginCredentials): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = users.find((u) => u.email === credentials.email);

  if (!user || user.password !== credentials.password) {
    throw new Error("Invalid email or password");
  }

  // Don't send password back
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    ...userProfiles[credentials.email], // Include any saved profile data
  };
};

export const signup = async (credentials: SignupCredentials): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check if user already exists
  if (users.some((u) => u.email === credentials.email)) {
    throw new Error("Email already registered");
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    email: credentials.email,
    password: credentials.password,
    fullName: credentials.fullName,
  };

  users.push(newUser);

  // Don't send password back
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const updateProfile = async (
  email: string,
  data: UpdateProfileData
): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = users.find((u) => u.email === email);
  if (!user) {
    throw new Error("User not found");
  }

  // Store profile data
  userProfiles[email] = {
    ...userProfiles[email],
    ...data,
  };

  // Return updated user data
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    ...userProfiles[email],
  };
};
